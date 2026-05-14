// ============================================================================
// Pearl Abyss Wire — 珍珠深渊 Wire
// SSR-safe: no localStorage / window / document / setInterval /
//   addEventListener / Math.random
// All exports use the `pe` / `PE_` prefix. Hook-based pattern.
// ============================================================================

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

// ─── Types & Interfaces ───────────────────────────────────────────────────────

type PeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type PeSerpentSpecies =
  | 'pearl_dragon'
  | 'abyssal_eel'
  | 'coral_viper'
  | 'sea_wraith'
  | 'depth_leviathan'
  | 'shell_golem'
  | 'pearl_queen';

type PeMaterialSource = 'dive_harvest' | 'serpent_drop' | 'structure_output' | 'artifact_reward' | 'trench_trade';

type PeAbilityType = 'offensive' | 'defensive' | 'utility' | 'passive' | 'ultimate';

type PeStructureCategory = 'pearl_production' | 'serpent_care' | 'trench_exploration' | 'defense_utility' | 'research_mastery';

interface PeSerpentDef {
  id: string;
  name: string;
  rarity: PeRarity;
  species: PeSerpentSpecies;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  description: string;
  abilities: string[];
  lore: string;
}

interface PeTrenchDef {
  id: string;
  name: string;
  description: string;
  level: number;
  resources: string[];
  capacity: number;
  depthRange: [number, number];
  hazards: string[];
}

interface PeMaterialDef {
  id: string;
  name: string;
  rarity: PeRarity;
  source: PeMaterialSource;
  description: string;
  lore: string;
}

interface PeStructureDef {
  id: string;
  name: string;
  description: string;
  category: PeStructureCategory;
  maxLevel: number;
  baseCost: number;
  upgradeCostMultiplier: number;
}

interface PeAbilityDef {
  id: string;
  name: string;
  type: PeAbilityType;
  power: number;
  cooldown: number;
  description: string;
  prerequisites: string[];
}

interface PeAchievementDef {
  id: string;
  name: string;
  description: string;
  condition: string;
  reward: number;
  rewardType: 'pearls' | 'materials' | 'experience' | 'title';
}

interface PeTitleDef {
  id: number;
  name: string;
  requiredLevel: number;
  bonusDescription: string;
}

interface PeArtifactDef {
  id: string;
  name: string;
  description: string;
  rarity: PeRarity;
  power: number;
  passiveEffect: string;
  lore: string;
}

interface PeEventDef {
  id: string;
  name: string;
  description: string;
  effect: string;
  duration: number;
  rarity: PeRarity;
  severity: 'minor' | 'moderate' | 'major' | 'catastrophic';
}

interface PeSerpentState {
  tamed: boolean;
  tamedAt: number | null;
  loyalty: number;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
}

interface PeTrenchState {
  explored: boolean;
  divesCompleted: number;
  currentDepth: number;
  maxDepthReached: number;
  lastDiveAt: number | null;
}

interface PeStructureState {
  built: boolean;
  level: number;
  builtAt: number | null;
  lastUpgradedAt: number | null;
}

interface InventoryItem {
  materialId: string;
  quantity: number;
  acquiredAt: number;
}

interface PeAchievementProgress {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number | null;
  progress: number;
  target: number;
}

interface PearlAbyssState {
  peSerpents: Record<string, PeSerpentState>;
  peTrenches: Record<string, PeTrenchState>;
  peInventory: InventoryItem[];
  peArtifacts: string[];
  peAchievements: string[];
  peAchievementProgress: Record<string, PeAchievementProgress>;
  peTitle: string;
  peEvents: string[];
  peStructures: Record<string, PeStructureState>;
  peStats: {
    totalTamed: number;
    totalDived: number;
    totalMaterialsCollected: number;
    totalArtifactsActivated: number;
    totalStructuresBuilt: number;
    totalEventsTriggered: number;
    pearlsEarned: number;
    pearlsSpent: number;
    highestDepth: number;
  };
  pePearls: number;
  peExperience: number;
  peLevel: number;
}

// ─── Color Constants ──────────────────────────────────────────────────────────

const PE_COLOR_PEARL_WHITE = '#F5F5F5';
const PE_COLOR_ABYSS_BLUE = '#000080';
const PE_COLOR_CORAL_PINK = '#FF7F50';
const PE_COLOR_SHELL_PINK = '#FFE4E1';
const PE_COLOR_DEEP_MIDNIGHT = '#0A0A2E';
const PE_COLOR_IRIDESCENT = '#E0E7FF';
const PE_COLOR_NACRE_GOLD = '#DAA520';
const PE_COLOR_VOID_BLACK = '#050510';
const PE_COLOR_BIOLUM_CYAN = '#00CED1';
const PE_COLOR_SUNKEN_GREEN = '#2E8B57';

// ─── PE_SERPENTS: 35 Abyssal Serpents (5 Rarity × 7 Species) ────────────────

const PE_SERPENTS: PeSerpentDef[] = [
  // ── Common (7) ──────────────────────────────────────────────────────────────
  { id: 'pearl_dragon_common_1', name: 'Frostscale Whelp', rarity: 'common', species: 'pearl_dragon', hp: 30, attack: 5, defense: 3, speed: 8, description: 'A young pearl dragon with translucent scales that shimmer like frost on glass.', abilities: ['frost_breath'], lore: 'Born in the coldest shallows, frostscale whelps are the first dragons a diver will encounter.' },
  { id: 'abyssal_eel_common_1', name: 'Gloom Eel', rarity: 'common', species: 'abyssal_eel', hp: 20, attack: 7, defense: 2, speed: 12, description: 'A slender eel that lurks in the shallower trenches, its body absorbing all ambient light.', abilities: ['dark_coil'], lore: 'Gloom eels are considered pests by veteran divers, but their bioluminescent organs are valuable.' },
  { id: 'coral_viper_common_1', name: 'Pink Reef Striker', rarity: 'common', species: 'coral_viper', hp: 15, attack: 8, defense: 1, speed: 14, description: 'A small but aggressive viper that camouflages among pink coral formations.', abilities: ['venom_fang'], lore: 'Despite their size, pink reef strikers have caused more diving injuries than any other serpent.' },
  { id: 'sea_wraith_common_1', name: 'Mist Drifter', rarity: 'common', species: 'sea_wraith', hp: 25, attack: 4, defense: 4, speed: 10, description: 'A ghostly presence that drifts through the water column, barely visible.', abilities: ['mist_shroud'], lore: 'Mist drifters are said to be the souls of lost sailors, unable to find their way to the surface.' },
  { id: 'depth_leviathan_common_1', name: 'Mud Leviathan', rarity: 'common', species: 'depth_leviathan', hp: 45, attack: 3, defense: 6, speed: 4, description: 'A juvenile leviathan covered in thick abyssal mud for natural armor.', abilities: ['mud_slam'], lore: 'Mud leviathans spend their youth at the seafloor, slowly accumulating their legendary armor.' },
  { id: 'shell_golem_common_1', name: 'Clam Guard', rarity: 'common', species: 'shell_golem', hp: 50, attack: 2, defense: 8, speed: 2, description: 'A slow-moving construct made from fused clam shells, virtually impenetrable from the front.', abilities: ['shell_block'], lore: 'Clam guards are formed when ancient magic fuses dozens of living clams into a single entity.' },
  { id: 'pearl_queen_common_1', name: 'Brood Mother', rarity: 'common', species: 'pearl_queen', hp: 35, attack: 6, defense: 3, speed: 6, description: 'A small queen that commands a school of lesser pearl fish to defend her.', abilities: ['swarm_command'], lore: 'Even the smallest pearl queens command absolute loyalty from their pearl fish attendants.' },

  // ── Uncommon (7) ────────────────────────────────────────────────────────────
  { id: 'pearl_dragon_uncommon_1', name: 'Iridescent Drake', rarity: 'uncommon', species: 'pearl_dragon', hp: 60, attack: 12, defense: 7, speed: 9, description: 'A drake whose scales shift between pearl white and deep blue depending on the angle of light.', abilities: ['prism_breath', 'scale_shimmer'], lore: 'Iridescent drakes are prized by collectors — their shed scales fetch extraordinary prices.' },
  { id: 'abyssal_eel_uncommon_1', name: 'Thundercoil Serpent', rarity: 'uncommon', species: 'abyssal_eel', hp: 50, attack: 15, defense: 5, speed: 15, description: 'An electric eel that generates static fields capable of stunning divers.', abilities: ['thunder_jolt', 'static_aura'], lore: 'Thundercoil serpents are responsible for the electromagnetic anomalies recorded in the Twilight Rift.' },
  { id: 'coral_viper_uncommon_1', name: 'Brain Coral Ambusher', rarity: 'uncommon', species: 'coral_viper', hp: 40, attack: 14, defense: 6, speed: 13, description: 'A viper that nests inside brain corals, striking with incredible speed when prey approaches.', abilities: ['rapid_strike', 'coral_hide'], lore: 'Brain coral ambushers develop a symbiotic bond with their host coral, sharing nutrients and protection.' },
  { id: 'sea_wraith_uncommon_1', name: 'Sorrow Specter', rarity: 'uncommon', species: 'sea_wraith', hp: 55, attack: 10, defense: 8, speed: 11, description: 'A wraith that feeds on the sadness of lost sailors, its touch draining willpower.', abilities: ['sorrow_touch', 'phantom_phase'], lore: 'Sorrow specters grow stronger during storms, when the ocean claims more unfortunate souls.' },
  { id: 'depth_leviathan_uncommon_1', name: 'Pressurejaw', rarity: 'uncommon', species: 'depth_leviathan', hp: 80, attack: 11, defense: 10, speed: 5, description: 'A medium leviathan with jaws powerful enough to crush submersible hulls.', abilities: ['crunch', 'pressure_resist'], lore: 'Pressurejaws have been observed biting through titanium alloy — no known material can withstand them.' },
  { id: 'shell_golem_uncommon_1', name: 'Nautilus Titan', rarity: 'uncommon', species: 'shell_golem', hp: 90, attack: 8, defense: 14, speed: 3, description: 'A towering golem incorporating a massive nautilus shell as its core armor plate.', abilities: ['spiral_shell', 'tidal_stomp'], lore: 'The nautilus shell at the heart of each titan is said to be millions of years old.' },
  { id: 'pearl_queen_uncommon_1', name: 'Lagoon Matriarch', rarity: 'uncommon', species: 'pearl_queen', hp: 65, attack: 13, defense: 7, speed: 7, description: 'A queen ruling over a coral lagoon, her presence causing pearls to form spontaneously.', abilities: ['pearl_rain', 'lagoon_heal'], lore: 'Divers who discover a lagoon matriarch are considered blessed — her lagoons are always rich with pearls.' },

  // ── Rare (7) ────────────────────────────────────────────────────────────────
  { id: 'pearl_dragon_rare_1', name: 'Moonlit Wyrm', rarity: 'rare', species: 'pearl_dragon', hp: 120, attack: 25, defense: 15, speed: 10, description: 'A majestic dragon that only appears under the light of a full moon, its scales glowing with captured moonbeams.', abilities: ['moonbeam_breath', 'lunar_shield', 'scale_barrage'], lore: 'Moonlit wyrms are so rare that many divers believe them to be myths until they witness one.' },
  { id: 'abyssal_eel_rare_1', name: 'Voidcurrent Eel', rarity: 'rare', species: 'abyssal_eel', hp: 90, attack: 30, defense: 10, speed: 18, description: 'An eel that swims through the void between dimensions, leaving rips in reality behind it.', abilities: ['dimension_slit', 'void_coil', 'warp_strike'], lore: 'Where a voidcurrent eel passes, reality itself becomes thin, and strange creatures slip through.' },
  { id: 'coral_viper_rare_1', name: 'Crimson Fang Matriarch', rarity: 'rare', species: 'coral_viper', hp: 80, attack: 28, defense: 12, speed: 16, description: 'The oldest and most venomous coral viper, her fangs dripping with ancient coral toxins.', abilities: ['lethal_venom', 'fang_storm', 'coral_trap'], lore: 'The crimson fang matriarch has survived for centuries, her venom growing more potent with each passing decade.' },
  { id: 'sea_wraith_rare_1', name: 'Depths Phantom', rarity: 'rare', species: 'sea_wraith', hp: 100, attack: 22, defense: 18, speed: 12, description: 'A powerful wraith that can drag creatures into the shadow realm with a single touch.', abilities: ['shadow_pull', 'void_wail', 'spectral_form'], lore: 'The Depths Phantom is the guardian of a forgotten underwater kingdom, forever patrolling its ruins.' },
  { id: 'depth_leviathan_rare_1', name: 'Trench Tyrant', rarity: 'rare', species: 'depth_leviathan', hp: 150, attack: 20, defense: 22, speed: 6, description: 'A leviathan that has claimed an entire trench as its territory, terrorizing all who enter.', abilities: ['trench_roar', 'seismic_tail', 'abyssal_charge'], lore: 'Only one trench tyrant exists at any time — when one falls, the strongest juvenile assumes the title.' },
  { id: 'shell_golem_rare_1', name: 'Pearlclad Colossus', rarity: 'rare', species: 'shell_golem', hp: 180, attack: 18, defense: 28, speed: 3, description: 'A massive golem encrusted with thousands of pearls that absorb and redirect energy.', abilities: ['pearl_reflect', 'fortify_shell', 'earthquake_stomp'], lore: 'Pearlclad colossi are formed when a pearl bed accumulates enough ambient magic over millennia.' },
  { id: 'pearl_queen_rare_1', name: 'Nacre Sovereign', rarity: 'rare', species: 'pearl_queen', hp: 110, attack: 24, defense: 16, speed: 8, description: 'A queen whose nacreous aura causes the very water to crystallize around her allies.', abilities: ['nacre_armor', 'pearl_barrage', 'royal_decree'], lore: 'The nacre sovereign\'s throne room is a cathedral of living mother-of-pearl, constantly growing and shifting.' },

  // ── Epic (7) ────────────────────────────────────────────────────────────────
  { id: 'pearl_dragon_epic_1', name: 'Eternity Dragon', rarity: 'epic', species: 'pearl_dragon', hp: 250, attack: 45, defense: 30, speed: 11, description: 'An ancient dragon that has lived for millennia, its body a living history of the abyss encoded in pearl growth rings.', abilities: ['eternity_breath', 'timeless_scales', 'pearl_storm', 'ancient_wisdom'], lore: 'The eternity dragon remembers the birth of the ocean itself, and its scales contain that primordial memory.' },
  { id: 'abyssal_eel_epic_1', name: 'Lightning Sovereign', rarity: 'epic', species: 'abyssal_eel', hp: 200, attack: 55, defense: 22, speed: 20, description: 'An eel of pure electrical energy that crackles through the deep like a living thunderbolt.', abilities: ['chain_lightning', 'thunder_dome', 'electromagnetic_pulse', 'storm_surge'], lore: 'When the Lightning Sovereign surfaces, entire sections of the abyss light up like a terrestrial lightning storm.' },
  { id: 'coral_viper_epic_1', name: 'Venom Empress', rarity: 'epic', species: 'coral_viper', hp: 180, attack: 50, defense: 25, speed: 17, description: 'A monstrous viper whose venom can dissolve steel, her coils wreathed in toxic coral blooms.', abilities: ['coral_melt', 'toxic_mist', 'viper_hypnotize', 'death_strike'], lore: 'The Venom Empress rules a garden of death coral — beautiful but instantly lethal to any intruder.' },
  { id: 'sea_wraith_epic_1', name: 'Doom Herald', rarity: 'epic', species: 'sea_wraith', hp: 220, attack: 40, defense: 35, speed: 13, description: 'A wraith that appears before great catastrophes, its arrival foretelling disaster for all abyss dwellers.', abilities: ['doom_call', 'nightmare_vortex', 'fate_weave', 'spectral_army'], lore: 'Ancient mariners spoke of the Doom Herald in hushed whispers — to see it was to know death was near.' },
  { id: 'depth_leviathan_epic_1', name: 'Maelstrom Lord', rarity: 'epic', species: 'depth_leviathan', hp: 350, attack: 38, defense: 42, speed: 7, description: 'A leviathan that commands the maelstrom itself, spinning whirlpools that can swallow fleets.', abilities: ['maelstrom_summon', 'tidal_crush', 'depth_command', 'whirlpool_prison'], lore: 'The Maelstrom Lord sleeps at the center of a permanent whirlpool, waking only to feed on ships.' },
  { id: 'shell_golem_epic_1', name: 'Abyssal Fortress', rarity: 'epic', species: 'shell_golem', hp: 500, attack: 30, defense: 50, speed: 4, description: 'A golem the size of a building, its shell composed of every known abyssal mollusk species.', abilities: ['shell_citadel', 'regenerate_armor', 'trample', 'earth_shield'], lore: 'The Abyssal Fortress is so massive that divers have been known to mistake it for a geological feature.' },
  { id: 'pearl_queen_epic_1', name: 'Radiant Diadem', rarity: 'epic', species: 'pearl_queen', hp: 230, attack: 48, defense: 28, speed: 9, description: 'A queen crowned in living pearls that emit blinding light, commanding legions of pearl-formed soldiers.', abilities: ['radiant_crown', 'pearl_legion', 'light_purify', 'nacre_blessing'], lore: 'The Radiant Diadem\'s light can be seen from the surface on the clearest nights — a beacon of the deep.' },

  // ── Legendary (7) ───────────────────────────────────────────────────────────
  { id: 'pearl_dragon_legendary_1', name: 'Pearl Emperor Dragon', rarity: 'legendary', species: 'pearl_dragon', hp: 500, attack: 80, defense: 60, speed: 12, description: 'The supreme dragon of the Pearl Abyss, whose body is a perfect pearl of impossible size and beauty, containing the memory of every ocean that ever existed.', abilities: ['emperor_breath', 'pearl_heart_shield', 'eternal_flight', 'ocean_memory', 'genesis_pearl'], lore: 'Legends say the Pearl Emperor Dragon was the first creature to ever inhabit the ocean, and will be the last.' },
  { id: 'abyssal_eel_legendary_1', name: 'World Serpent of the Deep', rarity: 'legendary', species: 'abyssal_eel', hp: 400, attack: 95, defense: 45, speed: 22, description: 'A serpent so long it encircles the entire abyssal plane, its movements causing global currents and tsunamis.', abilities: ['world_coil', 'current_master', 'dimension_tear', 'thunder_apocalypse', 'serpent_awakening'], lore: 'When the World Serpent stirs, tides change across every ocean on the planet simultaneously.' },
  { id: 'coral_viper_legendary_1', name: 'The Primordial Venom', rarity: 'legendary', species: 'coral_viper', hp: 350, attack: 100, defense: 40, speed: 18, description: 'The original viper from which all coral serpents descended, its venom is the primordial essence of life and death.', abilities: ['primordial_sting', 'venom_world', 'coral_rebirth', 'toxic_apotheosis', 'fanged_oracle'], lore: 'The Primordial Venom was the first predator — its venom created the cycle of life and death in the deep.' },
  { id: 'sea_wraith_legendary_1', name: 'Queen of the Drowned', rarity: 'legendary', species: 'sea_wraith', hp: 450, attack: 75, defense: 55, speed: 14, description: 'The spirit of the ocean itself, a being of pure melancholy and unimaginable power who rules all that has sunk beneath the waves.', abilities: ['drown_curse', 'abyssal_sorrow', 'ghost_armada', 'eternal_storm', 'depth_embrace'], lore: 'She is every shipwreck, every drowned sailor, every treasure lost to the deep — all given form and purpose.' },
  { id: 'depth_leviathan_legendary_1', name: 'Chasm Behemoth', rarity: 'legendary', species: 'depth_leviathan', hp: 800, attack: 65, defense: 80, speed: 8, description: 'A leviathan that dwells at the very bottom of the deepest trench, so massive it is mistaken for the seabed itself.', abilities: ['chasm_rift', 'continent_slam', 'pressure_infinity', 'depth_domination', 'titan_awaken'], lore: 'The Chasm Behemoth has not moved in ten thousand years — the seafloor has grown over it like a blanket.' },
  { id: 'shell_golem_legendary_1', name: 'The Immortal Shell', rarity: 'legendary', species: 'shell_golem', hp: 1000, attack: 50, defense: 100, speed: 5, description: 'A golem forged from the shell of the first mollusk to ever exist, completely indestructible and eternally patient.', abilities: ['invulnerable_shell', 'earthquake_world', 'shell_meteor', 'eternal_guard', 'mollusk_origin'], lore: 'Nothing has ever damaged the Immortal Shell — not pressure, not time, not even the Pearl Emperor Dragon.' },
  { id: 'pearl_queen_legendary_1', name: 'Mother of All Pearls', rarity: 'legendary', species: 'pearl_queen', hp: 600, attack: 85, defense: 65, speed: 10, description: 'The matriarch who birthed every pearl in every ocean, a divine being whose tears become the rarest gems in existence.', abilities: ['divine_pearl', 'nacre_world', 'queen_command', 'tears_of_creation', 'eternal_bloom'], lore: 'Every pearl ever found by any diver in any ocean was created by the Mother of All Pearls — she is the source.' },
];

