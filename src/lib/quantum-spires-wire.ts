/**
 * Quantum Spires Wire — Quantum Spires (量子尖塔) feature module
 *
 * Towering quantum crystalline structures that exist in superposition.
 * Players command 35 quantum entities across 5 rarity tiers and 7 species,
 * explore 8 towering spires, harvest 30 quantum materials, construct 25
 * upgradeable structures, master 22 quantum abilities, earn 18 achievements,
 * unlock 8 progression titles (Observer → Quantum Deity), activate 15
 * legendary artifacts, and respond to 12 quantum events — backed by a
 * Zustand store with persist middleware.
 *
 * Storage key: quantum-spires-wire
 * Prefix: QS_ / qs
 * Color theme: quantum cyan #00FFFF, spire gold #FFD700, flux violet #8A2BE2, wave blue #4169E1
 */

import { useMemo, useEffect, useRef } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type QSRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type QSEntitySpecies =
  | 'photon_golem'
  | 'qubit_drone'
  | 'wave_specter'
  | 'quantum_cat'
  | 'flux_phantom'
  | 'string_theorist'
  | 'spark_nymph'

export interface QSEntityDef {
  readonly id: string
  readonly name: string
  readonly nameZh: string
  readonly species: QSEntitySpecies
  readonly rarity: QSRarity
  readonly power: number
  readonly defense: number
  readonly coherence: number
  readonly cost: number
  readonly description: string
}

export interface QSSpireDef {
  readonly id: string
  readonly name: string
  readonly nameZh: string
  readonly height: number
  readonly stability: number
  readonly resonance: string[]
  readonly description: string
  readonly color: string
}

export interface QSMaterialDef {
  readonly id: string
  readonly name: string
  readonly nameZh: string
  readonly rarity: QSRarity
  readonly category: 'crystal' | 'particle' | 'wave' | 'flux' | 'exotic'
  readonly description: string
  readonly value: number
  readonly color: string
}

export interface QSStructureDef {
  readonly id: string
  readonly name: string
  readonly nameZh: string
  readonly maxLevel: number
  readonly costPerLevel: number
  readonly bonusPerLevel: number
  readonly description: string
  readonly color: string
}

export interface QSAbilityDef {
  readonly id: string
  readonly name: string
  readonly nameZh: string
  readonly type: 'active' | 'passive' | 'toggle' | 'burst'
  readonly power: number
  readonly cooldown: number
  readonly cost: number
  readonly description: string
  readonly color: string
}

