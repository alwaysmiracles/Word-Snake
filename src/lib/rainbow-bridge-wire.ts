'use client'
import { useState, useCallback, useEffect, useRef, useMemo } from 'react'

/* ================================================================
   RAINBOW BRIDGE (BIFRÖST) — Wire Hook
   A hook-based Norse mythology bridge management system for
   guardian recruitment, rune forging, bridge construction,
   realm exploration, artifact collection, and daily patrols.
   Color theme: gold / rainbow / deep blue / silver
   ================================================================ */

// ─── Type Definitions ─────────────────────────────────────────────

type RbRarityKey = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'

type RbRealmKey =
  | 'mortal_shore'
  | 'rainbow_span'
  | 'storm_gate'
  | 'crystal_passage'
  | 'starlight_observatory'
  | 'void_crossing'
  | 'asgard_approach'
  | 'heimdalls_tower'

interface RbRarityInfo {
  key: RbRarityKey
  label: string
  color: string
  glow: string
  xpMultiplier: number
  coinMultiplier: number
}

interface RbGuardian {
  id: string
  name: string
  title: string
  rarity: RbRarityKey
  realm: RbRealmKey
  power: number
  defense: number
  description: string
  lore: string
  icon: string
  cost: number
  unlockLevel: number
}

interface RbRuneStone {
  id: string
  name: string
  symbol: string
  power: number
  rarity: RbRarityKey
  element: string
  description: string
  lore: string
  icon: string
}

interface RbBridgeSegment {
  id: string
  name: string
  realm: RbRealmKey
  integrity: number
  maxIntegrity: number
  reinforcedLevel: number
  description: string
  icon: string
  repairCost: number
  reinforceCost: number
}

interface RbArtifact {
  id: string
  name: string
  rarity: RbRarityKey
  type: string
  power: number
  description: string
  lore: string
  icon: string
  cost: number
}

interface RbRealm {
  id: RbRealmKey
  name: string
  description: string
  difficulty: number
  unlockLevel: number
  icon: string
  color: string
  dangers: string[]
  rewards: string
}

interface RbTitle {
  id: string
  name: string
  requiredLevel: number
  description: string
  color: string
}

interface RbAchievement {
  id: string
  name: string
  description: string
  icon: string
  condition: string
  reward: { type: string; value: number }
}

interface RbDailyPatrol {
  date: string
  completed: boolean
  segmentsPatrolled: number
  runesCollected: number
  coinsEarned: number
  xpEarned: number
}

interface RbEncounter {
  type: string
  name: string
  difficulty: number
  reward: { type: string; value: number }
  description: string
  icon: string
}

interface RbForgedRune {
  runeStoneId: string
  bonusPower: number
  forgedAt: string
}

interface RbRecruitedGuardian {
  guardianId: string
  level: number
  xp: number
  trainingSessions: number
  recruitedAt: string
}

interface RbSegmentStatus {
  segmentId: string
  integrity: number
  reinforcedLevel: number
  lastRepairedAt: string
}

interface RbCollectedArtifact {
  artifactId: string
  acquiredAt: string
}

interface RbPatrolLogEntry {
  date: string
  realmId: RbRealmKey
  segmentsPatrolled: number
  runesFound: number
  encounters: string[]
  coinsEarned: number
  xpEarned: number
}

interface RainbowBridgeState {
  level: number
  xp: number
  coins: number
  currentRealm: RbRealmKey
  collectedRunes: string[]
  forgedRunes: RbForgedRune[]
  recruitedGuardians: RbRecruitedGuardian[]
  segmentStatuses: RbSegmentStatus[]
  collectedArtifacts: RbCollectedArtifact[]
  unlockedAchievements: string[]
  patrolLog: RbPatrolLogEntry[]
  totalRuneCollected: number
  totalRunesForged: number
  totalGuardiansRecruited: number
  totalSegmentsRepaired: number
  totalSegmentsReinforced: number
  totalArtifactsCollected: number
  totalRealmsExplored: number
  totalPatrolsCompleted: number
  totalCoinsSpent: number
  totalCoinsEarned: number
  totalXpEarned: number
  bridgeIntegrity: number
  dailyPatrol: RbDailyPatrol | null
  explorationStreak: number
  lastExplorationDate: string
  createdAt: string
  updatedAt: string
}

// ─── Constants ────────────────────────────────────────────────────

export const RB_MAX_LEVEL = 50

export const RB_RARITY: Record<RbRarityKey, RbRarityInfo> = {
  Common: {
    key: 'Common',
    label: 'Common',
    color: '#9CA3AF',
    glow: 'rgba(156,163,175,0.3)',
    xpMultiplier: 1,
    coinMultiplier: 1,
  },
  Uncommon: {
    key: 'Uncommon',
    label: 'Uncommon',
    color: '#22C55E',
    glow: 'rgba(34,197,94,0.35)',
    xpMultiplier: 1.5,
    coinMultiplier: 1.5,
  },
  Rare: {
    key: 'Rare',
    label: 'Rare',
    color: '#3B82F6',
    glow: 'rgba(59,130,246,0.4)',
    xpMultiplier: 2,
    coinMultiplier: 2.5,
  },
  Epic: {
    key: 'Epic',
    label: 'Epic',
    color: '#A855F7',
    glow: 'rgba(168,85,247,0.45)',
    xpMultiplier: 3,
    coinMultiplier: 4,
  },
  Legendary: {
    key: 'Legendary',
    label: 'Legendary',
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.5)',
    xpMultiplier: 5,
    coinMultiplier: 7,
  },
}

export const RB_RARITY_ORDER: RbRarityKey[] = [
  'Common',
  'Uncommon',
  'Rare',
  'Epic',
  'Legendary',
]

export const RB_REALM_ORDER: RbRealmKey[] = [
  'mortal_shore',
  'rainbow_span',
  'storm_gate',
  'crystal_passage',
  'starlight_observatory',
  'void_crossing',
  'asgard_approach',
  'heimdalls_tower',
]

export const RB_THEME = {
  rainbow: '#FF6B6B',
  gold: '#FFD700',
  deepBlue: '#1E3A5F',
  silver: '#C0C0C0',
  asgardGlow: '#FFF8DC',
  bifrostArc: '#FF69B4',
  stormPurple: '#6A0DAD',
  voidBlack: '#0A0A1A',
  frostCyan: '#00E5FF',
  starlight: '#FFFACD',
  background: '#0C1445',
  surface: '#162052',
  surfaceLight: '#1E2D6B',
  textPrimary: '#E2E8F0',
  textSecondary: '#94A3B8',
  border: '#2A3A7D',
  borderLight: '#3D5AB5',
}

export const RB_SAVE_KEY = 'rainbow-bridge-save'

export const RB_XP_TABLE: number[] = (() => {
  const table: number[] = [0]
  for (let i = 1; i <= RB_MAX_LEVEL; i++) {
    const base = 120
    const growth = 1.17
    const previous = table[i - 1]
    table.push(Math.floor(previous + base * Math.pow(growth, i - 1)))
  }
  return table
})()

export const RB_PATROL_BASE_XP = 40
export const RB_PATROL_BASE_COINS = 25
export const RB_RUNE_COLLECT_XP = 20
export const RB_FORGE_BASE_XP = 35
export const RB_RECRUIT_BASE_XP = 30
export const RB_REPAIR_BASE_XP = 25
export const RB_REINFORCE_BASE_XP = 40
export const RB_EXPLORE_BASE_XP = 50
export const RB_ARTIFACT_BASE_XP = 45
export const RB_TRAINING_COST = 15
export const RB_MAX_PATROL_LOG = 30
export const RB_MAX_REINFORCE_LEVEL = 10
export const RB_STREAK_BONUS_MULTIPLIER = 5

// ─── Static Data — Realms ────────────────────────────────────────

export const RB_REALMS: RbRealm[] = [
  {
    id: 'mortal_shore',
    name: 'Mortal Shore',
    description: 'The starting point of the Bifröst, where mortals first glimpse the shimmering rainbow bridge stretching to the heavens.',
    difficulty: 1,
    unlockLevel: 1,
    icon: '🌅',
    color: '#FF8C00',
    dangers: ['Stray spirits', 'Fog banks', 'Weak trolls'],
    rewards: 'Basic runes, small coin pouches',
  },
  {
    id: 'rainbow_span',
    name: 'Rainbow Span',
    description: 'The brilliant multi-colored span of the Bifröst, alive with prismatic energy and ancient ward magic.',
    difficulty: 2,
    unlockLevel: 3,
    icon: '🌈',
    color: '#FF69B4',
    dangers: ['Rainbow storms', 'Color shift traps', 'Prismatic wisps'],
    rewards: 'Uncommon runes, guardian shards',
  },
  {
    id: 'storm_gate',
    name: 'Storm Gate',
    description: 'A howling barrier of thunder and lightning where Thor himself once reinforced the bridge with storm magic.',
    difficulty: 3,
    unlockLevel: 8,
    icon: '⛈️',
    color: '#4169E1',
    dangers: ['Lightning strikes', 'Thunder wolves', 'Gale-force winds'],
    rewards: 'Rare runes, storm-forged artifacts',
  },
  {
    id: 'crystal_passage',
    name: 'Crystal Passage',
    description: 'A tunnel of enchanted crystals that hum with the stored magic of a thousand ancient enchantments.',
    difficulty: 4,
    unlockLevel: 14,
    icon: '💎',
    color: '#00CED1',
    dangers: ['Crystal shards', 'Resonance traps', 'Ice elementals'],
    rewards: 'Epic runes, crystal-forged weapons',
  },
  {
    id: 'starlight_observatory',
    name: 'Starlight Observatory',
    description: 'An open stretch of the bridge where the cosmos is laid bare, and starlight itself fuels the journey.',
    difficulty: 5,
    unlockLevel: 20,
    icon: '🌟',
    color: '#FFFACD',
    dangers: ['Cosmic radiation', 'Starfall', 'Void eddies'],
    rewards: 'Epic runes, stellar artifacts',
  },
  {
    id: 'void_crossing',
    name: 'Void Crossing',
    description: 'The most perilous section — where the bridge passes through the space between worlds.',
    difficulty: 6,
    unlockLevel: 28,
    icon: '🕳️',
    color: '#2D1B69',
    dangers: ['Void walkers', 'Dimensional tears', 'Gravity anomalies'],
    rewards: 'Epic runes, void-forged artifacts',
  },
  {
    id: 'asgard_approach',
    name: 'Asgard Approach',
    description: 'The golden fields of Asgard come into view as the bridge nears its celestial destination.',
    difficulty: 7,
    unlockLevel: 36,
    icon: '🏰',
    color: '#FFD700',
    dangers: ['Einherjar patrols', 'Golden guardians', 'Aesir wards'],
    rewards: 'Legendary runes, Asgardian artifacts',
  },
  {
    id: 'heimdalls_tower',
    name: "Heimdall's Tower",
    description: 'The final destination — Heimdall the Watchful stands guard, granting passage only to the worthy.',
    difficulty: 8,
    unlockLevel: 44,
    icon: '👁️',
    color: '#FF4500',
    dangers: ["Heimdall's trials", 'Allfather tests', 'Bifrost collapse'],
    rewards: 'Legendary everything, Bifröst Guardian title',
  },
]

// ─── Static Data — Guardians (35 total) ──────────────────────────