// ─── PE_TRENCHES: 8 Trench Locations ─────────────────────────────────────────

const PE_TRENCHES: PeTrenchDef[] = [
  { id: 'shimmering_shallows', name: 'Shimmering Shallows', description: 'A sunlit trench entrance where light dances on pearl-studded walls, perfect for beginners seeking their first tame. Warm currents carry a gentle melody that soothes both diver and serpent.', level: 1, resources: ['raw_pearl', 'sea_glass', 'shallow_coral'], capacity: 5, depthRange: [10, 100], hazards: ['mild_currents', 'jellyfish_swarm'] },
  { id: 'twilight_rift', name: 'Twilight Rift', description: 'A narrow crack in the seafloor where the last rays of sunlight fade into bioluminescent twilight. Strange creatures emerge from cracks in the rock walls.', level: 5, resources: ['twilight_crystal', 'glow_kelp', 'pearl_fragment'], capacity: 8, depthRange: [100, 300], hazards: ['falling_rocks', 'sudden_pressure_changes'] },
  { id: 'coral_labyrinth', name: 'Coral Labyrinth', description: 'A maze of living coral walls that shift and grow, hiding rare serpent nests within its winding passages. The coral itself seems to breathe and pulse.', level: 10, resources: ['living_coral_core', 'viper_venom', 'nacre_shard'], capacity: 10, depthRange: [300, 600], hazards: ['shifting_walls', 'coral_traps', 'viper_ambush'] },
  { id: 'phantom_depths', name: 'Phantom Depths', description: 'A haunted trench where ghostly apparitions drift through the darkness, and only the brave dare to explore. The water here is ice cold and tastes of salt and sorrow.', level: 18, resources: ['spectral_essence', 'ghost_pearl', 'wraith_dust'], capacity: 12, depthRange: [600, 1000], hazards: ['wraith_encounters', 'visibility_zero', 'soul_drain'] },
  { id: 'pressure_cauldron', name: 'Pressure Cauldron', description: 'A trench of extreme pressure where materials are compressed into super-dense, impossibly valuable forms. The walls glow with geothermal heat.', level: 25, resources: ['compressed_gem', 'abyssal_iron', 'depth_alloy'], capacity: 15, depthRange: [1000, 1800], hazards: ['crushing_pressure', 'thermal_vents', 'unstable_floor'] },
  { id: 'mirror_cavern', name: 'Mirror Cavern', description: 'A cavern whose walls are made of perfectly polished pearl, creating infinite reflections of the diver. Distinguishing reality from reflection becomes impossible.', level: 32, resources: ['mirror_shard', 'perfect_pearl', 'reflection_quartz'], capacity: 18, depthRange: [1800, 2800], hazards: ['mirror_maze', 'reflection_traps', 'identity_confusion'] },
  { id: 'serpent_throne', name: 'Serpent Throne', description: 'The legendary nesting ground of the ancient abyssal serpents, where the oldest and most powerful creatures reside. The throne itself radiates primordial energy.', level: 40, resources: ['serpent_scale', 'throne_crystal', 'royal_nacre'], capacity: 20, depthRange: [2800, 4000], hazards: ['ancient_guardians', 'serpent_territory', 'thorne_defense'] },
  { id: 'pearl_heart_chasm', name: 'Pearl Heart Chasm', description: 'The absolute deepest point of the Pearl Abyss, said to contain the legendary Pearl of Origin at its center. Reality itself warps near the bottom.', level: 50, resources: ['origin_pearl_dust', 'heart_crystal', 'genesis_nacre'], capacity: 25, depthRange: [4000, 6000], hazards: ['reality_warp', 'primordial_forces', 'the_void_itself'] },
];

// ─── PE_MATERIALS: 30 Pearl/Shell Materials ──────────────────────────────────

