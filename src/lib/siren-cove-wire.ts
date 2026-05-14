'use client'
import { useState, useCallback, useEffect, useRef } from 'react'

// ============================================================
// CONSTANTS — all prefixed with SV_
// ============================================================

const SV_MAX_LEVEL = 50

const SV_XP_TABLE: number[] = (() => {
  const table: number[] = [0]
  for (let i = 1; i <= SV_MAX_LEVEL; i++) {
    table.push(Math.floor(80 * Math.pow(1.18, i) + i * 12))
  }
  return table
})()

const SV_RARITY_TIERS = [
  { name: 'Common', color: '#7ecfc0', glow: '#2dd4bf40', multiplier: 1.0 },
  { name: 'Uncommon', color: '#38bdf8', glow: '#38bdf840', multiplier: 1.3 },
  { name: 'Rare', color: '#a78bfa', glow: '#a78bfa40', multiplier: 1.7 },
  { name: 'Epic', color: '#f472b6', glow: '#f472b640', multiplier: 2.2 },
  { name: 'Legendary', color: '#fbbf24', glow: '#fbbf2440', multiplier: 3.0 },
] as const

const SV_BASE_XP_REWARD = 25
const SV_SONG_XP_BONUS = 15
const SV_TREASURE_XP_BONUS = 20
const SV_CREATURE_XP_BONUS = 30
const SV_CHEST_XP_BONUS = 50
const SV_DAILY_STREAK_BONUS = 10
const SV_MAX_DAILY_STREAK = 7
const SV_ACHIEVEMENT_XP_BONUS = 100
const SV_CREST_COST_MULTIPLIER = 1.5
const SV_INVINCIBILITY_DURATION = 8000
const SV_DOUBLE_XP_DURATION = 30000
const SV_AUTO_COLLECT_DURATION = 20000
const SV_SIREN_CHARM_DURATION = 15000
const SV_MAGNET_RANGE = 120
const SV_DEFAULT_VOLUME = 0.6
const SV_SAVE_KEY = 'siren-cove-save'
const SV_MAX_INVENTORY = 200
const SV_MAX_CREST = 99999
const SV_MAX_SHARDS = 99999
const SV_RESONANCE_PER_LEVEL = 3
const SV_TREASURE_SPIN_DURATION = 3000
const SV_CREST_PER_DAILY = 50
const SV_SHARDS_PER_MINIGAME = 10

// ============================================================
// SIREN SONGS — 28 songs with effects
// ============================================================

interface SvSong {
  id: string
  name: string
  melody: string
  duration: number
  rarity: 0 | 1 | 2 | 3 | 4
  effect: SvSongEffect
  description: string
  unlockLevel: number
  notes: number[]
}

type SvSongEffect =
  | 'xp_boost'
  | 'shield'
  | 'magnet'
  | 'freeze'
  | 'charm'
  | 'reveal'
  | 'heal'
  | 'haste'
  | 'double_treasure'
  | 'reveal_rare'
  | 'calm_waters'
  | 'call_creatures'
  | ' illuminate'
  | 'tide_shift'
  | 'sonar_pulse'
  | 'harmonic_barrier'
  | 'depth_charge'
  | 'current_surge'
  | 'pearl_rain'
  | 'abyssal_echo'
  | 'bioluminescence'
  | 'whale_song'
  | 'coral_bloom'
  | 'tidal_force'
  | 'leviathan_call'
  | 'neptune_blessing'
  | 'kraken_lullaby'
  | 'siren_bloom'

const SV_SONGS: SvSong[] = [
  { id: 'call_of_the_deep', name: 'Call of the Deep', melody: 'C E G C5 G E C', duration: 4000, rarity: 0, effect: 'magnet', description: 'Draws nearby treasures toward you with a magnetic pull', unlockLevel: 1, notes: [261, 329, 392, 523, 392, 329, 261] },
  { id: 'storm_lullaby', name: 'Storm Lullaby', melody: 'A D F A5 F D A2', duration: 5000, rarity: 1, effect: 'shield', description: 'Creates a protective water barrier that absorbs damage', unlockLevel: 3, notes: [220, 293, 349, 440, 349, 293, 110] },
  { id: 'tide_melody', name: 'Tide Melody', melody: 'D F A D5 A F D', duration: 3500, rarity: 0, effect: 'haste', description: 'Rides the tide for increased movement speed', unlockLevel: 1, notes: [293, 349, 440, 587, 440, 349, 293] },
  { id: 'pearl_harmony', name: 'Pearl Harmony', melody: 'E G B E5 B G E', duration: 6000, rarity: 2, effect: 'double_treasure', description: 'Harmonizes with pearl beds to double treasure output', unlockLevel: 8, notes: [329, 392, 493, 659, 493, 392, 329] },
  { id: 'abyssal_choir', name: 'Abyssal Choir', melody: 'C2 Eb G C3 G Eb C2', duration: 7000, rarity: 3, effect: 'xp_boost', description: 'Channel the voices of the deep for massive XP gains', unlockLevel: 15, notes: [130, 155, 196, 261, 196, 155, 130] },
  { id: 'coral_lullaby', name: 'Coral Lullaby', melody: 'F A C F5 C A F', duration: 4500, rarity: 1, effect: 'heal', description: 'Soothes wounds with the gentle hum of living coral', unlockLevel: 5, notes: [349, 440, 523, 698, 523, 440, 349] },
  { id: 'whisper_of_waves', name: 'Whisper of Waves', melody: 'G B D G5 D B G', duration: 3000, rarity: 0, effect: 'reveal', description: 'Waves reveal hidden treasures in nearby areas', unlockLevel: 2, notes: [392, 493, 587, 783, 587, 493, 392] },
  { id: 'leviathan_roar', name: 'Leviathan Roar', melody: 'C2 D2 F2 C2 D2 G2', duration: 8000, rarity: 4, effect: 'tide_shift', description: 'The ancient roar of the leviathan shifts the tides in your favor', unlockLevel: 30, notes: [130, 146, 174, 130, 146, 196] },
  { id: 'mermaid_tear', name: "Mermaid's Tear", melody: 'B D F# B4 F# D B3', duration: 5500, rarity: 2, effect: 'charm', description: 'The sorrowful beauty of a mermaid tear charms all sea creatures', unlockLevel: 10, notes: [246, 293, 369, 493, 369, 293, 246] },
  { id: 'deep_blue_requiem', name: 'Deep Blue Requiem', melody: 'A2 C E A3 E C A2', duration: 9000, rarity: 4, effect: 'leviathan_call', description: 'A haunting requiem that summons the leviathan itself', unlockLevel: 35, notes: [110, 261, 329, 220, 329, 261, 110] },
  { id: 'sunken_chantey', name: 'Sunken Chantey', melody: 'D2 F A D3 A F D2', duration: 4000, rarity: 0, effect: 'xp_boost', description: 'An old pirate chantey that boosts experience from sunken wrecks', unlockLevel: 2, notes: [146, 349, 440, 293, 440, 349, 146] },
  { id: 'crystal_cavern_ballad', name: 'Crystal Cavern Ballad', melody: 'E Ab B E4 B Ab E3', duration: 6500, rarity: 3, effect: 'reveal_rare', description: 'Echoes through crystal formations revealing rare treasures', unlockLevel: 20, notes: [329, 415, 493, 659, 493, 415, 329] },
  { id: 'jellyfish_waltz', name: 'Jellyfish Waltz', melody: 'C Eb G C4 G Eb C3', duration: 3500, rarity: 1, effect: 'freeze', description: 'A dreamy waltz that slows all threats to a crawl', unlockLevel: 6, notes: [261, 311, 392, 523, 392, 311, 261] },
  { id: 'storm_surge_symphony', name: 'Storm Surge Symphony', melody: 'F2 Ab C F3 C Ab F2', duration: 7500, rarity: 3, effect: 'sonar_pulse', description: 'A powerful symphony that sends shockwaves through the depths', unlockLevel: 22, notes: [174, 207, 261, 349, 261, 207, 174] },
  { id: 'pearl_divers_hymn', name: "Pearl Diver's Hymn", melody: 'G A B D5 B A G4', duration: 5000, rarity: 2, effect: 'pearl_rain', description: 'Calls forth a shower of luminous pearls from above', unlockLevel: 12, notes: [392, 440, 493, 587, 493, 440, 392] },
  { id: 'neptune_decree', name: 'Neptune Decree', melody: 'D2 D G D3 G D D2', duration: 8500, rarity: 4, effect: 'neptune_blessing', description: 'The command of the sea god grants divine protection and power', unlockLevel: 40, notes: [146, 146, 196, 293, 196, 146, 146] },
  { id: 'sea_foam_serenade', name: 'Sea Foam Serenade', melody: 'E F# A E4 A F# E3', duration: 4000, rarity: 1, effect: 'calm_waters', description: 'A gentle serenade that calms turbulent waters', unlockLevel: 4, notes: [329, 369, 440, 523, 440, 369, 329] },
  { id: 'kraken_awakening', name: 'Kraken Awakening', melody: 'C2 Bb1 C2 Db2 C2 Bb1', duration: 10000, rarity: 4, effect: 'kraken_lullaby', description: 'Awakens then soothes the kraken, making it your ally temporarily', unlockLevel: 45, notes: [130, 116, 130, 138, 130, 116] },
  { id: 'dolphin_dance', name: 'Dolphin Dance', melody: 'G A B C5 B A G4', duration: 3000, rarity: 0, effect: 'haste', description: 'Playful dolphins guide you with incredible speed', unlockLevel: 1, notes: [392, 440, 493, 523, 493, 440, 392] },
  { id: 'volcanic_vent_bass', name: 'Volcanic Vent Bass', melody: 'C2 E2 F2 G2 F2 E2 C2', duration: 6000, rarity: 2, effect: 'depth_charge', description: 'The deep bass of volcanic vents unleashes destructive power', unlockLevel: 14, notes: [130, 164, 174, 196, 174, 164, 130] },
  { id: 'bioluminescent_dream', name: 'Bioluminescent Dream', melody: 'C D E G A G E D', duration: 5000, rarity: 2, effect: 'bioluminescence', description: 'Lights up the dark depths with living color', unlockLevel: 11, notes: [261, 293, 329, 392, 440, 392, 329, 293] },
  { id: 'ocean_current_rhapsody', name: 'Ocean Current Rhapsody', melody: 'F G A C5 A G F4', duration: 5500, rarity: 2, effect: 'current_surge', description: 'Ride the ocean currents with masterful precision', unlockLevel: 13, notes: [349, 392, 440, 523, 440, 392, 349] },
  { id: 'siren_bloom_fantasy', name: 'Siren Bloom Fantasy', melody: 'A B C# E5 C# B A3', duration: 4500, rarity: 1, effect: 'siren_bloom', description: 'A siren song that causes coral to bloom and reveal secrets', unlockLevel: 7, notes: [440, 493, 554, 659, 554, 493, 440] },
  { id: 'ancient_mariner_ballad', name: 'Ancient Mariner Ballad', melody: 'D F G Bb4 G F D3', duration: 7000, rarity: 3, effect: 'harmonic_barrier', description: 'The oldest known song creates an impenetrable harmonic barrier', unlockLevel: 18, notes: [293, 349, 392, 466, 392, 349, 293] },
  { id: 'trident_triumph', name: 'Trident Triumph', melody: 'E E F# G# A G# F# E', duration: 6000, rarity: 3, effect: 'call_creatures', description: 'A triumphant anthem that calls friendly creatures to your aid', unlockLevel: 25, notes: [329, 329, 369, 415, 440, 415, 369, 329] },
  { id: 'rapture_of_the_reef', name: 'Rapture of the Reef', melody: 'C D E F G A B C5', duration: 4000, rarity: 1, effect: 'reveal', description: 'The full beauty of the reef unfolds before you', unlockLevel: 5, notes: [261, 293, 329, 349, 392, 440, 493, 523] },
  { id: 'serpent_scale_melody', name: 'Serpent Scale Melody', melody: 'A2 C2 D2 F2 A2 D2 F2', duration: 8000, rarity: 4, effect: 'tide_shift', description: 'The serpent slithers through the water changing everything', unlockLevel: 38, notes: [110, 130, 146, 174, 220, 293, 349] },
  { id: 'mystic_conch_echo', name: 'Mystic Conch Echo', melody: 'G F E D C D E G', duration: 5000, rarity: 2, effect: 'sonar_pulse', description: 'Listen to the conch and learn the secrets of the deep', unlockLevel: 9, notes: [392, 349, 329, 293, 261, 293, 329, 392] },
]

// ============================================================
// TREASURES — 34 underwater treasures
// ============================================================

interface SvTreasure {
  id: string
  name: string
  rarity: 0 | 1 | 2 | 3 | 4
  value: number
  description: string
  emoji: string
  lore: string
  foundInCaverns: string[]
  weight: number
}