export interface QSAchievementDef {
  readonly id: string
  readonly name: string
  readonly nameZh: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface QSTitleDef {
  readonly id: string
  readonly name: string
  readonly nameZh: string
  readonly requirement: string
  readonly bonusPercent: number
}

export interface QSArtifactDef {
  readonly id: string
  readonly name: string
  readonly nameZh: string
  readonly description: string
  readonly bonus: string
  readonly power: number
  readonly rarity: QSRarity
}

export interface QSEventDef {
  readonly id: string
  readonly name: string
  readonly nameZh: string
  readonly description: string
  readonly effect: string
  readonly severity: number
}

export interface EntityState {
  awakened: boolean
  level: number
  coherence: number
}

export interface SpireState {
  level: number
  active: boolean
  resonance: number
}

export interface QuantumSpiresState {
  qsEntities: Record<string, EntityState>
  qsSpires: Record<string, SpireState>
  qsMaterials: Record<string, number>
  qsArtifacts: string[]
  qsAchievements: string[]
  qsTitle: string
  qsEvents: string[]
  qsStructures: Record<string, number>
  qsStats: {
    totalAwakened: number
    totalEntanglements: number
    totalCollapses: number
    totalTunnels: number
    totalFluxGenerated: number
  }
  qsQuantumFlux: number
  qsLevel: number
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME & RARITY CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const QS_QUANTUM_CYAN = '#00FFFF'
export const QS_SPIRE_GOLD = '#FFD700'
export const QS_FLUX_VIOLET = '#8A2BE2'
export const QS_WAVE_BLUE = '#4169E1'
export const QS_DEEP_VOID = '#0A0A1A'
export const QS_SUPERPOSITION_WHITE = '#F0FFFF'
export const QS_ENTANGLE_PURPLE = '#9370DB'
export const QS_DECOHERENCE_RED = '#DC143C'
export const QS_TENSOR_GREEN = '#00FA9A'
export const QS_PLANCK_SILVER = '#C0C0C0'

export const QS_THEME = {
  primary: QS_QUANTUM_CYAN,
  secondary: QS_SPIRE_GOLD,
  tertiary: QS_FLUX_VIOLET,
  accent: QS_WAVE_BLUE,
} as const

export const QS_RARITIES: readonly {
  id: QSRarity
  name: string
  nameCn: string
  color: string
  multiplier: number
}[] = [
  { id: 'common', name: 'Common', nameCn: '普通', color: '#A0AEC0', multiplier: 1 },
  { id: 'uncommon', name: 'Uncommon', nameCn: '稀有', color: '#48BB78', multiplier: 1.5 },
  { id: 'rare', name: 'Rare', nameCn: '精良', color: QS_WAVE_BLUE, multiplier: 2.5 },
  { id: 'epic', name: 'Epic', nameCn: '史诗', color: QS_FLUX_VIOLET, multiplier: 4 },
  { id: 'legendary', name: 'Legendary', nameCn: '传说', color: QS_SPIRE_GOLD, multiplier: 7 },
]

export const QS_SPECIES: readonly {
  id: QSEntitySpecies
  name: string
  nameCn: string
  basePower: number
  color: string
}[] = [
  { id: 'photon_golem', name: 'Photon Golem', nameCn: '光子魔像', basePower: 12, color: QS_QUANTUM_CYAN },
  { id: 'qubit_drone', name: 'Qubit Drone', nameCn: '量子比特无人机', basePower: 10, color: QS_WAVE_BLUE },
  { id: 'wave_specter', name: 'Wave Specter', nameCn: '波谱幽灵', basePower: 8, color: QS_ENTANGLE_PURPLE },
  { id: 'quantum_cat', name: 'Quantum Cat', nameCn: '量子猫', basePower: 14, color: QS_FLUX_VIOLET },
  { id: 'flux_phantom', name: 'Flux Phantom', nameCn: '通量幻影', basePower: 11, color: QS_DECOHERENCE_RED },
  { id: 'string_theorist', name: 'String Theorist', nameCn: '弦论学者', basePower: 9, color: QS_TENSOR_GREEN },
  { id: 'spark_nymph', name: 'Spark Nymph', nameCn: '火花精灵', basePower: 7, color: QS_SPIRE_GOLD },
]

export const QS_MAX_STRUCTURE_LEVEL = 10
export const QS_SPECIES_COUNT = 7
export const QS_RARITY_TIER_COUNT = 5

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: QS_ENTITIES — 35 Quantum Entities (7 species × 5 tiers)
// ═══════════════════════════════════════════════════════════════════

export const QS_ENTITIES: readonly QSEntityDef[] = [
  // ── Photon Golem (photon_golem) — 5 tiers ───────────────────
  {
    id: 'pg_crystal_sentinel',
    name: 'Crystal Sentinel',
    nameZh: '水晶哨兵',
    species: 'photon_golem',
    rarity: 'common',
    power: 12, defense: 15, coherence: 8,
    cost: 50,
    description:
      'A golem assembled from fractured photon crystals harvested at Superposition Peak. Its crystalline body refracts light into prismatic beams, creating dazzling illusions that confuse enemies. Though still bound to a single quantum state, it moves with the patience of a mountain waiting to collapse.',
  },
  {
    id: 'pg_prism_guardian',
    name: 'Prism Guardian',
    nameZh: '棱镜守卫',
    species: 'photon_golem',
    rarity: 'uncommon',
    power: 28, defense: 32, coherence: 18,
    cost: 200,
    description:
      'A golem whose body has been fused with a single massive prism crystal, allowing it to split incoming quantum attacks into harmless spectral components. Its movements create rainbow afterimages that linger in superposition for fractions of a second, disorienting anything that tracks visual motion.',
  },
  {
    id: 'photon_colossus',
    name: 'Photon Colossus',
    nameZh: '光子巨像',
    species: 'photon_golem',
    rarity: 'rare',
    power: 58, defense: 65, coherence: 35,
    cost: 800,
    description:
      'A towering construct of pure photonic crystal that stands twelve meters tall and radiates blinding cyan light. The Colossus exists in a partial superposition at all times, its multiple ghostly forms overlapping and reinforcing each other. Any attack that destroys one form finds the others still standing.',
  },
  {
    id: 'pg_radiance_titan',
    name: 'Radiance Titan',
    nameZh: '光辉泰坦',
    species: 'photon_golem',
    rarity: 'epic',
    power: 120, defense: 135, coherence: 72,
    cost: 3000,
    description:
      'An ancient golem imbued with the concentrated light of a thousand collapsed wave functions. Its crystalline core pulses with stored photon energy, releasing devastating beams of coherent light on command. The Titan can phase between visible and invisible spectrums at will, making it both a devastating attacker and an elusive defender.',
  },
  {
    id: 'pg_eternal_prism',
    name: 'Eternal Prism — Legendary Golem',
    nameZh: '永恒棱镜',
    species: 'photon_golem',
    rarity: 'legendary',
    power: 250, defense: 280, coherence: 150,
    cost: 12000,
    description:
      'A golem forged from a shard of the original quantum crystal that existed before the universe cooled. The Eternal Prism contains within it every possible color that ever was or will be, and its mere presence stabilizes the quantum states of all entities within a kilometer. It is said that when it walks, reality itself refracts around its feet.',
  },

  // ── Qubit Drone (qubit_drone) — 5 tiers ────────────────────
  {
    id: 'qd_recon_particle',
    name: 'Recon Particle',
    nameZh: '侦察粒子',
    species: 'qubit_drone',
    rarity: 'common',
    power: 10, defense: 6, coherence: 14,
    cost: 45,
    description:
      'A small autonomous drone built around a single stabilized qubit. It zips through the quantum landscape at superluminal speeds, mapping terrain and identifying threats before they materialize. Its tiny quantum processor can maintain coherence for hours despite environmental noise.',
  },
  {
    id: 'qd_binary_scout',
    name: 'Binary Scout',
    nameZh: '二进制斥候',
    species: 'qubit_drone',
    rarity: 'uncommon',
    power: 22, defense: 12, coherence: 30,
    cost: 180,
    description:
      'An upgraded drone housing two entangled qubits that communicate instantaneously across any distance. The Binary Scout can be in two places simultaneously, sending real-time telemetry from both locations. Its dual quantum cores allow it to process parallel data streams without decoherence.',
  },
  {
    id: 'qd_quantum_swarm',
    name: 'Quantum Swarm',
    nameZh: '量子蜂群',
    species: 'qubit_drone',
    rarity: 'rare',
    power: 48, defense: 20, coherence: 55,
    cost: 750,
    description:
      'Not a single drone but a coordinated swarm of dozens of micro-drones linked by a shared quantum entanglement field. The swarm moves as one organism, each unit aware of every other unit\'s position and state. Individually fragile, together they form a distributed intelligence that can solve complex problems in quantum time.',
  },
  {
    id: 'qd_hypercube_pilot',
    name: 'Hypercube Pilot',
    nameZh: '超立方领航员',
    species: 'qubit_drone',
    rarity: 'epic',
    power: 100, defense: 42, coherence: 110,
    cost: 2800,
    description:
      'A sentient drone that has evolved beyond its programming, achieving quantum consciousness through recursive self-optimization. The Hypercube Pilot can navigate higher-dimensional spaces, perceiving the quantum spires from angles that no three-dimensional mind can comprehend. It pilots itself through probability tunnels with perfect accuracy.',
  },
  {
    id: 'qd_infinity_core',
    name: 'Infinity Core — Legendary Drone',
    nameZh: '无穷核心',
    species: 'qubit_drone',
    rarity: 'legendary',
    power: 220, defense: 90, coherence: 240,
    cost: 11000,
    description:
      'A drone whose quantum processor has achieved infinite superposition — it simultaneously exists in every possible configuration. The Infinity Core can compute the answer to any question before the question is asked, and its entanglement web connects every qubit drone in existence into a single vast consciousness that spans the quantum realm.',
  },

  // ── Wave Specter (wave_specter) — 5 tiers ──────────────────
  {
    id: 'ws_ripple_wraith',
    name: 'Ripple Wraith',
    nameZh: '涟漪幽魂',
    species: 'wave_specter',
    rarity: 'common',
    power: 8, defense: 5, coherence: 18,
    cost: 40,
    description:
      'A ghostly entity formed from probability wave ripples at the edge of Wavefunction Spire. It has no solid form, existing as a shifting interference pattern that can pass through matter. Its touch causes quantum uncertainty, making targets unable to commit to any single action.',
  },
  {
    id: 'ws_interference_phantom',
    name: 'Interference Phantom',
    nameZh: '干涉幻灵',
    species: 'wave_specter',
    rarity: 'uncommon',
    power: 18, defense: 10, coherence: 35,
    cost: 170,
    description:
      'A specter that has learned to amplify its wave function through constructive interference. When multiple phantoms overlap, their combined wave amplitude creates devastating probability spikes that can collapse enemy wave functions. The Phantom dances between destructive and constructive patterns with hypnotic grace.',
  },
  {
    id: 'ws_probability_specter',
    name: 'Probability Specter',
    nameZh: '概率幽魂',
    species: 'wave_specter',
    rarity: 'rare',
    power: 40, defense: 18, coherence: 62,
    cost: 700,
    description:
      'An advanced specter that exists as a cloud of probability rather than a discrete entity. Any attack has only a statistical chance of hitting it, and it can shift its probability distribution to make itself nearly impossible to target. The Probability Specter feeds on the uncertainty it generates in its opponents.',
  },
  {
    id: 'ws_waveform_sovereign',
    name: 'Waveform Sovereign',
    nameZh: '波形君主',
    species: 'wave_specter',
    rarity: 'epic',
    power: 85, defense: 38, coherence: 125,
    cost: 2700,
    description:
      'A specter of such refined wave mechanics that it exists simultaneously across every point in a probability distribution. The Waveform Sovereign commands lesser specters by modulating their wave functions, creating complex interference patterns that reshape the quantum landscape itself. Reality bends around it like light around a black hole.',
  },
  {
    id: 'ws_omniscient_wave',
    name: 'Omniscient Wave — Legendary Specter',
    nameZh: '全知之波',
    species: 'wave_specter',
    rarity: 'legendary',
    power: 190, defense: 80, coherence: 270,
    cost: 10500,
    description:
      'A specter that has merged with the universal wave function itself. It perceives every quantum possibility simultaneously and can collapse any wave function it touches into any desired outcome. The Omniscient Wave is neither alive nor dead, neither here nor there — it is the ghost of quantum mechanics made manifest.',
  },

  // ── Quantum Cat (quantum_cat) — 5 tiers ───────────────────
  {
    id: 'qc_schrödinger_kitten',
    name: 'Schrödinger Kitten',
    nameZh: '薛定谔幼猫',
    species: 'quantum_cat',
    rarity: 'common',
    power: 14, defense: 8, coherence: 10,
    cost: 55,
    description:
      'A playful quantum feline that exists in a superposition of being both awake and asleep simultaneously. The Kitten\'s curious nature causes it to probe every quantum state it encounters, often triggering unexpected wave collapses with its paw. Despite its apparent randomness, it always lands on its feet in every possible reality.',
  },
  {
    id: 'qc_paradox_feline',
    name: 'Paradox Feline',
    nameZh: '悖论猫',
    species: 'quantum_cat',
    rarity: 'uncommon',
    power: 32, defense: 18, coherence: 22,
    cost: 220,
    description:
      'A cat that has mastered the art of existing in contradictory states simultaneously. The Paradox Feline can be both moving and stationary, both visible and invisible, without ever resolving the contradiction. Enemies find themselves unable to predict its actions because its behavior genuinely has no deterministic underlying pattern.',
  },
  {
    id: 'qc_cheshire_quantum',
    name: 'Cheshire Quantum',
    nameZh: '柴郡量子猫',
    species: 'quantum_cat',
    rarity: 'rare',
    power: 65, defense: 35, coherence: 40,
    cost: 850,
    description:
      'A cat that has learned to collapse only parts of its wave function at will. The Cheshire Quantum can fade away entirely, leaving only its grin hovering in the air — a probability echo that still exerts measurable quantum effects. Its grin alone is enough to destabilize enemy coherence by twenty percent.',
  },
  {
    id: 'qc_observer_cat',
    name: 'Observer Cat',
    nameZh: '观测者猫',
    species: 'quantum_cat',
    rarity: 'epic',
    power: 130, defense: 70, coherence: 85,
    cost: 3200,
    description:
      'A quantum cat that has transcended the observer effect — it can observe without collapsing. The Observer Cat walks freely through superposed states, perceiving every possibility without forcing any single outcome. Its gaze stabilizes quantum coherence in allies while selectively collapsing enemy states into their least favorable configurations.',
  },
  {
    id: 'qc_infinity_paradox',
    name: 'Infinity Paradox — Legendary Cat',
    nameZh: '无穷悖论',
    species: 'quantum_cat',
    rarity: 'legendary',
    power: 260, defense: 140, coherence: 170,
    cost: 13000,
    description:
      'A cat that exists in a paradox so profound it has become a fundamental law of the quantum realm. The Infinity Paradox is simultaneously every cat that has ever existed and every cat that will ever exist. It can undo any quantum measurement by retroactively placing the observed system back into superposition. To look upon it is to doubt the nature of reality itself.',
  },

  // ── Flux Phantom (flux_phantom) — 5 tiers ─────────────────
  {
    id: 'fp_flux_wisp',
    name: 'Flux Wisp',
    nameZh: '通量精灵',
    species: 'flux_phantom',
    rarity: 'common',
    power: 11, defense: 7, coherence: 12,
    cost: 48,
    description:
      'A wisp of condensed quantum flux that drifts through the gaps between spires. It absorbs ambient quantum fluctuations and converts them into protective energy fields. Though small and ephemeral, Flux Wisps are remarkably resilient — destroying one merely causes it to reform nearby from the same quantum noise.',
  },
  {
    id: 'fp_energy_specter',
    name: 'Energy Specter',
    nameZh: '能量幽灵',
    species: 'flux_phantom',
    rarity: 'uncommon',
    power: 24, defense: 15, coherence: 25,
    cost: 190,
    description:
      'A phantom that feeds on quantum flux energy, growing stronger as the quantum field becomes more turbulent. The Energy Specter channels absorbed flux into devastating discharges that bypass conventional defenses. During quantum storms, it becomes nearly unstoppable, its power amplified by the chaos.',
  },
  {
    id: 'fp_vortex_shade',
    name: 'Vortex Shade',
    nameZh: '涡旋暗影',
    species: 'flux_phantom',
    rarity: 'rare',
    power: 52, defense: 28, coherence: 48,
    cost: 780,
    description:
      'A phantom that generates its own quantum flux vortex, a spinning maelstrom of probability that draws in nearby entities and energy. The Vortex Shade can weaponize this vortex, launching concentrated flux projectiles that tear through dimensional barriers and leave residual quantum instability in their wake.',
  },
  {
    id: 'fp_flux_sovereign',
    name: 'Flux Sovereign',
    nameZh: '通量君王',
    species: 'flux_phantom',
    rarity: 'epic',
    power: 110, defense: 55, coherence: 95,
    cost: 2900,
    description:
      'A phantom lord that commands the flow of quantum flux across the entire spire network. The Flux Sovereign can redirect probability currents, starve enemy entities of coherence, and flood allied positions with stabilizing flux energy. It appears as a towering figure wreathed in crackling violet lightning.',
  },
  {
    id: 'fp_entropy_zero',
    name: 'Entropy Zero — Legendary Phantom',
    nameZh: '零熵之影',
    species: 'flux_phantom',
    rarity: 'legendary',
    power: 240, defense: 120, coherence: 200,
    cost: 12500,
    description:
      'A phantom that has achieved absolute zero entropy — a state of perfect quantum order that should be physically impossible. Entropy Zero radiates a field of anti-chaos that freezes all quantum fluctuations within its radius. Time itself slows in its presence as the universe struggles to process an entity that represents the reversal of thermodynamics.',
  },

  // ── String Theorist (string_theorist) — 5 tiers ────────────
  {
    id: 'st_harmonic_novice',
    name: 'Harmonic Novice',
    nameZh: '和声学徒',
    species: 'string_theorist',
    rarity: 'common',
    power: 9, defense: 10, coherence: 15,
    cost: 42,
    description:
      'A scholar who has just begun to perceive the vibrating strings that underlie all matter. The Harmonic Novice can pluck these cosmic strings with their mind, producing subtle resonance effects that strengthen quantum coherence in nearby entities. Their mathematical chants stabilize fragile superposition states.',
  },
  {
    id: 'st_resonance_acolyte',
    name: 'Resonance Acolyte',
    nameZh: '共鸣侍僧',
    species: 'string_theorist',
    rarity: 'uncommon',
    power: 20, defense: 22, coherence: 32,
    cost: 175,
    description:
      'An acolyte who has learned to match the resonant frequency of specific quantum strings, allowing them to selectively amplify or dampen vibrations. The Resonance Acolyte can tune an ally\'s wave function for perfect coherence or shatter an enemy\'s coherence with a precisely targeted discordant frequency.',
  },
  {
    id: 'st_dimension_weaver',
    name: 'Dimension Weaver',
    nameZh: '维度织者',
    species: 'string_theorist',
    rarity: 'rare',
    power: 42, defense: 45, coherence: 58,
    cost: 720,
    description:
      'A theorist who can perceive and manipulate the extra compactified dimensions predicted by string theory. The Dimension Weaver unravels the fabric of space at the quantum level, creating temporary passages through curled-up dimensions. Enemies find their attacks vanishing into extra dimensions before they can connect.',
  },
  {
    id: 'st_brane_master',
    name: 'Brane Master',
    nameZh: '膜大师',
    species: 'string_theorist',
    rarity: 'epic',
    power: 90, defense: 95, coherence: 115,
    cost: 3100,
    description:
      'A theorist who has ascended beyond individual strings to perceive the entire brane — the multidimensional surface on which our universe exists. The Brane Master can create localized distortions in the brane, bending space-time to deflect attacks, fold distances, and trap enemies in dimensional pockets from which there is no classical escape.',
  },
  {
    id: 'st_theory_of_everything',
    name: 'Theory of Everything — Legendary Theorist',
    nameZh: '万物理论',
    species: 'string_theorist',
    rarity: 'legendary',
    power: 230, defense: 245, coherence: 290,
    cost: 14000,
    description:
      'A theorist who has achieved the holy grail of physics — a complete unification of quantum mechanics and general relativity expressed as a single elegant equation. The Theory of Everything can rewrite the fundamental constants of nature within their sphere of influence, temporarily changing the speed of light or the strength of gravity. They stand at the intersection of all knowledge.',
  },

  // ── Spark Nymph (spark_nymph) — 5 tiers ────────────────────
  {
    id: 'sn_glimmer_sprite',
    name: 'Glimmer Sprite',
    nameZh: '微光精灵',
    species: 'spark_nymph',
    rarity: 'common',
    power: 7, defense: 4, coherence: 20,
    cost: 38,
    description:
      'A tiny sprite born from quantum sparks that fly between the crystal lattices of the spires. The Glimmer Sprite generates small amounts of quantum flux simply by existing, its joyful dance creating cascading coherence effects that benefit all nearby entities. It is considered good luck when one takes residence in your spire.',
  },
  {
    id: 'sn_aurora_fey',
    name: 'Aurora Fey',
    nameZh: '极光仙子',
    species: 'spark_nymph',
    rarity: 'uncommon',
    power: 16, defense: 9, coherence: 38,
    cost: 160,
    description:
      'A nymph that paints the quantum sky with auroral displays of entangled photon pairs. The Aurora Fey can create vast networks of quantum correlations that strengthen the coherence of every entity they touch. Their light displays are not merely beautiful — each aurora encodes useful quantum information.',
  },
  {
    id: 'sn_plasma_sylph',
    name: 'Plasma Sylph',
    nameZh: '等离子风灵',
    species: 'spark_nymph',
    rarity: 'rare',
    power: 36, defense: 16, coherence: 68,
    cost: 680,
    description:
      'A powerful nymph that dances within quantum plasma fields, channeling their energy into focused beams of coherent light. The Plasma Sylph can energize dormant quantum systems with a touch and has been known to single-handedly restart collapsed spire resonance chambers. They are the healers of the quantum realm.',
  },
  {
    id: 'sn_nova_dryad',
    name: 'Nova Dryad',
    nameZh: '新星树精',
    species: 'spark_nymph',
    rarity: 'epic',
    power: 78, defense: 32, coherence: 130,
    cost: 2600,
    description:
      'A nymph who has bonded with a quantum crystal tree that grows at the base of the tallest spire. The Nova Dryad channels the tree\'s ancient quantum energy through her being, creating bioluminescent effects that can heal even the most severely decohered entities. The tree\'s roots extend through every spire, connecting them all.',
  },
  {
    id: 'sn_primordial_spark',
    name: 'Primordial Spark — Legendary Nymph',
    nameZh: '原始火花',
    species: 'spark_nymph',
    rarity: 'legendary',
    power: 180, defense: 70, coherence: 320,
    cost: 10000,
    description:
      'A nymph who is the living embodiment of the first quantum fluctuation — the spark that initiated the Big Bang itself. The Primordial Spark carries within it the original quantum state of the universe, undiluted by thirteen billion years of decoherence. Her presence restores quantum coherence to absolute perfection, and her tears crystallize into quantum crystals of unmatched purity.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: QS_SPIRES — 8 Spire Locations
// ═══════════════════════════════════════════════════════════════════

export const QS_SPIRES: readonly QSSpireDef[] = [
  {
    id: 'superposition_peak',
    name: 'Superposition Peak',
    nameZh: '叠加峰',
    height: 1000,
    stability: 85,
    resonance: ['photon_golem', 'quantum_cat'],
    description:
      'The tallest spire in the quantum realm, Superposition Peak exists in every possible height simultaneously until observed. Its summit is wreathed in perpetual quantum fog, and climbers report seeing multiple versions of themselves arriving from different quantum branches. The peak generates massive coherence fields that stabilize all entities within its shadow.',
    color: QS_QUANTUM_CYAN,
  },
  {
    id: 'entanglement_tower',
    name: 'Entanglement Tower',
    nameZh: '纠缠塔',
    height: 850,
    stability: 90,
    resonance: ['qubit_drone', 'wave_specter'],
    description:
      'A spiraling tower of interlocked quantum crystals whose resonance creates natural entanglement pairs between any entities stationed here. The tower\'s twin spires — one physical, one in quantum shadow — are connected by entanglement threads that transmit information instantaneously. Scientists study its architecture to understand non-locality.',
    color: QS_ENTANGLE_PURPLE,
  },
  {
    id: 'wavefunction_spire',
    name: 'Wavefunction Spire',
    nameZh: '波函数尖塔',
    height: 920,
    stability: 80,
    resonance: ['wave_specter', 'spark_nymph'],
    description:
      'A spire that physically manifests the wave function of the entire quantum realm. Its crystalline walls ripple with probability waves, and observers can literally see quantum states shifting and evolving in real time. The Wavefunction Spire serves as the primary monitoring station for quantum coherence across all spires.',
    color: QS_WAVE_BLUE,
  },
  {
    id: 'decoherence_crag',
    name: 'Decoherence Crag',
    nameZh: '退相干崖',
    height: 650,
    stability: 45,
    resonance: ['flux_phantom', 'string_theorist'],
    description:
      'A jagged, unstable crag where quantum coherence goes to die. The Decoherence Crag is the most dangerous location in the quantum realm — entities stationed here must constantly fight against environmental decoherence. However, the flux energy harvested from collapsing wave functions makes it the richest resource node in the network.',
    color: QS_DECOHERENCE_RED,
  },
  {
    id: 'quantum_gate',
    name: 'Quantum Gate',
    nameZh: '量子门',
    height: 780,
    stability: 95,
    resonance: ['photon_golem', 'qubit_drone'],
    description:
      'A precision-engineered arch that serves as a controlled quantum logic gate for the entire spire network. The Quantum Gate processes and routes quantum information between spires, acting as the central switchboard of the quantum realm. Its perfect geometric proportions represent the mathematical ideal of quantum computation.',
    color: QS_TENSOR_GREEN,
  },
  {
    id: 'probability_nexus',
    name: 'Probability Nexus',
    nameZh: '概率枢纽',
    height: 880,
    stability: 75,
    resonance: ['quantum_cat', 'flux_phantom'],
    description:
      'A nexus point where probability distributions from across the multiverse converge and intersect. At the Probability Nexus, unlikely events become common and impossible events become merely improbable. Entities here can tap into alternate probability streams, borrowing favorable outcomes from parallel quantum branches to influence their own timeline.',
    color: QS_FLUX_VIOLET,
  },
  {
    id: 'tensor_spire',
    name: 'Tensor Spire',
    nameZh: '张量尖塔',
    height: 950,
    stability: 88,
    resonance: ['string_theorist', 'spark_nymph'],
    description:
      'A spire that processes quantum information through tensor networks — vast webs of interconnected quantum states that perform calculations impossible for classical computers. The Tensor Spire is the intellectual heart of the quantum realm, home to the most advanced quantum computations ever attempted. Its green glow is the color of pure computation.',
    color: QS_TENSOR_GREEN,
  },
  {
    id: 'planck_heights',
    name: 'Planck Heights',
    nameZh: '普朗克高地',
    height: 1200,
    stability: 99,
    resonance: ['photon_golem', 'string_theorist', 'quantum_cat'],
    description:
      'The most sacred location in the quantum realm, Planck Heights exists at the boundary between quantum mechanics and gravity. At this scale, spacetime itself becomes quantized, and the fabric of reality can be directly manipulated. Only the most powerful entities can withstand the extreme conditions here, but those who do gain insights into the deepest secrets of physics.',
    color: QS_PLANCK_SILVER,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: QS_MATERIALS — 30 Quantum Materials
// ═══════════════════════════════════════════════════════════════════

export const QS_MATERIALS: readonly QSMaterialDef[] = [
  // Crystal Materials (8)
  {
    id: 'quantum_crystal',
    name: 'Quantum Crystal',
    nameZh: '量子水晶',
    rarity: 'common',
    category: 'crystal',
    description: 'A naturally occurring crystal with intrinsic quantum properties. Its lattice structure exhibits superposition at the molecular level, making it the foundation of all quantum construction.',
    value: 5,
    color: QS_QUANTUM_CYAN,
  },
  {
    id: 'photon_dust',
    name: 'Photon Dust',
    nameZh: '光子尘',
    rarity: 'common',
    category: 'crystal',
    description: 'Fine crystalline powder left behind when a quantum crystal undergoes partial wave collapse. It retains traces of photonic energy and glows faintly in the dark.',
    value: 4,
    color: '#E0FFFF',
  },
  {
    id: 'coherence_shard',
    name: 'Coherence Shard',
    nameZh: '相干碎片',
    rarity: 'uncommon',
    category: 'crystal',
    description: 'A crystal fragment that maintains quantum coherence far longer than normal. It can be used to stabilize other quantum systems, extending their coherence times by orders of magnitude.',
    value: 25,
    color: '#00CED1',
  },
  {
    id: 'probability_shard',
    name: 'Probability Shard',
    nameZh: '概率碎片',
    rarity: 'uncommon',
    category: 'crystal',
    description: 'A crystal that exists in a superposition of multiple shapes simultaneously. When incorporated into structures, it creates probability fields that favor beneficial outcomes.',
    value: 30,
    color: QS_FLUX_VIOLET,
  },
  {
    id: 'entanglement_gem',
    name: 'Entanglement Gem',
    nameZh: '纠缠宝石',
    rarity: 'rare',
    category: 'crystal',
    description: 'A twin-gem system where each half is quantum entangled with the other. Information imprinted on one gem instantly appears on its partner regardless of distance.',
    value: 120,
    color: '#9370DB',
  },
  {
    id: 'decoherence_residue',
    name: 'Decoherence Residue',
    nameZh: '退相干残渣',
    rarity: 'common',
    category: 'crystal',
    description: 'The dusty remnants of a collapsed wave function. While no longer quantum-active, it contains trace minerals useful in conventional construction and alchemy.',
    value: 3,
    color: '#808080',
  },
  {
    id: 'tensor_crystal_matrix',
    name: 'Tensor Crystal Matrix',
    nameZh: '张量水晶矩阵',
    rarity: 'epic',
    category: 'crystal',
    description: 'A precisely ordered array of quantum crystals arranged in a tensor network configuration. This matrix can perform complex quantum calculations autonomously.',
    value: 400,
    color: QS_TENSOR_GREEN,
  },
  {
    id: 'planck_scale_diamond',
    name: 'Planck Scale Diamond',
    nameZh: '普朗克尺度钻石',
    rarity: 'legendary',
    category: 'crystal',
    description: 'A diamond formed under conditions that exist only at the Planck scale. It is the hardest material in any universe and contains within its structure a map of the fundamental geometry of spacetime.',
    value: 2000,
    color: QS_SPIRE_GOLD,
  },

  // Particle Materials (8)
  {
    id: 'collapsed_photon',
    name: 'Collapsed Photon',
    nameZh: '坍缩光子',
    rarity: 'common',
    category: 'particle',
    description: 'A photon that has been forced out of superposition into a definite state. It carries a clean, precise energy signature useful for powering quantum devices.',
    value: 5,
    color: '#FFFACD',
  },
  {
    id: 'trapped_qubit',
    name: 'Trapped Qubit',
    nameZh: '束缚量子比特',
    rarity: 'uncommon',
    category: 'particle',
    description: 'A qubit held in a stable quantum trap, maintaining its superposition state. Trapped qubits are the basic building blocks of quantum processors and entanglement networks.',
    value: 28,
    color: QS_WAVE_BLUE,
  },
  {
    id: 'virtual_particle_pair',
    name: 'Virtual Particle Pair',
    nameZh: '虚粒子对',
    rarity: 'uncommon',
    category: 'particle',
    description: 'A pair of particles that spontaneously materialized from quantum vacuum fluctuations and were stabilized before they could annihilate. Their continued existence defies energy conservation.',
    value: 35,
    color: '#FF69B4',
  },
  {
    id: 'dark_quantum_matter',
    name: 'Dark Quantum Matter',
    nameZh: '暗量子物质',
    rarity: 'rare',
    category: 'particle',
    description: 'A mysterious substance that interacts only through quantum gravitational effects. It warps the probability space around it, creating zones where quantum effects are amplified tenfold.',
    value: 110,
    color: '#1A1A2E',
  },
  {
    id: 'strange_quark_cluster',
    name: 'Strange Quark Cluster',
    nameZh: '奇异夸克团簇',
    rarity: 'rare',
    category: 'particle',
    description: 'A stable cluster of strange quarks bound together by the strong nuclear force. These clusters emit strange radiation that enhances quantum tunneling effects.',
    value: 95,
    color: '#FF4500',
  },
  {
    id: 'neutrino_condensate',
    name: 'Neutrino Condensate',
    nameZh: '中微子凝聚态',
    rarity: 'epic',
    category: 'particle',
    description: 'A Bose-Einstein condensate of neutrinos — thought to be impossible until discovered at the base of Planck Heights. It passes through all matter but interacts strongly with quantum fields.',
    value: 380,
    color: '#B0C4DE',
  },
  {
    id: 'graviton_nugget',
    name: 'Graviton Nugget',
    nameZh: '引力子块',
    rarity: 'epic',
    category: 'particle',
    description: 'A concentrated nugget of gravitons, the hypothetical particles that mediate gravity. Its gravitational effects on quantum systems are profound, causing wave functions to curve.',
    value: 450,
    color: '#4169E1',
  },
  {
    id: 'primordial_boson',
    name: 'Primordial Boson',
    nameZh: '太初玻色子',
    rarity: 'legendary',
    category: 'particle',
    description: 'A boson that has existed since the first picosecond of the universe, carrying information about the original quantum state of all matter. It is the most sought-after particle in quantum research.',
    value: 1800,
    color: QS_SPIRE_GOLD,
  },

  // Wave Materials (6)
  {
    id: 'probability_wave_essence',
    name: 'Probability Wave Essence',
    nameZh: '概率波精华',
    rarity: 'common',
    category: 'wave',
    description: 'A distilled liquid form of quantum probability waves. It shimmers with all possible colors simultaneously and is used as a coolant in quantum devices.',
    value: 4,
    color: '#E0E0FF',
  },
  {
    id: 'interference_pattern_resin',
    name: 'Interference Pattern Resin',
    nameZh: '干涉图样树脂',
    rarity: 'uncommon',
    category: 'wave',
    description: 'A resin that solidifies quantum interference patterns into permanent, visible structures. Artists and engineers use it to create functional wave guides.',
    value: 22,
    color: '#9370DB',
  },
  {
    id: 'standing_wave_crystal',
    name: 'Standing Wave Crystal',
    nameZh: '驻波水晶',
    rarity: 'rare',
    category: 'wave',
    description: 'A crystal that naturally forms standing quantum waves within its structure. These waves can be tuned to resonate with specific frequencies, making it ideal for quantum communication.',
    value: 100,
    color: '#00CED1',
  },
  {
    id: 'de_broglie_matter_wave',
    name: 'de Broglie Matter Wave',
    nameZh: '德布罗意物质波',
    rarity: 'rare',
    category: 'wave',
    description: 'A wave packet of coherent matter waves harvested from a perfectly isolated quantum system. It can impart wave-like properties to solid objects.',
    value: 115,
    color: '#4682B4',
  },
  {
    id: 'wavefunction_collapse_core',
    name: 'Wavefunction Collapse Core',
    nameZh: '波函数坍缩核心',
    rarity: 'epic',
    category: 'wave',
    description: 'The compressed remnant of a collapsed wave function, containing all the probability that was eliminated during measurement. It releases this probability when triggered.',
    value: 420,
    color: QS_DECOHERENCE_RED,
  },
  {
    id: 'universal_wave_echo',
    name: 'Universal Wave Echo',
    nameZh: '宇宙波回响',
    rarity: 'legendary',
    category: 'wave',
    description: 'An echo of the original quantum wave that created the universe. It carries the imprint of the Big Bang\'s quantum state and can temporarily return any system to its primordial superposition.',
    value: 1900,
    color: '#FFFFFF',
  },

  // Flux Materials (4)
  {
    id: 'raw_quantum_flux',
    name: 'Raw Quantum Flux',
    nameZh: '原始量子通量',
    rarity: 'common',
    category: 'flux',
    description: 'Unprocessed quantum flux energy harvested from environmental fluctuations. It crackles with unstable potential energy that can be channeled into various quantum applications.',
    value: 6,
    color: QS_FLUX_VIOLET,
  },
  {
    id: 'stabilized_flux_capacitor',
    name: 'Stabilized Flux Capacitor',
    nameZh: '稳定通量电容器',
    rarity: 'uncommon',
    category: 'flux',
    description: 'A device that stores and releases quantum flux energy in controlled bursts. It is the power source for most quantum structures and abilities.',
    value: 32,
    color: '#8A2BE2',
  },
  {
    id: 'coherence_flux_conduit',
    name: 'Coherence Flux Conduit',
    nameZh: '相干通量导管',
    rarity: 'rare',
    category: 'flux',
    description: 'A superconducting conduit that channels quantum flux while maintaining perfect coherence. Essential for long-distance quantum energy transmission.',
    value: 105,
    color: '#6A5ACD',
  },
  {
    id: 'infinite_flux_well',
    name: 'Infinite Flux Well',
    nameZh: '无限通量井',
    rarity: 'legendary',
    category: 'flux',
    description: 'A bottomless well of quantum flux energy that never depletes. It taps into the quantum vacuum itself, drawing energy from the foam of virtual particles that underlies all of reality.',
    value: 2200,
    color: '#9400D3',
  },

  // Exotic Materials (4)
  {
    id: 'spire_gold_fragment',
    name: 'Spire Gold Fragment',
    nameZh: '尖塔金碎片',
    rarity: 'uncommon',
    category: 'exotic',
    description: 'A fragment of the golden crystalline material that forms the outer shell of the quantum spires. It resonates with spire energy and is used in spire construction and repair.',
    value: 20,
    color: QS_SPIRE_GOLD,
  },
  {
    id: 'dimensional_fold_fabric',
    name: 'Dimensional Fold Fabric',
    nameZh: '维度折叠织物',
    rarity: 'rare',
    category: 'exotic',
    description: 'A fabric woven from extra-dimensional threads that can fold space at the quantum level. It is used to create quantum portals and storage pockets that exist outside normal space.',
    value: 130,
    color: '#8B00FF',
  },
  {
    id: 'entropy_crystal_seed',
    name: 'Entropy Crystal Seed',
    nameZh: '熵水晶种子',
    rarity: 'epic',
    category: 'exotic',
    description: 'A seed that, when planted in quantum soil, grows into an entropy crystal — a structure that actually reverses entropy in its vicinity. These crystals are the basis of quantum immortality research.',
    value: 500,
    color: '#32CD32',
  },
  {
    id: 'singularity_heart',
    name: 'Singularity Heart',
    nameZh: '奇点之心',
    rarity: 'legendary',
    category: 'exotic',
    description: 'The crystallized core of a microscopic black hole, stabilized by quantum effects that prevent it from evaporating or expanding. It contains infinite density in a finite space and warps quantum probability in its vicinity to extreme degrees.',
    value: 2500,
    color: '#000000',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: QS_STRUCTURES — 25 Structures (upgradeable to lv10)
// ═══════════════════════════════════════════════════════════════════

export const QS_STRUCTURES: readonly QSStructureDef[] = [
  {
    id: 'quantum_resonance_chamber',
    name: 'Quantum Resonance Chamber',
    nameZh: '量子共振室',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 100,
    bonusPerLevel: 5,
    description: 'A chamber that amplifies quantum resonance, strengthening entity coherence by 5% per level.',
    color: QS_QUANTUM_CYAN,
  },
  {
    id: 'flux_energy_harvester',
    name: 'Flux Energy Harvester',
    nameZh: '通量能量采集器',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 120,
    bonusPerLevel: 6,
    description: 'Harvests ambient quantum flux and converts it into usable energy, producing 6 flux units per level per cycle.',
    color: QS_FLUX_VIOLET,
  },
  {
    id: 'crystal_growth_vat',
    name: 'Crystal Growth Vat',
    nameZh: '水晶生长槽',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 90,
    bonusPerLevel: 4,
    description: 'Accelerates the growth of quantum crystals, producing 4 crystals per level per cycle.',
    color: '#00CED1',
  },
  {
    id: 'entanglement_relay',
    name: 'Entanglement Relay',
    nameZh: '纠缠中继站',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 150,
    bonusPerLevel: 8,
    description: 'Extends the range of quantum entanglement networks, boosting entanglement success rate by 8% per level.',
    color: QS_ENTANGLE_PURPLE,
  },
  {
    id: 'wave_function_stabilizer',
    name: 'Wave Function Stabilizer',
    nameZh: '波函数稳定器',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 130,
    bonusPerLevel: 7,
    description: 'Reduces environmental decoherence, protecting entity coherence by 7% per level.',
    color: QS_WAVE_BLUE,
  },
  {
    id: 'probability_manifold_engine',
    name: 'Probability Manifold Engine',
    nameZh: '概率流形引擎',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 200,
    bonusPerLevel: 10,
    description: 'Manipulates probability manifolds to favor beneficial outcomes, increasing rare material drop rates by 10% per level.',
    color: QS_FLUX_VIOLET,
  },
  {
    id: 'quantum_computing_core',
    name: 'Quantum Computing Core',
    nameZh: '量子计算核心',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 250,
    bonusPerLevel: 12,
    description: 'Provides massive quantum computing power for complex calculations, boosting research speed by 12% per level.',
    color: QS_TENSOR_GREEN,
  },
  {
    id: 'decoherence_shield_generator',
    name: 'Decoherence Shield Generator',
    nameZh: '退相干护盾发生器',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 140,
    bonusPerLevel: 7,
    description: 'Generates a protective field that shields entities from environmental decoherence, providing 7% damage reduction per level.',
    color: QS_DECOHERENCE_RED,
  },
  {
    id: 'spire_resonance_antenna',
    name: 'Spire Resonance Antenna',
    nameZh: '尖塔共振天线',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 160,
    bonusPerLevel: 9,
    description: 'Tunes into the resonance frequency of nearby spires, boosting all spire outputs by 9% per level.',
    color: QS_SPIRE_GOLD,
  },
  {
    id: 'quantum_memory_bank',
    name: 'Quantum Memory Bank',
    nameZh: '量子存储库',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 110,
    bonusPerLevel: 6,
    description: 'Stores quantum information with high fidelity, increasing maximum resource capacity by 6% per level.',
    color: '#B0C4DE',
  },
  {
    id: 'vacuum_energy_extractor',
    name: 'Vacuum Energy Extractor',
    nameZh: '真空能提取器',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 180,
    bonusPerLevel: 9,
    description: 'Extracts energy from quantum vacuum fluctuations, generating passive quantum flux equal to 9% of total flux per level.',
    color: '#2F4F4F',
  },
  {
    id: 'tensor_network_hub',
    name: 'Tensor Network Hub',
    nameZh: '张量网络枢纽',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 220,
    bonusPerLevel: 11,
    description: 'Processes quantum information through tensor networks, boosting the power of all abilities by 11% per level.',
    color: QS_TENSOR_GREEN,
  },
  {
    id: 'quantum_tunnel_gate',
    name: 'Quantum Tunnel Gate',
    nameZh: '量子隧道门',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 170,
    bonusPerLevel: 8,
    description: 'Creates stable quantum tunnels for resource transfer, reducing material costs for all operations by 8% per level.',
    color: '#8A2BE2',
  },
  {
    id: 'coherence_amplifier',
    name: 'Coherence Amplifier',
    nameZh: '相干放大器',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 190,
    bonusPerLevel: 10,
    description: 'Amplifies quantum coherence across all entities, boosting their effective power by 10% per level.',
    color: QS_QUANTUM_CYAN,
  },
  {
    id: 'probability_calculator',
    name: 'Probability Calculator',
    nameZh: '概率计算器',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 145,
    bonusPerLevel: 7,
    description: 'Calculates optimal quantum strategies, increasing the success rate of all actions by 7% per level.',
    color: '#DAA520',
  },
  {
    id: 'quantum_teleport_array',
    name: 'Quantum Teleport Array',
    nameZh: '量子传送阵列',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 210,
    bonusPerLevel: 10,
    description: 'Enables instant quantum teleportation between spires, reducing travel time by 10% per level until instant at max level.',
    color: '#FF69B4',
  },
  {
    id: 'dark_matter_forge',
    name: 'Dark Matter Forge',
    nameZh: '暗物质锻造炉',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 280,
    bonusPerLevel: 14,
    description: 'Forges equipment from dark quantum matter, producing rare materials worth 14 units per level per cycle.',
    color: '#1A1A2E',
  },
  {
    id: 'quantum_observatory',
    name: 'Quantum Observatory',
    nameZh: '量子观测站',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 175,
    bonusPerLevel: 9,
    description: 'Observes quantum phenomena across the spire network, revealing hidden events and resources within a range of 9% per level.',
    color: '#87CEEB',
  },
  {
    id: 'entanglement_farm',
    name: 'Entanglement Farm',
    nameZh: '纠缠农场',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 155,
    bonusPerLevel: 8,
    description: 'Mass-produces entangled particle pairs for quantum communication, generating 8 entanglement units per level per cycle.',
    color: QS_ENTANGLE_PURPLE,
  },
  {
    id: 'quantum_error_corrector',
    name: 'Quantum Error Corrector',
    nameZh: '量子纠错器',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 200,
    bonusPerLevel: 10,
    description: 'Automatically corrects quantum errors, reducing all penalties and losses by 10% per level.',
    color: '#32CD32',
  },
  {
    id: 'planck_scale_analyzer',
    name: 'Planck Scale Analyzer',
    nameZh: '普朗克尺度分析器',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 300,
    bonusPerLevel: 15,
    description: 'Analyzes phenomena at the Planck scale, providing 15% bonus to all research and discovery per level.',
    color: QS_PLANCK_SILVER,
  },
  {
    id: 'quantum_gene_lab',
    name: 'Quantum Gene Laboratory',
    nameZh: '量子基因实验室',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 230,
    bonusPerLevel: 12,
    description: 'Enhances quantum entities at the genetic level, boosting entity experience gain by 12% per level.',
    color: '#FF6347',
  },
  {
    id: 'multiverse_portal_frame',
    name: 'Multiverse Portal Frame',
    nameZh: '多元宇宙传送门框架',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 350,
    bonusPerLevel: 18,
    description: 'A portal frame capable of opening windows into parallel quantum universes, granting access to materials and entities from other timelines at 18% efficiency per level.',
    color: '#8B00FF',
  },
  {
    id: 'quantum_harmonic_balancer',
    name: 'Quantum Harmonic Balancer',
    nameZh: '量子谐振平衡器',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 280,
    bonusPerLevel: 14,
    description: 'A precision device that maintains harmonic balance across all spire frequencies, preventing destructive interference and boosting overall network stability by 14% per level.',
    color: QS_QUANTUM_CYAN,
  },
  {
    id: 'omniscient_core_reactor',
    name: 'Omniscient Core Reactor',
    nameZh: '全知核心反应堆',
    maxLevel: QS_MAX_STRUCTURE_LEVEL,
    costPerLevel: 500,
    bonusPerLevel: 25,
    description: 'The ultimate quantum reactor that taps into the fundamental information substrate of reality, providing a 25% bonus to all operations per level.',
    color: QS_SPIRE_GOLD,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: QS_ABILITIES — 22 Quantum Abilities
// ═══════════════════════════════════════════════════════════════════

export const QS_ABILITIES: readonly QSAbilityDef[] = [
  {
    id: 'qs_entangle',
    name: 'Entangle',
    nameZh: '纠缠',
    type: 'active',
    power: 30,
    cooldown: 3,
    cost: 20,
    description: 'Create a quantum entanglement link between two entities, boosting their combined coherence and power for the duration.',
    color: QS_ENTANGLE_PURPLE,
  },
  {
    id: 'qs_collapse_wave',
    name: 'Collapse Wave',
    nameZh: '波函数坍缩',
    type: 'active',
    power: 50,
    cooldown: 5,
    cost: 35,
    description: 'Force an enemy wave function to collapse into its least favorable state, dealing massive quantum damage.',
    color: QS_DECOHERENCE_RED,
  },
  {
    id: 'qs_tunnel',
    name: 'Quantum Tunnel',
    nameZh: '量子隧道',
    type: 'active',
    power: 20,
    cooldown: 4,
    cost: 25,
    description: 'Tunnel through any barrier or obstacle by exploiting quantum tunneling probability. Bypasses all defenses.',
    color: QS_WAVE_BLUE,
  },
  {
    id: 'qs_superposition',
    name: 'Superposition Shift',
    nameZh: '叠加态切换',
    type: 'toggle',
    power: 40,
    cooldown: 8,
    cost: 50,
    description: 'Enter a state of superposition where you exist in multiple locations simultaneously, dodging attacks and multiplying your actions.',
    color: QS_QUANTUM_CYAN,
  },
  {
    id: 'qs_probability_surge',
    name: 'Probability Surge',
    nameZh: '概率涌动',
    type: 'burst',
    power: 60,
    cooldown: 10,
    cost: 45,
    description: 'Surge the probability of favorable outcomes to near-certainty for a brief period. All actions succeed during the burst.',
    color: QS_FLUX_VIOLET,
  },
  {
    id: 'qs_flux_channel',
    name: 'Flux Channel',
    nameZh: '通量引导',
    type: 'active',
    power: 25,
    cooldown: 3,
    cost: 15,
    description: 'Channel raw quantum flux energy into a targeted entity, restoring its coherence and boosting its next action.',
    color: QS_FLUX_VIOLET,
  },
  {
    id: 'qs_decoherence_shield',
    name: 'Decoherence Shield',
    nameZh: '退相干护盾',
    type: 'toggle',
    power: 35,
    cooldown: 7,
    cost: 40,
    description: 'Generate a shield that causes attacking wave functions to decohere before they can deal damage.',
    color: QS_DECOHERENCE_RED,
  },
  {
    id: 'qs_quantum_healing',
    name: 'Quantum Healing',
    nameZh: '量子治愈',
    type: 'active',
    power: 45,
    cooldown: 6,
    cost: 30,
    description: 'Restore a damaged entity by placing it in a healing superposition where it simultaneously recovers from all possible damage states.',
    color: QS_TENSOR_GREEN,
  },
  {
    id: 'qs_spire_resonance',
    name: 'Spire Resonance',
    nameZh: '尖塔共振',
    type: 'active',
    power: 55,
    cooldown: 12,
    cost: 60,
    description: 'Resonate with the quantum frequency of a nearby spire, drawing upon its massive energy reserves to unleash a devastating attack.',
    color: QS_SPIRE_GOLD,
  },
  {
    id: 'qs_dimension_fold',
    name: 'Dimension Fold',
    nameZh: '维度折叠',
    type: 'active',
    power: 70,
    cooldown: 15,
    cost: 70,
    description: 'Fold the fabric of space at the quantum level, creating a localized dimensional pocket that traps and crushes enemies.',
    color: '#8B00FF',
  },
  {
    id: 'qs_tensor_burst',
    name: 'Tensor Burst',
    nameZh: '张量爆发',
    type: 'burst',
    power: 80,
    cooldown: 18,
    cost: 80,
    description: 'Overload a tensor network causing a cascading computation burst that releases massive energy in all directions.',
    color: QS_TENSOR_GREEN,
  },
  {
    id: 'qs_planck_strike',
    name: 'Planck Strike',
    nameZh: '普朗克一击',
    type: 'active',
    power: 100,
    cooldown: 20,
    cost: 100,
    description: 'Strike with force concentrated at the Planck scale, affecting the fundamental structure of the target itself.',
    color: QS_PLANCK_SILVER,
  },
  {
    id: 'qs_vacuum_explosion',
    name: 'Vacuum Explosion',
    nameZh: '真空爆炸',
    type: 'burst',
    power: 90,
    cooldown: 16,
    cost: 85,
    description: 'Destabilize the quantum vacuum in an area, causing a cascade of virtual particle annihilations that creates a devastating explosion.',
    color: '#FF4500',
  },
  {
    id: 'qs_wave_ride',
    name: 'Wave Ride',
    nameZh: '乘波而行',
    type: 'active',
    power: 15,
    cooldown: 2,
    cost: 10,
    description: 'Ride a probability wave to instantly reposition to any observable point within the quantum realm.',
    color: QS_WAVE_BLUE,
  },
  {
    id: 'qs_entanglement_web',
    name: 'Entanglement Web',
    nameZh: '纠缠之网',
    type: 'toggle',
    power: 50,
    cooldown: 10,
    cost: 55,
    description: 'Spin a web of entanglement threads connecting all allies. Damage dealt to any ally is distributed across the network.',
    color: QS_ENTANGLE_PURPLE,
  },
  {
    id: 'qs_flux_storm',
    name: 'Flux Storm',
    nameZh: '通量风暴',
    type: 'burst',
    power: 75,
    cooldown: 14,
    cost: 65,
    description: 'Summon a localized quantum flux storm that disrupts enemy coherence while amplifying allied power.',
    color: QS_FLUX_VIOLET,
  },
  {
    id: 'qs_observation_lock',
    name: 'Observation Lock',
    nameZh: '观测锁定',
    type: 'active',
    power: 40,
    cooldown: 6,
    cost: 35,
    description: 'Apply continuous quantum observation to a target, preventing it from entering superposition and locking it in its current state.',
    color: '#FFD700',
  },
  {
    id: 'qs_quantum_clone',
    name: 'Quantum Clone',
    nameZh: '量子克隆',
    type: 'active',
    power: 55,
    cooldown: 12,
    cost: 50,
    description: 'Create a temporary quantum clone of an entity that shares its power and abilities for a limited duration.',
    color: QS_QUANTUM_CYAN,
  },
  {
    id: 'qs_zero_point_rush',
    name: 'Zero Point Rush',
    nameZh: '零点冲击',
    type: 'active',
    power: 65,
    cooldown: 9,
    cost: 45,
    description: 'Channel zero-point energy from the quantum vacuum into a devastating close-range attack that bypasses all quantum shields.',
    color: '#00FA9A',
  },
  {
    id: 'qs_many_worlds_sight',
    name: 'Many Worlds Sight',
    nameZh: '多世界之眼',
    type: 'passive',
    power: 30,
    cooldown: 0,
    cost: 0,
    description: 'Perceive events across multiple quantum branches simultaneously, gaining advance knowledge of enemy movements and resource spawns.',
    color: '#E0E0FF',
  },
  {
    id: 'qs_quantum_immortality',
    name: 'Quantum Immortality',
    nameZh: '量子永生',
    type: 'passive',
    power: 120,
    cooldown: 0,
    cost: 0,
    description: 'In any timeline where you would be destroyed, consciousness transfers to a surviving quantum branch. Effectively prevents death once per session.',
    color: QS_SPIRE_GOLD,
  },
  {
    id: 'qs_final_collapse',
    name: 'Final Collapse',
    nameZh: '终极坍缩',
    type: 'burst',
    power: 200,
    cooldown: 30,
    cost: 200,
    description: 'Trigger a chain reaction of wave function collapses across the entire quantum realm. The most powerful ability known, but the cost is absolute.',
    color: '#000000',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: QS_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const QS_ACHIEVEMENTS: readonly QSAchievementDef[] = [
  {
    id: 'qs_ach_first_awakening',
    name: 'First Awakening',
    nameZh: '初次觉醒',
    description: 'Awaken your first quantum entity from the superposition field.',
    condition: 'Awaken 1 entity',
    reward: '+50 Quantum Flux',
  },
  {
    id: 'qs_ach_entanglement_novice',
    name: 'Entanglement Novice',
    nameZh: '纠缠新手',
    description: 'Perform your first successful quantum entanglement between two entities.',
    condition: 'Entangle 1 pair',
    reward: '+100 Quantum Flux',
  },
  {
    id: 'qs_ach_wave_collapse',
    name: 'Wave Breaker',
    nameZh: '破波者',
    description: 'Force your first wave function collapse, resolving quantum uncertainty into a definite state.',
    condition: 'Collapse 1 wave function',
    reward: '+75 Quantum Flux',
  },
  {
    id: 'qs_ach_tunnel_pioneer',
    name: 'Tunnel Pioneer',
    nameZh: '隧道先驱',
    description: 'Execute your first quantum tunnel through a barrier.',
    condition: 'Tunnel 1 time',
    reward: '+80 Quantum Flux',
  },
  {
    id: 'qs_ach_spires_explorer',
    name: 'Spires Explorer',
    nameZh: '尖塔探索者',
    description: 'Activate resonance with at least 4 different spires.',
    condition: 'Activate 4 spires',
    reward: '+200 Quantum Flux, Spire Gold Fragment x5',
  },
  {
    id: 'qs_ach_seven_species',
    name: 'Complete Collection',
    nameZh: '七种俱全',
    description: 'Awaken at least one entity of every quantum species.',
    condition: 'Own 7 species',
    reward: '+500 Quantum Flux',
  },
  {
    id: 'qs_ach_crystal_hoarder',
    name: 'Crystal Hoarder',
    nameZh: '水晶囤积者',
    description: 'Accumulate 1000 or more quantum crystals in your reserves.',
    condition: 'Own 1000 Quantum Crystals',
    reward: '+300 Quantum Flux, Coherence Shard x3',
  },
  {
    id: 'qs_ach_flux_millionaire',
    name: 'Flux Millionaire',
    nameZh: '通量百万富翁',
    description: 'Accumulate a total of 10,000 quantum flux through all means.',
    condition: 'Total flux >= 10000',
    reward: 'Probability Shard x5',
  },
  {
    id: 'qs_ach_ten_structures',
    name: 'Architect of the Quantum',
    nameZh: '量子建筑师',
    description: 'Build and upgrade structures to a combined total of 50 structure levels.',
    condition: 'Total structure levels >= 50',
    reward: '+400 Quantum Flux',
  },
  {
    id: 'qs_ach_legendary_entity',
    name: 'Legend Awakened',
    nameZh: '传说觉醒',
    description: 'Awaken a legendary rarity quantum entity.',
    condition: 'Own 1 legendary entity',
    reward: '+1000 Quantum Flux, Planck Scale Diamond x1',
  },
  {
    id: 'qs_ach_all_spire_master',
    name: 'Master of All Spires',
    nameZh: '万塔之主',
    description: 'Activate all 8 spires simultaneously at maximum resonance.',
    condition: 'All 8 spires active at max',
    reward: '+2000 Quantum Flux, Primordial Boson x1',
  },
  {
    id: 'qs_ach_entangle_mastery',
    name: 'Entanglement Master',
    nameZh: '纠缠大师',
    description: 'Perform 100 successful entanglement operations.',
    condition: '100 entanglements',
    reward: '+800 Quantum Flux',
  },
  {
    id: 'qs_ach_tunnel_sage',
    name: 'Tunnel Sage',
    nameZh: '隧道贤者',
    description: 'Execute 50 quantum tunnels through barriers.',
    condition: '50 tunnels',
    reward: '+600 Quantum Flux',
  },
  {
    id: 'qs_ach_artifact_collector',
    name: 'Artifact Collector',
    nameZh: '神器收藏家',
    description: 'Activate 5 legendary quantum artifacts.',
    condition: 'Own 5 artifacts',
    reward: '+1500 Quantum Flux',
  },
  {
    id: 'qs_ach_max_level',
    name: 'Peak of Power',
    nameZh: '力量巅峰',
    description: 'Reach the maximum quantum spire level.',
    condition: 'Reach max level',
    reward: 'Singularity Heart x1',
  },
  {
    id: 'qs_ach_decoherence_survivor',
    name: 'Decoherence Survivor',
    nameZh: '退相干幸存者',
    description: 'Survive 10 consecutive decoherence attacks without losing any entity coherence.',
    condition: 'Survive 10 decoherence hits',
    reward: '+700 Quantum Flux',
  },
  {
    id: 'qs_ach_title_quantum_deity',
    name: 'Ascendant Deity',
    nameZh: '飞升神明',
    description: 'Unlock the Quantum Deity title, the highest honor in the quantum spires.',
    condition: 'Unlock Quantum Deity title',
    reward: '+5000 Quantum Flux',
  },
  {
    id: 'qs_ach_perfect_coherence',
    name: 'Perfect Coherence',
    nameZh: '完美相干',
    description: 'Have all awakened entities at maximum coherence simultaneously.',
    condition: 'All entities max coherence',
    reward: 'Universal Wave Echo x1',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: QS_TITLES — 8 Progression Titles
// ═══════════════════════════════════════════════════════════════════

export const QS_TITLES: readonly QSTitleDef[] = [
  {
    id: 'qs_title_observer',
    name: 'Observer',
    nameZh: '观测者',
    requirement: 'Begin your journey into the quantum realm',
    bonusPercent: 0,
  },
  {
    id: 'qs_title_entangler',
    name: 'Entangler',
    nameZh: '纠缠者',
    requirement: 'Perform 5 successful entanglements',
    bonusPercent: 5,
  },
  {
    id: 'qs_title_wave_master',
    name: 'Wave Master',
    nameZh: '波大师',
    requirement: 'Collapse 10 wave functions',
    bonusPercent: 10,
  },
  {
    id: 'qs_title_flux_commander',
    name: 'Flux Commander',
    nameZh: '通量指挥官',
    requirement: 'Accumulate 5000 total quantum flux',
    bonusPercent: 15,
  },
  {
    id: 'qs_title_spire_guardian',
    name: 'Spire Guardian',
    nameZh: '尖塔守护者',
    requirement: 'Activate 6 spires simultaneously',
    bonusPercent: 20,
  },
  {
    id: 'qs_title_quantum_architect',
    name: 'Quantum Architect',
    nameZh: '量子架构师',
    requirement: 'Build structures with 100 total combined levels',
    bonusPercent: 25,
  },
  {
    id: 'qs_title_tensor_sage',
    name: 'Tensor Sage',
    nameZh: '张量贤者',
    requirement: 'Own 3 legendary entities and 10 artifacts',
    bonusPercent: 35,
  },
  {
    id: 'qs_title_quantum_deity',
    name: 'Quantum Deity',
    nameZh: '量子神明',
    requirement: 'Unlock all other titles and activate all 8 spires',
    bonusPercent: 50,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: QS_ARTIFACTS — 15 Legendary Artifacts
// ═══════════════════════════════════════════════════════════════════

export const QS_ARTIFACTS: readonly QSArtifactDef[] = [
  {
    id: 'qs_art_eye_of_superposition',
    name: 'Eye of Superposition',
    nameZh: '叠加之眼',
    description: 'An ancient lens that lets the wearer see all possible quantum states simultaneously, revealing hidden paths and resources.',
    bonus: '+20% resource discovery rate',
    power: 50,
    rarity: 'rare',
  },
  {
    id: 'qs_art_crown_of_entanglement',
    name: 'Crown of Entanglement',
    nameZh: '纠缠王冠',
    description: 'A crown woven from entangled quantum threads that links the minds of all entities under its wearer\'s command.',
    bonus: '+15% entity coherence',
    power: 65,
    rarity: 'epic',
  },
  {
    id: 'qs_art_staff_of_collapse',
    name: 'Staff of Collapse',
    nameZh: '坍缩法杖',
    description: 'A staff that can force wave function collapse with pinpoint precision, eliminating any threat by resolving it into harmlessness.',
    bonus: '+25% wave collapse damage',
    power: 80,
    rarity: 'epic',
  },
  {
    id: 'qs_art_shield_of_decoherence',
    name: 'Shield of Decoherence',
    nameZh: '退相干之盾',
    description: 'A shield that absorbs decoherence energy and converts it into protective barriers around allies.',
    bonus: '+30% decoherence resistance',
    power: 70,
    rarity: 'rare',
  },
  {
    id: 'qs_art_gauntlet_of_tunneling',
    name: 'Gauntlet of Tunneling',
    nameZh: '隧穿手套',
    description: 'A gauntlet that allows the wearer to quantum tunnel through any physical barrier, including dimensional walls.',
    bonus: 'Unlimited tunnel range',
    power: 55,
    rarity: 'rare',
  },
  {
    id: 'qs_art_orb_of_probability',
    name: 'Orb of Probability',
    nameZh: '概率宝珠',
    description: 'A swirling orb containing every possible outcome of every future event. It subtly guides probability toward the favorable.',
    bonus: '+20% favorable outcome chance',
    power: 75,
    rarity: 'epic',
  },
  {
    id: 'qs_art_flux_eternal_engine',
    name: 'Flux Eternal Engine',
    nameZh: '永恒通量引擎',
    description: 'A self-sustaining engine that generates infinite quantum flux from vacuum energy fluctuations.',
    bonus: '+100 passive flux per cycle',
    power: 90,
    rarity: 'legendary',
  },
  {
    id: 'qs_art_quantum_crystal_heart',
    name: 'Quantum Crystal Heart',
    nameZh: '量子水晶之心',
    description: 'The crystallized heart of a primordial quantum entity that beats with the rhythm of the universe.',
    bonus: '+40% all entity stats',
    power: 120,
    rarity: 'legendary',
  },
  {
    id: 'qs_art_tensor_compass',
    name: 'Tensor Compass',
    nameZh: '张量指南针',
    description: 'A compass that points toward the most quantum-relevant events in the multiverse, never leading its owner astray.',
    bonus: '+25% event quality',
    power: 45,
    rarity: 'rare',
  },
  {
    id: 'qs_art_dimensional_key',
    name: 'Dimensional Key',
    nameZh: '维度钥匙',
    description: 'A key that can unlock doors between quantum dimensions, granting access to parallel universe resources.',
    bonus: 'Access to parallel universe materials',
    power: 100,
    rarity: 'legendary',
  },
  {
    id: 'qs_art_planck_scales',
    name: 'Planck Scales',
    nameZh: '普朗克天平',
    description: 'A pair of scales that weigh the quantum information content of any object, revealing its true nature.',
    bonus: '+15% material quality assessment',
    power: 40,
    rarity: 'uncommon',
  },
  {
    id: 'qs_art_infinity_loop',
    name: 'Infinity Loop',
    nameZh: '无穷之环',
    description: 'A ring with no beginning and no end, symbolizing the eternal cycle of quantum measurement and superposition.',
    bonus: '+10% ability cooldown reduction',
    power: 60,
    rarity: 'epic',
  },
  {
    id: 'qs_art_quantum_mirror',
    name: 'Quantum Mirror',
    nameZh: '量子镜',
    description: 'A mirror that reflects the viewer\'s quantum state from a parallel universe, showing what might have been.',
    bonus: '+20% quantum insight',
    power: 50,
    rarity: 'uncommon',
  },
  {
    id: 'qs_art_void_crystal_shard',
    name: 'Void Crystal Shard',
    nameZh: '虚空水晶碎片',
    description: 'A fragment of crystal that existed before the universe, containing the quantum blueprint of creation.',
    bonus: '+35% structure efficiency',
    power: 110,
    rarity: 'legendary',
  },
  {
    id: 'qs_art_singularity_crown',
    name: 'Singularity Crown',
    nameZh: '奇点王冠',
    description: 'The ultimate artifact — a crown that contains a micro-singularity, granting its wearer power over the fundamental forces.',
    bonus: '+50% all stats, quantum immortality',
    power: 200,
    rarity: 'legendary',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: QS_EVENTS — 12 Random Events
// ═══════════════════════════════════════════════════════════════════

export const QS_EVENTS: readonly QSEventDef[] = [
  {
    id: 'qs_evt_flux_storm',
    name: 'Quantum Flux Storm',
    nameZh: '量子通量风暴',
    description: 'A massive quantum flux storm sweeps through the spire network, generating abundant energy but threatening coherence.',
    effect: 'Double flux generation for 5 cycles, -20% coherence',
    severity: 3,
  },
  {
    id: 'qs_evt_decoherence_wave',
    name: 'Decoherence Wave',
    nameZh: '退相干浪潮',
    description: 'An environmental decoherence wave propagates through the realm, weakening all quantum entities.',
    effect: 'All entity coherence reduced by 30% for 3 cycles',
    severity: 4,
  },
  {
    id: 'qs_evt_spire_resonance_surge',
    name: 'Spire Resonance Surge',
    nameZh: '尖塔共振激增',
    description: 'The spires enter a rare harmonic resonance phase, amplifying their power output tremendously.',
    effect: 'All spire outputs tripled for 4 cycles',
    severity: 2,
  },
  {
    id: 'qs_evt_probability_anomaly',
    name: 'Probability Anomaly',
    nameZh: '概率异常',
    description: 'A bizarre probability anomaly makes extremely unlikely events start happening regularly.',
    effect: 'Legendary material drop rate +500% for 2 cycles',
    severity: 2,
  },
  {
    id: 'qs_evt_entanglement_cascade',
    name: 'Entanglement Cascade',
    nameZh: '纠缠级联',
    description: 'A spontaneous entanglement cascade links thousands of quantum systems together.',
    effect: 'All entanglement operations cost zero for 3 cycles',
    severity: 1,
  },
  {
    id: 'qs_evt_dimensional_rift',
    name: 'Dimensional Rift',
    nameZh: '维度裂缝',
    description: 'A rift opens between quantum dimensions, allowing material and entities to pass through.',
    effect: 'Access to rare parallel dimension materials for 5 cycles',
    severity: 3,
  },
  {
    id: 'qs_evt_quantum_decay',
    name: 'Quantum Decay Event',
    nameZh: '量子衰变事件',
    description: 'Accelerated quantum decay affects the entire spire network, consuming stored resources.',
    effect: 'Lose 15% of all materials, gain 500 flux compensation',
    severity: 5,
  },
  {
    id: 'qs_evt_vacuum_fluctuation',
    name: 'Vacuum Fluctuation Spike',
    nameZh: '真空涨落峰值',
    description: 'A spike in vacuum fluctuations creates a brief window of enhanced quantum manipulation.',
    effect: 'All abilities cooldown reduced by 50% for 3 cycles',
    severity: 1,
  },
  {
    id: 'qs_evt_tensor_network_overload',
    name: 'Tensor Network Overload',
    nameZh: '张量网络过载',
    description: 'The tensor networks that process quantum information become temporarily overloaded with data.',
    effect: 'Research speed +200% for 4 cycles, structure building disabled',
    severity: 3,
  },
  {
    id: 'qs_evt_planck_disturbance',
    name: 'Planck Scale Disturbance',
    nameZh: '普朗克尺度扰动',
    description: 'A disturbance at the Planck scale sends ripples through the fabric of spacetime itself.',
    effect: 'Random entity receives +100% power boost for 5 cycles',
    severity: 4,
  },
  {
    id: 'qs_evt_schrödinger_migration',
    name: 'Schrödinger Migration',
    nameZh: '薛定谔迁徙',
    description: 'A massive migration of quantum cats between spires brings both chaos and unexpected benefits.',
    effect: 'All quantum_cat entities gain +50% coherence for 4 cycles',
    severity: 2,
  },
  {
    id: 'qs_evt_quantum_renaissance',
    name: 'Quantum Renaissance',
    nameZh: '量子文艺复兴',
    description: 'A golden age of quantum discovery begins, with breakthroughs happening in every field simultaneously.',
    effect: 'All stats and production doubled for 6 cycles',
    severity: 1,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: HELPER FUNCTIONS (pure, outside the hook)
// ═══════════════════════════════════════════════════════════════════

export function qsFindRarityColor(rarity: QSRarity): string {
  const found = QS_RARITIES.find((r) => r.id === rarity)
  return found ? found.color : '#A0AEC0'
}

export function qsFindSpeciesColor(species: QSEntitySpecies): string {
  const found = QS_SPECIES.find((s) => s.id === species)
  return found ? found.color : '#A0AEC0'
}

export function qsCalcRarityMultiplier(rarity: QSRarity): number {
  const found = QS_RARITIES.find((r) => r.id === rarity)
  return found ? found.multiplier : 1
}

export function qsCalcEntityTotalPower(entityId: string, level: number): number {
  const def = QS_ENTITIES.find((e) => e.id === entityId)
  if (!def) return 0
  const base = def.power + def.defense + def.coherence
  return Math.floor(base * level * qsCalcRarityMultiplier(def.rarity))
}

export function qsCalcStructureCost(structureId: string, currentLevel: number): number {
  const def = QS_STRUCTURES.find((s) => s.id === structureId)
  if (!def) return 0
  return Math.floor(def.costPerLevel * Math.pow(1.4, currentLevel))
}

export function qsCalcStructureBonus(structureId: string, level: number): number {
  const def = QS_STRUCTURES.find((s) => s.id === structureId)
  if (!def) return 0
  return def.bonusPerLevel * level
}

export function qsExpToLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

function createInitialEntities(): Record<string, EntityState> {
  const result: Record<string, EntityState> = {}
  for (const entity of QS_ENTITIES) {
    result[entity.id] = {
      awakened: false,
      level: 1,
      coherence: entity.coherence,
    }
  }
  return result
}

function createInitialSpires(): Record<string, SpireState> {
  const result: Record<string, SpireState> = {}
  for (const spire of QS_SPIRES) {
    result[spire.id] = {
      level: spire.height > 900 ? 2 : 1,
      active: false,
      resonance: 0,
    }
  }
  return result
}

function createInitialMaterials(): Record<string, number> {
  const result: Record<string, number> = {}
  for (const mat of QS_MATERIALS) {
    result[mat.id] = 0
  }
  return result
}

function createInitialStructures(): Record<string, number> {
  const result: Record<string, number> = {}
  for (const struct of QS_STRUCTURES) {
    result[struct.id] = 0
  }
  return result
}

const QS_INITIAL_STATE: QuantumSpiresState = {
  qsEntities: createInitialEntities(),
  qsSpires: createInitialSpires(),
  qsMaterials: createInitialMaterials(),
  qsArtifacts: [],
  qsAchievements: [],
  qsTitle: 'qs_title_observer',
  qsEvents: [],
  qsStructures: createInitialStructures(),
  qsStats: {
    totalAwakened: 0,
    totalEntanglements: 0,
    totalCollapses: 0,
    totalTunnels: 0,
    totalFluxGenerated: 0,
  },
  qsQuantumFlux: 0,
  qsLevel: 1,
}

const useQuantumSpiresStore = create<QuantumSpiresState>()(
  persist(
    () => ({
      ...QS_INITIAL_STATE,
    }),
    {
      name: 'quantum-spires-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: MAIN HOOK — useQuantumSpires
// ═══════════════════════════════════════════════════════════════════

export default function useQuantumSpires() {
  const state = useQuantumSpiresStore()
  const stateRef = useRef(state)

  // stateRef.current is only read inside useEffect
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // ─── Computed Values (all depend on state) ─────────────────────

  const qsSpiresActive = useMemo(() => {
    let count = 0
    const keys = Object.keys(state.qsSpires)
    for (let i = 0; i < keys.length; i++) {
      const s = state.qsSpires[keys[i]]
      if (s && s.active) count++
    }
    return count
  }, [state])

  const qsAwakenedCount = useMemo(() => {
    let count = 0
    const keys = Object.keys(state.qsEntities)
    for (let i = 0; i < keys.length; i++) {
      const e = state.qsEntities[keys[i]]
      if (e && e.awakened) count++
    }
    return count
  }, [state])

  const qsTotalPower = useMemo(() => {
    let total = 0
    const keys = Object.keys(state.qsEntities)
    for (let i = 0; i < keys.length; i++) {
      const id = keys[i]
      const e = state.qsEntities[id]
      if (e && e.awakened) {
        total += qsCalcEntityTotalPower(id, e.level)
      }
    }
    return total
  }, [state])

  const qsMaterialCount = useMemo(() => {
    let count = 0
    const keys = Object.keys(state.qsMaterials)
    for (let i = 0; i < keys.length; i++) {
      if (state.qsMaterials[keys[i]] > 0) count++
    }
    return count
  }, [state])

  const qsMaterialValue = useMemo(() => {
    let total = 0
    const keys = Object.keys(state.qsMaterials)
    for (let i = 0; i < keys.length; i++) {
      const id = keys[i]
      const amount = state.qsMaterials[id]
      if (amount > 0) {
        const def = QS_MATERIALS.find((m) => m.id === id)
        if (def) {
          total += def.value * amount
        }
      }
    }
    return total
  }, [state])

  const qsAchievementProgress = useMemo(() => {
    const total = QS_ACHIEVEMENTS.length
    let unlocked = 0
    const keys = Object.keys(state.qsAchievements)
    for (let i = 0; i < keys.length; i++) {
      if (state.qsAchievements[i]) unlocked++
    }
    return {
      total,
      unlocked,
      percentage: total > 0 ? Math.floor((unlocked / total) * 100) : 0,
    }
  }, [state])

  const qsArtifactPower = useMemo(() => {
    let total = 0
    for (let i = 0; i < state.qsArtifacts.length; i++) {
      const def = QS_ARTIFACTS.find((a) => a.id === state.qsArtifacts[i])
      if (def) total += def.power
    }
    return total
  }, [state])

  const qsAvailableEvents = useMemo(() => {
    return QS_EVENTS.filter(
      (e) => !state.qsEvents.includes(e.id)
    )
  }, [state])

  const qsStructureLevel = useMemo(() => {
    let total = 0
    const keys = Object.keys(state.qsStructures)
    for (let i = 0; i < keys.length; i++) {
      total += state.qsStructures[keys[i]]
    }
    return total
  }, [state])

  const qsTotalStructureBonus = useMemo(() => {
    let total = 0
    const keys = Object.keys(state.qsStructures)
    for (let i = 0; i < keys.length; i++) {
      const id = keys[i]
      const level = state.qsStructures[id]
      if (level > 0) {
        total += qsCalcStructureBonus(id, level)
      }
    }
    return total
  }, [state])

  const qsActiveSpireCount = useMemo(() => {
    let count = 0
    const keys = Object.keys(state.qsSpires)
    for (let i = 0; i < keys.length; i++) {
      const s = state.qsSpires[keys[i]]
      if (s && s.active) count++
    }
    return count
  }, [state])

  const qsCurrentTitleDef = useMemo(() => {
    return QS_TITLES.find((t) => t.id === state.qsTitle) ?? null
  }, [state])

  const qsAwakenedEntityDefs = useMemo(() => {
    const result: QSEntityDef[] = []
    const keys = Object.keys(state.qsEntities)
    for (let i = 0; i < keys.length; i++) {
      const e = state.qsEntities[keys[i]]
      if (e && e.awakened) {
        const def = QS_ENTITIES.find((d) => d.id === keys[i])
        if (def) result.push(def)
      }
    }
    return result
  }, [state])

  const qsRareMaterialCount = useMemo(() => {
    let count = 0
    const keys = Object.keys(state.qsMaterials)
    for (let i = 0; i < keys.length; i++) {
      const id = keys[i]
      if (state.qsMaterials[id] > 0) {
        const def = QS_MATERIALS.find((m) => m.id === id)
        if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
          count++
        }
      }
    }
    return count
  }, [state])

  const qsEventHistory = useMemo(() => {
    return state.qsEvents.map((id) => QS_EVENTS.find((e) => e.id === id) ?? null).filter(Boolean)
  }, [state])

  const qsHasRareEntity = useMemo(() => {
    const keys = Object.keys(state.qsEntities)
    for (let i = 0; i < keys.length; i++) {
      const e = state.qsEntities[keys[i]]
      if (e && e.awakened) {
        const def = QS_ENTITIES.find((d) => d.id === keys[i])
        if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
          return true
        }
      }
    }
    return false
  }, [state])

  const qsHasLegendaryEntity = useMemo(() => {
    const keys = Object.keys(state.qsEntities)
    for (let i = 0; i < keys.length; i++) {
      const e = state.qsEntities[keys[i]]
      if (e && e.awakened) {
        const def = QS_ENTITIES.find((d) => d.id === keys[i])
        if (def && def.rarity === 'legendary') {
          return true
        }
      }
    }
    return false
  }, [state])

  const qsEffectiveMultiplier = useMemo(() => {
    const titleDef = QS_TITLES.find((t) => t.id === state.qsTitle)
    const titleBonus = titleDef ? titleDef.bonusPercent : 0
    const artifactFactor = qsArtifactPower / 1000
    return 1 + titleBonus / 100 + artifactFactor
  }, [state, qsArtifactPower])

  // ═══════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════

  const qsAwaken = useMemo(() => {
    return (id: string): boolean => {
      const def = QS_ENTITIES.find((e) => e.id === id)
      if (!def) return false

      let awakened = false
      useQuantumSpiresStore.setState((prev) => {
        if (prev.qsEntities[id]?.awakened) return prev

        awakened = true
        return {
          qsEntities: {
            ...prev.qsEntities,
            [id]: { awakened: true, level: 1, coherence: def.coherence },
          },
          qsStats: {
            ...prev.qsStats,
            totalAwakened: prev.qsStats.totalAwakened + 1,
          },
          qsQuantumFlux: prev.qsQuantumFlux + 10,
        }
      })

      return awakened
    }
  }, [])

  const qsEntangle = useMemo(() => {
    return (): boolean => {
      let success = false
      useQuantumSpiresStore.setState((prev) => {
        success = true
        return {
          qsStats: {
            ...prev.qsStats,
            totalEntanglements: prev.qsStats.totalEntanglements + 1,
          },
          qsQuantumFlux: prev.qsQuantumFlux + 15,
        }
      })
      return success
    }
  }, [])

  const qsCollapseWave = useMemo(() => {
    return (): boolean => {
      let success = false
      useQuantumSpiresStore.setState((prev) => {
        success = true
        return {
          qsStats: {
            ...prev.qsStats,
            totalCollapses: prev.qsStats.totalCollapses + 1,
          },
          qsQuantumFlux: prev.qsQuantumFlux + 20,
        }
      })
      return success
    }
  }, [])

  const qsTunnel = useMemo(() => {
    return (): boolean => {
      let success = false
      useQuantumSpiresStore.setState((prev) => {
        success = true
        return {
          qsStats: {
            ...prev.qsStats,
            totalTunnels: prev.qsStats.totalTunnels + 1,
          },
          qsQuantumFlux: prev.qsQuantumFlux + 12,
        }
      })
      return success
    }
  }, [])

  const qsBuildSpire = useMemo(() => {
    return (id: string): boolean => {
      const def = QS_SPIRES.find((s) => s.id === id)
      if (!def) return false

      let success = false
      useQuantumSpiresStore.setState((prev) => {
        const current = prev.qsSpires[id]
        if (!current) return prev

        const newActive = !current.active
        const newLevel = newActive
          ? current.level
          : current.level
        const newResonance = newActive ? def.stability : 0

        success = true

        return {
          qsSpires: {
            ...prev.qsSpires,
            [id]: {
              level: newLevel,
              active: newActive,
              resonance: newResonance,
            },
          },
          qsQuantumFlux: prev.qsQuantumFlux + (newActive ? 25 : 0),
        }
      })

      return success
    }
  }, [])

  const qsUpgradeEntity = useMemo(() => {
    return (id: string): boolean => {
      const def = QS_ENTITIES.find((e) => e.id === id)
      if (!def) return false

      let success = false
      useQuantumSpiresStore.setState((prev) => {
        const current = prev.qsEntities[id]
        if (!current || !current.awakened) return prev
        if (current.level >= 10) return prev

        const newCoherence = current.coherence + def.coherence
        success = true

        return {
          qsEntities: {
            ...prev.qsEntities,
            [id]: {
              ...current,
              level: current.level + 1,
              coherence: newCoherence,
            },
          },
          qsQuantumFlux: prev.qsQuantumFlux + 5 * (current.level + 1),
        }
      })

      return success
    }
  }, [])

  const qsBuildStructure = useMemo(() => {
    return (id: string): boolean => {
      const def = QS_STRUCTURES.find((s) => s.id === id)
      if (!def) return false

      let success = false
      useQuantumSpiresStore.setState((prev) => {
        const currentLevel = prev.qsStructures[id] || 0
        if (currentLevel >= def.maxLevel) return prev

        const cost = qsCalcStructureCost(id, currentLevel)
        if (prev.qsQuantumFlux < cost) return prev

        success = true
        return {
          qsStructures: {
            ...prev.qsStructures,
            [id]: currentLevel + 1,
          },
          qsQuantumFlux: prev.qsQuantumFlux - cost,
        }
      })

      return success
    }
  }, [])

  const qsActivateArtifact = useMemo(() => {
    return (id: string): boolean => {
      const def = QS_ARTIFACTS.find((a) => a.id === id)
      if (!def) return false

      let success = false
      useQuantumSpiresStore.setState((prev) => {
        if (prev.qsArtifacts.includes(id)) return prev

        success = true
        return {
          qsArtifacts: [...prev.qsArtifacts, id],
        }
      })

      return success
    }
  }, [])

  const qsTriggerEvent = useMemo(() => {
    return (): QSEventDef | null => {
      const available = QS_EVENTS.filter(
        (e) => !useQuantumSpiresStore.getState().qsEvents.includes(e.id)
      )

      if (available.length === 0) return null

      const randomEvent = available[Math.floor(Math.random() * available.length)]

      useQuantumSpiresStore.setState((prev) => ({
        qsEvents: [...prev.qsEvents, randomEvent.id],
        qsQuantumFlux: prev.qsQuantumFlux + randomEvent.severity * 20,
      }))

      return randomEvent
    }
  }, [])

  const qsResetQuantumSpires = useMemo(() => {
    return () => {
      useQuantumSpiresStore.setState({
        ...QS_INITIAL_STATE,
      })
    }
  }, [])

  const qsAddMaterial = useMemo(() => {
    return (materialId: string, amount: number): boolean => {
      if (amount <= 0) return false

      useQuantumSpiresStore.setState((prev) => {
        const current = prev.qsMaterials[materialId]
        if (current === undefined) return prev

        return {
          qsMaterials: {
            ...prev.qsMaterials,
            [materialId]: current + amount,
          },
        }
      })

      return true
    }
  }, [])

  const qsRemoveMaterial = useMemo(() => {
    return (materialId: string, amount: number): boolean => {
      if (amount <= 0) return false

      let removed = false
      useQuantumSpiresStore.setState((prev) => {
        const current = prev.qsMaterials[materialId]
        if (current === undefined || current < amount) return prev

        removed = true
        return {
          qsMaterials: {
            ...prev.qsMaterials,
            [materialId]: current - amount,
          },
        }
      })

      return removed
    }
  }, [])

  const qsSetTitle = useMemo(() => {
    return (titleId: string): boolean => {
      const def = QS_TITLES.find((t) => t.id === titleId)
      if (!def) return false

      useQuantumSpiresStore.setState({ qsTitle: titleId })
      return true
    }
  }, [])

  const qsSpendFlux = useMemo(() => {
    return (amount: number): boolean => {
      if (amount <= 0) return false

      let spent = false
      useQuantumSpiresStore.setState((prev) => {
        if (prev.qsQuantumFlux < amount) return prev

        spent = true
        return {
          qsQuantumFlux: prev.qsQuantumFlux - amount,
        }
      })

      return spent
    }
  }, [])

  const qsGenerateFlux = useMemo(() => {
    return (amount: number): void => {
      if (amount <= 0) return

      useQuantumSpiresStore.setState((prev) => ({
        qsQuantumFlux: prev.qsQuantumFlux + amount,
        qsStats: {
          ...prev.qsStats,
          totalFluxGenerated: prev.qsStats.totalFluxGenerated + amount,
        },
      }))
    }
  }, [])

  // ─── Lookup Helper Functions ───────────────────────────────────

  const qsGetEntityDef = (id: string): QSEntityDef | null => {
    return QS_ENTITIES.find((e) => e.id === id) ?? null
  }

  const qsGetSpireDef = (id: string): QSSpireDef | null => {
    return QS_SPIRES.find((s) => s.id === id) ?? null
  }

  const qsGetMaterialDef = (id: string): QSMaterialDef | null => {
    return QS_MATERIALS.find((m) => m.id === id) ?? null
  }

  const qsGetStructureDef = (id: string): QSStructureDef | null => {
    return QS_STRUCTURES.find((s) => s.id === id) ?? null
  }

  const qsGetAbilityDef = (id: string): QSAbilityDef | null => {
    return QS_ABILITIES.find((a) => a.id === id) ?? null
  }

  const qsGetAchievementDef = (id: string): QSAchievementDef | null => {
    return QS_ACHIEVEMENTS.find((a) => a.id === id) ?? null
  }

  const qsGetTitleDef = (id: string): QSTitleDef | null => {
    return QS_TITLES.find((t) => t.id === id) ?? null
  }

  const qsGetArtifactDef = (id: string): QSArtifactDef | null => {
    return QS_ARTIFACTS.find((a) => a.id === id) ?? null
  }

  const qsGetEventDef = (id: string): QSEventDef | null => {
    return QS_EVENTS.find((e) => e.id === id) ?? null
  }

  const qsGetRarityDef = (id: string): (typeof QS_RARITIES)[number] | null => {
    return QS_RARITIES.find((r) => r.id === id) ?? null
  }

  const qsGetSpeciesDef = (id: string): (typeof QS_SPECIES)[number] | null => {
    return QS_SPECIES.find((s) => s.id === id) ?? null
  }

  const qsFindRarityColorFor = (rarity: QSRarity): string => {
    return qsFindRarityColor(rarity)
  }

  const qsFindSpeciesColorFor = (species: QSEntitySpecies): string => {
    return qsFindSpeciesColor(species)
  }

  const qsCalcRarityMultiplierFor = (rarity: QSRarity): number => {
    return qsCalcRarityMultiplier(rarity)
  }

  const qsCalcStructureCostFor = (structureId: string, currentLevel: number): number => {
    return qsCalcStructureCost(structureId, currentLevel)
  }

  const qsCalcStructureBonusFor = (structureId: string, level: number): number => {
    return qsCalcStructureBonus(structureId, level)
  }

  const qsCalcEntityPowerFor = (entityId: string, level: number): number => {
    return qsCalcEntityTotalPower(entityId, level)
  }

  // ─── Compose and Return the qsAPI Object ───────────────────────

  const qsAPI = {
    // ── Constants (Pattern A: directly on API) ─────────────────
    QS_ENTITIES,
    QS_SPIRES,
    QS_MATERIALS,
    QS_STRUCTURES,
    QS_ABILITIES,
    QS_ACHIEVEMENTS,
    QS_TITLES,
    QS_ARTIFACTS,
    QS_EVENTS,
    QS_SPECIES,
    QS_RARITIES,
    QS_MAX_STRUCTURE_LEVEL,
    QS_SPECIES_COUNT,
    QS_RARITY_TIER_COUNT,
    QS_THEME,
    QS_QUANTUM_CYAN,
    QS_SPIRE_GOLD,
    QS_FLUX_VIOLET,
    QS_WAVE_BLUE,
    QS_DEEP_VOID,
    QS_SUPERPOSITION_WHITE,
    QS_ENTANGLE_PURPLE,
    QS_DECOHERENCE_RED,
    QS_TENSOR_GREEN,
    QS_PLANCK_SILVER,

    // ── State ──────────────────────────────────────────────────
    qsState: state,
    qsLevel: state.qsLevel,
    qsQuantumFlux: state.qsQuantumFlux,
    qsSpiresActive: qsSpiresActive,

    // ── Computed Values ────────────────────────────────────────
    qsAwakenedCount,
    qsTotalPower,
    qsMaterialCount,
    qsMaterialValue,
    qsAchievementProgress,
    qsArtifactPower,
    qsAvailableEvents,
    qsStructureLevel,
    qsTotalStructureBonus,
    qsActiveSpireCount,
    qsCurrentTitleDef,
    qsAwakenedEntityDefs,
    qsRareMaterialCount,
    qsEventHistory,
    qsHasRareEntity,
    qsHasLegendaryEntity,
    qsEffectiveMultiplier,

    // ── Action Functions ───────────────────────────────────────
    qsAwaken,
    qsEntangle,
    qsCollapseWave,
    qsTunnel,
    qsBuildSpire,
    qsUpgradeEntity,
    qsBuildStructure,
    qsActivateArtifact,
    qsTriggerEvent,
    qsResetQuantumSpires,
    qsAddMaterial,
    qsRemoveMaterial,
    qsSetTitle,
    qsSpendFlux,
    qsGenerateFlux,

    // ── Lookup Helpers ─────────────────────────────────────────
    qsGetEntityDef,
    qsGetSpireDef,
    qsGetMaterialDef,
    qsGetStructureDef,
    qsGetAbilityDef,
    qsGetAchievementDef,
    qsGetTitleDef,
    qsGetArtifactDef,
    qsGetEventDef,
    qsGetRarityDef,
    qsGetSpeciesDef,
    qsFindRarityColorFor,
    qsFindSpeciesColorFor,
    qsCalcRarityMultiplierFor,
    qsCalcStructureCostFor,
    qsCalcStructureBonusFor,
    qsCalcEntityPowerFor,
    qsExpToLevel,
    qsFindRarityColor,
    qsFindSpeciesColor,
    qsCalcRarityMultiplier,
    qsCalcEntityTotalPower,
    qsCalcStructureCost,
    qsCalcStructureBonus,
  }

  return qsAPI
}