const PE_MATERIALS: PeMaterialDef[] = [
  // Common (6)
  { id: 'raw_pearl', name: 'Raw Pearl', rarity: 'common', source: 'dive_harvest', description: 'An unrefined pearl fresh from an oyster, slightly rough but with promising inner luster.', lore: 'Every great pearl collection starts with a single raw pearl, plucked from the seabed by a hopeful diver.' },
  { id: 'sea_glass', name: 'Sea Glass Fragment', rarity: 'common', source: 'dive_harvest', description: 'Weathered glass smoothed by centuries of ocean tumbling into a frosted gem.', lore: 'Sea glass was once discarded human refuse — the ocean transformed trash into treasure over the centuries.' },
  { id: 'shallow_coral', name: 'Shallow Coral Chip', rarity: 'common', source: 'dive_harvest', description: 'A small chunk of surface coral, useful for basic crafting and construction.', lore: 'Shallow coral is the building block of the abyss — every structure starts with these humble chips.' },
  { id: 'barnacle_shell', name: 'Barnacle Shell', rarity: 'common', source: 'serpent_drop', description: 'A small but tough barnacle shell, commonly used in rudimentary armor patches.', lore: 'Barnacle shells are surprisingly resilient — their layered structure inspired ancient armor designs.' },
  { id: 'salt_crystal', name: 'Sea Salt Crystal', rarity: 'common', source: 'dive_harvest', description: 'Large crystalline formations of concentrated sea salt with minor magical conductivity.', lore: 'Salt crystals from the abyss carry a faint charge — the ocean stores energy in everything it touches.' },
  { id: 'driftwood_pearl', name: 'Driftwood Pearl', rarity: 'common', source: 'dive_harvest', description: 'A pearl that formed around a grain of driftwood, giving it a woody inner pattern.', lore: 'Driftwood pearls are considered lucky by sailors — they symbolize safe passage through storms.' },

  // Uncommon (6)
  { id: 'twilight_crystal', name: 'Twilight Crystal', rarity: 'uncommon', source: 'dive_harvest', description: 'A crystal that only forms in the transition zone between light and darkness, glowing faintly purple.', lore: 'Twilight crystals are alive in a sense — they pulse gently in response to the diver\'s heartbeat.' },
  { id: 'glow_kelp', name: 'Glow Kelp Strand', rarity: 'uncommon', source: 'dive_harvest', description: 'A strand of bioluminescent kelp that pulses with soft blue light, useful in alchemy.', lore: 'Glow kelp forests are among the most beautiful sights in the abyss — entire underwater landscapes bathed in blue.' },
  { id: 'pearl_fragment', name: 'Pearl Fragment', rarity: 'uncommon', source: 'structure_output', description: 'A piece of a larger, higher-quality pearl, still possessing some of its original luster.', lore: 'Even a fragment of a great pearl carries a fraction of its power — nothing in the abyss is truly wasted.' },
  { id: 'nacre_shard', name: 'Nacre Shard', rarity: 'uncommon', source: 'serpent_drop', description: 'Mother-of-pearl from a large shell, its iridescent surface reflecting all colors.', lore: 'Nacre shards are used in the finest abyssal craftsmanship — their color-shifting properties are unmatched.' },
  { id: 'viper_fang', name: 'Coral Viper Fang', rarity: 'uncommon', source: 'serpent_drop', description: 'A fang from a coral viper, still containing trace amounts of potent venom.', lore: 'Viper fangs must be handled with extreme care — the venom remains potent for centuries after the serpent dies.' },
  { id: 'moonstone_pebble', name: 'Abyssal Moonstone', rarity: 'uncommon', source: 'dive_harvest', description: 'A smooth stone that absorbs and re-emits ambient light with a silvery sheen.', lore: 'Abyssal moonstones are not true gemstones — they are concretions of compressed bioluminescent organisms.' },

  // Rare (6)
  { id: 'living_coral_core', name: 'Living Coral Core', rarity: 'rare', source: 'structure_output', description: 'The still-beating heart of a massive coral formation, pulsing with primal ocean energy.', lore: 'A living coral core, if kept in saltwater, will continue to beat indefinitely — it is alive in every meaningful sense.' },
  { id: 'viper_venom', name: 'Refined Viper Venom', rarity: 'rare', source: 'serpent_drop', description: 'Purified venom from a rare coral viper, a deadly but valuable alchemical ingredient.', lore: 'In the right hands, viper venom can cure diseases; in the wrong hands, it can end civilizations.' },
  { id: 'spectral_essence', name: 'Spectral Essence', rarity: 'rare', source: 'artifact_reward', description: 'Bottled essence of a sea wraith, shimmering with ghostly luminescence.', lore: 'Spectral essence hums faintly with the whispers of the dead — some divers find this comforting.' },
  { id: 'ghost_pearl', name: 'Ghost Pearl', rarity: 'rare', source: 'artifact_reward', description: 'A pearl that is partially transparent, its inner structure resembling a miniature galaxy.', lore: 'Ghost pearls form when a dying star\'s light penetrates the ocean and is captured within an oyster.' },
  { id: 'compressed_gem', name: 'Compressed Depth Gem', rarity: 'rare', source: 'dive_harvest', description: 'A gemstone compressed under extreme trench pressure into extraordinary density.', lore: 'A single compressed depth gem weighs as much as a boulder of normal stone — pressure does extraordinary things.' },
  { id: 'wraith_dust', name: 'Wraith Dust', rarity: 'rare', source: 'serpent_drop', description: 'The residue left behind when a sea wraith dissipates, containing trace memories.', lore: 'Wraith dust is used in memory potions — consuming it lets you briefly experience a drowned soul\'s final moments.' },

  // Epic (6)
  { id: 'throne_crystal', name: 'Serpent Throne Crystal', rarity: 'epic', source: 'artifact_reward', description: 'A crystal harvested from the Serpent Throne itself, containing the essence of ancient dragonfire.', lore: 'The Serpent Throne Crystal burns with a cold fire that freezes even as it illuminates.' },
  { id: 'mirror_shard', name: 'Perfect Mirror Shard', rarity: 'epic', source: 'artifact_reward', description: 'A fragment of the Mirror Cavern walls, reflecting truth and illusions simultaneously.', lore: 'Looking into a mirror shard, you see not your reflection, but the version of yourself from an alternate reality.' },
  { id: 'serpent_scale', name: 'Ancient Serpent Scale', rarity: 'epic', source: 'serpent_drop', description: 'A scale from an ancient abyssal serpent, harder than diamond and radiating cold power.', lore: 'Each ancient serpent scale contains the compressed power of a thousand years of growth.' },
  { id: 'royal_nacre', name: 'Royal Nacre Plate', rarity: 'epic', source: 'artifact_reward', description: 'A large sheet of perfect mother-of-pearl from the Pearl Queen\'s own throne.', lore: 'Royal nacre cannot be cut by any known tool — it was shaped by the Queen\'s will alone.' },
  { id: 'depth_alloy', name: 'Abyssal Depth Alloy', rarity: 'epic', source: 'structure_output', description: 'A metal forged from compressed abyssal iron and pearl essence, impossibly strong.', lore: 'Depth alloy is the only material that can withstand the pressure at the bottom of the Pearl Heart Chasm.' },
  { id: 'perfect_pearl', name: 'Perfect Pearl', rarity: 'epic', source: 'artifact_reward', description: 'A flawless pearl of extraordinary size, its surface reflecting the entire color spectrum.', lore: 'A perfect pearl forms once every thousand years — there are fewer than a dozen in existence.' },

  // Legendary (6)
  { id: 'origin_pearl_dust', name: 'Origin Pearl Dust', rarity: 'legendary', source: 'artifact_reward', description: 'Dust from the legendary Pearl of Origin, said to contain the seed of all life in the ocean.', lore: 'A single grain of origin pearl dust, planted in seawater, will eventually grow into an entirely new ecosystem.' },
  { id: 'heart_crystal', name: 'Pearl Heart Crystal', rarity: 'legendary', source: 'artifact_reward', description: 'The crystallized core of the Pearl Heart Chasm, beating with the rhythm of the abyss itself.', lore: 'The Pearl Heart Crystal beats once every hundred years — when it does, every creature in the abyss feels it.' },
  { id: 'genesis_nacre', name: 'Genesis Nacre', rarity: 'legendary', source: 'artifact_reward', description: 'The primordial mother-of-pearl from which all shells in existence were born.', lore: 'Genesis nacre predates the ocean itself — it was the template from which all shell-bearing life was molded.' },
  { id: 'serpent_emperor_scale', name: 'Emperor Dragon Scale', rarity: 'legendary', source: 'artifact_reward', description: 'A scale from the Pearl Emperor Dragon, containing the memory of every ocean that ever existed.', lore: 'Holding an emperor scale, you can hear every ocean that has ever existed and every ocean that ever will.' },
  { id: 'crown_of_pearls', name: 'Crown of Pearls Fragment', rarity: 'legendary', source: 'artifact_reward', description: 'A fragment of the ancient crown worn by the Mother of All Pearls, radiating divine warmth.', lore: 'The Crown of Pearls was crafted before the first diver existed — its maker is unknown, perhaps divine.' },
  { id: 'abyss_eternity_gem', name: 'Abyss Eternity Gem', rarity: 'legendary', source: 'artifact_reward', description: 'A gem that exists outside of time, its facets showing past, present, and future simultaneously.', lore: 'The Abyss Eternity Gem is not a gemstone — it is a frozen moment in time, crystallized into physical form.' },
];

// ─── PE_STRUCTURES: 25 Abyss Structures (Upgradeable to Level 10) ────────────

const PE_STRUCTURES: PeStructureDef[] = [
  // Pearl Production (5)
  { id: 'pearl_nursery', name: 'Pearl Nursery', description: 'A controlled environment where oysters are cultivated to produce pearls of increasing quality and size.', category: 'pearl_production', maxLevel: 10, baseCost: 80, upgradeCostMultiplier: 1.5 },
  { id: 'nacre_forge', name: 'Nacre Forge', description: 'A specialized forge that processes raw nacre into refined crafting materials and armor plates.', category: 'pearl_production', maxLevel: 10, baseCost: 120, upgradeCostMultiplier: 1.6 },
  { id: 'shell_granary', name: 'Shell Granary', description: 'A storage facility for harvested materials with environmental controls to preserve rarity and potency.', category: 'pearl_production', maxLevel: 10, baseCost: 100, upgradeCostMultiplier: 1.4 },
  { id: 'iridescent_laboratory', name: 'Iridescent Laboratory', description: 'A research lab dedicated to studying and replicating the iridescent properties of abyssal pearls.', category: 'pearl_production', maxLevel: 10, baseCost: 200, upgradeCostMultiplier: 1.7 },
  { id: 'gem_cutting_station', name: 'Gem Cutting Station', description: 'Precision equipment for cutting and polishing raw abyssal gems into perfect, sellable form.', category: 'pearl_production', maxLevel: 10, baseCost: 150, upgradeCostMultiplier: 1.5 },

  // Serpent Care (5)
  { id: 'serpent_sanctuary', name: 'Serpent Sanctuary', description: 'A comfortable habitat where tamed serpents rest, recover, and increase their loyalty.', category: 'serpent_care', maxLevel: 10, baseCost: 130, upgradeCostMultiplier: 1.5 },
  { id: 'feeding_grounds', name: 'Feeding Grounds', description: 'An enclosed area stocked with prey fish to keep tamed serpents well-fed and strong.', category: 'serpent_care', maxLevel: 10, baseCost: 90, upgradeCostMultiplier: 1.4 },
  { id: 'training_cavern', name: 'Training Cavern', description: 'A cavern equipped with obstacles and targets for training serpents in combat techniques.', category: 'serpent_care', maxLevel: 10, baseCost: 160, upgradeCostMultiplier: 1.6 },
  { id: 'breeding_chamber', name: 'Breeding Chamber', description: 'A carefully monitored chamber where compatible serpents can produce offspring with inherited traits.', category: 'serpent_care', maxLevel: 10, baseCost: 250, upgradeCostMultiplier: 1.8 },
  { id: 'veterinary_reef', name: 'Veterinary Reef', description: 'A living reef staffed with healing corals and medicinal organisms to treat injured serpents.', category: 'serpent_care', maxLevel: 10, baseCost: 140, upgradeCostMultiplier: 1.5 },

  // Trench Exploration (5)
  { id: 'depth_crane', name: 'Depth Crane', description: 'A mechanical crane system for lowering equipment and recovering heavy loads from deep trenches.', category: 'trench_exploration', maxLevel: 10, baseCost: 110, upgradeCostMultiplier: 1.4 },
  { id: 'pressure_lock_chamber', name: 'Pressure Lock Chamber', description: 'An airlock system that equalizes pressure for safe transit between depth zones.', category: 'trench_exploration', maxLevel: 10, baseCost: 180, upgradeCostMultiplier: 1.6 },
  { id: 'sonar_beacon_array', name: 'Sonar Beacon Array', description: 'A network of beacons that maps trench topography and reveals hidden passages.', category: 'trench_exploration', maxLevel: 10, baseCost: 170, upgradeCostMultiplier: 1.5 },
  { id: 'dive_pod_bay', name: 'Dive Pod Bay', description: 'A docking facility for deep-dive pods with automated launch and recovery systems.', category: 'trench_exploration', maxLevel: 10, baseCost: 220, upgradeCostMultiplier: 1.7 },
  { id: 'supply_depot', name: 'Abyss Supply Depot', description: 'A forward supply base stocked with essentials for extended trench expeditions.', category: 'trench_exploration', maxLevel: 10, baseCost: 130, upgradeCostMultiplier: 1.4 },

  // Defense & Utility (5)
  { id: 'pearl_bastion', name: 'Pearl Bastion', description: 'A defensive tower made of reinforced pearl composite that projects a protective energy barrier.', category: 'defense_utility', maxLevel: 10, baseCost: 200, upgradeCostMultiplier: 1.6 },
  { id: 'siren_lighthouse', name: 'Siren Lighthouse', description: 'A lighthouse that emits a special frequency calming hostile serpents and guiding allies home.', category: 'defense_utility', maxLevel: 10, baseCost: 190, upgradeCostMultiplier: 1.5 },
  { id: 'abyss_bunker', name: 'Abyss Bunker', description: 'An underground shelter with reinforced walls and independent life support for emergencies.', category: 'defense_utility', maxLevel: 10, baseCost: 240, upgradeCostMultiplier: 1.7 },
  { id: 'pearl_comm_array', name: 'Pearl Communication Array', description: 'Uses resonance through pearl crystals to maintain communication across vast distances underwater.', category: 'defense_utility', maxLevel: 10, baseCost: 160, upgradeCostMultiplier: 1.5 },
  { id: 'treasury_vault', name: 'Treasury Vault', description: 'A secure vault lined with pressure-hardened pearl walls for storing the most valuable artifacts.', category: 'defense_utility', maxLevel: 10, baseCost: 280, upgradeCostMultiplier: 1.8 },

  // Research & Mastery (5)
  { id: 'ancient_pearl_archive', name: 'Ancient Pearl Archive', description: 'Stores and decodes the ancient memories contained within millennia-old pearls.', category: 'research_mastery', maxLevel: 10, baseCost: 210, upgradeCostMultiplier: 1.6 },
  { id: 'elemental_study_hall', name: 'Elemental Study Hall', description: 'A research center for understanding the elemental properties of abyssal serpent abilities.', category: 'research_mastery', maxLevel: 10, baseCost: 230, upgradeCostMultiplier: 1.6 },
  { id: 'rarity_appraisal_room', name: 'Rarity Appraisal Room', description: 'Advanced equipment for precisely determining the rarity and value of discovered pearls and gems.', category: 'research_mastery', maxLevel: 10, baseCost: 175, upgradeCostMultiplier: 1.5 },
  { id: 'pearl_enchantment_altar', name: 'Pearl Enchantment Altar', description: 'A mystical altar where pearls can be enchanted with elemental powers and protective wards.', category: 'research_mastery', maxLevel: 10, baseCost: 300, upgradeCostMultiplier: 1.8 },
  { id: 'mastery_obelisk', name: 'Mastery Obelisk', description: 'A towering obelisk of black pearl that records and displays the diver\'s total mastery achievements.', category: 'research_mastery', maxLevel: 10, baseCost: 260, upgradeCostMultiplier: 1.7 },
];

// ─── PE_ABILITIES: 22 Pearl Abilities ─────────────────────────────────────────