export const RB_GUARDIANS: RbGuardian[] = [
  // Common (10)
  { id: 'g-01', name: 'Bjorn Shield-Bearer', title: 'Shieldwall Recruit', rarity: 'Common', realm: 'mortal_shore', power: 8, defense: 12, description: 'A sturdy warrior from Midgard sworn to protect the bridge.', lore: 'Bjorn took his oath at the age of sixteen, swearing to defend the rainbow path until his last breath.', icon: '🛡️', cost: 50, unlockLevel: 1 },
  { id: 'g-02', name: 'Sigrid Swift-Wind', title: 'Bridge Runner', rarity: 'Common', realm: 'rainbow_span', power: 10, defense: 6, description: 'A swift messenger who patrols the rainbow span at incredible speed.', lore: 'Sigrid can traverse the entire Rainbow Span before the dew settles, earning her the name Swift-Wind.', icon: '💨', cost: 55, unlockLevel: 1 },
  { id: 'g-03', name: 'Erik Stone-Fist', title: 'Mason of the Shore', rarity: 'Common', realm: 'mortal_shore', power: 12, defense: 8, description: 'A skilled mason who repairs bridge segments with bare hands.', lore: 'Erik learned his craft from dwarven masons, building fortifications that withstand giants.', icon: '✊', cost: 60, unlockLevel: 2 },
  { id: 'g-04', name: 'Astrid Light-Seer', title: 'Prism Reader', rarity: 'Common', realm: 'rainbow_span', power: 6, defense: 10, description: 'A seer who reads the color patterns of the bridge to detect threats.', lore: 'Astrid perceives threats as shifts in the rainbow spectrum, each color a different warning.', icon: '👁️', cost: 50, unlockLevel: 2 },
  { id: 'g-05', name: 'Leif Wave-Rider', title: 'Shore Warden', rarity: 'Common', realm: 'mortal_shore', power: 9, defense: 9, description: 'A seasoned warden who patrols the Mortal Shore with vigilance.', lore: 'Leif has never let a single threat cross from Midgard onto the bridge unnoticed.', icon: '🌊', cost: 55, unlockLevel: 3 },
  { id: 'g-06', name: 'Thora Ember-Smith', title: 'Rune Keeper', rarity: 'Common', realm: 'storm_gate', power: 7, defense: 11, description: 'A smith who forges protective runes into the bridge structure.', lore: 'Thora infuses the bridge with ember-runes that burn any who would do it harm.', icon: '🔨', cost: 60, unlockLevel: 3 },
  { id: 'g-07', name: 'Halvard Iron-Boot', title: 'Storm Marcher', rarity: 'Common', realm: 'storm_gate', power: 11, defense: 10, description: 'A heavy-footed warrior who charges through storms unflinchingly.', lore: 'Halvard wears iron boots forged by Sindri, weighing forty pounds each, yet he moves as if weightless.', icon: '🥾', cost: 65, unlockLevel: 4 },
  { id: 'g-08', name: 'Ylva Frost-Maiden', title: 'Crystal Tender', rarity: 'Common', realm: 'crystal_passage', power: 8, defense: 9, description: 'A maiden of the frost who tends the crystals of the passage.', lore: 'Ylva sings to the crystals each dawn, keeping them pure and resonant.', icon: '❄️', cost: 55, unlockLevel: 4 },
  { id: 'g-09', name: 'Ketil Dawn-Watcher', title: 'Sunrise Sentinel', rarity: 'Common', realm: 'starlight_observatory', power: 7, defense: 8, description: 'A watcher who guards the observatory through the twilight hours.', lore: 'Ketil sleeps only when the stars are hidden, keeping vigil from dusk to dawn.', icon: '🌄', cost: 50, unlockLevel: 5 },
  { id: 'g-10', name: 'Rolf Void-Sniffer', title: 'Abyss Hound', rarity: 'Common', realm: 'void_crossing', power: 10, defense: 7, description: 'A tracker who can smell disturbances in the fabric of reality.', lore: 'Rolf lost his sense of taste but gained the ability to smell dimensional tears.', icon: '🐕', cost: 60, unlockLevel: 5 },
  // Uncommon (8)
  { id: 'g-11', name: 'Hrolf Rainbow-Smith', title: 'Prism Forgemaster', rarity: 'Uncommon', realm: 'rainbow_span', power: 16, defense: 14, description: 'A master smith who can extract prismatic energy from the bridge itself.', lore: 'Hrolf was taught by the light elves and can shape rainbow essence into powerful runes.', icon: '🔨', cost: 150, unlockLevel: 6 },
  { id: 'g-12', name: 'Gunnvor Storm-Shield', title: 'Thunder Warden', rarity: 'Uncommon', realm: 'storm_gate', power: 18, defense: 16, description: 'A shieldmaiden who channels lightning through her enchanted shield.', lore: 'Gunnvor captured a bolt of Thor\'s lightning in her shield during the Great Storm of Vanaheim.', icon: '⚡', cost: 180, unlockLevel: 8 },
  { id: 'g-13', name: 'Orm Crystal-Warden', title: 'Resonance Knight', rarity: 'Uncommon', realm: 'crystal_passage', power: 15, defense: 18, description: 'A knight who uses crystal resonance to create protective barriers.', lore: 'Orm discovered that the bridge crystals respond to specific harmonic frequencies he produces with his sword.', icon: '💎', cost: 160, unlockLevel: 10 },
  { id: 'g-14', name: 'Solveig Star-Caller', title: 'Celestial Herald', rarity: 'Uncommon', realm: 'starlight_observatory', power: 14, defense: 15, description: 'A herald who calls upon starlight to illuminate hidden paths.', lore: 'Solveig can summon the light of any visible star to guide travelers through darkness.', icon: '⭐', cost: 170, unlockLevel: 12 },
  { id: 'g-15', name: 'Tyrving Void-Walker', title: 'Dimension Scout', rarity: 'Uncommon', realm: 'void_crossing', power: 20, defense: 12, description: 'A scout who can briefly step into the void to flank enemies.', lore: 'Tyrving learned void-walking from Loki himself, though he refuses to use it for treachery.', icon: '🌀', cost: 190, unlockLevel: 14 },
  { id: 'g-16', name: 'Brynhild Asgard-Born', title: 'Golden Protector', rarity: 'Uncommon', realm: 'asgard_approach', power: 19, defense: 17, description: 'A shieldmaiden born in Asgard who returns to defend the approach.', lore: 'Brynhild was granted leave from Valhalla to protect the bridge during times of crisis.', icon: '🛡️', cost: 200, unlockLevel: 16 },
  { id: 'g-17', name: 'Freydís Iron-Mind', title: 'Bridge Psychopomp', rarity: 'Uncommon', realm: 'mortal_shore', power: 17, defense: 13, description: 'A psychopomp who guides worthy souls safely across the bridge.', lore: 'Freydís can see the worthiness of any soul at a glance, a gift from the Norns.', icon: '🧠', cost: 165, unlockLevel: 7 },
  { id: 'g-18', name: 'Kari Frost-Giant-Slayer', title: 'Winter\'s Bane', rarity: 'Uncommon', realm: 'crystal_passage', power: 21, defense: 15, description: 'A warrior who has slain twelve frost giants guarding the passage.', lore: 'Kari\'s blade is forged from the heart of a fallen frost giant, eternally cold and razor-sharp.', icon: '🗡️', cost: 185, unlockLevel: 11 },
  // Rare (8)
  { id: 'g-19', name: 'Hundgard Storm-Breaker', title: 'Thor\'s Vanguard', rarity: 'Rare', realm: 'storm_gate', power: 28, defense: 24, description: 'A berserker who wields a fragment of Mjolnir\'s power.', lore: 'Hundgard was struck by a splinter of Mjolnir during a battle and absorbed its essence.', icon: '⚡', cost: 400, unlockLevel: 16 },
  { id: 'g-20', name: 'Revna Crystal-Queen', title: 'Resonance Sovereign', rarity: 'Rare', realm: 'crystal_passage', power: 24, defense: 30, description: 'A queen of the crystal realm who commands every crystal on the bridge.', lore: 'Revna can make the bridge crystals sing in unison, creating barriers of devastating resonance.', icon: '👑', cost: 450, unlockLevel: 18 },
  { id: 'g-21', name: 'Vali Void-Weaver', title: 'Fabric Mender', rarity: 'Rare', realm: 'void_crossing', power: 30, defense: 22, description: 'A weaver who can stitch tears in reality using void threads.', lore: 'Vali learned from the Norns themselves, though she only repairs rather than creating fate.', icon: '🕸️', cost: 420, unlockLevel: 20 },
  { id: 'g-22', name: 'Sigurd Star-Forged', title: 'Astral Knight', rarity: 'Rare', realm: 'starlight_observatory', power: 26, defense: 26, description: 'A knight whose armor was forged in the heart of a dying star.', lore: 'Sigurd\'s armor pulses with stellar energy, making him glow like a constellation in battle.', icon: '🌟', cost: 440, unlockLevel: 22 },
  { id: 'g-23', name: 'Thrand Eagle-Eye', title: 'Heimdall\'s Deputy', rarity: 'Rare', realm: 'heimdalls_tower', power: 22, defense: 28, description: 'A deputy watcher whose eyes rival Heimdall\'s own perception.', lore: 'Thrand can see across all nine realms simultaneously for brief moments, though it exhausts him greatly.', icon: '🦅', cost: 480, unlockLevel: 25 },
  { id: 'g-24', name: 'Gerd Rainbow-Daughter', title: 'Prism Enchantress', rarity: 'Rare', realm: 'rainbow_span', power: 20, defense: 25, description: 'A daughter of the rainbow who can bend light into weapons.', lore: 'Gerd was born when Freyja blessed the bridge, granting her innate control over its prismatic energy.', icon: '🌈', cost: 400, unlockLevel: 15 },
  { id: 'g-25', name: 'Einar Rune-Warden', title: 'Futhark Guardian', rarity: 'Rare', realm: 'mortal_shore', power: 25, defense: 24, description: 'A warden who inscribes protective runes along the bridge path.', lore: 'Einar knows all 24 runes of the Elder Futhark and can inscribe them mid-combat.', icon: 'ᚱ', cost: 410, unlockLevel: 14 },
  { id: 'g-26', name: 'Ragnhild Asgard\'s Blade', title: 'Valkyrie Commander', rarity: 'Rare', realm: 'asgard_approach', power: 32, defense: 22, description: 'A Valkyrie commander who leads a squadron of shieldmaidens.', lore: 'Ragnhild answers directly to Freyja and has been granted a winged helm forged by Ivaldi.', icon: '⚔️', cost: 470, unlockLevel: 24 },
  // Epic (6)
  { id: 'g-27', name: 'Bragi Verse-Smith', title: 'Poet of the Bridge', rarity: 'Epic', realm: 'rainbow_span', power: 35, defense: 30, description: 'The god of poetry himself lends his power to strengthen the bridge with song.', lore: 'Bragi\'s words become physical enchantments — each verse he speaks adds a layer of protective magic to the bridge.', icon: '📜', cost: 900, unlockLevel: 28 },
  { id: 'g-28', name: 'Skadi Frost-Queen', title: 'Winter Sovereign', rarity: 'Epic', realm: 'crystal_passage', power: 38, defense: 34, description: 'The goddess of winter freezes threats solid with a single gesture.', lore: 'Skadi can lower the temperature of any bridge segment to absolute zero, stopping all molecular motion.', icon: '🧊', cost: 950, unlockLevel: 30 },
  { id: 'g-29', name: 'Magni Thunder-Prince', title: 'Son of Thor', rarity: 'Epic', realm: 'storm_gate', power: 42, defense: 32, description: 'Thor\'s own son, wielding inherited power over storms.', lore: 'Magni lifted the leg of the giant Hrungnir from Thor when no other could, proving his strength surpasses even his father\'s.', icon: '🔨', cost: 1000, unlockLevel: 32 },
  { id: 'g-30', name: 'Nott Void-Queen', title: 'Sovereign of Night', rarity: 'Epic', realm: 'void_crossing', power: 36, defense: 38, description: 'The personification of night herself commands the void crossing.', lore: 'Nott is the daughter of Narvi and rides the dark-maned horse Hrimfaxi through the spaces between worlds.', icon: '🌑', cost: 980, unlockLevel: 34 },
  { id: 'g-31', name: 'Hildr War-Valkyrie', title: 'Battle Maiden', rarity: 'Epic', realm: 'asgard_approach', power: 40, defense: 30, description: 'A legendary Valkyrie who decides the fate of warriors on the bridge.', lore: 'Hildr\'s spear strikes without missing. Those she deems worthy are carried to Valhalla.', icon: '🗡️', cost: 920, unlockLevel: 33 },
  { id: 'g-32', name: 'Vidar Silent-Step', title: 'The Avenger', rarity: 'Epic', realm: 'heimdalls_tower', power: 44, defense: 28, description: 'Odin\'s silent son who will avenge the Allfather at Ragnarok.', lore: 'Vidar wears a shoe crafted from all the leather scraps ever discarded by cobblers. It can tear apart the jaws of Fenrir.', icon: '🤫', cost: 1100, unlockLevel: 36 },
  // Legendary (3)
  { id: 'g-33', name: 'Heimdall All-Sight', title: 'The Watchman of Gods', rarity: 'Legendary', realm: 'heimdalls_tower', power: 55, defense: 45, description: 'Heimdall himself — guardian of the Bifröst, whose eyes and ears transcend all barriers.', lore: 'Heimdall needs less sleep than a bird, can see a hundred leagues by day or night, and hears grass growing on the earth.', icon: '👁️', cost: 2500, unlockLevel: 42 },
  { id: 'g-34', name: 'Tyr Law-Bringer', title: 'God of Justice', rarity: 'Legendary', realm: 'asgard_approach', power: 50, defense: 50, description: 'Tyr, the one-handed god of justice, who sacrificed for the safety of all realms.', lore: 'Tyr placed his hand in Fenrir\'s mouth so the gods could bind the great wolf. He rules by law, not force.', icon: '⚖️', cost: 2400, unlockLevel: 40 },
  { id: 'g-35', name: 'Freyr Vanir-Lord', title: 'Protector of Bridges', rarity: 'Legendary', realm: 'rainbow_span', power: 48, defense: 52, description: 'Freyr, lord of the Vanir, who blesses the bridge with fertility and abundance.', lore: 'Freyr\'s magic ensures the bridge never truly breaks — it always regenerates, like nature itself.', icon: '🌿', cost: 2300, unlockLevel: 38 },
]