const SV_TREASURES: SvTreasure[] = [
  { id: 'pearl_crown', name: 'Pearl Crown', rarity: 4, value: 5000, description: 'A crown woven from the rarest abyssal pearls, fit for ocean royalty', emoji: '👑', lore: 'Crafted by the first Siren Queen from pearls that only glow in total darkness', foundInCaverns: ['pearl_beds', 'royal_chamber'], weight: 1 },
  { id: 'coral_staff', name: 'Coral Staff', rarity: 3, value: 3000, description: 'A living staff of enchanted coral that pulses with ocean magic', emoji: '🪄', lore: 'The coral grows new branches each full moon, whispering prophecies', foundInCaverns: ['shallow_reef', 'coral_palace'], weight: 2 },
  { id: 'trident_shard', name: 'Trident Shard', rarity: 4, value: 6000, description: 'A fragment of Poseidon\'s legendary trident', emoji: '🔱', lore: 'Each shard contains a fraction of the sea god\'s fury', foundInCaverns: ['volcanic_vents', 'leviathan_depths'], weight: 1 },
  { id: 'siren_pendant', name: 'Siren Pendant', rarity: 3, value: 2800, description: 'A pendant that allows the wearer to breathe underwater', emoji: '📿', lore: 'Given by a siren who fell in love with a mortal sailor', foundInCaverns: ['siren_sanctum', 'sunken_ship'], weight: 3 },
  { id: 'sea_dragons_scale', name: 'Sea Dragon\'s Scale', rarity: 3, value: 3500, description: 'An iridescent scale from an ancient sea dragon', emoji: '🐉', lore: 'Sea dragons shed one scale every century, each holding immense power', foundInCaverns: ['leviathan_depths', 'volcanic_vents'], weight: 2 },
  { id: 'enchanted_sponge', name: 'Enchanted Sponge', rarity: 0, value: 100, description: 'A sponge that cleanses cursed items', emoji: '🧽', lore: 'Not the most glamorous treasure, but every adventurer needs one', foundInCaverns: ['shallow_reef', 'kelp_forest'], weight: 10 },
  { id: 'pearl_earrings', name: 'Pearl Earrings', rarity: 1, value: 250, description: 'Elegant earrings made from moonlit pearls', emoji: '🦪', lore: 'When worn under moonlight, they create a faint glow underwater', foundInCaverns: ['pearl_beds', 'shallow_reef'], weight: 8 },
  { id: 'coral_bowl', name: 'Coral Bowl', rarity: 0, value: 80, description: 'A simple bowl carved from pink coral', emoji: '🥣', lore: 'The first item many new divers find, a humble beginning', foundInCaverns: ['shallow_reef'], weight: 12 },
  { id: 'golden_anchor', name: 'Golden Anchor', rarity: 2, value: 800, description: 'A solid gold anchor from a legendary sunken galleon', emoji: '⚓', lore: 'The last anchor of the Crimson Tide, the fastest ship in the ancient fleet', foundInCaverns: ['sunken_ship', 'ship graveyard'], weight: 4 },
  { id: 'captains_compass', name: "Captain's Compass", rarity: 2, value: 900, description: 'A compass that always points to the nearest treasure', emoji: '🧭', lore: 'Its needle is carved from a narwhal horn and always points to wealth', foundInCaverns: ['sunken_ship', 'treasure_vault'], weight: 5 },
  { id: 'neptune_medallion', name: 'Neptune Medallion', rarity: 4, value: 7000, description: 'The personal medallion of the god of the sea', emoji: '🪙', lore: 'Grants dominion over all sea creatures when worn', foundInCaverns: ['royal_chamber', 'leviathan_depths'], weight: 1 },
  { id: 'seashell_horn', name: 'Seashell Horn', rarity: 1, value: 300, description: 'A horn made from a giant conch shell', emoji: '🐚', lore: 'When blown, its sound carries for miles underwater', foundInCaverns: ['kelp_forest', 'shallow_reef'], weight: 7 },
  { id: 'kraken_ink_bottle', name: 'Kraken Ink Bottle', rarity: 2, value: 750, description: 'A bottle filled with genuine kraken ink', emoji: '🫙', lore: 'Writings made with this ink cannot be erased by any force', foundInCaverns: ['leviathan_depths', 'volcanic_vents'], weight: 4 },
  { id: 'mermaid_mirror', name: 'Mermaid Mirror', rarity: 3, value: 3200, description: 'A mirror that shows the true nature of anything reflected', emoji: '🪞', lore: 'Created by mermaid artificers using polished abalone shells', foundInCaverns: ['siren_sanctum', 'coral_palace'], weight: 2 },
  { id: 'abyssal_pearl', name: 'Abyssal Pearl', rarity: 3, value: 2500, description: 'A pearl that formed in the deepest trench over millennia', emoji: '⚫', lore: 'It absorbs light and stores it, glowing when danger is near', foundInCaverns: ['leviathan_depths'], weight: 3 },
  { id: 'tide_charm', name: 'Tide Charm', rarity: 1, value: 200, description: 'A charm that predicts the changing of tides', emoji: '🌊', lore: 'Fishermen once paid fortunes for just a glimpse of this charm', foundInCaverns: ['shallow_reef', 'kelp_forest'], weight: 9 },
  { id: 'cursed_doubloon', name: 'Cursed Doubloon', rarity: 2, value: 600, description: 'A gold coin that brings both fortune and misfortune', emoji: '🪙', lore: 'Many pirates found these only to lose everything else they had', foundInCaverns: ['sunken_ship', 'treasure_vault'], weight: 6 },
  { id: 'starfish_wand', name: 'Starfish Wand', rarity: 1, value: 350, description: 'A wand topped with a perfect five-pointed starfish', emoji: '⭐', lore: 'Can create small amounts of bioluminescent light on command', foundInCaverns: ['coral_palace', 'shallow_reef'], weight: 7 },
  { id: 'whalebone_sword', name: 'Whalebone Sword', rarity: 2, value: 1100, description: 'A sword carved from the rib of an ancient whale', emoji: '⚔️', lore: 'Lighter than steel and sharper than obsidian', foundInCaverns: ['ship graveyard', 'sunken_ship'], weight: 4 },
  { id: 'moonstone_ring', name: 'Moonstone Ring', rarity: 2, value: 850, description: 'A ring set with a luminous moonstone', emoji: '💍', lore: 'Glows brightest during the full moon and grants enhanced vision underwater', foundInCaverns: ['pearl_beds', 'coral_palace'], weight: 5 },
  { id: 'treasure_chest_key', name: 'Treasure Chest Key', rarity: 1, value: 400, description: 'An ornate key that opens one of the underwater vaults', emoji: '🔑', lore: 'Only three copies of this key were ever made', foundInCaverns: ['sunken_ship', 'treasure_vault'], weight: 6 },
  { id: 'pufferfish_lantern', name: 'Pufferfish Lantern', rarity: 1, value: 180, description: 'A lantern powered by a friendly bioluminescent pufferfish', emoji: '🐟', lore: 'The pufferfish inside has lived for over two hundred years', foundInCaverns: ['kelp_forest', 'shallow_reef'], weight: 8 },
  { id: 'frozen_bubble', name: 'Frozen Bubble', rarity: 2, value: 650, description: 'A magical bubble that never pops and preserves anything inside', emoji: '🫧', lore: 'Time stands still within these enchanted spheres', foundInCaverns: ['coral_palace', 'siren_sanctum'], weight: 5 },
  { id: 'siren_feather', name: 'Siren Feather', rarity: 3, value: 2700, description: 'A single iridescent feather from a siren\'s wings', emoji: '🪶', lore: 'Sirens shed feathers when they sing their most beautiful songs', foundInCaverns: ['siren_sanctum', 'royal_chamber'], weight: 3 },
  { id: 'drowned_crown', name: 'Drowned Crown', rarity: 3, value: 3800, description: 'A crown from a forgotten underwater kingdom', emoji: '👑', lore: 'The kingdom of Atlantea fell in a single night, leaving only this crown', foundInCaverns: ['royal_chamber', 'sunken_ship'], weight: 2 },
  { id: 'coral_reef_map', name: 'Coral Reef Map', rarity: 1, value: 280, description: 'A map etched into living coral showing hidden passages', emoji: '🗺️', lore: 'The coral continues to grow, adding new paths over time', foundInCaverns: ['coral_palace', 'shallow_reef'], weight: 7 },
  { id: 'jellyfish_jar', name: 'Jellyfish Jar', rarity: 0, value: 120, description: 'A jar containing a tiny ethereal jellyfish', emoji: '🪼', lore: 'The jellyfish inside changes color based on your mood', foundInCaverns: ['shallow_reef', 'kelp_forest'], weight: 10 },
  { id: 'porpoise_flute', name: 'Porpoise Flute', rarity: 1, value: 320, description: 'A flute that mimics porpoise calls perfectly', emoji: '🎵', lore: 'Playing it summons a pod of friendly porpoises', foundInCaverns: ['kelp_forest'], weight: 7 },
  { id: 'deep_sea_crystal', name: 'Deep Sea Crystal', rarity: 2, value: 950, description: 'A crystal formed under immense deep-sea pressure', emoji: '💎', lore: 'Contains compressed light from bioluminescent creatures over centuries', foundInCaverns: ['leviathan_depths', 'volcanic_vents'], weight: 4 },
  { id: 'gold_infused_sand', name: 'Gold-Infused Sand', rarity: 1, value: 160, description: 'Sand that shimmers with gold particles', emoji: '✨', lore: 'Found only where underground rivers meet volcanic vents', foundInCaverns: ['volcanic_vents', 'shallow_reef'], weight: 9 },
  { id: 'siren_comb', name: 'Siren Comb', rarity: 2, value: 700, description: 'An ornate comb that controls water currents', emoji: '🪮', lore: 'Each tooth of the comb is carved from a different sea creature\'s bone', foundInCaverns: ['siren_sanctum', 'coral_palace'], weight: 5 },
  { id: 'megalodon_tooth', name: 'Megalodon Tooth', rarity: 2, value: 1200, description: 'An enormous fossilized tooth from a prehistoric shark', emoji: '🦷', lore: 'The megalodon was the apex predator of the ancient seas', foundInCaverns: ['ship graveyard', 'leviathan_depths'], weight: 4 },
  { id: 'enchanted_pearl', name: 'Enchanted Pearl', rarity: 2, value: 880, description: 'A pearl that grants wishes when held under starlight', emoji: '🔮', lore: 'Only one wish per pearl, so choose wisely', foundInCaverns: ['pearl_beds', 'royal_chamber'], weight: 5 },
  { id: 'atlantean_orb', name: 'Atlantean Orb', rarity: 4, value: 8000, description: 'A glowing orb of pure Atlantean energy', emoji: '🔮', lore: 'The last remaining power source of the lost civilization', foundInCaverns: ['royal_chamber', 'leviathan_depths'], weight: 1 },
  { id: 'sea_serpents_fang', name: 'Sea Serpent\'s Fang', rarity: 3, value: 2900, description: 'A venomous fang from a massive sea serpent', emoji: '🐍', lore: 'The venom, when diluted, becomes the most potent healing potion', foundInCaverns: ['leviathan_depths', 'volcanic_vents'], weight: 3 },
  { id: 'octopus_inkwell', name: 'Octopus Inkwell', rarity: 1, value: 220, description: 'An inkwell that never runs dry, filled with octopus ink', emoji: '🦑', lore: 'The octopus that donated the ink was a scholar of the deep', foundInCaverns: ['kelp_forest', 'sunken_ship'], weight: 8 },
  { id: 'sunken_music_box', name: 'Sunken Music Box', rarity: 2, value: 780, description: 'A music box that plays siren songs', emoji: '🎵', lore: 'Its melody changes based on the listener\'s deepest desires', foundInCaverns: ['sunken_ship', 'siren_sanctum'], weight: 5 },
  { id: 'pearl_rose', name: 'Pearl Rose', rarity: 3, value: 3100, description: 'A rose that bloomed from a pearl under a siren\'s voice', emoji: '🌹', lore: 'It never wilts and emits a calming fragrance underwater', foundInCaverns: ['siren_sanctum', 'pearl_beds'], weight: 2 },
]

// ============================================================
// CAVERNS — 8 underwater areas
// ============================================================

interface SvCavern {
  id: string
  name: string
  depth: number
  description: string
  requiredLevel: number
  creatures: string[]
  treasures: string[]
  ambientColor: string
  bgGradient: [string, string]
  dangerLevel: number
  discoveryBonus: number
}