const PE_ABILITIES: PeAbilityDef[] = [
  // Offensive (6)
  { id: 'pearl_shatter', name: 'Pearl Shatter', type: 'offensive', power: 20, cooldown: 15, description: 'Launches a volley of sharpened pearl fragments that pierce through serpent armor.', prerequisites: [] },
  { id: 'nacre_blade', name: 'Nacre Blade', type: 'offensive', power: 35, cooldown: 25, description: 'Forms a blade of hardened mother-of-pearl that slices through water with razor precision.', prerequisites: ['pearl_shatter'] },
  { id: 'coral_barrage', name: 'Coral Barrage', type: 'offensive', power: 50, cooldown: 35, description: 'Summons a storm of sharpened coral projectiles that rain down on all enemies in range.', prerequisites: ['pearl_shatter'] },
  { id: 'depth_impale', name: 'Depth Impale', type: 'offensive', power: 70, cooldown: 45, description: 'Conjures a spike of abyssal pressure that impales a target from below with crushing force.', prerequisites: ['nacre_blade', 'coral_barrage'] },
  { id: 'serpent_fury', name: 'Serpent Fury', type: 'offensive', power: 90, cooldown: 60, description: 'Channels the collective rage of all tamed serpents into a devastating directed energy blast.', prerequisites: ['depth_impale'] },
  { id: 'pearl_apocalypse', name: 'Pearl Apocalypse', type: 'offensive', power: 150, cooldown: 120, description: 'Unleashes an explosion of crystallized pearl energy that devastates everything within a massive radius.', prerequisites: ['serpent_fury'] },

  // Defensive (5)
  { id: 'shell_barrier', name: 'Shell Barrier', type: 'defensive', power: 15, cooldown: 20, description: 'Encases the diver in a protective shell made of interlocking pearl plates.', prerequisites: [] },
  { id: 'pearl_reflect', name: 'Pearl Reflect', type: 'defensive', power: 25, cooldown: 30, description: 'Creates a mirror-like pearl surface that reflects incoming attacks back at the source.', prerequisites: ['shell_barrier'] },
  { id: 'nacre_fortress', name: 'Nacre Fortress', type: 'defensive', power: 45, cooldown: 50, description: 'Builds a fortress of living nacre that protects all allies within its walls.', prerequisites: ['pearl_reflect'] },
  { id: 'abyssal_dome', name: 'Abyssal Dome', type: 'defensive', power: 65, cooldown: 70, description: 'Generates a dome of compressed abyssal water that absorbs all damage for a duration.', prerequisites: ['nacre_fortress'] },
  { id: 'eternal_shell', name: 'Eternal Shell', type: 'defensive', power: 100, cooldown: 100, description: 'Wraps the entire team in an indestructible shell of legendary pearl essence for a brief moment.', prerequisites: ['abyssal_dome'] },

  // Utility (5)
  { id: 'pearl_light', name: 'Pearl Light', type: 'utility', power: 10, cooldown: 10, description: 'Activates a pearl that emits a steady, calming light illuminating the surrounding darkness.', prerequisites: [] },
  { id: 'sonar_ping', name: 'Pearl Sonar Ping', type: 'utility', power: 15, cooldown: 12, description: 'Uses a resonant pearl to emit a sonar pulse that reveals the layout of the surrounding area.', prerequisites: ['pearl_light'] },
  { id: 'tidal_dash', name: 'Tidal Dash', type: 'utility', power: 20, cooldown: 18, description: 'Rides a sudden current to dash rapidly through the water, escaping danger or closing distance.', prerequisites: ['pearl_light'] },
  { id: 'pearl_compass', name: 'Pearl Compass', type: 'utility', power: 25, cooldown: 25, description: 'A pearl that always points toward the nearest valuable resource or hidden treasure.', prerequisites: ['sonar_ping', 'tidal_dash'] },
  { id: 'depth_breath', name: 'Depth Breath', type: 'utility', power: 40, cooldown: 40, description: 'Enables temporary survival at extreme depths by generating a personal pressure bubble.', prerequisites: ['pearl_compass'] },

  // Passive (3)
  { id: 'pearl_magnetism', name: 'Pearl Magnetism', type: 'passive', power: 10, cooldown: 0, description: 'Passively attracts nearby loose pearls and materials toward the diver over time.', prerequisites: [] },
  { id: 'serpent_empathy', name: 'Serpent Empathy', type: 'passive', power: 15, cooldown: 0, description: 'Passively increases the loyalty gain rate of all tamed serpents by a percentage.', prerequisites: ['pearl_magnetism'] },
  { id: 'nacre_regeneration', name: 'Nacre Regeneration', type: 'passive', power: 20, cooldown: 0, description: 'Slowly regenerates health over time by absorbing minerals from the surrounding water.', prerequisites: ['serpent_empathy'] },

  // Ultimate (3)
  { id: 'call_of_the_abyss', name: 'Call of the Abyss', type: 'ultimate', power: 120, cooldown: 180, description: 'Sends out a psychic signal that temporarily calms all serpents in range, allowing safe passage.', prerequisites: ['depth_impale', 'eternal_shell'] },
  { id: 'pearl_sovereignty', name: 'Pearl Sovereignty', type: 'ultimate', power: 200, cooldown: 240, description: 'Temporarily gains the power of the Pearl Emperor, transforming into a being of pure pearl energy.', prerequisites: ['pearl_apocalypse', 'eternal_shell'] },
  { id: 'origin_pearl_awakening', name: 'Origin Pearl Awakening', type: 'ultimate', power: 300, cooldown: 360, description: 'Channels the power of the Pearl of Origin itself, reshaping the entire abyss for a brief moment.', prerequisites: ['pearl_sovereignty'] },
];

// ─── PE_ACHIEVEMENTS: 18 Achievements ─────────────────────────────────────────

const PE_ACHIEVEMENTS: PeAchievementDef[] = [
  { id: 'pe_first_tame', name: 'First Companion', description: 'Tame your very first abyssal serpent and begin your journey into the deep.', condition: 'totalTamed >= 1', reward: 50, rewardType: 'pearls' },
  { id: 'pe_tamer_10', name: 'Serpent Handler', description: 'Successfully tame 10 different abyssal serpents across multiple species.', condition: 'totalTamed >= 10', reward: 200, rewardType: 'pearls' },
  { id: 'pe_tamer_25', name: 'Abyssal Beastmaster', description: 'Tame 25 different abyssal serpents, mastering most of the known species.', condition: 'totalTamed >= 25', reward: 800, rewardType: 'experience' },
  { id: 'pe_tamer_all', name: 'Supreme Tamer', description: 'Tame all 35 abyssal serpents across every rarity tier — the ultimate achievement.', condition: 'totalTamed >= 35', reward: 5000, rewardType: 'title' },
  { id: 'pe_first_dive', name: 'Initial Descent', description: 'Complete your first trench dive and touch the abyss floor with your own hands.', condition: 'totalDived >= 1', reward: 40, rewardType: 'pearls' },
  { id: 'pe_diver_10', name: 'Frequent Diver', description: 'Complete 10 trench dives, proving your commitment to exploring the unknown.', condition: 'totalDived >= 10', reward: 150, rewardType: 'materials' },
  { id: 'pe_diver_50', name: 'Depth Veteran', description: 'Complete 50 trench dives — you have seen what most divers only dream of.', condition: 'totalDived >= 50', reward: 600, rewardType: 'experience' },
  { id: 'pe_diver_100', name: 'Abyssal Pioneer', description: 'Complete 100 trench dives, joining the ranks of the legendary deep explorers.', condition: 'totalDived >= 100', reward: 2500, rewardType: 'title' },
  { id: 'pe_all_trenches', name: 'Cartographer of the Deep', description: 'Explore and dive in all 8 trench locations, mapping the entire Pearl Abyss.', condition: 'trenchesExplored >= 8', reward: 1000, rewardType: 'pearls' },
  { id: 'pe_heart_chasm', name: 'Heart Reacher', description: 'Dive into the legendary Pearl Heart Chasm — the deepest point in existence.', condition: 'chasmDived >= 1', reward: 3000, rewardType: 'experience' },
  { id: 'pe_collector_10', name: 'Pearl Collector', description: 'Gather 10 different pearl and shell materials in your inventory.', condition: 'uniqueMaterials >= 10', reward: 100, rewardType: 'pearls' },
  { id: 'pe_collector_20', name: 'Material Hoarder', description: 'Gather 20 different pearl and shell materials from across the abyss.', condition: 'uniqueMaterials >= 20', reward: 500, rewardType: 'materials' },
  { id: 'pe_collector_all', name: 'Complete Collection', description: 'Gather all 30 pearl and shell materials — the most complete collection in history.', condition: 'uniqueMaterials >= 30', reward: 4000, rewardType: 'title' },
  { id: 'pe_builder_5', name: 'Abyss Architect', description: 'Build 5 different abyss structures to establish your underwater base.', condition: 'structuresBuilt >= 5', reward: 200, rewardType: 'pearls' },
  { id: 'pe_builder_15', name: 'Deep Constructor', description: 'Build 15 different abyss structures, creating a thriving deep-sea outpost.', condition: 'structuresBuilt >= 15', reward: 800, rewardType: 'experience' },
  { id: 'pe_builder_all', name: 'Master Builder', description: 'Build all 25 abyss structures — the Pearl Abyss is yours to command.', condition: 'structuresBuilt >= 25', reward: 5000, rewardType: 'title' },
  { id: 'pe_artifact_5', name: 'Artifact Seeker', description: 'Activate 5 legendary pearl artifacts and channel their ancient power.', condition: 'artifactsActive >= 5', reward: 300, rewardType: 'materials' },
  { id: 'pe_artifact_all', name: 'Artifact Master', description: 'Activate all 15 legendary pearl artifacts — the abyss bends to your will.', condition: 'artifactsActive >= 15', reward: 8000, rewardType: 'title' },
];

// ─── PE_TITLES: 8 Progression Titles ─────────────────────────────────────────

const PE_TITLES: PeTitleDef[] = [
  { id: 1, name: 'Pearl Dabbler', requiredLevel: 1, bonusDescription: '+5% tame chance in Shimmering Shallows.' },
  { id: 2, name: 'Shell Collector', requiredLevel: 5, bonusDescription: '+10% material harvest quantity from all trenches.' },
  { id: 3, name: 'Trench Explorer', requiredLevel: 10, bonusDescription: 'Unlock access to the Coral Labyrinth trench.' },
  { id: 4, name: 'Serpent Tamer', requiredLevel: 20, bonusDescription: '+15% serpent loyalty gain rate.' },
  { id: 5, name: 'Nacre Artisan', requiredLevel: 30, bonusDescription: '-20% structure upgrade costs.' },
  { id: 6, name: 'Abyssal Champion', requiredLevel: 40, bonusDescription: '+25% serpent combat power.' },
  { id: 7, name: 'Pearl Sovereign', requiredLevel: 50, bonusDescription: 'Unlock Pearl Sovereignty ultimate ability.' },
  { id: 8, name: 'Emperor of the Deep', requiredLevel: 60, bonusDescription: 'All abyss bonuses doubled. The abyss recognizes its master.' },
];

// ─── PE_ARTIFACTS: 15 Legendary Pearl Artifacts ──────────────────────────────

const PE_ARTIFACTS: PeArtifactDef[] = [
  { id: 'pearl_of_origin', name: 'Pearl of Origin', description: 'The first pearl ever created, containing the primordial essence of the ocean. It glows with all colors simultaneously.', rarity: 'legendary', power: 100, passiveEffect: 'All serpent stats +10%. Materials harvested have 5% chance to upgrade rarity.', lore: 'Before the ocean existed, there was a single grain of sand and a drop of divine water. The Pearl of Origin was the result.' },
  { id: 'crown_of_tides', name: 'Crown of Tides', description: 'A crown made from living pearls that pulsate with the rhythm of the ocean tides, granting control over currents.', rarity: 'legendary', power: 90, passiveEffect: 'Trench dive speed +30%. Random tidal events occur 50% more often.', lore: 'The Crown of Tides was worn by the ancient kings of Atlantis — it was the last artifact to sink with the city.' },
  { id: 'serpent_eye_gem', name: 'Serpent Eye Gem', description: 'A perfectly spherical gem resembling a serpent eye, said to allow communication with any abyssal serpent.', rarity: 'legendary', power: 85, passiveEffect: 'Serpent taming chance +20%. Can communicate with untamed serpents.', lore: 'This gem was cut from the eye of the first serpent tamer, who sacrificed their sight to gain the trust of serpents.' },
  { id: 'nacre_shield_of_ages', name: 'Nacre Shield of Ages', description: 'A shield forged from layered nacre over millions of years, each layer harder than the last.', rarity: 'legendary', power: 95, passiveEffect: 'All defensive ability power +25%. Reduces incoming damage from events by 15%.', lore: 'The Nacre Shield has been passed between guardians of the abyss for eons — each added their own layer of protection.' },
  { id: 'tear_of_the_queen', name: 'Tear of the Pearl Queen', description: 'A single tear from the Mother of All Pearls, crystallized into an indestructible gem of pure emotion.', rarity: 'legendary', power: 92, passiveEffect: 'All healing effects +30%. Serpent loyalty never decreases.', lore: 'The Queen weeps only when a pearl is destroyed — each tear is a monument to beauty lost.' },
  { id: 'depth_compass', name: 'Depth Compass', description: 'A compass that always points toward the deepest, most dangerous part of any body of water.', rarity: 'epic', power: 70, passiveEffect: 'Reveals hidden trench passages. +15% chance of finding rare materials on dives.', lore: 'The Depth Compass was forged by a mad cartographer who spent their life mapping every trench in the ocean.' },
  { id: 'chasm_key', name: 'Chasm Key', description: 'A key carved from black pearl that can unlock any sealed door or passage in the abyss.', rarity: 'epic', power: 75, passiveEffect: 'Unlocks bonus rooms in trenches. +20% pearls earned from completed dives.', lore: 'The Chasm Key has opened doors that were sealed before the first human walked the earth.' },
  { id: 'iridescent_orb', name: 'Iridescent Orb', description: 'A smooth orb that projects all the colors of the spectrum, creating illusions indistinguishable from reality.', rarity: 'epic', power: 72, passiveEffect: 'Illusion-based abilities cost 20% less cooldown. Serpents gain confusion resistance.', lore: 'Gazing into the Iridescent Orb for too long causes permanent alterations to perception.' },
  { id: 'whispering_conch', name: 'Whispering Conch', description: 'A conch shell that whispers secrets of the deep when held to the ear, revealing hidden locations.', rarity: 'epic', power: 68, passiveEffect: 'Reveals one random undiscovered material source per day. +10% dive success rate.', lore: 'The Whispering Conch speaks in a language that existed before words — it communicates in pure understanding.' },
  { id: 'frozen_pearl', name: 'Frozen Pearl', description: 'A pearl frozen at the absolute moment of perfection, its surface eternally smooth and unchanging.', rarity: 'epic', power: 65, passiveEffect: 'All pearl-related structures produce 25% more output. Time-based events last 20% longer.', lore: 'The Frozen Pearl exists in a state of eternal perfection — a snapshot of beauty that will never fade.' },
  { id: 'abyssal_lantern', name: 'Abyssal Lantern', description: 'A lantern fueled by bioluminescent pearls that never dims, illuminating even the deepest darkness.', rarity: 'rare', power: 50, passiveEffect: 'Permanent light source in all trenches. Visibility hazards reduced by 50%.', lore: 'The Abyssal Lantern was the invention of the first deep diver — without it, the abyss would have remained dark forever.' },
  { id: 'pearl_necklace_of_depths', name: 'Pearl Necklace of Depths', description: 'A necklace of graduated pearls that grants the wearer the ability to breathe underwater indefinitely.', rarity: 'rare', power: 55, passiveEffect: 'Dive duration +40%. No oxygen penalties in any trench.', lore: 'Each pearl on this necklace came from a different depth — together, they grant mastery over all water pressures.' },
  { id: 'shell_horn', name: 'Shell Horn', description: 'A horn made from a massive spiral shell, its sound echoing through the abyss for leagues.', rarity: 'rare', power: 48, passiveEffect: 'Can call tamed serpents from any distance. Serpent response time +50%.', lore: 'When the Shell Horn is blown, every creature in the abyss hears it — some answer with curiosity, others with fear.' },
  { id: 'moonlit_pearl_ring', name: 'Moonlit Pearl Ring', description: 'A ring set with a pearl that glows only under moonlight, enhancing the wearer\'s night vision.', rarity: 'rare', power: 45, passiveEffect: '+20% vision range at all depths. Wraith encounters are less dangerous.', lore: 'The pearl in this ring was formed during a lunar eclipse — it carries the moon\'s light within its layers.' },
  { id: 'coral_crown_fragment', name: 'Coral Crown Fragment', description: 'A fragment of an ancient crown worn by the rulers of the Coral Kingdom, still radiating authority.', rarity: 'rare', power: 52, passiveEffect: '+15% serpent loyalty. Coral viper taming chance increased by 10%.', lore: 'The Coral Kingdom fell a million years ago, but its authority persists in this fragment of the royal crown.' },
];