// ─── Static Data — Rune Stones (30 total) ────────────────────────

export const RB_RUNE_STONES: RbRuneStone[] = [
  { id: 'rs-01', name: 'Fehu', symbol: 'ᚠ', power: 10, rarity: 'Common', element: 'fire', description: 'Wealth rune — attracts coins and prosperity to the bridge.', lore: 'The first rune of the Elder Futhark, burning with the fire of material creation.', icon: '🔥' },
  { id: 'rs-02', name: 'Uruz', symbol: 'ᚢ', power: 12, rarity: 'Common', element: 'earth', description: 'Strength rune — reinforces bridge structural integrity.', lore: 'The aurochs horn, drawing raw primal force from deep within the earth.', icon: '🪨' },
  { id: 'rs-03', name: 'Thurisaz', symbol: 'ᚦ', power: 14, rarity: 'Common', element: 'fire', description: 'Thorn rune — creates a thorny barrier on the bridge.', lore: 'The giant\'s thorn burns those who approach with ill intent.', icon: '🌿' },
  { id: 'rs-04', name: 'Ansuz', symbol: 'ᚨ', power: 16, rarity: 'Common', element: 'light', description: 'Wisdom rune — reveals hidden threats on the bridge path.', lore: 'The mouth of Odin whispers illuminated knowledge to those who listen.', icon: '💡' },
  { id: 'rs-05', name: 'Raidho', symbol: 'ᚱ', power: 13, rarity: 'Common', element: 'air', description: 'Journey rune — increases patrol speed across the bridge.', lore: 'The celestial chariot rides upon air currents, guiding travelers through unseen paths.', icon: '💨' },
  { id: 'rs-06', name: 'Kenaz', symbol: 'ᚲ', power: 15, rarity: 'Common', element: 'fire', description: 'Torch rune — illuminates dark segments of the bridge.', lore: 'The controlled flame of the torch illuminates the darkness of ignorance.', icon: '🔦' },
  { id: 'rs-07', name: 'Wunjo', symbol: 'ᚹ', power: 14, rarity: 'Common', element: 'light', description: 'Joy rune — boosts guardian morale during patrols.', lore: 'The banner of joy unfurls in golden light, bringing warmth to weary hearts.', icon: '😊' },
  { id: 'rs-08', name: 'Nauthiz', symbol: 'ᚾ', power: 15, rarity: 'Common', element: 'earth', description: 'Need rune — fortifies segments under stress.', lore: 'The bar of necessity tempers the soul like steel in earth\'s crucible.', icon: '⛓️' },
  { id: 'rs-09', name: 'Isa', symbol: 'ᛁ', power: 13, rarity: 'Common', element: 'ice', description: 'Ice rune — slows advancing enemies.', lore: 'The frozen pillar stands in absolute silence, the world held in perfect stasis.', icon: '🧊' },
  { id: 'rs-10', name: 'Jera', symbol: 'ᛃ', power: 18, rarity: 'Uncommon', element: 'earth', description: 'Harvest rune — yields bonus coins from patrols.', lore: 'Two sacred spirals interweave the earth\'s bounty, bringing forth harvest in perfect timing.', icon: '🌾' },
  { id: 'rs-11', name: 'Eihwaz', symbol: 'ᛇ', power: 22, rarity: 'Uncommon', element: 'void', description: 'Yew rune — provides void resistance to guardians.', lore: 'The yew tree pierces the veil of void itself, its roots drinking from the well of eternity.', icon: '🌳' },
  { id: 'rs-12', name: 'Perthro', symbol: 'ᛈ', power: 20, rarity: 'Uncommon', element: 'cosmic', description: 'Mystery rune — reveals random encounters on patrol.', lore: 'The dice of destiny tumble through cosmic space, each face a possible future.', icon: '🎲' },
  { id: 'rs-13', name: 'Algiz', symbol: 'ᛉ', power: 22, rarity: 'Uncommon', element: 'light', description: 'Protection rune — creates a sanctuary zone on the bridge.', lore: 'The elk-sedge rises like blazing light, warding all who shelter beneath it.', icon: '🛡️' },
  { id: 'rs-14', name: 'Sowilo', symbol: 'ᛊ', power: 24, rarity: 'Uncommon', element: 'fire', description: 'Sun rune — powers up during daylight patrols.', lore: 'The lightning-bolt of solar fire strikes through darkness, declaring victory with searing brilliance.', icon: '☀️' },
  { id: 'rs-15', name: 'Tiwaz', symbol: 'ᛏ', power: 26, rarity: 'Rare', element: 'light', description: 'Justice rune — empowers guardian combat abilities.', lore: 'The spear of Tyr points skyward, channeling light of unwavering justice.', icon: '⚔️' },
  { id: 'rs-16', name: 'Berkano', symbol: 'ᛒ', power: 22, rarity: 'Uncommon', element: 'earth', description: 'Birth rune — enables bridge segment regeneration.', lore: 'The birch goddess cradles new beginnings, the earth itself swelling with green potential.', icon: '🌱' },
  { id: 'rs-17', name: 'Ehwaz', symbol: 'ᛖ', power: 20, rarity: 'Uncommon', element: 'air', description: 'Partnership rune — boosts guardian synergy bonuses.', lore: 'The twin horses gallop through air and storm, their trust forging an unbreakable bond.', icon: '🐴' },
  { id: 'rs-18', name: 'Mannaz', symbol: 'ᛗ', power: 20, rarity: 'Uncommon', element: 'light', description: 'Humanity rune — reveals enemy weak points.', lore: 'The mirror of mankind reflects divine light inward, revealing the luminous nature of self.', icon: '🪞' },
  { id: 'rs-19', name: 'Laguz', symbol: 'ᛚ', power: 21, rarity: 'Uncommon', element: 'water', description: 'Water rune — heals guardians during patrol.', lore: 'The waterfall of intuition cascades through the waters of consciousness, pure and unending.', icon: '💧' },
  { id: 'rs-20', name: 'Ingwaz', symbol: 'ᛜ', power: 24, rarity: 'Rare', element: 'earth', description: 'Fertility rune — doubles bridge repair efficiency.', lore: 'The closed seed holds infinite earth-energy, waiting for the perfect moment of emergence.', icon: '💎' },
  { id: 'rs-21', name: 'Dagaz', symbol: 'ᛞ', power: 28, rarity: 'Rare', element: 'light', description: 'Dawn rune — resets encounter cooldowns.', lore: 'The dawn breaks through eternal night, a radiant light that transforms darkness into day.', icon: '🌅' },
  { id: 'rs-22', name: 'Othala', symbol: 'ᛟ', power: 30, rarity: 'Epic', element: 'cosmic', description: 'Heritage rune — unlocks ancestral guardian bonuses.', lore: 'The sacred inheritance of the cosmos flows through this rune, connecting past to the stars.', icon: '🏰' },
  { id: 'rs-23', name: 'Hagalaz', symbol: 'ᚺ', power: 32, rarity: 'Rare', element: 'shadow', description: 'Hail rune — damages all enemies on a bridge segment.', lore: 'The hailstone of fate crashes through shadows, tearing down the old to build the new.', icon: '🌨️' },
  { id: 'rs-24', name: 'Gebo', symbol: 'ᚷ', power: 25, rarity: 'Rare', element: 'cosmic', description: 'Gift rune — enables rune forging combination bonuses.', lore: 'The X-shaped union bridges mortal desires with cosmic intent, forging unbreakable bonds.', icon: '🎁' },
  { id: 'rs-25', name: 'Thurisaz Shadow', symbol: 'ᚦ⁂', power: 35, rarity: 'Epic', element: 'shadow', description: 'Shadow Thorn — creates a labyrinth of dark protection.', lore: 'When the giant\'s thorn is bathed in shadow, it grows into a labyrinth of dark protection.', icon: '🌑' },
  { id: 'rs-26', name: 'Sowilo Inverted', symbol: 'ᛊ⁂', power: 38, rarity: 'Epic', element: 'shadow', description: 'Dark Sun — an eclipse rune that devours enemy power.', lore: 'When Sowilo is cast in shadow, its fire becomes an eclipse — consuming, transforming, terrifying.', icon: '🌑' },
  { id: 'rs-27', name: 'Algiz Inverted', symbol: 'ᛉ⁂', power: 36, rarity: 'Epic', element: 'void', description: 'Vulnerability — reveals enemy weak points on the bridge.', lore: 'The inverted elk-sedge opens the void beneath, revealing the fragile truths we hide.', icon: '🕳️' },
  { id: 'rs-28', name: 'Othala Inverted', symbol: 'ᛟ⁂', power: 42, rarity: 'Legendary', element: 'void', description: 'Cosmic Exile — severs enemies from their power source.', lore: 'The dark mirror of heritage reveals what lies beyond the cosmic boundary — terrifying, liberating.', icon: '🌀' },
  { id: 'rs-29', name: 'Perthro Abyssal', symbol: 'ᛈ⁂', power: 40, rarity: 'Legendary', element: 'void', description: 'Abyssal Fate — rolls all enemy fate into the abyss.', lore: 'The dice of destiny fall into the void, where every outcome spirals into beautiful chaos.', icon: '🌀' },
  { id: 'rs-30', name: 'Odin\'s Bind-Rune', symbol: 'ᛟᚺᚦ', power: 55, rarity: 'Legendary', element: 'cosmic', description: 'The Allfather\'s personal bind-rune — ultimate bridge protection.', lore: 'This rune was carved by Odin himself from the bark of Yggdrasil and contains the power of all runes combined.', icon: '👑' },
]

// ─── Static Data — Bridge Segments (25 total) ────────────────────

