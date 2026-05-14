// ============================================================================
// Hollow Reach Wire — Abyssal Void Echo Beings Wire
// SSR-safe: no localStorage / window / document / setInterval /
//   addEventListener / Math.random
// All exports use the `HR_` prefix. Hook-based pattern.
// ============================================================================

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// Types & Interfaces
// ============================================================================

type HrRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type HrSpecies = 'hollow_wraith' | 'echo_specter' | 'void_crawler' | 'silent_phantom' | 'deep_stalker' | 'shadow_echo' | 'abyss_caller';

type HrCavernId =
  | 'echo_chamber'
  | 'hollow_abyss'
  | 'silent_depths'
  | 'void_gate'
  | 'whisper_gallery'
  | 'deafening_chasm'
  | 'hollow_core'
  | 'endless_reach';

type HrMaterialSource = 'harvest' | 'echo_drop' | 'structure_output' | 'artifact_reward' | 'event_reward';

type HrEventCategory = 'exploration' | 'combat' | 'discovery' | 'mystery' | 'cataclysm';

interface HrColorTheme {
  voidBlack: string;
  hollowGray: string;
  echoBlue: string;
  abyssIndigo: string;
}

interface HrRarityInfo {
  key: HrRarity;
  label: string;
  color: string;
  xpMultiplier: number;
}

interface HrEchoBeingDef {
  id: string;
  name: string;
  rarity: HrRarity;
  species: HrSpecies;
  cavernId: HrCavernId;
  hp: number;
  attack: number;
  defense: number;
  echoPower: number;
  description: string;
  abilities: string[];
}

interface HrCavernDef {
  id: HrCavernId;
  name: string;
  description: string;
  depth: number;
  dangerLevel: number;
  unlockLevel: number;
  echoDensity: number;
}

interface HrMaterialDef {
  id: string;
  name: string;
  rarity: HrRarity;
  source: HrMaterialSource;
  description: string;
}

interface HrStructureDef {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  bonusType: string;
  bonusPerLevel: number;
  requiredLevel: number;
}

interface HrAbilityDef {
  id: string;
  name: string;
  rarity: HrRarity;
  description: string;
  echoCost: number;
  cooldown: number;
  power: number;
  requiredLevel: number;
}

interface HrAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardCoins: number;
  rewardXp: number;
}

interface HrTitleDef {
  id: string;
  name: string;
  requiredLevel: number;
  description: string;
}

interface HrArtifactDef {
  id: string;
  name: string;
  rarity: HrRarity;
  description: string;
  echoPowerBonus: number;
  requiredLevel: number;
  cavernId: HrCavernId;
}

interface HrEventDef {
  id: string;
  name: string;
  description: string;
  category: HrEventCategory;
  duration: number;
  echoReward: number;
  unlockLevel: number;
}

interface HrBondedEcho {
  echoId: string;
  bondedAt: number;
  hp: number;
  maxHp: number;
  loyalty: number;
}

interface HrOwnedStructure {
  structureId: string;
  level: number;
  builtAt: number;
}

interface HrMaterialInventory {
  materialId: string;
  quantity: number;
}

interface HrAchievementState {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

interface HrAbilityState {
  learned: boolean;
  castCount: number;
  cooldownEnd: number;
}

interface HrArtifactState {
  artifactId: string;
  found: boolean;
  foundAt: number | null;
  equipped: boolean;
}

interface HrEventState {
  eventId: string;
  active: boolean;
  startedAt: number | null;
  completedAt: number | null;
}

interface HrTotals {
  totalEchoCalls: number;
  totalHollowWalks: number;
  totalCavernsBuilt: number;
  totalVoidDives: number;
  totalEchoesBonded: number;
  totalArtifactsFound: number;
  totalMaterialsHarvested: number;
  totalAbilitiesCast: number;
  totalEventsCompleted: number;
}

interface HrCavernExploration {
  explored: boolean;
  depth: number;
  dives: number;
  echoesEncountered: number;
  unlockedAt: number | null;
}

interface HollowReachState {
  level: number;
  xp: number;
  coins: number;
  currentTitle: string;
  echoPower: number;
  maxEchoPower: number;
  voidDepth: number;
  caverns: Record<string, HrCavernExploration>;
  bondedEchoes: Record<string, HrBondedEcho>;
  materials: Record<string, HrMaterialInventory>;
  structures: Record<string, HrOwnedStructure>;
  abilities: Record<string, HrAbilityState>;
  achievements: Record<string, HrAchievementState>;
  artifacts: Record<string, HrArtifactState>;
  events: Record<string, HrEventState>;
  totals: HrTotals;
  seed: number;
}

// ============================================================================
// Seeded PRNG
// ============================================================================

function hrMulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

const HR_MAX_LEVEL = 60;

function hrXpRequired(level: number): number {
  if (level <= 0) return 0;
  if (level >= HR_MAX_LEVEL) return Infinity;
  return Math.floor(120 * level * (1 + level * 0.15));
}

function hrClampLevel(lvl: number): number {
  return Math.max(1, Math.min(HR_MAX_LEVEL, lvl));
}

function hrClampCoins(c: number): number {
  return Math.max(0, Math.floor(c));
}

function hrClampPower(p: number, max: number): number {
  return Math.max(0, Math.min(max, Math.floor(p)));
}

function hrRarityMultiplier(r: HrRarity): number {
  const map: Record<HrRarity, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2.5,
    epic: 4,
    legendary: 7,
  };
  return map[r] ?? 1;
}

function hrMakeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function hrCreateInitialState(seed?: number): HollowReachState {
  const effectiveSeed = seed ?? (Date.now() & 0x7fffffff);
  return {
    level: 1,
    xp: 0,
    coins: 0,
    currentTitle: 'echo_walker',
    echoPower: 50,
    maxEchoPower: 50,
    voidDepth: 0,
    caverns: {},
    bondedEchoes: {},
    materials: {},
    structures: {},
    abilities: {},
    achievements: {},
    artifacts: {},
    events: {},
    totals: {
      totalEchoCalls: 0,
      totalHollowWalks: 0,
      totalCavernsBuilt: 0,
      totalVoidDives: 0,
      totalEchoesBonded: 0,
      totalArtifactsFound: 0,
      totalMaterialsHarvested: 0,
      totalAbilitiesCast: 0,
      totalEventsCompleted: 0,
    },
    seed: effectiveSeed,
  };
}

// ============================================================================
// Color Theme
// ============================================================================

const HR_COLOR_THEME: HrColorTheme = {
  voidBlack: '#0A0A0A',
  hollowGray: '#696969',
  echoBlue: '#4169E1',
  abyssIndigo: '#4B0082',
};

// ============================================================================
// HR_RARITIES
// ============================================================================

