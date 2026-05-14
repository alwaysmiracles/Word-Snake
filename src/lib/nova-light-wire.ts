'use client';

import { useMemo, useCallback, useEffect, useRef } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ═══════════════════════════════════════════════════════════════════════════
   NOVA LIGHT  新星之光  —  Radiant Stellar Beings Wire Module
   Theme: Radiant beings of pure stellar energy from newborn stars
   Color Theme: Nova Gold #FFD700 · Stellar White #FFFAF0 · Nebula Pink #FF69B4 · Cosmic Blue #0000CD
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── Color Constants ────────────────────────────────────────────────────────
const NL_NOVA_GOLD = '#FFD700';
const NL_STELLAR_WHITE = '#FFFAF0';
const NL_NEBULA_PINK = '#FF69B4';
const NL_COSMIC_BLUE = '#0000CD';
const NL_SOLAR_FLARE = '#FF8C00';
const NL_PHOTON_GLOW = '#FFFACD';
const NL_AURORA_GREEN = '#00FF7F';
const NL_VOID_PURPLE = '#8B00FF';

// ─── Rarity Constants ──────────────────────────────────────────────────────
const NL_RARITY_COMMON = 'common' as const;
const NL_RARITY_UNCOMMON = 'uncommon' as const;
const NL_RARITY_RARE = 'rare' as const;
const NL_RARITY_EPIC = 'epic' as const;
const NL_RARITY_LEGENDARY = 'legendary' as const;

const NL_RARITY_COLORS: Record<string, string> = {
  [NL_RARITY_COMMON]: '#A0A0A0',
  [NL_RARITY_UNCOMMON]: '#4CAF50',
  [NL_RARITY_RARE]: NL_COSMIC_BLUE,
  [NL_RARITY_EPIC]: NL_NEBULA_PINK,
  [NL_RARITY_LEGENDARY]: NL_NOVA_GOLD,
};

const NL_RARITY_MULTIPLIER: Record<string, number> = {
  [NL_RARITY_COMMON]: 1,
  [NL_RARITY_UNCOMMON]: 1.5,
  [NL_RARITY_RARE]: 2.5,
  [NL_RARITY_EPIC]: 4,
  [NL_RARITY_LEGENDARY]: 7,
};

const NL_RARITY_ORDER = [
  NL_RARITY_COMMON,
  NL_RARITY_UNCOMMON,
  NL_RARITY_RARE,
  NL_RARITY_EPIC,
  NL_RARITY_LEGENDARY,
] as const;

// ─── Species Constants ─────────────────────────────────────────────────────
const NL_SPECIES_SOLAR_FLARE = 'solar_flare' as const;
const NL_SPECIES_NEBULA_SPRITE = 'nebula_sprite' as const;
const NL_SPECIES_PULSAR_WISP = 'pulsar_wisp' as const;
const NL_SPECIES_QUASAR_SPIRIT = 'quasar_spirit' as const;
const NL_SPECIES_PHOTON_SERAPH = 'photon_seraph' as const;
const NL_SPECIES_STARDUST_FAIRY = 'stardust_fairy' as const;
const NL_SPECIES_COSMIC_RAY = 'cosmic_ray' as const;

const NL_SPECIES_COLORS: Record<string, string> = {
  [NL_SPECIES_SOLAR_FLARE]: NL_NOVA_GOLD,
  [NL_SPECIES_NEBULA_SPRITE]: NL_NEBULA_PINK,
  [NL_SPECIES_PULSAR_WISP]: NL_COSMIC_BLUE,
  [NL_SPECIES_QUASAR_SPIRIT]: NL_VOID_PURPLE,
  [NL_SPECIES_PHOTON_SERAPH]: NL_STELLAR_WHITE,
  [NL_SPECIES_STARDUST_FAIRY]: NL_AURORA_GREEN,
  [NL_SPECIES_COSMIC_RAY]: NL_SOLAR_FLARE,
};

const NL_SPECIES_LABELS: Record<string, string> = {
  [NL_SPECIES_SOLAR_FLARE]: '太阳耀斑',
  [NL_SPECIES_NEBULA_SPRITE]: '星云精灵',
  [NL_SPECIES_PULSAR_WISP]: '脉冲幽灵',
  [NL_SPECIES_QUASAR_SPIRIT]: '类星灵体',
  [NL_SPECIES_PHOTON_SERAPH]: '光子炽天使',
  [NL_SPECIES_STARDUST_FAIRY]: '星尘仙子',
  [NL_SPECIES_COSMIC_RAY]: '宇宙射线',
};

const NL_SPECIES_ORDER = [
  NL_SPECIES_SOLAR_FLARE,
  NL_SPECIES_NEBULA_SPRITE,
  NL_SPECIES_PULSAR_WISP,
  NL_SPECIES_QUASAR_SPIRIT,
  NL_SPECIES_PHOTON_SERAPH,
  NL_SPECIES_STARDUST_FAIRY,
  NL_SPECIES_COSMIC_RAY,
] as const;