export const RB_BRIDGE_SEGMENTS: RbBridgeSegment[] = [
  { id: 'bs-01', name: 'Shore Foundation Stone', realm: 'mortal_shore', integrity: 80, maxIntegrity: 100, reinforcedLevel: 0, description: 'The foundational stone where the Bifröst meets Midgard.', icon: '🪨', repairCost: 10, reinforceCost: 25 },
  { id: 'bs-02', name: 'First Rainbow Plank', realm: 'mortal_shore', integrity: 75, maxIntegrity: 100, reinforcedLevel: 0, description: 'The first plank of the shimmering rainbow bridge.', icon: '🌈', repairCost: 12, reinforceCost: 30 },
  { id: 'bs-03', name: 'Midgard Keystone', realm: 'mortal_shore', integrity: 70, maxIntegrity: 100, reinforcedLevel: 0, description: 'A massive keystone anchoring the bridge to the mortal world.', icon: '🔑', repairCost: 15, reinforceCost: 35 },
  { id: 'bs-04', name: 'Red Band Arc', realm: 'rainbow_span', integrity: 65, maxIntegrity: 120, reinforcedLevel: 0, description: 'A brilliant red arc humming with fire energy.', icon: '🔴', repairCost: 20, reinforceCost: 40 },
  { id: 'bs-05', name: 'Orange Glow Span', realm: 'rainbow_span', integrity: 60, maxIntegrity: 120, reinforcedLevel: 0, description: 'A warm orange span that radiates healing energy.', icon: '🟠', repairCost: 22, reinforceCost: 45 },
  { id: 'bs-06', name: 'Golden Core Path', realm: 'rainbow_span', integrity: 55, maxIntegrity: 120, reinforcedLevel: 0, description: 'The golden heart of the rainbow, pulsing with divine light.', icon: '🟡', repairCost: 25, reinforceCost: 50 },
  { id: 'bs-07', name: 'Emerald Link', realm: 'rainbow_span', integrity: 50, maxIntegrity: 120, reinforcedLevel: 0, description: 'A green-hued segment that connects the upper and lower bridge.', icon: '🟢', repairCost: 28, reinforceCost: 55 },
  { id: 'bs-08', name: 'Azure Sky Walk', realm: 'rainbow_span', integrity: 50, maxIntegrity: 120, reinforcedLevel: 0, description: 'A blue path suspended in the sky between realms.', icon: '🔵', repairCost: 30, reinforceCost: 58 },
  { id: 'bs-09', name: 'Violet Ward Gate', realm: 'rainbow_span', integrity: 45, maxIntegrity: 120, reinforcedLevel: 0, description: 'A violet gateway that separates the rainbow from the storm.', icon: '🟣', repairCost: 32, reinforceCost: 60 },
  { id: 'bs-10', name: 'Lightning Rod Pylon', realm: 'storm_gate', integrity: 40, maxIntegrity: 150, reinforcedLevel: 0, description: 'A pylon that channels lightning away from the bridge.', icon: '⚡', repairCost: 40, reinforceCost: 70 },
  { id: 'bs-11', name: 'Thunder Bell Arch', realm: 'storm_gate', integrity: 38, maxIntegrity: 150, reinforcedLevel: 0, description: 'An arch that rings with thunder when threats approach.', icon: '🔔', repairCost: 42, reinforceCost: 75 },
  { id: 'bs-12', name: 'Wind Shield Span', realm: 'storm_gate', integrity: 35, maxIntegrity: 150, reinforcedLevel: 0, description: 'A segment protected by perpetual wind barriers.', icon: '💨', repairCost: 45, reinforceCost: 78 },
  { id: 'bs-13', name: 'Crystal Spire Column', realm: 'crystal_passage', integrity: 30, maxIntegrity: 180, reinforcedLevel: 0, description: 'A column of enchanted crystal humming with stored magic.', icon: '💎', repairCost: 55, reinforceCost: 90 },
  { id: 'bs-14', name: 'Prism Refractor', realm: 'crystal_passage', integrity: 28, maxIntegrity: 180, reinforcedLevel: 0, description: 'A refracting crystal that bends light into protective barriers.', icon: '🔬', repairCost: 58, reinforceCost: 95 },
  { id: 'bs-15', name: 'Ice Crystal Bridge', realm: 'crystal_passage', integrity: 25, maxIntegrity: 180, reinforcedLevel: 0, description: 'A bridge segment made of enchanted ice that never melts.', icon: '❄️', repairCost: 60, reinforceCost: 98 },
  { id: 'bs-16', name: 'Starlight Conduit', realm: 'starlight_observatory', integrity: 22, maxIntegrity: 200, reinforcedLevel: 0, description: 'A conduit that channels starlight to power the bridge wards.', icon: '🌟', repairCost: 70, reinforceCost: 110 },
  { id: 'bs-17', name: 'Constellation Platform', realm: 'starlight_observatory', integrity: 20, maxIntegrity: 200, reinforcedLevel: 0, description: 'A platform inscribed with ever-shifting constellation patterns.', icon: '✨', repairCost: 75, reinforceCost: 115 },
  { id: 'bs-18', name: 'Nebula Walkway', realm: 'starlight_observatory', integrity: 18, maxIntegrity: 200, reinforcedLevel: 0, description: 'A walkway shrouded in cosmic nebula dust.', icon: '🌌', repairCost: 78, reinforceCost: 118 },
  { id: 'bs-19', name: 'Void Anchor Chain', realm: 'void_crossing', integrity: 15, maxIntegrity: 250, reinforcedLevel: 0, description: 'Chains that anchor the bridge in reality at the void edge.', icon: '⛓️', repairCost: 95, reinforceCost: 140 },
  { id: 'bs-20', name: 'Dimensional Stabilizer', realm: 'void_crossing', integrity: 12, maxIntegrity: 250, reinforcedLevel: 0, description: 'A device that prevents the bridge from slipping between dimensions.', icon: '🌀', repairCost: 100, reinforceCost: 145 },
  { id: 'bs-21', name: 'Reality Anchor Pillar', realm: 'void_crossing', integrity: 10, maxIntegrity: 250, reinforcedLevel: 0, description: 'The last tether to reality before entering the void proper.', icon: '📌', repairCost: 105, reinforceCost: 150 },
  { id: 'bs-22', name: 'Golden Approach Ramp', realm: 'asgard_approach', integrity: 8, maxIntegrity: 300, reinforcedLevel: 0, description: 'A golden ramp leading up toward the gates of Asgard.', icon: '🏰', repairCost: 130, reinforceCost: 170 },
  { id: 'bs-23', name: 'Aesir Ward Threshold', realm: 'asgard_approach', integrity: 6, maxIntegrity: 300, reinforcedLevel: 0, description: 'The threshold protected by ancient Aesir ward magic.', icon: '🛡️', repairCost: 140, reinforceCost: 180 },
  { id: 'bs-24', name: 'Heimdall\'s Signal Post', realm: 'heimdalls_tower', integrity: 4, maxIntegrity: 400, reinforcedLevel: 0, description: 'The signal post where Heimdall sends his Gjallarhorn warning.', icon: '📯', repairCost: 180, reinforceCost: 220 },
  { id: 'bs-25', name: 'Bifrrost Apex Keystone', realm: 'heimdalls_tower', integrity: 2, maxIntegrity: 500, reinforcedLevel: 0, description: 'The crown jewel of the Bifröst — the apex keystone that connects all realms.', icon: '👑', repairCost: 250, reinforceCost: 300 },
]

// ─── Static Data — Artifacts (20 total) ──────────────────────────

export const RB_ARTIFACTS: RbArtifact[] = [
  { id: 'a-01', name: 'Mjolnir Replica', rarity: 'Rare', type: 'weapon', power: 30, description: 'A replica of Thor\'s hammer imbued with residual thunder power.', lore: 'Forged in the remains of a lightning strike that hit the bridge during construction.', icon: '🔨', cost: 300 },
  { id: 'a-02', name: 'Gungnir Fragment', rarity: 'Rare', type: 'weapon', power: 28, description: 'A shard of Odin\'s spear that never misses its target.', lore: 'This fragment was found embedded in the Rainbow Span by a patrol long ago.', icon: '🗡️', cost: 280 },
  { id: 'a-03', name: 'Hofund Shard', rarity: 'Epic', type: 'weapon', power: 38, description: 'A piece of Heimdall\'s legendary sword Hofund.', lore: 'Heimdall shed a sliver of his blade during the first defense of the bridge.', icon: '⚔️', cost: 600 },
  { id: 'a-04', name: 'Draupnir Ring', rarity: 'Legendary', type: 'accessory', power: 45, description: 'Odin\'s arm ring that duplicates itself every ninth night.', lore: 'The original Draupnir was crafted by the dwarf Sindri. This is its bridge-bound echo.', icon: '💍', cost: 1500 },
  { id: 'a-05', name: 'Gjallarhorn Echo', rarity: 'Epic', type: 'accessory', power: 35, description: 'A sounding horn that echoes Heimdall\'s legendary call.', lore: 'When blown, this horn\'s sound carries across all eight realms of the bridge.', icon: '📯', cost: 550 },
  { id: 'a-06', name: 'Megingjard Belt', rarity: 'Legendary', type: 'armor', power: 50, description: 'Thor\'s belt of strength that doubles the wearer\'s power.', lore: 'Wearing this belt, even the weakest guardian becomes a force of nature on the bridge.', icon: '🪢', cost: 1600 },
  { id: 'a-07', name: 'Brisingamen Pendant', rarity: 'Epic', type: 'accessory', power: 36, description: 'Freyja\'s necklace that glows with otherworldly beauty.', lore: 'The Brisingamen was forged by four dwarves and radiates the beauty of the cosmos.', icon: '📿', cost: 620 },
  { id: 'a-08', name: 'Ratatoskr Scroll', rarity: 'Uncommon', type: 'consumable', power: 18, description: 'A scroll carried by Ratatoskr up and down the World Tree.', lore: 'Contains messages whispered between the eagle and the dragon that guard Yggdrasil.', icon: '📜', cost: 120 },
  { id: 'a-09', name: 'Ivaldi\'s Lens', rarity: 'Rare', type: 'accessory', power: 26, description: 'A lens crafted by the dwarf Ivaldi that reveals hidden runes.', lore: 'Through this lens, invisible runes etched into the bridge become clearly visible.', icon: '🔍', cost: 320 },
  { id: 'a-10', name: 'Gleipnir Chain Link', rarity: 'Legendary', type: 'armor', power: 48, description: 'A link from the chain that binds Fenrir the wolf.', lore: 'Even a single link of Gleipnir is stronger than any iron chain ever forged.', icon: '⛓️', cost: 1400 },
  { id: 'a-11', name: 'Mimir\'s Eye Flask', rarity: 'Epic', type: 'consumable', power: 32, description: 'A flask containing water from Mimir\'s Well of Wisdom.', lore: 'One sip grants temporary omniscience about bridge threats.', icon: '🫗', cost: 500 },
  { id: 'a-12', name: 'Nidhogg Scale', rarity: 'Rare', type: 'armor', power: 27, description: 'A scale shed by Nidhogg, the dragon that gnaws Yggdrasil\'s roots.', lore: 'This scale is impervious to all physical and magical damage from the nine realms.', icon: '🐉', cost: 340 },
  { id: 'a-13', name: 'Gullinbursti Bristle', rarity: 'Uncommon', type: 'consumable', power: 16, description: 'A golden bristle from Frey\'s boar Gullinbursti.', lore: 'This bristle glows with golden light and can illuminate the darkest void crossing.', icon: '🐗', cost: 130 },
  { id: 'a-14', name: 'Skidbladnir Plank', rarity: 'Rare', type: 'consumable', power: 25, description: 'A plank from Odin\'s ship that always finds a favorable wind.', lore: 'Skidbladnir was made by the dwarves and can fold small enough to fit in a pocket.', icon: '⛵', cost: 310 },
  { id: 'a-15', name: 'Hildisvini Boar Tusk', rarity: 'Uncommon', type: 'weapon', power: 15, description: 'A tusk from Freyja\'s battle boar Hildisvini.', lore: 'Though Freyja rides in a cat-drawn chariot, her boar Hildisvini fights alongside her in battle.', icon: '🐗', cost: 110 },
  { id: 'a-16', name: 'Andvaranaut Ring', rarity: 'Epic', type: 'accessory', power: 37, description: 'Andvari\'s ring that can sense gold and treasure.', lore: 'This ring hums when valuable artifacts are nearby, guiding collectors to hidden treasures.', icon: '💍', cost: 580 },
  { id: 'a-17', name: 'Ydalir Arrow', rarity: 'Uncommon', type: 'weapon', power: 14, description: 'An arrow from Ullr\'s bow of yew wood.', lore: 'Ullr the hunter god never misses with arrows from Ydalir, his ancient yew bow.', icon: '🏹', cost: 100 },
  { id: 'a-18', name: 'Aurvandil\'s Toe', rarity: 'Rare', type: 'consumable', power: 24, description: 'The toe frost that Thor threw into the sky to become a star.', lore: 'This celestial fragment still carries the warmth of the star it became.', icon: '⭐', cost: 300 },
  { id: 'a-19', name: 'Laevateinn Wand', rarity: 'Legendary', type: 'weapon', power: 52, description: 'The deadliest weapon in Norse mythology, forged in the underworld.', lore: 'Laevateinn was crafted by dwarves in the underworld and can slay any being, even gods.', icon: '🪄', cost: 1800 },
  { id: 'a-20', name: 'Gungnir Full Replica', rarity: 'Legendary', type: 'weapon', power: 55, description: 'A near-perfect replica of Odin\'s all-knowing spear.', lore: 'This replica was assembled from ten fragments found across all eight bridge realms.', icon: '🔱', cost: 2000 },
]

// ─── Static Data — Titles (8 total) ──────────────────────────────

export const RB_TITLES: RbTitle[] = [
  { id: 't-01', name: 'Bridge Walker', requiredLevel: 1, description: 'A humble traveler who has begun walking the rainbow path.', color: '#9CA3AF' },
  { id: 't-02', name: 'Rune Collector', requiredLevel: 5, description: 'Has collected enough rune stones to begin understanding bridge magic.', color: '#22C55E' },
  { id: 't-03', name: 'Bridge Mason', requiredLevel: 10, description: 'A skilled mason who can repair and reinforce bridge segments.', color: '#3B82F6' },
  { id: 't-04', name: 'Guardian Captain', requiredLevel: 18, description: 'Commands a squad of loyal bridge guardians.', color: '#6366F1' },
  { id: 't-05', name: 'Rune Forgemaster', requiredLevel: 25, description: 'Can forge powerful rune combinations from collected stones.', color: '#A855F7' },
  { id: 't-06', name: 'Realm Explorer', requiredLevel: 33, description: 'Has explored the deepest and most dangerous bridge realms.', color: '#EC4899' },
  { id: 't-07', name: 'Bifröst Champion', requiredLevel: 42, description: 'A legendary warrior who has defended the bridge against all threats.', color: '#F59E0B' },
  { id: 't-08', name: 'Bifröst Guardian', requiredLevel: 50, description: 'The supreme guardian of the rainbow bridge, second only to Heimdall.', color: '#FFD700' },
]

// ─── Static Data — Achievements (18 total) ───────────────────────