const SV_CAVERNS: SvCavern[] = [
  {
    id: 'shallow_reef',
    name: 'Shallow Reef',
    depth: 10,
    description: 'A sunlit reef teeming with colorful fish and gentle currents. The perfect starting point for new divers.',
    requiredLevel: 1,
    creatures: ['tropical_fish', 'seahorse', 'clownfish', 'starfish', 'crab', 'dolphin'],
    treasures: ['coral_bowl', 'enchanted_sponge', 'jellyfish_jar', 'pearl_earrings', 'tide_charm', 'gold_infused_sand', 'pufferfish_lantern', 'sea_foam_serenade'],
    ambientColor: '#5eead4',
    bgGradient: ['#0d9488', '#134e4a'],
    dangerLevel: 1,
    discoveryBonus: 10,
  },
  {
    id: 'kelp_forest',
    name: 'Kelp Forest',
    depth: 25,
    description: 'Towering kelp stalks create an underwater forest maze where light filters through in golden shafts.',
    requiredLevel: 3,
    creatures: ['seahorse', 'sea_otter', 'octopus', 'moray_eel', 'cuttlefish', 'turtle'],
    treasures: ['seashell_horn', 'porpoise_flute', 'octopus_inkwell', 'pufferfish_lantern', 'coral_reef_map', 'tide_charm', 'enchanted_sponge'],
    ambientColor: '#34d399',
    bgGradient: ['#065f46', '#022c22'],
    dangerLevel: 2,
    discoveryBonus: 20,
  },
  {
    id: 'sunken_ship',
    name: 'Sunken Galleon',
    depth: 50,
    description: 'A massive galleon rests on the ocean floor, its rotting hull full of pirate treasure and ghostly echoes.',
    requiredLevel: 6,
    creatures: ['barracuda', 'moray_eel', 'giant_crab', 'ghost_jellyfish', 'remora', 'angelfish'],
    treasures: ['golden_anchor', 'captains_compass', 'treasure_chest_key', 'cursed_doubloon', 'whalebone_sword', 'sunken_music_box', 'octopus_inkwell'],
    ambientColor: '#818cf8',
    bgGradient: ['#312e81', '#1e1b4b'],
    dangerLevel: 3,
    discoveryBonus: 35,
  },
  {
    id: 'coral_palace',
    name: 'Coral Palace',
    depth: 80,
    description: 'An architectural marvel grown entirely from living coral, inhabited by merfolk artisans.',
    requiredLevel: 10,
    creatures: ['mermaid', 'manta_ray', 'sea_horse_giant', 'clownfish', 'butterfly_fish', 'anthias'],
    treasures: ['coral_staff', 'starfish_wand', 'mermaid_mirror', 'frozen_bubble', 'siren_comb', 'moonstone_ring', 'pearl_earrings', 'coral_reef_map'],
    ambientColor: '#fb7185',
    bgGradient: ['#9f1239', '#4c0519'],
    dangerLevel: 3,
    discoveryBonus: 50,
  },
  {
    id: 'pearl_beds',
    name: 'Pearl Beds',
    depth: 100,
    description: 'Vast beds of giant clams stretch across the seafloor, each containing pearls of varying rarity.',
    requiredLevel: 14,
    creatures: ['giant_clam', 'pearl_oyster', 'sea_urchin', 'nudibranch', 'shrimp', 'cleaner_wrasse'],
    treasures: ['pearl_earrings', 'moonstone_ring', 'enchanted_pearl', 'pearl_rose', 'tide_charm', 'coral_bowl'],
    ambientColor: '#fcd34d',
    bgGradient: ['#78350f', '#451a03'],
    dangerLevel: 2,
    discoveryBonus: 60,
  },
  {
    id: 'siren_sanctum',
    name: 'Siren Sanctum',
    depth: 150,
    description: 'The sacred home of the sirens, where their enchanting songs echo through carved stone arches.',
    requiredLevel: 20,
    creatures: ['siren', 'mermaid', 'water_nymph', 'sea_fairy', 'selkie', 'harpy_fish'],
    treasures: ['siren_pendant', 'siren_feather', 'mermaid_mirror', 'frozen_bubble', 'siren_comb', 'sunken_music_box', 'pearl_rose', 'siren_bloom'],
    ambientColor: '#e879f9',
    bgGradient: ['#701a75', '#4a044e'],
    dangerLevel: 4,
    discoveryBonus: 80,
  },
  {
    id: 'volcanic_vents',
    name: 'Volcanic Vents',
    depth: 200,
    description: 'Superheated vents spew minerals into the water, creating an otherworldly landscape of chimney formations.',
    requiredLevel: 28,
    creatures: ['fire_eel', 'lava_crab', 'volcanic_shrimp', 'tube_worm', 'blind_cave_fish', 'dragon_fish'],
    treasures: ['trident_shard', 'sea_dragons_scale', 'kraken_ink_bottle', 'volcanic_vent_bass', 'deep_sea_crystal', 'sea_serpents_fang', 'megalodon_tooth'],
    ambientColor: '#f97316',
    bgGradient: ['#7c2d12', '#431407'],
    dangerLevel: 5,
    discoveryBonus: 100,
  },
  {
    id: 'leviathan_depths',
    name: 'Leviathan Depths',
    depth: 500,
    description: 'The deepest, most dangerous zone. Only the bravest divers survive the crushing pressure and ancient guardians.',
    requiredLevel: 35,
    creatures: ['sea_dragon', 'leviathan', 'kraken', 'abyssal_horror', 'giant_squid', 'ancient_one'],
    treasures: ['pearl_crown', 'neptune_medallion', 'atlantean_orb', 'trident_shard', 'sea_dragons_scale', 'abyssal_pearl', 'drowned_crown', 'sea_serpents_fang'],
    ambientColor: '#22d3ee',
    bgGradient: ['#164e63', '#083344'],
    dangerLevel: 5,
    discoveryBonus: 150,
  },
]

// ============================================================
// CREATURES — 18 sea creatures
// ============================================================

interface SvCreature {
  id: string
  name: string
  rarity: 0 | 1 | 2 | 3 | 4
  hp: number
  description: string
  emoji: string
  behavior: 'passive' | 'neutral' | 'aggressive' | 'boss'
  songEffect: SvSongEffect | null
  xpReward: number
  foundIn: string[]
  speed: number
  size: 'tiny' | 'small' | 'medium' | 'large' | 'massive'
}

const SV_CREATURES: SvCreature[] = [
  { id: 'tropical_fish', name: 'Tropical Fish', rarity: 0, hp: 5, description: 'Colorful little fish that swim in schools, harmless and beautiful', emoji: '🐠', behavior: 'passive', songEffect: 'haste', xpReward: 5, foundIn: ['shallow_reef'], speed: 3, size: 'tiny' },
  { id: 'seahorse', name: 'Seahorse', rarity: 0, hp: 3, description: 'A delicate seahorse clinging to kelp, a symbol of patience', emoji: '🌊', behavior: 'passive', songEffect: 'calm_waters', xpReward: 8, foundIn: ['shallow_reef', 'kelp_forest'], speed: 1, size: 'tiny' },
  { id: 'clownfish', name: 'Clownfish', rarity: 0, hp: 5, description: 'A brave little fish that dances among anemone tentacles', emoji: '🤡', behavior: 'passive', songEffect: null, xpReward: 5, foundIn: ['shallow_reef', 'coral_palace'], speed: 3, size: 'tiny' },
  { id: 'starfish', name: 'Starfish', rarity: 0, hp: 10, description: 'A slow-moving starfish that regenerates lost arms', emoji: '⭐', behavior: 'passive', songEffect: 'heal', xpReward: 10, foundIn: ['shallow_reef'], speed: 0.5, size: 'small' },
  { id: 'crab', name: 'Crab', rarity: 0, hp: 8, description: 'A territorial crab with surprisingly powerful claws', emoji: '🦀', behavior: 'neutral', songEffect: null, xpReward: 12, foundIn: ['shallow_reef', 'kelp_forest'], speed: 2, size: 'small' },
  { id: 'dolphin', name: 'Dolphin', rarity: 1, hp: 30, description: 'A playful and highly intelligent dolphin, friend to all divers', emoji: '🐬', behavior: 'passive', songEffect: 'haste', xpReward: 25, foundIn: ['shallow_reef'], speed: 5, size: 'medium' },
  { id: 'sea_otter', name: 'Sea Otter', rarity: 1, hp: 25, description: 'An adorable sea otter floating on its back with a shell', emoji: '🦦', behavior: 'passive', songEffect: 'calm_waters', xpReward: 20, foundIn: ['kelp_forest'], speed: 3, size: 'small' },
  { id: 'octopus', name: 'Octopus', rarity: 1, hp: 35, description: 'A cunning octopus with incredible problem-solving abilities', emoji: '🐙', behavior: 'neutral', songEffect: 'reveal', xpReward: 30, foundIn: ['kelp_forest'], speed: 2, size: 'medium' },
  { id: 'moray_eel', name: 'Moray Eel', rarity: 1, hp: 40, description: 'A menacing eel lurking in rocky crevices with jaws of needle teeth', emoji: '🐍', behavior: 'aggressive', songEffect: null, xpReward: 35, foundIn: ['kelp_forest', 'sunken_ship'], speed: 4, size: 'medium' },
  { id: 'barracuda', name: 'Barracuda', rarity: 1, hp: 45, description: 'A fast and fearsome predatory fish with silver scales', emoji: '🐟', behavior: 'aggressive', songEffect: null, xpReward: 35, foundIn: ['sunken_ship'], speed: 6, size: 'medium' },
  { id: 'giant_crab', name: 'Giant Crab', rarity: 2, hp: 80, description: 'A massive crab the size of a small boat with impenetrable armor', emoji: '🦀', behavior: 'aggressive', songEffect: null, xpReward: 55, foundIn: ['sunken_ship'], speed: 2, size: 'large' },
  { id: 'mermaid', name: 'Mermaid', rarity: 2, hp: 60, description: 'A beautiful mermaid who may help or hinder depending on your actions', emoji: '🧜‍♀️', behavior: 'neutral', songEffect: 'charm', xpReward: 50, foundIn: ['coral_palace', 'siren_sanctum'], speed: 4, size: 'medium' },
  { id: 'siren', name: 'Siren', rarity: 3, hp: 100, description: 'An enchanting siren whose song can lure even the strongest-willed diver', emoji: '🎤', behavior: 'neutral', songEffect: 'siren_bloom', xpReward: 80, foundIn: ['siren_sanctum'], speed: 3, size: 'medium' },
  { id: 'manta_ray', name: 'Manta Ray', rarity: 2, hp: 70, description: 'A graceful manta ray gliding through the water like a flying carpet', emoji: '🦈', behavior: 'passive', songEffect: 'magnet', xpReward: 45, foundIn: ['coral_palace'], speed: 5, size: 'large' },
  { id: 'ghost_jellyfish', name: 'Ghost Jellyfish', rarity: 2, hp: 50, description: 'A translucent jellyfish that phases in and out of visibility', emoji: '🪼', behavior: 'aggressive', songEffect: 'freeze', xpReward: 60, foundIn: ['sunken_ship', 'leviathan_depths'], speed: 1, size: 'medium' },
  { id: 'fire_eel', name: 'Fire Eel', rarity: 3, hp: 120, description: 'An eel infused with volcanic heat that leaves trails of boiling water', emoji: '🔥', behavior: 'aggressive', songEffect: null, xpReward: 90, foundIn: ['volcanic_vents'], speed: 5, size: 'large' },
  { id: 'sea_dragon', name: 'Sea Dragon', rarity: 3, hp: 200, description: 'A magnificent winged serpent that rules the deep waters', emoji: '🐉', behavior: 'aggressive', songEffect: 'tide_shift', xpReward: 120, foundIn: ['leviathan_depths'], speed: 4, size: 'massive' },
  { id: 'kraken', name: 'Kraken', rarity: 4, hp: 500, description: 'The legendary kraken, a terror of the deep with a thousand tentacles', emoji: '🦑', behavior: 'boss', songEffect: 'kraken_lullaby', xpReward: 300, foundIn: ['leviathan_depths'], speed: 3, size: 'massive' },
  { id: 'ancient_one', name: 'The Ancient One', rarity: 4, hp: 1000, description: 'An unfathomably old being from before the oceans were formed', emoji: '👁️', behavior: 'boss', songEffect: 'leviathan_call', xpReward: 500, foundIn: ['leviathan_depths'], speed: 1, size: 'massive' },
]

// ============================================================
// TITLES — 8 progression titles
// ============================================================

interface SvTitle {
  id: string
  name: string
  description: string
  requiredLevel: number
  requiredAchievements: number
  crestCost: number
  color: string
}

const SV_TITLES: SvTitle[] = [
  { id: 'wave_listener', name: 'Wave Listener', description: 'One who first hears the call of the sea', requiredLevel: 1, requiredAchievements: 0, crestCost: 0, color: '#5eead4' },
  { id: 'tide_rider', name: 'Tide Rider', description: 'A diver who has learned to ride the ocean currents', requiredLevel: 5, requiredAchievements: 2, crestCost: 100, color: '#2dd4bf' },
  { id: 'pearl_diver', name: 'Pearl Diver', description: 'Skilled in the art of finding treasures in the deep', requiredLevel: 12, requiredAchievements: 4, crestCost: 500, color: '#38bdf8' },
  { id: 'coral_guardian', name: 'Coral Guardian', description: 'Protector of the underwater realms', requiredLevel: 20, requiredAchievements: 6, crestCost: 1500, color: '#a78bfa' },
  { id: 'deep_explorer', name: 'Deep Explorer', description: 'Brave enough to venture into the darkest depths', requiredLevel: 28, requiredAchievements: 8, crestCost: 3000, color: '#f472b6' },
  { id: 'siren_apprentice', name: 'Siren Apprentice', description: 'Has begun to learn the songs of the sirens', requiredLevel: 35, requiredAchievements: 10, crestCost: 6000, color: '#e879f9' },
  { id: 'ocean_sovereign', name: 'Ocean Sovereign', description: 'Master of all underwater domains', requiredLevel: 42, requiredAchievements: 13, crestCost: 12000, color: '#fbbf24' },
  { id: 'leviathan_lord', name: 'Leviathan Lord', description: 'The supreme ruler of the deepest trenches', requiredLevel: 50, requiredAchievements: 16, crestCost: 25000, color: '#f59e0b' },
]

// ============================================================
// ACHIEVEMENTS — 18 achievements
// ============================================================

interface SvAchievement {
  id: string
  name: string
  description: string
  icon: string
  condition: SvAchievementCondition
  xpReward: number
  crestReward: number
  rarity: 0 | 1 | 2 | 3 | 4
  hidden: boolean
}

type SvAchievementCondition = {
  type: 'total_treasures' | 'total_songs' | 'creatures_encountered' | 'caverns_discovered' | 'max_depth' | 'level_reached' | 'total_xp' | 'daily_streak' | 'boss_defeated' | 'legendary_found' | 'songs_perfect' | 'all_creatures' | 'treasure_value' | 'no_damage_run' | 'speed_run' | 'collection_milestone' | 'combo_max' | 'title_changed'
  value: number
}