const HR_RARITIES: HrRarityInfo[] = [
  { key: 'common', label: 'Common', color: '#696969', xpMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#5B9BD5', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#4169E1', xpMultiplier: 2.5 },
  { key: 'epic', label: 'Epic', color: '#7B2FBE', xpMultiplier: 4 },
  { key: 'legendary', label: 'Legendary', color: '#FFD700', xpMultiplier: 7 },
];

// ============================================================================
// HR_CAVERNS: 8 Cavern Locations
// ============================================================================

const HR_CAVERNS: HrCavernDef[] = [
  { id: 'echo_chamber', name: 'Echo Chamber', description: 'A vast resonant hall where every sound is magnified and returns as an echo being. The walls ripple with reverberating waves of pale light.', depth: 100, dangerLevel: 1, unlockLevel: 1, echoDensity: 0.8 },
  { id: 'hollow_abyss', name: 'Hollow Abyss', description: 'A gaping vertical chasm carved from the absence of stone itself. Hollow wraiths drift through the emptiness like smoke in a vacuum.', depth: 350, dangerLevel: 2, unlockLevel: 5, echoDensity: 0.7 },
  { id: 'silent_depths', name: 'Silent Depths', description: 'A layer of absolute silence where even thoughts are muffled. Silent phantoms patrol these halls, hunting by detecting the faintest heartbeat.', depth: 700, dangerLevel: 3, unlockLevel: 10, echoDensity: 0.6 },
  { id: 'void_gate', name: 'Void Gate', description: 'A towering arch of crystallized void energy marking the boundary between known caverns and the true abyss. Only the bravest dare pass through.', depth: 1200, dangerLevel: 5, unlockLevel: 18, echoDensity: 0.5 },
  { id: 'whisper_gallery', name: 'Whisper Gallery', description: 'Curved corridors where ancient whispers still echo from civilizations long vanished. Shadow echoes gather here to listen and learn forbidden knowledge.', depth: 1800, dangerLevel: 6, unlockLevel: 25, echoDensity: 0.55 },
  { id: 'deafening_chasm', name: 'Deafening Chasm', description: 'A chasm of overwhelming sonic force where only void crawlers can navigate. The noise threatens to shatter both body and spirit.', depth: 2800, dangerLevel: 8, unlockLevel: 35, echoDensity: 0.4 },
  { id: 'hollow_core', name: 'Hollow Core', description: 'The pulsing heart of the Hollow Reach — a massive sphere of compressed echo energy. Abyss callers gather here to commune with the void itself.', depth: 4000, dangerLevel: 9, unlockLevel: 45, echoDensity: 0.35 },
  { id: 'endless_reach', name: 'Endless Reach', description: 'The deepest point of the Hollow Reach, where reality thins to a membrane between existence and oblivion. No one who enters fully returns.', depth: 9999, dangerLevel: 10, unlockLevel: 55, echoDensity: 0.25 },
];

// ============================================================================
// HR_ECHOES: 35 Echo Beings (5 Rarity Tiers, 7 per Tier, 7 Species)
// ============================================================================

const HR_ECHOES: HrEchoBeingDef[] = [
  // Common (7) — one per species
  { id: 'flicker_wraith', name: 'Flicker Wraith', rarity: 'common', species: 'hollow_wraith', cavernId: 'echo_chamber', hp: 30, attack: 5, defense: 3, echoPower: 8, description: 'A wispy hollow wraith that flickers in and out of existence, barely more than a moving shadow on the cavern walls.', abilities: ['flicker'] },
  { id: 'murmur_specter', name: 'Murmur Specter', rarity: 'common', species: 'echo_specter', cavernId: 'echo_chamber', hp: 25, attack: 8, defense: 2, echoPower: 10, description: 'A translucent specter that whispers fragments of forgotten conversations as it drifts past.', abilities: ['whisper'] },
  { id: 'tunnel_crawler', name: 'Tunnel Crawler', rarity: 'common', species: 'void_crawler', cavernId: 'hollow_abyss', hp: 45, attack: 6, defense: 8, echoPower: 7, description: 'A small void crawler that carves tunnels through solid rock with its resonance appendages.', abilities: ['burrow'] },
  { id: 'hush_phantom', name: 'Hush Phantom', rarity: 'common', species: 'silent_phantom', cavernId: 'silent_depths', hp: 35, attack: 4, defense: 5, echoPower: 12, description: 'A barely visible phantom that radiates an aura of complete silence, muting all nearby sounds.', abilities: ['silence_aura'] },
  { id: 'crevice_stalker', name: 'Crevice Stalker', rarity: 'common', species: 'deep_stalker', cavernId: 'hollow_abyss', hp: 40, attack: 10, defense: 4, echoPower: 9, description: 'A compact predator that lurks in the smallest cracks, striking with surprising speed when prey passes.', abilities: ['ambush'] },
  { id: 'faint_shadow_echo', name: 'Faint Shadow Echo', rarity: 'common', species: 'shadow_echo', cavernId: 'echo_chamber', hp: 20, attack: 3, defense: 2, echoPower: 6, description: 'A weak shadow echo that mimics the movements of nearby beings with a slight delay.', abilities: ['mimic_move'] },
  { id: 'wail_caller', name: 'Wail Caller', rarity: 'common', species: 'abyss_caller', cavernId: 'echo_chamber', hp: 28, attack: 7, defense: 3, echoPower: 11, description: 'A small abyss caller whose mournful wails can temporarily disorient intruders in the caverns.', abilities: ['wail'] },
  // Uncommon (7)
  { id: 'gloom_wraith', name: 'Gloom Wraith', rarity: 'uncommon', species: 'hollow_wraith', cavernId: 'hollow_abyss', hp: 70, attack: 14, defense: 8, echoPower: 25, description: 'A denser hollow wraith shrouded in perpetual twilight gloom. Its touch drains warmth and hope.', abilities: ['gloom_touch', 'shadow_shift'] },
  { id: 'reverb_specter', name: 'Reverb Specter', rarity: 'uncommon', species: 'echo_specter', cavernId: 'whisper_gallery', hp: 60, attack: 18, defense: 6, echoPower: 22, description: 'An echo specter that captures and amplifies sounds into devastating sonic projectiles.', abilities: ['reverb_blast', 'sound_capture'] },
  { id: 'ridge_crawler', name: 'Ridge Crawler', rarity: 'uncommon', species: 'void_crawler', cavernId: 'void_gate', hp: 90, attack: 12, defense: 16, echoPower: 20, description: 'A heavily armored void crawler that patrols the ridges of the Void Gate, crushing anything in its path.', abilities: ['ridge_charge', 'armor_plating'] },
  { id: 'mute_phantom', name: 'Mute Phantom', rarity: 'uncommon', species: 'silent_phantom', cavernId: 'silent_depths', hp: 55, attack: 10, defense: 10, echoPower: 28, description: 'A phantom that has achieved total silence, rendering itself and nearby allies invisible to echo detection.', abilities: ['void_mute', 'phantom_cloak'] },
  { id: 'lurk_stalker', name: 'Lurk Stalker', rarity: 'uncommon', species: 'deep_stalker', cavernId: 'hollow_abyss', hp: 80, attack: 22, defense: 7, echoPower: 24, description: 'A patient deep stalker that can remain motionless for days before striking with lethal precision.', abilities: ['death_wait', 'piercing_strike'] },
  { id: 'gleam_shadow_echo', name: 'Gleam Shadow Echo', rarity: 'uncommon', species: 'shadow_echo', cavernId: 'whisper_gallery', hp: 50, attack: 16, defense: 9, echoPower: 26, description: 'A shadow echo that has learned to absorb and redirect light, creating blinding flashes.', abilities: ['light_absorb', 'gleam_flash'] },
  { id: 'resonance_caller', name: 'Resonance Caller', rarity: 'uncommon', species: 'abyss_caller', cavernId: 'hollow_abyss', hp: 65, attack: 15, defense: 8, echoPower: 30, description: 'An abyss caller that harmonizes with the natural resonance frequencies of the Hollow Reach.', abilities: ['resonance_harmony', 'frequency_shift'] },
  // Rare (7)
  { id: 'nether_wraith', name: 'Nether Wraith', rarity: 'rare', species: 'hollow_wraith', cavernId: 'void_gate', hp: 150, attack: 30, defense: 18, echoPower: 55, description: 'A powerful hollow wraith from the nethermost depths whose form is pure condensed void energy.', abilities: ['nether_drain', 'void_form', 'spirit_tether'] },
  { id: 'chorus_specter', name: 'Chorus Specter', rarity: 'rare', species: 'echo_specter', cavernId: 'whisper_gallery', hp: 120, attack: 35, defense: 14, echoPower: 50, description: 'An echo specter that splits into multiple copies, each singing a different note in a devastating chorus.', abilities: ['chorus_split', 'harmonic_dissonance', 'echo_chain'] },
  { id: 'chasm_crawler', name: 'Chasm Crawler', rarity: 'rare', species: 'void_crawler', cavernId: 'deafening_chasm', hp: 200, attack: 25, defense: 30, echoPower: 45, description: 'An enormous void crawler that has adapted to the Deafening Chasm by growing vibration-absorbing carapace plates.', abilities: ['seismic_crush', 'vibration_absorb', 'chasm_tunnel'] },
  { id: 'oblivion_phantom', name: 'Oblivion Phantom', rarity: 'rare', species: 'silent_phantom', cavernId: 'silent_depths', hp: 110, attack: 28, defense: 20, echoPower: 60, description: 'A phantom from the deepest silence that can erase sounds, memories, and even the presence of beings.', abilities: ['oblivion_erasure', 'memory_drain', 'perfect_silence'] },
  { id: 'abyss_stalker', name: 'Abyss Stalker', rarity: 'rare', species: 'deep_stalker', cavernId: 'void_gate', hp: 170, attack: 40, defense: 15, echoPower: 52, description: 'The apex deep stalker that hunts in the perpetual darkness near the Void Gate. Nothing escapes its gaze.', abilities: ['abyssal_grapple', 'dimensional_phase', 'death_mark'] },
  { id: 'eclipse_shadow_echo', name: 'Eclipse Shadow Echo', rarity: 'rare', species: 'shadow_echo', cavernId: 'void_gate', hp: 100, attack: 32, defense: 22, echoPower: 48, description: 'A shadow echo that has absorbed so much darkness it can create miniature eclipses within the caverns.', abilities: ['eclipse_field', 'dark_matter_clone', 'shadow_ripple'] },
  { id: 'depths_caller', name: 'Depths Caller', rarity: 'rare', species: 'abyss_caller', cavernId: 'silent_depths', hp: 130, attack: 26, defense: 16, echoPower: 58, description: 'An abyss caller whose songs reach into the deepest parts of the Hollow Reach, awakening ancient echoes.', abilities: ['depths_summon', 'ancient_call', 'resonance_overload'] },
  // Epic (7)
  { id: 'void_sovereign_wraith', name: 'Void Sovereign Wraith', rarity: 'epic', species: 'hollow_wraith', cavernId: 'hollow_core', hp: 400, attack: 65, defense: 40, echoPower: 120, description: 'The ruler of all hollow wraiths — a being of pure anti-existence that commands legions of the hollow.', abilities: ['void_sovereignty', 'hollow_legion', 'anti_existence_pulse', 'wraith_transcendence'] },
  { id: 'eternal_echo_specter', name: 'Eternal Echo Specter', rarity: 'epic', species: 'echo_specter', cavernId: 'hollow_core', hp: 350, attack: 70, defense: 35, echoPower: 110, description: 'An echo specter that has existed since the Hollow Reach was formed. It contains the first echo ever created.', abilities: ['eternal_chorus', 'temporal_echo', 'sound_of_creation', 'infinite_reverb'] },
  { id: 'titan_void_crawler', name: 'Titan Void Crawler', rarity: 'epic', species: 'void_crawler', cavernId: 'deafening_chasm', hp: 600, attack: 55, defense: 70, echoPower: 100, description: 'A void crawler of immense proportions that has carved entire cavern systems through its endless burrowing.', abilities: ['titan_burrow', 'seismic_terraform', 'impervious_carapace', 'chasm_collapse'] },
  { id: 'null_silent_phantom', name: 'Null Silent Phantom', rarity: 'epic', species: 'silent_phantom', cavernId: 'hollow_core', hp: 300, attack: 80, defense: 50, echoPower: 130, description: 'A phantom that has achieved the state of absolute null — a being of perfect silence that negates all energy.', abilities: ['null_field', 'entropy_reverse', 'void_meditation', 'absolute_voidance'] },
  { id: 'phantom_deep_stalker', name: 'Phantom Deep Stalker', rarity: 'epic', species: 'deep_stalker', cavernId: 'hollow_core', hp: 450, attack: 90, defense: 30, echoPower: 125, description: 'A deep stalker that has phased partially out of reality, existing in the space between the Hollow Reach and true nothingness.', abilities: ['phase_hunt', 'reality_tear', 'predator_instinct', 'void_stalk'] },
  { id: 'umbra_shadow_echo', name: 'Umbra Shadow Echo', rarity: 'epic', species: 'shadow_echo', cavernId: 'hollow_core', hp: 320, attack: 75, defense: 45, echoPower: 115, description: 'The primordial shadow echo from which all shadows in the Hollow Reach originate. It is the darkness itself.', abilities: ['umbra_domain', 'shadow_consume', 'dark_matter_sculpt', 'eclipse_eternal'] },
  { id: 'choir_abyss_caller', name: 'Choir Abyss Caller', rarity: 'epic', species: 'abyss_caller', cavernId: 'hollow_core', hp: 380, attack: 60, defense: 55, echoPower: 140, description: 'The conductor of the abyssal choir — a being whose voice can reshape the fabric of the Hollow Reach itself.', abilities: ['choir_of_the_deep', 'reality_compose', 'harmonic_rift', 'void_anthem'] },
  // Legendary (7)
  { id: 'hollow_origin_wraith', name: 'Hollow Origin Wraith', rarity: 'legendary', species: 'hollow_wraith', cavernId: 'endless_reach', hp: 1000, attack: 150, defense: 80, echoPower: 300, description: 'The first hollow wraith — born from the original void that created the Hollow Reach. Its existence predates all others.', abilities: ['origin_hollow', 'genesis_void', 'hollow_apotheosis', 'eternal_return'] },
  { id: 'primordial_echo_specter', name: 'Primordial Echo Specter', rarity: 'legendary', species: 'echo_specter', cavernId: 'endless_reach', hp: 800, attack: 130, defense: 70, echoPower: 280, description: 'The specter of the first sound ever made — a being of pure resonance that contains the echo of creation itself.', abilities: ['primordial_sound', 'echo_of_all_things', 'resonance_with_god', 'symphony_of_the_void'] },
  { id: 'world_eater_void_crawler', name: 'World-Eater Void Crawler', rarity: 'legendary', species: 'void_crawler', cavernId: 'endless_reach', hp: 1500, attack: 120, defense: 150, echoPower: 250, description: 'A void crawler so massive it consumes entire cavern systems. Legends say it will one day devour the Hollow Reach entirely.', abilities: ['world_devour', 'continental_burrow', 'tectonic_shift', 'apocalypse_carapace'] },
  { id: 'silence_infinite_phantom', name: 'Silence Infinite Phantom', rarity: 'legendary', species: 'silent_phantom', cavernId: 'endless_reach', hp: 900, attack: 160, defense: 90, echoPower: 320, description: 'A phantom embodying infinite silence — the absence of all sound across all dimensions simultaneously.', abilities: ['infinite_silence', 'universal_mute', 'quietus_absolute', 'silence_eternal'] },
  { id: 'voidborn_deep_stalker', name: 'Voidborn Deep Stalker', rarity: 'legendary', species: 'deep_stalker', cavernId: 'endless_reach', hp: 1100, attack: 180, defense: 60, echoPower: 290, description: 'A deep stalker born directly from the void — it does not hunt, it simply removes prey from existence.', abilities: ['existence_erasure', 'void_born_instinct', 'dimensional_predation', 'hunt_without_end'] },
  { id: 'shadow_prime_echo', name: 'Shadow Prime Echo', rarity: 'legendary', species: 'shadow_echo', cavernId: 'endless_reach', hp: 850, attack: 140, defense: 100, echoPower: 270, description: 'The original shadow from which all darkness emanates. It is said to cast a shadow even in absolute darkness.', abilities: ['prime_shadow', 'darkness_absolute', 'shadow_of_everything', 'eclipse_of_reality'] },
  { id: 'abyss_sovereign_caller', name: 'Abyss Sovereign Caller', rarity: 'legendary', species: 'abyss_caller', cavernId: 'endless_reach', hp: 950, attack: 170, defense: 85, echoPower: 350, description: 'The supreme ruler of the abyss — a being whose single note can shatter dimensions and whose silence can create worlds.', abilities: ['sovereign_call', 'abyss_orchestra', 'dimensional_harmony', 'voice_of_the_void'] },
];

// ============================================================================
// HR_MATERIALS: 30 Hollow Reach Materials
// ============================================================================

const HR_MATERIALS: HrMaterialDef[] = [
  // Common (6)
  { id: 'echo_crystal', name: 'Echo Crystal', rarity: 'common', source: 'harvest', description: 'A translucent crystal that hums faintly with captured echo vibrations from the cavern walls.' },
  { id: 'void_stone', name: 'Void Stone', rarity: 'common', source: 'harvest', description: 'A pitch-black stone that seems to absorb all light and sound around it.' },
  { id: 'hollow_bone', name: 'Hollow Bone', rarity: 'common', source: 'echo_drop', description: 'A bone-like fragment shed by hollow wraiths, lightweight yet incredibly durable.' },
  { id: 'whisper_shard', name: 'Whisper Shard', rarity: 'common', source: 'harvest', description: 'A sharp fragment that produces faint whispers when held near the ear.' },
  { id: 'depth_salt', name: 'Depth Salt', rarity: 'common', source: 'harvest', description: 'Crystalline salt deposits found deep in the caverns, tinged with echo energy.' },
  { id: 'shadow_dust', name: 'Shadow Dust', rarity: 'common', source: 'echo_drop', description: 'Fine dark powder collected from areas where shadow echoes congregate.' },
  // Uncommon (6)
  { id: 'resonance_ore', name: 'Resonance Ore', rarity: 'uncommon', source: 'harvest', description: 'Metallic ore that vibrates at specific frequencies when struck, useful for crafting echo devices.' },
  { id: 'specter_essence', name: 'Specter Essence', rarity: 'uncommon', source: 'echo_drop', description: 'A glowing fluid extracted from defeated echo specters, containing concentrated echo energy.' },
  { id: 'crawler_silk', name: 'Void Crawler Silk', rarity: 'uncommon', source: 'echo_drop', description: 'Strong silky threads produced by void crawlers for their tunnel walls, nearly unbreakable.' },
  { id: 'phantom_film', name: 'Phantom Film', rarity: 'uncommon', source: 'echo_drop', description: 'A thin membrane shed by silent phantoms, transparent and completely soundproof.' },
  { id: 'stalker_fang', name: 'Deep Stalker Fang', rarity: 'uncommon', source: 'echo_drop', description: 'A razor-sharp fang from a deep stalker, still humming with predatory resonance.' },
  { id: 'echo_cluster', name: 'Echo Cluster', rarity: 'uncommon', source: 'structure_output', description: 'A cluster of crystallized echoes, grown in echo amplification structures.' },
  // Rare (6)
  { id: 'abyssal_pearl', name: 'Abyssal Pearl', rarity: 'rare', source: 'harvest', description: 'A lustrous pearl formed in the deepest pools of the Hollow Reach over millennia.' },
  { id: 'void_crystal_matrix', name: 'Void Crystal Matrix', rarity: 'rare', source: 'structure_output', description: 'A complex lattice of void crystals that can store and release massive amounts of echo energy.' },
  { id: 'hollow_marrow', name: 'Hollow Marrow', rarity: 'rare', source: 'echo_drop', description: 'The core material from within hollow wraiths, pulsing with anti-existence energy.' },
  { id: 'silence_core', name: 'Silence Core', rarity: 'rare', source: 'echo_drop', description: 'A perfectly spherical core of absolute silence extracted from null phantoms.' },
  { id: 'depth_amber', name: 'Depth Amber', rarity: 'rare', source: 'harvest', description: 'Ancient amber from the deepest cavern layers, containing preserved echoes of prehistoric beings.' },
  { id: 'shadow_quartz', name: 'Shadow Quartz', rarity: 'rare', source: 'harvest', description: 'Dark quartz that generates its own shadow field, useful in shadow manipulation technology.' },
  // Epic (6)
  { id: 'origin_echo_shard', name: 'Origin Echo Shard', rarity: 'epic', source: 'artifact_reward', description: 'A fragment of the first echo ever created, radiating primordial resonance energy.' },
  { id: 'void_heart_gem', name: 'Void Heart Gem', rarity: 'epic', source: 'artifact_reward', description: 'The crystallized heart of a Void Sovereign Wraith, beating with dark power.' },
  { id: 'titan_carapace_plate', name: 'Titan Carapace Plate', rarity: 'epic', source: 'echo_drop', description: 'An armor plate from a Titan Void Crawler, virtually indestructible.' },
  { id: 'null_crystal', name: 'Null Crystal', rarity: 'epic', source: 'structure_output', description: 'A crystal of absolute nothingness that paradoxically exists yet contains nothing.' },
  { id: 'abyss_callers_throat', name: 'Abyss Caller\'s Throat', rarity: 'epic', source: 'echo_drop', description: 'A preserved vocal organ from a Choir Abyss Caller, still capable of producing reality-bending sound.' },
  { id: 'endless_reach_moss', name: 'Endless Reach Moss', rarity: 'epic', source: 'harvest', description: 'Bioluminescent moss from the Endless Reach that feeds on echo energy and glows with abyssal light.' },
  // Legendary (6)
  { id: 'hollow_world_seed', name: 'Hollow World Seed', rarity: 'legendary', source: 'artifact_reward', description: 'A seed from the original hollow that created the Hollow Reach. Said to contain an entire hollow world within.' },
  { id: 'echo_of_creation', name: 'Echo of Creation', rarity: 'legendary', source: 'artifact_reward', description: 'The captured echo of the moment the Hollow Reach was born — the most powerful echo in existence.' },
  { id: 'void_sovereign_crown', name: 'Void Sovereign Crown', rarity: 'legendary', source: 'artifact_reward', description: 'A crown forged from condensed void energy, granting dominion over all hollow beings.' },
  { id: 'silence_eternal_stone', name: 'Silence Eternal Stone', rarity: 'legendary', source: 'artifact_reward', description: 'A stone that generates a field of eternal silence — within its radius, no sound can ever exist.' },
  { id: 'shadow_of_all_things', name: 'Shadow of All Things', rarity: 'legendary', source: 'artifact_reward', description: 'The condensed shadow of every being that has ever existed in the Hollow Reach, merged into one substance.' },
  { id: 'abyss_sovereign_score', name: 'Abyss Sovereign Score', rarity: 'legendary', source: 'artifact_reward', description: 'A musical score written by the Abyss Sovereign Caller — playing it can reshape reality itself.' },
];

// ============================================================================
// HR_STRUCTURES: 25 Upgradeable Structures (Level 1-10)
// ============================================================================

const HR_STRUCTURES: HrStructureDef[] = [
  // Echo Production (5)
  { id: 'echo_resonator', name: 'Echo Resonator', description: 'Amplifies ambient echo energy in the cavern, increasing echo power regeneration rate.', maxLevel: 10, baseCost: 80, costMultiplier: 1.5, bonusType: 'echo_regen', bonusPerLevel: 3, requiredLevel: 1 },
  { id: 'crystal_garden', name: 'Crystal Garden', description: 'Grows echo crystals from captured resonance, providing a steady supply of crafting materials.', maxLevel: 10, baseCost: 100, costMultiplier: 1.5, bonusType: 'material_output', bonusPerLevel: 2, requiredLevel: 3 },
  { id: 'whisper_relay', name: 'Whisper Relay Tower', description: 'Relays whispers between caverns, increasing the detection range for echo beings.', maxLevel: 10, baseCost: 120, costMultiplier: 1.6, bonusType: 'detection_range', bonusPerLevel: 5, requiredLevel: 6 },
  { id: 'hollow_forge', name: 'Hollow Forge', description: 'A forge that works in the absence of heat, shaping void materials through resonance manipulation.', maxLevel: 10, baseCost: 150, costMultiplier: 1.5, bonusType: 'crafting_quality', bonusPerLevel: 4, requiredLevel: 8 },
  { id: 'depth_well', name: 'Depth Well', description: 'A well that draws echo energy from deeper cavern layers, boosting maximum echo power capacity.', maxLevel: 10, baseCost: 180, costMultiplier: 1.7, bonusType: 'max_echo_power', bonusPerLevel: 8, requiredLevel: 12 },
  // Defense (5)
  { id: 'silence_barrier', name: 'Silence Barrier', description: 'Projects a field of absolute silence that disorients and repels hostile echo beings.', maxLevel: 10, baseCost: 100, costMultiplier: 1.6, bonusType: 'defense_power', bonusPerLevel: 6, requiredLevel: 4 },
  { id: 'shadow_maze', name: 'Shadow Maze', description: 'A labyrinth of living shadows that confuses and traps intruders within the cavern.', maxLevel: 10, baseCost: 140, costMultiplier: 1.5, bonusType: 'trap_effectiveness', bonusPerLevel: 5, requiredLevel: 8 },
  { id: 'void_pillar', name: 'Void Pillar Array', description: 'Columns of crystallized void energy that absorb incoming attacks and redirect them.', maxLevel: 10, baseCost: 170, costMultiplier: 1.7, bonusType: 'damage_reduction', bonusPerLevel: 4, requiredLevel: 14 },
  { id: 'echo_shield_generator', name: 'Echo Shield Generator', description: 'Generates a protective shield from resonating echo waves, deflecting physical and ethereal attacks.', maxLevel: 10, baseCost: 200, costMultiplier: 1.6, bonusType: 'shield_strength', bonusPerLevel: 7, requiredLevel: 20 },
  { id: 'hollow_sanctuary', name: 'Hollow Sanctuary', description: 'A safe haven within the hollow where echo beings cannot enter and time flows differently.', maxLevel: 10, baseCost: 250, costMultiplier: 1.8, bonusType: 'safety_rating', bonusPerLevel: 10, requiredLevel: 28 },
  // Exploration (5)
  { id: 'void_depth_gauge', name: 'Void Depth Gauge', description: 'Measures the depth of the void with precision, revealing hidden passages and secret caverns.', maxLevel: 10, baseCost: 90, costMultiplier: 1.5, bonusType: 'depth_scout', bonusPerLevel: 4, requiredLevel: 2 },
  { id: 'echo_mapper', name: 'Echo Mapping Station', description: 'Uses reflected echoes to create detailed maps of unexplored cavern systems.', maxLevel: 10, baseCost: 130, costMultiplier: 1.6, bonusType: 'map_accuracy', bonusPerLevel: 5, requiredLevel: 10 },
  { id: 'dimensional_anchor', name: 'Dimensional Anchor', description: 'Anchors a stable point in reality, preventing displacement by void anomalies during deep dives.', maxLevel: 10, baseCost: 160, costMultiplier: 1.7, bonusType: 'stability_bonus', bonusPerLevel: 6, requiredLevel: 18 },
  { id: 'whisper_compass', name: 'Whisper Compass', description: 'A compass that points toward the strongest echo signatures, guiding explorers to rare beings.', maxLevel: 10, baseCost: 110, costMultiplier: 1.5, bonusType: 'echo_tracking', bonusPerLevel: 3, requiredLevel: 5 },
  { id: 'abyss elevator', name: 'Abyss Elevator Shaft', description: 'A vertical transport system allowing rapid descent and ascent through the Hollow Reach caverns.', maxLevel: 10, baseCost: 200, costMultiplier: 1.8, bonusType: 'travel_speed', bonusPerLevel: 8, requiredLevel: 15 },
  // Research (5)
  { id: 'echo_analysis_lab', name: 'Echo Analysis Laboratory', description: 'Studies the properties of echo energy to unlock new abilities and understanding of the void.', maxLevel: 10, baseCost: 180, costMultiplier: 1.7, bonusType: 'research_speed', bonusPerLevel: 5, requiredLevel: 10 },
  { id: 'species_catalog', name: 'Echo Being Catalog', description: 'A comprehensive archive documenting all known echo being species, their behaviors, and weaknesses.', maxLevel: 10, baseCost: 150, costMultiplier: 1.6, bonusType: 'knowledge_bonus', bonusPerLevel: 4, requiredLevel: 8 },
  { id: 'void_energy_condenser', name: 'Void Energy Condenser', description: 'Condenses ambient void energy into usable echo power cells for ability enhancement.', maxLevel: 10, baseCost: 220, costMultiplier: 1.8, bonusType: 'energy_efficiency', bonusPerLevel: 6, requiredLevel: 22 },
  { id: 'silence_meditation_chamber', name: 'Silence Meditation Chamber', description: 'A perfectly silent chamber that accelerates echo power recovery and enhances concentration.', maxLevel: 10, baseCost: 190, costMultiplier: 1.7, bonusType: 'meditation_bonus', bonusPerLevel: 5, requiredLevel: 16 },
  { id: 'artifact_restoration_forge', name: 'Artifact Restoration Forge', description: 'Slowly repairs and enhances discovered artifacts using concentrated echo and void energy.', maxLevel: 10, baseCost: 280, costMultiplier: 1.9, bonusType: 'artifact_bonus', bonusPerLevel: 7, requiredLevel: 30 },
  // Utility (5)
  { id: 'echo_power_storage', name: 'Echo Power Storage Vault', description: 'Stores excess echo power for later use during extended void diving expeditions.', maxLevel: 10, baseCost: 100, costMultiplier: 1.5, bonusType: 'storage_capacity', bonusPerLevel: 10, requiredLevel: 3 },
  { id: 'material_depository', name: 'Material Depository', description: 'A massive underground vault for storing and organizing all harvested hollow materials.', maxLevel: 10, baseCost: 120, costMultiplier: 1.5, bonusType: 'storage_space', bonusPerLevel: 8, requiredLevel: 6 },
  { id: 'echo_trade_post', name: 'Echo Trade Post', description: 'A neutral trading hub where rare materials and artifacts can be exchanged with void merchants.', maxLevel: 10, baseCost: 160, costMultiplier: 1.6, bonusType: 'trade_value', bonusPerLevel: 5, requiredLevel: 12 },
  { id: 'resonance_infirmary', name: 'Resonance Infirmary', description: 'Heals injured bonded echo beings using targeted resonance frequencies tuned to each species.', maxLevel: 10, baseCost: 140, costMultiplier: 1.6, bonusType: 'heal_rate', bonusPerLevel: 4, requiredLevel: 8 },
  { id: 'void_observatory', name: 'Void Observatory', description: 'An observation deck that monitors void activity and predicts cavern events before they occur.', maxLevel: 10, baseCost: 200, costMultiplier: 1.7, bonusType: 'prediction_accuracy', bonusPerLevel: 6, requiredLevel: 20 },
];

// ============================================================================
// HR_ABILITIES: 22 Echo/Void Abilities
// ============================================================================

const HR_ABILITIES: HrAbilityDef[] = [
  // Common (5)
  { id: 'echo_ping', name: 'Echo Ping', rarity: 'common', description: 'Release a sonar-like echo pulse that reveals nearby echo beings and hidden passages in the cavern.', echoCost: 8, cooldown: 5, power: 10, requiredLevel: 1 },
  { id: 'hollow_step', name: 'Hollow Step', rarity: 'common', description: 'Phase partially into the hollow state, becoming intangible and moving silently through cavern walls.', echoCost: 12, cooldown: 10, power: 15, requiredLevel: 1 },
  { id: 'shadow_veil', name: 'Shadow Veil', rarity: 'common', description: 'Cloak yourself in shadow energy, becoming nearly invisible to echo beings in dim cavern light.', echoCost: 10, cooldown: 15, power: 12, requiredLevel: 1 },
  { id: 'whisper_bond', name: 'Whisper Bond', rarity: 'common', description: 'Establish a mental link with a nearby echo being, allowing basic communication and calm.', echoCost: 15, cooldown: 20, power: 20, requiredLevel: 1 },
  { id: 'void_sense', name: 'Void Sense', rarity: 'common', description: 'Heighten your perception of void energy, detecting echoes and void anomalies within a large radius.', echoCost: 8, cooldown: 8, power: 8, requiredLevel: 1 },
  // Uncommon (5)
  { id: 'resonance_burst', name: 'Resonance Burst', rarity: 'uncommon', description: 'Channel stored echo energy into a destructive burst that damages all hostile beings in range.', echoCost: 25, cooldown: 15, power: 35, requiredLevel: 8 },
  { id: 'hollow_drain', name: 'Hollow Drain', rarity: 'uncommon', description: 'Drain echo power from nearby echo beings, transferring it to your own reserves.', echoCost: 20, cooldown: 25, power: 30, requiredLevel: 10 },
  { id: 'depth_shriek', name: 'Depth Shriek', rarity: 'uncommon', description: 'Unleash a shriek tuned to the resonance frequency of the current cavern, disorienting all beings.', echoCost: 30, cooldown: 30, power: 40, requiredLevel: 12 },
  { id: 'shadow_clone', name: 'Shadow Clone', rarity: 'uncommon', description: 'Create a clone from solidified shadow that distracts enemies and mimics your movements.', echoCost: 22, cooldown: 20, power: 25, requiredLevel: 8 },
  { id: 'echo_shield', name: 'Echo Shield', rarity: 'uncommon', description: 'Form a protective barrier from concentrated echo waves that absorbs incoming damage.', echoCost: 28, cooldown: 25, power: 45, requiredLevel: 15 },
  // Rare (4)
  { id: 'void_phase', name: 'Void Phase', rarity: 'rare', description: 'Completely phase into the void, becoming invisible and intangible for a sustained duration.', echoCost: 45, cooldown: 45, power: 60, requiredLevel: 22 },
  { id: 'silence_wave', name: 'Silence Wave', rarity: 'rare', description: 'Emit a wave of absolute silence that disables all sound-based abilities in a wide area.', echoCost: 50, cooldown: 50, power: 70, requiredLevel: 25 },
  { id: 'hollow_army', name: 'Hollow Army', rarity: 'rare', description: 'Summon lesser hollow wraiths from the void to fight alongside you temporarily.', echoCost: 55, cooldown: 60, power: 80, requiredLevel: 28 },
  { id: 'abyssal_echo', name: 'Abyssal Echo', rarity: 'rare', description: 'Release the captured echo of an abyssal event, creating a localized reality distortion.', echoCost: 60, cooldown: 55, power: 85, requiredLevel: 30 },
  // Epic (4)
  { id: 'void_collapse', name: 'Void Collapse', rarity: 'epic', description: 'Cause a section of the cavern to collapse into the void, dealing catastrophic damage to all beings caught within.', echoCost: 80, cooldown: 90, power: 120, requiredLevel: 40 },
  { id: 'silence_absolute', name: 'Silence Absolute', rarity: 'epic', description: 'Create a sphere of absolute silence so powerful it negates all energy types, not just sound.', echoCost: 90, cooldown: 100, power: 140, requiredLevel: 45 },
  { id: 'hollow_transcendence', name: 'Hollow Transcendence', rarity: 'epic', description: 'Temporarily transcend physical form, becoming a being of pure hollow energy with immense power.', echoCost: 100, cooldown: 120, power: 160, requiredLevel: 48 },
  { id: 'echo_of_the_void', name: 'Echo of the Void', rarity: 'epic', description: 'Channel the voice of the void itself, producing a sound that shatters dimensional barriers.', echoCost: 110, cooldown: 110, power: 180, requiredLevel: 50 },
  // Legendary (4)
  { id: 'hollow_apotheosis', name: 'Hollow Apotheosis', rarity: 'legendary', description: 'Transform into a hollow god, gaining dominion over all echo beings and void energy in the cavern.', echoCost: 150, cooldown: 300, power: 300, requiredLevel: 55 },
  { id: 'void_sovereignty', name: 'Void Sovereignty', rarity: 'legendary', description: 'Declare sovereignty over the void, reshaping the cavern to your will for a devastating duration.', echoCost: 180, cooldown: 360, power: 350, requiredLevel: 58 },
  { id: 'silence_eternal', name: 'Silence Eternal', rarity: 'legendary', description: 'Cast the world into eternal silence — all beings, abilities, and phenomena cease for a brief moment.', echoCost: 200, cooldown: 400, power: 400, requiredLevel: 58 },
  { id: 'endless_echo', name: 'Endless Echo', rarity: 'legendary', description: 'Release the endless echo — the infinite reverberation of the Hollow Reach\'s creation — devastating all.', echoCost: 250, cooldown: 600, power: 500, requiredLevel: 60 },
];

// ============================================================================
// HR_ACHIEVEMENTS: 18 Achievements
// ============================================================================

const HR_ACHIEVEMENTS: HrAchievementDef[] = [
  { id: 'ach_first_echo', name: 'First Whisper', description: 'Perform your first echo call in the Hollow Reach.', conditionKey: 'totalEchoCalls', targetValue: 1, rewardCoins: 50, rewardXp: 20 },
  { id: 'ach_ten_echoes', name: 'Echo Adept', description: 'Perform 10 echo calls.', conditionKey: 'totalEchoCalls', targetValue: 10, rewardCoins: 200, rewardXp: 100 },
  { id: 'ach_fifty_echoes', name: 'Echo Master', description: 'Perform 50 echo calls.', conditionKey: 'totalEchoCalls', targetValue: 50, rewardCoins: 800, rewardXp: 400 },
  { id: 'ach_hundred_echoes', name: 'Echo Legend', description: 'Perform 100 echo calls.', conditionKey: 'totalEchoCalls', targetValue: 100, rewardCoins: 2000, rewardXp: 1000 },
  { id: 'ach_first_dive', name: 'First Descent', description: 'Complete your first void dive into the Hollow Reach.', conditionKey: 'totalVoidDives', targetValue: 1, rewardCoins: 75, rewardXp: 30 },
  { id: 'ach_deep_diver', name: 'Deep Diver', description: 'Reach void depth of 1000 meters.', conditionKey: 'voidDepth', targetValue: 1000, rewardCoins: 500, rewardXp: 250 },
  { id: 'ach_abyss_walker', name: 'Abyss Walker', description: 'Reach void depth of 5000 meters.', conditionKey: 'voidDepth', targetValue: 5000, rewardCoins: 1500, rewardXp: 800 },
  { id: 'ach_endless', name: 'Endless', description: 'Reach the Endless Reach (void depth 9999).', conditionKey: 'voidDepth', targetValue: 9999, rewardCoins: 5000, rewardXp: 3000 },
  { id: 'ach_bond_5', name: 'Echo Friend', description: 'Bond with 5 different echo beings.', conditionKey: 'totalEchoesBonded', targetValue: 5, rewardCoins: 200, rewardXp: 100 },
  { id: 'ach_bond_15', name: 'Echo Whisperer', description: 'Bond with 15 different echo beings.', conditionKey: 'totalEchoesBonded', targetValue: 15, rewardCoins: 600, rewardXp: 300 },
  { id: 'ach_bond_35', name: 'Echo Sovereign', description: 'Bond with all 35 echo beings.', conditionKey: 'totalEchoesBonded', targetValue: 35, rewardCoins: 5000, rewardXp: 3000 },
  { id: 'ach_build_10', name: 'Cavern Architect', description: 'Build 10 different structures.', conditionKey: 'totalCavernsBuilt', targetValue: 10, rewardCoins: 400, rewardXp: 200 },
  { id: 'ach_build_25', name: 'Hollow Architect', description: 'Build all 25 structures.', conditionKey: 'totalCavernsBuilt', targetValue: 25, rewardCoins: 3000, rewardXp: 1500 },
  { id: 'ach_artifact_5', name: 'Artifact Hunter', description: 'Discover 5 legendary artifacts.', conditionKey: 'totalArtifactsFound', targetValue: 5, rewardCoins: 800, rewardXp: 500 },
  { id: 'ach_artifact_15', name: 'Artifact Lord', description: 'Discover all 15 legendary artifacts.', conditionKey: 'totalArtifactsFound', targetValue: 15, rewardCoins: 5000, rewardXp: 3000 },
  { id: 'ach_events_6', name: 'Cavern Explorer', description: 'Complete 6 different cavern events.', conditionKey: 'totalEventsCompleted', targetValue: 6, rewardCoins: 500, rewardXp: 250 },
  { id: 'ach_events_12', name: 'Event Master', description: 'Complete all 12 cavern events.', conditionKey: 'totalEventsCompleted', targetValue: 12, rewardCoins: 3000, rewardXp: 1500 },
  { id: 'ach_materials_500', name: 'Material Hoarder', description: 'Accumulate 500 total materials.', conditionKey: 'totalMaterialsHarvested', targetValue: 500, rewardCoins: 600, rewardXp: 300 },
];

// ============================================================================
// HR_TITLES: 8 Titles (Echo Walker -> Void Sovereign)
// ============================================================================

const HR_TITLES: HrTitleDef[] = [
  { id: 'echo_walker', name: 'Echo Walker', requiredLevel: 1, description: 'A newcomer to the Hollow Reach, learning to navigate by sound and shadow alone.' },
  { id: 'hollow_strider', name: 'Hollow Strider', requiredLevel: 8, description: 'You walk the hollow passages with growing confidence, sensing echoes others cannot hear.' },
  { id: 'shadow_weaver', name: 'Shadow Weaver', requiredLevel: 16, description: 'You command shadows to bend to your will, weaving darkness into tools and protection.' },
  { id: 'void_whisperer', name: 'Void Whisperer', requiredLevel: 24, description: 'The void speaks to you in dreams and waking, revealing secrets of the deep caverns.' },
  { id: 'echo_lord', name: 'Echo Lord', requiredLevel: 32, description: 'Your commands echo through every cavern. Echo beings bow before your resonance.' },
  { id: 'abyss_scout', name: 'Abyss Scout', requiredLevel: 42, description: 'You have ventured where none dare follow, mapping the deepest chambers of the Hollow Reach.' },
  { id: 'hollow_sovereign', name: 'Hollow Sovereign', requiredLevel: 52, description: 'Sovereign of all hollow passages. The caverns reshape themselves to greet your presence.' },
  { id: 'void_sovereign', name: 'Void Sovereign', requiredLevel: 60, description: 'Master of the Hollow Reach — the void itself answers to your call. You are the echo and the silence.' },
];

// ============================================================================
// HR_ARTIFACTS: 15 Legendary Artifacts
// ============================================================================

const HR_ARTIFACTS: HrArtifactDef[] = [
  { id: 'hollow_crown', name: 'Hollow Crown', rarity: 'legendary', description: 'A crown of crystallized hollow energy that grants +50 echo power and the ability to command hollow wraiths.', echoPowerBonus: 50, requiredLevel: 20, cavernId: 'echo_chamber' },
  { id: 'echo_amplifier', name: 'Echo Amplifier Gauntlet', rarity: 'epic', description: 'A gauntlet that amplifies echo calls, increasing echo being encounter rate by 30%.', echoPowerBonus: 25, requiredLevel: 15, cavernId: 'echo_chamber' },
  { id: 'void_lantern', name: 'Void Lantern', rarity: 'rare', description: 'A lantern fueled by void energy that illuminates hidden passages and reveals shadow echoes.', echoPowerBonus: 15, requiredLevel: 10, cavernId: 'hollow_abyss' },
  { id: 'silence_mask', name: 'Mask of Silence', rarity: 'epic', description: 'A mask that renders the wearer completely silent, preventing detection by silent phantoms.', echoPowerBonus: 30, requiredLevel: 18, cavernId: 'silent_depths' },
  { id: 'depth_compass', name: 'Depth Compass of the Ancients', rarity: 'rare', description: 'An ancient compass that always points toward the deepest unexplored point in the Hollow Reach.', echoPowerBonus: 10, requiredLevel: 8, cavernId: 'hollow_abyss' },
  { id: 'shadow_cloak', name: 'Cloak of Living Shadows', rarity: 'epic', description: 'A cloak woven from living shadow that grants partial intangibility and dark vision.', echoPowerBonus: 35, requiredLevel: 22, cavernId: 'void_gate' },
  { id: 'whisper_horn', name: 'Horn of Infinite Whispers', rarity: 'rare', description: 'A horn that, when blown, releases a cascade of whispers that calm hostile echo beings.', echoPowerBonus: 20, requiredLevel: 12, cavernId: 'whisper_gallery' },
  { id: 'void_crystal_staff', name: 'Void Crystal Staff', rarity: 'legendary', description: 'A staff topped with a massive void crystal, channeling devastating void energy attacks.', echoPowerBonus: 60, requiredLevel: 30, cavernId: 'void_gate' },
  { id: 'echo_orb', name: 'Orb of Primal Echoes', rarity: 'legendary', description: 'An orb containing the compressed echoes of the Hollow Reach\'s creation — limitless echo power source.', echoPowerBonus: 80, requiredLevel: 35, cavernId: 'hollow_core' },
  { id: 'silence_bell', name: 'Bell of Absolute Silence', rarity: 'legendary', description: 'A bell that, when rung, silences an entire cavern for one minute, disabling all abilities.', echoPowerBonus: 70, requiredLevel: 38, cavernId: 'silent_depths' },
  { id: 'stalker_claw', name: 'Claw of the Voidborn Stalker', rarity: 'epic', description: 'A severed claw from the legendary Voidborn Deep Stalker, radiating predatory resonance.', echoPowerBonus: 40, requiredLevel: 28, cavernId: 'hollow_core' },
  { id: 'chasm_hammer', name: 'Hammer of the Deafening Chasm', rarity: 'rare', description: 'A hammer that strikes with the force of tectonic plates shifting, devastating cavern walls.', echoPowerBonus: 18, requiredLevel: 14, cavernId: 'deafening_chasm' },
  { id: 'endless_map', name: 'Map of the Endless Reach', rarity: 'legendary', description: 'A self-updating map that reveals all cavern passages, secret rooms, and echo being locations.', echoPowerBonus: 55, requiredLevel: 42, cavernId: 'endless_reach' },
  { id: 'caller_lyre', name: 'Lyre of the Abyss Caller', rarity: 'legendary', description: 'The instrument of the Abyss Sovereign Caller — playing it summons and commands all echo beings.', echoPowerBonus: 90, requiredLevel: 50, cavernId: 'hollow_core' },
  { id: 'hollow_eye', name: 'Eye of the Hollow Origin', rarity: 'legendary', description: 'A perfect sphere of hollow energy that allows perception across all dimensions simultaneously.', echoPowerBonus: 100, requiredLevel: 55, cavernId: 'endless_reach' },
];

// ============================================================================
// HR_EVENTS: 12 Cavern Events
// ============================================================================

const HR_EVENTS: HrEventDef[] = [
  { id: 'echo_storm', name: 'Echo Storm', description: 'A violent cascade of overlapping echoes sweeps through the cavern, randomly boosting or damaging echo beings.', category: 'cataclysm', duration: 300, echoReward: 50, unlockLevel: 5 },
  { id: 'hollow_migration', name: 'Hollow Migration', description: 'Masses of hollow wraiths migrate through the cavern, providing rare bonding opportunities but increasing danger.', category: 'exploration', duration: 600, echoReward: 80, unlockLevel: 8 },
  { id: 'void_eruption', name: 'Void Eruption', description: 'A geyser of raw void energy erupts from the cavern floor, depositing rare void materials everywhere.', category: 'discovery', duration: 120, echoReward: 100, unlockLevel: 12 },
  { id: 'whisper_festival', name: 'Whisper Festival', description: 'The walls of the Whisper Gallery come alive with ancient voices sharing forgotten knowledge and secrets.', category: 'mystery', duration: 900, echoReward: 120, unlockLevel: 10 },
  { id: 'shadow_convergence', name: 'Shadow Convergence', description: 'All shadows in the cavern merge into a single entity, revealing hidden paths and rare shadow echoes.', category: 'mystery', duration: 180, echoReward: 90, unlockLevel: 18 },
  { id: 'silence_eclipse', name: 'Silence Eclipse', description: 'An event of absolute silence descends on the cavern, during which silent phantoms become visible and approachable.', category: 'discovery', duration: 240, echoReward: 150, unlockLevel: 15 },
  { id: 'depth_tremor', name: 'Depth Tremor', description: 'Seismic activity shakes the cavern, revealing new passages but collapsing old ones. Resources scatter everywhere.', category: 'cataclysm', duration: 60, echoReward: 70, unlockLevel: 3 },
  { id: 'echo_surge', name: 'Echo Power Surge', description: 'A massive surge of echo energy flows through the cavern, temporarily doubling all echo power gains.', category: 'exploration', duration: 480, echoReward: 200, unlockLevel: 20 },
  { id: 'void_breach', name: 'Void Breach', description: 'A tear in reality opens, allowing legendary echo beings from the Endless Reach to briefly manifest.', category: 'combat', duration: 300, echoReward: 300, unlockLevel: 35 },
  { id: 'hollow_bloom', name: 'Hollow Bloom', description: 'Echo crystals throughout the cavern bloom simultaneously, producing a harvestable bounty of rare materials.', category: 'discovery', duration: 360, echoReward: 130, unlockLevel: 14 },
  { id: 'phantom_gathering', name: 'Phantom Gathering', description: 'Silent phantoms from all cavern layers gather for a rare meeting, offering unique bonding opportunities.', category: 'exploration', duration: 600, echoReward: 180, unlockLevel: 25 },
  { id: 'abyssal_awakening', name: 'Abyssal Awakening', description: 'The Hollow Core resonates with primordial energy, awakening dormant echo beings and triggering rare events.', category: 'cataclysm', duration: 1200, echoReward: 500, unlockLevel: 45 },
];

// ============================================================================
// HR_SPECIES: Species definitions
// ============================================================================

const HR_SPECIES: HrSpecies[] = [
  'hollow_wraith', 'echo_specter', 'void_crawler', 'silent_phantom', 'deep_stalker', 'shadow_echo', 'abyss_caller',
];

// ============================================================================
// Hook: useHollowReach
// ============================================================================

export default function useHollowReach(initialSeed?: number) {
  const [state, setState] = useState<HollowReachState>(() => hrCreateInitialState(initialSeed));
  const prngRef = useRef<() => number>(hrMulberry32(state.seed));
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ---- Core State ----

  const hrGetState = useCallback((): Readonly<HollowReachState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const hrResetState = useCallback((newSeed?: number) => {
    const s = hrCreateInitialState(newSeed);
    prngRef.current = hrMulberry32(s.seed);
    setState(s);
  }, []);

  // ---- Level / XP ----

  const hrLevel = useMemo(() => state.level, [state]);

  const hrEchoPower = useMemo(() => state.echoPower, [state]);

  const hrVoidDepth = useMemo(() => state.voidDepth, [state]);

  const hrGetXpRequired = useCallback((lvl: number): number => {
    return hrXpRequired(lvl);
  }, []);

  const hrAddXp = useCallback((amount: number): HollowReachState => {
    let next = state;
    setState((prev) => {
      let lvl = prev.level;
      let xp = prev.xp + Math.floor(amount);
      while (lvl < HR_MAX_LEVEL && xp >= hrXpRequired(lvl)) {
        xp -= hrXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= HR_MAX_LEVEL) xp = 0;
      next = { ...prev, level: hrClampLevel(lvl), xp };
      return next;
    });
    return next;
  }, [state]);

  // ---- Coins ----

  const hrGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const hrAddCoins = useCallback((amount: number): HollowReachState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: hrClampCoins(prev.coins + amount) };
      return next;
    });
    return next;
  }, [state]);

  const hrSpendCoins = useCallback((amount: number): { success: boolean; state: HollowReachState } => {
    if (state.coins < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: hrClampCoins(prev.coins - amount) };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Echo Power ----

  const hrGetMaxEchoPower = useCallback((): number => {
    return state.maxEchoPower;
  }, [state.maxEchoPower]);

  const hrAddEchoPower = useCallback((amount: number): HollowReachState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, echoPower: hrClampPower(prev.echoPower + amount, prev.maxEchoPower) };
      return next;
    });
    return next;
  }, [state]);

  const hrSpendEchoPower = useCallback((amount: number): { success: boolean; state: HollowReachState } => {
    if (state.echoPower < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, echoPower: hrClampPower(prev.echoPower - amount, prev.maxEchoPower) };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Title ----

  const hrGetCurrentTitle = useCallback((): HrTitleDef | null => {
    const title = HR_TITLES.find((t) => t.id === state.currentTitle);
    return title ?? null;
  }, [state.currentTitle]);

  const hrGetAllTitles = useCallback((): HrTitleDef[] => {
    return [...HR_TITLES];
  }, []);

  const hrSetTitle = useCallback((titleId: string): { success: boolean; state: HollowReachState } => {
    const titleDef = HR_TITLES.find((t) => t.id === titleId);
    if (!titleDef) return { success: false, state };
    if (state.level < titleDef.requiredLevel) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, currentTitle: titleId };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Bulk Material Operations ----

  const hrHarvestMaterial = useCallback((materialId: string): { success: boolean; quantity: number; state: HollowReachState } => {
    const mDef = HR_MATERIALS.find((m) => m.id === materialId);
    if (!mDef) return { success: false, quantity: 0, state };
    const roll = prngRef.current();
    const rarityThreshold = { common: 0.95, uncommon: 0.75, rare: 0.5, epic: 0.25, legendary: 0.08 };
    const threshold = rarityThreshold[mDef.rarity] ?? 0.5;
    if (roll > threshold) return { success: false, quantity: 0, state };

    const quantity = Math.floor(1 + prngRef.current() * 3);
    let next = state;
    setState((prev) => {
      const newMaterials = { ...prev.materials };
      const existingQty = newMaterials[materialId]?.quantity ?? 0;
      newMaterials[materialId] = { materialId, quantity: existingQty + quantity };
      next = {
        ...prev,
        materials: newMaterials,
        totals: {
          ...prev.totals,
          totalMaterialsHarvested: prev.totals.totalMaterialsHarvested + quantity,
        },
      };
      return next;
    });

    return { success: true, quantity, state: next };
  }, [state]);

  const hrSpendMaterial = useCallback((materialId: string, amount: number): { success: boolean; state: HollowReachState } => {
    const existing = state.materials[materialId];
    if (!existing || existing.quantity < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newMaterials = { ...prev.materials };
      const newQty = existing.quantity - amount;
      if (newQty <= 0) {
        delete newMaterials[materialId];
      } else {
        newMaterials[materialId] = { ...existing, quantity: newQty };
      }
      next = { ...prev, materials: newMaterials };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const hrGetMaterialQuantity = useCallback((materialId: string): number => {
    return state.materials[materialId]?.quantity ?? 0;
  }, [state.materials]);

  const hrGetAllMaterialQuantities = useCallback((): Record<string, number> => {
    const result: Record<string, number> = {};
    for (const [key, val] of Object.entries(state.materials)) {
      result[key] = val.quantity;
    }
    return result;
  }, [state.materials]);

  const hrGetMaterialsByRarity = useCallback((rarity: HrRarity): HrMaterialDef[] => {
    return HR_MATERIALS.filter((m) => m.rarity === rarity);
  }, []);

  const hrGetMaterialsBySource = useCallback((source: HrMaterialSource): HrMaterialDef[] => {
    return HR_MATERIALS.filter((m) => m.source === source);
  }, []);

  // ---- Bonded Echo Management ----

  const hrGetBondedEcho = useCallback((echoId: string): HrBondedEcho | null => {
    return state.bondedEchoes[echoId] ?? null;
  }, [state.bondedEchoes]);

  const hrGetAllBondedEchoes = useCallback((): HrBondedEcho[] => {
    return Object.values(state.bondedEchoes);
  }, [state.bondedEchoes]);

  const hrHealBondedEcho = useCallback((echoId: string): { success: boolean; state: HollowReachState } => {
    const bonded = state.bondedEchoes[echoId];
    if (!bonded) return { success: false, state };
    if (bonded.hp >= bonded.maxHp) return { success: false, state };
    if (state.echoPower < 10) return { success: false, state };

    let next = state;
    setState((prev) => {
      const newBonded = { ...prev.bondedEchoes };
      const healAmount = Math.floor(bonded.maxHp * 0.25);
      newBonded[echoId] = { ...bonded, hp: Math.min(bonded.maxHp, bonded.hp + healAmount) };
      next = {
        ...prev,
        bondedEchoes: newBonded,
        echoPower: hrClampPower(prev.echoPower - 10, prev.maxEchoPower),
      };
      return next;
    });

    return { success: true, state: next };
  }, [state]);

  const hrTrainBondedEcho = useCallback((echoId: string): { success: boolean; state: HollowReachState } => {
    const bonded = state.bondedEchoes[echoId];
    if (!bonded) return { success: false, state };
    if (bonded.loyalty >= 100) return { success: false, state };
    if (state.echoPower < 5) return { success: false, state };

    let next = state;
    setState((prev) => {
      const newBonded = { ...prev.bondedEchoes };
      const loyaltyGain = Math.floor(3 + prngRef.current() * 5);
      newBonded[echoId] = { ...bonded, loyalty: Math.min(100, bonded.loyalty + loyaltyGain) };
      const xpGained = Math.floor(loyaltyGain * 2);
      let lvl = prev.level;
      let xp = prev.xp + xpGained;
      while (lvl < HR_MAX_LEVEL && xp >= hrXpRequired(lvl)) {
        xp -= hrXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= HR_MAX_LEVEL) xp = 0;
      next = {
        ...prev,
        bondedEchoes: newBonded,
        echoPower: hrClampPower(prev.echoPower - 5, prev.maxEchoPower),
        level: hrClampLevel(lvl),
        xp,
      };
      return next;
    });

    return { success: true, state: next };
  }, [state]);

  const hrReleaseBondedEcho = useCallback((echoId: string): { success: boolean; state: HollowReachState } => {
    const bonded = state.bondedEchoes[echoId];
    if (!bonded) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newBonded = { ...prev.bondedEchoes };
      delete newBonded[echoId];
      const echoDef = HR_ECHOES.find((e) => e.id === echoId);
      const refundPower = echoDef ? Math.floor(echoDef.echoPower * 0.5) : 10;
      next = {
        ...prev,
        bondedEchoes: newBonded,
        echoPower: hrClampPower(prev.echoPower + refundPower, prev.maxEchoPower),
        totals: {
          ...prev.totals,
          totalEchoesBonded: Object.keys(newBonded).length,
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Cavern Exploration Advanced ----

  const hrGetCavernState = useCallback((cavernId: string): HrCavernExploration | null => {
    return state.caverns[cavernId] ?? null;
  }, [state.caverns]);

  const hrGetExploredCaverns = useCallback((): HrCavernDef[] => {
    return HR_CAVERNS.filter((c) => state.caverns[c.id]?.explored);
  }, [state.caverns]);

  const hrGetUnexploredCaverns = useCallback((): HrCavernDef[] => {
    return HR_CAVERNS.filter((c) => !state.caverns[c.id]?.explored && state.level >= c.unlockLevel);
  }, [state.caverns, state.level]);

  const hrGetLockedCaverns = useCallback((): HrCavernDef[] => {
    return HR_CAVERNS.filter((c) => state.level < c.unlockLevel);
  }, [state.level]);

  const hrGetMaxReachableDepth = useCallback((): number => {
    let maxDepth = 0;
    for (const [cId, cState] of Object.entries(state.caverns)) {
      if (cState.explored) {
        const cDef = HR_CAVERNS.find((c) => c.id === cId);
        if (cDef && cDef.depth > maxDepth) {
          maxDepth = cDef.depth;
        }
      }
    }
    return maxDepth;
  }, [state.caverns]);

  // ---- Structure Advanced ----

  const hrGetStructureLevel = useCallback((structureId: string): number => {
    return state.structures[structureId]?.level ?? 0;
  }, [state.structures]);

  const hrIsStructureBuilt = useCallback((structureId: string): boolean => {
    return (state.structures[structureId]?.level ?? 0) > 0;
  }, [state.structures]);

  const hrGetBuiltStructures = useCallback((): { def: HrStructureDef; state: HrOwnedStructure }[] => {
    const result: { def: HrStructureDef; state: HrOwnedStructure }[] = [];
    for (const [sId, sState] of Object.entries(state.structures)) {
      if (sState.level > 0) {
        const def = HR_STRUCTURES.find((s) => s.id === sId);
        if (def) result.push({ def, state: sState });
      }
    }
    return result;
  }, [state.structures]);

  const hrGetStructuresByType = useCallback((bonusType: string): HrStructureDef[] => {
    return HR_STRUCTURES.filter((s) => s.bonusType === bonusType);
  }, []);

  const hrGetTotalStructureBonus = useCallback((bonusType: string): number => {
    let total = 0;
    for (const [sId, sState] of Object.entries(state.structures)) {
      if (sState.level === 0) continue;
      const sDef = HR_STRUCTURES.find((s) => s.id === sId);
      if (sDef && sDef.bonusType === bonusType) {
        total += sDef.bonusPerLevel * sState.level;
      }
    }
    return total;
  }, [state.structures]);

  const hrDemolishStructure = useCallback((structureId: string): { success: boolean; refund: number; state: HollowReachState } => {
    const existing = state.structures[structureId];
    if (!existing || existing.level === 0) return { success: false, refund: 0, state };
    const sDef = HR_STRUCTURES.find((s) => s.id === structureId);
    if (!sDef) return { success: false, refund: 0, state };
    const refund = Math.floor(sDef.baseCost * existing.level * 0.3);
    let next = state;
    setState((prev) => {
      const newStructures = { ...prev.structures };
      delete newStructures[structureId];
      const builtCount = Object.values(newStructures).filter((s) => s.level > 0).length;
      next = {
        ...prev,
        structures: newStructures,
        coins: hrClampCoins(prev.coins + refund),
        totals: { ...prev.totals, totalCavernsBuilt: builtCount },
      };
      return next;
    });
    return { success: true, refund, state: next };
  }, [state]);

  // ---- Ability Advanced ----

  const hrIsAbilityLearned = useCallback((abilityId: string): boolean => {
    return state.abilities[abilityId]?.learned ?? false;
  }, [state.abilities]);

  const hrGetLearnedAbilities = useCallback((): { def: HrAbilityDef; state: HrAbilityState }[] => {
    const result: { def: HrAbilityDef; state: HrAbilityState }[] = [];
    for (const [aId, aState] of Object.entries(state.abilities)) {
      if (aState.learned) {
        const def = HR_ABILITIES.find((a) => a.id === aId);
        if (def) result.push({ def, state: aState });
      }
    }
    return result;
  }, [state.abilities]);

  const hrGetAbilityCooldownRemaining = useCallback((abilityId: string): number => {
    const aState = state.abilities[abilityId];
    if (!aState || !aState.learned) return 0;
    const now = Date.now();
    const remaining = aState.cooldownEnd - now;
    return remaining > 0 ? remaining : 0;
  }, [state.abilities]);

  const hrGetAbilitiesByRarity = useCallback((rarity: HrRarity): HrAbilityDef[] => {
    return HR_ABILITIES.filter((a) => a.rarity === rarity);
  }, []);

  const hrGetCastableAbilities = useCallback((): HrAbilityDef[] => {
    const now = Date.now();
    const result: HrAbilityDef[] = [];
    for (const [aId, aState] of Object.entries(state.abilities)) {
      if (aState.learned && now >= aState.cooldownEnd) {
        const def = HR_ABILITIES.find((a) => a.id === aId);
        if (def && state.echoPower >= def.echoCost) result.push(def);
      }
    }
    return result;
  }, [state.abilities, state.echoPower]);

  // ---- Artifact Advanced ----

  const hrIsArtifactFound = useCallback((artifactId: string): boolean => {
    return state.artifacts[artifactId]?.found ?? false;
  }, [state.artifacts]);

  const hrIsArtifactEquipped = useCallback((artifactId: string): boolean => {
    return state.artifacts[artifactId]?.equipped ?? false;
  }, [state.artifacts]);

  const hrGetFoundArtifacts = useCallback((): HrArtifactDef[] => {
    const result: HrArtifactDef[] = [];
    for (const [aId, aState] of Object.entries(state.artifacts)) {
      if (aState.found) {
        const def = HR_ARTIFACTS.find((a) => a.id === aId);
        if (def) result.push(def);
      }
    }
    return result;
  }, [state.artifacts]);

  const hrGetEquippedArtifact = useCallback((): HrArtifactDef | null => {
    for (const [aId, aState] of Object.entries(state.artifacts)) {
      if (aState.equipped) {
        const def = HR_ARTIFACTS.find((a) => a.id === aId);
        if (def) return def;
      }
    }
    return null;
  }, [state.artifacts]);

  const hrGetArtifactsByCavern = useCallback((cavernId: HrCavernId): HrArtifactDef[] => {
    return HR_ARTIFACTS.filter((a) => a.cavernId === cavernId);
  }, []);

  const hrGetArtifactsByRarity = useCallback((rarity: HrRarity): HrArtifactDef[] => {
    return HR_ARTIFACTS.filter((a) => a.rarity === rarity);
  }, []);

  const hrUnequipArtifact = useCallback((artifactId: string): { success: boolean; state: HollowReachState } => {
    const artifactState = state.artifacts[artifactId];
    if (!artifactState || !artifactState.equipped) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newArtifacts = { ...prev.artifacts };
      newArtifacts[artifactId] = { ...artifactState, equipped: false };
      next = { ...prev, artifacts: newArtifacts };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Event Advanced ----

  const hrIsEventActive = useCallback((eventId: string): boolean => {
    return state.events[eventId]?.active ?? false;
  }, [state.events]);

  const hrIsEventCompleted = useCallback((eventId: string): boolean => {
    return state.events[eventId]?.completedAt !== null;
  }, [state.events]);

  const hrGetActiveEvents = useCallback((): HrEventDef[] => {
    const result: HrEventDef[] = [];
    for (const [eId, eState] of Object.entries(state.events)) {
      if (eState.active) {
        const def = HR_EVENTS.find((e) => e.id === eId);
        if (def) result.push(def);
      }
    }
    return result;
  }, [state.events]);

  const hrGetCompletedEvents = useCallback((): HrEventDef[] => {
    const result: HrEventDef[] = [];
    for (const [eId, eState] of Object.entries(state.events)) {
      if (eState.completedAt !== null) {
        const def = HR_EVENTS.find((e) => e.id === eId);
        if (def) result.push(def);
      }
    }
    return result;
  }, [state.events]);

  const hrGetEventsByCategory = useCallback((category: HrEventCategory): HrEventDef[] => {
    return HR_EVENTS.filter((e) => e.category === category);
  }, []);

  const hrGetAvailableEvents = useCallback((): HrEventDef[] => {
    return HR_EVENTS.filter((e) => state.level >= e.unlockLevel);
  }, [state.level]);

  // ---- Achievement Advanced ----

  const hrIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    return state.achievements[achievementId]?.unlocked ?? false;
  }, [state.achievements]);

  const hrGetUnlockedAchievements = useCallback((): HrAchievementDef[] => {
    const result: HrAchievementDef[] = [];
    for (const [aId, aState] of Object.entries(state.achievements)) {
      if (aState.unlocked) {
        const def = HR_ACHIEVEMENTS.find((a) => a.id === aId);
        if (def) result.push(def);
      }
    }
    return result;
  }, [state.achievements]);

  const hrGetLockedAchievements = useCallback((): HrAchievementDef[] => {
    const result: HrAchievementDef[] = [];
    for (const [aId, aState] of Object.entries(state.achievements)) {
      if (!aState.unlocked) {
        const def = HR_ACHIEVEMENTS.find((a) => a.id === aId);
        if (def) result.push(def);
      }
    }
    return result;
  }, [state.achievements]);

  // ---- Statistics & Totals ----

  const hrGetTotals = useCallback((): Readonly<HrTotals> => {
    return Object.freeze({ ...state.totals });
  }, [state.totals]);

  const hrGetOverallStats = useCallback(() => {
    return {
      level: state.level,
      xp: state.xp,
      coins: state.coins,
      echoPower: state.echoPower,
      maxEchoPower: state.maxEchoPower,
      voidDepth: state.voidDepth,
      bondedEchoes: Object.keys(state.bondedEchoes).length,
      exploredCaverns: Object.values(state.caverns).filter((c) => c.explored).length,
      totalCaverns: HR_CAVERNS.length,
      materialsCollected: Object.values(state.materials).reduce((s, m) => s + m.quantity, 0),
      structuresBuilt: Object.values(state.structures).filter((s) => s.level > 0).length,
      abilitiesLearned: Object.values(state.abilities).filter((a) => a.learned).length,
      artifactsFound: Object.values(state.artifacts).filter((a) => a.found).length,
      achievementsUnlocked: Object.values(state.achievements).filter((a) => a.unlocked).length,
      totalAchievements: HR_ACHIEVEMENTS.length,
      eventsCompleted: Object.values(state.events).filter((e) => e.completedAt !== null).length,
      totalEvents: HR_EVENTS.length,
    };
  }, [state]);

  // ---- Deep Echo Search ----

  const hrDeepEchoSearch = useCallback((cavernId: HrCavernId): { success: boolean; echoesFound: string[]; xpGained: number; state: HollowReachState } => {
    const cavernDef = HR_CAVERNS.find((c) => c.id === cavernId);
    if (!cavernDef) return { success: false, echoesFound: [], xpGained: 0, state };
    if (state.level < cavernDef.unlockLevel) return { success: false, echoesFound: [], xpGained: 0, state };
    if (state.echoPower < 30) return { success: false, echoesFound: [], xpGained: 0, state };

    const echoesFound: string[] = [];
    const possibleEchoes = HR_ECHOES.filter((e) => e.cavernId === cavernId && !state.bondedEchoes[e.id]);

    const searchCount = Math.floor(1 + prngRef.current() * 3);
    for (let i = 0; i < searchCount; i++) {
      if (possibleEchoes.length === 0) break;
      const rarityRoll = prngRef.current();
      let pool = possibleEchoes.filter((e) => e.rarity === 'common');
      if (rarityRoll > 0.6) pool = possibleEchoes.filter((e) => e.rarity === 'uncommon');
      if (rarityRoll > 0.85) pool = possibleEchoes.filter((e) => e.rarity === 'rare');
      if (rarityRoll > 0.95) pool = possibleEchoes.filter((e) => e.rarity === 'epic');
      if (rarityRoll > 0.99) pool = possibleEchoes.filter((e) => e.rarity === 'legendary');
      if (pool.length === 0) pool = possibleEchoes;
      const idx = Math.floor(prngRef.current() * pool.length);
      echoesFound.push(pool[idx].id);
    }

    const xpGained = Math.floor(echoesFound.length * 30 * cavernDef.dangerLevel);
    let next = state;
    setState((prev) => {
      const newBonded = { ...prev.bondedEchoes };
      for (const eid of echoesFound) {
        const eDef = HR_ECHOES.find((e) => e.id === eid);
        if (eDef) {
          newBonded[eid] = {
            echoId: eid,
            bondedAt: Date.now(),
            hp: eDef.hp,
            maxHp: eDef.hp,
            loyalty: 30,
          };
        }
      }
      let lvl = prev.level;
      let xp = prev.xp + xpGained;
      while (lvl < HR_MAX_LEVEL && xp >= hrXpRequired(lvl)) {
        xp -= hrXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= HR_MAX_LEVEL) xp = 0;
      next = {
        ...prev,
        bondedEchoes: newBonded,
        echoPower: hrClampPower(prev.echoPower - 30, prev.maxEchoPower),
        level: hrClampLevel(lvl),
        xp,
        totals: {
          ...prev.totals,
          totalEchoCalls: prev.totals.totalEchoCalls + echoesFound.length,
          totalEchoesBonded: Object.keys(newBonded).length,
        },
      };
      return next;
    });

    return { success: true, echoesFound, xpGained, state: next };
  }, [state]);

  // ---- Void Dive Extended ----

  const hrVoidDiveExtended = useCallback((targetDepth: number): { success: boolean; newXp: number; newDepth: number; materialsFound: string[]; state: HollowReachState } => {
    if (targetDepth <= state.voidDepth) return { success: false, newXp: 0, newDepth: state.voidDepth, materialsFound: [], state };
    if (state.echoPower < 40) return { success: false, newXp: 0, newDepth: state.voidDepth, materialsFound: [], state };

    const materialsFound: string[] = [];
    const matCount = Math.floor(2 + prngRef.current() * 5);
    const possibleMaterials = HR_MATERIALS.filter((m) => {
      if (m.rarity === 'common') return true;
      if (m.rarity === 'uncommon') return targetDepth > 500;
      if (m.rarity === 'rare') return targetDepth > 2000;
      if (m.rarity === 'epic') return targetDepth > 5000;
      if (m.rarity === 'legendary') return targetDepth > 8000;
      return false;
    });
    for (let i = 0; i < matCount; i++) {
      if (possibleMaterials.length > 0) {
        const matIdx = Math.floor(prngRef.current() * possibleMaterials.length);
        materialsFound.push(possibleMaterials[matIdx].id);
      }
    }

    const xpGained = Math.floor(targetDepth * 0.15);
    let next = state;
    setState((prev) => {
      const newMaterials = { ...prev.materials };
      for (const matId of materialsFound) {
        const existingQty = newMaterials[matId]?.quantity ?? 0;
        newMaterials[matId] = { materialId: matId, quantity: existingQty + 1 };
      }
      let lvl = prev.level;
      let xp = prev.xp + xpGained;
      while (lvl < HR_MAX_LEVEL && xp >= hrXpRequired(lvl)) {
        xp -= hrXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= HR_MAX_LEVEL) xp = 0;
      next = {
        ...prev,
        voidDepth: targetDepth,
        echoPower: hrClampPower(prev.echoPower - 40, prev.maxEchoPower),
        materials: newMaterials,
        level: hrClampLevel(lvl),
        xp,
        totals: {
          ...prev.totals,
          totalVoidDives: prev.totals.totalVoidDives + 1,
          totalMaterialsHarvested: prev.totals.totalMaterialsHarvested + materialsFound.length,
        },
      };
      return next;
    });

    return { success: true, newXp: xpGained, newDepth: targetDepth, materialsFound, state: next };
  }, [state]);

  // ---- Echo Call (summon/bond echo being) ----

  const hrEchoCall = useCallback((cavernId: HrCavernId): { success: boolean; echoId: string; xpGained: number; state: HollowReachState } => {
    const cavernDef = HR_CAVERNS.find((c) => c.id === cavernId);
    if (!cavernDef) return { success: false, echoId: '', xpGained: 0, state };
    if (state.level < cavernDef.unlockLevel) return { success: false, echoId: '', xpGained: 0, state };
    if (state.echoPower < 15) return { success: false, echoId: '', xpGained: 0, state };

    const possibleEchoes = HR_ECHOES.filter(
      (e) => e.cavernId === cavernId && !state.bondedEchoes[e.id]
    );
    if (possibleEchoes.length === 0) return { success: false, echoId: '', xpGained: 0, state };

    const roll = prngRef.current();
    const rarityRoll = prngRef.current();
    let pool = possibleEchoes.filter((e) => e.rarity === 'common');
    if (rarityRoll > 0.5) pool = possibleEchoes.filter((e) => e.rarity === 'uncommon');
    if (rarityRoll > 0.8) pool = possibleEchoes.filter((e) => e.rarity === 'rare');
    if (rarityRoll > 0.93) pool = possibleEchoes.filter((e) => e.rarity === 'epic');
    if (rarityRoll > 0.98) pool = possibleEchoes.filter((e) => e.rarity === 'legendary');
    if (pool.length === 0) pool = possibleEchoes;

    const idx = Math.floor(roll * pool.length);
    const chosen = pool[idx];
    const xpGained = Math.floor(20 * hrRarityMultiplier(chosen.rarity));

    let next = state;
    setState((prev) => {
      const newBonded = { ...prev.bondedEchoes };
      newBonded[chosen.id] = {
        echoId: chosen.id,
        bondedAt: Date.now(),
        hp: chosen.hp,
        maxHp: chosen.hp,
        loyalty: 50,
      };
      let lvl = prev.level;
      let xp = prev.xp + xpGained;
      while (lvl < HR_MAX_LEVEL && xp >= hrXpRequired(lvl)) {
        xp -= hrXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= HR_MAX_LEVEL) xp = 0;
      next = {
        ...prev,
        bondedEchoes: newBonded,
        echoPower: hrClampPower(prev.echoPower - 15, prev.maxEchoPower),
        level: hrClampLevel(lvl),
        xp,
        totals: {
          ...prev.totals,
          totalEchoCalls: prev.totals.totalEchoCalls + 1,
          totalEchoesBonded: Object.keys(newBonded).length,
        },
      };
      return next;
    });

    return { success: true, echoId: chosen.id, xpGained, state: next };
  }, [state]);

  // ---- Hollow Walk (explore cavern) ----

  const hrHollowWalk = useCallback((cavernId: HrCavernId): { success: boolean; materialsFound: string[]; xpGained: number; state: HollowReachState } => {
    const cavernDef = HR_CAVERNS.find((c) => c.id === cavernId);
    if (!cavernDef) return { success: false, materialsFound: [], xpGained: 0, state };
    if (state.level < cavernDef.unlockLevel) return { success: false, materialsFound: [], xpGained: 0, state };

    const materialsFound: string[] = [];
    const possibleMaterials = HR_MATERIALS.filter((m) => {
      if (m.rarity === 'common') return cavernDef.dangerLevel <= 3;
      if (m.rarity === 'uncommon') return cavernDef.dangerLevel >= 2;
      if (m.rarity === 'rare') return cavernDef.dangerLevel >= 4;
      if (m.rarity === 'epic') return cavernDef.dangerLevel >= 6;
      if (m.rarity === 'legendary') return cavernDef.dangerLevel >= 8;
      return false;
    });

    for (let i = 0; i < 3; i++) {
      const roll = prngRef.current();
      if (roll < 0.6 && possibleMaterials.length > 0) {
        const matIdx = Math.floor(prngRef.current() * possibleMaterials.length);
        materialsFound.push(possibleMaterials[matIdx].id);
      }
    }

    const xpGained = Math.floor(15 * cavernDef.dangerLevel * cavernDef.echoDensity);
    let next = state;

    setState((prev) => {
      const newCaverns = { ...prev.caverns };
      const existing = newCaverns[cavernId] ?? { explored: false, depth: 0, dives: 0, echoesEncountered: 0, unlockedAt: null };
      newCaverns[cavernId] = {
        ...existing,
        explored: true,
        depth: Math.max(existing.depth, cavernDef.depth),
        dives: existing.dives + 1,
        unlockedAt: existing.unlockedAt ?? Date.now(),
      };

      const newMaterials = { ...prev.materials };
      for (const matId of materialsFound) {
        const existingQty = newMaterials[matId]?.quantity ?? 0;
        newMaterials[matId] = { materialId: matId, quantity: existingQty + 1 };
      }

      let lvl = prev.level;
      let xp = prev.xp + xpGained;
      while (lvl < HR_MAX_LEVEL && xp >= hrXpRequired(lvl)) {
        xp -= hrXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= HR_MAX_LEVEL) xp = 0;

      next = {
        ...prev,
        caverns: newCaverns,
        materials: newMaterials,
        level: hrClampLevel(lvl),
        xp,
        totals: {
          ...prev.totals,
          totalHollowWalks: prev.totals.totalHollowWalks + 1,
          totalMaterialsHarvested: prev.totals.totalMaterialsHarvested + materialsFound.length,
        },
      };
      return next;
    });

    return { success: true, materialsFound, xpGained, state: next };
  }, [state]);

  // ---- Build Cavern Structure ----

  const hrBuildCavern = useCallback((structureId: string): { success: boolean; cost: number; state: HollowReachState } => {
    const sDef = HR_STRUCTURES.find((s) => s.id === structureId);
    if (!sDef) return { success: false, cost: 0, state };
    if (state.level < sDef.requiredLevel) return { success: false, cost: 0, state };
    const existing = state.structures[structureId];
    if (existing && existing.level >= sDef.maxLevel) return { success: false, cost: 0, state };

    const currentLevel = existing?.level ?? 0;
    const cost = Math.floor(sDef.baseCost * Math.pow(sDef.costMultiplier, currentLevel));
    if (state.coins < cost) return { success: false, cost, state };

    let next = state;
    setState((prev) => {
      const newStructures = { ...prev.structures };
      if (existing) {
        newStructures[structureId] = { ...existing, level: existing.level + 1 };
      } else {
        newStructures[structureId] = { structureId, level: 1, builtAt: Date.now() };
      }
      const builtCount = Object.values(newStructures).filter((s) => s.level > 0).length;
      next = {
        ...prev,
        structures: newStructures,
        coins: hrClampCoins(prev.coins - cost),
        totals: {
          ...prev.totals,
          totalCavernsBuilt: builtCount,
        },
      };
      return next;
    });

    return { success: true, cost, state: next };
  }, [state]);

  // ---- Void Dive ----

  const hrVoidDive = useCallback((depth: number): { success: boolean; newXp: number; newDepth: number; state: HollowReachState } => {
    if (depth <= state.voidDepth) return { success: false, newXp: 0, newDepth: state.voidDepth, state };
    if (state.echoPower < 20) return { success: false, newXp: 0, newDepth: state.voidDepth, state };

    const xpGained = Math.floor(depth * 0.1);
    let next = state;
    setState((prev) => {
      let lvl = prev.level;
      let xp = prev.xp + xpGained;
      while (lvl < HR_MAX_LEVEL && xp >= hrXpRequired(lvl)) {
        xp -= hrXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= HR_MAX_LEVEL) xp = 0;

      next = {
        ...prev,
        voidDepth: depth,
        echoPower: hrClampPower(prev.echoPower - 20, prev.maxEchoPower),
        level: hrClampLevel(lvl),
        xp,
        totals: {
          ...prev.totals,
          totalVoidDives: prev.totals.totalVoidDives + 1,
        },
      };
      return next;
    });

    return { success: true, newXp: xpGained, newDepth: depth, state: next };
  }, [state]);

  // ---- Abilities ----

  const hrLearnAbility = useCallback((abilityId: string): { success: boolean; state: HollowReachState } => {
    const aDef = HR_ABILITIES.find((a) => a.id === abilityId);
    if (!aDef) return { success: false, state };
    if (state.level < aDef.requiredLevel) return { success: false, state };
    if (state.abilities[abilityId]?.learned) return { success: false, state };

    let next = state;
    setState((prev) => {
      const newAbilities = { ...prev.abilities };
      newAbilities[abilityId] = { learned: true, castCount: 0, cooldownEnd: 0 };
      next = { ...prev, abilities: newAbilities };
      return next;
    });

    return { success: true, state: next };
  }, [state]);

  const hrCastAbility = useCallback((abilityId: string): { success: boolean; state: HollowReachState } => {
    const aDef = HR_ABILITIES.find((a) => a.id === abilityId);
    if (!aDef) return { success: false, state };
    const aState = state.abilities[abilityId];
    if (!aState || !aState.learned) return { success: false, state };
    const now = Date.now();
    if (now < aState.cooldownEnd) return { success: false, state };
    if (state.echoPower < aDef.echoCost) return { success: false, state };

    const xpGained = Math.floor(aDef.power * hrRarityMultiplier(aDef.rarity));
    let next = state;

    setState((prev) => {
      const newAbilities = { ...prev.abilities };
      newAbilities[abilityId] = { ...aState, castCount: aState.castCount + 1, cooldownEnd: now + aDef.cooldown * 1000 };

      let lvl = prev.level;
      let xp = prev.xp + xpGained;
      while (lvl < HR_MAX_LEVEL && xp >= hrXpRequired(lvl)) {
        xp -= hrXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= HR_MAX_LEVEL) xp = 0;

      next = {
        ...prev,
        abilities: newAbilities,
        echoPower: hrClampPower(prev.echoPower - aDef.echoCost, prev.maxEchoPower),
        level: hrClampLevel(lvl),
        xp,
        totals: {
          ...prev.totals,
          totalAbilitiesCast: prev.totals.totalAbilitiesCast + 1,
        },
      };
      return next;
    });

    return { success: true, state: next };
  }, [state]);

  // ---- Artifacts ----

  const hrDiscoverArtifact = useCallback((artifactId: string): { success: boolean; state: HollowReachState } => {
    const aDef = HR_ARTIFACTS.find((a) => a.id === artifactId);
    if (!aDef) return { success: false, state };
    if (state.level < aDef.requiredLevel) return { success: false, state };
    if (state.artifacts[artifactId]?.found) return { success: false, state };

    let next = state;
    setState((prev) => {
      const newArtifacts = { ...prev.artifacts };
      newArtifacts[artifactId] = { artifactId, found: true, foundAt: Date.now(), equipped: false };
      const foundCount = Object.values(newArtifacts).filter((a) => a.found).length;
      next = {
        ...prev,
        artifacts: newArtifacts,
        maxEchoPower: 50 + aDef.echoPowerBonus + foundCount * 5,
        totals: {
          ...prev.totals,
          totalArtifactsFound: foundCount,
        },
      };
      return next;
    });

    return { success: true, state: next };
  }, [state]);

  const hrEquipArtifact = useCallback((artifactId: string): { success: boolean; state: HollowReachState } => {
    const artifactState = state.artifacts[artifactId];
    if (!artifactState || !artifactState.found) return { success: false, state };

    let next = state;
    setState((prev) => {
      const newArtifacts = { ...prev.artifacts };
      for (const key of Object.keys(newArtifacts)) {
        newArtifacts[key] = { ...newArtifacts[key], equipped: false };
      }
      newArtifacts[artifactId] = { ...artifactState, equipped: true };
      next = { ...prev, artifacts: newArtifacts };
      return next;
    });

    return { success: true, state: next };
  }, [state]);

  // ---- Events ----

  const hrStartEvent = useCallback((eventId: string): { success: boolean; state: HollowReachState } => {
    const eDef = HR_EVENTS.find((e) => e.id === eventId);
    if (!eDef) return { success: false, state };
    if (state.level < eDef.unlockLevel) return { success: false, state };

    let next = state;
    setState((prev) => {
      const newEvents = { ...prev.events };
      newEvents[eventId] = { eventId, active: true, startedAt: Date.now(), completedAt: null };
      next = { ...prev, events: newEvents };
      return next;
    });

    return { success: true, state: next };
  }, [state]);

  const hrCompleteEvent = useCallback((eventId: string): { success: boolean; echoReward: number; state: HollowReachState } => {
    const eDef = HR_EVENTS.find((e) => e.id === eventId);
    if (!eDef) return { success: false, echoReward: 0, state };
    const eState = state.events[eventId];
    if (!eState || !eState.active) return { success: false, echoReward: 0, state };

    let next = state;
    setState((prev) => {
      const newEvents = { ...prev.events };
      newEvents[eventId] = { ...eState, active: false, completedAt: Date.now() };

      const completedCount = Object.values(newEvents).filter((ev) => ev.completedAt !== null).length;

      let lvl = prev.level;
      let xp = prev.xp + eDef.echoReward;
      while (lvl < HR_MAX_LEVEL && xp >= hrXpRequired(lvl)) {
        xp -= hrXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= HR_MAX_LEVEL) xp = 0;

      next = {
        ...prev,
        events: newEvents,
        echoPower: hrClampPower(prev.echoPower + Math.floor(eDef.echoReward * 0.5), prev.maxEchoPower),
        coins: hrClampCoins(prev.coins + Math.floor(eDef.echoReward * 0.3)),
        level: hrClampLevel(lvl),
        xp,
        totals: {
          ...prev.totals,
          totalEventsCompleted: completedCount,
        },
      };
      return next;
    });

    return { success: true, echoReward: eDef.echoReward, state: next };
  }, [state]);

  // ---- Achievements Check (in useEffect, reading stateRef) ----

  useEffect(() => {
    const checkAndNotify = () => {
      const s = stateRef.current;
      const totalsMap: Record<string, number> = {
        totalEchoCalls: s.totals.totalEchoCalls,
        totalHollowWalks: s.totals.totalHollowWalks,
        totalCavernsBuilt: s.totals.totalCavernsBuilt,
        totalVoidDives: s.totals.totalVoidDives,
        totalEchoesBonded: s.totals.totalEchoesBonded,
        totalArtifactsFound: s.totals.totalArtifactsFound,
        totalMaterialsHarvested: s.totals.totalMaterialsHarvested,
        totalAbilitiesCast: s.totals.totalAbilitiesCast,
        totalEventsCompleted: s.totals.totalEventsCompleted,
        voidDepth: s.voidDepth,
      };
      let changed = false;
      const newAchievements = { ...s.achievements };
      for (const ach of HR_ACHIEVEMENTS) {
        const achState = newAchievements[ach.id];
        if (achState && !achState.unlocked) {
          const value = totalsMap[ach.conditionKey] ?? 0;
          if (value >= ach.targetValue) {
            newAchievements[ach.id] = { ...achState, unlocked: true, unlockedAt: Date.now() };
            changed = true;
          }
        }
      }
      if (changed) {
        setState((prev) => ({ ...prev, achievements: newAchievements }));
      }
    };
    checkAndNotify();
  }, [state.totals, state.voidDepth]);

  // ---- Echo Power Auto Regen (in useEffect, reading stateRef) ----

  useEffect(() => {
    const interval = setInterval(() => {
      const regenRate = (() => {
        const s = stateRef.current;
        let regen = 2;
        for (const [sId, ss] of Object.entries(s.structures)) {
          if (ss.level === 0) continue;
          const sdef = HR_STRUCTURES.find((st) => st.id === sId);
          if (sdef && sdef.bonusType === 'echo_regen') {
            regen += sdef.bonusPerLevel * ss.level;
          }
        }
        return regen;
      })();
      setState((prev) => {
        if (prev.echoPower >= prev.maxEchoPower) return prev;
        return {
          ...prev,
          echoPower: hrClampPower(prev.echoPower + regenRate, prev.maxEchoPower),
        };
      });
    }, 5000);
    return () => { clearInterval(interval); };
  }, []);

  // ---- Auto Title Promotion (in useEffect, reading stateRef) ----

  useEffect(() => {
    const s = stateRef.current;
    const eligibleTitles = HR_TITLES.filter((t) => s.level >= t.requiredLevel);
    if (eligibleTitles.length === 0) return;
    const best = eligibleTitles[eligibleTitles.length - 1];
    if (s.currentTitle !== best.id) {
      setState((prev) => ({ ...prev, currentTitle: best.id }));
    }
  }, [state.level]);

  // ---- Computed Values ----

  const currentTitle = useMemo((): HrTitleDef => {
    const t = HR_TITLES.find((title) => title.id === state.currentTitle);
    return t ?? HR_TITLES[0];
  }, [state]);

  const xpProgress = useMemo((): number => {
    const req = hrXpRequired(state.level);
    if (req === Infinity) return 100;
    if (req === 0) return 0;
    return Math.min(100, (state.xp / req) * 100);
  }, [state]);

  const bondedCount = useMemo((): number => {
    return Object.keys(state.bondedEchoes).length;
  }, [state]);

  const exploredCavernCount = useMemo((): number => {
    return Object.values(state.caverns).filter((c) => c.explored).length;
  }, [state]);

  const totalMaterialCount = useMemo((): number => {
    return Object.values(state.materials).reduce((sum, m) => sum + m.quantity, 0);
  }, [state]);

  const unlockedAchievementCount = useMemo((): number => {
    return Object.values(state.achievements).filter((a) => a.unlocked).length;
  }, [state]);

  const learnedAbilityCount = useMemo((): number => {
    return Object.values(state.abilities).filter((a) => a.learned).length;
  }, [state]);

  const foundArtifactCount = useMemo((): number => {
    return Object.values(state.artifacts).filter((a) => a.found).length;
  }, [state]);

  const builtStructureCount = useMemo((): number => {
    return Object.values(state.structures).filter((s) => s.level > 0).length;
  }, [state]);

  const echoPowerScore = useMemo((): number => {
    return Object.values(state.bondedEchoes).reduce((sum, b) => {
      const def = HR_ECHOES.find((e) => e.id === b.echoId);
      if (def) return sum + def.echoPower;
      return sum;
    }, 0);
  }, [state]);

  // ---- Persist Config ----

  const hrPersistConfig = useMemo(() => ({
    name: 'hollow-reach-storage',
    version: 1,
  }), []);

  // ---- Helpers ----

  const hrRandomInt = useCallback((min: number, max: number): number => {
    return min + Math.floor(prngRef.current() * (max - min + 1));
  }, []);

  const hrGetSeed = useCallback((): number => {
    return state.seed;
  }, [state.seed]);

  const hrSetSeed = useCallback((seed: number): void => {
    prngRef.current = hrMulberry32(seed);
    setState((prev) => ({ ...prev, seed }));
  }, []);

  const hrGetColorTheme = useCallback((): HrColorTheme => {
    return { ...HR_COLOR_THEME };
  }, []);

  const hrGetEchoById = useCallback((echoId: string): HrEchoBeingDef | null => {
    return HR_ECHOES.find((e) => e.id === echoId) ?? null;
  }, []);

  const hrGetEchoesBySpecies = useCallback((species: HrSpecies): HrEchoBeingDef[] => {
    return HR_ECHOES.filter((e) => e.species === species);
  }, []);

  const hrGetEchoesByRarity = useCallback((rarity: HrRarity): HrEchoBeingDef[] => {
    return HR_ECHOES.filter((e) => e.rarity === rarity);
  }, []);

  const hrGetEchoesByCavern = useCallback((cavernId: HrCavernId): HrEchoBeingDef[] => {
    return HR_ECHOES.filter((e) => e.cavernId === cavernId);
  }, []);

  const hrGetCavernById = useCallback((cavernId: string): HrCavernDef | null => {
    return HR_CAVERNS.find((c) => c.id === cavernId) ?? null;
  }, []);

  const hrGetMaterialById = useCallback((materialId: string): HrMaterialDef | null => {
    return HR_MATERIALS.find((m) => m.id === materialId) ?? null;
  }, []);

  const hrGetStructureById = useCallback((structureId: string): HrStructureDef | null => {
    return HR_STRUCTURES.find((s) => s.id === structureId) ?? null;
  }, []);

  const hrGetAbilityById = useCallback((abilityId: string): HrAbilityDef | null => {
    return HR_ABILITIES.find((a) => a.id === abilityId) ?? null;
  }, []);

  const hrGetAchievementById = useCallback((achievementId: string): HrAchievementDef | null => {
    return HR_ACHIEVEMENTS.find((a) => a.id === achievementId) ?? null;
  }, []);

  const hrGetArtifactById = useCallback((artifactId: string): HrArtifactDef | null => {
    return HR_ARTIFACTS.find((a) => a.id === artifactId) ?? null;
  }, []);

  const hrGetEventById = useCallback((eventId: string): HrEventDef | null => {
    return HR_EVENTS.find((e) => e.id === eventId) ?? null;
  }, []);

  const hrGetAchievementProgress = useCallback((achievementId: string): { current: number; target: number; percentage: number } => {
    const def = HR_ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!def) return { current: 0, target: 0, percentage: 0 };
    const totalsMap: Record<string, number> = {
      totalEchoCalls: state.totals.totalEchoCalls,
      totalHollowWalks: state.totals.totalHollowWalks,
      totalCavernsBuilt: state.totals.totalCavernsBuilt,
      totalVoidDives: state.totals.totalVoidDives,
      totalEchoesBonded: state.totals.totalEchoesBonded,
      totalArtifactsFound: state.totals.totalArtifactsFound,
      totalMaterialsHarvested: state.totals.totalMaterialsHarvested,
      totalAbilitiesCast: state.totals.totalAbilitiesCast,
      totalEventsCompleted: state.totals.totalEventsCompleted,
      voidDepth: state.voidDepth,
    };
    const current = totalsMap[def.conditionKey] ?? 0;
    return { current, target: def.targetValue, percentage: def.targetValue > 0 ? current / def.targetValue : 0 };
  }, [state]);

  const hrGetUpgradeCost = useCallback((structureId: string): number => {
    const sDef = HR_STRUCTURES.find((s) => s.id === structureId);
    if (!sDef) return 0;
    const existing = state.structures[structureId];
    const currentLevel = existing?.level ?? 0;
    return Math.floor(sDef.baseCost * Math.pow(sDef.costMultiplier, currentLevel));
  }, [state]);

  // ---- Return ----

  return {
    // Constants
    HR_SPECIES,
    HR_ECHOES,
    HR_CAVERNS,
    HR_MATERIALS,
    HR_STRUCTURES,
    HR_ABILITIES,
    HR_ACHIEVEMENTS,
    HR_TITLES,
    HR_ARTIFACTS,
    HR_EVENTS,
    HR_COLOR_THEME,
    HR_RARITIES,
    HR_MAX_LEVEL,

    // State shortcuts
    hrLevel,
    hrEchoPower,
    hrVoidDepth,
    currentTitle,
    xpProgress,
    bondedCount,
    exploredCavernCount,
    totalMaterialCount,
    unlockedAchievementCount,
    learnedAbilityCount,
    foundArtifactCount,
    builtStructureCount,
    echoPowerScore,

    // Core
    hrGetState,
    hrResetState,
    hrGetXpRequired,
    hrAddXp,
    hrGetCoins,
    hrAddCoins,
    hrSpendCoins,
    hrGetMaxEchoPower,
    hrAddEchoPower,
    hrSpendEchoPower,

    // Title
    hrGetCurrentTitle,
    hrGetAllTitles,
    hrSetTitle,

    // Actions
    hrEchoCall,
    hrHollowWalk,
    hrBuildCavern,
    hrVoidDive,
    hrDeepEchoSearch,
    hrVoidDiveExtended,

    // Materials
    hrHarvestMaterial,
    hrSpendMaterial,
    hrGetMaterialQuantity,
    hrGetAllMaterialQuantities,
    hrGetMaterialsByRarity,
    hrGetMaterialsBySource,

    // Bonded Echoes
    hrGetBondedEcho,
    hrGetAllBondedEchoes,
    hrHealBondedEcho,
    hrTrainBondedEcho,
    hrReleaseBondedEcho,

    // Caverns
    hrGetCavernState,
    hrGetExploredCaverns,
    hrGetUnexploredCaverns,
    hrGetLockedCaverns,
    hrGetMaxReachableDepth,

    // Structures
    hrGetStructureLevel,
    hrIsStructureBuilt,
    hrGetBuiltStructures,
    hrGetStructuresByType,
    hrGetTotalStructureBonus,
    hrDemolishStructure,

    // Abilities
    hrIsAbilityLearned,
    hrGetLearnedAbilities,
    hrGetAbilityCooldownRemaining,
    hrGetAbilitiesByRarity,
    hrGetCastableAbilities,

    // Artifacts
    hrIsArtifactFound,
    hrIsArtifactEquipped,
    hrGetFoundArtifacts,
    hrGetEquippedArtifact,
    hrGetArtifactsByCavern,
    hrGetArtifactsByRarity,
    hrUnequipArtifact,

    // Events
    hrIsEventActive,
    hrIsEventCompleted,
    hrGetActiveEvents,
    hrGetCompletedEvents,
    hrGetEventsByCategory,
    hrGetAvailableEvents,

    // Achievements
    hrIsAchievementUnlocked,
    hrGetUnlockedAchievements,
    hrGetLockedAchievements,

    // Stats
    hrGetTotals,
    hrGetOverallStats,

    // Abilities
    hrLearnAbility,
    hrCastAbility,

    // Artifacts
    hrDiscoverArtifact,
    hrEquipArtifact,

    // Events
    hrStartEvent,
    hrCompleteEvent,

    // Lookups
    hrGetEchoById,
    hrGetEchoesBySpecies,
    hrGetEchoesByRarity,
    hrGetEchoesByCavern,
    hrGetCavernById,
    hrGetMaterialById,
    hrGetStructureById,
    hrGetAbilityById,
    hrGetAchievementById,
    hrGetArtifactById,
    hrGetEventById,
    hrGetAchievementProgress,
    hrGetUpgradeCost,

    // Helpers
    hrRandomInt,
    hrGetSeed,
    hrSetSeed,
    hrGetColorTheme,

    // Persist
    hrPersistConfig,
  };
}