export const RB_ACHIEVEMENTS: RbAchievement[] = [
  { id: 'ach-01', name: 'First Step', description: 'Begin your journey across the Bifröst.', icon: '👣', condition: 'first_patrol', reward: { type: 'xp', value: 30 } },
  { id: 'ach-02', name: 'Rune Student', description: 'Collect your first rune stone.', icon: 'ᚠ', condition: 'collect_first_rune', reward: { type: 'xp', value: 25 } },
  { id: 'ach-03', name: 'Bridge Mason', description: 'Repair 10 bridge segments.', icon: '🧱', condition: 'repair_10_segments', reward: { type: 'coins', value: 200 } },
  { id: 'ach-04', name: 'Guardian Lord', description: 'Recruit 5 guardians.', icon: '🛡️', condition: 'recruit_5_guardians', reward: { type: 'xp', value: 100 } },
  { id: 'ach-05', name: 'Forge Master', description: 'Forge 10 runes from collected stones.', icon: '🔨', condition: 'forge_10_runes', reward: { type: 'xp', value: 150 } },
  { id: 'ach-06', name: 'Patrol Regular', description: 'Complete 7 daily patrols.', icon: '🚶', condition: 'complete_7_patrols', reward: { type: 'coins', value: 300 } },
  { id: 'ach-07', name: 'Realm Wanderer', description: 'Explore all 8 bridge realms.', icon: '🌍', condition: 'explore_all_realms', reward: { type: 'xp', value: 300 } },
  { id: 'ach-08', name: 'Artifact Hunter', description: 'Collect 10 divine artifacts.', icon: '🏺', condition: 'collect_10_artifacts', reward: { type: 'coins', value: 500 } },
  { id: 'ach-09', name: 'Iron Bridge', description: 'Reinforce a bridge segment to level 5.', icon: '🔩', condition: 'reinforce_to_5', reward: { type: 'xp', value: 200 } },
  { id: 'ach-10', name: 'Veteran Walker', description: 'Reach level 25 on the Bifröst.', icon: '🌟', condition: 'reach_level_25', reward: { type: 'coins', value: 800 } },
  { id: 'ach-11', name: 'Legend of the Bridge', description: 'Reach level 50 — become a Bifröst Guardian.', icon: '👑', condition: 'reach_level_50', reward: { type: 'xp', value: 1000 } },
  { id: 'ach-12', name: 'Full Arsenal', description: 'Collect all 20 divine artifacts.', icon: '⚔️', condition: 'collect_all_artifacts', reward: { type: 'coins', value: 2000 } },
  { id: 'ach-13', name: 'Guardian Army', description: 'Recruit 20 guardians.', icon: '👥', condition: 'recruit_20_guardians', reward: { type: 'xp', value: 400 } },
  { id: 'ach-14', name: 'Bridge Fully Restored', description: 'Repair all 25 bridge segments to full integrity.', icon: '🌈', condition: 'repair_all_segments', reward: { type: 'xp', value: 500 } },
  { id: 'ach-15', name: 'Rune Library', description: 'Collect all 30 rune stones.', icon: '📚', condition: 'collect_all_runes', reward: { type: 'xp', value: 600 } },
  { id: 'ach-16', name: 'Patrol Devotee', description: 'Maintain an exploration streak of 7 consecutive days.', icon: '🔥', condition: 'streak_7_days', reward: { type: 'coins', value: 400 } },
  { id: 'ach-17', name: 'Fortress Bifröst', description: 'Reinforce a bridge segment to maximum level 10.', icon: '🏰', condition: 'reinforce_to_max', reward: { type: 'xp', value: 350 } },
  { id: 'ach-18', name: 'Wealth of Asgard', description: 'Earn 10,000 total coins across all activities.', icon: '💰', condition: 'earn_10000_coins', reward: { type: 'xp', value: 500 } },
]

// ─── Static Data — Encounters ───────────────────────────────────

export const RB_ENCOUNTERS: RbEncounter[] = [
  { type: 'battle', name: 'Frost Giant Ambush', difficulty: 2, reward: { type: 'coins', value: 30 }, description: 'A frost giant emerges from a blizzard on the bridge!', icon: '🧊' },
  { type: 'battle', name: 'Troll Raiding Party', difficulty: 3, reward: { type: 'coins', value: 50 }, description: 'Trolls attempt to smash the bridge segments!', icon: '👹' },
  { type: 'discovery', name: 'Lost Dwarven Cache', difficulty: 1, reward: { type: 'coins', value: 80 }, description: 'You discover a cache of dwarf-forged materials!', icon: '📦' },
  { type: 'battle', name: 'Fire Giant Scout', difficulty: 4, reward: { type: 'coins', value: 70 }, description: 'A fire giant from Muspelheim tests the bridge defenses!', icon: '🔥' },
  { type: 'discovery', name: 'Valkyrie Gift', difficulty: 2, reward: { type: 'xp', value: 60 }, description: 'A Valkyrie grants you a blessing for your bravery.', icon: '🪽' },
  { type: 'battle', name: 'Dark Elf Sorcerer', difficulty: 5, reward: { type: 'coins', value: 100 }, description: 'A dark elf casts hexes on the bridge crystals!', icon: '🧙' },
  { type: 'discovery', name: 'Runestone Cache', difficulty: 2, reward: { type: 'xp', value: 40 }, description: 'You unearth an ancient runestone buried in the bridge!', icon: '🪨' },
  { type: 'battle', name: 'Surtur\'s Herald', difficulty: 6, reward: { type: 'coins', value: 150 }, description: 'A fire demon announces the approach of Surtur\'s army!', icon: '😈' },
  { type: 'discovery', name: 'Heimdall\'s Whisper', difficulty: 3, reward: { type: 'xp', value: 100 }, description: 'Heimdall\'s distant voice guides you to hidden treasure.', icon: '👁️' },
  { type: 'battle', name: 'Void Wraith', difficulty: 7, reward: { type: 'coins', value: 200 }, description: 'A creature from between worlds seeps through a crack in reality!', icon: '👻' },
  { type: 'discovery', name: 'Yggdrasil Root Fragment', difficulty: 4, reward: { type: 'xp', value: 80 }, description: 'A root of the World Tree has grown into the bridge!', icon: '🌳' },
  { type: 'battle', name: 'Jormungandr Scout', difficulty: 8, reward: { type: 'coins', value: 300 }, description: 'The World Serpent tests the bridge with its immense weight!', icon: '🐍' },
  { type: 'discovery', name: 'Asgardian Chest', difficulty: 5, reward: { type: 'coins', value: 250 }, description: 'A chest from Asgard containing divine treasures!', icon: '🎁' },
  { type: 'battle', name: 'Muspelheim Invasion', difficulty: 9, reward: { type: 'coins', value: 400 }, description: 'An army of fire demons pours through a dimensional rift!', icon: '🌋' },
  { type: 'discovery', name: 'Odin\'s Raven Message', difficulty: 6, reward: { type: 'xp', value: 150 }, description: 'One of Odin\'s ravens drops a scroll of ancient knowledge.', icon: '🐦‍⬛' },
  { type: 'battle', name: 'Fenrir\'s Howl', difficulty: 10, reward: { type: 'coins', value: 500 }, description: 'The great wolf Fenrir tests the bridge\'s ultimate defenses!', icon: '🐺' },
]

// ─── Default State ────────────────────────────────────────────────

