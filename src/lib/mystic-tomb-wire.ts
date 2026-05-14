/**
 * Mystic Tomb Wire — 神秘古墓 (Mystic Tomb) feature module for Word Snake
 *
 * An ancient tomb exploration and management mini-game: explore 8 tomb chambers,
 * collect 30 ancient relics, summon 35 tomb guardians, build 25 tomb structures,
 * decipher 15 hieroglyphic puzzles, navigate 12 deadly traps, wield 22 curse/blessing
 * abilities, and earn 8 titles from Tomb Raider to Immortal Pharaoh — backed by a
 * Zustand store with persist middleware.
 *
 * Storage key: mystic-tomb-wire
 * Prefix: mt / MT_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type MTRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type MTGuardianType = 'Mummy' | 'Skeleton' | 'Golem' | 'Wraith' | 'Basilisk' | 'Sphinx' | 'Scarab'
export type MTRelicOrigin = 'Egyptian' | 'Mayan' | 'Aztec' | 'Chinese'

export interface MTGuardianDef {
  readonly id: string
  readonly name: string
  readonly rarity: MTRarity
  readonly type: MTGuardianType
  readonly basePower: number
  readonly ability: string
  readonly description: string
}

export interface MTChamberDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly depth: number
  readonly minLevel: number
  readonly rewards: string[]
}

export interface MTRelicDef {
  readonly id: string
  readonly name: string
  readonly rarity: MTRarity
  readonly origin: MTRelicOrigin
  readonly description: string
  readonly value: number
}

export interface MTStructureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly costMultiplier: number
}

export interface MTStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  built: boolean
}

export interface MTAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly type: 'curse' | 'blessing'
}

export interface MTAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface MTTitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredChambers: number
}

export interface MTGlyphDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly symbols: string[]
  readonly translation: string
  readonly reward: string
  readonly difficulty: number
}

export interface MTTrapDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly dangerLevel: number
  readonly reward: string
  readonly avoidMethod: string
}

export interface MTGuardianInstance {
  readonly id: string
  guardianDefId: string
  name: string
  level: number
  currentHP: number
  maxHP: number
  attack: number
  defense: number
  summonedAt: number
}

export interface MTStoreState {
  exploredChambers: string[]
  collectedRelics: Record<string, number>
  guardians: MTGuardianInstance[]
  structures: MTStructureInstance[]
  decipheredGlyphs: string[]
  disarmedTraps: string[]
  activatedCurses: string[]
  activeBlessings: string[]
  achievements: string[]
  currentTitle: string
  tombLevel: number
  tombExp: number
  gold: number
  anima: number
  totalRelicsCollected: number
  totalChambersExplored: number
  totalGlyphsDeciphered: number
  totalTrapsDisarmed: number
  totalGuardiansSummoned: number
  activeChamberId: string | null
  sealedChambers: string[]
}

export interface MTStoreActions {
  mtExploreChamber: (chamberId: string) => boolean
  mtDecipherGlyph: (glyphId: string) => boolean
  mtCollectRelic: (relicId: string) => number
  mtDisarmTrap: (trapId: string) => boolean
  mtUseAbility: (abilityId: string) => boolean
  mtSummonGuardian: (guardianId: string) => boolean
  mtActivateCurse: (abilityId: string) => boolean
  mtBlessArtifact: (relicId: string) => boolean
  mtOpenSarcophagus: (chamberId: string) => boolean
  mtSealChamber: (chamberId: string) => boolean
}

export type MTFullStore = MTStoreState & MTStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const MT_COLOR_SANDSTONE_GOLD: string = '#D4A574'
export const MT_COLOR_ANCIENT_BRONZE: string = '#CD7F32'
export const MT_COLOR_PAPYRUS_CREAM: string = '#F5F0E1'
export const MT_COLOR_LAPIS_LAZULI: string = '#26619C'
export const MT_COLOR_OBSIDIAN_BLACK: string = '#0A0A0A'
export const MT_COLOR_SCARLET_RED: string = '#DC143C'
export const MT_COLOR_JADE_GREEN: string = '#00A86B'
export const MT_COLOR_MOONLIGHT_SILVER: string = '#C0C0C0'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: XP & LEVEL HELPERS
// ═══════════════════════════════════════════════════════════════════

const MT_MAX_LEVEL = 50
const MT_INITIAL_GOLD = 200
const MT_INITIAL_ANIMA = 50
const MT_MAX_ANIMA = 500

function mtXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= MT_MAX_LEVEL) return Infinity
  return Math.floor(85 * Math.pow(1.14, level) + level * 18)
}

function mtLevelFromXp(totalXp: number): number {
  let level = 1
  let xpRemaining = totalXp
  while (level < MT_MAX_LEVEL) {
    const needed = mtXpForLevel(level)
    if (xpRemaining < needed) break
    xpRemaining -= needed
    level++
  }
  return level
}

function mtGenerateId(): string {
  return `mt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function mtRarityPower(rarity: MTRarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.4
    case 'rare': return 2.0
    case 'epic': return 3.2
    case 'legendary': return 5.5
  }
}

function mtGetRarityColor(rarity: MTRarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#22D3EE'
    case 'rare': return '#A78BFA'
    case 'epic': return '#F472B6'
    case 'legendary': return '#FBBF24'
  }
}

function mtGetGuardianTypeColor(type: MTGuardianType): string {
  switch (type) {
    case 'Mummy': return MT_COLOR_SANDSTONE_GOLD
    case 'Skeleton': return MT_COLOR_MOONLIGHT_SILVER
    case 'Golem': return MT_COLOR_ANCIENT_BRONZE
    case 'Wraith': return MT_COLOR_LAPIS_LAZULI
    case 'Basilisk': return MT_COLOR_JADE_GREEN
    case 'Sphinx': return MT_COLOR_PAPYRUS_CREAM
    case 'Scarab': return MT_COLOR_SCARLET_RED
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: MT_CHAMBERS — 8 Tomb Chambers
// ═══════════════════════════════════════════════════════════════════

export const MT_CHAMBERS: readonly MTChamberDef[] = [
  {
    id: 'sandstone_entry',
    name: 'Sandstone Entry Hall',
    description:
      'A grand corridor of weathered sandstone blocks leading into the tomb. Torch sconces line the walls, their flames flickering with an unnatural blue hue. Hieroglyphs recount the deeds of forgotten pharaohs carved into every surface.',
    depth: 10,
    minLevel: 1,
    rewards: ['dusty_scarab_amulet', 'papyrus_scrap', 'sandstone_fragment', 'copper_ankh'],
  },
  {
    id: 'scarab_passage',
    name: 'Scarab Beetle Passage',
    description:
      'A narrow tunnel adorned with thousands of carved scarab beetles in flight. The walls hum with ancient energy, and the floor is inscribed with protective wards. Small real scarabs scurry in the shadows, guarding hidden niches of treasure.',
    depth: 50,
    minLevel: 3,
    rewards: ['scarab_carapace', 'jade_beetle', 'ward_stone', 'ancient_incense'],
  },
  {
    id: 'riddle_antechamber',
    name: 'Sphinx Riddle Antechamber',
    description:
      'A circular room where a massive Sphinx statue guards the way forward. Its stone eyes follow your every movement, and its mouth is eternally poised to speak an unsolved riddle. Correctly answering unlocks the path deeper into the tomb.',
    depth: 120,
    minLevel: 6,
    rewards: ['sphinx_whisper_stone', 'riddle_scroll', 'enigma_gem', 'wisdom_mask'],
  },
  {
    id: 'lapis_vault',
    name: 'Lapis Lazuli Treasury Vault',
    description:
      'A breathtaking vault whose walls and ceiling are covered in deep blue lapis lazuli inlays, dotted with gold stars representing the night sky. Golden chests line the perimeter, each sealed with a different magical lock requiring ancient knowledge to open.',
    depth: 200,
    minLevel: 10,
    rewards: ['lapis_pendant', 'star_map_tablet', 'golden_lock_pick', 'midnight_sapphire'],
  },
  {
    id: 'mummy_crypt',
    name: 'Mummification Crypt',
    description:
      'The sacred chamber where the pharaoh\'s servants were prepared for the afterlife. Canopic jars line alcoves in the walls, and linen-wrapped figures stand motionless in niches. The air is thick with the scent of natron and cedar resin.',
    depth: 300,
    minLevel: 15,
    rewards: ['canopic_jar_fragment', 'linen_of_ages', 'natron_crystal', 'cedar_heart_amulet'],
  },
  {
    id: 'cursed_sanctum',
    name: 'Cursed Sanctum of Shadows',
    description:
      'A chamber shrouded in perpetual darkness where ancient curses were sealed away. Eerie green light pulses from ritual circles etched into the floor. The walls whisper warnings in forgotten tongues, and the temperature drops with every step inward.',
    depth: 400,
    minLevel: 20,
    rewards: ['curse_tablet', 'shadow_essence', 'dark_mirror_shard', 'ward_breaker_sigil'],
  },
  {
    id: 'pharaoh_throne',
    name: 'Pharaoh\'s Throne Room',
    description:
      'The heart of the tomb — an opulent chamber with a massive golden throne atop a raised dais. The walls depict the pharaoh\'s victories in vivid pigments that still glow after millennia. This room pulses with the concentrated anima of a thousand sacrifices.',
    depth: 500,
    minLevel: 28,
    rewards: ['pharaoh_crown_shard', 'throne_gem', 'royal_scepter_piece', 'eternal_flame_vial'],
  },
  {
    id: 'immortal_sarcophagus',
    name: 'Immortal Sarcophagus Chamber',
    description:
      'The deepest and most sacred chamber, where the pharaoh\'s sarcophagus rests on an altar of pure obsidian. The sarcophagus radiates a blinding golden light, and the air crackles with immortal energy. Only the most worthy tomb raiders may approach.',
    depth: 666,
    minLevel: 35,
    rewards: ['immortal_pharaoh_mask', 'obsidian_heart', 'soul_caught_gem', 'genesis_hieroglyph'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: MT_GUARDIANS — 35 Tomb Guardians (7 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const MT_GUARDIANS: readonly MTGuardianDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'dust_scarab',
    name: 'Dust Scarab',
    rarity: 'common',
    type: 'Scarab',
    basePower: 15,
    ability: 'dust_swarm',
    description:
      'A small beetle animated by residual tomb magic. It gathers dust into swirling clouds that blind intruders and obscure hidden passages.',
  },
  {
    id: 'bone_rat',
    name: 'Bone Rat Skeleton',
    rarity: 'common',
    type: 'Skeleton',
    basePower: 18,
    ability: 'bone_scatter',
    description:
      'A skeletal rat that scurries through the tomb walls. It can disassemble and reassemble itself at will, making it impossible to trap.',
  },
  {
    id: 'linen_mummy',
    name: 'Linen-Wrapped Mummy',
    rarity: 'common',
    type: 'Mummy',
    basePower: 20,
    ability: 'bandage_bind',
    description:
      'A low-ranking servant mummy wrapped in rotting linen. Its bandages extend like tentacles to restrain anyone who disturbs its eternal rest.',
  },
  {
    id: 'clay_golem',
    name: 'Clay Guardian Golem',
    rarity: 'common',
    type: 'Golem',
    basePower: 22,
    ability: 'mud_wall',
    description:
      'A crude humanoid figure sculpted from Nile clay. It crumbles and reforms endlessly, blocking corridors with walls of hardened mud.',
  },
  {
    id: 'faint_wraith',
    name: 'Faint Tomb Wraith',
    rarity: 'common',
    type: 'Wraith',
    basePower: 16,
    ability: 'ghost_flicker',
    description:
      'A barely visible spirit drifting through the tomb corridors. It causes torches to sputter and extinguish, plunging areas into darkness.',
  },
  {
    id: 'sand_viper',
    name: 'Sand Basilisk Hatchling',
    rarity: 'common',
    type: 'Basilisk',
    basePower: 19,
    ability: 'sand_spit',
    description:
      'A juvenile basilisk that burrows through sand and stone. Its gaze is too weak to petrify, but it can spit blinding sand at intruders.',
  },
  {
    id: 'stone_sphinx_cub',
    name: 'Stone Sphinx Cub',
    rarity: 'common',
    type: 'Sphinx',
    basePower: 17,
    ability: 'riddle_taunt',
    description:
      'A small sphinx statue that comes to life when approached. It poses simple riddles; wrong answers cause the ceiling to crumble slightly.',
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'golden_scarab',
    name: 'Golden Scarab Sentinel',
    rarity: 'uncommon',
    type: 'Scarab',
    basePower: 35,
    ability: 'golden_shell_reflect',
    description:
      'A scarab with a shell of pure gold that reflects magical attacks. It rolls into a near-invulnerable sphere when threatened, crushing anything in its path.',
  },
  {
    id: 'skeletal_archer',
    name: 'Skeletal Tomb Archer',
    rarity: 'uncommon',
    type: 'Skeleton',
    basePower: 32,
    ability: 'bone_arrow_barrage',
    description:
      'An archer skeleton that fires arrows made from its own fused ribs. The arrows regenerate instantly, allowing for an endless barrage of bone projectiles.',
  },
  {
    id: 'royal_mummy',
    name: 'Royal Servant Mummy',
    rarity: 'uncommon',
    type: 'Mummy',
    basePower: 38,
    ability: 'death_gas_cloud',
    description:
      'A mummy of a royal attendant preserved with exotic herbs. When disturbed, it releases a cloud of toxic preservation gases that weaken all nearby living creatures.',
  },
  {
    id: 'limestone_golem',
    name: 'Limestone Enforcer Golem',
    rarity: 'uncommon',
    type: 'Golem',
    basePower: 40,
    ability: 'stone_fists',
    description:
      'A larger golem carved from tomb limestone blocks. Its fists can shatter weapons and crack the floor, creating impassable fissures in the stone.',
  },
  {
    id: 'shadow_wraith',
    name: 'Shadow Wraith',
    rarity: 'uncommon',
    type: 'Wraith',
    basePower: 30,
    ability: 'shadow_step',
    description:
      'A wraith that moves through shadows cast by torchlight. It can teleport between any two shadows in the tomb, striking from impossible angles.',
  },
  {
    id: 'desert_basilisk',
    name: 'Desert Basilisk',
    rarity: 'uncommon',
    type: 'Basilisk',
    basePower: 36,
    ability: 'partial_petrify',
    description:
      'A basilisk whose gaze can temporarily slow the movement of living creatures. Prolonged exposure causes limbs to stiffen and crack like stone.',
  },
  {
    id: 'riddling_sphinx',
    name: 'Riddling Sphinx Statue',
    rarity: 'uncommon',
    type: 'Sphinx',
    basePower: 33,
    ability: 'mind_puzzle',
    description:
      'A sphinx that poses complex riddles involving ancient history and mathematics. Those who fail lose their sense of direction in the tomb for hours.',
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'ruby_scarab',
    name: 'Ruby-Backed Scarab King',
    rarity: 'rare',
    type: 'Scarab',
    basePower: 60,
    ability: 'gem_storm',
    description:
      'The king of all scarabs in the tomb, with a shell encrusted with rubies. It commands lesser scarabs and can launch ruby shards like explosive projectiles.',
  },
  {
    id: 'skeletal_champion',
    name: 'Skeletal Champion Warrior',
    rarity: 'rare',
    type: 'Skeleton',
    basePower: 55,
    ability: 'bone_army_summon',
    description:
      'An elite skeleton warrior wearing ancient bronze armor. It can summon a squad of lesser skeletons from the tomb walls to fight alongside it.',
  },
  {
    id: 'high_priest_mummy',
    name: 'High Priest Mummy',
    rarity: 'rare',
    type: 'Mummy',
    basePower: 65,
    ability: 'ancient_curse_channel',
    description:
      'A mummy of a high priest who served the pharaoh in life. It channels powerful curses through ritual gestures, causing plagues of locusts and sandstorms.',
  },
  {
    id: 'granite_golem',
    name: 'Granite Colossus Golem',
    rarity: 'rare',
    type: 'Golem',
    basePower: 70,
    ability: 'earthquake_slam',
    description:
      'A towering golem of polished granite that guards the inner chambers. Its footsteps cause minor earthquakes, and it can reshape walls with a single punch.',
  },
  {
    id: 'vengeful_wraith',
    name: 'Vengeful Tomb Wraith',
    rarity: 'rare',
    type: 'Wraith',
    basePower: 58,
    ability: 'spirit_chain',
    description:
      'The spirit of a tomb robber who was cursed for his greed. It binds intruders with spectral chains that drain their life force while they struggle.',
  },
  {
    id: 'cobra_basilisk',
    name: 'Cobra Basilisk',
    rarity: 'rare',
    type: 'Basilisk',
    basePower: 62,
    ability: 'venomous_stone_gaze',
    description:
      'A basilisk with cobra-like features whose gaze carries both petrification and deadly venom. Even a glimpse causes the skin to harden and veins to turn to stone.',
  },
  {
    id: 'grand_sphinx',
    name: 'Grand Sphinx Guardian',
    rarity: 'rare',
    type: 'Sphinx',
    basePower: 56,
    ability: 'reality_riddle',
    description:
      'A large sphinx whose riddles bend reality itself. Wrong answers cause the fabric of the tomb to warp, trapping intruders in repeating labyrinthine loops.',
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'obsidian_scarab',
    name: 'Obsidian Scarab Swarm Lord',
    rarity: 'epic',
    type: 'Scarab',
    basePower: 100,
    ability: 'obsidian_plague',
    description:
      'A massive scarab made of volcanic obsidian that commands a swarm of thousands. The swarm can devour any organic or inorganic material in minutes, leaving only polished obsidian behind.',
  },
  {
    id: 'lich_skeleton',
    name: 'Lich-Bound Skeleton Lord',
    rarity: 'epic',
    type: 'Skeleton',
    basePower: 95,
    ability: 'necrotic_blast',
    description:
      'A skeleton infused with lich energy from a dark ritual. Its bones glow with green necrotic fire, and it can fire devastating blasts of undeath energy.',
  },
  {
    id: 'pharaoh_mummy',
    name: 'Pharaoh\'s Chosen Mummy',
    rarity: 'epic',
    type: 'Mummy',
    basePower: 110,
    ability: 'solar_wrath',
    description:
      'A mummy of the pharaoh\'s most trusted general, preserved with a fragment of the sun god\'s power. Its wrappings burn with golden flames that sear the undead and living alike.',
  },
  {
    id: 'basalt_golem',
    name: 'Basalt Immortal Golem',
    rarity: 'epic',
    type: 'Golem',
    basePower: 120,
    ability: 'unstoppable_charge',
    description:
      'An enormous golem of dense volcanic basalt that has stood guard for millennia without tiring. It cannot be stopped by any physical force once it begins charging.',
  },
  {
    id: 'phantom_wraith',
    name: 'Phantom Wraith Sovereign',
    rarity: 'epic',
    type: 'Wraith',
    basePower: 90,
    ability: 'void_consumption',
    description:
      'The most powerful wraith in the tomb, born from the accumulated suffering of thousands of sacrificed prisoners. It can consume light and life from a vast radius.',
  },
  {
    id: 'apex_basilisk',
    name: 'Apex Basilisk Monarch',
    rarity: 'epic',
    type: 'Basilisk',
    basePower: 105,
    ability: 'total_petrification',
    description:
      'The ancient basilisk that has lived in the tomb since its construction. Its gaze can permanently petrify any living creature, turning them into stone statues that join its collection.',
  },
  {
    id: 'ancient_sphinx',
    name: 'Ancient Sphinx Oracle',
    rarity: 'epic',
    type: 'Sphinx',
    basePower: 88,
    ability: 'prophecy_enforcement',
    description:
      'The oldest sphinx in the tomb, granted the power of prophecy by the gods. Its riddles foretell the future, and it can enforce its prophecies with divine power.',
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'scarab_god',
    name: 'Khepri the Scarab God',
    rarity: 'legendary',
    type: 'Scarab',
    basePower: 150,
    ability: 'solar_rebirth',
    description:
      'The divine scarab god Khepri, who rolls the sun across the sky each dawn. In the tomb, it commands all insects and can resurrect fallen allies by rolling them back from death.',
  },
  {
    id: 'death_skeleton',
    name: 'Anubis Bone Avatar',
    rarity: 'legendary',
    type: 'Skeleton',
    basePower: 145,
    ability: 'judgment_of_the_dead',
    description:
      'A skeletal avatar of Anubis, god of the dead. It judges all who enter the tomb, weighing their heart against the feather of Ma\'at. Those found wanting are dragged into the underworld.',
  },
  {
    id: 'osiris_mummy',
    name: 'Osiris-Reborn Eternal Mummy',
    rarity: 'legendary',
    type: 'Mummy',
    basePower: 148,
    ability: 'resurrection_cycle',
    description:
      'A mummy infused with a fragment of Osiris, god of resurrection. It cannot be permanently destroyed, returning to unlife after each defeat more powerful than before.',
  },
  {
    id: 'titan_golem',
    name: 'The Tomb Titan Golem',
    rarity: 'legendary',
    type: 'Golem',
    basePower: 150,
    ability: 'tomb_collapse',
    description:
      'A golem so massive it IS the tomb itself. Its body is composed of the entire tomb structure. When it moves, entire chambers shift and collapse, reshaping the labyrinth around intruders.',
  },
  {
    id: 'death_wraith',
    name: 'Set\'s Shadow Wraith',
    rarity: 'legendary',
    type: 'Wraith',
    basePower: 140,
    ability: 'chaos_storm',
    description:
      'A wraith born from the god Set\'s shadow, cast into the tomb during a divine conflict. It embodies chaos and can unleash storms of sand, darkness, and serpent energy simultaneously.',
  },
  {
    id: 'phoenix_basilisk',
    name: 'Bennu Basilisk Hybrid',
    rarity: 'legendary',
    type: 'Basilisk',
    basePower: 147,
    ability: 'creation_gaze',
    description:
      'A being of impossible origin — part basilisk, part phoenix. Its gaze does not petrify but transmutes, turning stone into gold, enemies into allies, and death into new life.',
  },
  {
    id: 'great_sphinx',
    name: 'The Great Sphinx of Eternity',
    rarity: 'legendary',
    type: 'Sphinx',
    basePower: 150,
    ability: 'omniscient_riddle',
    description:
      'The original Sphinx, older than the tomb itself, who chose to dwell here to guard the deepest secrets of existence. Its riddle, if answered, grants dominion over life and death.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: MT_RELICS — 30 Ancient Relics
// ═══════════════════════════════════════════════════════════════════

export const MT_RELICS: readonly MTRelicDef[] = [
  // Egyptian (8)
  { id: 'dusty_scarab_amulet', name: 'Dusty Scarab Amulet', rarity: 'common', origin: 'Egyptian', description: 'A simple clay amulet shaped like a scarab beetle, worn by tomb workers for protection. Still carries a faint protective enchantment.', value: 5 },
  { id: 'papyrus_scrap', name: 'Ancient Papyrus Scrap', rarity: 'common', origin: 'Egyptian', description: 'A fragment of papyrus containing part of a funerary text. The hieratic script is faded but still legible to a trained eye.', value: 8 },
  { id: 'copper_ankh', name: 'Copper Ankh Pendant', rarity: 'common', origin: 'Egyptian', description: 'A small ankh made of oxidized copper. The symbol of eternal life, it hums with residual magical energy when held near the heart.', value: 10 },
  { id: 'sphinx_whisper_stone', name: 'Sphinx Whisper Stone', rarity: 'uncommon', origin: 'Egyptian', description: 'A smooth stone carved with a sphinx face that whispers riddles when held to the ear. Answering correctly reveals hidden tomb passages.', value: 35 },
  { id: 'lapis_pendant', name: 'Lapis Lazuli Pendant', rarity: 'uncommon', origin: 'Egyptian', description: 'A deep blue lapis lazuli gem set in a gold pendant, inscribed with protective hieroglyphs. Glows softly in darkness.', value: 40 },
  { id: 'canopic_jar_fragment', name: 'Canopic Jar Fragment', rarity: 'rare', origin: 'Egyptian', description: 'A piece of a canopic jar used to store organs during mummification. The fragment still contains traces of preservation magic.', value: 150 },
  { id: 'pharaoh_crown_shard', name: 'Pharaoh Crown Shard', rarity: 'epic', origin: 'Egyptian', description: 'A fragment of the pharaoh\'s golden crown, inlaid with lapis lazuli and turquoise. Radiates divine authority that commands lesser tomb guardians.', value: 600 },
  { id: 'immortal_pharaoh_mask', name: 'Immortal Pharaoh Death Mask', rarity: 'legendary', origin: 'Egyptian', description: 'The golden death mask of the pharaoh, crafted to house his immortal soul. To wear it is to glimpse the afterlife and command the dead.', value: 5000 },

  // Mayan (7)
  { id: 'jade_beetle', name: 'Jade Ritual Beetle', rarity: 'common', origin: 'Mayan', description: 'A small jade carving of a beetle used in Mayan blood rituals. The green stone is warm to the touch and pulses with earth energy.', value: 12 },
  { id: 'obsidian_blade_shard', name: 'Obsidian Ritual Blade Shard', rarity: 'common', origin: 'Mayan', description: 'A fragment of a ceremonial obsidian blade used in sacred temple rites. The edges are impossibly sharp and seem to cut through magical barriers.', value: 9 },
  { id: 'jade_death_mask_fragment', name: 'Jade Death Mask Fragment', rarity: 'uncommon', origin: 'Mayan', description: 'A piece of a jade mosaic death mask from a Mayan king\'s tomb. The jade pieces shift and rearrange themselves when no one is looking.', value: 45 },
  { id: 'cenote_crystal', name: 'Cenote Sacred Crystal', rarity: 'uncommon', origin: 'Mayan', description: 'A crystal retrieved from a sacred cenote, used by Mayan priests to commune with the gods of the underworld. It glows with eerie underwater light.', value: 38 },
  { id: 'calendar_stone_piece', name: 'Calendar Stone Fragment', rarity: 'rare', origin: 'Mayan', description: 'A segment of the famous Mayan calendar stone. The carved glyphs seem to move and change, predicting cosmic events that have not yet occurred.', value: 130 },
  { id: 'quetzal_feather_crest', name: 'Quetzal Feather Crest', rarity: 'epic', origin: 'Mayan', description: 'A headdress crest made from the iridescent feathers of the sacred quetzal bird. Wearing it grants the ability to understand the language of all birds.', value: 550 },
  { id: 'kinich_ahau_mirror', name: 'Kinich Ahau Sun Mirror', rarity: 'legendary', origin: 'Mayan', description: 'A mirror made from polished pyrite that once belonged to the sun god\'s high priest. It reflects not light, but the true nature of any soul it gazes upon.', value: 4500 },

  // Aztec (7)
  { id: 'turquoise_mosaic', name: 'Turquoise Mosaic Tile', rarity: 'common', origin: 'Aztec', description: 'A small turquoise tile from a larger ceremonial mosaic. The stone vibrates with the war drums of ancient Tenochtitlan.', value: 7 },
  { id: 'obsidian_mirror_shard', name: 'Tezcatlipoca Mirror Shard', rarity: 'common', origin: 'Aztec', description: 'A shard from the smoking mirror of Tezcatlipoca, god of the night sky. Staring into it reveals glimpses of alternate futures.', value: 11 },
  { id: 'eagle_warrior_vessel', name: 'Eagle Warrior Ceremonial Vessel', rarity: 'uncommon', origin: 'Aztec', description: 'A ceramic vessel shaped like an eagle warrior\'s head, used to hold ritual offerings. The painted eyes track movement in the room.', value: 32 },
  { id: 'xipe_totec_mask', name: 'Xipe Totec Ceremonial Mask', rarity: 'uncommon', origin: 'Aztec', description: 'A mask depicting the flayed god Xipe Totec. When worn, the wearer sheds their skin metaphorically, gaining resistance to physical damage.', value: 42 },
  { id: 'sun_stone_obsidian', name: 'Sun Stone Obsidian Core', rarity: 'rare', origin: 'Aztec', description: 'The obsidian core extracted from the center of a sun stone calendar. It contains concentrated solar energy from the five Aztec suns.', value: 160 },
  { id: 'quetzalcoatl_feather', name: 'Quetzalcoatl Feather of Creation', rarity: 'epic', origin: 'Aztec', description: 'A single feather from the feathered serpent god Quetzalcoatl. It glows with creation energy and can bring small objects to life.', value: 620 },
  { id: 'tezcatlipoca_heart', name: 'Tezcatlipoca\'s Smoking Heart', rarity: 'legendary', origin: 'Aztec', description: 'The crystallized heart of the night god, beating with dark smoke and starlight. Possessing it grants power over all mirrors and reflections.', value: 4800 },

  // Chinese (8)
  { id: 'jade_dragon_tab', name: 'Jade Dragon Tablet', rarity: 'common', origin: 'Chinese', description: 'A small jade tablet carved with a coiling dragon, used by scholars to ward off evil spirits. The dragon\'s eyes glow faintly red at night.', value: 6 },
  { id: 'bronze_mirror_disc', name: 'Bronze Divination Mirror', rarity: 'common', origin: 'Chinese', description: 'An ancient bronze mirror used by court diviners. The reflective side shows the present, while the patterned back reveals hidden truths.', value: 10 },
  { id: 'terracotta_warrior', name: 'Terracotta Warrior Fragment', rarity: 'uncommon', origin: 'Chinese', description: 'A piece of a terracotta warrior statue from an emperor\'s tomb guard. The clay still contains the warrior\'s loyalty and will follow simple commands.', value: 30 },
  { id: 'silk_funerary_banner', name: 'Silk Funerary Banner', rarity: 'uncommon', origin: 'Chinese', description: 'A fragment of a painted silk banner depicting the journey to the afterlife. The painted figures move and perform their journey when the banner is unfolded.', value: 48 },
  { id: 'ming_vase_ghost', name: 'Ming Dynasty Ghost Vase', rarity: 'rare', origin: 'Chinese', description: 'A porcelain vase from the Ming dynasty that contains a trapped ghost. The ghost whispers secrets of the Qing court when the vase is opened.', value: 120 },
  { id: 'dragon_jade_seal', name: 'Dragon Emperor Jade Seal', rarity: 'rare', origin: 'Chinese', description: 'The imperial seal of a legendary Chinese emperor, carved from a single piece of flawless jade. It bears the mandate of heaven itself.', value: 170 },
  { id: 'terracotta_general', name: 'Terracotta General Statue', rarity: 'epic', origin: 'Chinese', description: 'A complete terracotta general statue that commands lesser warrior fragments. When assembled, it leads an army of clay soldiers to defend the tomb.', value: 580 },
  { id: 'eight_trigrams_mirror', name: 'Eight Trigrams Celestial Mirror', rarity: 'legendary', origin: 'Chinese', description: 'A mirror inscribed with the eight trigrams that reflects the fundamental forces of the universe. Gazing into it reveals the structure of reality itself.', value: 5200 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: MT_STRUCTURES — 25 Upgradeable Tomb Structures
// ═══════════════════════════════════════════════════════════════════

export const MT_STRUCTURES: readonly MTStructureDef[] = [
  // Excavation (5)
  { id: 'dig_site', name: 'Excavation Dig Site', description: 'A prepared dig site with tools and scaffolding for carefully extracting treasures from the tomb walls. Increases relic discovery rate.', baseCost: 100, costMultiplier: 1.4 },
  { id: 'brush_station', name: 'Artifact Brush Station', description: 'A workstation equipped with brushes, picks, and preservation tools for delicate relic handling. Reduces chance of damaging found relics.', baseCost: 150, costMultiplier: 1.5 },
  { id: 'sonic_scanner', name: 'Tomb Sonic Scanner', description: 'Uses sound waves to detect hidden chambers and treasure caches behind solid walls. Reveals secret passages in explored chambers.', baseCost: 400, costMultiplier: 1.6 },
  { id: 'ground_radar', name: 'Ground-Penetrating Radar', description: 'Advanced radar system that maps the tomb interior in 3D, showing all unexplored areas and the location of major guardians.', baseCost: 800, costMultiplier: 1.7 },
  { id: 'quantum_excavator', name: 'Quantum Phase Excavator', description: 'State-of-the-art excavation tech that can phase through solid rock to retrieve artifacts without disturbing tomb architecture.', baseCost: 2000, costMultiplier: 1.9 },

  // Preservation (5)
  { id: 'relic_case', name: 'Relic Display Case', description: 'A climate-controlled glass case for displaying and preserving ancient relics. Prevents degradation of collected artifacts.', baseCost: 80, costMultiplier: 1.3 },
  { id: 'preservation_lab', name: 'Artifact Preservation Lab', description: 'A fully equipped laboratory for restoring and preserving damaged ancient relics to their original glory.', baseCost: 300, costMultiplier: 1.5 },
  { id: 'anima_condenser', name: 'Anima Condensation Unit', description: 'Captures and stores the anima energy that flows through the tomb, converting it into usable power for abilities and structures.', baseCost: 500, costMultiplier: 1.6 },
  { id: 'sarcophagus_vault', name: 'Sarcophagus Storage Vault', description: 'A reinforced vault designed to safely contain cursed sarcophagi and dangerous artifacts without releasing their effects.', baseCost: 700, costMultiplier: 1.7 },
  { id: 'eternal_preserve', name: 'Eternal Preservation Chamber', description: 'The ultimate preservation technology, using captured time energy to freeze artifacts in a state of perfect eternal stasis.', baseCost: 1500, costMultiplier: 1.9 },

  // Research (5)
  { id: 'translation_desk', name: 'Hieroglyph Translation Desk', description: 'A reference desk with dictionaries and rubbings of known hieroglyphic texts. Aids in deciphering ancient inscriptions.', baseCost: 120, costMultiplier: 1.4 },
  { id: 'rune_library', name: 'Ancient Rune Library', description: 'A growing library of decoded ancient texts and spell fragments. Each new discovery adds to the collective knowledge of tomb magic.', baseCost: 350, costMultiplier: 1.5 },
  { id: 'curse_analyzer', name: 'Curse Analysis Terminal', description: 'A device that analyzes curse energy patterns to predict trap locations and identify safe paths through cursed chambers.', baseCost: 600, costMultiplier: 1.6 },
  { id: 'soul_researcher', name: 'Soul Resonance Chamber', description: 'A chamber that resonates with the spiritual energy of the tomb, allowing communication with the ancient guardians and understanding their motives.', baseCost: 900, costMultiplier: 1.7 },
  { id: 'omniscience_archive', name: 'Omniscience Grand Archive', description: 'A legendary archive that, when completed, contains all knowledge ever sealed in the tomb. Grants near-omniscience about tomb contents.', baseCost: 2500, costMultiplier: 2.0 },

  // Defense (5)
  { id: 'sandbag_barricade', name: 'Sandbag Barricade', description: 'A simple barrier of sandbags filled with enchanted tomb sand. Provides basic protection against guardian attacks.', baseCost: 60, costMultiplier: 1.3 },
  { id: 'rune_ward', name: 'Runic Ward Stone', description: 'A standing stone carved with protective runes that repels curses and weakens hostile guardians within its radius.', baseCost: 200, costMultiplier: 1.5 },
  { id: 'golden_shield_gen', name: 'Golden Shield Generator', description: 'Generates a shimmering golden energy barrier using captured pharaoh power. Blocks all physical and magical attacks temporarily.', baseCost: 500, costMultiplier: 1.6 },
  { id: 'scarab_swarm_gate', name: 'Scarab Swarm Defense Gate', description: 'A gate that releases a swarm of enchanted scarabs to attack and distract hostile tomb guardians attempting to breach the base.', baseCost: 800, costMultiplier: 1.7 },
  { id: 'pharaoh_barrier', name: 'Pharaoh\'s Absolute Barrier', description: 'The ultimate defense — a barrier powered by the pharaoh\'s own divine authority. Nothing from the tomb can pass through it.', baseCost: 1800, costMultiplier: 1.9 },

  // Utility (5)
  { id: 'torch_bearer', name: 'Torch Bearer Post', description: 'An enchanted torch that burns with eternal blue flame, illuminating dark passages and revealing invisible guardians.', baseCost: 50, costMultiplier: 1.3 },
  { id: 'rope_bridge', name: 'Tomb Rope Bridge', description: 'A bridge system that spans deep chasms and connects isolated tomb chambers. Essential for accessing hard-to-reach areas.', baseCost: 100, costMultiplier: 1.4 },
  { id: 'anima_well', name: 'Anima Recharge Well', description: 'A well that taps into the tomb\'s natural anima flow, providing a steady supply of magical energy for ability usage.', baseCost: 250, costMultiplier: 1.5 },
  { id: 'teleporter_pad', name: 'Chamber Teleporter Pad', description: 'A magical teleportation pad that allows instant travel between discovered chambers. Saves enormous amounts of traversal time.', baseCost: 600, costMultiplier: 1.7 },
  { id: 'time_capsule', name: 'Temporal Time Capsule', description: 'A capsule that slows time in a localized area, giving explorers more time to react to traps and solve puzzles under pressure.', baseCost: 1200, costMultiplier: 1.8 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: MT_ABILITIES — 22 Curse/Blessing Abilities
// ═══════════════════════════════════════════════════════════════════

export const MT_ABILITIES: readonly MTAbilityDef[] = [
  // Curses (11)
  { id: 'curse_sandstorm', name: 'Curse of Sandstorm', description: 'Summons a swirling sandstorm that disorients guardians and obscures vision, reducing their attack accuracy for a duration.', cooldown: 25, power: 20, type: 'curse' },
  { id: 'curse_decay', name: 'Curse of Decay', description: 'Accelerates the deterioration of guardian armor and weapons, reducing their defense and attack power over time.', cooldown: 30, power: 25, type: 'curse' },
  { id: 'curse_blindness', name: 'Curse of Blindness', description: 'Plunges a targeted guardian into supernatural darkness, preventing it from seeing and attacking for several seconds.', cooldown: 20, power: 18, type: 'curse' },
  { id: 'curse_weakness', name: 'Curse of Weakness', description: 'Drains the physical strength of all guardians in the area, making their attacks deal significantly reduced damage.', cooldown: 35, power: 30, type: 'curse' },
  { id: 'curse_silence', name: 'Curse of Silence', description: 'Seals the vocal abilities of spell-casting guardians, preventing them from chanting incantations or using sound-based attacks.', cooldown: 22, power: 22, type: 'curse' },
  { id: 'curse_binding', name: 'Curse of Binding', description: 'Ethereal chains erupt from the ground to restrain a guardian, holding it immobile while the curse is active.', cooldown: 40, power: 35, type: 'curse' },
  { id: 'curse_petrify', name: 'Curse of Petrification', description: 'Slowly turns a guardian\'s limbs to stone, freezing them in place. Full petrification takes several seconds of sustained focus.', cooldown: 55, power: 50, type: 'curse' },
  { id: 'curse_plague', name: 'Curse of Ancient Plague', description: 'Releases a cloud of disease-bearing miasma that damages all guardians over time, replicating the plagues of ancient Egypt.', cooldown: 60, power: 45, type: 'curse' },
  { id: 'curse_shadow', name: 'Curse of Living Shadow', description: 'Summons the guardian\'s own shadow as an hostile entity that attacks it from behind, dealing damage and causing confusion.', cooldown: 45, power: 40, type: 'curse' },
  { id: 'curse_fate', name: 'Curse of Sealed Fate', description: 'Marks a guardian with an inescapable doom. After a delay, the marked guardian takes massive damage proportional to its remaining health.', cooldown: 80, power: 70, type: 'curse' },
  { id: 'curse_ankh', name: 'Curse of the Broken Ankh', description: 'The ultimate curse — severs the target\'s connection to the afterlife, preventing any form of regeneration or resurrection.', cooldown: 120, power: 100, type: 'curse' },

  // Blessings (11)
  { id: 'bless_light', name: 'Blessing of Sacred Light', description: 'Bathes the area in golden light that reveals hidden traps, invisible guardians, and secret doorways within the tomb chambers.', cooldown: 15, power: 15, type: 'blessing' },
  { id: 'bless_shield', name: 'Blessing of the Ankh', description: 'Creates a shimmering shield of life energy that absorbs incoming damage and slowly regenerates the explorer\'s health.', cooldown: 30, power: 25, type: 'blessing' },
  { id: 'bless_speed', name: 'Blessing of the Jackal', description: 'Channels the speed of Anubis\'s jackals, dramatically increasing movement speed and reaction time for a short duration.', cooldown: 20, power: 20, type: 'blessing' },
  { id: 'bless_wisdom', name: 'Blessing of Thoth', description: 'Grants temporary divine wisdom, making all hieroglyphic puzzles easier to solve and revealing partial translations.', cooldown: 35, power: 30, type: 'blessing' },
  { id: 'bless_fortune', name: 'Blessing of Fortuna', description: 'Bends probability in the explorer\'s favor, dramatically increasing the quality and quantity of relic drops from chambers.', cooldown: 50, power: 35, type: 'blessing' },
  { id: 'bless_strength', name: 'Blessing of Ra', description: 'Channels the power of the sun god Ra, boosting all attack damage and enabling the explorer to damage guardians immune to physical attacks.', cooldown: 40, power: 40, type: 'blessing' },
  { id: 'bless_resilience', name: 'Blessing of Ma\'at', description: 'Balances the cosmic scales in the explorer\'s favor, granting temporary invulnerability to curses and negative status effects.', cooldown: 45, power: 38, type: 'blessing' },
  { id: 'bless_sight', name: 'Blessing of the All-Seeing Eye', description: 'Opens the third eye, allowing the explorer to see through walls, detect all guardians in the tomb, and predict trap triggers.', cooldown: 55, power: 45, type: 'blessing' },
  { id: 'bless_rebirth', name: 'Blessing of the Scarab', description: 'Imbues the explorer with the scarab\'s power of rebirth. If defeated, automatically resurrects with partial health and anima.', cooldown: 90, power: 60, type: 'blessing' },
  { id: 'bless_immunity', name: 'Blessing of the Pharaoh', description: 'Grants the authority of the pharaoh himself. All lesser guardians bow before the explorer and refuse to attack for a duration.', cooldown: 100, power: 70, type: 'blessing' },
  { id: 'bless_eternity', name: 'Blessing of Eternal Life', description: 'The ultimate blessing — temporary immortality. The explorer cannot be harmed, cursed, or killed for a brief but glorious moment.', cooldown: 180, power: 120, type: 'blessing' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: MT_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const MT_ACHIEVEMENTS: readonly MTAchievementDef[] = [
  { id: 'ach_first_step', name: 'First Descent', description: 'Enter your first tomb chamber and begin the descent into the mystic tomb.', condition: 'totalChambersExplored >= 1', reward: '50 gold, 10 anima' },
  { id: 'ach_chamber_master', name: 'Chamber Master', description: 'Explore all 8 tomb chambers, from the sandstone entry to the immortal sarcophagus.', condition: 'exploredChambers >= 8', reward: '500 gold, 100 anima' },
  { id: 'ach_relic_hunter', name: 'Relic Hunter', description: 'Collect a total of 50 ancient relics across all tomb chambers.', condition: 'totalRelicsCollected >= 50', reward: '200 gold, 40 anima' },
  { id: 'ach_relic_hoarder', name: 'Relic Hoarder', description: 'Accumulate a collection of 200 ancient relics from the tomb.', condition: 'totalRelicsCollected >= 200', reward: '1000 gold, 150 anima' },
  { id: 'ach_first_guardian', name: 'Guardian Summoner', description: 'Summon your first tomb guardian to fight alongside you.', condition: 'totalGuardiansSummoned >= 1', reward: '100 gold, 20 anima' },
  { id: 'ach_guardian_army', name: 'Guardian Army', description: 'Summon 10 or more tomb guardians into your service.', condition: 'guardians.length >= 10', reward: '500 gold, 80 anima' },
  { id: 'ach_glyph_scholar', name: 'Glyph Scholar', description: 'Decipher your first hieroglyphic puzzle from the ancient walls.', condition: 'totalGlyphsDeciphered >= 1', reward: '75 gold, 15 anima' },
  { id: 'ach_glyph_master', name: 'Glyph Master', description: 'Decipher all 15 hieroglyphic puzzles and learn the tomb\'s deepest secrets.', condition: 'decipheredGlyphs >= 15', reward: '800 gold, 120 anima' },
  { id: 'ach_trap_disarmer', name: 'Trap Disarmer', description: 'Successfully disarm 5 deadly tomb traps without triggering them.', condition: 'totalTrapsDisarmed >= 5', reward: '150 gold, 30 anima' },
  { id: 'ach_trap_immune', name: 'Trap Immune', description: 'Disarm all 12 tomb traps, making the entire tomb safe for traversal.', condition: 'disarmedTraps >= 12', reward: '600 gold, 100 anima' },
  { id: 'ach_cursebreaker', name: 'Cursebreaker', description: 'Activate your first curse ability against a tomb guardian.', condition: 'activatedCurses.length >= 1', reward: '80 gold, 15 anima' },
  { id: 'ach_blessed_one', name: 'Blessed One', description: 'Use all 11 blessing abilities at least once during your tomb exploration.', condition: 'activeBlessings.length >= 11', reward: '400 gold, 75 anima' },
  { id: 'ach_builder', name: 'Tomb Architect', description: 'Build your first tomb structure to establish a base of operations.', condition: 'structures.length >= 1', reward: '60 gold, 10 anima' },
  { id: 'ach_metropolis', name: 'Tomb Metropolis', description: 'Build 15 or more tomb structures, creating a thriving underground base.', condition: 'structures.length >= 15', reward: '500 gold, 90 anima' },
  { id: 'ach_level_10', name: 'Tomb Raider', description: 'Reach tomb level 10, proving your worth as a seasoned explorer.', condition: 'tombLevel >= 10', reward: '200 gold, 40 anima' },
  { id: 'ach_level_25', name: 'Tomb Legend', description: 'Reach tomb level 25, earning your place among the greatest explorers.', condition: 'tombLevel >= 25', reward: '500 gold, 100 anima' },
  { id: 'ach_level_50', name: 'Immortal Explorer', description: 'Reach the maximum tomb level 50, achieving immortality through knowledge.', condition: 'tombLevel >= 50', reward: '2000 gold, 300 anima' },
  { id: 'ach_sarcophagus', name: 'Sarcophagus Opener', description: 'Successfully open a sarcophagus in any chamber, claiming the pharaoh\'s treasure.', condition: 'sarcophagusOpened >= 1', reward: '300 gold, 60 anima' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: MT_TITLES — 8 Titles (Tomb Raider → Immortal Pharaoh)
// ═══════════════════════════════════════════════════════════════════

export const MT_TITLES: readonly MTTitleDef[] = [
  { id: 'title_tomb_raider', name: 'Tomb Raider', description: 'A bold explorer who dares to enter the ancient tomb and seek its treasures.', requiredLevel: 1, requiredChambers: 0 },
  { id: 'title_glyph_reader', name: 'Glyph Reader', description: 'One who has learned to decipher the ancient hieroglyphs that cover the tomb walls.', requiredLevel: 5, requiredChambers: 2 },
  { id: 'title_relic_seeker', name: 'Relic Seeker', description: 'A dedicated collector of ancient artifacts from the tomb\'s hidden chambers.', requiredLevel: 10, requiredChambers: 4 },
  { id: 'title_curse_weaver', name: 'Curse Weaver', description: 'A practitioner of tomb magic who can wield both curses and blessings with skill.', requiredLevel: 15, requiredChambers: 5 },
  { id: 'title_guardian_lord', name: 'Guardian Lord', description: 'A commander of tomb guardians who has earned the loyalty of the ancient protectors.', requiredLevel: 22, requiredChambers: 6 },
  { id: 'title_tomb_scholar', name: 'Tomb Scholar', description: 'An expert in ancient tomb lore who has deciphered most of the tomb\'s secrets.', requiredLevel: 30, requiredChambers: 7 },
  { id: 'title_undying_master', name: 'Undying Master', description: 'One who has conquered death itself within the tomb and emerged immortal.', requiredLevel: 40, requiredChambers: 8 },
  { id: 'title_immortal_pharaoh', name: 'Immortal Pharaoh', description: 'The supreme ruler of the tomb who commands all its guardians and holds all its power.', requiredLevel: 50, requiredChambers: 8 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: MT_GLYPHS — 15 Hieroglyphic Puzzles
// ═══════════════════════════════════════════════════════════════════

export const MT_GLYPHS: readonly MTGlyphDef[] = [
  {
    id: 'glyph_entry_prayer',
    name: 'Entry Prayer',
    description: 'A simple prayer to Anubis inscribed on the entry hall walls, asking for safe passage into the underworld.',
    symbols: ['𓇋', '𓈖', '𓂋', '𓅓'],
    translation: 'I enter the house of the dead with a pure heart.',
    reward: 'Anubis\'s favor: +5% trap detection',
    difficulty: 1,
  },
  {
    id: 'glyph_scarab_spell',
    name: 'Scarab Protection Spell',
    description: 'A protective ward carved above the scarab passage, invoking Khepri\'s power to shield travelers from harm.',
    symbols: ['𓆣', '𓋹', '𓊵', '𓅃', '𓆸'],
    translation: 'May the scarab god roll away all danger from our path.',
    reward: 'Khepri\'s blessing: +10% guardian defense',
    difficulty: 2,
  },
  {
    id: 'glyph_riddle_door',
    name: 'Sphinx Riddle Door Inscription',
    description: 'The riddle carved on the door of the riddle antechamber. Translating it reveals the answer the Sphinx expects.',
    symbols: ['𓋴', '𓌙', '𓏏', '𓈖', '𓂀', '𓏲'],
    translation: 'I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I? An echo.',
    reward: 'Sphinx\'s approval: Access to riddle shortcuts',
    difficulty: 3,
  },
  {
    id: 'glyph_star_chart',
    name: 'Lapis Vault Star Chart',
    description: 'A star chart inscribed on the treasury ceiling showing the positions of stars at the moment of the pharaoh\'s burial.',
    symbols: ['𓇼', '𓏏', '𓊪', '𓆄', '𓋹', '𓁹'],
    translation: 'The stars align at midnight on the solstice, revealing the path to hidden gold.',
    reward: 'Treasure map: +15% relic discovery chance',
    difficulty: 3,
  },
  {
    id: 'glyph_mummy_ritual',
    name: 'Mummification Ritual Text',
    description: 'The complete text of the mummification ritual performed on the pharaoh\'s servants, describing each step in precise detail.',
    symbols: ['𓀭', '𓁹', '𓊪', '𓋴', '𓌙', '𓎡', '𓃭'],
    translation: 'Remove the organs, preserve with natron, wrap in linen, and place the heart back for the weighing.',
    reward: 'Preservation knowledge: Relics degrade 20% slower',
    difficulty: 4,
  },
  {
    id: 'glyph_curse_warning',
    name: 'Cursed Sanctum Warning',
    description: 'A dire warning carved at the entrance to the cursed sanctum, threatening terrible consequences for those who proceed.',
    symbols: ['𓂜', '𓅓', '𓋹', '𓏲', '𓇼', '𓃀', '𓆣', '𓁹'],
    translation: 'Turn back, mortal. The curses sealed here will consume your soul and erase your name from history.',
    reward: 'Curse resistance: -20% curse damage taken',
    difficulty: 5,
  },
  {
    id: 'glyph_throne_claim',
    name: 'Pharaoh\'s Throne Claim',
    description: 'The text inscribed on the pharaoh\'s throne declaring his divine right to rule in both life and the afterlife.',
    symbols: ['𓁹', '𓊪', '𓋹', '𓅃', '𓀭', '𓏏', '𓂋', '𓆸'],
    translation: 'I am the son of Ra, chosen by the gods to rule forever. My throne shall never be empty.',
    reward: 'Royal authority: Guardians deal 10% less damage',
    difficulty: 5,
  },
  {
    id: 'glyph_sarcophagus_seal',
    name: 'Sarcophagus Seal Text',
    description: 'The binding spell on the immortal sarcophagus that keeps the pharaoh\'s power contained within.',
    symbols: ['𓆣', '𓋹', '𓀭', '𓅓', '𓊪', '𓁹', '𓃭', '𓇼', '𓏲'],
    translation: 'Sealed by the blood of gods and the tears of stars, none shall open this until the stars return to their birth positions.',
    reward: 'Seal key: Unlocks sarcophagus opening ability',
    difficulty: 6,
  },
  {
    id: 'glyph_mayan_calendar',
    name: 'Mayan Calendar Fragment',
    description: 'A section of the Mayan long count calendar found etched into a tomb wall, suggesting a connection between the two civilizations.',
    symbols: ['𐗵', '𐗶', '𐗷', '𐗸', '𐗹', '𐗺', '𐗻'],
    translation: 'On the day the fifth sun rises, the doors between worlds shall open and the dead shall walk among the living.',
    reward: 'Temporal insight: +1 second trap reaction time',
    difficulty: 4,
  },
  {
    id: 'glyph_aztec_war',
    name: 'Aztec War Ritual Glyphs',
    description: 'Glyphs depicting an Aztec war ritual that was performed inside the tomb, suggesting Aztec warriors once raided it.',
    symbols: ['𐰠', '𐰡', '𐰢', '𐰣', '𐰤', '𐰥'],
    translation: 'With the blood of warriors we honor Huitzilopochtli. The sun demands sacrifice to rise again.',
    reward: 'Warrior\'s fury: +10% attack power against guardians',
    difficulty: 4,
  },
  {
    id: 'glyph_chinese_dragon',
    name: 'Chinese Dragon Prophecy',
    description: 'A prophecy written in ancient Chinese script carved alongside Egyptian hieroglyphs, foretelling the tomb\'s rediscovery.',
    symbols: ['龍', '帝', '墓', '永', '生', '天', '命'],
    translation: 'When the jade dragon stirs from its slumber, the emperor\'s tomb shall open and immortality shall be claimed by the worthy.',
    reward: 'Dragon\'s fortune: +20% rare relic chance',
    difficulty: 5,
  },
  {
    id: 'glyph_ankh_secret',
    name: 'Secret of the Ankh',
    description: 'A hidden text revealing the true meaning and power of the ankh symbol — not just life, but the cycle of death and rebirth.',
    symbols: ['𓋹', '𓅓', '𓃀', '𓆣', '𓁹', '𓏲', '𓋴', '𓇼'],
    translation: 'The ankh holds the key to the cycle. Life flows into death, death flows into life. Break the cycle and become eternal.',
    reward: 'Ankh\'s power: +5 anima per relic collected',
    difficulty: 6,
  },
  {
    id: 'glyph_sphinx_truth',
    name: 'Sphinx\'s Final Truth',
    description: 'The last riddle of the Great Sphinx, containing a truth about the nature of reality itself.',
    symbols: ['𓌙', '𓂀', '𓏏', '𓋴', '𓊵', '𓁹', '𓅃', '𓇼', '𓏲'],
    translation: 'What is the only thing in the tomb that grows stronger the more you take from it? Knowledge.',
    reward: 'Omniscience fragment: Reveals all hidden content',
    difficulty: 7,
  },
  {
    id: 'glyph_underworld_map',
    name: 'Map of the Underworld',
    description: 'A complete map of the Egyptian underworld (Duat) showing the path the pharaoh\'s soul must travel to reach eternal life.',
    symbols: ['𓁹', '𓅓', '𓊪', '𓆣', '𓋹', '𓃭', '𓇼', '𓀭', '𓃀', '𓂜'],
    translation: 'Through seven gates, past the lake of fire, under the weighing of hearts, the worthy soul reaches the field of reeds.',
    reward: 'Underworld path: Access to secret chamber',
    difficulty: 7,
  },
  {
    id: 'glyph_immortal_name',
    name: 'The Pharaoh\'s Immortal Name',
    description: 'The true name of the pharaoh, which must be spoken to claim his power. It is hidden across multiple glyph puzzles.',
    symbols: ['𓁹', '𓊪', '𓋹', '𓅓', '𓀭', '𓆣', '𓇼', '𓃭', '𓏲', '𓂜', '𓃀'],
    translation: 'I am Ra-Horakhty, the eternal morning sun. My name is written in starlight and shall never be erased.',
    reward: 'Immortal name: Unlock Immortal Pharaoh title path',
    difficulty: 8,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: MT_TRAPS — 12 Tomb Traps
// ═══════════════════════════════════════════════════════════════════

export const MT_TRAPS: readonly MTTrapDef[] = [
  {
    id: 'trap_swing_blades',
    name: 'Swinging Blade Pendulum',
    description: 'Massive stone blades swing from the ceiling in a rhythmic pattern. Timing your movement carefully allows safe passage between swings.',
    dangerLevel: 2,
    reward: 'Bronze gear mechanism and a cache of gold coins behind the blades.',
    avoidMethod: 'Time your movements to pass between blade swings. Listen for the clicking gear mechanism.',
  },
  {
    id: 'trap_poison_darts',
    name: 'Poison Dart Dispenser',
    description: 'Hidden holes in the walls shoot poisoned darts when a pressure plate is triggered. The darts carry a paralytic toxin.',
    dangerLevel: 3,
    reward: 'Poison darts (useful as weapons) and a sealed scroll with trap locations.',
    avoidMethod: 'Watch for small holes in the walls. Use a shield or roll to dodge. Trigger with a thrown object first.',
  },
  {
    id: 'trap_pit_fall',
    name: 'Collapsible Floor Pit',
    description: 'A section of the floor gives way when stepped on, dropping the unfortunate into a pit of sharpened stakes.',
    dangerLevel: 3,
    reward: 'Stakes made of rare metal and a hidden compartment in the pit wall containing a relic.',
    avoidMethod: 'Tap the floor ahead with a staff. Look for hairline cracks and slightly raised floor tiles.',
  },
  {
    id: 'trap_fire_jet',
    name: 'Greek Fire Jet Trap',
    description: 'Ancient pipes in the walls spray Greek fire when an infrared trigger is crossed. The fire burns hot enough to melt stone.',
    dangerLevel: 4,
    reward: 'Greek fire residue (valuable alchemical ingredient) and a bronze valve mechanism.',
    avoidMethod: 'Watch for heat shimmer in the air. Throw a cloth to see where the jets activate. Use water blessing to neutralize.',
  },
  {
    id: 'trap_rolling_boulder',
    name: 'Tomb Rolling Boulder',
    description: 'A massive stone sphere rolls down a sloped corridor when a tripwire is triggered, crushing everything in its path.',
    dangerLevel: 4,
    reward: 'The boulder reveals a hidden passage behind it, leading to a secret relic cache.',
    avoidMethod: 'Look for tripwires across the floor at ankle height. If triggered, dive into an alcove immediately.',
  },
  {
    id: 'trap_sand_slide',
    name: 'Sand Avalanche Slide',
    description: 'A wall panel breaks open releasing tons of enchanted sand that flows like water, filling the corridor and burying intruders.',
    dangerLevel: 3,
    reward: 'The sand is enchanted with preservation magic — useful for relic restoration.',
    avoidMethod: 'Look for cracked or discolored wall panels. Move quickly through areas with sandy floors and stay near the ceiling if possible.',
  },
  {
    id: 'trap_curse_gaze',
    name: 'Cursed Statue Gaze',
    description: 'Statues lining the corridor activate when passed, their gemstone eyes projecting a curse beam that weakens and slows intruders.',
    dangerLevel: 5,
    reward: 'The gemstone eyes can be pried out — they are valuable lapis lazuli worth a fortune.',
    avoidMethod: 'Cover the statue eyes before passing, or walk backward with a mirror to reflect the gaze.',
  },
  {
    id: 'trap_mummy_gas',
    name: 'Mummy Preservation Gas',
    description: 'Canopic jars mounted on the walls release clouds of ancient preservation gas when opened. While not deadly, it causes hallucinations.',
    dangerLevel: 3,
    reward: 'The gas can be captured and used as a potent alchemical reagent for preserving organic relics.',
    avoidMethod: 'Do not open canopic jars without preparation. Wear a cloth mask and carry a ventilation fan.',
  },
  {
    id: 'trap_shadow_snare',
    name: 'Shadow Binding Snare',
    description: 'Invisible magical circles on the floor trap the shadow of anyone who walks over them, anchoring the person to that spot.',
    dangerLevel: 5,
    reward: 'The shadow magic can be harnessed to create shadow-stepping teleportation tokens.',
    avoidMethod: 'Throw a bright light source ahead to reveal the circles. Walk only in fully illuminated areas.',
  },
  {
    id: 'trap_ceiling_collapse',
    name: 'Controlled Ceiling Collapse',
    description: 'A section of the ceiling is rigged to collapse when a specific sequence of floor tiles is stepped on, creating a cave-in.',
    dangerLevel: 5,
    reward: 'The collapsed section reveals a hidden upper chamber containing rare guardian summoning artifacts.',
    avoidMethod: 'Study the floor tile pattern carefully. The trigger tiles form a recognizable pattern if you look closely.',
  },
  {
    id: 'trap_scarab_swarm',
    name: 'Animated Scarab Swarm',
    description: 'A concealed niche releases thousands of animated scarab beetles that swarm and devour everything organic in their path.',
    dangerLevel: 6,
    reward: 'Scarab swarm control amulet — can command future scarab swarms to clear obstacles.',
    avoidMethod: 'Use fire to create a barrier. Smoke drives them away. The control amulet in the niche stops them if grabbed quickly.',
  },
  {
    id: 'trap_immortal_seal',
    name: 'Immortal Ward Seal',
    description: 'The ultimate trap — a magical seal that triggers when the sarcophagus is approached unprepared. It summons all dormant guardians simultaneously.',
    dangerLevel: 8,
    reward: 'The seal itself is made of pure star-metal, the rarest material in existence. Worth more than all other tomb treasures combined.',
    avoidMethod: 'Decipher the sarcophagus seal glyph first. Without the translation, the seal will always trigger. Prepare guardian-summoning counters.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

const useMTStore = create<MTFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      exploredChambers: [] as string[],
      collectedRelics: {} as Record<string, number>,
      guardians: [] as MTGuardianInstance[],
      structures: [] as MTStructureInstance[],
      decipheredGlyphs: [] as string[],
      disarmedTraps: [] as string[],
      activatedCurses: [] as string[],
      activeBlessings: [] as string[],
      achievements: [] as string[],
      currentTitle: 'title_tomb_raider',
      tombLevel: 1,
      tombExp: 0,
      gold: MT_INITIAL_GOLD,
      anima: MT_INITIAL_ANIMA,
      totalRelicsCollected: 0,
      totalChambersExplored: 0,
      totalGlyphsDeciphered: 0,
      totalTrapsDisarmed: 0,
      totalGuardiansSummoned: 0,
      activeChamberId: null,
      sealedChambers: [] as string[],

      // ── mtExploreChamber ───────────────────────────────────────
      mtExploreChamber: (chamberId: string): boolean => {
        const state = get()
        if (state.exploredChambers.includes(chamberId)) return false

        const chamber = MT_CHAMBERS.find((c) => c.id === chamberId)
        if (!chamber) return false
        if (state.tombLevel < chamber.minLevel) return false
        if (state.sealedChambers.includes(chamberId)) return false

        const expGain = chamber.depth * 2
        const goldGain = Math.floor(chamber.depth * 1.5)

        set((prev) => ({
          exploredChambers: [...prev.exploredChambers, chamberId],
          activeChamberId: chamberId,
          tombLevel: mtLevelFromXp(prev.tombExp + expGain),
          tombExp: prev.tombExp + expGain,
          gold: prev.gold + goldGain,
          totalChambersExplored: prev.totalChambersExplored + 1,
        }))
        return true
      },

      // ── mtDecipherGlyph ────────────────────────────────────────
      mtDecipherGlyph: (glyphId: string): boolean => {
        const state = get()
        if (state.decipheredGlyphs.includes(glyphId)) return false

        const glyph = MT_GLYPHS.find((g) => g.id === glyphId)
        if (!glyph) return false

        const animaCost = glyph.difficulty * 5
        if (state.anima < animaCost) return false

        const expGain = glyph.difficulty * 25
        const goldGain = glyph.difficulty * 10

        set((prev) => ({
          decipheredGlyphs: [...prev.decipheredGlyphs, glyphId],
          tombLevel: mtLevelFromXp(prev.tombExp + expGain),
          tombExp: prev.tombExp + expGain,
          gold: prev.gold + goldGain,
          anima: prev.anima - animaCost,
          totalGlyphsDeciphered: prev.totalGlyphsDeciphered + 1,
        }))
        return true
      },

      // ── mtCollectRelic ─────────────────────────────────────────
      mtCollectRelic: (relicId: string): number => {
        const relic = MT_RELICS.find((r) => r.id === relicId)
        if (!relic) return 0

        const quantity = Math.floor(Math.random() * 3) + 1
        const goldValue = relic.value * quantity

        set((prev) => ({
          collectedRelics: {
            ...prev.collectedRelics,
            [relicId]: (prev.collectedRelics[relicId] || 0) + quantity,
          },
          gold: prev.gold + goldValue,
          anima: Math.min(MT_MAX_ANIMA, prev.anima + quantity),
          totalRelicsCollected: prev.totalRelicsCollected + quantity,
        }))
        return quantity
      },

      // ── mtDisarmTrap ───────────────────────────────────────────
      mtDisarmTrap: (trapId: string): boolean => {
        const state = get()
        if (state.disarmedTraps.includes(trapId)) return false

        const trap = MT_TRAPS.find((t) => t.id === trapId)
        if (!trap) return false

        if (state.tombLevel < trap.dangerLevel * 3) return false

        const goldReward = trap.dangerLevel * 30
        const expGain = trap.dangerLevel * 20

        set((prev) => ({
          disarmedTraps: [...prev.disarmedTraps, trapId],
          tombLevel: mtLevelFromXp(prev.tombExp + expGain),
          tombExp: prev.tombExp + expGain,
          gold: prev.gold + goldReward,
          totalTrapsDisarmed: prev.totalTrapsDisarmed + 1,
        }))
        return true
      },

      // ── mtUseAbility ───────────────────────────────────────────
      mtUseAbility: (abilityId: string): boolean => {
        const state = get()
        const ability = MT_ABILITIES.find((a) => a.id === abilityId)
        if (!ability) return false

        const animaCost = Math.floor(ability.power * 0.5)
        if (state.anima < animaCost) return false

        if (ability.type === 'curse') {
          if (!state.activatedCurses.includes(abilityId)) {
            set((prev) => ({
              activatedCurses: [...prev.activatedCurses, abilityId],
              anima: prev.anima - animaCost,
            }))
          }
        }

        set((prev) => ({
          anima: prev.anima - animaCost,
        }))
        return true
      },

      // ── mtSummonGuardian ───────────────────────────────────────
      mtSummonGuardian: (guardianId: string): boolean => {
        const state = get()
        const def = MT_GUARDIANS.find((g) => g.id === guardianId)
        if (!def) return false

        const summonCost = def.basePower * 2
        if (state.gold < summonCost) return false

        const instance: MTGuardianInstance = {
          id: mtGenerateId(),
          guardianDefId: guardianId,
          name: def.name,
          level: 1,
          currentHP: def.basePower * 10,
          maxHP: def.basePower * 10,
          attack: Math.floor(def.basePower * 0.8),
          defense: Math.floor(def.basePower * 0.6),
          summonedAt: Date.now(),
        }

        const expGain = Math.floor(def.basePower * mtRarityPower(def.rarity))

        set((prev) => ({
          guardians: [...prev.guardians, instance],
          gold: prev.gold - summonCost,
          tombLevel: mtLevelFromXp(prev.tombExp + expGain),
          tombExp: prev.tombExp + expGain,
          totalGuardiansSummoned: prev.totalGuardiansSummoned + 1,
        }))
        return true
      },

      // ── mtActivateCurse ────────────────────────────────────────
      mtActivateCurse: (abilityId: string): boolean => {
        const state = get()
        const ability = MT_ABILITIES.find((a) => a.id === abilityId)
        if (!ability) return false
        if (ability.type !== 'curse') return false
        if (state.activatedCurses.includes(abilityId)) return false

        const animaCost = ability.power
        if (state.anima < animaCost) return false

        const expGain = Math.floor(ability.power * 1.5)

        set((prev) => ({
          activatedCurses: [...prev.activatedCurses, abilityId],
          anima: prev.anima - animaCost,
          tombLevel: mtLevelFromXp(prev.tombExp + expGain),
          tombExp: prev.tombExp + expGain,
        }))
        return true
      },

      // ── mtBlessArtifact ────────────────────────────────────────
      mtBlessArtifact: (relicId: string): boolean => {
        const state = get()
        const relic = MT_RELICS.find((r) => r.id === relicId)
        if (!relic) return false
        if ((state.collectedRelics[relicId] || 0) < 1) return false

        const blessCost = relic.value
        if (state.gold < blessCost) return false

        const blessing = MT_ABILITIES.find((a) => a.type === 'blessing')
        if (!blessing) return false

        if (!state.activeBlessings.includes(relicId)) {
          set((prev) => ({
            activeBlessings: [...prev.activeBlessings, relicId],
            gold: prev.gold - blessCost,
            anima: Math.min(MT_MAX_ANIMA, prev.anima + 10),
          }))
        }
        return true
      },

      // ── mtOpenSarcophagus ──────────────────────────────────────
      mtOpenSarcophagus: (chamberId: string): boolean => {
        const state = get()
        if (!state.exploredChambers.includes(chamberId)) return false
        if (state.sealedChambers.includes(chamberId)) return false
        if (chamberId !== 'immortal_sarcophagus' && chamberId !== 'pharaoh_throne') return false

        const chamber = MT_CHAMBERS.find((c) => c.id === chamberId)
        if (!chamber) return false
        if (state.tombLevel < chamber.minLevel) return false

        const hasGlyphKey = state.decipheredGlyphs.includes('glyph_sarcophagus_seal')
        if (!hasGlyphKey) return false

        const goldReward = chamber.depth * 5
        const expGain = chamber.depth * 3

        set((prev) => ({
          gold: prev.gold + goldReward,
          tombLevel: mtLevelFromXp(prev.tombExp + expGain),
          tombExp: prev.tombExp + expGain,
          anima: Math.min(MT_MAX_ANIMA, prev.anima + 50),
        }))
        return true
      },

      // ── mtSealChamber ──────────────────────────────────────────
      mtSealChamber: (chamberId: string): boolean => {
        const state = get()
        if (!state.exploredChambers.includes(chamberId)) return false
        if (state.sealedChambers.includes(chamberId)) return false
        if (chamberId === 'sandstone_entry') return false

        const sealCost = 100
        if (state.gold < sealCost) return false

        set((prev) => ({
          sealedChambers: [...prev.sealedChambers, chamberId],
          gold: prev.gold - sealCost,
          anima: Math.min(MT_MAX_ANIMA, prev.anima + 20),
        }))
        return true
      },
    }),
    {
      name: 'mystic-tomb-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: INTERNAL HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function mtCheckAchievementCondition(state: MTStoreState, achievementId: string): boolean {
  switch (achievementId) {
    case 'ach_first_step':
      return state.totalChambersExplored >= 1
    case 'ach_chamber_master':
      return state.exploredChambers.length >= 8
    case 'ach_relic_hunter':
      return state.totalRelicsCollected >= 50
    case 'ach_relic_hoarder':
      return state.totalRelicsCollected >= 200
    case 'ach_first_guardian':
      return state.totalGuardiansSummoned >= 1
    case 'ach_guardian_army':
      return state.guardians.length >= 10
    case 'ach_glyph_scholar':
      return state.totalGlyphsDeciphered >= 1
    case 'ach_glyph_master':
      return state.decipheredGlyphs.length >= 15
    case 'ach_trap_disarmer':
      return state.totalTrapsDisarmed >= 5
    case 'ach_trap_immune':
      return state.disarmedTraps.length >= 12
    case 'ach_cursebreaker':
      return state.activatedCurses.length >= 1
    case 'ach_blessed_one':
      return state.activeBlessings.length >= 11
    case 'ach_builder':
      return state.structures.length >= 1
    case 'ach_metropolis':
      return state.structures.length >= 15
    case 'ach_level_10':
      return state.tombLevel >= 10
    case 'ach_level_25':
      return state.tombLevel >= 25
    case 'ach_level_50':
      return state.tombLevel >= 50
    case 'ach_sarcophagus':
      return state.totalChambersExplored >= 5 && state.decipheredGlyphs.length >= 8
    default:
      return false
  }
}

function mtGetOriginColor(origin: MTRelicOrigin): string {
  switch (origin) {
    case 'Egyptian': return MT_COLOR_SANDSTONE_GOLD
    case 'Mayan': return MT_COLOR_JADE_GREEN
    case 'Aztec': return MT_COLOR_SCARLET_RED
    case 'Chinese': return MT_COLOR_MOONLIGHT_SILVER
  }
}

function mtGetOriginSymbol(origin: MTRelicOrigin): string {
  switch (origin) {
    case 'Egyptian': return '𓂀'
    case 'Mayan': return '𐗵'
    case 'Aztec': return '𐰠'
    case 'Chinese': return '龍'
  }
}

function mtGetAbilityTypeColor(type: 'curse' | 'blessing'): string {
  switch (type) {
    case 'curse': return MT_COLOR_SCARLET_RED
    case 'blessing': return MT_COLOR_SANDSTONE_GOLD
  }
}

function mtGetDifficultyLabel(difficulty: number): string {
  if (difficulty <= 2) return 'Beginner'
  if (difficulty <= 4) return 'Intermediate'
  if (difficulty <= 6) return 'Advanced'
  if (difficulty <= 7) return 'Expert'
  return 'Master'
}

function mtGetTrapDangerLabel(dangerLevel: number): string {
  if (dangerLevel <= 2) return 'Minor'
  if (dangerLevel <= 3) return 'Moderate'
  if (dangerLevel <= 5) return 'Dangerous'
  if (dangerLevel <= 6) return 'Lethal'
  if (dangerLevel <= 7) return 'Deadly'
  return 'Catastrophic'
}

const MT_GUARDIAN_TYPES: readonly MTGuardianType[] = [
  'Mummy',
  'Skeleton',
  'Golem',
  'Wraith',
  'Basilisk',
  'Sphinx',
  'Scarab',
] as const

const MT_RELIC_ORIGINS: readonly MTRelicOrigin[] = [
  'Egyptian',
  'Mayan',
  'Aztec',
  'Chinese',
] as const

const MT_ALL_RARITIES: readonly MTRarity[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
] as const

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: DEFAULT EXPORT HOOK
// ═══════════════════════════════════════════════════════════════════

export default function useMysticTomb() {
  const store = useMTStore()

  // ── Merged useMemo: Chamber Details + Relic Inventory + Guardian List ──
  const { mtGetChamberDetails, mtGetRelicInventory, mtGetOwnedGuardians } = useMemo(() => {
    const chamberDetails = MT_CHAMBERS.map((chamber) => ({
      ...chamber,
      explored: store.exploredChambers.includes(chamber.id),
      unlocked: store.tombLevel >= chamber.minLevel,
      sealed: store.sealedChambers.includes(chamber.id),
      rewards: chamber.rewards
        .map((rId) => MT_RELICS.find((r) => r.id === rId))
        .filter(Boolean),
    }))

    const relicInventory = MT_RELICS.map((relic) => ({
      ...relic,
      owned: store.collectedRelics[relic.id] || 0,
      rarityColor: mtGetRarityColor(relic.rarity),
      blessed: store.activeBlessings.includes(relic.id),
    }))

    const ownedGuardians = store.guardians.map((g) => {
      const def = MT_GUARDIANS.find((d) => d.id === g.guardianDefId)
      return {
        ...g,
        def,
        typeColor: def ? mtGetGuardianTypeColor(def.type) : MT_COLOR_MOONLIGHT_SILVER,
        rarityColor: def ? mtGetRarityColor(def.rarity) : '#9CA3AF',
        totalPower: Math.floor((g.attack + g.defense) * (1 + g.level * 0.12)),
      }
    })

    return { mtGetChamberDetails: chamberDetails, mtGetRelicInventory: relicInventory, mtGetOwnedGuardians: ownedGuardians }
  }, [store])

  // ── Merged useMemo: Glyph List + Trap List + Ability List ──
  const { mtGetGlyphList, mtGetTrapList, mtGetAbilityList } = useMemo(() => {
    const glyphList = MT_GLYPHS.map((glyph) => ({
      ...glyph,
      deciphered: store.decipheredGlyphs.includes(glyph.id),
      canDecipher: !store.decipheredGlyphs.includes(glyph.id) && store.anima >= glyph.difficulty * 5,
    }))

    const trapList = MT_TRAPS.map((trap) => ({
      ...trap,
      disarmed: store.disarmedTraps.includes(trap.id),
      canDisarm: !store.disarmedTraps.includes(trap.id) && store.tombLevel >= trap.dangerLevel * 3,
    }))

    const abilityList = MT_ABILITIES.map((ability) => ({
      ...ability,
      canUse: store.anima >= Math.floor(ability.power * 0.5),
      activated: ability.type === 'curse' && store.activatedCurses.includes(ability.id),
    }))

    return { mtGetGlyphList: glyphList, mtGetTrapList: trapList, mtGetAbilityList: abilityList }
  }, [store])

  // ── Merged useMemo: Structure List + Total Power + Rarity Summary ──
  const { mtGetStructureList, mtGetTotalPower, mtGetRaritySummary } = useMemo(() => {
    const structureList = store.structures.map((s) => {
      const def = MT_STRUCTURES.find((d) => d.id === s.structureDefId)
      return {
        ...s,
        def,
        upgradeCost: def
          ? Math.floor(def.baseCost * Math.pow(def.costMultiplier, s.level))
          : 0,
        maxed: s.level >= 10,
      }
    })

    let guardianPower = 0
    for (const g of store.guardians) {
      const def = MT_GUARDIANS.find((d) => d.id === g.guardianDefId)
      if (!def) continue
      const rarityMult = mtRarityPower(def.rarity)
      guardianPower += Math.floor(
        (g.attack + g.defense) * rarityMult * (1 + g.level * 0.12)
      )
    }
    const structurePower = store.structures.reduce(
      (sum, s) => sum + s.level * 15,
      0
    )

    const summary: Record<MTRarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }
    for (const g of store.guardians) {
      const def = MT_GUARDIANS.find((d) => d.id === g.guardianDefId)
      if (def) {
        summary[def.rarity] += 1
      }
    }

    return {
      mtGetStructureList: structureList,
      mtGetTotalPower: { guardianPower, structurePower, total: guardianPower + structurePower },
      mtGetRaritySummary: summary,
    }
  }, [store])

  // ── Merged useMemo: Achievement Status + Title Progress + Level Progress ──
  const { mtGetAchievementStatus, mtGetTitleProgress, mtLevelProgress } = useMemo(() => {
    const unlocked: MTAchievementDef[] = []
    const claimable: MTAchievementDef[] = []

    for (const ach of MT_ACHIEVEMENTS) {
      if (store.achievements.includes(ach.id)) {
        unlocked.push(ach)
      } else if (mtCheckAchievementCondition(store, ach.id)) {
        claimable.push(ach)
      }
    }

    const titleProgress = MT_TITLES.map((title) => ({
      ...title,
      unlocked: store.tombLevel >= title.requiredLevel && store.exploredChambers.length >= title.requiredChambers,
      active: store.currentTitle === title.id,
      levelMet: store.tombLevel >= title.requiredLevel,
      chamberMet: store.exploredChambers.length >= title.requiredChambers,
    }))

    const currentXpNeeded = mtXpForLevel(store.tombLevel)

    return {
      mtGetAchievementStatus: { unlocked, claimable, total: MT_ACHIEVEMENTS.length, progress: unlocked.length },
      mtGetTitleProgress: titleProgress,
      mtLevelProgress: {
        level: store.tombLevel,
        currentXp: store.tombExp,
        xpToNext: currentXpNeeded,
        maxLevel: store.tombLevel >= MT_MAX_LEVEL,
        progressPercent:
          currentXpNeeded > 0 ? Math.min(100, Math.floor((store.tombExp / currentXpNeeded) * 100)) : 0,
      },
    }
  }, [store])

  // ── Merged useMemo: Anima Status + Chamber Summary + Curse/Blessing Summary ──
  const { mtGetAnimaStatus, mtGetChamberSummary, mtGetCurseBlessingSummary } = useMemo(() => {
    const animaPercent = Math.floor((store.anima / MT_MAX_ANIMA) * 100)

    const totalChambers = MT_CHAMBERS.length
    const explored = store.exploredChambers.length

    const curseAbilities = MT_ABILITIES.filter((a) => a.type === 'curse')
    const blessingAbilities = MT_ABILITIES.filter((a) => a.type === 'blessing')

    return {
      mtGetAnimaStatus: {
        current: store.anima,
        max: MT_MAX_ANIMA,
        percent: animaPercent,
        isFull: store.anima >= MT_MAX_ANIMA,
      },
      mtGetChamberSummary: {
        totalChambers,
        explored,
        sealed: store.sealedChambers.length,
        percent: Math.floor((explored / totalChambers) * 100),
        allExplored: explored >= totalChambers,
      },
      mtGetCurseBlessingSummary: {
        totalCurses: curseAbilities.length,
        activeCurses: store.activatedCurses.length,
        totalBlessings: blessingAbilities.length,
        activeBlessings: store.activeBlessings.length,
        allCursesActive: store.activatedCurses.length >= curseAbilities.length,
        allBlessingsActive: store.activeBlessings.length >= blessingAbilities.length,
      },
    }
  }, [store])

  // ── Getter: Next Title ───────────────────────────────────────
  const mtGetNextTitle = useMemo(() => {
    const currentTitle = MT_TITLES.find((t) => t.id === store.currentTitle)
    const currentIndex = currentTitle
      ? MT_TITLES.indexOf(currentTitle)
      : -1
    if (currentIndex >= MT_TITLES.length - 1) return null
    return MT_TITLES[currentIndex + 1]
  }, [store.currentTitle])

  // ── Getter: Available Chambers ────────────────────────────────
  const mtGetAvailableChambers = useMemo(() => {
    return MT_CHAMBERS.filter(
      (chamber) =>
        store.tombLevel >= chamber.minLevel &&
        !store.exploredChambers.includes(chamber.id) &&
        !store.sealedChambers.includes(chamber.id)
    )
  }, [store.tombLevel, store.exploredChambers, store.sealedChambers])

  // ── Getter: Collection Summary ────────────────────────────────
  const mtGetCollectionSummary = useMemo(() => {
    const uniqueRelics = Object.keys(store.collectedRelics).filter(
      (key) => store.collectedRelics[key] > 0
    ).length
    const totalRelicCount = Object.values(store.collectedRelics).reduce(
      (sum, count) => sum + count,
      0
    )
    return {
      uniqueRelics,
      totalRelicCount,
      totalRelicTypes: MT_RELICS.length,
      percentComplete: Math.floor((uniqueRelics / MT_RELICS.length) * 100),
      allCollected: uniqueRelics >= MT_RELICS.length,
    }
  }, [store.collectedRelics])

  // ── Getter: Origin Summary ─────────────────────────────────────
  const mtGetOriginSummary = useMemo(() => {
    const origins: Record<MTRelicOrigin, { total: number; collected: number; percent: number }> = {
      Egyptian: { total: 0, collected: 0, percent: 0 },
      Mayan: { total: 0, collected: 0, percent: 0 },
      Aztec: { total: 0, collected: 0, percent: 0 },
      Chinese: { total: 0, collected: 0, percent: 0 },
    }
    for (const relic of MT_RELICS) {
      origins[relic.origin].total += 1
      if ((store.collectedRelics[relic.id] || 0) > 0) {
        origins[relic.origin].collected += 1
      }
    }
    for (const origin of Object.keys(origins) as MTRelicOrigin[]) {
      const entry = origins[origin]
      entry.percent = entry.total > 0 ? Math.floor((entry.collected / entry.total) * 100) : 0
    }
    return origins
  }, [store.collectedRelics])

  // ── Getter: Guardian Type Distribution ──────────────────────────
  const mtGetGuardianTypeSummary = useMemo(() => {
    const types: Record<MTGuardianType, { total: number; owned: number; color: string }> = {
      Mummy: { total: 0, owned: 0, color: MT_COLOR_SANDSTONE_GOLD },
      Skeleton: { total: 0, owned: 0, color: MT_COLOR_MOONLIGHT_SILVER },
      Golem: { total: 0, owned: 0, color: MT_COLOR_ANCIENT_BRONZE },
      Wraith: { total: 0, owned: 0, color: MT_COLOR_LAPIS_LAZULI },
      Basilisk: { total: 0, owned: 0, color: MT_COLOR_JADE_GREEN },
      Sphinx: { total: 0, owned: 0, color: MT_COLOR_PAPYRUS_CREAM },
      Scarab: { total: 0, owned: 0, color: MT_COLOR_SCARLET_RED },
    }
    for (const guardian of MT_GUARDIANS) {
      types[guardian.type].total += 1
    }
    for (const instance of store.guardians) {
      const def = MT_GUARDIANS.find((d) => d.id === instance.guardianDefId)
      if (def) {
        types[def.type].owned += 1
      }
    }
    return types
  }, [store.guardians])

  // ── Getter: Exploration Guide ──────────────────────────────────
  const mtGetExplorationGuide = useMemo(() => {
    const nextChamber = MT_CHAMBERS.find(
      (c) =>
        store.tombLevel >= c.minLevel &&
        !store.exploredChambers.includes(c.id) &&
        !store.sealedChambers.includes(c.id)
    )
    const nextGlyph = MT_GLYPHS.find(
      (g) =>
        !store.decipheredGlyphs.includes(g.id) &&
        store.anima >= g.difficulty * 5
    )
    const nextTrap = MT_TRAPS.find(
      (t) =>
        !store.disarmedTraps.includes(t.id) &&
        store.tombLevel >= t.dangerLevel * 3
    )
    const nextGuardian = MT_GUARDIANS.find(
      (g) => {
        const cost = g.basePower * 2
        return store.gold >= cost && !store.guardians.some((inst) => inst.guardianDefId === g.id)
      }
    )
    return {
      nextChamber: nextChamber || null,
      nextGlyph: nextGlyph || null,
      nextTrap: nextTrap || null,
      nextGuardian: nextGuardian || null,
      hasSomethingToDo: !!(nextChamber || nextGlyph || nextTrap || nextGuardian),
    }
  }, [store])

  // ── Getter: Danger Assessment ──────────────────────────────────
  const mtGetDangerAssessment = useMemo(() => {
    const deepestExplored = store.exploredChambers.reduce((max, chamberId) => {
      const chamber = MT_CHAMBERS.find((c) => c.id === chamberId)
      if (!chamber) return max
    return chamber.depth > max ? chamber.depth : max
  }, 0)
    const trapsRemaining = MT_TRAPS.filter(
      (t) => !store.disarmedTraps.includes(t.id)
    ).length
    const cursesRemaining = MT_ABILITIES.filter(
      (a) => a.type === 'curse' && !store.activatedCurses.includes(a.id)
    ).length
    const activeGuardianPower = store.guardians.reduce((sum, g) => {
      return sum + Math.floor((g.attack + g.defense) * (1 + g.level * 0.12))
    }, 0)
    return {
      deepestDepth: deepestExplored,
      dangerRating: Math.min(10, Math.floor(deepestExplored / 66)),
      trapsRemaining,
      cursesRemaining,
      activeGuardianPower,
      overallSafety: activeGuardianPower > 200 ? 'well_protected' : activeGuardianPower > 50 ? 'moderate' : 'vulnerable',
    }
  }, [store])

  // ── Getter: Statistics Overview ────────────────────────────────
  const mtGetStatisticsOverview = useMemo(() => {
    const totalPossibleGlyphs = MT_GLYPHS.length
    const totalPossibleTraps = MT_TRAPS.length
    const totalPossibleAbilities = MT_ABILITIES.length
    const totalPossibleChambers = MT_CHAMBERS.length
    const totalPossibleGuardians = MT_GUARDIANS.length
    const totalPossibleRelics = MT_RELICS.length
    const totalPossibleStructures = MT_STRUCTURES.length
    return {
      chambers: { current: store.exploredChambers.length, total: totalPossibleChambers },
      relics: { current: Object.keys(store.collectedRelics).filter((k) => store.collectedRelics[k] > 0).length, total: totalPossibleRelics },
      guardians: { current: store.guardians.length, total: totalPossibleGuardians },
      glyphs: { current: store.decipheredGlyphs.length, total: totalPossibleGlyphs },
      traps: { current: store.disarmedTraps.length, total: totalPossibleTraps },
      abilities: { current: store.activatedCurses.length + store.activeBlessings.length, total: totalPossibleAbilities },
      structures: { current: store.structures.length, total: totalPossibleStructures },
      overallProgress: Math.floor(
        ((store.exploredChambers.length / totalPossibleChambers) +
          (store.decipheredGlyphs.length / totalPossibleGlyphs) +
          (store.disarmedTraps.length / totalPossibleTraps) +
          (store.guardians.length / totalPossibleGuardians)) /
        4 * 100
      ),
    }
  }, [store])

  // ── Assemble mtAPI ───────────────────────────────────────────
  const mtAPI = {
    // Constants
    MT_CHAMBERS,
    MT_GUARDIANS,
    MT_RELICS,
    MT_STRUCTURES,
    MT_ABILITIES,
    MT_ACHIEVEMENTS,
    MT_TITLES,
    MT_GLYPHS,
    MT_TRAPS,
    MT_COLOR_SANDSTONE_GOLD,
    MT_COLOR_ANCIENT_BRONZE,
    MT_COLOR_PAPYRUS_CREAM,
    MT_COLOR_LAPIS_LAZULI,
    MT_COLOR_OBSIDIAN_BLACK,
    MT_COLOR_SCARLET_RED,
    MT_COLOR_JADE_GREEN,
    MT_COLOR_MOONLIGHT_SILVER,

    // State
    exploredChambers: store.exploredChambers,
    collectedRelics: store.collectedRelics,
    guardians: store.guardians,
    structures: store.structures,
    decipheredGlyphs: store.decipheredGlyphs,
    disarmedTraps: store.disarmedTraps,
    activatedCurses: store.activatedCurses,
    activeBlessings: store.activeBlessings,
    achievements: store.achievements,
    currentTitle: store.currentTitle,
    tombLevel: store.tombLevel,
    tombExp: store.tombExp,
    gold: store.gold,
    anima: store.anima,
    totalRelicsCollected: store.totalRelicsCollected,
    totalChambersExplored: store.totalChambersExplored,
    totalGlyphsDeciphered: store.totalGlyphsDeciphered,
    totalTrapsDisarmed: store.totalTrapsDisarmed,
    totalGuardiansSummoned: store.totalGuardiansSummoned,
    activeChamberId: store.activeChamberId,
    sealedChambers: store.sealedChambers,

    // Actions
    mtExploreChamber: store.mtExploreChamber,
    mtDecipherGlyph: store.mtDecipherGlyph,
    mtCollectRelic: store.mtCollectRelic,
    mtDisarmTrap: store.mtDisarmTrap,
    mtUseAbility: store.mtUseAbility,
    mtSummonGuardian: store.mtSummonGuardian,
    mtActivateCurse: store.mtActivateCurse,
    mtBlessArtifact: store.mtBlessArtifact,
    mtOpenSarcophagus: store.mtOpenSarcophagus,
    mtSealChamber: store.mtSealChamber,

    // Getters
    mtGetChamberDetails,
    mtGetRelicInventory,
    mtGetOwnedGuardians,
    mtGetGlyphList,
    mtGetTrapList,
    mtGetAbilityList,
    mtGetStructureList,
    mtGetTotalPower,
    mtGetRaritySummary,
    mtGetAchievementStatus,
    mtGetTitleProgress,
    mtLevelProgress,
    mtGetAnimaStatus,
    mtGetChamberSummary,
    mtGetCurseBlessingSummary,
    mtGetNextTitle,
    mtGetAvailableChambers,
    mtGetCollectionSummary,
    mtGetOriginSummary,
    mtGetGuardianTypeSummary,
    mtGetExplorationGuide,
    mtGetDangerAssessment,
    mtGetStatisticsOverview,
  }

  return mtAPI
}