const SV_ACHIEVEMENTS: SvAchievement[] = [
  { id: 'first_dive', name: 'First Dive', description: 'Complete your very first dive into the Siren Cove', icon: '🤿', condition: { type: 'caverns_discovered', value: 1 }, xpReward: 50, crestReward: 10, rarity: 0, hidden: false },
  { id: 'songbird_sea', name: 'Songbird of the Sea', description: 'Learn your first siren song', icon: '🎵', condition: { type: 'total_songs', value: 1 }, xpReward: 75, crestReward: 25, rarity: 0, hidden: false },
  { id: 'treasure_hunter', name: 'Treasure Hunter', description: 'Collect 10 treasures from the cove', icon: '💎', condition: { type: 'total_treasures', value: 10 }, xpReward: 100, crestReward: 50, rarity: 0, hidden: false },
  { id: 'deep_enough', name: 'Deep Enough', description: 'Reach a depth of 100 meters', icon: '📏', condition: { type: 'max_depth', value: 100 }, xpReward: 120, crestReward: 75, rarity: 1, hidden: false },
  { id: 'creature_friend', name: 'Creature Friend', description: 'Encounter 5 different sea creatures', icon: '🐬', condition: { type: 'creatures_encountered', value: 5 }, xpReward: 100, crestReward: 50, rarity: 0, hidden: false },
  { id: 'rising_tide', name: 'Rising Tide', description: 'Reach level 10', icon: '📈', condition: { type: 'level_reached', value: 10 }, xpReward: 150, crestReward: 100, rarity: 1, hidden: false },
  { id: 'daily_devotee', name: 'Daily Devotee', description: 'Maintain a 3-day daily streak', icon: '📅', condition: { type: 'daily_streak', value: 3 }, xpReward: 100, crestReward: 75, rarity: 1, hidden: false },
  { id: 'cove_cartographer', name: 'Cove Cartographer', description: 'Discover all 8 cove caverns', icon: '🗺️', condition: { type: 'caverns_discovered', value: 8 }, xpReward: 200, crestReward: 200, rarity: 2, hidden: false },
  { id: 'siren_scholar', name: 'Siren Scholar', description: 'Learn 10 different siren songs', icon: '🎶', condition: { type: 'total_songs', value: 10 }, xpReward: 250, crestReward: 250, rarity: 2, hidden: false },
  { id: 'boss_tamer', name: 'Boss Tamer', description: 'Defeat your first boss creature', icon: '🏆', condition: { type: 'boss_defeated', value: 1 }, xpReward: 300, crestReward: 300, rarity: 2, hidden: false },
  { id: 'legendary_find', name: 'Legendary Find', description: 'Find a legendary rarity treasure', icon: '🌟', condition: { type: 'legendary_found', value: 1 }, xpReward: 350, crestReward: 350, rarity: 3, hidden: true },
  { id: 'million_xp', name: 'Million XP Club', description: 'Earn a total of 1,000,000 XP', icon: '✨', condition: { type: 'total_xp', value: 1000000 }, xpReward: 500, crestReward: 500, rarity: 3, hidden: true },
  { id: 'hoard_master', name: 'Hoard Master', description: 'Accumulate 50,000 treasure value', icon: '💰', condition: { type: 'treasure_value', value: 50000 }, xpReward: 300, crestReward: 300, rarity: 2, hidden: false },
  { id: 'combo_king', name: 'Combo King', description: 'Achieve a 25x treasure collection combo', icon: '🔥', condition: { type: 'combo_max', value: 25 }, xpReward: 250, crestReward: 200, rarity: 2, hidden: true },
  { id: 'perfect_collection', name: 'Perfect Collection', description: 'Collect all creatures in your bestiary', icon: '📖', condition: { type: 'all_creatures', value: 1 }, xpReward: 500, crestReward: 500, rarity: 4, hidden: true },
  { id: 'untouchable', name: 'Untouchable', description: 'Complete a dive without taking any damage', icon: '🛡️', condition: { type: 'no_damage_run', value: 1 }, xpReward: 200, crestReward: 200, rarity: 2, hidden: false },
  { id: 'streak_master', name: 'Streak Master', description: 'Maintain a 7-day daily streak', icon: '🌟', condition: { type: 'daily_streak', value: 7 }, xpReward: 300, crestReward: 300, rarity: 3, hidden: true },
  { id: 'full_bestseller', name: 'Full Bestiary', description: 'Encounter every creature type at least once', icon: '📚', condition: { type: 'creatures_encountered', value: 18 }, xpReward: 400, crestReward: 400, rarity: 3, hidden: false },
]

// ============================================================
// POWER-UPS — consumable boost items
// ============================================================

interface SvPowerUp {
  id: string
  name: string
  description: string
  duration: number
  rarity: 0 | 1 | 2
  cost: number
  emoji: string
  effect: 'double_xp' | 'invincibility' | 'auto_collect' | 'siren_charm' | 'magnet_boost' | 'depth_scanner'
}

const SV_POWER_UPS: SvPowerUp[] = [
  { id: 'double_xp_potion', name: 'Double XP Draught', description: 'Doubles all XP earned for 30 seconds', duration: SV_DOUBLE_XP_DURATION, rarity: 1, cost: 100, emoji: '🧪', effect: 'double_xp' },
  { id: 'invincibility_shell', name: 'Invincibility Shell', description: 'Become immune to damage for 8 seconds', duration: SV_INVINCIBILITY_DURATION, rarity: 2, cost: 200, emoji: '🐚', effect: 'invincibility' },
  { id: 'auto_collect_orb', name: 'Auto-Collect Orb', description: 'Automatically collects all nearby treasures for 20 seconds', duration: SV_AUTO_COLLECT_DURATION, rarity: 2, cost: 250, emoji: '🔮', effect: 'auto_collect' },
  { id: 'siren_charm_charm', name: 'Siren Charm', description: 'All creatures become friendly for 15 seconds', duration: SV_SIREN_CHARM_DURATION, rarity: 2, cost: 300, emoji: '💖', effect: 'siren_charm' },
  { id: 'magnet_pearl', name: 'Magnet Pearl', description: 'Increases treasure attraction range by 3x for 20 seconds', duration: SV_AUTO_COLLECT_DURATION, rarity: 1, cost: 80, emoji: '🧲', effect: 'magnet_boost' },
  { id: 'depth_scanner', name: 'Depth Scanner', description: 'Reveals all hidden items in current cavern for 15 seconds', duration: SV_SIREN_CHARM_DURATION, rarity: 1, cost: 120, emoji: '📡', effect: 'depth_scanner' },
]

// ============================================================
// MINI-GAMES — 5 underwater mini-games
// ============================================================

interface SvMiniGame {
  id: string
  name: string
  description: string
  type: 'matching' | 'rhythm' | 'memory' | 'puzzle' | 'catch'
  difficulty: number
  rewards: { shards: number; xp: number; crests: number }
  unlockLevel: number
  emoji: string
}

const SV_MINI_GAMES: SvMiniGame[] = [
  { id: 'pearl_match', name: 'Pearl Match', description: 'Match pairs of enchanted pearls before time runs out', type: 'matching', difficulty: 1, rewards: { shards: 10, xp: 50, crests: 5 }, unlockLevel: 1, emoji: '🦪' },
  { id: 'siren_rhythm', name: 'Siren Rhythm', description: 'Follow the siren\'s song by hitting notes in sequence', type: 'rhythm', difficulty: 2, rewards: { shards: 15, xp: 75, crests: 10 }, unlockLevel: 5, emoji: '🎤' },
  { id: 'treasure_memory', name: 'Treasure Memory', description: 'Remember the location of hidden treasures and reveal them', type: 'memory', difficulty: 2, rewards: { shards: 12, xp: 60, crests: 8 }, unlockLevel: 3, emoji: '🧠' },
  { id: 'coral_puzzle', name: 'Coral Puzzle', description: 'Rearrange coral pieces to restore the reef formation', type: 'puzzle', difficulty: 3, rewards: { shards: 20, xp: 100, crests: 15 }, unlockLevel: 10, emoji: '🧩' },
  { id: 'fish_catch', name: 'Fish Frenzy', description: 'Catch as many fish as possible in the time limit', type: 'catch', difficulty: 1, rewards: { shards: 8, xp: 40, crests: 3 }, unlockLevel: 2, emoji: '🎣' },
]

// ============================================================
// DAILY CHALLENGES
// ============================================================

interface SvDailyChallenge {
  id: string
  name: string
  description: string
  target: number
  type: 'treasures' | 'songs' | 'creatures' | 'depth' | 'combos' | 'dives'
  reward: { shards: number; crests: number; xp: number }
  difficulty: number
}

const SV_DAILY_CHALLENGE_TEMPLATES: SvDailyChallenge[] = [
  { id: 'daily_collect_5', name: 'Pearl Collector', description: 'Collect 5 treasures today', target: 5, type: 'treasures', reward: { shards: 20, crests: 10, xp: 100 }, difficulty: 1 },
  { id: 'daily_sing_3', name: 'Morning Song', description: 'Sing 3 siren songs today', target: 3, type: 'songs', reward: { shards: 25, crests: 15, xp: 120 }, difficulty: 1 },
  { id: 'daily_encounter_4', name: 'Creature Spotter', description: 'Encounter 4 different creatures', target: 4, type: 'creatures', reward: { shards: 30, crests: 20, xp: 150 }, difficulty: 2 },
  { id: 'daily_depth_150', name: 'Deep Diver', description: 'Reach depth 150 meters', target: 150, type: 'depth', reward: { shards: 40, crests: 25, xp: 200 }, difficulty: 2 },
  { id: 'daily_combo_10', name: 'Combo Master', description: 'Achieve a 10x collection combo', target: 10, type: 'combos', reward: { shards: 35, crests: 20, xp: 180 }, difficulty: 2 },
  { id: 'daily_dive_3', name: 'Triple Dive', description: 'Complete 3 dives today', target: 3, type: 'dives', reward: { shards: 15, crests: 8, xp: 80 }, difficulty: 1 },
  { id: 'daily_collect_15', name: 'Hoarder\'s Delight', description: 'Collect 15 treasures in one day', target: 15, type: 'treasures', reward: { shards: 50, crests: 30, xp: 250 }, difficulty: 3 },
  { id: 'daily_encounter_8', name: 'Bestiary Builder', description: 'Encounter 8 different creatures', target: 8, type: 'creatures', reward: { shards: 55, crests: 35, xp: 280 }, difficulty: 3 },
]

// ============================================================
// SAVE STATE TYPES
// ============================================================

interface SvSaveState {
  level: number
  currentXp: number
  totalXp: number
  crests: number
  shards: number
  discoveredCaverns: string[]
  collectedTreasures: { [treasureId: string]: number }
  learnedSongs: string[]
  encounteredCreatures: string[]
  defeatedBosses: string[]
  unlockedAchievements: string[]
  activeTitle: string
  purchasedTitles: string[]
  currentCavern: string | null
  maxDepthReached: number
  totalDives: number
  totalTreasuresCollected: number
  totalSongsSung: number
  totalCreaturesEncountered: number
  dailyStreak: number
  lastPlayDate: string
  comboMax: number
  totalTreasureValue: number
  inventorySize: number
  activePowerUps: { [powerUpId: string]: number }
  settings: SvSettings
  dailyChallengeProgress: { [challengeId: string]: number }
  completedDailyChallenges: string[]
  miniGameScores: { [gameId: string]: number }
  resonancePoints: number
}

interface SvSettings {
  musicVolume: number
  sfxVolume: number
  particleQuality: 'low' | 'medium' | 'high'
  showDamageNumbers: boolean
  showMinimap: boolean
  autoPickup: boolean
  cameraShake: boolean
  colorTheme: 'aqua' | 'teal' | 'coral' | 'abyss' | 'bioluminescent'
}

// ============================================================
// DERIVED STATE (not persisted, computed)
// ============================================================

interface SvActiveEffect {
  id: string
  type: 'double_xp' | 'invincibility' | 'auto_collect' | 'siren_charm' | 'magnet_boost' | 'depth_scanner'
  endsAt: number
}

interface SvGameState {
  isDiving: boolean
  currentDepth: number
  currentCombo: number
  activeEffects: SvActiveEffect[]
  recentEvents: SvEvent[]
  divingStartTime: number
  damageTaken: boolean
  treasuresThisDive: number
  creaturesThisDive: number
  songsThisDive: number
}

interface SvEvent {
  id: string
  type: 'treasure_found' | 'song_learned' | 'creature_encountered' | 'level_up' | 'achievement_unlocked' | 'boss_defeated' | 'cavern_discovered' | 'title_unlocked' | 'power_up_used' | 'daily_completed'
  message: string
  timestamp: number
  metadata?: Record<string, unknown>
}

// ============================================================
// HELPER: default save state
// ============================================================