const RB_DEFAULT_STATE: RainbowBridgeState = {
  level: 1,
  xp: 0,
  coins: 100,
  currentRealm: 'mortal_shore',
  collectedRunes: [],
  forgedRunes: [],
  recruitedGuardians: [],
  segmentStatuses: [],
  collectedArtifacts: [],
  unlockedAchievements: [],
  patrolLog: [],
  totalRuneCollected: 0,
  totalRunesForged: 0,
  totalGuardiansRecruited: 0,
  totalSegmentsRepaired: 0,
  totalSegmentsReinforced: 0,
  totalArtifactsCollected: 0,
  totalRealmsExplored: 0,
  totalPatrolsCompleted: 0,
  totalCoinsSpent: 0,
  totalCoinsEarned: 0,
  totalXpEarned: 0,
  bridgeIntegrity: 0,
  dailyPatrol: null,
  explorationStreak: 0,
  lastExplorationDate: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// ─── Helper Functions ─────────────────────────────────────────────

function rbLoadState(): RainbowBridgeState {
  if (typeof window === 'undefined') return { ...RB_DEFAULT_STATE }
  try {
    const raw = localStorage.getItem(RB_SAVE_KEY)
    if (!raw) return { ...RB_DEFAULT_STATE }
    const parsed = JSON.parse(raw) as Partial<RainbowBridgeState>
    return { ...RB_DEFAULT_STATE, ...parsed }
  } catch {
    return { ...RB_DEFAULT_STATE }
  }
}

function rbSaveState(state: RainbowBridgeState): void {
  if (typeof window === 'undefined') return
  try {
    const toSave = { ...state, updatedAt: new Date().toISOString() }
    localStorage.setItem(RB_SAVE_KEY, JSON.stringify(toSave))
  } catch {
    // Storage unavailable — silently degrade
  }
}

function rbGetTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

function rbGetYesterdayString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function rbCalculateLevel(xp: number): number {
  for (let i = RB_MAX_LEVEL; i >= 1; i--) {
    if (xp >= RB_XP_TABLE[i]) return i
  }
  return 1
}

function rbGetXpForLevel(level: number): number {
  if (level < 1) return 0
  if (level > RB_MAX_LEVEL) return RB_XP_TABLE[RB_MAX_LEVEL]
  return RB_XP_TABLE[level]
}

function rbGetXpForNextLevel(level: number): number {
  if (level >= RB_MAX_LEVEL) return RB_XP_TABLE[RB_MAX_LEVEL]
  return RB_XP_TABLE[level + 1]
}

function rbFindGuardianById(id: string): RbGuardian | undefined {
  return RB_GUARDIANS.find((g) => g.id === id)
}

function rbFindRuneStoneById(id: string): RbRuneStone | undefined {
  return RB_RUNE_STONES.find((r) => r.id === id)
}

function rbFindSegmentById(id: string): RbBridgeSegment | undefined {
  return RB_BRIDGE_SEGMENTS.find((s) => s.id === id)
}

function rbFindArtifactById(id: string): RbArtifact | undefined {
  return RB_ARTIFACTS.find((a) => a.id === id)
}

function rbFindRealmById(id: RbRealmKey): RbRealm | undefined {
  return RB_REALMS.find((r) => r.id === id)
}

function rbFindAchievementById(id: string): RbAchievement | undefined {
  return RB_ACHIEVEMENTS.find((a) => a.id === id)
}

function rbFindTitleForLevel(level: number): RbTitle {
  let best = RB_TITLES[0]
  for (const title of RB_TITLES) {
    if (level >= title.requiredLevel) {
      best = title
    } else {
      break
    }
  }
  return best
}

function rbGetRealmIndex(id: RbRealmKey): number {
  return RB_REALM_ORDER.indexOf(id)
}

function rbCalculateBridgeIntegrity(segmentStatuses: RbSegmentStatus[]): number {
  if (segmentStatuses.length === 0) return 0
  let totalIntegrity = 0
  let totalMaxIntegrity = 0
  for (const ss of segmentStatuses) {
    const seg = rbFindSegmentById(ss.segmentId)
    if (seg) {
      totalIntegrity += Math.min(ss.integrity, seg.maxIntegrity)
      totalMaxIntegrity += seg.maxIntegrity
    }
  }
  if (totalMaxIntegrity <= 0) return 0
  return Math.round((totalIntegrity / totalMaxIntegrity) * 100)
}

function rbCalculateTotalGuardianPower(recruitedGuardians: RbRecruitedGuardian[]): number {
  let totalPower = 0
  for (const rg of recruitedGuardians) {
    const guardian = rbFindGuardianById(rg.guardianId)
    if (guardian) {
      const levelMultiplier = 1 + (rg.level - 1) * 0.1
      totalPower += Math.floor((guardian.power + guardian.defense) * levelMultiplier)
    }
  }
  return totalPower
}

function rbCalculateTotalRunePower(forgedRunes: RbForgedRune[]): number {
  let totalPower = 0
  for (const fr of forgedRunes) {
    totalPower += fr.bonusPower
  }
  return totalPower
}

function rbCheckAchievementConditions(state: RainbowBridgeState): string[] {
  const newlyUnlocked: string[] = []

  const check = (id: string, condition: () => boolean) => {
    if (!state.unlockedAchievements.includes(id) && condition()) {
      newlyUnlocked.push(id)
    }
  }

  check('ach-01', () => state.totalPatrolsCompleted >= 1)
  check('ach-02', () => state.totalRuneCollected >= 1)
  check('ach-03', () => state.totalSegmentsRepaired >= 10)
  check('ach-04', () => state.recruitedGuardians.length >= 5)
  check('ach-05', () => state.totalRunesForged >= 10)
  check('ach-06', () => state.totalPatrolsCompleted >= 7)
  check('ach-07', () => {
    const exploredRealms = new Set<string>()
    for (const ss of state.segmentStatuses) {
      const seg = rbFindSegmentById(ss.segmentId)
      if (seg) exploredRealms.add(seg.realm)
    }
    return exploredRealms.size >= RB_REALMS.length
  })
  check('ach-08', () => state.collectedArtifacts.length >= 10)
  check('ach-09', () => state.segmentStatuses.some((ss) => ss.reinforcedLevel >= 5))
  check('ach-10', () => state.level >= 25)
  check('ach-11', () => state.level >= RB_MAX_LEVEL)
  check('ach-12', () => state.collectedArtifacts.length >= RB_ARTIFACTS.length)
  check('ach-13', () => state.recruitedGuardians.length >= 20)
  check('ach-14', () => {
    return RB_BRIDGE_SEGMENTS.every((seg) => {
      const ss = state.segmentStatuses.find((s) => s.segmentId === seg.id)
      return ss !== undefined && ss.integrity >= seg.maxIntegrity
    })
  })
  check('ach-15', () => state.collectedRunes.length >= RB_RUNE_STONES.length)
  check('ach-16', () => state.explorationStreak >= 7)
  check('ach-17', () => state.segmentStatuses.some((ss) => ss.reinforcedLevel >= RB_MAX_REINFORCE_LEVEL))
  check('ach-18', () => state.totalCoinsEarned >= 10000)

  return newlyUnlocked
}

// ─── Static Data — Rune Forge Combinations ────────────────────

export const RB_FORGE_COMBINATIONS = [
  { id: 'fc-01', name: 'Flame Shield', rune1: 'rs-01', rune2: 'rs-06', power: 22, description: 'Fehu + Kenaz — creates a shield of burning prosperity.', icon: '🔥', rarity: 'Uncommon' as RbRarityKey },
  { id: 'fc-02', name: 'Prismatic Ward', rune1: 'rs-05', rune2: 'rs-13', power: 28, description: 'Raidho + Algiz — a ward of swift protection.', icon: '🌈', rarity: 'Rare' as RbRarityKey },
  { id: 'fc-03', name: 'Void Step', rune1: 'rs-11', rune2: 'rs-17', power: 32, description: 'Eihwaz + Ehwaz — teleportation through the void.', icon: '🌀', rarity: 'Rare' as RbRarityKey },
  { id: 'fc-04', name: 'Starfall Blade', rune1: 'rs-14', rune2: 'rs-15', power: 38, description: 'Sowilo + Tiwaz — a blade forged from sunlight and justice.', icon: '⚔️', rarity: 'Epic' as RbRarityKey },
  { id: 'fc-05', name: 'Abyssal Key', rune1: 'rs-28', rune2: 'rs-29', power: 55, description: 'Othala Inverted + Perthro Abyssal — unlocks the deepest void secrets.', icon: '🗝️', rarity: 'Legendary' as RbRarityKey },
  { id: 'fc-06', name: 'Dawn Fortress', rune1: 'rs-21', rune2: 'rs-20', power: 34, description: 'Dagaz + Ingwaz — a fortress that regenerates at dawn.', icon: '🌅', rarity: 'Rare' as RbRarityKey },
  { id: 'fc-07', name: 'Cosmic Bind', rune1: 'rs-22', rune2: 'rs-24', power: 42, description: 'Othala + Gebo — cosmic heritage amplified by gifting magic.', icon: '🎁', rarity: 'Epic' as RbRarityKey },
  { id: 'fc-08', name: 'Allfather Sigil', rune1: 'rs-30', rune2: 'rs-04', power: 65, description: 'Odin\'s Bind-Rune + Ansuz — the ultimate sigil of divine wisdom.', icon: '👑', rarity: 'Legendary' as RbRarityKey },
  { id: 'fc-09', name: 'Crystal Bloom', rune1: 'rs-16', rune2: 'rs-09', power: 24, description: 'Berkano + Isa — life blooming from perfect stillness.', icon: '🌱', rarity: 'Uncommon' as RbRarityKey },
  { id: 'fc-10', name: 'Hail Judgment', rune1: 'rs-23', rune2: 'rs-25', power: 48, description: 'Hagalaz + Thurisaz Shadow — devastating hail of dark thorns.', icon: '🌨️', rarity: 'Epic' as RbRarityKey },
]

// ─── Static Data — Guardian Training Types ────────────────────

export const RB_TRAINING_TYPES = [
  { id: 'train-combat', name: 'Combat Drill', description: 'Intensive combat training that increases guardian power.', icon: '⚔️', xpBonus: 20, costMultiplier: 1 },
  { id: 'train-defense', name: 'Shield Wall', description: 'Defensive formation training that boosts guardian resilience.', icon: '🛡️', xpBonus: 15, costMultiplier: 1 },
  { id: 'train-rune', name: 'Rune Bonding', description: 'Bond with forged runes to unlock latent guardian abilities.', icon: 'ᚱ', xpBonus: 25, costMultiplier: 1.5 },
  { id: 'train-void', name: 'Void Meditation', description: 'Meditate at the void crossing to sharpen perception.', icon: '🕳️', xpBonus: 30, costMultiplier: 2 },
  { id: 'train-storm', name: 'Storm Endurance', description: 'Endure the fury of the Storm Gate to build unbreakable will.', icon: '⛈️', xpBonus: 35, costMultiplier: 2.5 },
  { id: 'train-divine', name: 'Divine Communion', description: 'Commune with Asgardian spirits to receive heavenly blessings.', icon: '✨', xpBonus: 50, costMultiplier: 4 },
]

// ─── The Hook ─────────────────────────────────────────────────────

export default function useRainbowBridge() {
  const [state, setState] = useState<RainbowBridgeState>(RB_DEFAULT_STATE)
  const stateRef = useRef<RainbowBridgeState>(state)

  // Sync stateRef
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = rbLoadState()
    setState(loaded)
  }, [])

  // Auto-save whenever state changes after initial load
  useEffect(() => {
    if (state.updatedAt !== RB_DEFAULT_STATE.updatedAt) {
      rbSaveState(state)
    }
  }, [state])

  // ── Internal helpers ──────────────────────────────────────────

  const rbAddXp = useCallback((amount: number) => {
    setState((prev) => {
      const newXp = prev.xp + amount
      const newLevel = rbCalculateLevel(newXp)
      return {
        ...prev,
        xp: newXp,
        level: Math.min(newLevel, RB_MAX_LEVEL),
        totalXpEarned: prev.totalXpEarned + amount,
      }
    })
  }, [])

  const rbAddCoins = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      coins: prev.coins + amount,
      totalCoinsEarned: prev.totalCoinsEarned + amount,
    }))
  }, [])

  const rbSpendCoins = useCallback((amount: number): boolean => {
    let success = false
    setState((prev) => {
      if (prev.coins < amount) return prev
      success = true
      return {
        ...prev,
        coins: prev.coins - amount,
        totalCoinsSpent: prev.totalCoinsSpent + amount,
      }
    })
    return success
  }, [])

  const rbCheckAndUnlockAchievements = useCallback(() => {
    const current = stateRef.current
    const newIds = rbCheckAchievementConditions(current)
    if (newIds.length === 0) return []

    setState((prev) => {
      let xpReward = 0
      let coinReward = 0
      for (const id of newIds) {
        const ach = rbFindAchievementById(id)
        if (ach) {
          if (ach.reward.type === 'xp') xpReward += ach.reward.value
          if (ach.reward.type === 'coins') coinReward += ach.reward.value
        }
      }
      const newXp = prev.xp + xpReward
      const newLevel = rbCalculateLevel(newXp)
      return {
        ...prev,
        xp: newXp,
        level: Math.min(newLevel, RB_MAX_LEVEL),
        totalXpEarned: prev.totalXpEarned + xpReward,
        coins: prev.coins + coinReward,
        totalCoinsEarned: prev.totalCoinsEarned + coinReward,
        unlockedAchievements: [...prev.unlockedAchievements, ...newIds],
      }
    })
    return newIds
  }, [])

  const rbRecalcBridgeIntegrity = useCallback(() => {
    setState((prev) => ({
      ...prev,
      bridgeIntegrity: rbCalculateBridgeIntegrity(prev.segmentStatuses),
    }))
  }, [])

  const rbAddPatrolLogEntry = useCallback((entry: RbPatrolLogEntry) => {
    setState((prev) => {
      const log = [entry, ...prev.patrolLog]
      if (log.length > RB_MAX_PATROL_LOG) {
        log.length = RB_MAX_PATROL_LOG
      }
      return { ...prev, patrolLog: log }
    })
  }, [])

  // ── Action: Collect Rune ─────────────────────────────────────

  const rbCollectRune = useCallback(
    (runeStoneId: string): boolean => {
      const rune = rbFindRuneStoneById(runeStoneId)
      if (!rune) return false

      let collected = false
      setState((prev) => {
        if (prev.collectedRunes.includes(runeStoneId)) return prev
        collected = true
        const xpGain = RB_RUNE_COLLECT_XP * RB_RARITY[rune.rarity].xpMultiplier
        const newXp = prev.xp + Math.floor(xpGain)
        const newLevel = rbCalculateLevel(newXp)
        const coinsGain = Math.floor(10 * RB_RARITY[rune.rarity].coinMultiplier)
        return {
          ...prev,
          xp: newXp,
          level: Math.min(newLevel, RB_MAX_LEVEL),
          totalXpEarned: prev.totalXpEarned + Math.floor(xpGain),
          coins: prev.coins + coinsGain,
          totalCoinsEarned: prev.totalCoinsEarned + coinsGain,
          collectedRunes: [...prev.collectedRunes, runeStoneId],
          totalRuneCollected: prev.totalRuneCollected + 1,
        }
      })

      if (collected) {
        setTimeout(() => rbCheckAndUnlockAchievements(), 0)
      }
      return collected
    },
    [rbCheckAndUnlockAchievements]
  )

  // ── Action: Forge Rune ───────────────────────────────────────

  const rbForgeBridge = useCallback(
    (runeStoneId: string): boolean => {
      const rune = rbFindRuneStoneById(runeStoneId)
      if (!rune) return false

      let success = false
      setState((prev) => {
        if (!prev.collectedRunes.includes(runeStoneId)) return prev
        if (prev.forgedRunes.some((f) => f.runeStoneId === runeStoneId)) return prev

        const cost = Math.floor(20 * RB_RARITY[rune.rarity].coinMultiplier)
        if (prev.coins < cost) return prev

        success = true
        const bonusPower = rune.power + Math.floor(rune.power * 0.3)
        const xpGain = RB_FORGE_BASE_XP * RB_RARITY[rune.rarity].xpMultiplier
        const newXp = prev.xp + Math.floor(xpGain)
        const newLevel = rbCalculateLevel(newXp)

        return {
          ...prev,
          xp: newXp,
          level: Math.min(newLevel, RB_MAX_LEVEL),
          totalXpEarned: prev.totalXpEarned + Math.floor(xpGain),
          coins: prev.coins - cost,
          totalCoinsSpent: prev.totalCoinsSpent + cost,
          forgedRunes: [
            ...prev.forgedRunes,
            {
              runeStoneId,
              bonusPower,
              forgedAt: new Date().toISOString(),
            },
          ],
          totalRunesForged: prev.totalRunesForged + 1,
        }
      })

      if (success) {
        setTimeout(() => rbCheckAndUnlockAchievements(), 0)
      }
      return success
    },
    [rbCheckAndUnlockAchievements]
  )

  // ── Action: Recruit Guardian ──────────────────────────────────

  const rbRecruitGuardian = useCallback(
    (guardianId: string): boolean => {
      const guardian = rbFindGuardianById(guardianId)
      if (!guardian) return false

      let success = false
      setState((prev) => {
        if (prev.recruitedGuardians.some((g) => g.guardianId === guardianId)) return prev
        if (prev.level < guardian.unlockLevel) return prev
        if (prev.coins < guardian.cost) return prev

        success = true
        const xpGain = RB_RECRUIT_BASE_XP * RB_RARITY[guardian.rarity].xpMultiplier
        const newXp = prev.xp + Math.floor(xpGain)
        const newLevel = rbCalculateLevel(newXp)

        return {
          ...prev,
          xp: newXp,
          level: Math.min(newLevel, RB_MAX_LEVEL),
          totalXpEarned: prev.totalXpEarned + Math.floor(xpGain),
          coins: prev.coins - guardian.cost,
          totalCoinsSpent: prev.totalCoinsSpent + guardian.cost,
          recruitedGuardians: [
            ...prev.recruitedGuardians,
            {
              guardianId,
              level: 1,
              xp: 0,
              trainingSessions: 0,
              recruitedAt: new Date().toISOString(),
            },
          ],
          totalGuardiansRecruited: prev.totalGuardiansRecruited + 1,
        }
      })

      if (success) {
        setTimeout(() => rbCheckAndUnlockAchievements(), 0)
      }
      return success
    },
    [rbCheckAndUnlockAchievements]
  )

  // ── Action: Train Guardian ────────────────────────────────────

  const rbTrainGuardian = useCallback(
    (guardianId: string): boolean => {
      let success = false
      setState((prev) => {
        const idx = prev.recruitedGuardians.findIndex(
          (g) => g.guardianId === guardianId
        )
        if (idx === -1) return prev

        if (prev.coins < RB_TRAINING_COST) return prev

        const guardians = [...prev.recruitedGuardians]
        const g = { ...guardians[idx] }
        g.xp += 20
        g.trainingSessions += 1
        if (g.xp >= g.level * 50) {
          g.level += 1
          g.xp = 0
        }
        guardians[idx] = g

        success = true
        return {
          ...prev,
          coins: prev.coins - RB_TRAINING_COST,
          totalCoinsSpent: prev.totalCoinsSpent + RB_TRAINING_COST,
          recruitedGuardians: guardians,
        }
      })
      return success
    },
    []
  )

  // ── Action: Repair Segment ───────────────────────────────────

  const rbRepairSegment = useCallback(
    (segmentId: string): boolean => {
      const segment = rbFindSegmentById(segmentId)
      if (!segment) return false

      let success = false
      setState((prev) => {
        if (prev.coins < segment.repairCost) return prev

        const statuses = [...prev.segmentStatuses]
        const idx = statuses.findIndex((s) => s.segmentId === segmentId)

        if (idx === -1) {
          statuses.push({
            segmentId,
            integrity: segment.integrity,
            reinforcedLevel: 0,
            lastRepairedAt: new Date().toISOString(),
          })
        } else {
          const ss = { ...statuses[idx] }
          ss.integrity = Math.min(ss.integrity + 25, segment.maxIntegrity)
          ss.lastRepairedAt = new Date().toISOString()
          statuses[idx] = ss
        }

        success = true
        const xpGain = RB_REPAIR_BASE_XP
        const newXp = prev.xp + xpGain
        const newLevel = rbCalculateLevel(newXp)
        const newIntegrity = rbCalculateBridgeIntegrity(statuses)

        return {
          ...prev,
          xp: newXp,
          level: Math.min(newLevel, RB_MAX_LEVEL),
          totalXpEarned: prev.totalXpEarned + xpGain,
          coins: prev.coins - segment.repairCost,
          totalCoinsSpent: prev.totalCoinsSpent + segment.repairCost,
          segmentStatuses: statuses,
          bridgeIntegrity: newIntegrity,
          totalSegmentsRepaired: prev.totalSegmentsRepaired + 1,
        }
      })

      if (success) {
        setTimeout(() => rbCheckAndUnlockAchievements(), 0)
      }
      return success
    },
    [rbCheckAndUnlockAchievements]
  )

  // ── Action: Reinforce Segment ─────────────────────────────────

  const rbReinforceSegment = useCallback(
    (segmentId: string): boolean => {
      const segment = rbFindSegmentById(segmentId)
      if (!segment) return false

      let success = false
      setState((prev) => {
        const idx = prev.segmentStatuses.findIndex(
          (s) => s.segmentId === segmentId
        )
        if (idx === -1) return prev

        const ss = { ...prev.segmentStatuses[idx] }
        if (ss.reinforcedLevel >= RB_MAX_REINFORCE_LEVEL) return prev

        const cost = segment.reinforceCost * (ss.reinforcedLevel + 1)
        if (prev.coins < cost) return prev

        const statuses = [...prev.segmentStatuses]
        ss.reinforcedLevel += 1
        ss.lastRepairedAt = new Date().toISOString()
        statuses[idx] = ss

        success = true
        const xpGain = RB_REINFORCE_BASE_XP
        const newXp = prev.xp + xpGain
        const newLevel = rbCalculateLevel(newXp)
        const newIntegrity = rbCalculateBridgeIntegrity(statuses)

        return {
          ...prev,
          xp: newXp,
          level: Math.min(newLevel, RB_MAX_LEVEL),
          totalXpEarned: prev.totalXpEarned + xpGain,
          coins: prev.coins - cost,
          totalCoinsSpent: prev.totalCoinsSpent + cost,
          segmentStatuses: statuses,
          bridgeIntegrity: newIntegrity,
          totalSegmentsReinforced: prev.totalSegmentsReinforced + 1,
        }
      })

      if (success) {
        setTimeout(() => rbCheckAndUnlockAchievements(), 0)
      }
      return success
    },
    [rbCheckAndUnlockAchievements]
  )

  // ── Action: Explore Realm ──────────────────────────────────────

  const rbExploreRealm = useCallback(
    (realmId: RbRealmKey): RbEncounter | null => {
      const realm = rbFindRealmById(realmId)
      if (!realm) return null

      const currentLevel = stateRef.current.level
      if (currentLevel < realm.unlockLevel) return null

      const eligibleEncounters = RB_ENCOUNTERS.filter(
        (e) => e.difficulty <= realm.difficulty + 2
      )
      if (eligibleEncounters.length === 0) return null

      const randIdx = Math.floor(Math.random() * eligibleEncounters.length)
      const encounter = eligibleEncounters[randIdx]

      let coinGain = 0
      let xpGain = 0

      setState((prev) => {
        const baseXp = RB_EXPLORE_BASE_XP * realm.difficulty
        const newCoinGain = Math.floor(
          RB_PATROL_BASE_COINS * realm.difficulty * (0.8 + Math.random() * 0.4)
        )

        coinGain = newCoinGain
        xpGain = Math.floor(baseXp)

        const newXp = prev.xp + xpGain
        const newLevel = rbCalculateLevel(newXp)

        return {
          ...prev,
          xp: newXp,
          level: Math.min(newLevel, RB_MAX_LEVEL),
          totalXpEarned: prev.totalXpEarned + xpGain,
          coins: prev.coins + coinGain,
          totalCoinsEarned: prev.totalCoinsEarned + coinGain,
          totalRealmsExplored: prev.totalRealmsExplored + 1,
          currentRealm: realmId,
        }
      })

      setTimeout(() => rbCheckAndUnlockAchievements(), 0)
      return encounter
    },
    [rbCheckAndUnlockAchievements]
  )

  // ── Action: Daily Patrol ───────────────────────────────────────

  const rbStartDailyPatrol = useCallback((): boolean => {
    const today = rbGetTodayString()
    const current = stateRef.current

    if (current.dailyPatrol && current.dailyPatrol.date === today) {
      return false
    }

    setState((prev) => ({
      ...prev,
      dailyPatrol: {
        date: today,
        completed: false,
        segmentsPatrolled: 0,
        runesCollected: 0,
        coinsEarned: 0,
        xpEarned: 0,
      },
    }))
    return true
  }, [])

  const rbCompleteDailyPatrol = useCallback((): boolean => {
    const today = rbGetTodayString()
    const current = stateRef.current

    if (!current.dailyPatrol || current.dailyPatrol.date !== today) return false
    if (current.dailyPatrol.completed) return false

    const patrol = {
      ...current.dailyPatrol,
      completed: true,
      segmentsPatrolled: current.dailyPatrol.segmentsPatrolled + 3,
      coinsEarned: current.dailyPatrol.coinsEarned + RB_PATROL_BASE_COINS * 3,
      xpEarned: current.dailyPatrol.xpEarned + RB_PATROL_BASE_XP * 3,
    }

    let streakBonus = 0
    let newStreak = 1

    setState((prev) => {
      const yesterday = rbGetYesterdayString()
      if (prev.dailyPatrol && prev.dailyPatrol.date === yesterday) {
        newStreak = prev.explorationStreak + 1
      }
      streakBonus = Math.floor(newStreak * RB_STREAK_BONUS_MULTIPLIER)

      const newXp = prev.xp + patrol.xpEarned + streakBonus
      const newLevel = rbCalculateLevel(newXp)

      return {
        ...prev,
        xp: newXp,
        level: Math.min(newLevel, RB_MAX_LEVEL),
        totalXpEarned: prev.totalXpEarned + patrol.xpEarned + streakBonus,
        coins: prev.coins + patrol.coinsEarned + streakBonus,
        totalCoinsEarned:
          prev.totalCoinsEarned + patrol.coinsEarned + streakBonus,
        dailyPatrol: patrol,
        explorationStreak: newStreak,
        lastExplorationDate: today,
        totalPatrolsCompleted: prev.totalPatrolsCompleted + 1,
      }
    })

    rbAddPatrolLogEntry({
      date: today,
      realmId: current.currentRealm,
      segmentsPatrolled: patrol.segmentsPatrolled,
      runesFound: patrol.runesCollected,
      encounters: [],
      coinsEarned: patrol.coinsEarned + streakBonus,
      xpEarned: patrol.xpEarned + streakBonus,
    })

    setTimeout(() => rbCheckAndUnlockAchievements(), 0)
    return true
  }, [rbCheckAndUnlockAchievements, rbAddPatrolLogEntry])

  // ── Action: Collect Artifact ──────────────────────────────────

  const rbCollectArtifact = useCallback(
    (artifactId: string): boolean => {
      const artifact = rbFindArtifactById(artifactId)
      if (!artifact) return false

      let collected = false
      setState((prev) => {
        if (prev.collectedArtifacts.some((a) => a.artifactId === artifactId)) {
          return prev
        }
        collected = true
        const xpGain = RB_ARTIFACT_BASE_XP * RB_RARITY[artifact.rarity].xpMultiplier
        const newXp = prev.xp + Math.floor(xpGain)
        const newLevel = rbCalculateLevel(newXp)
        return {
          ...prev,
          xp: newXp,
          level: Math.min(newLevel, RB_MAX_LEVEL),
          totalXpEarned: prev.totalXpEarned + Math.floor(xpGain),
          collectedArtifacts: [
            ...prev.collectedArtifacts,
            { artifactId, acquiredAt: new Date().toISOString() },
          ],
          totalArtifactsCollected: prev.totalArtifactsCollected + 1,
        }
      })

      if (collected) {
        setTimeout(() => rbCheckAndUnlockAchievements(), 0)
      }
      return collected
    },
    [rbCheckAndUnlockAchievements]
  )

  // ── Action: Dismiss Guardian ──────────────────────────────────

  const rbDismissGuardian = useCallback(
    (guardianId: string): boolean => {
      let success = false
      setState((prev) => {
        const idx = prev.recruitedGuardians.findIndex(
          (g) => g.guardianId === guardianId
        )
        if (idx === -1) return prev

        const guardians = [...prev.recruitedGuardians]
        guardians.splice(idx, 1)

        const guardian = rbFindGuardianById(guardianId)
        const refundAmount = guardian ? Math.floor(guardian.cost * 0.5) : 0

        success = true
        return {
          ...prev,
          recruitedGuardians: guardians,
          coins: prev.coins + refundAmount,
          totalCoinsEarned: prev.totalCoinsEarned + refundAmount,
        }
      })
      return success
    },
    []
  )

  // ── Action: Set Realm ─────────────────────────────────────────

  const rbSetRealm = useCallback((realmId: RbRealmKey) => {
    const realm = rbFindRealmById(realmId)
    if (!realm) return
    const currentLevel = stateRef.current.level
    if (currentLevel < realm.unlockLevel) return
    setState((prev) => ({ ...prev, currentRealm: realmId }))
  }, [])

  // ── Action: Reset State ───────────────────────────────────────

  const rbResetState = useCallback(() => {
    setState({
      ...RB_DEFAULT_STATE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }, [])

  // ── Action: Damage Segment (from encounters/combat) ──────────

  const rbDamageSegment = useCallback(
    (segmentId: string, damageAmount: number): boolean => {
      const segment = rbFindSegmentById(segmentId)
      if (!segment) return false

      let success = false
      setState((prev) => {
        const idx = prev.segmentStatuses.findIndex(
          (s) => s.segmentId === segmentId
        )
        if (idx === -1) return prev

        const statuses = [...prev.segmentStatuses]
        const ss = { ...statuses[idx] }
        if (ss.integrity <= 0) return prev

        const actualDamage = Math.min(damageAmount, ss.integrity)
        ss.integrity -= actualDamage
        if (ss.integrity < 0) ss.integrity = 0
        statuses[idx] = ss

        success = true
        const newIntegrity = rbCalculateBridgeIntegrity(statuses)

        return {
          ...prev,
          segmentStatuses: statuses,
          bridgeIntegrity: newIntegrity,
        }
      })
      return success
    },
    []
  )

  // ── Action: Check and perform forge combination ──────────────

  const rbForgeCombination = useCallback(
    (combinationId: string): boolean => {
      const combo = RB_FORGE_COMBINATIONS.find((c) => c.id === combinationId)
      if (!combo) return false

      let success = false
      setState((prev) => {
        if (!prev.forgedRunes.some((f) => f.runeStoneId === combo.rune1)) return prev
        if (!prev.forgedRunes.some((f) => f.runeStoneId === combo.rune2)) return prev

        const cost = Math.floor(50 * RB_RARITY[combo.rarity].coinMultiplier)
        if (prev.coins < cost) return prev

        success = true
        const xpGain = RB_FORGE_BASE_XP * RB_RARITY[combo.rarity].xpMultiplier * 2
        const newXp = prev.xp + Math.floor(xpGain)
        const newLevel = rbCalculateLevel(newXp)

        return {
          ...prev,
          xp: newXp,
          level: Math.min(newLevel, RB_MAX_LEVEL),
          totalXpEarned: prev.totalXpEarned + Math.floor(xpGain),
          coins: prev.coins - cost,
          totalCoinsSpent: prev.totalCoinsSpent + cost,
        }
      })

      if (success) {
        setTimeout(() => rbCheckAndUnlockAchievements(), 0)
      }
      return success
    },
    [rbCheckAndUnlockAchievements]
  )

  // ── Action: Grant bonus coins (for special events) ───────────

  const rbGrantBonusCoins = useCallback((amount: number, reason: string) => {
    setState((prev) => ({
      ...prev,
      coins: prev.coins + amount,
      totalCoinsEarned: prev.totalCoinsEarned + amount,
    }))
  }, [])

  // ── Action: Grant bonus XP (for special events) ──────────────

  const rbGrantBonusXp = useCallback((amount: number) => {
    setState((prev) => {
      const newXp = prev.xp + amount
      const newLevel = rbCalculateLevel(newXp)
      return {
        ...prev,
        xp: newXp,
        level: Math.min(newLevel, RB_MAX_LEVEL),
        totalXpEarned: prev.totalXpEarned + amount,
      }
    })
  }, [])

  // ── Plain getters ─────────────────────────────────────────────

  const rbGetLevel = (): number => state.level
  const rbGetXp = (): number => state.xp
  const rbGetXpToNext = (): number => {
    if (state.level >= RB_MAX_LEVEL) return 0
    return rbGetXpForNextLevel(state.level) - state.xp
  }
  const rbGetXpProgress = (): number => {
    if (state.level >= RB_MAX_LEVEL) return 1
    const currentThreshold = rbGetXpForLevel(state.level)
    const nextThreshold = rbGetXpForNextLevel(state.level)
    const range = nextThreshold - currentThreshold
    if (range <= 0) return 1
    return Math.min((state.xp - currentThreshold) / range, 1)
  }
  const rbGetCoins = (): number => state.coins
  const rbGetCurrentRealm = (): RbRealmKey => state.currentRealm
  const rbGetCollectedRunes = (): string[] => state.collectedRunes
  const rbGetForgedRunes = (): RbForgedRune[] => state.forgedRunes
  const rbGetRecruitedGuardians = (): RbRecruitedGuardian[] => state.recruitedGuardians
  const rbGetSegmentStatuses = (): RbSegmentStatus[] => state.segmentStatuses
  const rbGetCollectedArtifacts = (): RbCollectedArtifact[] => state.collectedArtifacts
  const rbGetUnlockedAchievements = (): string[] => state.unlockedAchievements
  const rbGetTotalRuneCollected = (): number => state.totalRuneCollected
  const rbGetTotalRunesForged = (): number => state.totalRunesForged
  const rbGetTotalGuardiansRecruited = (): number => state.totalGuardiansRecruited
  const rbGetTotalSegmentsRepaired = (): number => state.totalSegmentsRepaired
  const rbGetTotalSegmentsReinforced = (): number => state.totalSegmentsReinforced
  const rbGetTotalArtifactsCollected = (): number => state.totalArtifactsCollected
  const rbGetTotalRealmsExplored = (): number => state.totalRealmsExplored
  const rbGetTotalPatrolsCompleted = (): number => state.totalPatrolsCompleted
  const rbGetTotalCoinsEarned = (): number => state.totalCoinsEarned
  const rbGetTotalCoinsSpent = (): number => state.totalCoinsSpent
  const rbGetTotalXpEarned = (): number => state.totalXpEarned
  const rbGetBridgeIntegrity = (): number => state.bridgeIntegrity
  const rbGetDailyPatrol = (): RbDailyPatrol | null => state.dailyPatrol
  const rbGetExplorationStreak = (): number => state.explorationStreak
  const rbGetMaxLevel = (): number => RB_MAX_LEVEL
  const rbGetPatrolLog = (): RbPatrolLogEntry[] => state.patrolLog

  const rbGetTitle = (): RbTitle => rbFindTitleForLevel(state.level)
  const rbGetNextTitle = (): RbTitle | undefined => {
    for (const title of RB_TITLES) {
      if (title.requiredLevel > state.level) return title
    }
    return undefined
  }

  const rbGetRarityColor = (rarity: RbRarityKey): string => RB_RARITY[rarity].color
  const rbGetRarityInfo = (rarity: RbRarityKey): RbRarityInfo => RB_RARITY[rarity]

  // ── Derived stats via useMemo ────────────────────────────────

  const rbGetTotalGuardianPower = useMemo(
    () => rbCalculateTotalGuardianPower(state.recruitedGuardians),
    [state.recruitedGuardians]
  )

  const rbGetTotalRunePower = useMemo(
    () => rbCalculateTotalRunePower(state.forgedRunes),
    [state.forgedRunes]
  )

  const rbGetUnlockedRealms = useMemo(() => {
    return RB_REALMS.filter((r) => state.level >= r.unlockLevel)
  }, [state.level])

  const rbGetLockedRealms = useMemo(() => {
    return RB_REALMS.filter((r) => state.level < r.unlockLevel)
  }, [state.level])

  const rbGetAvailableGuardians = useMemo(() => {
    return RB_GUARDIANS.filter((g) => state.level >= g.unlockLevel)
  }, [state.level])

  const rbGetCollectedRuneDetails = useMemo(() => {
    return state.collectedRunes
      .map((id) => rbFindRuneStoneById(id))
      .filter((r): r is RbRuneStone => r !== undefined)
  }, [state.collectedRunes])

  const rbGetForgedRuneDetails = useMemo(() => {
    return state.forgedRunes.map((fr) => {
      const rune = rbFindRuneStoneById(fr.runeStoneId)
      return { ...fr, rune }
    })
  }, [state.forgedRunes])

  const rbGetRecruitedGuardianDetails = useMemo(() => {
    return state.recruitedGuardians.map((rg) => {
      const guardian = rbFindGuardianById(rg.guardianId)
      return { ...rg, guardian }
    })
  }, [state.recruitedGuardians])

  const rbGetSegmentDetails = useMemo(() => {
    return state.segmentStatuses.map((ss) => {
      const segment = rbFindSegmentById(ss.segmentId)
      return { ...ss, segment }
    })
  }, [state.segmentStatuses])

  const rbGetCollectedArtifactDetails = useMemo(() => {
    return state.collectedArtifacts.map((ca) => {
      const artifact = rbFindArtifactById(ca.artifactId)
      return { ...ca, artifact }
    })
  }, [state.collectedArtifacts])

  const rbGetUnlockedAchievementDetails = useMemo(() => {
    return state.unlockedAchievements
      .map((id) => rbFindAchievementById(id))
      .filter((a): a is RbAchievement => a !== undefined)
  }, [state.unlockedAchievements])

  const rbGetLockedAchievementDetails = useMemo(() => {
    return RB_ACHIEVEMENTS.filter(
      (a) => !state.unlockedAchievements.includes(a.id)
    )
  }, [state.unlockedAchievements])

  const rbIsPatrolCompletedToday = useMemo(() => {
    const today = rbGetTodayString()
    return state.dailyPatrol !== null && state.dailyPatrol.date === today && state.dailyPatrol.completed
  }, [state.dailyPatrol])

  const rbCanStartPatrol = useMemo(() => {
    const today = rbGetTodayString()
    if (state.dailyPatrol === null) return true
    if (state.dailyPatrol.date !== today) return true
    return !state.dailyPatrol.completed
  }, [state.dailyPatrol])

  const rbGetRealmProgress = useMemo(() => {
    const exploredRealms = new Set<string>()
    for (const ss of state.segmentStatuses) {
      const seg = rbFindSegmentById(ss.segmentId)
      if (seg) exploredRealms.add(seg.realm)
    }
    return {
      explored: exploredRealms.size,
      total: RB_REALMS.length,
      percentage: Math.round((exploredRealms.size / RB_REALMS.length) * 100),
    }
  }, [state.segmentStatuses])

  const rbGetCollectionProgress = useMemo(() => {
    return {
      runes: {
        collected: state.collectedRunes.length,
        total: RB_RUNE_STONES.length,
        percentage: Math.round((state.collectedRunes.length / RB_RUNE_STONES.length) * 100),
      },
      artifacts: {
        collected: state.collectedArtifacts.length,
        total: RB_ARTIFACTS.length,
        percentage: Math.round((state.collectedArtifacts.length / RB_ARTIFACTS.length) * 100),
      },
      guardians: {
        recruited: state.recruitedGuardians.length,
        total: RB_GUARDIANS.length,
        percentage: Math.round((state.recruitedGuardians.length / RB_GUARDIANS.length) * 100),
      },
      achievements: {
        unlocked: state.unlockedAchievements.length,
        total: RB_ACHIEVEMENTS.length,
        percentage: Math.round((state.unlockedAchievements.length / RB_ACHIEVEMENTS.length) * 100),
      },
    }
  }, [
    state.collectedRunes.length,
    state.collectedArtifacts.length,
    state.recruitedGuardians.length,
    state.unlockedAchievements.length,
  ])

  const rbGetStats = useMemo(
    () => ({
      level: state.level,
      xp: state.xp,
      coins: state.coins,
      runesCollected: state.collectedRunes.length,
      runesForged: state.forgedRunes.length,
      guardiansRecruited: state.recruitedGuardians.length,
      segmentsRepaired: state.totalSegmentsRepaired,
      segmentsReinforced: state.totalSegmentsReinforced,
      artifactsCollected: state.collectedArtifacts.length,
      realmsExplored: state.totalRealmsExplored,
      patrolsCompleted: state.totalPatrolsCompleted,
      totalCoinsEarned: state.totalCoinsEarned,
      totalCoinsSpent: state.totalCoinsSpent,
      totalXpEarned: state.totalXpEarned,
      bridgeIntegrity: state.bridgeIntegrity,
      explorationStreak: state.explorationStreak,
      guardianPower: rbCalculateTotalGuardianPower(state.recruitedGuardians),
      runePower: rbCalculateTotalRunePower(state.forgedRunes),
    }),
    [state]
  )

  // ── Return everything ─────────────────────────────────────────

  return {
    // State
    state,
    // Actions
    rbCollectRune,
    rbForgeBridge,
    rbRecruitGuardian,
    rbTrainGuardian,
    rbRepairSegment,
    rbReinforceSegment,
    rbExploreRealm,
    rbStartDailyPatrol,
    rbCompleteDailyPatrol,
    rbCollectArtifact,
    rbDismissGuardian,
    rbDamageSegment,
    rbForgeCombination,
    rbGrantBonusCoins,
    rbGrantBonusXp,
    rbSetRealm,
    rbResetState,
    rbCheckAndUnlockAchievements,
    rbRecalcBridgeIntegrity,
    // Getters
    rbGetLevel,
    rbGetXp,
    rbGetXpToNext,
    rbGetXpProgress,
    rbGetCoins,
    rbGetCurrentRealm,
    rbGetCollectedRunes,
    rbGetForgedRunes,
    rbGetRecruitedGuardians,
    rbGetSegmentStatuses,
    rbGetCollectedArtifacts,
    rbGetUnlockedAchievements,
    rbGetTotalRuneCollected,
    rbGetTotalRunesForged,
    rbGetTotalGuardiansRecruited,
    rbGetTotalSegmentsRepaired,
    rbGetTotalSegmentsReinforced,
    rbGetTotalArtifactsCollected,
    rbGetTotalRealmsExplored,
    rbGetTotalPatrolsCompleted,
    rbGetTotalCoinsEarned,
    rbGetTotalCoinsSpent,
    rbGetTotalXpEarned,
    rbGetBridgeIntegrity,
    rbGetDailyPatrol,
    rbGetExplorationStreak,
    rbGetMaxLevel,
    rbGetPatrolLog,
    rbGetTitle,
    rbGetNextTitle,
    rbGetRarityColor,
    rbGetRarityInfo,
    rbGetTotalGuardianPower,
    rbGetTotalRunePower,
    rbGetUnlockedRealms,
    rbGetLockedRealms,
    rbGetAvailableGuardians,
    rbGetCollectedRuneDetails,
    rbGetForgedRuneDetails,
    rbGetRecruitedGuardianDetails,
    rbGetSegmentDetails,
    rbGetCollectedArtifactDetails,
    rbGetUnlockedAchievementDetails,
    rbGetLockedAchievementDetails,
    rbIsPatrolCompletedToday,
    rbCanStartPatrol,
    rbGetRealmProgress,
    rbGetCollectionProgress,
    rbGetStats,
  }
}