// ─── PE_EVENTS: 12 Random Abyss Events ───────────────────────────────────────

const PE_EVENTS: PeEventDef[] = [
  { id: 'pearl_rain', name: 'Pearl Rain', description: 'A sudden downpour of small pearls rains from the cavern ceiling above, scattering treasures across the sea floor.', effect: 'gain_random_materials', duration: 30, rarity: 'common', severity: 'minor' },
  { id: 'serpent_migration', name: 'Serpent Migration', description: 'A massive migration of abyssal serpents passes through the trench, temporarily increasing tame chances.', effect: 'boost_tame_chance', duration: 60, rarity: 'uncommon', severity: 'minor' },
  { id: 'abyssal_storm', name: 'Abyssal Storm', description: 'A violent underwater storm with powerful currents that can push divers off course and dislodge treasures.', effect: 'random_displacement', duration: 45, rarity: 'common', severity: 'moderate' },
  { id: 'pearl_bloom', name: 'Pearl Bloom', description: 'The walls of the trench suddenly erupt with new pearl growths, creating a temporary harvestable bounty.', effect: 'bonus_harvest', duration: 40, rarity: 'uncommon', severity: 'minor' },
  { id: 'ghost_fleet', name: 'Ghost Fleet', description: 'Spectral ships from sunken navies drift through, their ghostly crews dropping cursed pearls and lost artifacts.', effect: 'ghost_artifact_drops', duration: 50, rarity: 'rare', severity: 'moderate' },
  { id: 'pressure_surge', name: 'Pressure Surge', description: 'A sudden spike in water pressure damages structures but compresses materials into higher-rarity forms.', effect: 'upgrade_materials', duration: 20, rarity: 'rare', severity: 'major' },
  { id: 'bioluminescent_night', name: 'Bioluminescent Night', description: 'The entire abyss erupts in bioluminescent light, revealing hidden passages and secret serpent nests.', effect: 'reveal_hidden', duration: 35, rarity: 'uncommon', severity: 'minor' },
  { id: 'nacre_tide', name: 'Nacre Tide', description: 'A tide of liquid nacre washes through, healing serpents and repairing structures in its wake.', effect: 'heal_and_repair', duration: 25, rarity: 'rare', severity: 'minor' },
  { id: 'depth_quake', name: 'Depth Quake', description: 'A deep-sea earthquake opens new fissures in the trench floor, revealing previously inaccessible areas.', effect: 'open_new_areas', duration: 15, rarity: 'epic', severity: 'major' },
  { id: 'queen_summoning', name: 'Queen Summoning', description: 'A rare event where the Pearl Queen\'s song echoes through the abyss, attracting rare and legendary serpents.', effect: 'attract_rare_serpents', duration: 70, rarity: 'epic', severity: 'moderate' },
  { id: 'coral_reckoning', name: 'Coral Reckoning', description: 'The coral walls come alive with aggressive growth, creating hazards but also producing rare materials.', effect: 'hazardous_harvest', duration: 40, rarity: 'rare', severity: 'major' },
  { id: 'mirror_shatter', name: 'Mirror Shatter', description: 'The Mirror Cavern\'s walls crack, releasing fragments of reflected alternate realities into the world.', effect: 'duplicate_resources', duration: 30, rarity: 'legendary', severity: 'catastrophic' },
];

// ─── Default State Creator ────────────────────────────────────────────────────

function peCreateDefaultState(): PearlAbyssState {
  const serpents: Record<string, PeSerpentState> = {};
  for (const s of PE_SERPENTS) {
    serpents[s.id] = {
      tamed: false,
      tamedAt: null,
      loyalty: 0,
      level: 1,
      experience: 0,
      health: s.hp,
      maxHealth: s.hp,
    };
  }
  const trenches: Record<string, PeTrenchState> = {};
  for (const t of PE_TRENCHES) {
    trenches[t.id] = {
      explored: false,
      divesCompleted: 0,
      currentDepth: 0,
      maxDepthReached: 0,
      lastDiveAt: null,
    };
  }
  const structures: Record<string, PeStructureState> = {};
  for (const s of PE_STRUCTURES) {
    structures[s.id] = {
      built: false,
      level: 0,
      builtAt: null,
      lastUpgradedAt: null,
    };
  }
  const achievementProgress: Record<string, PeAchievementProgress> = {};
  for (const a of PE_ACHIEVEMENTS) {
    achievementProgress[a.id] = {
      achievementId: a.id,
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      target: 1,
    };
  }
  return {
    peSerpents: serpents,
    peTrenches: trenches,
    peInventory: [],
    peArtifacts: [],
    peAchievements: [],
    peAchievementProgress: achievementProgress,
    peTitle: 'Pearl Dabbler',
    peEvents: [],
    peStructures: structures,
    peStats: {
      totalTamed: 0,
      totalDived: 0,
      totalMaterialsCollected: 0,
      totalArtifactsActivated: 0,
      totalStructuresBuilt: 0,
      totalEventsTriggered: 0,
      pearlsEarned: 0,
      pearlsSpent: 0,
      highestDepth: 0,
    },
    pePearls: 0,
    peExperience: 0,
    peLevel: 1,
  };
}

// ─── Utility: Tame Chance Calculator ──────────────────────────────────────────

function peCalculateTameChance(serpentDef: PeSerpentDef, diverLevel: number): number {
  const rarityBonuses: Record<PeRarity, number> = {
    common: 80,
    uncommon: 55,
    rare: 30,
    epic: 15,
    legendary: 5,
  };
  const levelBonus = Math.max(0, (diverLevel - serpentDef.hp / 10) * 2);
  return Math.min(95, Math.max(1, rarityBonuses[serpentDef.rarity] + levelBonus));
}

// ─── Utility: Dive Reward Calculator ──────────────────────────────────────────

function peCalculateDiveReward(trenchDef: PeTrenchDef, diveNumber: number): { pearls: number; materials: number } {
  const basePearls = trenchDef.level * 10;
  const depthBonus = Math.floor(trenchDef.depthRange[1] / 100);
  const revisitPenalty = Math.max(0.5, 1 - diveNumber * 0.02);
  const pearls = Math.floor((basePearls + depthBonus) * revisitPenalty);
  const materials = Math.min(trenchDef.capacity, 1 + Math.floor(trenchDef.level / 5));
  return { pearls, materials };
}

// ─── Utility: Structure Upgrade Cost ──────────────────────────────────────────

function peCalculateUpgradeCost(structureDef: PeStructureDef, currentLevel: number): number {
  if (currentLevel >= structureDef.maxLevel) return Infinity;
  return Math.floor(structureDef.baseCost * Math.pow(structureDef.upgradeCostMultiplier, currentLevel));
}

// ─── Utility: Serpent Power Rating ────────────────────────────────────────────