function svCreateDefaultSave(): SvSaveState {
  return {
    level: 1,
    currentXp: 0,
    totalXp: 0,
    crests: 50,
    shards: 20,
    discoveredCaverns: ['shallow_reef'],
    collectedTreasures: {},
    learnedSongs: ['call_of_the_deep', 'tide_melody', 'dolphin_dance'],
    encounteredCreatures: [],
    defeatedBosses: [],
    unlockedAchievements: [],
    activeTitle: 'wave_listener',
    purchasedTitles: ['wave_listener'],
    currentCavern: null,
    maxDepthReached: 10,
    totalDives: 0,
    totalTreasuresCollected: 0,
    totalSongsSung: 0,
    totalCreaturesEncountered: 0,
    dailyStreak: 0,
    lastPlayDate: '',
    comboMax: 0,
    totalTreasureValue: 0,
    inventorySize: 0,
    activePowerUps: {},
    settings: {
      musicVolume: SV_DEFAULT_VOLUME,
      sfxVolume: SV_DEFAULT_VOLUME,
      particleQuality: 'medium',
      showDamageNumbers: true,
      showMinimap: true,
      autoPickup: true,
      cameraShake: true,
      colorTheme: 'aqua',
    },
    dailyChallengeProgress: {},
    completedDailyChallenges: [],
    miniGameScores: {},
    resonancePoints: 0,
  }
}

function svCreateDefaultGameState(): SvGameState {
  return {
    isDiving: false,
    currentDepth: 0,
    currentCombo: 0,
    activeEffects: [],
    recentEvents: [],
    divingStartTime: 0,
    damageTaken: false,
    treasuresThisDive: 0,
    creaturesThisDive: 0,
    songsThisDive: 0,
  }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function svGetXpForLevel(level: number): number {
  if (level < 1 || level > SV_MAX_LEVEL) return SV_XP_TABLE[SV_MAX_LEVEL]
  return SV_XP_TABLE[level]
}

function svGetXpForNextLevel(currentLevel: number): number {
  if (currentLevel >= SV_MAX_LEVEL) return Infinity
  return SV_XP_TABLE[currentLevel + 1] - SV_XP_TABLE[currentLevel]
}

function svGetLevelFromTotalXp(totalXp: number): number {
  let level = 1
  while (level < SV_MAX_LEVEL && totalXp >= SV_XP_TABLE[level + 1]) {
    level++
  }
  return level
}

function svGetCurrentXpProgress(totalXp: number): number {
  const level = svGetLevelFromTotalXp(totalXp)
  if (level >= SV_MAX_LEVEL) return 0
  return totalXp - SV_XP_TABLE[level]
}

function svGetRarityInfo(rarityIndex: number) {
  return SV_RARITY_TIERS[rarityIndex] ?? SV_RARITY_TIERS[0]
}

function svGetTodayDateString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function svGenerateDailyChallenges(): SvDailyChallenge[] {
  const dateStr = svGetTodayDateString()
  let seed = 0
  for (let i = 0; i < dateStr.length; i++) {
    seed = (seed * 31 + dateStr.charCodeAt(i)) | 0
  }
  const shuffled = [...SV_DAILY_CHALLENGE_TEMPLATES]
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    const j = seed % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, 3)
}

function svGenerateTreasureRarity(playerLevel: number): 0 | 1 | 2 | 3 | 4 {
  const weights = [
    Math.max(5, 40 - playerLevel * 0.5),
    30,
    15 + playerLevel * 0.2,
    8 + playerLevel * 0.15,
    Math.min(5, playerLevel * 0.08),
  ]
  const total = weights.reduce((a, b) => a + b, 0)
  let roll = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return i as 0 | 1 | 2 | 3 | 4
  }
  return 0
}

function svGenerateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function svCalculateComboMultiplier(combo: number): number {
  if (combo < 5) return 1.0
  if (combo < 10) return 1.2
  if (combo < 15) return 1.5
  if (combo < 20) return 1.8
  if (combo < 25) return 2.2
  return 2.5
}

function svGetCavernTreasurePool(cavernId: string): SvTreasure[] {
  return SV_TREASURES.filter((t) => t.foundInCaverns.includes(cavernId))
}

function svGetCavernCreatures(cavernId: string): SvCreature[] {
  return SV_CREATURES.filter((c) => c.foundIn.includes(cavernId))
}

function svGetAvailableSongs(level: number): SvSong[] {
  return SV_SONGS.filter((s) => s.unlockLevel <= level)
}

function svGetUnlockedCaverns(level: number): SvCavern[] {
  return SV_CAVERNS.filter((c) => c.requiredLevel <= level)
}

function svGetNextTitle(currentTitleId: string, level: number, achievementCount: number): SvTitle | null {
  const currentIdx = SV_TITLES.findIndex((t) => t.id === currentTitleId)
  for (let i = currentIdx + 1; i < SV_TITLES.length; i++) {
    const title = SV_TITLES[i]
    if (level >= title.requiredLevel && achievementCount >= title.requiredAchievements) {
      return title
    }
  }
  return null
}

// ============================================================
// SAVE / LOAD
// ============================================================

function svLoadSave(): SvSaveState {
  if (typeof window === 'undefined') return svCreateDefaultSave()
  try {
    const raw = localStorage.getItem(SV_SAVE_KEY)
    if (!raw) return svCreateDefaultSave()
    const parsed = JSON.parse(raw) as Partial<SvSaveState>
    const defaults = svCreateDefaultSave()
    return {
      ...defaults,
      ...parsed,
      settings: { ...defaults.settings, ...(parsed.settings ?? {}) },
    }
  } catch {
    return svCreateDefaultSave()
  }
}

function svSaveToDisk(state: SvSaveState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SV_SAVE_KEY, JSON.stringify(state))
  } catch {
    console.warn('[SirenCove] Failed to save state to localStorage')
  }
}

function svExportSave(): string {
  const state = svLoadSave()
  return JSON.stringify(state)
}

function svImportSave(json: string): boolean {
  try {
    const parsed = JSON.parse(json)
    if (typeof parsed.level !== 'number') return false
    svSaveToDisk({ ...svCreateDefaultSave(), ...parsed })
    return true
  } catch {
    return false
  }
}

// ============================================================
// RESET — plain function (no useCallback)
// ============================================================

function svResetProgress(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SV_SAVE_KEY)
}

// ============================================================
// THE HOOK
// ============================================================