// ─── Theme Object ──────────────────────────────────────────────────────────
const NL_THEME = {
  novaGold: NL_NOVA_GOLD,
  stellarWhite: NL_STELLAR_WHITE,
  nebulaPink: NL_NEBULA_PINK,
  cosmicBlue: NL_COSMIC_BLUE,
  solarFlare: NL_SOLAR_FLARE,
  photonGlow: NL_PHOTON_GLOW,
  auroraGreen: NL_AURORA_GREEN,
  voidPurple: NL_VOID_PURPLE,
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

export type NLRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type NLSpecies =
  | 'solar_flare'
  | 'nebula_sprite'
  | 'pulsar_wisp'
  | 'quasar_spirit'
  | 'photon_seraph'
  | 'stardust_fairy'
  | 'cosmic_ray';

interface NLRadiantDef {
  readonly id: string;
  readonly name: string;
  readonly nameZh: string;
  readonly species: NLSpecies;
  readonly rarity: NLRarity;
  readonly luminosity: number;
  readonly warmth: number;
  readonly velocity: number;
  readonly description: string;
}

interface NLConstellationDef {
  readonly id: string;
  readonly name: string;
  readonly nameZh: string;
  readonly location: string;
  readonly baseEnergy: number;
  readonly passiveBonus: string;
  readonly description: string;
  readonly color: string;
}

interface NLMaterialDef {
  readonly id: string;
  readonly name: string;
  readonly nameZh: string;
  readonly rarity: NLRarity;
  readonly category: string;
  readonly description: string;
  readonly color: string;
}

interface NLStructureDef {
  readonly id: string;
  readonly name: string;
  readonly nameZh: string;
  readonly category: string;
  readonly maxLevel: number;
  readonly baseCost: number;
  readonly costMultiplier: number;
  readonly effect: string;
  readonly description: string;
  readonly color: string;
}

interface NLAbilityDef {
  readonly id: string;
  readonly name: string;
  readonly nameZh: string;
  readonly type: string;
  readonly cooldown: number;
  readonly duration: number;
  readonly power: number;
  readonly luminosityCost: number;
  readonly description: string;
  readonly color: string;
}

interface NLAchievementDef {
  readonly id: string;
  readonly name: string;
  readonly nameZh: string;
  readonly description: string;
  readonly conditionKey: string;
  readonly threshold: number;
  readonly reward: number;
  readonly color: string;
}

interface NLTitleDef {
  readonly id: string;
  readonly name: string;
  readonly nameZh: string;
  readonly requirement: number;
  readonly description: string;
  readonly color: string;
}

interface NLArtifactDef {
  readonly id: string;
  readonly name: string;
  readonly nameZh: string;
  readonly rarity: NLRarity;
  readonly power: number;
  readonly description: string;
  readonly color: string;
}

interface NLEventDef {
  readonly id: string;
  readonly name: string;
  readonly nameZh: string;
  readonly type: string;
  readonly duration: number;
  readonly reward: { materialId: string; amount: number }[];
  readonly description: string;
  readonly color: string;
}

interface NLRadiantState {
  hired: boolean;
  level: number;
  experience: number;
  constellationId: string | null;
}

interface NLStructureState {
  level: number;
  built: boolean;
}

interface NLStats {
  totalIgnited: number;
  totalNovaBursts: number;
  totalRadianceEmitted: number;
  totalConstellationsFormed: number;
  totalMaterialsHarvested: number;
  totalStarborn: number;
  highestCombo: number;
  currentStreak: number;
}

interface NLState {
  nlRadiants: Record<string, NLRadiantState>;
  nlConstellations: Record<string, boolean>;
  nlInventory: Record<string, number>;
  nlStructures: Record<string, NLStructureState>;
  nlArtifacts: string[];
  nlAchievements: string[];
  nlEvents: string[];
  nlTitle: string;
  nlLevel: number;
  nlLuminosity: number;
  nlStarborn: number;
  nlStats: NLStats;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: 35 RADIANTS (5 Rarity × 7 Species)
// ═══════════════════════════════════════════════════════════════════════════

const NL_RADIANTS: Record<string, NLRadiantDef> = {
  // ── Common (7) ─────────────────────────────────────────────────────
  nlr_c_sf_01: {
    id: 'nlr_c_sf_01', name: 'Ember Wisp', nameZh: '余烬微光',
    species: NL_SPECIES_SOLAR_FLARE, rarity: NL_RARITY_COMMON,
    luminosity: 10, warmth: 8, velocity: 6,
    description: '太阳耀斑中最微弱的光芒凝聚而成的新星之光，虽小却温暖永恒。',
  },
  nlr_c_ns_02: {
    id: 'nlr_c_ns_02', name: 'Nebula Spark', nameZh: '星云火花',
    species: NL_SPECIES_NEBULA_SPRITE, rarity: NL_RARITY_COMMON,
    luminosity: 8, warmth: 6, velocity: 10,
    description: '星云深处闪烁的细小火花，在暗夜中绽放出粉紫色的柔和光芒。',
  },
  nlr_c_pw_03: {
    id: 'nlr_c_pw_03', name: 'Pulse Flicker', nameZh: '脉冲闪烁',
    species: NL_SPECIES_PULSAR_WISP, rarity: NL_RARITY_COMMON,
    luminosity: 6, warmth: 4, velocity: 14,
    description: '跟随脉冲星节拍闪烁的微光体，以宇宙中最快的信号频率振动。',
  },
  nlr_c_qs_04: {
    id: 'nlr_c_qs_04', name: 'Quasar Echo', nameZh: '类星回声',
    species: NL_SPECIES_QUASAR_SPIRIT, rarity: NL_RARITY_COMMON,
    luminosity: 12, warmth: 10, velocity: 4,
    description: '遥远类星体的能量回响，紫色光芒中蕴含古老星系的记忆。',
  },
  nlr_c_ps_05: {
    id: 'nlr_c_ps_05', name: 'Photon Flit', nameZh: '光子飞舞',
    species: NL_SPECIES_PHOTON_SERAPH, rarity: NL_RARITY_COMMON,
    luminosity: 14, warmth: 12, velocity: 8,
    description: '纯光子构成的微小炽天使，在星际间穿梭传递着创世之光。',
  },
  nlr_c_df_06: {
    id: 'nlr_c_df_06', name: 'Dust Mote', nameZh: '星尘微粒',
    species: NL_SPECIES_STARDUST_FAIRY, rarity: NL_RARITY_COMMON,
    luminosity: 8, warmth: 6, velocity: 12,
    description: '由宇宙星尘凝聚而成的仙子，翠绿色的翅膀在微风中轻柔飘荡。',
  },
  nlr_c_cr_07: {
    id: 'nlr_c_cr_07', name: 'Ray Drift', nameZh: '射线漂流',
    species: NL_SPECIES_COSMIC_RAY, rarity: NL_RARITY_COMMON,
    luminosity: 10, warmth: 4, velocity: 16,
    description: '宇宙射线的残余能量形成的漂流光体，速度快但热度稍逊。',
  },

  // ── Uncommon (7) ───────────────────────────────────────────────────
  nlr_u_sf_08: {
    id: 'nlr_u_sf_08', name: 'Flare Dancer', nameZh: '耀斑舞者',
    species: NL_SPECIES_SOLAR_FLARE, rarity: NL_RARITY_UNCOMMON,
    luminosity: 22, warmth: 18, velocity: 14,
    description: '在太阳耀斑中起舞的光之精灵，金色舞姿照亮整个日冕层。',
  },
  nlr_u_ns_09: {
    id: 'nlr_u_ns_09', name: 'Nebula Weaver', nameZh: '星云编织者',
    species: NL_SPECIES_NEBULA_SPRITE, rarity: NL_RARITY_UNCOMMON,
    luminosity: 20, warmth: 14, velocity: 20,
    description: '将星云中的粉色丝线编织成美丽图案的精灵，作品如梦似幻。',
  },
  nlr_u_pw_10: {
    id: 'nlr_u_pw_10', name: 'Pulse Runner', nameZh: '脉冲奔跑者',
    species: NL_SPECIES_PULSAR_WISP, rarity: NL_RARITY_UNCOMMON,
    luminosity: 18, warmth: 10, velocity: 28,
    description: '沿着脉冲星磁力线奔跑的光之使者，蓝色尾迹横跨星际。',
  },
  nlr_u_qs_11: {
    id: 'nlr_u_qs_11', name: 'Quasar Warden', nameZh: '类星守护者',
    species: NL_SPECIES_QUASAR_SPIRIT, rarity: NL_RARITY_UNCOMMON,
    luminosity: 26, warmth: 22, velocity: 8,
    description: '守卫类星体边界的紫色灵体，其力量足以扭曲周围时空。',
  },
  nlr_u_ps_12: {
    id: 'nlr_u_ps_12', name: 'Seraph Herald', nameZh: '炽天使传令官',
    species: NL_SPECIES_PHOTON_SERAPH, rarity: NL_RARITY_UNCOMMON,
    luminosity: 28, warmth: 24, velocity: 16,
    description: '光子炽天使中的传令官，纯白羽翼散发着神圣不可侵犯的辉光。',
  },
  nlr_u_df_13: {
    id: 'nlr_u_df_13', name: 'Stardust Bard', nameZh: '星尘吟游者',
    species: NL_SPECIES_STARDUST_FAIRY, rarity: NL_RARITY_UNCOMMON,
    luminosity: 20, warmth: 16, velocity: 22,
    description: '弹奏星尘琴弦的仙子诗人，翠绿色旋律能治愈一切伤痕。',
  },
  nlr_u_cr_14: {
    id: 'nlr_u_cr_14', name: 'Ray Striker', nameZh: '射线突击者',
    species: NL_SPECIES_COSMIC_RAY, rarity: NL_RARITY_UNCOMMON,
    luminosity: 24, warmth: 12, velocity: 30,
    description: '以宇宙射线为武器的突击战士，橙色光束可穿透数层护盾。',
  },

  // ── Rare (7) ───────────────────────────────────────────────────────
  nlr_r_sf_15: {
    id: 'nlr_r_sf_15', name: 'Solar Phoenix', nameZh: '太阳凤凰',
    species: NL_SPECIES_SOLAR_FLARE, rarity: NL_RARITY_RARE,
    luminosity: 42, warmth: 36, velocity: 24,
    description: '从太阳核心涅槃重生的金色凤凰，每一次焚灭都是新生的开始。',
  },
  nlr_r_ns_16: {
    id: 'nlr_r_ns_16', name: 'Nebula Enchantress', nameZh: '星云女巫',
    species: NL_SPECIES_NEBULA_SPRITE, rarity: NL_RARITY_RARE,
    luminosity: 38, warmth: 28, velocity: 34,
    description: '掌控星云魔法的神秘女巫，粉色咒语可令星辰改变轨道。',
  },
  nlr_r_pw_17: {
    id: 'nlr_r_pw_17', name: 'Pulsar Stalker', nameZh: '脉冲猎手',
    species: NL_SPECIES_PULSAR_WISP, rarity: NL_RARITY_RARE,
    luminosity: 34, warmth: 20, velocity: 48,
    description: '追踪脉冲信号的蓝色猎手，从未在追踪中失败过一次。',
  },
  nlr_r_qs_18: {
    id: 'nlr_r_qs_18', name: 'Quasar Oracle', nameZh: '类星先知',
    species: NL_SPECIES_QUASAR_SPIRIT, rarity: NL_RARITY_RARE,
    luminosity: 48, warmth: 40, velocity: 14,
    description: '从类星体辐射中读取未来的紫色先知，预言从未落空。',
  },
  nlr_r_ps_19: {
    id: 'nlr_r_ps_19', name: 'Photon Archon', nameZh: '光子执政官',
    species: NL_SPECIES_PHOTON_SERAPH, rarity: NL_RARITY_RARE,
    luminosity: 52, warmth: 44, velocity: 28,
    description: '光子族的至高执政官，白色裁决之光可净化一切暗能量。',
  },
  nlr_r_df_20: {
    id: 'nlr_r_df_20', name: 'Stardust Sovereign', nameZh: '星尘女王',
    species: NL_SPECIES_STARDUST_FAIRY, rarity: NL_RARITY_RARE,
    luminosity: 40, warmth: 32, velocity: 38,
    description: '统治星尘王国的翠绿女王，其王冠由银河最纯粹的尘埃编织。',
  },
  nlr_r_cr_21: {
    id: 'nlr_r_cr_21', name: 'Ray Tempest', nameZh: '射线风暴',
    species: NL_SPECIES_COSMIC_RAY, rarity: NL_RARITY_RARE,
    luminosity: 44, warmth: 22, velocity: 52,
    description: '化身为宇宙射线风暴的橙色战士，所到之处寸草不生。',
  },

  // ── Epic (7) ───────────────────────────────────────────────────────
  nlr_e_sf_22: {
    id: 'nlr_e_sf_22', name: 'Corona Empress', nameZh: '日冕女皇',
    species: NL_SPECIES_SOLAR_FLARE, rarity: NL_RARITY_EPIC,
    luminosity: 72, warmth: 62, velocity: 38,
    description: '统御日冕层的金色女皇，其冕旒由亿万个微型耀斑构成。',
  },
  nlr_e_ns_23: {
    id: 'nlr_e_ns_23', name: 'Nebula Matriarch', nameZh: '星云母神',
    species: NL_SPECIES_NEBULA_SPRITE, rarity: NL_RARITY_EPIC,
    luminosity: 66, warmth: 48, velocity: 56,
    description: '孕育了无数星云精灵的粉色母神，其怀抱即是温柔的摇篮。',
  },
  nlr_e_pw_24: {
    id: 'nlr_e_pw_24', name: 'Pulsar Zenith', nameZh: '脉冲巅峰',
    species: NL_SPECIES_PULSAR_WISP, rarity: NL_RARITY_EPIC,
    luminosity: 58, warmth: 34, velocity: 78,
    description: '在脉冲星辐射峰值诞生的蓝色生命体，速度超越光速极限。',
  },
  nlr_e_qs_25: {
    id: 'nlr_e_qs_25', name: 'Quasar Dimensional', nameZh: '类星维界使',
    species: NL_SPECIES_QUASAR_SPIRIT, rarity: NL_RARITY_EPIC,
    luminosity: 82, warmth: 68, velocity: 22,
    description: '在类星体与平行维度之间穿梭的紫色使者，其力量无远弗届。',
  },
  nlr_e_ps_26: {
    id: 'nlr_e_ps_26', name: 'Photon Seraphim', nameZh: '炽天使长',
    species: NL_SPECIES_PHOTON_SERAPH, rarity: NL_RARITY_EPIC,
    luminosity: 88, warmth: 74, velocity: 44,
    description: '炽天使阶位的最高存在，六翼纯白之光笼罩整个星域。',
  },
  nlr_e_df_27: {
    id: 'nlr_e_df_27', name: 'Stardust Goddess', nameZh: '星尘女神',
    species: NL_SPECIES_STARDUST_FAIRY, rarity: NL_RARITY_EPIC,
    luminosity: 68, warmth: 54, velocity: 62,
    description: '由永恒星尘凝聚而成的翠绿女神，其眼泪能化为新的星系。',
  },
  nlr_e_cr_28: {
    id: 'nlr_e_cr_28', name: 'Cosmic Ray Lord', nameZh: '宇宙射线之主',
    species: NL_SPECIES_COSMIC_RAY, rarity: NL_RARITY_EPIC,
    luminosity: 76, warmth: 38, velocity: 86,
    description: '掌控一切宇宙射线的橙色主宰，其意志即是辐射的方向。',
  },

  // ── Legendary (7) ──────────────────────────────────────────────────
  nlr_l_sf_29: {
    id: 'nlr_l_sf_29', name: 'Solar Genesis', nameZh: '太阳创世者',
    species: NL_SPECIES_SOLAR_FLARE, rarity: NL_RARITY_LEGENDARY,
    luminosity: 120, warmth: 100, velocity: 60,
    description: '传说中点燃第一颗恒星的创世者，金色光芒可照亮整个宇宙。',
  },
  nlr_l_ns_30: {
    id: 'nlr_l_ns_30', name: 'Nebula Cosmos', nameZh: '星云宇宙',
    species: NL_SPECIES_NEBULA_SPRITE, rarity: NL_RARITY_LEGENDARY,
    luminosity: 112, warmth: 80, velocity: 90,
    description: '本身就是一座星云的粉色宇宙精灵，体内孕育着无数新星。',
  },
  nlr_l_pw_31: {
    id: 'nlr_l_pw_31', name: 'Pulsar Infinity', nameZh: '脉冲永恒',
    species: NL_SPECIES_PULSAR_WISP, rarity: NL_RARITY_LEGENDARY,
    luminosity: 100, warmth: 56, velocity: 120,
    description: '存在于永恒脉冲中的蓝色生命体，其节拍即是宇宙的脉搏。',
  },
  nlr_l_qs_32: {
    id: 'nlr_l_qs_32', name: 'Quasar Origin', nameZh: '类星起源',
    species: NL_SPECIES_QUASAR_SPIRIT, rarity: NL_RARITY_LEGENDARY,
    luminosity: 138, warmth: 116, velocity: 34,
    description: '宇宙中最古老类星体的紫色意识体，见证了万物从混沌中诞生。',
  },
  nlr_l_ps_33: {
    id: 'nlr_l_ps_33', name: 'Photon Omnipotent', nameZh: '光子全能者',
    species: NL_SPECIES_PHOTON_SERAPH, rarity: NL_RARITY_LEGENDARY,
    luminosity: 148, warmth: 128, velocity: 68,
    description: '由纯粹光子构成的白色全能存在，其一念可令黑暗化为光明。',
  },
  nlr_l_df_34: {
    id: 'nlr_l_df_34', name: 'Stardust Eternal', nameZh: '星尘永恒',
    species: NL_SPECIES_STARDUST_FAIRY, rarity: NL_RARITY_LEGENDARY,
    luminosity: 116, warmth: 92, velocity: 100,
    description: '从宇宙大爆炸的星尘中诞生的翠绿永生者，永不会消逝。',
  },
  nlr_l_cr_35: {
    id: 'nlr_l_cr_35', name: 'Cosmic Ray Genesis', nameZh: '宇宙射线创生',
    species: NL_SPECIES_COSMIC_RAY, rarity: NL_RARITY_LEGENDARY,
    luminosity: 130, warmth: 66, velocity: 140,
    description: '一切宇宙射线的起源与终结，橙色之力贯穿时空维度的壁垒。',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: 8 CONSTELLATIONS (Locations)
// ═══════════════════════════════════════════════════════════════════════════

const NL_CONSTELLATIONS: Record<string, NLConstellationDef> = {
  nlc_genesis_star: {
    id: 'nlc_genesis_star', name: 'Genesis Star', nameZh: '创世之星',
    location: 'Genesis Star',
    baseEnergy: 500,
    passiveBonus: '+15% 新星之光产出',
    color: NL_NOVA_GOLD,
    description: '宇宙诞生的第一颗恒星，至今仍在散发创世时的原始光辉。',
  },
  nlc_pulsar_lighthouse: {
    id: 'nlc_pulsar_lighthouse', name: 'Pulsar Lighthouse', nameZh: '脉冲灯塔',
    location: 'Pulsar Lighthouse',
    baseEnergy: 600,
    passiveBonus: '+20% 射线速度',
    color: NL_COSMIC_BLUE,
    description: '矗立在脉冲星上的巨型灯塔，蓝色光柱为迷途者指引方向。',
  },
  nlc_nebula_cradle: {
    id: 'nlc_nebula_cradle', name: 'Nebula Cradle', nameZh: '星云摇篮',
    location: 'Nebula Cradle',
    baseEnergy: 700,
    passiveBonus: '+10% 星尘获取率',
    color: NL_NEBULA_PINK,
    description: '孕育新星生命的粉紫色星云，温暖如母亲的怀抱。',
  },
  nlc_supernova_core: {
    id: 'nlc_supernova_core', name: 'Supernova Core', nameZh: '超新星核心',
    location: 'Supernova Core',
    baseEnergy: 900,
    passiveBonus: '+25% 能量爆发伤害',
    color: NL_STELLAR_WHITE,
    description: '超新星爆发的中心地带，蕴含着毁灭与新生的双重力量。',
  },
  nlc_stellar_nursery: {
    id: 'nlc_stellar_nursery', name: 'Stellar Nursery', nameZh: '恒星育婴室',
    location: 'Stellar Nursery',
    baseEnergy: 550,
    passiveBonus: '+12% 治疗效果',
    color: NL_AURORA_GREEN,
    description: '新生恒星聚集的翠绿空间，每时每刻都有新星在此点亮。',
  },
  nlc_aurora_crown: {
    id: 'nlc_aurora_crown', name: 'Aurora Crown', nameZh: '极光冠冕',
    location: 'Aurora Crown',
    baseEnergy: 800,
    passiveBonus: '+18% 全属性加成',
    color: NL_SOLAR_FLARE,
    description: '环绕恒星赤道的极光环带，如同一顶由光线编织的皇冠。',
  },
  nlc_photon_forge: {
    id: 'nlc_photon_forge', name: 'Photon Forge', nameZh: '光子锻造炉',
    location: 'Photon Forge',
    baseEnergy: 750,
    passiveBonus: '+20% 材料精炼效率',
    color: NL_PHOTON_GLOW,
    description: '用纯光子能量锻造神器的地方，温度高达百万度。',
  },
  nlc_cosmic_horizon: {
    id: 'nlc_cosmic_horizon', name: 'Cosmic Horizon', nameZh: '宇宙视界',
    location: 'Cosmic Horizon',
    baseEnergy: 1000,
    passiveBonus: '+30% 远征奖励',
    color: NL_VOID_PURPLE,
    description: '宇宙可观测边界的神秘地带，紫色迷雾中隐藏着终极真相。',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: 30 MATERIALS
// ═══════════════════════════════════════════════════════════════════════════

const NL_MATERIALS: Record<string, NLMaterialDef> = {
  nlm_starlight_crystal: {
    id: 'nlm_starlight_crystal', name: 'Starlight Crystal', nameZh: '星光水晶',
    rarity: NL_RARITY_COMMON, category: 'crystal',
    description: '吸收星光凝结而成的水晶，是最基础的能量储存介质。',
    color: NL_STELLAR_WHITE,
  },
  nlm_solar_plasma: {
    id: 'nlm_solar_plasma', name: 'Solar Plasma', nameZh: '太阳等离子体',
    rarity: NL_RARITY_UNCOMMON, category: 'energy',
    description: '从太阳表面提取的高温等离子体，蕴含巨大热能。',
    color: NL_NOVA_GOLD,
  },
  nlm_nebula_gas: {
    id: 'nlm_nebula_gas', name: 'Nebula Gas', nameZh: '星云气体',
    rarity: NL_RARITY_UNCOMMON, category: 'gas',
    description: '星云中收集的彩色气体，可用于制造各种光学效果。',
    color: NL_NEBULA_PINK,
  },
  nlm_pulsar_shard: {
    id: 'nlm_pulsar_shard', name: 'Pulsar Shard', nameZh: '脉冲碎片',
    rarity: NL_RARITY_UNCOMMON, category: 'crystal',
    description: '脉冲星辐射凝结的蓝色碎片，能储存高频能量脉冲。',
    color: NL_COSMIC_BLUE,
  },
  nlm_quasar_dust: {
    id: 'nlm_quasar_dust', name: 'Quasar Dust', nameZh: '类星微尘',
    rarity: NL_RARITY_RARE, category: 'dust',
    description: '类星体喷流中提取的紫色微尘，蕴含扭曲时空的力量。',
    color: NL_VOID_PURPLE,
  },
  nlm_photon_essence: {
    id: 'nlm_photon_essence', name: 'Photon Essence', nameZh: '光子精华',
    rarity: NL_RARITY_COMMON, category: 'essence',
    description: '纯光子的浓缩精华，新星之光最基本的食物来源。',
    color: NL_STELLAR_WHITE,
  },
  nlm_stardust_powder: {
    id: 'nlm_stardust_powder', name: 'Stardust Powder', nameZh: '星尘粉末',
    rarity: NL_RARITY_COMMON, category: 'dust',
    description: '星尘磨成的细粉，用于强化新星之光的体力和恢复力。',
    color: NL_AURORA_GREEN,
  },
  nlm_cosmic_ray_fragment: {
    id: 'nlm_cosmic_ray_fragment', name: 'Cosmic Ray Fragment', nameZh: '宇宙射线碎片',
    rarity: NL_RARITY_RARE, category: 'fragment',
    description: '高速宇宙射线撞击后残留的橙色碎片，蕴含冲击之力。',
    color: NL_SOLAR_FLARE,
  },
  nlm_nova_ember: {
    id: 'nlm_nova_ember', name: 'Nova Ember', nameZh: '新星余烬',
    rarity: NL_RARITY_EPIC, category: 'ember',
    description: '新星爆发后残余的金色余烬，温度可维持千年不灭。',
    color: NL_NOVA_GOLD,
  },
  nlm_dark_nova_core: {
    id: 'nlm_dark_nova_core', name: 'Dark Nova Core', nameZh: '暗新星核心',
    rarity: NL_RARITY_LEGENDARY, category: 'core',
    description: '暗新星坍缩形成的核心物质，蕴含着反物质的力量。',
    color: '#1A1A2E',
  },
  nlm_aurora_fiber: {
    id: 'nlm_aurora_fiber', name: 'Aurora Fiber', nameZh: '极光纤维',
    rarity: NL_RARITY_UNCOMMON, category: 'fiber',
    description: '从极光风暴中收集的彩色光纤维，可编织成护甲。',
    color: NL_AURORA_GREEN,
  },
  nlm_solar_wind_vial: {
    id: 'nlm_solar_wind_vial', name: 'Solar Wind Vial', nameZh: '太阳风瓶',
    rarity: NL_RARITY_COMMON, category: 'vial',
    description: '密封的太阳风粒子瓶，打开可释放温和的粒子流。',
    color: NL_PHOTON_GLOW,
  },
  nlm_magnetar_essence: {
    id: 'nlm_magnetar_essence', name: 'Magnetar Essence', nameZh: '磁星精华',
    rarity: NL_RARITY_EPIC, category: 'essence',
    description: '磁星极端磁场中提取的精华，可制造超强电磁装置。',
    color: '#C0C0C0',
  },
  nlm_void_pearl: {
    id: 'nlm_void_pearl', name: 'Void Pearl', nameZh: '虚空珍珠',
    rarity: NL_RARITY_LEGENDARY, category: 'gem',
    description: '在虚空深处凝结的暗紫色珍珠，内含微型平行宇宙。',
    color: NL_VOID_PURPLE,
  },
  nlm_comet_ice: {
    id: 'nlm_comet_ice', name: 'Comet Ice', nameZh: '彗星冰晶',
    rarity: NL_RARITY_COMMON, category: 'ice',
    description: '彗星尾部脱落的冰晶，纯净无暇，有冷却灼伤的效果。',
    color: '#E0FFFF',
  },
  nlm_supernova_remnant: {
    id: 'nlm_supernova_remnant', name: 'Supernova Remnant', nameZh: '超新星残骸',
    rarity: NL_RARITY_EPIC, category: 'remnant',
    description: '超新星爆发后的残余物质，仍散发着巨大的能量波动。',
    color: NL_STELLAR_WHITE,
  },
  nlm_gravity_silk: {
    id: 'nlm_gravity_silk', name: 'Gravity Silk', nameZh: '引力丝绸',
    rarity: NL_RARITY_RARE, category: 'fabric',
    description: '引力波编织的丝绸，穿在身上可以减轻重力影响。',
    color: NL_COSMIC_BLUE,
  },
  nlm_quantum_foam: {
    id: 'nlm_quantum_foam', name: 'Quantum Foam', nameZh: '量子泡沫',
    rarity: NL_RARITY_RARE, category: 'quantum',
    description: '时空量子涨落产生的泡沫物质，可用于空间折叠。',
    color: '#FF69B4',
  },
  nlm_eternal_flame: {
    id: 'nlm_eternal_flame', name: 'Eternal Flame', nameZh: '永恒之火',
    rarity: NL_RARITY_LEGENDARY, category: 'flame',
    description: '从第一颗恒星中分离的永恒火焰，永不熄灭。',
    color: NL_NOVA_GOLD,
  },
  nlm_stellar_marrow: {
    id: 'nlm_stellar_marrow', name: 'Stellar Marrow', nameZh: '恒星骨髓',
    rarity: NL_RARITY_UNCOMMON, category: 'organic',
    description: '恒星内核深处的有机物质，是高级新星之光的营养来源。',
    color: '#FF8C00',
  },
  nlm_chromatic_dust: {
    id: 'nlm_chromatic_dust', name: 'Chromatic Dust', nameZh: '彩色星尘',
    rarity: NL_RARITY_UNCOMMON, category: 'dust',
    description: '由多种颜色光谱混合的星尘，研磨后可制作彩色颜料。',
    color: NL_NEBULA_PINK,
  },
  nlm_helium_prism: {
    id: 'nlm_helium_prism', name: 'Helium Prism', nameZh: '氦棱镜',
    rarity: NL_RARITY_RARE, category: 'crystal',
    description: '氦气在极端压力下结晶的棱镜，可折射出七彩星光。',
    color: '#87CEEB',
  },
  nlm_cosmic_string: {
    id: 'nlm_cosmic_string', name: 'Cosmic String', nameZh: '宇宙弦',
    rarity: NL_RARITY_LEGENDARY, category: 'string',
    description: '宇宙尺度的一维弦状结构，蕴含无穷的能量密度。',
    color: NL_VOID_PURPLE,
  },
  nlm_plasma_gel: {
    id: 'nlm_plasma_gel', name: 'Plasma Gel', nameZh: '等离子凝胶',
    rarity: NL_RARITY_COMMON, category: 'gel',
    description: '低温等离子体凝固成的凝胶，可修复受损的能量回路。',
    color: '#FF4500',
  },
  nlm_white_dwarf_core: {
    id: 'nlm_white_dwarf_core', name: 'White Dwarf Core', nameZh: '白矮星核心',
    rarity: NL_RARITY_EPIC, category: 'core',
    description: '白矮星坍缩后的超密度核心，一立方厘米重达数吨。',
    color: NL_STELLAR_WHITE,
  },
  nlm_neutron_bloom: {
    id: 'nlm_neutron_bloom', name: 'Neutron Bloom', nameZh: '中子之花',
    rarity: NL_RARITY_RARE, category: 'flower',
    description: '中子星辐射中绽放的奇异花朵，花瓣由中子构成。',
    color: NL_COSMIC_BLUE,
  },
  nlm_time_crystal: {
    id: 'nlm_time_crystal', name: 'Time Crystal', nameZh: '时间水晶',
    rarity: NL_RARITY_LEGENDARY, category: 'crystal',
    description: '在时间维度中结晶的奇异物质，打破时间平移对称性。',
    color: '#DA70D6',
  },
  nlm_hawking_dew: {
    id: 'nlm_hawking_dew', name: 'Hawking Dew', nameZh: '霍金露水',
    rarity: NL_RARITY_EPIC, category: 'liquid',
    description: '黑洞事件视界边缘凝结的量子露珠，极难收集。',
    color: '#191970',
  },
  nlm_primordial_light: {
    id: 'nlm_primordial_light', name: 'Primordial Light', nameZh: '原始之光',
    rarity: NL_RARITY_LEGENDARY, category: 'light',
    description: '宇宙大爆炸后38万年释放的第一缕光，最为纯净。',
    color: NL_NOVA_GOLD,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5: 25 STRUCTURES (upgradeable to level 10)
// ═══════════════════════════════════════════════════════════════════════════

const NL_STRUCTURES: Record<string, NLStructureDef> = {
  nls_radiance_tower: {
    id: 'nls_radiance_tower', name: 'Radiance Tower', nameZh: '光辉之塔',
    category: 'energy', maxLevel: 10,
    baseCost: 100, costMultiplier: 1.4,
    effect: '每级+5 辉光产出/小时',
    description: '汇聚星光的塔楼，是新星之光聚落的核心能量来源。',
    color: NL_NOVA_GOLD,
  },
  nls_stardust_greenhouse: {
    id: 'nls_stardust_greenhouse', name: 'Stardust Greenhouse', nameZh: '星尘温室',
    category: 'production', maxLevel: 10,
    baseCost: 80, costMultiplier: 1.3,
    effect: '每级+3 星尘粉末/小时',
    description: '培养星尘植物的温室，产出新星之光的基本食物。',
    color: NL_AURORA_GREEN,
  },
  nls_nova_forge: {
    id: 'nls_nova_forge', name: 'Nova Forge', nameZh: '新星锻造炉',
    category: 'forge', maxLevel: 10,
    baseCost: 200, costMultiplier: 1.5,
    effect: '每级+8% 装备强化率',
    description: '利用新星爆发余热锻造武器的火焰工坊。',
    color: NL_SOLAR_FLARE,
  },
  nls_nebula_sanctuary: {
    id: 'nls_nebula_sanctuary', name: 'Nebula Sanctuary', nameZh: '星云圣殿',
    category: 'spiritual', maxLevel: 10,
    baseCost: 150, costMultiplier: 1.6,
    effect: '每级+10% 治愈效果',
    description: '弥漫着星云薄雾的圣殿，进入者可获得深度治愈。',
    color: NL_NEBULA_PINK,
  },
  nls_pulse_beacon: {
    id: 'nls_pulse_beacon', name: 'Pulse Beacon', nameZh: '脉冲信标',
    category: 'defense', maxLevel: 10,
    baseCost: 120, costMultiplier: 1.4,
    effect: '每级+12 防御射程',
    description: '发射脉冲防御波的信标塔，可远距离探测威胁。',
    color: NL_COSMIC_BLUE,
  },
  nls_photon_reactor: {
    id: 'nls_photon_reactor', name: 'Photon Reactor', nameZh: '光子反应堆',
    category: 'energy', maxLevel: 10,
    baseCost: 300, costMultiplier: 1.7,
    effect: '每级+15% 全局能量效率',
    description: '利用光子链式反应产出的超级能量反应堆。',
    color: NL_STELLAR_WHITE,
  },
  nls_quasar_observatory: {
    id: 'nls_quasar_observatory', name: 'Quasar Observatory', nameZh: '类星天文台',
    category: 'research', maxLevel: 10,
    baseCost: 250, costMultiplier: 1.5,
    effect: '每级+8% 研究速度',
    description: '观测遥远类星体的天文台，解锁新的科技和配方。',
    color: NL_VOID_PURPLE,
  },
  nls_aurora_shield_generator: {
    id: 'nls_aurora_shield_generator', name: 'Aurora Shield Generator', nameZh: '极光护盾发生器',
    category: 'defense', maxLevel: 10,
    baseCost: 180, costMultiplier: 1.5,
    effect: '每级+50 护盾值',
    description: '生成极光能量护盾的防御设施，为聚落提供保护。',
    color: NL_AURORA_GREEN,
  },
  nls_cosmic_library: {
    id: 'nls_cosmic_library', name: 'Cosmic Library', nameZh: '宇宙图书馆',
    category: 'research', maxLevel: 10,
    baseCost: 220, costMultiplier: 1.4,
    effect: '每级+10% 经验获取',
    description: '收录宇宙所有知识的宏伟图书馆，加速新星之光成长。',
    color: NL_SOLAR_FLARE,
  },
  nls_solar_incubator: {
    id: 'nls_solar_incubator', name: 'Solar Incubator', nameZh: '太阳孵化器',
    category: 'breeding', maxLevel: 10,
    baseCost: 160, costMultiplier: 1.6,
    effect: '每级+2 新星之光孵化速度',
    description: '模拟太阳核心条件的孵化器，加速新生命的诞生。',
    color: NL_NOVA_GOLD,
  },
  nls_dark_matter_silo: {
    id: 'nls_dark_matter_silo', name: 'Dark Matter Silo', nameZh: '暗物质储藏仓',
    category: 'storage', maxLevel: 10,
    baseCost: 140, costMultiplier: 1.3,
    effect: '每级+200 储藏容量',
    description: '安全储存暗物质和稀有材料的特制仓库。',
    color: '#1A1A2E',
  },
  nls_ray_accelerator: {
    id: 'nls_ray_accelerator', name: 'Ray Accelerator', nameZh: '射线加速器',
    category: 'offense', maxLevel: 10,
    baseCost: 200, costMultiplier: 1.6,
    effect: '每级+10 射线攻击力',
    description: '加速宇宙射线至超光速的攻击设施，威力惊人。',
    color: NL_SOLAR_FLARE,
  },
  nls_entropy_garden: {
    id: 'nls_entropy_garden', name: 'Entropy Garden', nameZh: '熵之花园',
    category: 'spiritual', maxLevel: 10,
    baseCost: 180, costMultiplier: 1.5,
    effect: '每级+6% 熵逆转效果',
    description: '逆转局部熵值的神秘花园，让事物恢复到更完美的状态。',
    color: NL_AURORA_GREEN,
  },
  nls_gravity_well: {
    id: 'nls_gravity_well', name: 'Gravity Well', nameZh: '引力之井',
    category: 'defense', maxLevel: 10,
    baseCost: 250, costMultiplier: 1.7,
    effect: '每级+3% 减速效果',
    description: '生成微型引力场的防御设施，减缓入侵者的速度。',
    color: NL_COSMIC_BLUE,
  },
  nls_plasma_conduit: {
    id: 'nls_plasma_conduit', name: 'Plasma Conduit', nameZh: '等离子管道',
    category: 'utility', maxLevel: 10,
    baseCost: 100, costMultiplier: 1.3,
    effect: '每级+5% 资源传输效率',
    description: '传输等离子能量的管道网络，连接所有设施。',
    color: '#FF4500',
  },
  nls_void_gate: {
    id: 'nls_void_gate', name: 'Void Gate', nameZh: '虚空之门',
    category: 'utility', maxLevel: 10,
    baseCost: 400, costMultiplier: 2.0,
    effect: '每级+1 传送目的地',
    description: '通往虚空深处的传送门，开启新的探索路线。',
    color: NL_VOID_PURPLE,
  },
  nls_harmonic_chamber: {
    id: 'nls_harmonic_chamber', name: 'Harmonic Chamber', nameZh: '谐振室',
    category: 'training', maxLevel: 10,
    baseCost: 170, costMultiplier: 1.5,
    effect: '每级+5% 技能熟练度',
    description: '通过共振提升新星之光能力的训练室。',
    color: NL_NEBULA_PINK,
  },
  nls_lightweaver_atelier: {
    id: 'nls_lightweaver_atelier', name: 'Lightweaver Atelier', nameZh: '光织工作坊',
    category: 'crafting', maxLevel: 10,
    baseCost: 190, costMultiplier: 1.5,
    effect: '每级+7% 制造成功率',
    description: '将光线编织成实物的神奇工作坊，可创造神器。',
    color: NL_STELLAR_WHITE,
  },
  nls_stellar_cartograph: {
    id: 'nls_stellar_cartograph', name: 'Stellar Cartograph', nameZh: '星图绘制所',
    category: 'research', maxLevel: 10,
    baseCost: 210, costMultiplier: 1.4,
    effect: '每级+5% 探索范围',
    description: '绘制星际地图的机构，扩大已知宇宙的边界。',
    color: NL_PHOTON_GLOW,
  },
  nls_resonance_crystal_array: {
    id: 'nls_resonance_crystal_array', name: 'Resonance Crystal Array', nameZh: '共振水晶阵列',
    category: 'energy', maxLevel: 10,
    baseCost: 280, costMultiplier: 1.6,
    effect: '每级+12 能量回复',
    description: '排列成阵列的共振水晶，将宇宙背景能量转化为可用能源。',
    color: NL_COSMIC_BLUE,
  },
  nls_phantom_nursery: {
    id: 'nls_phantom_nursery', name: 'Phantom Nursery', nameZh: '幻影育婴所',
    category: 'breeding', maxLevel: 10,
    baseCost: 230, costMultiplier: 1.7,
    effect: '每级+4% 稀有新星之光孵化率',
    description: '在暗物质维度的育婴空间，提升稀有品种的出生概率。',
    color: NL_VOID_PURPLE,
  },
  nls_eternity_altar: {
    id: 'nls_eternity_altar', name: 'Eternity Altar', nameZh: '永恒祭坛',
    category: 'ritual', maxLevel: 10,
    baseCost: 500, costMultiplier: 2.5,
    effect: '每级+20% 仪式成功率',
    description: '举行永恒仪式的古老祭坛，可解锁传说级能力。',
    color: NL_NOVA_GOLD,
  },
  nls_cosmos_eye: {
    id: 'nls_cosmos_eye', name: 'Cosmos Eye', nameZh: '宇宙之眼',
    category: 'research', maxLevel: 10,
    baseCost: 350, costMultiplier: 1.8,
    effect: '每级+8% 敌人弱点暴露',
    description: '窥视宇宙深层真相的神器设施，揭示一切隐藏的事物。',
    color: NL_NEBULA_PINK,
  },
  nls_nova_citadel: {
    id: 'nls_nova_citadel', name: 'Nova Citadel', nameZh: '新星城堡',
    category: 'monument', maxLevel: 10,
    baseCost: 600, costMultiplier: 3.0,
    effect: '每级+5% 全局属性加成',
    description: '新星之光的至高城堡，是整个文明荣耀与力量的象征。',
    color: NL_NOVA_GOLD,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6: 22 ABILITIES
// ═══════════════════════════════════════════════════════════════════════════

const NL_ABILITIES: Record<string, NLAbilityDef> = {
  nla_ignite: {
    id: 'nla_ignite', name: 'Ignite', nameZh: '点燃',
    type: 'attack', cooldown: 3, duration: 0, power: 30, luminosityCost: 10,
    description: '点燃目标释放初始光辉，是最基础也是最重要的能力。',
    color: NL_NOVA_GOLD,
  },
  nla_nova_burst: {
    id: 'nla_nova_burst', name: 'Nova Burst', nameZh: '新星爆发',
    type: 'attack', cooldown: 15, duration: 3, power: 80, luminosityCost: 50,
    description: '释放新星级别的爆发能量，短时间内输出极大伤害。',
    color: NL_STELLAR_WHITE,
  },
  nla_radiate: {
    id: 'nla_radiate', name: 'Radiate', nameZh: '辐射',
    type: 'utility', cooldown: 5, duration: 8, power: 0, luminosityCost: 15,
    description: '向周围持续辐射温暖能量，治愈友方新星之光。',
    color: NL_NEBULA_PINK,
  },
  nla_solar_flare: {
    id: 'nla_solar_flare', name: 'Solar Flare', nameZh: '太阳耀斑',
    type: 'attack', cooldown: 10, duration: 0, power: 55, luminosityCost: 35,
    description: '释放太阳耀斑灼烧敌人，附带持续灼烧效果。',
    color: NL_SOLAR_FLARE,
  },
  nla_nebula_veil: {
    id: 'nla_nebula_veil', name: 'Nebula Veil', nameZh: '星云面纱',
    type: 'defense', cooldown: 12, duration: 6, power: 0, luminosityCost: 30,
    description: '用星云编织面纱笼罩自身，在持续时间内免疫伤害。',
    color: NL_NEBULA_PINK,
  },
  nla_pulse_dash: {
    id: 'nla_pulse_dash', name: 'Pulse Dash', nameZh: '脉冲冲刺',
    type: 'utility', cooldown: 6, duration: 0, power: 0, luminosityCost: 12,
    description: '以脉冲速度瞬间移动到目标位置，躲避攻击。',
    color: NL_COSMIC_BLUE,
  },
  nla_quasar_drain: {
    id: 'nla_quasar_drain', name: 'Quasar Drain', nameZh: '类星汲取',
    type: 'special', cooldown: 18, duration: 4, power: 40, luminosityCost: 45,
    description: '开启类星体汲取之力，持续吸取敌人能量并转化自身。',
    color: NL_VOID_PURPLE,
  },
  nla_photon_barrage: {
    id: 'nla_photon_barrage', name: 'Photon Barrage', nameZh: '光子弹幕',
    type: 'attack', cooldown: 8, duration: 0, power: 65, luminosityCost: 28,
    description: '向目标倾泻数千枚光子弹丸，造成范围伤害。',
    color: NL_STELLAR_WHITE,
  },
  nla_stardust_heal: {
    id: 'nla_stardust_heal', name: 'Stardust Heal', nameZh: '星尘治愈',
    type: 'defense', cooldown: 10, duration: 0, power: 0, luminosityCost: 25,
    description: '释放星尘治愈粒子，瞬间恢复大量生命值。',
    color: NL_AURORA_GREEN,
  },
  nla_cosmic_ray_lance: {
    id: 'nla_cosmic_ray_lance', name: 'Cosmic Ray Lance', nameZh: '宇宙射线枪',
    type: 'attack', cooldown: 7, duration: 0, power: 50, luminosityCost: 20,
    description: '凝聚宇宙射线形成长枪刺穿敌人，无视部分护甲。',
    color: NL_SOLAR_FLARE,
  },
  nla_gravity_well: {
    id: 'nla_gravity_well', name: 'Gravity Well', nameZh: '引力陷阱',
    type: 'control', cooldown: 20, duration: 5, power: 0, luminosityCost: 40,
    description: '制造微型引力陷阱，将敌人困在原地无法移动。',
    color: NL_COSMIC_BLUE,
  },
  nla_aurora_blessing: {
    id: 'nla_aurora_blessing', name: 'Aurora Blessing', nameZh: '极光祝福',
    type: 'buff', cooldown: 30, duration: 10, power: 0, luminosityCost: 35,
    description: '沐浴在极光祝福中，大幅提升全属性。',
    color: NL_AURORA_GREEN,
  },
  nla_void_step: {
    id: 'nla_void_step', name: 'Void Step', nameZh: '虚空步伐',
    type: 'utility', cooldown: 14, duration: 0, power: 0, luminosityCost: 22,
    description: '短暂踏入虚空维度，在此期间完全不可被探测。',
    color: NL_VOID_PURPLE,
  },
  nla_supernova_echo: {
    id: 'nla_supernova_echo', name: 'Supernova Echo', nameZh: '超新星回响',
    type: 'attack', cooldown: 25, duration: 0, power: 100, luminosityCost: 60,
    description: '释放远古超新星爆发的回响，对全屏敌人造成毁灭伤害。',
    color: NL_STELLAR_WHITE,
  },
  nla_photon_wings: {
    id: 'nla_photon_wings', name: 'Photon Wings', nameZh: '光子之翼',
    type: 'utility', cooldown: 16, duration: 12, power: 0, luminosityCost: 30,
    description: '展开光子构成的翅膀，获得飞行能力和高速移动。',
    color: NL_STELLAR_WHITE,
  },
  nla_stellar_convergence: {
    id: 'nla_stellar_convergence', name: 'Stellar Convergence', nameZh: '恒星汇聚',
    type: 'special', cooldown: 40, duration: 0, power: 120, luminosityCost: 80,
    description: '汇聚多颗恒星的能量发射终极光束，摧毁一切阻碍。',
    color: NL_NOVA_GOLD,
  },
  nla_nebula_mist: {
    id: 'nla_nebula_mist', name: 'Nebula Mist', nameZh: '星云迷雾',
    type: 'control', cooldown: 15, duration: 8, power: 0, luminosityCost: 28,
    description: '释放浓密星云迷雾笼罩战场，大幅降低敌人视野。',
    color: NL_NEBULA_PINK,
  },
  nla_ray_refraction: {
    id: 'nla_ray_refraction', name: 'Ray Refraction', nameZh: '射线折射',
    type: 'attack', cooldown: 9, duration: 0, power: 45, luminosityCost: 18,
    description: '折射宇宙射线使其分裂攻击多个目标。',
    color: NL_SOLAR_FLARE,
  },
  nla_time_dialation: {
    id: 'nla_time_dialation', name: 'Time Dilation', nameZh: '时间膨胀',
    type: 'special', cooldown: 35, duration: 5, power: 0, luminosityCost: 55,
    description: '扭曲局部时空使时间膨胀，在他人眼中你的动作快如闪电。',
    color: NL_VOID_PURPLE,
  },
  nla_primordial_flash: {
    id: 'nla_primordial_flash', name: 'Primordial Flash', nameZh: '原始闪光',
    type: 'attack', cooldown: 22, duration: 0, power: 90, luminosityCost: 50,
    description: '释放宇宙大爆炸时的一缕原始闪光，净化一切黑暗。',
    color: NL_NOVA_GOLD,
  },
  nla_chromatic_rainbow: {
    id: 'nla_chromatic_rainbow', name: 'Chromatic Rainbow', nameZh: '光谱彩虹',
    type: 'buff', cooldown: 28, duration: 15, power: 0, luminosityCost: 42,
    description: '展开包含全光谱的彩虹光环，所有属性在持续时间内翻倍。',
    color: NL_NEBULA_PINK,
  },
  nla_eternal_radiance: {
    id: 'nla_eternal_radiance', name: 'Eternal Radiance', nameZh: '永恒光辉',
    type: 'ultimate', cooldown: 60, duration: 20, power: 150, luminosityCost: 100,
    description: '释放永恒不灭的终极光辉，在此期间无敌且攻击力最大化。',
    color: NL_NOVA_GOLD,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 7: 18 ACHIEVEMENTS
// ═══════════════════════════════════════════════════════════════════════════

const NL_ACHIEVEMENTS: Record<string, NLAchievementDef> = {
  nla_first_ignition: {
    id: 'nla_first_ignition', name: 'First Ignition', nameZh: '初次点燃',
    description: '第一次成功点燃一个新星之光。', conditionKey: 'totalIgnited', threshold: 1,
    reward: 50, color: NL_NOVA_GOLD,
  },
  nla_radiant_five: {
    id: 'nla_radiant_five', name: 'Radiant Five', nameZh: '光辉五人组',
    description: '同时点燃5个新星之光。', conditionKey: 'totalIgnited', threshold: 5,
    reward: 150, color: NL_NOVA_GOLD,
  },
  nla_nova_mastery: {
    id: 'nla_nova_mastery', name: 'Nova Mastery', nameZh: '新星大师',
    description: '成功释放10次新星爆发。', conditionKey: 'totalNovaBursts', threshold: 10,
    reward: 300, color: NL_STELLAR_WHITE,
  },
  nla_radiance_magnitude: {
    id: 'nla_radiance_magnitude', name: 'Radiance Magnitude', nameZh: '辉光万丈',
    description: '累计辐射光辉达到10000点。', conditionKey: 'totalRadianceEmitted', threshold: 10000,
    reward: 500, color: NL_NEBULA_PINK,
  },
  nla_constellation_architect: {
    id: 'nla_constellation_architect', name: 'Constellation Architect', nameZh: '星座建筑师',
    description: '成功组建3个星座。', conditionKey: 'totalConstellationsFormed', threshold: 3,
    reward: 400, color: NL_COSMIC_BLUE,
  },
  nla_material_hoarder: {
    id: 'nla_material_hoarder', name: 'Material Hoarder', nameZh: '材料收藏家',
    description: '收集500份材料。', conditionKey: 'totalMaterialsHarvested', threshold: 500,
    reward: 200, color: NL_AURORA_GREEN,
  },
  nla_starborn_legend: {
    id: 'nla_starborn_legend', name: 'Starborn Legend', nameZh: '星生传奇',
    description: '累计星生次数达到50次。', conditionKey: 'totalStarborn', threshold: 50,
    reward: 600, color: NL_NOVA_GOLD,
  },
  nla_combo_king: {
    id: 'nla_combo_king', name: 'Combo King', nameZh: '连击之王',
    description: '达成50连击记录。', conditionKey: 'highestCombo', threshold: 50,
    reward: 350, color: NL_SOLAR_FLARE,
  },
  nla_legendary_ignite: {
    id: 'nla_legendary_ignite', name: 'Legendary Ignite', nameZh: '传说点燃',
    description: '成功点燃一个传说级新星之光。', conditionKey: 'legendaryIgnited', threshold: 1,
    reward: 1000, color: NL_NOVA_GOLD,
  },
  nla_max_structure: {
    id: 'nla_max_structure', name: 'Max Structure', nameZh: '满级建筑',
    description: '将任何建筑升级至10级。', conditionKey: 'maxStructureLevel', threshold: 10,
    reward: 700, color: NL_COSMIC_BLUE,
  },
  nla_all_constellations: {
    id: 'nla_all_constellations', name: 'All Constellations', nameZh: '全星座达成',
    description: '解锁全部8个星座。', conditionKey: 'totalConstellationsFormed', threshold: 8,
    reward: 2000, color: NL_VOID_PURPLE,
  },
  nla_cosmic_collector: {
    id: 'nla_cosmic_collector', name: 'Cosmic Collector', nameZh: '宇宙收集者',
    description: '收集5000份材料。', conditionKey: 'totalMaterialsHarvested', threshold: 5000,
    reward: 800, color: NL_NEBULA_PINK,
  },
  nla_nova_crusader: {
    id: 'nla_nova_crusader', name: 'Nova Crusader', nameZh: '新星十字军',
    description: '累计释放100次新星爆发。', conditionKey: 'totalNovaBursts', threshold: 100,
    reward: 1200, color: NL_STELLAR_WHITE,
  },
  nla_eternal_builder: {
    id: 'nla_eternal_builder', name: 'Eternal Builder', nameZh: '永恒建造者',
    description: '建造20个不同建筑。', conditionKey: 'totalBuildings', threshold: 20,
    reward: 500, color: NL_AURORA_GREEN,
  },
  nla_photon_master: {
    id: 'nla_photon_master', name: 'Photon Master', nameZh: '光子大师',
    description: '累计辐射光辉达到100000点。', conditionKey: 'totalRadianceEmitted', threshold: 100000,
    reward: 1500, color: NL_STELLAR_WHITE,
  },
  nla_rare_species: {
    id: 'nla_rare_species', name: 'Rare Species', nameZh: '稀有种族',
    description: '同时拥有3种不同种族的稀有新星之光。', conditionKey: 'rareSpeciesCount', threshold: 3,
    reward: 600, color: NL_VOID_PURPLE,
  },
  nla_artifact_hunter: {
    id: 'nla_artifact_hunter', name: 'Artifact Hunter', nameZh: '神器猎人',
    description: '激活5件神器。', conditionKey: 'artifactsActivated', threshold: 5,
    reward: 800, color: NL_NOVA_GOLD,
  },
  nla_sovereign_reached: {
    id: 'nla_sovereign_reached', name: 'Sovereign Reached', nameZh: '至高主权',
    description: '获得新星至主称号。', conditionKey: 'titleEarned', threshold: 8,
    reward: 3000, color: NL_NOVA_GOLD,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 8: 8 TITLES (Spark → Nova Sovereign)
// ═══════════════════════════════════════════════════════════════════════════

const NL_TITLES: Record<string, NLTitleDef> = {
  nlt_spark: {
    id: 'nlt_spark', name: 'Spark', nameZh: '火花',
    requirement: 0, description: '新星之光旅途的起点，一切光辉从此刻开始。',
    color: NL_STELLAR_WHITE,
  },
  nlt_glow: {
    id: 'nlt_glow', name: 'Glow', nameZh: '微光',
    requirement: 100, description: '初露光芒的新星之光，已经学会了基本的辐射。',
    color: NL_PHOTON_GLOW,
  },
  nlt_shimmer: {
    id: 'nlt_shimmer', name: 'Shimmer', nameZh: '闪光',
    requirement: 300, description: '闪烁着柔和光辉的进步者，潜力正在逐渐显现。',
    color: NL_AURORA_GREEN,
  },
  nlt_radiance: {
    id: 'nlt_radiance', name: 'Radiance', nameZh: '光辉',
    requirement: 600, description: '以灿烂光辉照亮周围的新星之光，令人尊敬。',
    color: NL_NEBULA_PINK,
  },
  nlt_blaze: {
    id: 'nlt_blaze', name: 'Blaze', nameZh: '烈焰',
    requirement: 1200, description: '燃烧着金色烈焰的强者，光辉无人能及。',
    color: NL_NOVA_GOLD,
  },
  nlt_supernova: {
    id: 'nlt_supernova', name: 'Supernova', nameZh: '超新星',
    requirement: 2500, description: '达到了超新星级别的辉光，爆发力惊世骇俗。',
    color: NL_STELLAR_WHITE,
  },
  nlt_cosmic_lord: {
    id: 'nlt_cosmic_lord', name: 'Cosmic Lord', nameZh: '宇宙领主',
    requirement: 5000, description: '统治一片星域的宇宙领主，万物沐浴在其光辉之下。',
    color: NL_COSMIC_BLUE,
  },
  nlt_nova_sovereign: {
    id: 'nlt_nova_sovereign', name: 'Nova Sovereign', nameZh: '新星至主',
    requirement: 10000, description: '新星之光的至高存在，其光辉永照宇宙，永恒不灭。',
    color: NL_NOVA_GOLD,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 9: 15 LEGENDARY ARTIFACTS
// ═══════════════════════════════════════════════════════════════════════════

const NL_ARTIFACTS: Record<string, NLArtifactDef> = {
  nlaft_crown_of_dawn: {
    id: 'nlaft_crown_of_dawn', name: 'Crown of Dawn', nameZh: '黎明之冠',
    rarity: NL_RARITY_LEGENDARY, power: 150,
    description: '由第一缕黎明光线铸成的皇冠，佩戴者永不陷入黑暗。',
    color: NL_NOVA_GOLD,
  },
  nlaft_nebula_heart: {
    id: 'nlaft_nebula_heart', name: 'Nebula Heart', nameZh: '星云之心',
    rarity: NL_RARITY_EPIC, power: 100,
    description: '一颗在星云深处跳动的粉红色心脏，蕴含无限治愈之力。',
    color: NL_NEBULA_PINK,
  },
  nlaft_pulse_scepter: {
    id: 'nlaft_pulse_scepter', name: 'Pulse Scepter', nameZh: '脉冲权杖',
    rarity: NL_RARITY_RARE, power: 70,
    description: '脉冲星核心制成的权杖，挥动时可发出高频脉冲波。',
    color: NL_COSMIC_BLUE,
  },
  nlaft_quasar_mirror: {
    id: 'nlaft_quasar_mirror', name: 'Quasar Mirror', nameZh: '类星之镜',
    rarity: NL_RARITY_LEGENDARY, power: 140,
    description: '反映类星体光芒的紫色镜子，可复制任何一次攻击。',
    color: NL_VOID_PURPLE,
  },
  nlaft_eternal_flame_orb: {
    id: 'nlaft_eternal_flame_orb', name: 'Eternal Flame Orb', nameZh: '永恒火焰宝珠',
    rarity: NL_RARITY_EPIC, power: 95,
    description: '封印着永恒之火的橙色宝珠，提供持续的火焰护盾。',
    color: NL_SOLAR_FLARE,
  },
  nlaft_stardust_cloak: {
    id: 'nlaft_stardust_cloak', name: 'Stardust Cloak', nameZh: '星尘斗篷',
    rarity: NL_RARITY_RARE, power: 65,
    description: '由亿万个星尘粒子编织的斗篷，使佩戴者半透明。',
    color: NL_AURORA_GREEN,
  },
  nlaft_cosmic_compass: {
    id: 'nlaft_cosmic_compass', name: 'Cosmic Compass', nameZh: '宇宙罗盘',
    rarity: NL_RARITY_UNCOMMON, power: 40,
    description: '永远指向最近恒星的罗盘，增加探索效率。',
    color: NL_NOVA_GOLD,
  },
  nlaft_void_crystal_shard: {
    id: 'nlaft_void_crystal_shard', name: 'Void Crystal Shard', nameZh: '虚空水晶碎片',
    rarity: NL_RARITY_EPIC, power: 90,
    description: '虚空深处发现的水晶碎片，内部可见平行宇宙。',
    color: NL_VOID_PURPLE,
  },
  nlaft_primordial_light_shard: {
    id: 'nlaft_primordial_light_shard', name: 'Primordial Light Shard', nameZh: '原始光碎片',
    rarity: NL_RARITY_LEGENDARY, power: 160,
    description: '宇宙大爆炸原始之光的碎片，蕴含创世的力量。',
    color: NL_STELLAR_WHITE,
  },
  nlaft_aurora_ring: {
    id: 'nlaft_aurora_ring', name: 'Aurora Ring', nameZh: '极光之戒',
    rarity: NL_RARITY_RARE, power: 75,
    description: '镶嵌极光宝石的戒指，佩戴时周围环绕彩色光环。',
    color: NL_AURORA_GREEN,
  },
  nlaft_solar_crown_emblem: {
    id: 'nlaft_solar_crown_emblem', name: 'Solar Crown Emblem', nameZh: '太阳冠徽章',
    rarity: NL_RARITY_EPIC, power: 105,
    description: '太阳族最高荣誉徽章，象征金色光辉的传承。',
    color: NL_NOVA_GOLD,
  },
  nlaft_cosmic_ray_blade: {
    id: 'nlaft_cosmic_ray_blade', name: 'Cosmic Ray Blade', nameZh: '宇宙射线刃',
    rarity: NL_RARITY_LEGENDARY, power: 145,
    description: '以宇宙射线为刃的橙色武器，可切割一切已知物质。',
    color: NL_SOLAR_FLARE,
  },
  nlaft_nebula_chalice: {
    id: 'nlaft_nebula_chalice', name: 'Nebula Chalice', nameZh: '星云圣杯',
    rarity: NL_RARITY_EPIC, power: 85,
    description: '盛装星云精华的粉色圣杯，饮用可暂时获得超凡力量。',
    color: NL_NEBULA_PINK,
  },
  nlaft_photon_harp: {
    id: 'nlaft_photon_harp', name: 'Photon Harp', nameZh: '光子竖琴',
    rarity: NL_RARITY_RARE, power: 60,
    description: '由光子琴弦制成的竖琴，旋律可治愈一切伤痛。',
    color: NL_STELLAR_WHITE,
  },
  nlaft_creation_seed: {
    id: 'nlaft_creation_seed', name: 'Creation Seed', nameZh: '创世之种',
    rarity: NL_RARITY_LEGENDARY, power: 200,
    description: '传说中宇宙起源时遗留的种子，可创造新的恒星。',
    color: NL_NOVA_GOLD,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 10: 12 EVENTS
// ═══════════════════════════════════════════════════════════════════════════

const NL_EVENTS: Record<string, NLEventDef> = {
  nle_solar_eclipse: {
    id: 'nle_solar_eclipse', name: 'Solar Eclipse', nameZh: '日食事件',
    type: 'natural', duration: 300,
    reward: [{ materialId: 'nlm_solar_plasma', amount: 20 }],
    description: '罕见的日食现象为新星之光提供了特殊的能量收集机会。',
    color: NL_SOLAR_FLARE,
  },
  nle_nebula_storm: {
    id: 'nle_nebula_storm', name: 'Nebula Storm', nameZh: '星云风暴',
    type: 'disaster', duration: 180,
    reward: [{ materialId: 'nlm_nebula_gas', amount: 30 }],
    description: '猛烈的星云风暴席卷而过，但也带来了丰富的星云气体。',
    color: NL_NEBULA_PINK,
  },
  nle_pulsar_resonance: {
    id: 'nle_pulsar_resonance', name: 'Pulsar Resonance', nameZh: '脉冲共振',
    type: 'boost', duration: 240,
    reward: [{ materialId: 'nlm_pulsar_shard', amount: 15 }],
    description: '附近脉冲星产生共振，所有新星之光的攻击力暂时翻倍。',
    color: NL_COSMIC_BLUE,
  },
  nle_cosmic_ray_shower: {
    id: 'nle_cosmic_ray_shower', name: 'Cosmic Ray Shower', nameZh: '宇宙射线雨',
    type: 'natural', duration: 360,
    reward: [{ materialId: 'nlm_cosmic_ray_fragment', amount: 25 }],
    description: '高密度宇宙射线倾泻而下，是收集射线碎片的绝佳时机。',
    color: NL_SOLAR_FLARE,
  },
  nle_nova_explosion: {
    id: 'nle_nova_explosion', name: 'Nova Explosion', nameZh: '新星爆发',
    type: 'catastrophic', duration: 120,
    reward: [{ materialId: 'nlm_nova_ember', amount: 10 }],
    description: '附近恒星突然新星爆发，带来危险但也散落珍贵的余烬。',
    color: NL_STELLAR_WHITE,
  },
  nle_dark_matter_surge: {
    id: 'nle_dark_matter_surge', name: 'Dark Matter Surge', nameZh: '暗物质涌潮',
    type: 'anomaly', duration: 300,
    reward: [{ materialId: 'nlm_dark_nova_core', amount: 3 }],
    description: '暗物质突然大量涌出，空间结构变得不稳定但机遇难得。',
    color: '#1A1A2E',
  },
  nle_aurora_spectacle: {
    id: 'nle_aurora_spectacle', name: 'Aurora Spectacle', nameZh: '极光奇观',
    type: 'blessing', duration: 480,
    reward: [{ materialId: 'nlm_aurora_fiber', amount: 20 }],
    description: '壮观的极光笼罩整个星域，所有新星之光获得祝福加成。',
    color: NL_AURORA_GREEN,
  },
  nle_photon_flood: {
    id: 'nle_photon_flood', name: 'Photon Flood', nameZh: '光子洪流',
    type: 'boost', duration: 200,
    reward: [{ materialId: 'nlm_photon_essence', amount: 40 }],
    description: '来自遥远恒星的光子洪流到达，大幅提升光素恢复速度。',
    color: NL_STELLAR_WHITE,
  },
  nle_gravity_anomaly: {
    id: 'nle_gravity_anomaly', name: 'Gravity Anomaly', nameZh: '引力异常',
    type: 'anomaly', duration: 150,
    reward: [{ materialId: 'nlm_gravity_silk', amount: 15 }],
    description: '局部引力场出现异常波动，可收集稀有的引力丝绸。',
    color: NL_COSMIC_BLUE,
  },
  nle_stellar_nursery_discovery: {
    id: 'nle_stellar_nursery_discovery', name: 'Stellar Nursery Discovery', nameZh: '恒星育婴室发现',
    type: 'discovery', duration: 600,
    reward: [{ materialId: 'nlm_stardust_powder', amount: 50 }],
    description: '发现了一处新的恒星育婴室，大量新星生命正在诞生。',
    color: NL_AURORA_GREEN,
  },
  nle_quasar_awakening: {
    id: 'nle_quasar_awakening', name: 'Quasar Awakening', nameZh: '类星觉醒',
    type: 'catastrophic', duration: 180,
    reward: [{ materialId: 'nlm_quasar_dust', amount: 12 }],
    description: '沉睡的类星体突然觉醒，释放出巨大的紫色能量波。',
    color: NL_VOID_PURPLE,
  },
  nle_eternal_convergence: {
    id: 'nle_eternal_convergence', name: 'Eternal Convergence', nameZh: '永恒汇聚',
    type: 'legendary', duration: 900,
    reward: [{ materialId: 'nlm_eternal_flame', amount: 5 }],
    description: '千年一遇的永恒汇聚事件，所有星座同时闪耀。',
    color: NL_NOVA_GOLD,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 11: HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function nlGetRadiantDef(radiantId: string): NLRadiantDef | undefined {
  return NL_RADIANTS[radiantId];
}

function nlGetConstellationDef(constellationId: string): NLConstellationDef | undefined {
  return NL_CONSTELLATIONS[constellationId];
}

function nlGetMaterialDef(materialId: string): NLMaterialDef | undefined {
  return NL_MATERIALS[materialId];
}

function nlGetStructureDef(structureId: string): NLStructureDef | undefined {
  return NL_STRUCTURES[structureId];
}

function nlGetAbilityDef(abilityId: string): NLAbilityDef | undefined {
  return NL_ABILITIES[abilityId];
}

function nlGetAchievementDef(achievementId: string): NLAchievementDef | undefined {
  return NL_ACHIEVEMENTS[achievementId];
}

function nlGetTitleDef(titleId: string): NLTitleDef | undefined {
  return NL_TITLES[titleId];
}

function nlGetArtifactDef(artifactId: string): NLArtifactDef | undefined {
  return NL_ARTIFACTS[artifactId];
}

function nlGetEventDef(eventId: string): NLEventDef | undefined {
  return NL_EVENTS[eventId];
}

function nlGetRarityColor(rarity: string): string {
  return NL_RARITY_COLORS[rarity] ?? '#888888';
}

function nlGetSpeciesColor(species: string): string {
  return NL_SPECIES_COLORS[species] ?? '#888888';
}

function nlGetRarityMultiplier(rarity: string): number {
  return NL_RARITY_MULTIPLIER[rarity] ?? 1;
}

function nlCalcStructureCost(baseCost: number, currentLevel: number, multiplier: number): number {
  return Math.floor(baseCost * Math.pow(multiplier, currentLevel));
}

function nlCalcStructureBonus(effectBase: number, level: number): number {
  return effectBase * level;
}

function nlExpToLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

function nlLuminosityToLevel(luminosity: number): number {
  let level = 1;
  let remaining = luminosity;
  while (remaining >= nlExpToLevel(level + 1)) {
    level += 1;
    remaining -= nlExpToLevel(level);
  }
  return level;
}

function nlCalcRadiantPower(radiantId: string, level: number): number {
  const def = NL_RADIANTS[radiantId];
  if (!def) return 0;
  const base = def.luminosity + def.warmth + def.velocity;
  const rarityMult = nlGetRarityMultiplier(def.rarity);
  return Math.floor(base * rarityMult * (1 + (level - 1) * 0.15));
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 12: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════════════

const NL_INITIAL_STATE: NLState = {
  nlRadiants: {},
  nlConstellations: {},
  nlInventory: {},
  nlStructures: {},
  nlArtifacts: [],
  nlAchievements: [],
  nlEvents: [],
  nlTitle: 'nlt_spark',
  nlLevel: 1,
  nlLuminosity: 0,
  nlStarborn: 0,
  nlStats: {
    totalIgnited: 0,
    totalNovaBursts: 0,
    totalRadianceEmitted: 0,
    totalConstellationsFormed: 0,
    totalMaterialsHarvested: 0,
    totalStarborn: 0,
    highestCombo: 0,
    currentStreak: 0,
  },
};

const useNovaLightStore = create<NLState>()(
  persist(
    () => ({
      ...NL_INITIAL_STATE,
    }),
    {
      name: 'nova-light-wire',
    }
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 13: MAIN HOOK — useNovaLight
// ═══════════════════════════════════════════════════════════════════════════

export default function useNovaLight() {
  const state = useNovaLightStore();
  const stateRef = useRef(state);
  stateRef.current = state;

  // ─── Computed Values (all depend on [state]) ──────────────────────

  const nlActiveRadiantCount = useMemo(() => {
    let count = 0;
    for (const key of Object.keys(state.nlRadiants)) {
      const r = state.nlRadiants[key];
      if (r && r.hired) count++;
    }
    return count;
  }, [state]);

  const nlTotalRadiantPower = useMemo(() => {
    let total = 0;
    for (const key of Object.keys(state.nlRadiants)) {
      const r = state.nlRadiants[key];
      if (r && r.hired) {
        total += nlCalcRadiantPower(key, r.level);
      }
    }
    return total;
  }, [state]);

  const nlUnlockedConstellationCount = useMemo(() => {
    let count = 0;
    for (const key of Object.keys(state.nlConstellations)) {
      if (state.nlConstellations[key]) count++;
    }
    return count;
  }, [state]);

  const nlBuiltStructureCount = useMemo(() => {
    let count = 0;
    for (const key of Object.keys(state.nlStructures)) {
      const s = state.nlStructures[key];
      if (s && s.built) count++;
    }
    return count;
  }, [state]);

  const nlTotalStructureBonus = useMemo(() => {
    let total = 0;
    for (const key of Object.keys(state.nlStructures)) {
      const s = state.nlStructures[key];
      if (s && s.built) {
        total += s.level;
      }
    }
    return total;
  }, [state]);

  const nlInventoryCount = useMemo(() => {
    let total = 0;
    for (const key of Object.keys(state.nlInventory)) {
      total += state.nlInventory[key];
    }
    return total;
  }, [state]);

  const nlAchievementProgress = useMemo(() => {
    const keys = Object.keys(NL_ACHIEVEMENTS);
    if (keys.length === 0) return 0;
    return Math.round((state.nlAchievements.length / keys.length) * 100);
  }, [state]);

  const nlArtifactPower = useMemo(() => {
    let total = 0;
    for (const artifactId of state.nlArtifacts) {
      const def = NL_ARTIFACTS[artifactId];
      if (def) {
        total += def.power;
      }
    }
    return total;
  }, [state]);

  const nlAvailableEvents = useMemo(() => {
    return Object.values(NL_EVENTS).filter(e => !state.nlEvents.includes(e.id));
  }, [state]);

  const nlCurrentTitleDef = useMemo(() => {
    return NL_TITLES[state.nlTitle];
  }, [state]);

  const nlHiredRadiantDefs = useMemo(() => {
    const result: NLRadiantDef[] = [];
    for (const key of Object.keys(state.nlRadiants)) {
      const r = state.nlRadiants[key];
      if (r && r.hired) {
        const def = NL_RADIANTS[key];
        if (def) {
          result.push(def);
        }
      }
    }
    return result;
  }, [state]);

  const nlRadiantsBySpecies = useMemo(() => {
    const groups: Record<string, NLRadiantDef[]> = {};
    for (const key of Object.keys(state.nlRadiants)) {
      const r = state.nlRadiants[key];
      if (r && r.hired) {
        const def = NL_RADIANTS[key];
        if (def) {
          if (!groups[def.species]) {
            groups[def.species] = [];
          }
          groups[def.species].push(def);
        }
      }
    }
    return groups;
  }, [state]);

  const nlConstellationOverview = useMemo(() => {
    const overview: { def: NLConstellationDef; unlocked: boolean }[] = [];
    for (const key of Object.keys(NL_CONSTELLATIONS)) {
      const def = NL_CONSTELLATIONS[key];
      if (def) {
        overview.push({ def, unlocked: !!state.nlConstellations[key] });
      }
    }
    return overview;
  }, [state]);

  const nlStructureOverview = useMemo(() => {
    const overview: { def: NLStructureDef; level: number; built: boolean }[] = [];
    for (const key of Object.keys(NL_STRUCTURES)) {
      const def = NL_STRUCTURES[key];
      if (def) {
        const s = state.nlStructures[key];
        overview.push({
          def,
          level: s ? s.level : 0,
          built: s ? s.built : false,
        });
      }
    }
    return overview;
  }, [state]);

  const nlActiveEventCount = useMemo(() => {
    return state.nlEvents.length;
  }, [state]);

  const nlHasLegendaryRadiant = useMemo(() => {
    for (const key of Object.keys(state.nlRadiants)) {
      const r = state.nlRadiants[key];
      if (r && r.hired) {
        const def = NL_RADIANTS[key];
        if (def && def.rarity === NL_RARITY_LEGENDARY) {
          return true;
        }
      }
    }
    return false;
  }, [state]);

  const nlHasEpicRadiant = useMemo(() => {
    for (const key of Object.keys(state.nlRadiants)) {
      const r = state.nlRadiants[key];
      if (r && r.hired) {
        const def = NL_RADIANTS[key];
        if (def && def.rarity === NL_RARITY_EPIC) {
          return true;
        }
      }
    }
    return false;
  }, [state]);

  const nlEffectiveMultiplier = useMemo(() => {
    const base = 1;
    const structureBonus = 1 + nlTotalStructureBonus * 0.05;
    const artifactBonus = 1 + nlArtifactPower * 0.001;
    const constellationBonus = 1 + nlUnlockedConstellationCount * 0.05;
    return base * structureBonus * artifactBonus * constellationBonus;
  }, [state, nlTotalStructureBonus, nlArtifactPower, nlUnlockedConstellationCount]);

  const nlLevelProgress = useMemo(() => {
    const currentLevelExp = nlExpToLevel(state.nlLevel);
    const nextLevelExp = nlExpToLevel(state.nlLevel + 1);
    const progress = ((state.nlLuminosity - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }, [state]);

  // ─── Side Effects via useEffect ────────────────────────────────────

  useEffect(() => {
    const current = stateRef.current;
    if (current.nlStats.currentStreak > current.nlStats.highestCombo) {
      useNovaLightStore.setState((prev) => ({
        ...prev,
        nlStats: { ...prev.nlStats, highestCombo: prev.nlStats.currentStreak },
      }));
    }
  }, [state.nlStats.currentStreak, state.nlStats.highestCombo]);

  useEffect(() => {
    const current = stateRef.current;
    const calculatedLevel = nlLuminosityToLevel(current.nlLuminosity);
    if (calculatedLevel > current.nlLevel) {
      useNovaLightStore.setState({ nlLevel: calculatedLevel });
    }
  }, [state.nlLuminosity, state.nlLevel]);

  useEffect(() => {
    const current = stateRef.current;
    // Check achievements
    for (const key of Object.keys(NL_ACHIEVEMENTS)) {
      if (current.nlAchievements.includes(key)) continue;
      const ach = NL_ACHIEVEMENTS[key];
      if (!ach) continue;
      let met = false;
      const stats = current.nlStats;
      switch (ach.conditionKey) {
        case 'totalIgnited': met = stats.totalIgnited >= ach.threshold; break;
        case 'totalNovaBursts': met = stats.totalNovaBursts >= ach.threshold; break;
        case 'totalRadianceEmitted': met = stats.totalRadianceEmitted >= ach.threshold; break;
        case 'totalConstellationsFormed': met = stats.totalConstellationsFormed >= ach.threshold; break;
        case 'totalMaterialsHarvested': met = stats.totalMaterialsHarvested >= ach.threshold; break;
        case 'totalStarborn': met = stats.totalStarborn >= ach.threshold; break;
        case 'highestCombo': met = stats.highestCombo >= ach.threshold; break;
        case 'legendaryIgnited': met = nlHasLegendaryRadiant; break;
        case 'maxStructureLevel': met = getMaxStructureLevel(current) >= ach.threshold; break;
        case 'totalBuildings': met = getBuiltStructureCount(current) >= ach.threshold; break;
        case 'rareSpeciesCount': met = getRareSpeciesCount(current) >= ach.threshold; break;
        case 'artifactsActivated': met = current.nlArtifacts.length >= ach.threshold; break;
        case 'titleEarned': met = getTitleIndex(current.nlTitle) >= ach.threshold; break;
      }
      if (met) {
        useNovaLightStore.setState((prev) => ({
          ...prev,
          nlAchievements: [...prev.nlAchievements, key],
          nlLuminosity: prev.nlLuminosity + ach.reward,
        }));
      }
    }
  }, [state, nlHasLegendaryRadiant]);

  useEffect(() => {
    const current = stateRef.current;
    // Auto-upgrade title based on nlLuminosity
    const titleKeys = Object.keys(NL_TITLES);
    let bestTitle = current.nlTitle;
    for (const key of titleKeys) {
      const def = NL_TITLES[key];
      if (def && current.nlLuminosity >= def.requirement) {
        const bestIdx = titleKeys.indexOf(bestTitle);
        const thisIdx = titleKeys.indexOf(key);
        if (thisIdx > bestIdx) {
          bestTitle = key;
        }
      }
    }
    if (bestTitle !== current.nlTitle) {
      useNovaLightStore.setState({ nlTitle: bestTitle });
    }
  }, [state.nlLuminosity, state.nlTitle]);

  // ─── Helper functions for useEffect ────────────────────────────────

  function getMaxStructureLevel(s: NLState): number {
    let max = 0;
    for (const key of Object.keys(s.nlStructures)) {
      const st = s.nlStructures[key];
      if (st && st.built && st.level > max) {
        max = st.level;
      }
    }
    return max;
  }

  function getBuiltStructureCount(s: NLState): number {
    let count = 0;
    for (const key of Object.keys(s.nlStructures)) {
      const st = s.nlStructures[key];
      if (st && st.built) count++;
    }
    return count;
  }

  function getRareSpeciesCount(s: NLState): number {
    const species = new Set<string>();
    for (const key of Object.keys(s.nlRadiants)) {
      const r = s.nlRadiants[key];
      if (r && r.hired) {
        const def = NL_RADIANTS[key];
        if (def && (def.rarity === NL_RARITY_RARE || def.rarity === NL_RARITY_EPIC || def.rarity === NL_RARITY_LEGENDARY)) {
          species.add(def.species);
        }
      }
    }
    return species.size;
  }

  function getTitleIndex(titleId: string): number {
    return Object.keys(NL_TITLES).indexOf(titleId) + 1;
  }

  // ─── Action Functions ──────────────────────────────────────────────

  const nlIgnite = useCallback((radiantId: string): { success: boolean; message: string } => {
    const def = NL_RADIANTS[radiantId];
    if (!def) {
      return { success: false, message: '未知的新星之光' };
    }
    let result: { success: boolean; message: string } = { success: false, message: '' };
    useNovaLightStore.setState((prev) => {
      if (prev.nlRadiants[radiantId]?.hired) {
        result = { success: false, message: `${def.nameZh} 已经被点燃了` };
        return prev;
      }
      result = { success: true, message: `成功点燃 ${def.nameZh}！` };
      return {
        ...prev,
        nlRadiants: {
          ...prev.nlRadiants,
          [radiantId]: { hired: true, level: 1, experience: 0, constellationId: null },
        },
        nlStats: {
          ...prev.nlStats,
          totalIgnited: prev.nlStats.totalIgnited + 1,
        },
      };
    });
    return result;
  }, []);

  const nlNovaBurst = useCallback((): { success: boolean; message: string; damage: number } => {
    let result: { success: boolean; message: string; damage: number } = { success: false, message: '', damage: 0 };
    useNovaLightStore.setState((prev) => {
      let radiantPower = 0;
      for (const rk of Object.keys(prev.nlRadiants)) {
        const rv = prev.nlRadiants[rk];
        if (rv && rv.hired) {
          radiantPower += nlCalcRadiantPower(rk, rv.level);
        }
      }
      const baseDamage = 50 + radiantPower * 0.1;
      const damage = Math.floor(baseDamage * (1 + Object.keys(prev.nlStructures).length * 0.05));
      result = { success: true, message: '新星爆发！', damage };
      return {
        ...prev,
        nlStats: {
          ...prev.nlStats,
          totalNovaBursts: prev.nlStats.totalNovaBursts + 1,
        },
      };
    });
    return result;
  }, [nlEffectiveMultiplier]);

  const nlRadiate = useCallback((amount: number): void => {
    useNovaLightStore.setState((prev) => ({
      ...prev,
      nlLuminosity: prev.nlLuminosity + amount,
      nlStats: {
        ...prev.nlStats,
        totalRadianceEmitted: prev.nlStats.totalRadianceEmitted + amount,
      },
    }));
  }, []);

  const nlFormConstellation = useCallback((constellationId: string): { success: boolean; message: string } => {
    const def = NL_CONSTELLATIONS[constellationId];
    if (!def) {
      return { success: false, message: '未知的星座' };
    }
    let result: { success: boolean; message: string } = { success: false, message: '' };
    useNovaLightStore.setState((prev) => {
      if (prev.nlConstellations[constellationId]) {
        result = { success: false, message: `${def.nameZh} 已经解锁` };
        return prev;
      }
      result = { success: true, message: `成功组建星座：${def.nameZh}！` };
      return {
        ...prev,
        nlConstellations: { ...prev.nlConstellations, [constellationId]: true },
        nlStats: {
          ...prev.nlStats,
          totalConstellationsFormed: prev.nlStats.totalConstellationsFormed + 1,
        },
      };
    });
    return result;
  }, []);

  const nlBuildStructure = useCallback((structureId: string): { success: boolean; message: string } => {
    const def = NL_STRUCTURES[structureId];
    if (!def) {
      return { success: false, message: '未知的建筑' };
    }
    let result: { success: boolean; message: string } = { success: false, message: '' };
    useNovaLightStore.setState((prev) => {
      if (prev.nlStructures[structureId]?.built) {
        result = { success: false, message: `${def.nameZh} 已经建造` };
        return prev;
      }
      const cost = nlCalcStructureCost(def.baseCost, 0, def.costMultiplier);
      if (prev.nlLuminosity < cost) {
        result = { success: false, message: `辉光不足，需要 ${cost} 辉光` };
        return prev;
      }
      result = { success: true, message: `成功建造 ${def.nameZh}！` };
      return {
        ...prev,
        nlStructures: {
          ...prev.nlStructures,
          [structureId]: { level: 1, built: true },
        },
        nlLuminosity: prev.nlLuminosity - cost,
      };
    });
    return result;
  }, []);

  const nlUpgradeStructure = useCallback((structureId: string): { success: boolean; message: string } => {
    const def = NL_STRUCTURES[structureId];
    if (!def) {
      return { success: false, message: '未知的建筑' };
    }
    let result: { success: boolean; message: string } = { success: false, message: '' };
    useNovaLightStore.setState((prev) => {
      const s = prev.nlStructures[structureId];
      if (!s || !s.built) {
        result = { success: false, message: '建筑尚未建造' };
        return prev;
      }
      if (s.level >= def.maxLevel) {
        result = { success: false, message: '已达到最高等级' };
        return prev;
      }
      const cost = nlCalcStructureCost(def.baseCost, s.level, def.costMultiplier);
      if (prev.nlLuminosity < cost) {
        result = { success: false, message: `辉光不足，需要 ${cost} 辉光` };
        return prev;
      }
      result = { success: true, message: `${def.nameZh} 升级至 ${s.level + 1} 级！` };
      return {
        ...prev,
        nlStructures: {
          ...prev.nlStructures,
          [structureId]: { ...s, level: s.level + 1 },
        },
        nlLuminosity: prev.nlLuminosity - cost,
      };
    });
    return result;
  }, []);

  const nlActivateArtifact = useCallback((artifactId: string): { success: boolean; message: string } => {
    const def = NL_ARTIFACTS[artifactId];
    if (!def) {
      return { success: false, message: '未知神器' };
    }
    let result: { success: boolean; message: string } = { success: false, message: '' };
    useNovaLightStore.setState((prev) => {
      if (prev.nlArtifacts.includes(artifactId)) {
        result = { success: false, message: `${def.nameZh} 已经激活` };
        return prev;
      }
      result = { success: true, message: `成功激活神器：${def.nameZh}！` };
      return {
        ...prev,
        nlArtifacts: [...prev.nlArtifacts, artifactId],
      };
    });
    return result;
  }, []);

  const nlTriggerEvent = useCallback((eventId: string): { success: boolean; message: string } => {
    const def = NL_EVENTS[eventId];
    if (!def) {
      return { success: false, message: '未知事件' };
    }
    let result: { success: boolean; message: string } = { success: false, message: '' };
    useNovaLightStore.setState((prev) => {
      if (prev.nlEvents.includes(eventId)) {
        result = { success: false, message: '该事件已经触发过' };
        return prev;
      }
      const newInventory = { ...prev.nlInventory };
      for (const r of def.reward) {
        newInventory[r.materialId] = (newInventory[r.materialId] ?? 0) + r.amount;
      }
      result = { success: true, message: `事件触发：${def.nameZh}，奖励已发放！` };
      return {
        ...prev,
        nlInventory: newInventory,
        nlEvents: [...prev.nlEvents, eventId],
        nlStats: {
          ...prev.nlStats,
          totalMaterialsHarvested: prev.nlStats.totalMaterialsHarvested + def.reward.reduce((sum, r) => sum + r.amount, 0),
        },
      };
    });
    return result;
  }, []);

  const nlHarvestMaterial = useCallback((materialId: string, amount: number): void => {
    useNovaLightStore.setState((prev) => ({
      ...prev,
      nlInventory: {
        ...prev.nlInventory,
        [materialId]: (prev.nlInventory[materialId] ?? 0) + amount,
      },
      nlStats: {
        ...prev.nlStats,
        totalMaterialsHarvested: prev.nlStats.totalMaterialsHarvested + amount,
      },
    }));
  }, []);

  const nlAddMaterial = useCallback((materialId: string, amount: number): void => {
    useNovaLightStore.setState((prev) => ({
      ...prev,
      nlInventory: {
        ...prev.nlInventory,
        [materialId]: (prev.nlInventory[materialId] ?? 0) + amount,
      },
      nlStats: {
        ...prev.nlStats,
        totalMaterialsHarvested: prev.nlStats.totalMaterialsHarvested + amount,
      },
    }));
  }, []);

  const nlRemoveMaterial = useCallback((materialId: string, amount: number): boolean => {
    let removed = false;
    useNovaLightStore.setState((prev) => {
      const current = prev.nlInventory[materialId] ?? 0;
      if (current < amount) return prev;
      removed = true;
      return {
        ...prev,
        nlInventory: {
          ...prev.nlInventory,
          [materialId]: current - amount,
        },
      };
    });
    return removed;
  }, []);

  const nlStarbornRebirth = useCallback((): { success: boolean; message: string } => {
    let result: { success: boolean; message: string } = { success: false, message: '' };
    useNovaLightStore.setState((prev) => {
      result = {
        success: true,
        message: '星生轮回完成！获得大量辉光奖励。',
      };
      return {
        ...prev,
        nlStarborn: prev.nlStarborn + 1,
        nlLuminosity: prev.nlLuminosity + 500 + prev.nlStarborn * 100,
        nlStats: {
          ...prev.nlStats,
          totalStarborn: prev.nlStats.totalStarborn + 1,
          currentStreak: 0,
        },
      };
    });
    return result;
  }, []);

  const nlRecordWordCompleted = useCallback((): void => {
    useNovaLightStore.setState((prev) => {
      const newStreak = prev.nlStats.currentStreak + 1;
      const newHighest = newStreak > prev.nlStats.highestCombo ? newStreak : prev.nlStats.highestCombo;
      const lumGain = 5 + newStreak * 2;
      return {
        ...prev,
        nlLuminosity: prev.nlLuminosity + lumGain,
        nlStats: {
          ...prev.nlStats,
          currentStreak: newStreak,
          highestCombo: newHighest,
          totalRadianceEmitted: prev.nlStats.totalRadianceEmitted + lumGain,
        },
      };
    });
  }, []);

  const nlResetStreak = useCallback((): void => {
    useNovaLightStore.setState((prev) => ({
      ...prev,
      nlStats: { ...prev.nlStats, currentStreak: 0 },
    }));
  }, []);

  const nlSetConstellationForRadiant = useCallback((radiantId: string, constellationId: string | null): { success: boolean; message: string } => {
    const radiantDef = NL_RADIANTS[radiantId];
    if (!radiantDef) {
      return { success: false, message: '未知的新星之光' };
    }
    if (constellationId !== null) {
      const constDef = NL_CONSTELLATIONS[constellationId];
      if (!constDef) {
        return { success: false, message: '未知的星座' };
      }
    }
    let result: { success: boolean; message: string } = { success: false, message: '' };
    useNovaLightStore.setState((prev) => {
      const r = prev.nlRadiants[radiantId];
      if (!r || !r.hired) {
        result = { success: false, message: `${radiantDef.nameZh} 未被点燃` };
        return prev;
      }
      const msg = constellationId !== null
        ? `${radiantDef.nameZh} 已驻守星座`
        : `${radiantDef.nameZh} 已撤回`;
      result = { success: true, message: msg };
      return {
        ...prev,
        nlRadiants: {
          ...prev.nlRadiants,
          [radiantId]: { ...r, constellationId },
        },
      };
    });
    return result;
  }, []);

  const nlSetActiveTitle = useCallback((titleId: string): { success: boolean; message: string } => {
    const def = NL_TITLES[titleId];
    if (!def) {
      return { success: false, message: '未知的称号' };
    }
    useNovaLightStore.setState({ nlTitle: titleId });
    return { success: true, message: `称号已切换为：${def.nameZh}` };
  }, []);

  const nlResetNovaLight = useCallback((): void => {
    useNovaLightStore.setState({ ...NL_INITIAL_STATE });
  }, []);

  // ─── Compose and Return the nlAPI Object ───────────────────────────

  const nlAPI = useMemo(() => ({
    // ── State ──────────────────────────────────────────────────
    state,

    // ── Color Constants ────────────────────────────────────────
    NL_NOVA_GOLD,
    NL_STELLAR_WHITE,
    NL_NEBULA_PINK,
    NL_COSMIC_BLUE,
    NL_SOLAR_FLARE,
    NL_PHOTON_GLOW,
    NL_AURORA_GREEN,
    NL_VOID_PURPLE,
    NL_THEME,

    // ── Rarity Constants ───────────────────────────────────────
    NL_RARITY_COMMON,
    NL_RARITY_UNCOMMON,
    NL_RARITY_RARE,
    NL_RARITY_EPIC,
    NL_RARITY_LEGENDARY,
    NL_RARITY_COLORS,
    NL_RARITY_MULTIPLIER,
    NL_RARITY_ORDER,

    // ── Species Constants ──────────────────────────────────────
    NL_SPECIES_SOLAR_FLARE,
    NL_SPECIES_NEBULA_SPRITE,
    NL_SPECIES_PULSAR_WISP,
    NL_SPECIES_QUASAR_SPIRIT,
    NL_SPECIES_PHOTON_SERAPH,
    NL_SPECIES_STARDUST_FAIRY,
    NL_SPECIES_COSMIC_RAY,
    NL_SPECIES_COLORS,
    NL_SPECIES_LABELS,
    NL_SPECIES_ORDER,

    // ── Data Definitions ───────────────────────────────────────
    NL_RADIANTS,
    NL_CONSTELLATIONS,
    NL_MATERIALS,
    NL_STRUCTURES,
    NL_ABILITIES,
    NL_ACHIEVEMENTS,
    NL_TITLES,
    NL_ARTIFACTS,
    NL_EVENTS,

    // ── State Properties ───────────────────────────────────────
    nlLevel: state.nlLevel,
    nlLuminosity: state.nlLuminosity,
    nlStarborn: state.nlStarborn,

    // ── Computed Values ────────────────────────────────────────
    nlActiveRadiantCount,
    nlTotalRadiantPower,
    nlUnlockedConstellationCount,
    nlBuiltStructureCount,
    nlTotalStructureBonus,
    nlInventoryCount,
    nlAchievementProgress,
    nlArtifactPower,
    nlAvailableEvents,
    nlCurrentTitleDef,
    nlHiredRadiantDefs,
    nlRadiantsBySpecies,
    nlConstellationOverview,
    nlStructureOverview,
    nlActiveEventCount,
    nlHasLegendaryRadiant,
    nlHasEpicRadiant,
    nlEffectiveMultiplier,
    nlLevelProgress,

    // ── Action Functions ───────────────────────────────────────
    nlIgnite,
    nlNovaBurst,
    nlRadiate,
    nlFormConstellation,
    nlBuildStructure,
    nlUpgradeStructure,
    nlActivateArtifact,
    nlTriggerEvent,
    nlHarvestMaterial,
    nlAddMaterial,
    nlRemoveMaterial,
    nlStarbornRebirth,
    nlRecordWordCompleted,
    nlResetStreak,
    nlSetConstellationForRadiant,
    nlSetActiveTitle,
    nlResetNovaLight,

    // ── Lookup Helpers ─────────────────────────────────────────
    nlGetRadiantDef,
    nlGetConstellationDef,
    nlGetMaterialDef,
    nlGetStructureDef,
    nlGetAbilityDef,
    nlGetAchievementDef,
    nlGetTitleDef,
    nlGetArtifactDef,
    nlGetEventDef,
    nlGetRarityColor,
    nlGetSpeciesColor,
    nlGetRarityMultiplier,
    nlCalcStructureCost,
    nlCalcStructureBonus,
    nlExpToLevel,
    nlLuminosityToLevel,
    nlCalcRadiantPower,
  }), [
    state,
    NL_THEME,
    nlActiveRadiantCount,
    nlTotalRadiantPower,
    nlUnlockedConstellationCount,
    nlBuiltStructureCount,
    nlTotalStructureBonus,
    nlInventoryCount,
    nlAchievementProgress,
    nlArtifactPower,
    nlAvailableEvents,
    nlCurrentTitleDef,
    nlHiredRadiantDefs,
    nlRadiantsBySpecies,
    nlConstellationOverview,
    nlStructureOverview,
    nlActiveEventCount,
    nlHasLegendaryRadiant,
    nlHasEpicRadiant,
    nlEffectiveMultiplier,
    nlLevelProgress,
    nlIgnite,
    nlNovaBurst,
    nlRadiate,
    nlFormConstellation,
    nlBuildStructure,
    nlUpgradeStructure,
    nlActivateArtifact,
    nlTriggerEvent,
    nlHarvestMaterial,
    nlAddMaterial,
    nlRemoveMaterial,
    nlStarbornRebirth,
    nlRecordWordCompleted,
    nlResetStreak,
    nlSetConstellationForRadiant,
    nlSetActiveTitle,
    nlResetNovaLight,
  ]);

  return nlAPI;
}