function peCalculateSerpentPower(def: PeSerpentDef, state: PeSerpentState): number {
  const basePower = def.hp + def.attack * 2 + def.defense * 1.5 + def.speed * 0.5;
  const levelMultiplier = 1 + (state.level - 1) * 0.12;
  const loyaltyMultiplier = 1 + state.loyalty * 0.005;
  return Math.floor(basePower * levelMultiplier * loyaltyMultiplier);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export default function usePearlAbyss(initialState?: PearlAbyssState) {
  const [state, setState] = useState<PearlAbyssState>(initialState ?? peCreateDefaultState());
  const stateRef = useRef(state);

  // stateRef sync via useEffect — NOT during render
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ── Action: tameSerpent(id) ────────────────────────────────────────────────

  const tameSerpent = useCallback((id: string): boolean => {
    const def = PE_SERPENTS.find((s) => s.id === id);
    if (!def) return false;
    let success = false;
    setState((prev) => {
      const existing = prev.peSerpents[id];
      if (existing && existing.tamed) return prev;
      success = true;
      const tameChance = peCalculateTameChance(def, prev.peLevel);
      // Deterministic tame based on ID hash for SSR safety
      const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const roll = (hash * 7 + prev.peStats.totalTamed * 13) % 100;
      if (roll > tameChance) {
        success = false;
        return prev;
      }
      return {
        ...prev,
        peSerpents: {
          ...prev.peSerpents,
          [id]: {
            tamed: true,
            tamedAt: Date.now(),
            loyalty: 30 + (def.rarity === 'legendary' ? 40 : def.rarity === 'epic' ? 30 : def.rarity === 'rare' ? 20 : 10),
            level: 1,
            experience: 0,
            health: def.hp,
            maxHealth: def.hp,
          },
        },
        peStats: {
          ...prev.peStats,
          totalTamed: prev.peStats.totalTamed + 1,
        },
        peExperience: prev.peExperience + (def.rarity === 'legendary' ? 500 : def.rarity === 'epic' ? 200 : def.rarity === 'rare' ? 80 : def.rarity === 'uncommon' ? 30 : 10),
      };
    });
    return success;
  }, []);

  // ── Action: diveTrench(id) ─────────────────────────────────────────────────

  const diveTrench = useCallback((id: string): boolean => {
    const def = PE_TRENCHES.find((t) => t.id === id);
    if (!def) return false;
    let success = false;
    setState((prev) => {
      const trench = prev.peTrenches[id];
      if (!trench) return prev;
      success = true;
      const reward = peCalculateDiveReward(def, trench.divesCompleted);
      const newDepth = def.depthRange[0] + Math.floor(Math.random() * (def.depthRange[1] - def.depthRange[0]));
      return {
        ...prev,
        peTrenches: {
          ...prev.peTrenches,
          [id]: {
            ...trench,
            explored: true,
            divesCompleted: trench.divesCompleted + 1,
            currentDepth: newDepth,
            maxDepthReached: Math.max(trench.maxDepthReached, newDepth),
            lastDiveAt: Date.now(),
          },
        },
        peStats: {
          ...prev.peStats,
          totalDived: prev.peStats.totalDived + 1,
          pearlsEarned: prev.peStats.pearlsEarned + reward.pearls,
          highestDepth: Math.max(prev.peStats.highestDepth, newDepth),
        },
        pePearls: prev.pePearls + reward.pearls,
        peExperience: prev.peExperience + def.level * 5,
      };
    });
    return success;
  }, []);

  // ── Action: buildStructure(id) ─────────────────────────────────────────────

  const buildStructure = useCallback((id: string): boolean => {
    const def = PE_STRUCTURES.find((s) => s.id === id);
    if (!def) return false;
    let success = false;
    setState((prev) => {
      const existing = prev.peStructures[id];
      if (existing && existing.built) return prev;
      if (prev.pePearls < def.baseCost) return prev;
      success = true;
      return {
        ...prev,
        peStructures: {
          ...prev.peStructures,
          [id]: {
            built: true,
            level: 1,
            builtAt: Date.now(),
            lastUpgradedAt: Date.now(),
          },
        },
        peStats: {
          ...prev.peStats,
          totalStructuresBuilt: prev.peStats.totalStructuresBuilt + 1,
          pearlsSpent: prev.peStats.pearlsSpent + def.baseCost,
        },
        pePearls: prev.pePearls - def.baseCost,
      };
    });
    return success;
  }, []);

  // ── Action: activateArtifact(id) ───────────────────────────────────────────

  const activateArtifact = useCallback((id: string): boolean => {
    const def = PE_ARTIFACTS.find((a) => a.id === id);
    if (!def) return false;
    let success = false;
    setState((prev) => {
      if (prev.peArtifacts.includes(id)) return prev;
      success = true;
      return {
        ...prev,
        peArtifacts: [...prev.peArtifacts, id],
        peStats: {
          ...prev.peStats,
          totalArtifactsActivated: prev.peStats.totalArtifactsActivated + 1,
        },
        peExperience: prev.peExperience + def.power * 2,
      };
    });
    return success;
  }, []);

  // ── Action: triggerAbyssEvent() ────────────────────────────────────────────

  const triggerAbyssEvent = useCallback((): PeEventDef | null => {
    const totalEvents = PE_EVENTS.length;
    if (totalEvents === 0) return null;
    let selectedEvent: PeEventDef | null = null;
    setState((prev) => {
      const idx = (prev.peStats.totalEventsTriggered) % totalEvents;
      const event = PE_EVENTS[idx];
      selectedEvent = event;
      return {
        ...prev,
        peEvents: [...prev.peEvents, event.id],
        peStats: {
          ...prev.peStats,
          totalEventsTriggered: prev.peStats.totalEventsTriggered + 1,
        },
      };
    });
    return selectedEvent;
  }, []);

  // ── Action: resetPearlAbyss() ──────────────────────────────────────────────

  const resetPearlAbyss = useCallback((): void => {
    setState(peCreateDefaultState());
  }, []);

  // ── Accessors (useCallback) ────────────────────────────────────────────────

  const peGetState = useCallback((): Readonly<PearlAbyssState> => {
    return stateRef.current;
  }, []);

  const peGetStats = useCallback((): Readonly<PearlAbyssState['peStats']> => {
    return stateRef.current.peStats;
  }, []);

  const peGetTitle = useCallback((): string => {
    return stateRef.current.peTitle;
  }, []);

  const peGetInventory = useCallback((): readonly InventoryItem[] => {
    return stateRef.current.peInventory;
  }, []);

  const peGetArtifacts = useCallback((): readonly string[] => {
    return stateRef.current.peArtifacts;
  }, []);

  const peGetAchievements = useCallback((): readonly string[] => {
    return stateRef.current.peAchievements;
  }, []);

  const peGetEvents = useCallback((): readonly string[] => {
    return stateRef.current.peEvents;
  }, []);

  const peGetPearls = useCallback((): number => {
    return stateRef.current.pePearls;
  }, []);

  const peGetExperience = useCallback((): number => {
    return stateRef.current.peExperience;
  }, []);

  const peGetLevel = useCallback((): number => {
    return stateRef.current.peLevel;
  }, []);

  const peGetSerpentState = useCallback((id: string): PeSerpentState | undefined => {
    return stateRef.current.peSerpents[id];
  }, []);

  const peGetTrenchState = useCallback((id: string): PeTrenchState | undefined => {
    return stateRef.current.peTrenches[id];
  }, []);

  const peGetStructureState = useCallback((id: string): PeStructureState | undefined => {
    return stateRef.current.peStructures[id];
  }, []);

  const peGetAchievementProgress = useCallback((id: string): PeAchievementProgress | undefined => {
    return stateRef.current.peAchievementProgress[id];
  }, []);

  const peIsSerpentTamed = useCallback((id: string): boolean => {
    const s = stateRef.current.peSerpents[id];
    return s ? s.tamed : false;
  }, []);

  const peIsTrenchExplored = useCallback((id: string): boolean => {
    const t = stateRef.current.peTrenches[id];
    return t ? t.explored : false;
  }, []);

  const peIsArtifactActive = useCallback((id: string): boolean => {
    return stateRef.current.peArtifacts.includes(id);
  }, []);

  const peIsAchievementUnlocked = useCallback((id: string): boolean => {
    return stateRef.current.peAchievements.includes(id);
  }, []);

  const peIsStructureBuilt = useCallback((id: string): boolean => {
    const s = stateRef.current.peStructures[id];
    return s ? s.built : false;
  }, []);

  const peGetTamedCount = useCallback((): number => {
    return stateRef.current.peStats.totalTamed;
  }, []);

  const peGetDiveCount = useCallback((): number => {
    return stateRef.current.peStats.totalDived;
  }, []);

  const peGetHighestDepth = useCallback((): number => {
    return stateRef.current.peStats.highestDepth;
  }, []);

  // ── Lookup Helpers (useCallback) ───────────────────────────────────────────

  const peGetSerpentDef = useCallback((id: string): PeSerpentDef | undefined => {
    return PE_SERPENTS.find((s) => s.id === id);
  }, []);

  const peGetTrenchDef = useCallback((id: string): PeTrenchDef | undefined => {
    return PE_TRENCHES.find((t) => t.id === id);
  }, []);

  const peGetMaterialDef = useCallback((id: string): PeMaterialDef | undefined => {
    return PE_MATERIALS.find((m) => m.id === id);
  }, []);

  const peGetStructureDef = useCallback((id: string): PeStructureDef | undefined => {
    return PE_STRUCTURES.find((s) => s.id === id);
  }, []);

  const peGetAbilityDef = useCallback((id: string): PeAbilityDef | undefined => {
    return PE_ABILITIES.find((a) => a.id === id);
  }, []);

  const peGetArtifactDef = useCallback((id: string): PeArtifactDef | undefined => {
    return PE_ARTIFACTS.find((a) => a.id === id);
  }, []);

  const peGetEventDef = useCallback((id: string): PeEventDef | undefined => {
    return PE_EVENTS.find((e) => e.id === id);
  }, []);

  const peGetAchievementDef = useCallback((id: string): PeAchievementDef | undefined => {
    return PE_ACHIEVEMENTS.find((a) => a.id === id);
  }, []);

  const peGetTitleDef = useCallback((name: string): PeTitleDef | undefined => {
    return PE_TITLES.find((t) => t.name === name);
  }, []);

  const peGetSerpentsByRarity = useCallback((rarity: PeRarity): PeSerpentDef[] => {
    return PE_SERPENTS.filter((s) => s.rarity === rarity);
  }, []);

  const peGetSerpentsBySpecies = useCallback((species: PeSerpentSpecies): PeSerpentDef[] => {
    return PE_SERPENTS.filter((s) => s.species === species);
  }, []);

  const peGetMaterialsByRarity = useCallback((rarity: PeRarity): PeMaterialDef[] => {
    return PE_MATERIALS.filter((m) => m.rarity === rarity);
  }, []);

  const peGetMaterialsBySource = useCallback((source: PeMaterialSource): PeMaterialDef[] => {
    return PE_MATERIALS.filter((m) => m.source === source);
  }, []);

  const peGetAbilitiesByType = useCallback((type: PeAbilityType): PeAbilityDef[] => {
    return PE_ABILITIES.filter((a) => a.type === type);
  }, []);

  const peGetArtifactsByRarity = useCallback((rarity: PeRarity): PeArtifactDef[] => {
    return PE_ARTIFACTS.filter((a) => a.rarity === rarity);
  }, []);

  const peGetStructuresByCategory = useCallback((category: PeStructureCategory): PeStructureDef[] => {
    return PE_STRUCTURES.filter((s) => s.category === category);
  }, []);

  const peGetEventsBySeverity = useCallback((severity: PeEventDef['severity']): PeEventDef[] => {
    return PE_EVENTS.filter((e) => e.severity === severity);
  }, []);

  const peGetTamedSerpents = useCallback((): PeSerpentDef[] => {
    const s = stateRef.current;
    return PE_SERPENTS.filter((def) => {
      const st = s.peSerpents[def.id];
      return st && st.tamed;
    });
  }, []);

  const peGetExploredTrenches = useCallback((): PeTrenchDef[] => {
    const s = stateRef.current;
    return PE_TRENCHES.filter((def) => {
      const st = s.peTrenches[def.id];
      return st && st.explored;
    });
  }, []);

  const peGetActiveArtifacts = useCallback((): PeArtifactDef[] => {
    const s = stateRef.current;
    return PE_ARTIFACTS.filter((a) => s.peArtifacts.includes(a.id));
  }, []);

  const peGetUnlockedAchievements = useCallback((): PeAchievementDef[] => {
    const s = stateRef.current;
    return PE_ACHIEVEMENTS.filter((a) => s.peAchievements.includes(a.id));
  }, []);

  const peGetBuiltStructures = useCallback((): PeStructureDef[] => {
    const s = stateRef.current;
    return PE_STRUCTURES.filter((def) => {
      const st = s.peStructures[def.id];
      return st && st.built;
    });
  }, []);

  const peGetLockedSerpents = useCallback((): PeSerpentDef[] => {
    const s = stateRef.current;
    return PE_SERPENTS.filter((def) => {
      const st = s.peSerpents[def.id];
      return !st || !st.tamed;
    });
  }, []);

  const peGetUnexploredTrenches = useCallback((): PeTrenchDef[] => {
    const s = stateRef.current;
    return PE_TRENCHES.filter((def) => {
      const st = s.peTrenches[def.id];
      return !st || !st.explored;
    });
  }, []);

  const peGetInactiveArtifacts = useCallback((): PeArtifactDef[] => {
    const s = stateRef.current;
    return PE_ARTIFACTS.filter((a) => !s.peArtifacts.includes(a.id));
  }, []);

  const peGetLockedAchievements = useCallback((): PeAchievementDef[] => {
    const s = stateRef.current;
    return PE_ACHIEVEMENTS.filter((a) => !s.peAchievements.includes(a.id));
  }, []);

  const peGetUnbuiltStructures = useCallback((): PeStructureDef[] => {
    const s = stateRef.current;
    return PE_STRUCTURES.filter((def) => {
      const st = s.peStructures[def.id];
      return !st || !st.built;
    });
  }, []);

  const peGetCurrentTitleDef = useCallback((): PeTitleDef | undefined => {
    const titleName = stateRef.current.peTitle;
    return PE_TITLES.find((t) => t.name === titleName);
  }, []);

  const peGetEligibleTitle = useCallback((): PeTitleDef => {
    const tamed = stateRef.current.peStats.totalTamed;
    const dived = stateRef.current.peStats.totalDived;
    const effectiveLevel = Math.floor((tamed * 2 + dived) / 3);
    let best = PE_TITLES[0];
    for (const title of PE_TITLES) {
      if (effectiveLevel >= title.requiredLevel) {
        best = title;
      }
    }
    return best;
  }, []);

  const peGetSerpentPower = useCallback((id: string): number => {
    const def = PE_SERPENTS.find((s) => s.id === id);
    const st = stateRef.current.peSerpents[id];
    if (!def || !st || !st.tamed) return 0;
    return peCalculateSerpentPower(def, st);
  }, []);

  const peGetTameChance = useCallback((id: string): number => {
    const def = PE_SERPENTS.find((s) => s.id === id);
    if (!def) return 0;
    return peCalculateTameChance(def, stateRef.current.peLevel);
  }, []);

  const peGetDiveRewardPreview = useCallback((id: string): { pearls: number; materials: number } | null => {
    const def = PE_TRENCHES.find((t) => t.id === id);
    if (!def) return null;
    const st = stateRef.current.peTrenches[id];
    const diveNumber = st ? st.divesCompleted : 0;
    return peCalculateDiveReward(def, diveNumber);
  }, []);

  const peGetUpgradeCost = useCallback((id: string): number => {
    const def = PE_STRUCTURES.find((s) => s.id === id);
    if (!def) return Infinity;
    const st = stateRef.current.peStructures[id];
    const currentLevel = st ? st.level : 0;
    return peCalculateUpgradeCost(def, currentLevel);
  }, []);

  const peGetStructureMaxLevel = useCallback((id: string): number => {
    const def = PE_STRUCTURES.find((s) => s.id === id);
    return def ? def.maxLevel : 0;
  }, []);

  const peGetEventByIdx = useCallback((idx: number): PeEventDef | undefined => {
    if (idx < 0 || idx >= PE_EVENTS.length) return undefined;
    return PE_EVENTS[idx];
  }, []);

  // ── Derived / Computed (useMemo) ───────────────────────────────────────────

  const peTameProgress = useMemo((): number => {
    const tamedCount = Object.values(state.peSerpents).filter((s) => s.tamed).length;
    return Math.floor((tamedCount / PE_SERPENTS.length) * 100);
  }, [state]);

  const peExploreProgress = useMemo((): number => {
    const exploredCount = Object.values(state.peTrenches).filter((t) => t.explored).length;
    return Math.floor((exploredCount / PE_TRENCHES.length) * 100);
  }, [state]);

  const peArtifactProgress = useMemo((): number => {
    return Math.floor((state.peArtifacts.length / PE_ARTIFACTS.length) * 100);
  }, [state]);

  const peAchievementProgress = useMemo((): number => {
    return Math.floor((state.peAchievements.length / PE_ACHIEVEMENTS.length) * 100);
  }, [state]);

  const peStructureProgress = useMemo((): number => {
    const builtCount = Object.values(state.peStructures).filter((s) => s.built).length;
    return Math.floor((builtCount / PE_STRUCTURES.length) * 100);
  }, [state]);

  const peInventorySize = useMemo((): number => {
    return state.peInventory.length;
  }, [state]);

  const peTotalMaterials = useMemo((): number => {
    return state.peInventory.reduce((sum, item) => sum + item.quantity, 0);
  }, [state]);

  const peRaritySummary = useMemo((): Record<PeRarity, number> => {
    const summary: Record<PeRarity, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    for (const serpent of PE_SERPENTS) {
      const st = state.peSerpents[serpent.id];
      if (st && st.tamed) {
        summary[serpent.rarity]++;
      }
    }
    return summary;
  }, [state]);

  const peSpeciesSummary = useMemo((): Record<PeSerpentSpecies, number> => {
    const summary: Record<PeSerpentSpecies, number> = {
      pearl_dragon: 0,
      abyssal_eel: 0,
      coral_viper: 0,
      sea_wraith: 0,
      depth_leviathan: 0,
      shell_golem: 0,
      pearl_queen: 0,
    };
    for (const serpent of PE_SERPENTS) {
      const st = state.peSerpents[serpent.id];
      if (st && st.tamed) {
        summary[serpent.species]++;
      }
    }
    return summary;
  }, [state]);

  const peTopSerpents = useMemo((): PeSerpentDef[] => {
    const tamed = PE_SERPENTS.filter((def) => {
      const st = state.peSerpents[def.id];
      return st && st.tamed;
    });
    return tamed.sort((a, b) => {
      const stA = state.peSerpents[a.id];
      const stB = state.peSerpents[b.id];
      const powerA = stA ? peCalculateSerpentPower(a, stA) : 0;
      const powerB = stB ? peCalculateSerpentPower(b, stB) : 0;
      return powerB - powerA;
    }).slice(0, 5);
  }, [state]);

  const peDeepestTrench = useMemo((): PeTrenchDef | undefined => {
    const explored = PE_TRENCHES.filter((def) => {
      const st = state.peTrenches[def.id];
      return st && st.explored;
    });
    if (explored.length === 0) return undefined;
    return explored.reduce((deepest, current) => {
      const deepestSt = state.peTrenches[deepest.id];
      const currentSt = state.peTrenches[current.id];
      if (!deepestSt || !currentSt) return deepest;
      return currentSt.maxDepthReached > deepestSt.maxDepthReached ? current : deepest;
    });
  }, [state]);

  const peActiveEventCount = useMemo((): number => {
    return state.peEvents.length;
  }, [state]);

  const peMostRecentEvent = useMemo((): PeEventDef | undefined => {
    if (state.peEvents.length === 0) return undefined;
    const lastId = state.peEvents[state.peEvents.length - 1];
    return PE_EVENTS.find((e) => e.id === lastId);
  }, [state]);

  const pePowerRanking = useMemo((): { id: string; name: string; power: number }[] => {
    const rankings: { id: string; name: string; power: number }[] = [];
    for (const def of PE_SERPENTS) {
      const st = state.peSerpents[def.id];
      if (st && st.tamed) {
        const power = peCalculateSerpentPower(def, st);
        rankings.push({ id: def.id, name: def.name, power });
      }
    }
    return rankings.sort((a, b) => b.power - a.power);
  }, [state]);

  const peHighestRarityTamed = useMemo((): PeRarity | null => {
    const order: PeRarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
    for (const rarity of order) {
      const hasRarity = PE_SERPENTS.some((def) => {
        const st = state.peSerpents[def.id];
        return st && st.tamed && def.rarity === rarity;
      });
      if (hasRarity) return rarity;
    }
    return null;
  }, [state]);

  const peAbilitiesSummary = useMemo((): Record<PeAbilityType, number> => {
    const summary: Record<PeAbilityType, number> = { offensive: 0, defensive: 0, utility: 0, passive: 0, ultimate: 0 };
    for (const ability of PE_ABILITIES) {
      summary[ability.type]++;
    }
    return summary;
  }, [state]);

  const peEventHistorySummary = useMemo((): Record<string, number> => {
    const summary: Record<string, number> = {};
    for (const eventId of state.peEvents) {
      if (summary[eventId]) {
        summary[eventId]++;
      } else {
        summary[eventId] = 1;
      }
    }
    return summary;
  }, [state]);

  const peMaterialsInventorySummary = useMemo((): { total: number; unique: number; byRarity: Record<PeRarity, number> } => {
    const byRarity: Record<PeRarity, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    let total = 0;
    for (const item of state.peInventory) {
      total += item.quantity;
      const matDef = PE_MATERIALS.find((m) => m.id === item.materialId);
      if (matDef) {
        byRarity[matDef.rarity] += item.quantity;
      }
    }
    return { total, unique: state.peInventory.length, byRarity };
  }, [state]);

  const peNextTitle = useMemo((): PeTitleDef | null => {
    const current = PE_TITLES.find((t) => t.name === state.peTitle);
    if (!current) return PE_TITLES[0];
    const idx = PE_TITLES.findIndex((t) => t.id === current.id);
    if (idx >= PE_TITLES.length - 1) return null;
    return PE_TITLES[idx + 1];
  }, [state]);

  const peOverallProgress = useMemo((): number => {
    const tamePct = Object.values(state.peSerpents).filter((s) => s.tamed).length / PE_SERPENTS.length;
    const explorePct = Object.values(state.peTrenches).filter((t) => t.explored).length / PE_TRENCHES.length;
    const artifactPct = state.peArtifacts.length / PE_ARTIFACTS.length;
    const achievementPct = state.peAchievements.length / PE_ACHIEVEMENTS.length;
    const structurePct = Object.values(state.peStructures).filter((s) => s.built).length / PE_STRUCTURES.length;
    const combined = (tamePct + explorePct + artifactPct + achievementPct + structurePct) / 5;
    return Math.floor(combined * 100);
  }, [state]);

  const peTotalSerpentPower = useMemo((): number => {
    let total = 0;
    for (const def of PE_SERPENTS) {
      const st = state.peSerpents[def.id];
      if (st && st.tamed) {
        total += peCalculateSerpentPower(def, st);
      }
    }
    return total;
  }, [state]);

  const peTotalArtifactPower = useMemo((): number => {
    let total = 0;
    for (const artifactId of state.peArtifacts) {
      const def = PE_ARTIFACTS.find((a) => a.id === artifactId);
      if (def) total += def.power;
    }
    return total;
  }, [state]);

  const peAverageSerpentLoyalty = useMemo((): number => {
    const tamed = Object.values(state.peSerpents).filter((s) => s.tamed);
    if (tamed.length === 0) return 0;
    const totalLoyalty = tamed.reduce((sum, s) => sum + s.loyalty, 0);
    return Math.floor(totalLoyalty / tamed.length);
  }, [state]);

  const peTotalDivePearlsEarned = useMemo((): number => {
    return state.peStats.pearlsEarned;
  }, [state]);

  const peTotalPearlsSpent = useMemo((): number => {
    return state.peStats.pearlsSpent;
  }, [state]);

  const peNetPearlWealth = useMemo((): number => {
    return state.pePearls;
  }, [state]);

  const peMostDivedTrench = useMemo((): PeTrenchDef | undefined => {
    let maxDives = 0;
    let result: PeTrenchDef | undefined;
    for (const def of PE_TRENCHES) {
      const st = state.peTrenches[def.id];
      if (st && st.divesCompleted > maxDives) {
        maxDives = st.divesCompleted;
        result = def;
      }
    }
    return result;
  }, [state]);

  const peStrongestSerpent = useMemo((): PeSerpentDef | undefined => {
    let bestDef: PeSerpentDef | undefined;
    let bestPower = 0;
    for (const def of PE_SERPENTS) {
      const st = state.peSerpents[def.id];
      if (st && st.tamed) {
        const power = peCalculateSerpentPower(def, st);
        if (power > bestPower) {
          bestPower = power;
          bestDef = def;
        }
      }
    }
    return bestDef;
  }, [state]);

  const peLatestTamedSerpent = useMemo((): PeSerpentDef | undefined => {
    let latestTime = 0;
    let latestDef: PeSerpentDef | undefined;
    for (const def of PE_SERPENTS) {
      const st = state.peSerpents[def.id];
      if (st && st.tamed && st.tamedAt && st.tamedAt > latestTime) {
        latestTime = st.tamedAt;
        latestDef = def;
      }
    }
    return latestDef;
  }, [state]);

  const peTrenchDepthRecords = useMemo((): { trenchId: string; trenchName: string; maxDepth: number }[] => {
    const records: { trenchId: string; trenchName: string; maxDepth: number }[] = [];
    for (const def of PE_TRENCHES) {
      const st = state.peTrenches[def.id];
      if (st && st.maxDepthReached > 0) {
        records.push({
          trenchId: def.id,
          trenchName: def.name,
          maxDepth: st.maxDepthReached,
        });
      }
    }
    return records.sort((a, b) => b.maxDepth - a.maxDepth);
  }, [state]);

  const peStructureLevelSummary = useMemo((): { built: number; maxLevel: number; totalLevels: number } => {
    let built = 0;
    let maxLevel = 0;
    let totalLevels = 0;
    for (const def of PE_STRUCTURES) {
      const st = state.peStructures[def.id];
      if (st && st.built) {
        built++;
        totalLevels += st.level;
        if (st.level > maxLevel) {
          maxLevel = st.level;
        }
      }
    }
    return { built, maxLevel, totalLevels };
  }, [state]);

  const peEventSeveritySummary = useMemo((): Record<PeEventDef['severity'], number> => {
    const summary: Record<PeEventDef['severity'], number> = { minor: 0, moderate: 0, major: 0, catastrophic: 0 };
    for (const eventId of state.peEvents) {
      const def = PE_EVENTS.find((e) => e.id === eventId);
      if (def) {
        summary[def.severity]++;
      }
    }
    return summary;
  }, [state]);

  const pePearlEconomy = useMemo((): { earned: number; spent: number; net: number; balance: number } => {
    return {
      earned: state.peStats.pearlsEarned,
      spent: state.peStats.pearlsSpent,
      net: state.peStats.pearlsEarned - state.peStats.pearlsSpent,
      balance: state.pePearls,
    };
  }, [state]);

  // ── Search / Filter Helpers ────────────────────────────────────────────────

  const peSearchSerpents = useCallback((query: string): PeSerpentDef[] => {
    const lowerQuery = query.toLowerCase();
    return PE_SERPENTS.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.description.toLowerCase().includes(lowerQuery) ||
        s.species.toLowerCase().includes(lowerQuery) ||
        s.lore.toLowerCase().includes(lowerQuery)
    );
  }, []);

  const peSearchTrenches = useCallback((query: string): PeTrenchDef[] => {
    const lowerQuery = query.toLowerCase();
    return PE_TRENCHES.filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery)
    );
  }, []);

  const peSearchMaterials = useCallback((query: string): PeMaterialDef[] => {
    const lowerQuery = query.toLowerCase();
    return PE_MATERIALS.filter(
      (m) =>
        m.name.toLowerCase().includes(lowerQuery) ||
        m.description.toLowerCase().includes(lowerQuery) ||
        m.lore.toLowerCase().includes(lowerQuery)
    );
  }, []);

  const peSearchStructures = useCallback((query: string): PeStructureDef[] => {
    const lowerQuery = query.toLowerCase();
    return PE_STRUCTURES.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.description.toLowerCase().includes(lowerQuery)
    );
  }, []);

  const peSearchAbilities = useCallback((query: string): PeAbilityDef[] => {
    const lowerQuery = query.toLowerCase();
    return PE_ABILITIES.filter(
      (a) =>
        a.name.toLowerCase().includes(lowerQuery) ||
        a.description.toLowerCase().includes(lowerQuery)
    );
  }, []);

  const peSearchArtifacts = useCallback((query: string): PeArtifactDef[] => {
    const lowerQuery = query.toLowerCase();
    return PE_ARTIFACTS.filter(
      (a) =>
        a.name.toLowerCase().includes(lowerQuery) ||
        a.description.toLowerCase().includes(lowerQuery) ||
        a.lore.toLowerCase().includes(lowerQuery)
    );
  }, []);

  const peSearchAchievements = useCallback((query: string): PeAchievementDef[] => {
    const lowerQuery = query.toLowerCase();
    return PE_ACHIEVEMENTS.filter(
      (a) =>
        a.name.toLowerCase().includes(lowerQuery) ||
        a.description.toLowerCase().includes(lowerQuery)
    );
  }, []);

  // ── Collection Completeness Helpers ─────────────────────────────────────────

  const peGetCollectionCompleteness = useCallback((): {
    serpents: { total: number; collected: number; percent: number };
    trenches: { total: number; explored: number; percent: number };
    materials: { total: number; unique: number; percent: number };
    artifacts: { total: number; active: number; percent: number };
    achievements: { total: number; unlocked: number; percent: number };
    structures: { total: number; built: number; percent: number };
  } => {
    const s = stateRef.current;
    const tamedCount = Object.values(s.peSerpents).filter((x) => x.tamed).length;
    const exploredCount = Object.values(s.peTrenches).filter((x) => x.explored).length;
    const builtCount = Object.values(s.peStructures).filter((x) => x.built).length;
    return {
      serpents: { total: PE_SERPENTS.length, collected: tamedCount, percent: Math.floor((tamedCount / PE_SERPENTS.length) * 100) },
      trenches: { total: PE_TRENCHES.length, explored: exploredCount, percent: Math.floor((exploredCount / PE_TRENCHES.length) * 100) },
      materials: { total: PE_MATERIALS.length, unique: s.peInventory.length, percent: Math.floor((s.peInventory.length / PE_MATERIALS.length) * 100) },
      artifacts: { total: PE_ARTIFACTS.length, active: s.peArtifacts.length, percent: Math.floor((s.peArtifacts.length / PE_ARTIFACTS.length) * 100) },
      achievements: { total: PE_ACHIEVEMENTS.length, unlocked: s.peAchievements.length, percent: Math.floor((s.peAchievements.length / PE_ACHIEVEMENTS.length) * 100) },
      structures: { total: PE_STRUCTURES.length, built: builtCount, percent: Math.floor((builtCount / PE_STRUCTURES.length) * 100) },
    };
  }, []);

  // ── Serpent Stat Comparison Helpers ─────────────────────────────────────────

  const peCompareSerpentStats = useCallback((idA: string, idB: string): { hp: number; attack: number; defense: number; speed: number; power: number } | null => {
    const defA = PE_SERPENTS.find((s) => s.id === idA);
    const defB = PE_SERPENTS.find((s) => s.id === idB);
    const stA = stateRef.current.peSerpents[idA];
    const stB = stateRef.current.peSerpents[idB];
    if (!defA || !defB || !stA || !stB) return null;
    const powerA = peCalculateSerpentPower(defA, stA);
    const powerB = peCalculateSerpentPower(defB, stB);
    return {
      hp: defA.hp - defB.hp,
      attack: defA.attack - defB.attack,
      defense: defA.defense - defB.defense,
      speed: defA.speed - defB.speed,
      power: powerA - powerB,
    };
  }, []);

  const peGetSerpentWithHighestStat = useCallback((stat: 'hp' | 'attack' | 'defense' | 'speed'): PeSerpentDef | undefined => {
    return PE_SERPENTS.reduce((best, current) => {
      if (!best) return current;
      return current[stat] > best[stat] ? current : best;
    }, undefined as PeSerpentDef | undefined);
  }, []);

  const peGetSpeciesWithMostTamed = useCallback((): PeSerpentSpecies | null => {
 const counts: Record<PeSerpentSpecies, number> = {
      pearl_dragon: 0,
      abyssal_eel: 0,
      coral_viper: 0,
      sea_wraith: 0,
      depth_leviathan: 0,
      shell_golem: 0,
      pearl_queen: 0,
    };
    for (const def of PE_SERPENTS) {
      const st = stateRef.current.peSerpents[def.id];
      if (st && st.tamed) {
        counts[def.species]++;
      }
    }
    let bestSpecies: PeSerpentSpecies | null = null;
    let bestCount = 0;
    for (const [species, count] of Object.entries(counts)) {
      if (count > bestCount) {
        bestCount = count;
        bestSpecies = species as PeSerpentSpecies;
      }
    }
    return bestSpecies;
  }, []);

  // ── Trench Stat Helpers ────────────────────────────────────────────────────

  const peGetTotalDivesAcrossTrenches = useCallback((): number => {
    let total = 0;
    for (const def of PE_TRENCHES) {
      const st = stateRef.current.peTrenches[def.id];
      if (st) {
        total += st.divesCompleted;
      }
    }
    return total;
  }, []);

  const peGetTrenchResourceSummary = useCallback((id: string): { resources: PeMaterialDef[]; available: boolean } => {
    const def = PE_TRENCHES.find((t) => t.id === id);
    if (!def) return { resources: [], available: false };
    const materials = def.resources
      .map((rId) => PE_MATERIALS.find((m) => m.id === rId))
      .filter((m): m is PeMaterialDef => m !== undefined);
    const st = stateRef.current.peTrenches[id];
    return { resources: materials, available: st ? st.explored : false };
  }, []);

  // ── Ability Tree Helpers ───────────────────────────────────────────────────

  const peGetAbilityPrerequisites = useCallback((id: string): PeAbilityDef[] => {
    const def = PE_ABILITIES.find((a) => a.id === id);
    if (!def) return [];
    return def.prerequisites
      .map((pId) => PE_ABILITIES.find((a) => a.id === pId))
      .filter((a): a is PeAbilityDef => a !== undefined);
  }, []);

  const peGetAbilitiesThatRequire = useCallback((id: string): PeAbilityDef[] => {
    return PE_ABILITIES.filter((a) => a.prerequisites.includes(id));
  }, []);

  const peGetAbilitiesWithNoPrerequisites = useCallback((): PeAbilityDef[] => {
    return PE_ABILITIES.filter((a) => a.prerequisites.length === 0);
  }, []);

  const peGetHighestPowerAbility = useCallback((): PeAbilityDef | undefined => {
    return PE_ABILITIES.reduce((best, current) => {
      if (!best) return current;
      return current.power > best.power ? current : best;
    }, undefined as PeAbilityDef | undefined);
  }, []);

  const peGetLowestCooldownAbility = useCallback((): PeAbilityDef | undefined => {
    const active = PE_ABILITIES.filter((a) => a.cooldown > 0);
    return active.reduce((best, current) => {
      if (!best) return current;
      return current.cooldown < best.cooldown ? current : best;
    }, undefined as PeAbilityDef | undefined);
  }, []);

  // ── Validation Helpers ─────────────────────────────────────────────────────

  const peIsValidSerpentId = useCallback((id: string): boolean => {
    return PE_SERPENTS.some((s) => s.id === id);
  }, []);

  const peIsValidTrenchId = useCallback((id: string): boolean => {
    return PE_TRENCHES.some((t) => t.id === id);
  }, []);

  const peIsValidMaterialId = useCallback((id: string): boolean => {
    return PE_MATERIALS.some((m) => m.id === id);
  }, []);

  const peIsValidStructureId = useCallback((id: string): boolean => {
    return PE_STRUCTURES.some((s) => s.id === id);
  }, []);

  const peIsValidAbilityId = useCallback((id: string): boolean => {
    return PE_ABILITIES.some((a) => a.id === id);
  }, []);

  const peIsValidArtifactId = useCallback((id: string): boolean => {
    return PE_ARTIFACTS.some((a) => a.id === id);
  }, []);

  const peIsValidEventId = useCallback((id: string): boolean => {
    return PE_EVENTS.some((e) => e.id === id);
  }, []);

  const peIsValidAchievementId = useCallback((id: string): boolean => {
    return PE_ACHIEVEMENTS.some((a) => a.id === id);
  }, []);

  // ── Material Rarity Tiers ──────────────────────────────────────────────────

  const peGetMaterialRarityTiers = useCallback((): { rarity: PeRarity; count: number; materials: PeMaterialDef[] }[] => {
    const tiers: PeRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    return tiers.map((rarity) => {
      const materials = PE_MATERIALS.filter((m) => m.rarity === rarity);
      return { rarity, count: materials.length, materials };
    });
  }, []);

  const peGetSerpentRarityTiers = useCallback((): { rarity: PeRarity; count: number; tamedCount: number; serpents: PeSerpentDef[] }[] => {
    const tiers: PeRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const s = stateRef.current;
    return tiers.map((rarity) => {
      const serpents = PE_SERPENTS.filter((def) => def.rarity === rarity);
      const tamedCount = serpents.filter((def) => {
        const st = s.peSerpents[def.id];
        return st && st.tamed;
      }).length;
      return { rarity, count: serpents.length, tamedCount, serpents };
    });
  }, []);

  const peGetEventRarityTiers = useCallback((): { rarity: PeRarity; count: number; events: PeEventDef[] }[] => {
    const tiers: PeRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    return tiers.map((rarity) => {
      const events = PE_EVENTS.filter((e) => e.rarity === rarity);
      return { rarity, count: events.length, events };
    });
  }, []);

  const peGetArtifactRarityTiers = useCallback((): { rarity: PeRarity; count: number; totalPower: number; artifacts: PeArtifactDef[] }[] => {
    const tiers: PeRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    return tiers.map((rarity) => {
      const artifacts = PE_ARTIFACTS.filter((a) => a.rarity === rarity);
      const totalPower = artifacts.reduce((sum, a) => sum + a.power, 0);
      return { rarity, count: artifacts.length, totalPower, artifacts };
    });
  }, []);

  // ── Bulk Summary Helpers ───────────────────────────────────────────────────

  const peGetFullGameStateSummary = useCallback((): {
    totalSerpents: number;
    tamedSerpents: number;
    totalTrenches: number;
    exploredTrenches: number;
    totalMaterials: number;
    inventoryItems: number;
    totalArtifacts: number;
    activeArtifacts: number;
    totalAchievements: number;
    unlockedAchievements: number;
    totalStructures: number;
    builtStructures: number;
    totalAbilities: number;
    totalEvents: number;
    triggeredEvents: number;
    currentTitle: string;
    pearlBalance: number;
    totalPearlsEarned: number;
    totalPearlsSpent: number;
    highestDepth: number;
    totalDives: number;
  } => {
    const s = stateRef.current;
    const builtCount = Object.values(s.peStructures).filter((x) => x.built).length;
    return {
      totalSerpents: PE_SERPENTS.length,
      tamedSerpents: s.peStats.totalTamed,
      totalTrenches: PE_TRENCHES.length,
      exploredTrenches: Object.values(s.peTrenches).filter((x) => x.explored).length,
      totalMaterials: PE_MATERIALS.length,
      inventoryItems: s.peInventory.length,
      totalArtifacts: PE_ARTIFACTS.length,
      activeArtifacts: s.peArtifacts.length,
      totalAchievements: PE_ACHIEVEMENTS.length,
      unlockedAchievements: s.peAchievements.length,
      totalStructures: PE_STRUCTURES.length,
      builtStructures: builtCount,
      totalAbilities: PE_ABILITIES.length,
      totalEvents: PE_EVENTS.length,
      triggeredEvents: s.peEvents.length,
      currentTitle: s.peTitle,
      pearlBalance: s.pePearls,
      totalPearlsEarned: s.peStats.pearlsEarned,
      totalPearlsSpent: s.peStats.pearlsSpent,
      highestDepth: s.peStats.highestDepth,
      totalDives: s.peStats.totalDived,
    };
  }, []);

  // ── Can-* Helpers ───────────────────────────────────────────────────────────

  const peCanTame = useCallback((id: string): boolean => {
    const def = PE_SERPENTS.find((s) => s.id === id);
    if (!def) return false;
    const st = stateRef.current.peSerpents[id];
    if (st && st.tamed) return false;
    return true;
  }, []);

  const peCanDive = useCallback((id: string): boolean => {
    const def = PE_TRENCHES.find((t) => t.id === id);
    if (!def) return false;
    return true;
  }, []);

  const peCanBuild = useCallback((id: string): boolean => {
    const def = PE_STRUCTURES.find((s) => s.id === id);
    if (!def) return false;
    const st = stateRef.current.peStructures[id];
    if (st && st.built) return false;
    if (stateRef.current.pePearls < def.baseCost) return false;
    return true;
  }, []);

  const peCanActivateArtifact = useCallback((id: string): boolean => {
    const def = PE_ARTIFACTS.find((a) => a.id === id);
    if (!def) return false;
    if (stateRef.current.peArtifacts.includes(id)) return false;
    return true;
  }, []);

  const peCanUpgradeStructure = useCallback((id: string): boolean => {
    const def = PE_STRUCTURES.find((s) => s.id === id);
    if (!def) return false;
    const st = stateRef.current.peStructures[id];
    if (!st || !st.built) return false;
    if (st.level >= def.maxLevel) return false;
    const cost = peCalculateUpgradeCost(def, st.level);
    if (stateRef.current.pePearls < cost) return false;
    return true;
  }, []);

  // ── API Object ─────────────────────────────────────────────────────────────

  const peAPI = {
    // Constants — Pattern A: directly on the API object
    PE_SERPENTS,
    PE_TRENCHES,
    PE_MATERIALS,
    PE_STRUCTURES,
    PE_ABILITIES,
    PE_ACHIEVEMENTS,
    PE_TITLES,
    PE_ARTIFACTS,
    PE_EVENTS,
    PE_COLOR_PEARL_WHITE,
    PE_COLOR_ABYSS_BLUE,
    PE_COLOR_CORAL_PINK,
    PE_COLOR_SHELL_PINK,
    PE_COLOR_DEEP_MIDNIGHT,
    PE_COLOR_IRIDESCENT,
    PE_COLOR_NACRE_GOLD,
    PE_COLOR_VOID_BLACK,
    PE_COLOR_BIOLUM_CYAN,
    PE_COLOR_SUNKEN_GREEN,

    // State
    state,

    // Actions
    tameSerpent,
    diveTrench,
    buildStructure,
    activateArtifact,
    triggerAbyssEvent,
    resetPearlAbyss,

    // Accessors
    peGetState,
    peGetStats,
    peGetTitle,
    peGetInventory,
    peGetArtifacts,
    peGetAchievements,
    peGetEvents,
    peGetPearls,
    peGetExperience,
    peGetLevel,
    peGetSerpentState,
    peGetTrenchState,
    peGetStructureState,
    peGetAchievementProgress,
    peIsSerpentTamed,
    peIsTrenchExplored,
    peIsArtifactActive,
    peIsAchievementUnlocked,
    peIsStructureBuilt,
    peGetTamedCount,
    peGetDiveCount,
    peGetHighestDepth,

    // Lookup helpers
    peGetSerpentDef,
    peGetTrenchDef,
    peGetMaterialDef,
    peGetStructureDef,
    peGetAbilityDef,
    peGetArtifactDef,
    peGetEventDef,
    peGetAchievementDef,
    peGetTitleDef,
    peGetSerpentsByRarity,
    peGetSerpentsBySpecies,
    peGetMaterialsByRarity,
    peGetMaterialsBySource,
    peGetAbilitiesByType,
    peGetArtifactsByRarity,
    peGetStructuresByCategory,
    peGetEventsBySeverity,
    peGetTamedSerpents,
    peGetExploredTrenches,
    peGetActiveArtifacts,
    peGetUnlockedAchievements,
    peGetBuiltStructures,
    peGetLockedSerpents,
    peGetUnexploredTrenches,
    peGetInactiveArtifacts,
    peGetLockedAchievements,
    peGetUnbuiltStructures,
    peGetCurrentTitleDef,
    peGetEligibleTitle,
    peGetSerpentPower,
    peGetTameChance,
    peGetDiveRewardPreview,
    peGetUpgradeCost,
    peGetStructureMaxLevel,
    peGetEventByIdx,

    // Derived / Computed
    peTameProgress,
    peExploreProgress,
    peArtifactProgress,
    peAchievementProgress,
    peStructureProgress,
    peInventorySize,
    peTotalMaterials,
    peRaritySummary,
    peSpeciesSummary,
    peTopSerpents,
    peDeepestTrench,
    peActiveEventCount,
    peMostRecentEvent,
    pePowerRanking,
    peHighestRarityTamed,
    peAbilitiesSummary,
    peEventHistorySummary,
    peMaterialsInventorySummary,
    peNextTitle,
    peOverallProgress,
    peTotalSerpentPower,
    peTotalArtifactPower,
    peAverageSerpentLoyalty,
    peTotalDivePearlsEarned,
    peTotalPearlsSpent,
    peNetPearlWealth,
    peMostDivedTrench,
    peStrongestSerpent,
    peLatestTamedSerpent,
    peTrenchDepthRecords,
    peStructureLevelSummary,
    peEventSeveritySummary,
    pePearlEconomy,

    // Can-* helpers
    peCanTame,
    peCanDive,
    peCanBuild,
    peCanActivateArtifact,
    peCanUpgradeStructure,

    // Search / Filter helpers
    peSearchSerpents,
    peSearchTrenches,
    peSearchMaterials,
    peSearchStructures,
    peSearchAbilities,
    peSearchArtifacts,
    peSearchAchievements,

    // Collection completeness
    peGetCollectionCompleteness,

    // Serpent comparison
    peCompareSerpentStats,
    peGetSerpentWithHighestStat,
    peGetSpeciesWithMostTamed,

    // Trench stats
    peGetTotalDivesAcrossTrenches,
    peGetTrenchResourceSummary,

    // Ability tree
    peGetAbilityPrerequisites,
    peGetAbilitiesThatRequire,
    peGetAbilitiesWithNoPrerequisites,
    peGetHighestPowerAbility,
    peGetLowestCooldownAbility,

    // Validation
    peIsValidSerpentId,
    peIsValidTrenchId,
    peIsValidMaterialId,
    peIsValidStructureId,
    peIsValidAbilityId,
    peIsValidArtifactId,
    peIsValidEventId,
    peIsValidAchievementId,

    // Rarity tiers
    peGetMaterialRarityTiers,
    peGetSerpentRarityTiers,
    peGetEventRarityTiers,
    peGetArtifactRarityTiers,

    // Bulk summary
    peGetFullGameStateSummary,
  };

  return peAPI;
}