export default function useSirenCove() {
  const [saveState, setSaveState] = useState<SvSaveState>(svCreateDefaultSave)
  const [gameState, setGameState] = useState<SvGameState>(svCreateDefaultGameState)
  const [dailyChallenges, setDailyChallenges] = useState<SvDailyChallenge[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const effectTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const lastSaveRef = useRef<SvSaveState | null>(null)

  // ---- Load from localStorage on mount ----
  useEffect(() => {
    const loaded = svLoadSave()
    setSaveState(loaded)
    setDailyChallenges(svGenerateDailyChallenges())

    const today = svGetTodayDateString()
    if (loaded.lastPlayDate && loaded.lastPlayDate !== today) {
      const lastDate = new Date(loaded.lastPlayDate)
      const todayDate = new Date(today)
      const diffMs = todayDate.getTime() - lastDate.getTime()
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
      if (diffDays === 1) {
        const newStreak = Math.min(loaded.dailyStreak + 1, SV_MAX_DAILY_STREAK)
        const streakBonus = newStreak * SV_DAILY_STREAK_BONUS
        setSaveState((prev) => ({
          ...prev,
          dailyStreak: newStreak,
          lastPlayDate: today,
          completedDailyChallenges: [],
          dailyChallengeProgress: {},
          shards: prev.shards + streakBonus,
          currentXp: prev.currentXp + streakBonus,
          totalXp: prev.totalXp + streakBonus,
        }))
      } else if (diffDays > 1) {
        setSaveState((prev) => ({
          ...prev,
          dailyStreak: 0,
          lastPlayDate: today,
          completedDailyChallenges: [],
          dailyChallengeProgress: {},
        }))
      }
    } else if (!loaded.lastPlayDate) {
      setSaveState((prev) => ({
        ...prev,
        lastPlayDate: today,
      }))
    }

    setIsLoaded(true)
  }, [])

  // ---- Auto-save on state changes ----
  useEffect(() => {
    if (!isLoaded) return
    if (lastSaveRef.current && JSON.stringify(lastSaveRef.current) === JSON.stringify(saveState)) return
    lastSaveRef.current = saveState
    const timer = setTimeout(() => {
      svSaveToDisk(saveState)
    }, 500)
    return () => clearTimeout(timer)
  }, [saveState, isLoaded])

  // ---- Cleanup effect timers on unmount ----
  useEffect(() => {
    const timers = effectTimersRef.current
    return () => {
      timers.forEach((t) => clearTimeout(t))
      timers.clear()
    }
  }, [])

  // ============================================================
  // CORE ACTIONS
  // ============================================================

  const svAddXp = useCallback((amount: number) => {
    setSaveState((prev) => {
      const hasDoubleXp = gameState.activeEffects.some((e) => e.type === 'double_xp')
      const finalAmount = hasDoubleXp ? amount * 2 : amount
      const newTotalXp = prev.totalXp + finalAmount
      const newLevel = svGetLevelFromTotalXp(newTotalXp)
      const leveled = newLevel > prev.level
      const newResonance = prev.resonancePoints + Math.floor(finalAmount / 100)

      const newState: SvSaveState = {
        ...prev,
        currentXp: svGetCurrentXpProgress(newTotalXp),
        totalXp: newTotalXp,
        level: newLevel,
        resonancePoints: newResonance,
      }

      if (leveled) {
        const bonusCrests = newLevel * 5
        newState.crests = Math.min(prev.crests + bonusCrests, SV_MAX_CREST)
        const event: SvEvent = {
          id: svGenerateEventId(),
          type: 'level_up',
          message: `Level Up! You are now level ${newLevel}!`,
          timestamp: Date.now(),
          metadata: { newLevel, bonusCrests },
        }
        setGameState((g) => ({ ...g, recentEvents: [event, ...g.recentEvents].slice(0, 50) }))
      }

      return newState
    })
  }, [gameState.activeEffects])

  const svAddCrests = useCallback((amount: number) => {
    setSaveState((prev) => ({
      ...prev,
      crests: Math.min(prev.crests + amount, SV_MAX_CREST),
    }))
  }, [])

  const svSpendCrests = useCallback((amount: number): boolean => {
    let success = false
    setSaveState((prev) => {
      if (prev.crests < amount) return prev
      success = true
      return { ...prev, crests: prev.crests - amount }
    })
    return success
  }, [])

  const svAddShards = useCallback((amount: number) => {
    setSaveState((prev) => ({
      ...prev,
      shards: Math.min(prev.shards + amount, SV_MAX_SHARDS),
    }))
  }, [])

  const svSpendShards = useCallback((amount: number): boolean => {
    let success = false
    setSaveState((prev) => {
      if (prev.shards < amount) return prev
      success = true
      return { ...prev, shards: prev.shards - amount }
    })
    return success
  }, [])

  // ============================================================
  // DIVING ACTIONS
  // ============================================================

  const svStartDive = useCallback((cavernId: string) => {
    const cavern = SV_CAVERNS.find((c) => c.id === cavernId)
    if (!cavern) return

    setSaveState((prev) => {
      const discovered = prev.discoveredCaverns.includes(cavernId)
        ? prev.discoveredCaverns
        : [...prev.discoveredCaverns, cavernId]
      const maxDepth = Math.max(prev.maxDepthReached, cavern.depth)
      const totalDives = prev.totalDives + 1
      return { ...prev, discoveredCaverns: discovered, maxDepthReached: maxDepth, totalDives: totalDives, currentCavern: cavernId }
    })

    setGameState((prev) => ({
      ...prev,
      isDiving: true,
      currentDepth: cavern.depth,
      currentCombo: 0,
      divingStartTime: Date.now(),
      damageTaken: false,
      treasuresThisDive: 0,
      creaturesThisDive: 0,
      songsThisDive: 0,
    }))

    const event: SvEvent = {
      id: svGenerateEventId(),
      type: 'cavern_discovered',
      message: `Diving into ${cavern.name} at ${cavern.depth}m depth`,
      timestamp: Date.now(),
      metadata: { cavernId, depth: cavern.depth },
    }
    setGameState((prev) => ({ ...prev, recentEvents: [event, ...prev.recentEvents].slice(0, 50) }))

    svAddCrests(cavern.discoveryBonus)
  }, [svAddCrests])

  const svEndDive = useCallback(() => {
    setGameState((prev) => {
      const diveDuration = Date.now() - prev.divingStartTime
      const wasPerfectRun = !prev.damageTaken && prev.treasuresThisDive >= 5

      if (wasPerfectRun) {
        setSaveState((sp) => ({
          ...sp,
          currentXp: sp.currentXp + 50,
          totalXp: sp.totalXp + 50,
        }))
      }

      const event: SvEvent = {
        id: svGenerateEventId(),
        type: 'treasure_found',
        message: `Dive complete! ${prev.treasuresThisDive} treasures, ${prev.creaturesThisDive} creatures, ${prev.songsThisDive} songs`,
        timestamp: Date.now(),
        metadata: {
          duration: diveDuration,
          treasures: prev.treasuresThisDive,
          creatures: prev.creaturesThisDive,
          songs: prev.songsThisDive,
          combo: prev.currentCombo,
          perfect: wasPerfectRun,
        },
      }

      return {
        ...prev,
        isDiving: false,
        currentDepth: 0,
        currentCombo: 0,
        activeEffects: [],
        recentEvents: [event, ...prev.recentEvents].slice(0, 50),
      }
    })

    effectTimersRef.current.forEach((t) => clearTimeout(t))
    effectTimersRef.current.clear()
  }, [])

  const svChangeDepth = useCallback((newDepth: number) => {
    setGameState((prev) => {
      const clampedDepth = Math.max(0, Math.min(newDepth, 600))
      return { ...prev, currentDepth: clampedDepth }
    })
  }, [])

  // ============================================================
  // TREASURE ACTIONS
  // ============================================================

  const svCollectTreasure = useCallback((treasureId: string) => {
    const treasure = SV_TREASURES.find((t) => t.id === treasureId)
    if (!treasure) return

    setSaveState((prev) => {
      const currentCount = prev.collectedTreasures[treasureId] ?? 0
      const newCount = currentCount + 1
      const isFirstFind = currentCount === 0
      const isLegendary = treasure.rarity === 4

      const rarityInfo = svGetRarityInfo(treasure.rarity)
      const comboMultiplier = 1.0
      const totalValue = Math.floor(treasure.value * rarityInfo.multiplier)
      const xpGained = Math.floor((SV_BASE_XP_REWARD + SV_TREASURE_XP_BONUS) * rarityInfo.multiplier)

      const newState: SvSaveState = {
        ...prev,
        collectedTreasures: { ...prev.collectedTreasures, [treasureId]: newCount },
        totalTreasuresCollected: prev.totalTreasuresCollected + 1,
        totalTreasureValue: prev.totalTreasureValue + totalValue,
        crests: Math.min(prev.crests + Math.floor(totalValue * 0.1), SV_MAX_CREST),
        inventorySize: Math.min(prev.inventorySize + 1, SV_MAX_INVENTORY),
      }

      if (isFirstFind) {
        newState.totalXp = newState.totalXp + xpGained
        newState.currentXp = svGetCurrentXpProgress(newState.totalXp)
        newState.level = svGetLevelFromTotalXp(newState.totalXp)
        newState.resonancePoints = newState.resonancePoints + Math.floor(xpGained / 50)
      }

      const event: SvEvent = {
        id: svGenerateEventId(),
        type: 'treasure_found',
        message: isFirstFind
          ? `New discovery: ${treasure.name} (${rarityInfo.name})! +${totalValue} value`
          : `${treasure.name} collected +1`,
        timestamp: Date.now(),
        metadata: { treasureId, rarity: treasure.rarity, value: totalValue, xp: xpGained, firstFind: isFirstFind },
      }
      setGameState((g) => {
        const newCombo = g.isDiving ? g.currentCombo + 1 : 0
        const updatedComboMax = Math.max(prev.comboMax, newCombo)
        setSaveState((sp) => ({ ...sp, comboMax: updatedComboMax }))
        return {
          ...g,
          currentCombo: newCombo,
          treasuresThisDive: g.treasuresThisDive + 1,
          recentEvents: [event, ...g.recentEvents].slice(0, 50),
        }
      })

      return newState
    })

    svUpdateDailyProgress('treasures', 1)
  }, [])

  const svGetTreasureInfo = useCallback((treasureId: string): SvTreasure | undefined => {
    return SV_TREASURES.find((t) => t.id === treasureId)
  }, [])

  const svGetCollectedCount = useCallback((treasureId: string): number => {
    return saveState.collectedTreasures[treasureId] ?? 0
  }, [saveState.collectedTreasures])

  const svGetUniqueTreasureCount = useCallback((): number => {
    return Object.keys(saveState.collectedTreasures).filter((id) => saveState.collectedTreasures[id] > 0).length
  }, [saveState.collectedTreasures])

  const svGetTotalCollectionProgress = useCallback((): { collected: number; total: number; percentage: number } => {
    const collected = svGetUniqueTreasureCount()
    const total = SV_TREASURES.length
    return { collected, total, percentage: Math.floor((collected / total) * 100) }
  }, [svGetUniqueTreasureCount])

  // ============================================================
  // SONG ACTIONS
  // ============================================================

  const svLearnSong = useCallback((songId: string) => {
    const song = SV_SONGS.find((s) => s.id === songId)
    if (!song) return

    setSaveState((prev) => {
      if (prev.learnedSongs.includes(songId)) return prev
      if (prev.level < song.unlockLevel) return prev

      const rarityInfo = svGetRarityInfo(song.rarity)
      const xpGained = Math.floor((SV_BASE_XP_REWARD + SV_SONG_XP_BONUS) * rarityInfo.multiplier)

      const event: SvEvent = {
        id: svGenerateEventId(),
        type: 'song_learned',
        message: `Learned new song: ${song.name}!`,
        timestamp: Date.now(),
        metadata: { songId, rarity: song.rarity, effect: song.effect },
      }
      setGameState((g) => ({
        ...g,
        songsThisDive: g.songsThisDive + 1,
        recentEvents: [event, ...g.recentEvents].slice(0, 50),
      }))

      return {
        ...prev,
        learnedSongs: [...prev.learnedSongs, songId],
        totalSongsSung: prev.totalSongsSung + 1,
        totalXp: prev.totalXp + xpGained,
        currentXp: svGetCurrentXpProgress(prev.totalXp + xpGained),
        level: svGetLevelFromTotalXp(prev.totalXp + xpGained),
        resonancePoints: prev.resonancePoints + Math.floor(xpGained / 80),
      }
    })

    svUpdateDailyProgress('songs', 1)
  }, [])

  const svSingSong = useCallback((songId: string) => {
    const song = SV_SONGS.find((s) => s.id === songId)
    if (!song) return false

    let canSing = false
    setSaveState((prev) => {
      if (!prev.learnedSongs.includes(songId)) return prev
      canSing = true

      const effect = song.effect
      const duration = song.duration + (song.rarity >= 3 ? 2000 : 0)
      const effectId = `song_${songId}_${Date.now()}`

      setGameState((g) => {
        const newEffect: SvActiveEffect = {
          id: effectId,
          type: effect as SvActiveEffect['type'],
          endsAt: Date.now() + duration,
        }

        const timer = setTimeout(() => {
          setGameState((curr) => ({
            ...curr,
            activeEffects: curr.activeEffects.filter((e) => e.id !== effectId),
          }))
        }, duration)
        effectTimersRef.current.set(effectId, timer)

        const xpGained = Math.floor(SV_SONG_XP_BONUS * (1 + song.rarity * 0.3))
        const bonusEvent: SvEvent = {
          id: svGenerateEventId(),
          type: 'song_learned',
          message: `Singing ${song.name} — ${effect} active for ${duration}ms`,
          timestamp: Date.now(),
          metadata: { songId, effect, duration, xp: xpGained },
        }

        return {
          ...g,
          activeEffects: [...g.activeEffects, newEffect],
          recentEvents: [bonusEvent, ...g.recentEvents].slice(0, 50),
        }
      })

      return {
        ...prev,
        totalSongsSung: prev.totalSongsSung + 1,
      }
    })

    return canSing
  }, [])

  const svGetSongInfo = useCallback((songId: string): SvSong | undefined => {
    return SV_SONGS.find((s) => s.id === songId)
  }, [])

  const svIsSongLearned = useCallback((songId: string): boolean => {
    return saveState.learnedSongs.includes(songId)
  }, [saveState.learnedSongs])

  const svCanLearnSong = useCallback((songId: string): boolean => {
    const song = SV_SONGS.find((s) => s.id === songId)
    if (!song) return false
    return saveState.level >= song.unlockLevel && !saveState.learnedSongs.includes(songId)
  }, [saveState.level, saveState.learnedSongs])

  // ============================================================
  // CREATURE ACTIONS
  // ============================================================

  const svEncounterCreature = useCallback((creatureId: string) => {
    const creature = SV_CREATURES.find((c) => c.id === creatureId)
    if (!creature) return

    setSaveState((prev) => {
      const isFirstEncounter = !prev.encounteredCreatures.includes(creatureId)
      const rarityInfo = svGetRarityInfo(creature.rarity)
      const xpGained = Math.floor(creature.xpReward * rarityInfo.multiplier)

      const newState: SvSaveState = {
        ...prev,
        totalCreaturesEncountered: prev.totalCreaturesEncountered + 1,
      }

      if (isFirstEncounter) {
        newState.encounteredCreatures = [...prev.encounteredCreatures, creatureId]
        newState.totalXp = newState.totalXp + xpGained * 2
        newState.currentXp = svGetCurrentXpProgress(newState.totalXp)
        newState.level = svGetLevelFromTotalXp(newState.totalXp)
        newState.resonancePoints = newState.resonancePoints + Math.floor(xpGained / 60)
      }

      const event: SvEvent = {
        id: svGenerateEventId(),
        type: 'creature_encountered',
        message: isFirstEncounter
          ? `New creature discovered: ${creature.name}!`
          : `Encountered ${creature.name}`,
        timestamp: Date.now(),
        metadata: { creatureId, rarity: creature.rarity, firstEncounter: isFirstEncounter },
      }
      setGameState((g) => ({
        ...g,
        creaturesThisDive: g.creaturesThisDive + 1,
        recentEvents: [event, ...g.recentEvents].slice(0, 50),
      }))

      return newState
    })

    svUpdateDailyProgress('creatures', 1)
  }, [])

  const svDefeatCreature = useCallback((creatureId: string) => {
    const creature = SV_CREATURES.find((c) => c.id === creatureId)
    if (!creature) return

    setSaveState((prev) => {
      const rarityInfo = svGetRarityInfo(creature.rarity)
      const xpGained = Math.floor((SV_BASE_XP_REWARD + SV_CREATURE_XP_BONUS) * rarityInfo.multiplier)
      const crestGained = Math.floor(creature.xpReward * 0.3)
      const shardGained = Math.floor(creature.xpReward * 0.2)

      const newState: SvSaveState = {
        ...prev,
        totalXp: prev.totalXp + xpGained,
        currentXp: svGetCurrentXpProgress(prev.totalXp + xpGained),
        level: svGetLevelFromTotalXp(prev.totalXp + xpGained),
        crests: Math.min(prev.crests + crestGained, SV_MAX_CREST),
        shards: Math.min(prev.shards + shardGained, SV_MAX_SHARDS),
      }

      if (creature.behavior === 'boss' && !prev.defeatedBosses.includes(creatureId)) {
        newState.defeatedBosses = [...prev.defeatedBosses, creatureId]
        newState.crests = Math.min(newState.crests + 500, SV_MAX_CREST)
        newState.shards = Math.min(newState.shards + 200, SV_MAX_SHARDS)

        const bossEvent: SvEvent = {
          id: svGenerateEventId(),
          type: 'boss_defeated',
          message: `Boss defeated: ${creature.name}! +500 crests, +200 shards`,
          timestamp: Date.now(),
          metadata: { creatureId, crests: 500, shards: 200 },
        }
        setGameState((g) => ({
          ...g,
          recentEvents: [bossEvent, ...g.recentEvents].slice(0, 50),
        }))
      }

      return newState
    })
  }, [])

  const svGetCreatureInfo = useCallback((creatureId: string): SvCreature | undefined => {
    return SV_CREATURES.find((c) => c.id === creatureId)
  }, [])

  const svHasEncounteredCreature = useCallback((creatureId: string): boolean => {
    return saveState.encounteredCreatures.includes(creatureId)
  }, [saveState.encounteredCreatures])

  const svGetBestiaryProgress = useCallback((): { encountered: number; total: number; percentage: number } => {
    return {
      encountered: saveState.encounteredCreatures.length,
      total: SV_CREATURES.length,
      percentage: Math.floor((saveState.encounteredCreatures.length / SV_CREATURES.length) * 100),
    }
  }, [saveState.encounteredCreatures])

  // ============================================================
  // COMBO SYSTEM
  // ============================================================

  const svGetComboMultiplier = useCallback((): number => {
    return svCalculateComboMultiplier(gameState.currentCombo)
  }, [gameState.currentCombo])

  const svResetCombo = useCallback(() => {
    setGameState((prev) => ({ ...prev, currentCombo: 0 }))
  }, [])

  const svIncrementCombo = useCallback(() => {
    setGameState((prev) => ({ ...prev, currentCombo: prev.currentCombo + 1 }))
  }, [])

  // ============================================================
  // POWER-UP ACTIONS
  // ============================================================

  const svActivatePowerUp = useCallback((powerUpId: string) => {
    const powerUp = SV_POWER_UPS.find((p) => p.id === powerUpId)
    if (!powerUp) return

    if (!svSpendShards(powerUp.cost)) return

    const effectId = `pu_${powerUpId}_${Date.now()}`

    setGameState((prev) => {
      const newEffect: SvActiveEffect = {
        id: effectId,
        type: powerUp.effect,
        endsAt: Date.now() + powerUp.duration,
      }

      const timer = setTimeout(() => {
        setGameState((curr) => ({
          ...curr,
          activeEffects: curr.activeEffects.filter((e) => e.id !== effectId),
        }))
      }, powerUp.duration)
      effectTimersRef.current.set(effectId, timer)

      const event: SvEvent = {
        id: svGenerateEventId(),
        type: 'power_up_used',
        message: `Activated ${powerUp.name}!`,
        timestamp: Date.now(),
        metadata: { powerUpId, effect: powerUp.effect, duration: powerUp.duration },
      }

      return {
        ...prev,
        activeEffects: [...prev.activeEffects, newEffect],
        recentEvents: [event, ...prev.recentEvents].slice(0, 50),
      }
    })
  }, [svSpendShards])

  const svHasActiveEffect = useCallback((effectType: SvActiveEffect['type']): boolean => {
    const now = Date.now()
    return gameState.activeEffects.some((e) => e.type === effectType && e.endsAt > now)
  }, [gameState.activeEffects])

  const svGetActiveEffects = useCallback((): SvActiveEffect[] => {
    const now = Date.now()
    return gameState.activeEffects.filter((e) => e.endsAt > now)
  }, [gameState.activeEffects])

  const svGetEffectRemaining = useCallback((effectType: SvActiveEffect['type']): number => {
    const now = Date.now()
    const effect = gameState.activeEffects.find((e) => e.type === effectType && e.endsAt > now)
    return effect ? Math.max(0, effect.endsAt - now) : 0
  }, [gameState.activeEffects])

  // ============================================================
  // ACHIEVEMENT SYSTEM
  // ============================================================

  const svCheckAchievements = useCallback((state: SvSaveState): string[] => {
    const newlyUnlocked: string[] = []

    for (const achievement of SV_ACHIEVEMENTS) {
      if (state.unlockedAchievements.includes(achievement.id)) continue

      let conditionMet = false
      switch (achievement.condition.type) {
        case 'total_treasures':
          conditionMet = state.totalTreasuresCollected >= achievement.condition.value
          break
        case 'total_songs':
          conditionMet = state.learnedSongs.length >= achievement.condition.value
          break
        case 'creatures_encountered':
          conditionMet = state.encounteredCreatures.length >= achievement.condition.value
          break
        case 'caverns_discovered':
          conditionMet = state.discoveredCaverns.length >= achievement.condition.value
          break
        case 'max_depth':
          conditionMet = state.maxDepthReached >= achievement.condition.value
          break
        case 'level_reached':
          conditionMet = state.level >= achievement.condition.value
          break
        case 'total_xp':
          conditionMet = state.totalXp >= achievement.condition.value
          break
        case 'daily_streak':
          conditionMet = state.dailyStreak >= achievement.condition.value
          break
        case 'boss_defeated':
          conditionMet = state.defeatedBosses.length >= achievement.condition.value
          break
        case 'legendary_found':
          conditionMet = Object.keys(state.collectedTreasures).some((tid) => {
            const t = SV_TREASURES.find((tr) => tr.id === tid)
            return t && t.rarity === 4 && (state.collectedTreasures[tid] ?? 0) > 0
          })
          break
        case 'treasure_value':
          conditionMet = state.totalTreasureValue >= achievement.condition.value
          break
        case 'combo_max':
          conditionMet = state.comboMax >= achievement.condition.value
          break
        case 'no_damage_run':
          conditionMet = !gameState.damageTaken && gameState.treasuresThisDive >= 3
          break
        case 'all_creatures':
          conditionMet = state.encounteredCreatures.length >= SV_CREATURES.length
          break
        default:
          break
      }

      if (conditionMet) {
        newlyUnlocked.push(achievement.id)
      }
    }

    return newlyUnlocked
  }, [gameState.damageTaken, gameState.treasuresThisDive])

  const svUnlockAchievements = useCallback(() => {
    setSaveState((prev) => {
      const newUnlocks = svCheckAchievements(prev)
      if (newUnlocks.length === 0) return prev

      const totalXpReward = newUnlocks.reduce((sum, id) => {
        const ach = SV_ACHIEVEMENTS.find((a) => a.id === id)
        return sum + (ach?.xpReward ?? 0)
      }, 0)

      const totalCrestReward = newUnlocks.reduce((sum, id) => {
        const ach = SV_ACHIEVEMENTS.find((a) => a.id === id)
        return sum + (ach?.crestReward ?? 0)
      }, 0)

      newUnlocks.forEach((id) => {
        const ach = SV_ACHIEVEMENTS.find((a) => a.id === id)
        if (!ach) return
        const event: SvEvent = {
          id: svGenerateEventId(),
          type: 'achievement_unlocked',
          message: `Achievement Unlocked: ${ach.name}!`,
          timestamp: Date.now(),
          metadata: { achievementId: id, xp: ach.xpReward, crests: ach.crestReward },
        }
        setGameState((g) => ({
          ...g,
          recentEvents: [event, ...g.recentEvents].slice(0, 50),
        }))
      })

      const newTotalXp = prev.totalXp + totalXpReward
      return {
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, ...newUnlocks],
        totalXp: newTotalXp,
        currentXp: svGetCurrentXpProgress(newTotalXp),
        level: svGetLevelFromTotalXp(newTotalXp),
        crests: Math.min(prev.crests + totalCrestReward, SV_MAX_CREST),
        resonancePoints: prev.resonancePoints + totalXpReward,
      }
    })
  }, [svCheckAchievements])

  const svIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    return saveState.unlockedAchievements.includes(achievementId)
  }, [saveState.unlockedAchievements])

  const svGetAchievementProgress = useCallback((achievementId: string): { current: number; target: number } => {
    const ach = SV_ACHIEVEMENTS.find((a) => a.id === achievementId)
    if (!ach) return { current: 0, target: 0 }

    let current = 0
    switch (ach.condition.type) {
      case 'total_treasures': current = saveState.totalTreasuresCollected; break
      case 'total_songs': current = saveState.learnedSongs.length; break
      case 'creatures_encountered': current = saveState.encounteredCreatures.length; break
      case 'caverns_discovered': current = saveState.discoveredCaverns.length; break
      case 'max_depth': current = saveState.maxDepthReached; break
      case 'level_reached': current = saveState.level; break
      case 'total_xp': current = saveState.totalXp; break
      case 'daily_streak': current = saveState.dailyStreak; break
      case 'boss_defeated': current = saveState.defeatedBosses.length; break
      case 'legendary_found': {
        current = Object.keys(saveState.collectedTreasures).filter((tid) => {
          const t = SV_TREASURES.find((tr) => tr.id === tid)
          return t && t.rarity === 4 && (saveState.collectedTreasures[tid] ?? 0) > 0
        }).length
        break
      }
      case 'treasure_value': current = saveState.totalTreasureValue; break
      case 'combo_max': current = saveState.comboMax; break
      case 'no_damage_run': current = (!gameState.damageTaken && gameState.treasuresThisDive >= 3) ? 1 : 0; break
      case 'all_creatures': current = saveState.encounteredCreatures.length >= SV_CREATURES.length ? 1 : 0; break
      default: break
    }

    return { current, target: ach.condition.value }
  }, [saveState, gameState.damageTaken, gameState.treasuresThisDive])

  // ============================================================
  // TITLE SYSTEM
  // ============================================================

  const svSetActiveTitle = useCallback((titleId: string) => {
    setSaveState((prev) => {
      if (!prev.purchasedTitles.includes(titleId)) return prev
      return { ...prev, activeTitle: titleId }
    })
  }, [])

  const svPurchaseTitle = useCallback((titleId: string): boolean => {
    const title = SV_TITLES.find((t) => t.id === titleId)
    if (!title) return false

    let success = false
    setSaveState((prev) => {
      if (prev.purchasedTitles.includes(titleId)) {
        success = true
        return prev
      }
      if (prev.crests < title.crestCost) return prev
      if (prev.level < title.requiredLevel) return prev
      if (prev.unlockedAchievements.length < title.requiredAchievements) return prev

      success = true
      const event: SvEvent = {
        id: svGenerateEventId(),
        type: 'title_unlocked',
        message: `Title unlocked: ${title.name}!`,
        timestamp: Date.now(),
        metadata: { titleId, color: title.color },
      }
      setGameState((g) => ({
        ...g,
        recentEvents: [event, ...g.recentEvents].slice(0, 50),
      }))

      return {
        ...prev,
        crests: prev.crests - title.crestCost,
        purchasedTitles: [...prev.purchasedTitles, titleId],
      }
    })
    return success
  }, [])

  const svGetCurrentTitle = useCallback((): SvTitle => {
    return SV_TITLES.find((t) => t.id === saveState.activeTitle) ?? SV_TITLES[0]
  }, [saveState.activeTitle])

  const svCanPurchaseTitle = useCallback((titleId: string): { canBuy: boolean; reason: string } => {
    const title = SV_TITLES.find((t) => t.id === titleId)
    if (!title) return { canBuy: false, reason: 'Title not found' }
    if (saveState.purchasedTitles.includes(titleId)) return { canBuy: true, reason: 'Already owned' }
    if (saveState.level < title.requiredLevel) return { canBuy: false, reason: `Requires level ${title.requiredLevel}` }
    if (saveState.unlockedAchievements.length < title.requiredAchievements) return { canBuy: false, reason: `Requires ${title.requiredAchievements} achievements` }
    if (saveState.crests < title.crestCost) return { canBuy: false, reason: `Requires ${title.crestCost} crests` }
    return { canBuy: true, reason: 'Ready to purchase' }
  }, [saveState.level, saveState.unlockedAchievements.length, saveState.crests, saveState.purchasedTitles])

  // ============================================================
  // DAILY CHALLENGE SYSTEM
  // ============================================================

  const svUpdateDailyProgress = useCallback((type: SvDailyChallenge['type'], amount: number) => {
    setSaveState((prev) => {
      const updatedProgress = { ...prev.dailyChallengeProgress }
      let updatedCompleted = [...prev.completedDailyChallenges]

      dailyChallenges.forEach((challenge) => {
        if (updatedCompleted.includes(challenge.id)) return
        if (challenge.type !== type) return

        const current = updatedProgress[challenge.id] ?? 0
        const newValue = Math.min(current + amount, challenge.target)
        updatedProgress[challenge.id] = newValue

        if (newValue >= challenge.target && !updatedCompleted.includes(challenge.id)) {
          updatedCompleted = [...updatedCompleted, challenge.id]
        }
      })

      return {
        ...prev,
        dailyChallengeProgress: updatedProgress,
        completedDailyChallenges: updatedCompleted,
      }
    })
  }, [dailyChallenges])

  const svClaimDailyReward = useCallback((challengeId: string): boolean => {
    const challenge = dailyChallenges.find((c) => c.id === challengeId)
    if (!challenge) return false

    let success = false
    setSaveState((prev) => {
      if (!prev.completedDailyChallenges.includes(challengeId)) return prev

      success = true
      return {
        ...prev,
        shards: Math.min(prev.shards + challenge.reward.shards, SV_MAX_SHARDS),
        crests: Math.min(prev.crests + challenge.reward.crests, SV_MAX_CREST),
        totalXp: prev.totalXp + challenge.reward.xp,
        currentXp: svGetCurrentXpProgress(prev.totalXp + challenge.reward.xp),
        level: svGetLevelFromTotalXp(prev.totalXp + challenge.reward.xp),
      }
    })

    if (success) {
      const event: SvEvent = {
        id: svGenerateEventId(),
        type: 'daily_completed',
        message: `Daily challenge complete: ${challenge.name}! +${challenge.reward.crests} crests`,
        timestamp: Date.now(),
        metadata: { challengeId },
      }
      setGameState((g) => ({
        ...g,
        recentEvents: [event, ...g.recentEvents].slice(0, 50),
      }))
    }

    return success
  }, [dailyChallenges])

  const svGetDailyChallengeProgress = useCallback((challengeId: string): { current: number; target: number; complete: boolean } => {
    const challenge = dailyChallenges.find((c) => c.id === challengeId)
    if (!challenge) return { current: 0, target: 0, complete: false }
    const current = saveState.dailyChallengeProgress[challengeId] ?? 0
    return { current, target: challenge.target, complete: saveState.completedDailyChallenges.includes(challengeId) }
  }, [dailyChallenges, saveState.dailyChallengeProgress, saveState.completedDailyChallenges])

  // ============================================================
  // MINI-GAME SYSTEM
  // ============================================================

  const svRecordMiniGameScore = useCallback((gameId: string, score: number) => {
    const game = SV_MINI_GAMES.find((g) => g.id === gameId)
    if (!game) return

    setSaveState((prev) => {
      const bestScore = Math.max(prev.miniGameScores[gameId] ?? 0, score)
      const isNewBest = score > (prev.miniGameScores[gameId] ?? 0)

      return {
        ...prev,
        miniGameScores: { ...prev.miniGameScores, [gameId]: bestScore },
        shards: Math.min(prev.shards + game.rewards.shards, SV_MAX_SHARDS),
        crests: Math.min(prev.crests + game.rewards.crests, SV_MAX_CREST),
        totalXp: prev.totalXp + game.rewards.xp,
        currentXp: svGetCurrentXpProgress(prev.totalXp + game.rewards.xp),
        level: svGetLevelFromTotalXp(prev.totalXp + game.rewards.xp),
        resonancePoints: prev.resonancePoints + Math.floor(game.rewards.xp / 100),
      }
    })
  }, [])

  const svGetMiniGameBestScore = useCallback((gameId: string): number => {
    return saveState.miniGameScores[gameId] ?? 0
  }, [saveState.miniGameScores])

  const svGetAvailableMiniGames = useCallback((): SvMiniGame[] => {
    return SV_MINI_GAMES.filter((g) => g.unlockLevel <= saveState.level)
  }, [saveState.level])

  // ============================================================
  // SETTINGS
  // ============================================================

  const svUpdateSettings = useCallback((updates: Partial<SvSettings>) => {
    setSaveState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }))
  }, [])

  const svSetMusicVolume = useCallback((volume: number) => {
    svUpdateSettings({ musicVolume: Math.max(0, Math.min(1, volume)) })
  }, [svUpdateSettings])

  const svSetSfxVolume = useCallback((volume: number) => {
    svUpdateSettings({ sfxVolume: Math.max(0, Math.min(1, volume)) })
  }, [svUpdateSettings])

  const svSetColorTheme = useCallback((theme: SvSettings['colorTheme']) => {
    svUpdateSettings({ colorTheme: theme })
  }, [svUpdateSettings])

  // ============================================================
  // RESONANCE SYSTEM
  // ============================================================

  const svSpendResonance = useCallback((amount: number): boolean => {
    let success = false
    setSaveState((prev) => {
      if (prev.resonancePoints < amount) return prev
      success = true
      return { ...prev, resonancePoints: prev.resonancePoints - amount }
    })
    return success
  }, [])

  const svGetResonancePerLevel = useCallback((): number => {
    return SV_RESONANCE_PER_LEVEL
  }, [])

  const svGetMaxResonance = useCallback((): number => {
    return saveState.level * SV_RESONANCE_PER_LEVEL
  }, [saveState.level])

  const svGetResonanceProgress = useCallback((): { current: number; max: number; percentage: number } => {
    const max = svGetMaxResonance()
    return {
      current: saveState.resonancePoints,
      max,
      percentage: max > 0 ? Math.floor((saveState.resonancePoints / max) * 100) : 0,
    }
  }, [saveState.resonancePoints, svGetMaxResonance])

  // ============================================================
  // STATISTICS
  // ============================================================

  const svGetStats = useCallback(() => ({
    level: saveState.level,
    currentXp: saveState.currentXp,
    xpToNextLevel: svGetXpForNextLevel(saveState.level),
    totalXp: saveState.totalXp,
    crests: saveState.crests,
    shards: saveState.shards,
    totalDives: saveState.totalDives,
    totalTreasuresCollected: saveState.totalTreasuresCollected,
    totalSongsSung: saveState.totalSongsSung,
    totalCreaturesEncountered: saveState.totalCreaturesEncountered,
    maxDepthReached: saveState.maxDepthReached,
    dailyStreak: saveState.dailyStreak,
    comboMax: saveState.comboMax,
    totalTreasureValue: saveState.totalTreasureValue,
    achievementsUnlocked: saveState.unlockedAchievements.length,
    cavernsDiscovered: saveState.discoveredCaverns.length,
    uniqueTreasures: svGetUniqueTreasureCount(),
    bossesDefeated: saveState.defeatedBosses.length,
    resonancePoints: saveState.resonancePoints,
    resonanceMax: saveState.level * SV_RESONANCE_PER_LEVEL,
    isDiving: gameState.isDiving,
    currentCombo: gameState.currentCombo,
    currentDepth: gameState.currentDepth,
    playTimeMs: gameState.isDiving ? Date.now() - gameState.divingStartTime : 0,
  }), [saveState, gameState, svGetUniqueTreasureCount])

  const svGetLevelProgress = useCallback((): { level: number; currentXp: number; xpNeeded: number; percentage: number } => {
    const xpNeeded = svGetXpForNextLevel(saveState.level)
    return {
      level: saveState.level,
      currentXp: saveState.currentXp,
      xpNeeded: xpNeeded === Infinity ? 0 : xpNeeded,
      percentage: xpNeeded === Infinity ? 100 : Math.floor((saveState.currentXp / xpNeeded) * 100),
    }
  }, [saveState.level, saveState.currentXp])

  // ============================================================
  // DAMAGE / COMBAT
  // ============================================================

  const svTakeDamage = useCallback(() => {
    if (svHasActiveEffect('invincibility')) return

    setGameState((prev) => ({
      ...prev,
      damageTaken: true,
      currentCombo: 0,
    }))
  }, [svHasActiveEffect])

  // ============================================================
  // CREST DAILY BONUS
  // ============================================================

  const svClaimDailyCrests = useCallback((): boolean => {
    const today = svGetTodayDateString()
    if (saveState.lastPlayDate === today) return false

    setSaveState((prev) => ({
      ...prev,
      crests: Math.min(prev.crests + SV_CREST_PER_DAILY, SV_MAX_CREST),
      lastPlayDate: today,
    }))
    return true
  }, [saveState.lastPlayDate])

  // ============================================================
  // FULL RESET (state)
  // ============================================================

  const svResetState = useCallback(() => {
    svResetProgress()
    const fresh = svCreateDefaultSave()
    setSaveState(fresh)
    setGameState(svCreateDefaultGameState())
    setDailyChallenges(svGenerateDailyChallenges())
    lastSaveRef.current = null
  }, [])

  // ============================================================
  // EXPORT / IMPORT
  // ============================================================

  const svExportData = useCallback((): string => {
    return svExportSave()
  }, [])

  const svImportData = useCallback((json: string): boolean => {
    const result = svImportSave(json)
    if (result) {
      setSaveState(svLoadSave())
    }
    return result
  }, [])

  // ============================================================
  // COLOR THEME HELPERS
  // ============================================================

  const svGetThemeColors = useCallback((): { primary: string; secondary: string; accent: string; bg: string; surface: string; text: string; glow: string } => {
    const themes: Record<SvSettings['colorTheme'], { primary: string; secondary: string; accent: string; bg: string; surface: string; text: string; glow: string }> = {
      aqua: { primary: '#2dd4bf', secondary: '#06b6d4', accent: '#f472b6', bg: '#042f2e', surface: '#0d4f4a', text: '#ccfbf1', glow: '#2dd4bf40' },
      teal: { primary: '#14b8a6', secondary: '#0d9488', accent: '#fbbf24', bg: '#042f2e', surface: '#134e4a', text: '#99f6e4', glow: '#14b8a640' },
      coral: { primary: '#fb7185', secondary: '#f472b6', accent: '#2dd4bf', bg: '#4c0519', surface: '#881337', text: '#ffe4e6', glow: '#fb718540' },
      abyss: { primary: '#22d3ee', secondary: '#38bdf8', accent: '#a78bfa', bg: '#0c0a1d', surface: '#1e1b4b', text: '#e0e7ff', glow: '#22d3ee40' },
      bioluminescent: { primary: '#34d399', secondary: '#a78bfa', accent: '#f472b6', bg: '#022c22', surface: '#064e3b', text: '#d1fae5', glow: '#34d39940' },
    }
    return themes[saveState.settings.colorTheme] ?? themes.aqua
  }, [saveState.settings.colorTheme])

  const svGetRarityColor = useCallback((rarity: number): string => {
    return SV_RARITY_TIERS[rarity]?.color ?? '#7ecfc0'
  }, [])

  const svGetRarityGlow = useCallback((rarity: number): string => {
    return SV_RARITY_TIERS[rarity]?.glow ?? '#2dd4bf40'
  }, [])

  // ============================================================
  // RANDOM GENERATORS (weighted, contextual)
  // ============================================================

  const svGetRandomTreasureForCavern = useCallback((cavernId: string): SvTreasure | null => {
    const pool = svGetCavernTreasurePool(cavernId)
    if (pool.length === 0) return null

    const weights = pool.map((t) => {
      const rarityWeight = [10, 6, 3, 1.5, 0.3][t.rarity] ?? 1
      const depthBonus = saveState.maxDepthReached / 100
      return rarityWeight * (1 + depthBonus * 0.1)
    })
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    let roll = Math.random() * totalWeight

    for (let i = 0; i < pool.length; i++) {
      roll -= weights[i]
      if (roll <= 0) return pool[i]
    }
    return pool[pool.length - 1]
  }, [saveState.maxDepthReached])

  const svGetRandomCreatureForCavern = useCallback((cavernId: string): SvCreature | null => {
    const pool = svGetCavernCreatures(cavernId)
    if (pool.length === 0) return null

    const weights = pool.map((c) => {
      const rarityWeight = [10, 5, 2.5, 1, 0.2][c.rarity] ?? 1
      return rarityWeight
    })
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    let roll = Math.random() * totalWeight

    for (let i = 0; i < pool.length; i++) {
      roll -= weights[i]
      if (roll <= 0) return pool[i]
    }
    return pool[pool.length - 1]
  }, [])

  const svGetRandomSong = useCallback((): SvSong | null => {
    const available = svGetAvailableSongs(saveState.level)
    if (available.length === 0) return null
    return available[Math.floor(Math.random() * available.length)]
  }, [saveState.level])

  // ============================================================
  // EVENT SYSTEM
  // ============================================================

  const svGetRecentEvents = useCallback((): SvEvent[] => {
    return gameState.recentEvents
  }, [gameState.recentEvents])

  const svClearEvents = useCallback(() => {
    setGameState((prev) => ({ ...prev, recentEvents: [] }))
  }, [])

  const svAddCustomEvent = useCallback((type: SvEvent['type'], message: string, metadata?: Record<string, unknown>) => {
    const event: SvEvent = {
      id: svGenerateEventId(),
      type,
      message,
      timestamp: Date.now(),
      metadata,
    }
    setGameState((prev) => ({
      ...prev,
      recentEvents: [event, ...prev.recentEvents].slice(0, 50),
    }))
  }, [])

  // ============================================================
  // TUTORIAL / ONBOARDING
  // ============================================================

  const svGetTutorialStep = useCallback((): number => {
    if (saveState.totalDives === 0) return 0
    if (saveState.totalTreasuresCollected === 0) return 1
    if (saveState.learnedSongs.length <= 3) return 2
    if (saveState.encounteredCreatures.length === 0) return 3
    if (saveState.discoveredCaverns.length <= 1) return 4
    return 5
  }, [saveState])

  // ============================================================
  // COMPUTED: available songs count
  // ============================================================

  const svGetLearnableSongCount = useCallback((): number => {
    return SV_SONGS.filter((s) => s.unlockLevel <= saveState.level && !saveState.learnedSongs.includes(s.id)).length
  }, [saveState.level, saveState.learnedSongs])

  const svGetSongCollectionProgress = useCallback((): { learned: number; total: number; percentage: number } => {
    return {
      learned: saveState.learnedSongs.length,
      total: SV_SONGS.length,
      percentage: Math.floor((saveState.learnedSongs.length / SV_SONGS.length) * 100),
    }
  }, [saveState.learnedSongs])

  // ============================================================
  // TIME FORMATTING
  // ============================================================

  const svFormatDuration = useCallback((ms: number): string => {
    if (ms < 1000) return `${ms}ms`
    const seconds = Math.floor(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }, [])

  const svFormatNumber = useCallback((num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }, [])

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // ---- Constants exposed for UI ----
    SV_MAX_LEVEL,
    SV_XP_TABLE,
    SV_RARITY_TIERS,
    SV_SONGS,
    SV_TREASURES,
    SV_CAVERNS,
    SV_CREATURES,
    SV_TITLES,
    SV_ACHIEVEMENTS,
    SV_POWER_UPS,
    SV_MINI_GAMES,

    // ---- State ----
    isLoaded,
    saveState,
    gameState,
    dailyChallenges,

    // ---- Core ----
    svAddXp,
    svAddCrests,
    svSpendCrests,
    svAddShards,
    svSpendShards,
    svGetStats,
    svGetLevelProgress,
    svFormatDuration,
    svFormatNumber,

    // ---- Diving ----
    svStartDive,
    svEndDive,
    svChangeDepth,
    svTakeDamage,

    // ---- Treasures ----
    svCollectTreasure,
    svGetTreasureInfo,
    svGetCollectedCount,
    svGetUniqueTreasureCount,
    svGetTotalCollectionProgress,
    svGetRandomTreasureForCavern,

    // ---- Songs ----
    svLearnSong,
    svSingSong,
    svGetSongInfo,
    svIsSongLearned,
    svCanLearnSong,
    svGetRandomSong,
    svGetSongCollectionProgress,
    svGetLearnableSongCount,
    svGetAvailableSongs: useCallback(() => svGetAvailableSongs(saveState.level), [saveState.level]),

    // ---- Creatures ----
    svEncounterCreature,
    svDefeatCreature,
    svGetCreatureInfo,
    svHasEncounteredCreature,
    svGetBestiaryProgress,
    svGetRandomCreatureForCavern,

    // ---- Combos ----
    svGetComboMultiplier,
    svResetCombo,
    svIncrementCombo,

    // ---- Power-ups ----
    svActivatePowerUp,
    svHasActiveEffect,
    svGetActiveEffects,
    svGetEffectRemaining,

    // ---- Achievements ----
    svCheckAchievements,
    svUnlockAchievements,
    svIsAchievementUnlocked,
    svGetAchievementProgress,

    // ---- Titles ----
    svSetActiveTitle,
    svPurchaseTitle,
    svGetCurrentTitle,
    svCanPurchaseTitle,
    svGetNextTitle: useCallback(() => svGetNextTitle(saveState.activeTitle, saveState.level, saveState.unlockedAchievements.length), [saveState.activeTitle, saveState.level, saveState.unlockedAchievements.length]),

    // ---- Daily Challenges ----
    svUpdateDailyProgress,
    svClaimDailyReward,
    svGetDailyChallengeProgress,
    svClaimDailyCrests,

    // ---- Mini-Games ----
    svRecordMiniGameScore,
    svGetMiniGameBestScore,
    svGetAvailableMiniGames,

    // ---- Resonance ----
    svSpendResonance,
    svGetResonancePerLevel,
    svGetMaxResonance,
    svGetResonanceProgress,

    // ---- Settings ----
    svUpdateSettings,
    svSetMusicVolume,
    svSetSfxVolume,
    svSetColorTheme,

    // ---- Events ----
    svGetRecentEvents,
    svClearEvents,
    svAddCustomEvent,

    // ---- Theme ----
    svGetThemeColors,
    svGetRarityColor,
    svGetRarityGlow,

    // ---- Cavern helpers ----
    svGetCavernTreasurePool,
    svGetCavernCreatures,
    svGetUnlockedCaverns: useCallback(() => svGetUnlockedCaverns(saveState.level), [saveState.level]),

    // ---- Tutorial ----
    svGetTutorialStep,

    // ---- Save management ----
    svResetState,
    svResetProgress,
    svExportData,
    svImportData,
  }
}
