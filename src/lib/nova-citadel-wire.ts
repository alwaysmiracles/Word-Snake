'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   NOVA CITADEL  新星堡垒  —  Star Guardian Wire Module
   Color Theme: Solar #FFD700 · Nebula #9370DB · Pulsar #00CED1 · Nova #FFFAFA
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── Color Constants ────────────────────────────────────────────────────────
const NX_SOLAR = '#FFD700';
const NX_NEBULA = '#9370DB';
const NX_PULSAR = '#00CED1';
const NX_NOVA_WHITE = '#FFFAFA';
const NX_ECLIPSE = '#2F1B41';
const NX_CORONA = '#FF6347';
const NX_VOID = '#0D0221';

// ─── Rarity Constants ──────────────────────────────────────────────────────
const NX_RARITY_COMMON = 'common' as const;
const NX_RARITY_UNCOMMON = 'uncommon' as const;
const NX_RARITY_RARE = 'rare' as const;
const NX_RARITY_EPIC = 'epic' as const;
const NX_RARITY_LEGENDARY = 'legendary' as const;

const NX_RARITY_COLORS: Record<string, string> = {
  [NX_RARITY_COMMON]: '#A0A0A0',
  [NX_RARITY_UNCOMMON]: '#4CAF50',
  [NX_RARITY_RARE]: '#2196F3',
  [NX_RARITY_EPIC]: NX_NEBULA,
  [NX_RARITY_LEGENDARY]: NX_SOLAR,
};

const NX_RARITY_MULTIPLIER: Record<string, number> = {
  [NX_RARITY_COMMON]: 1,
  [NX_RARITY_UNCOMMON]: 1.5,
  [NX_RARITY_RARE]: 2.5,
  [NX_RARITY_EPIC]: 4,
  [NX_RARITY_LEGENDARY]: 7,
};

// ─── Guardian Type Constants ────────────────────────────────────────────────
const NX_TYPE_SOLAR_KNIGHT = 'solar_knight' as const;
const NX_TYPE_NEBULA_MAGE = 'nebula_mage' as const;
const NX_TYPE_PULSAR_RANGER = 'pulsar_ranger' as const;
const NX_TYPE_QUASAR_TITAN = 'quasar_titan' as const;
const NX_TYPE_ECLIPSE_DRUID = 'eclipse_druid' as const;
const NX_TYPE_SUPERNOVA_ARCHON = 'supernova_archon' as const;
const NX_TYPE_VORTEX_CHAMPION = 'vortex_champion' as const;

const NX_TYPE_COLORS: Record<string, string> = {
  [NX_TYPE_SOLAR_KNIGHT]: NX_SOLAR,
  [NX_TYPE_NEBULA_MAGE]: NX_NEBULA,
  [NX_TYPE_PULSAR_RANGER]: NX_PULSAR,
  [NX_TYPE_QUASAR_TITAN]: NX_CORONA,
  [NX_TYPE_ECLIPSE_DRUID]: NX_ECLIPSE,
  [NX_TYPE_SUPERNOVA_ARCHON]: NX_NOVA_WHITE,
  [NX_TYPE_VORTEX_CHAMPION]: '#00FF7F',
};

const NX_TYPE_LABELS: Record<string, string> = {
  [NX_TYPE_SOLAR_KNIGHT]: '太阳骑士',
  [NX_TYPE_NEBULA_MAGE]: '星云法师',
  [NX_TYPE_PULSAR_RANGER]: '脉冲游侠',
  [NX_TYPE_QUASAR_TITAN]: '类星泰坦',
  [NX_TYPE_ECLIPSE_DRUID]: '蚀影德鲁伊',
  [NX_TYPE_SUPERNOVA_ARCHON]: '超新星执政官',
  [NX_TYPE_VORTEX_CHAMPION]: '涡旋冠军',
};

// ─── Rarity Order ───────────────────────────────────────────────────────────
const NX_RARITY_ORDER = [
  NX_RARITY_COMMON,
  NX_RARITY_UNCOMMON,
  NX_RARITY_RARE,
  NX_RARITY_EPIC,
  NX_RARITY_LEGENDARY,
] as const;

const NX_TYPE_ORDER = [
  NX_TYPE_SOLAR_KNIGHT,
  NX_TYPE_NEBULA_MAGE,
  NX_TYPE_PULSAR_RANGER,
  NX_TYPE_QUASAR_TITAN,
  NX_TYPE_ECLIPSE_DRUID,
  NX_TYPE_SUPERNOVA_ARCHON,
  NX_TYPE_VORTEX_CHAMPION,
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// 35 STAR GUARDIANS  (5 Rarity × 7 Types)
// ═══════════════════════════════════════════════════════════════════════════

interface NxGuardianDef {
  id: string;
  name: string;
  nameZh: string;
  rarity: string;
  type: string;
  power: number;
  defense: number;
  speed: number;
  description: string;
}

const NX_GUARDIANS: Record<string, NxGuardianDef> = {
  // ── Common (C) ─────────────────────────────────────────────────────
  nxg_c_sk_01: {
    id: 'nxg_c_sk_01', name: 'Solar Squire', nameZh: '太阳侍从',
    rarity: NX_RARITY_COMMON, type: NX_TYPE_SOLAR_KNIGHT,
    power: 12, defense: 10, speed: 8,
    description: '新入伍的太阳骑士学徒，手持微光之剑守护新星堡垒的前哨。',
  },
  nxg_c_nm_02: {
    id: 'nxg_c_nm_02', name: 'Nebula Apprentice', nameZh: '星云学徒',
    rarity: NX_RARITY_COMMON, type: NX_TYPE_NEBULA_MAGE,
    power: 10, defense: 8, speed: 12,
    description: '在星云中汲取魔力的初学者，能释放微弱的紫色能量波。',
  },
  nxg_c_pr_03: {
    id: 'nxg_c_pr_03', name: 'Pulsar Scout', nameZh: '脉冲侦察兵',
    rarity: NX_RARITY_COMMON, type: NX_TYPE_PULSAR_RANGER,
    power: 8, defense: 6, speed: 16,
    description: '擅长高速侦察的脉冲射手，以迅捷闻名于堡垒守卫队。',
  },
  nxg_c_qt_04: {
    id: 'nxg_c_qt_04', name: 'Quasar Warden', nameZh: '类星守卫',
    rarity: NX_RARITY_COMMON, type: NX_TYPE_QUASAR_TITAN,
    power: 15, defense: 14, speed: 4,
    description: '体型庞大的类星体守卫，以血肉之躯筑起第一道防线。',
  },
  nxg_c_ed_05: {
    id: 'nxg_c_ed_05', name: 'Eclipse Acolyte', nameZh: '蚀影侍僧',
    rarity: NX_RARITY_COMMON, type: NX_TYPE_ECLIPSE_DRUID,
    power: 10, defense: 12, speed: 8,
    description: '蚀影教团的入门弟子，能在暗处恢复战友的战斗意志。',
  },
  nxg_c_sa_06: {
    id: 'nxg_c_sa_06', name: 'Supernova Wayfarer', nameZh: '超新星行者',
    rarity: NX_RARITY_COMMON, type: NX_TYPE_SUPERNOVA_ARCHON,
    power: 13, defense: 7, speed: 10,
    description: '行走在超新星残骸间的旅者，收集星尘以点亮堡垒灯火。',
  },
  nxg_c_vc_07: {
    id: 'nxg_c_vc_07', name: 'Vortex Recruit', nameZh: '涡旋新兵',
    rarity: NX_RARITY_COMMON, type: NX_TYPE_VORTEX_CHAMPION,
    power: 11, defense: 9, speed: 10,
    description: '涡旋竞技场的新晋战士，潜力尚待发掘。',
  },

  // ── Uncommon (U) ───────────────────────────────────────────────────
  nxg_u_sk_08: {
    id: 'nxg_u_sk_08', name: 'Solar Warrior', nameZh: '太阳战士',
    rarity: NX_RARITY_UNCOMMON, type: NX_TYPE_SOLAR_KNIGHT,
    power: 22, defense: 18, speed: 12,
    description: '经历数场星际战役洗礼的太阳骑士，剑法初见锋芒。',
  },
  nxg_u_nm_09: {
    id: 'nxg_u_nm_09', name: 'Nebula Warlock', nameZh: '星云术士',
    rarity: NX_RARITY_UNCOMMON, type: NX_TYPE_NEBULA_MAGE,
    power: 20, defense: 14, speed: 18,
    description: '掌握了星云编织术的术士，能用紫雾缠绕敌人。',
  },
  nxg_u_pr_10: {
    id: 'nxg_u_pr_10', name: 'Pulsar Marksman', nameZh: '脉冲射手',
    rarity: NX_RARITY_UNCOMMON, type: NX_TYPE_PULSAR_RANGER,
    power: 18, defense: 10, speed: 24,
    description: '百发百中的脉冲射手，青色光束从不偏离目标。',
  },
  nxg_u_qt_11: {
    id: 'nxg_u_qt_11', name: 'Quasar Guardian', nameZh: '类星卫士',
    rarity: NX_RARITY_UNCOMMON, type: NX_TYPE_QUASAR_TITAN,
    power: 28, defense: 26, speed: 6,
    description: '身披类星体铠甲的巨人，可承受重炮轰击而不退缩。',
  },
  nxg_u_ed_12: {
    id: 'nxg_u_ed_12', name: 'Eclipse Druid', nameZh: '蚀影德鲁伊',
    rarity: NX_RARITY_UNCOMMON, type: NX_TYPE_ECLIPSE_DRUID,
    power: 18, defense: 22, speed: 14,
    description: '与蚀影共生的德鲁伊，能在战斗中汲取暗能量治愈全队。',
  },
  nxg_u_sa_13: {
    id: 'nxg_u_sa_13', name: 'Supernova Summoner', nameZh: '超新星召唤师',
    rarity: NX_RARITY_UNCOMMON, type: NX_TYPE_SUPERNOVA_ARCHON,
    power: 24, defense: 12, speed: 16,
    description: '能召唤微型超新星爆发的召唤师，毁灭力令人敬畏。',
  },
  nxg_u_vc_14: {
    id: 'nxg_u_vc_14', name: 'Vortex Knight', nameZh: '涡旋骑士',
    rarity: NX_RARITY_UNCOMMON, type: NX_TYPE_VORTEX_CHAMPION,
    power: 20, defense: 16, speed: 18,
    description: '驾驭涡旋之力的骑士，攻守兼备的全面战士。',
  },

  // ── Rare (R) ───────────────────────────────────────────────────────
  nxg_r_sk_15: {
    id: 'nxg_r_sk_15', name: 'Solar Paladin', nameZh: '太阳圣骑士',
    rarity: NX_RARITY_RARE, type: NX_TYPE_SOLAR_KNIGHT,
    power: 38, defense: 32, speed: 18,
    description: '太阳骑士团的中坚力量，金光圣剑可斩裂虚空生物。',
  },
  nxg_r_nm_16: {
    id: 'nxg_r_nm_16', name: 'Nebula Sorcerer', nameZh: '星云法师',
    rarity: NX_RARITY_RARE, type: NX_TYPE_NEBULA_MAGE,
    power: 35, defense: 24, speed: 28,
    description: '精通星云禁咒的法师，可召唤星云风暴席卷战场。',
  },
  nxg_r_pr_17: {
    id: 'nxg_r_pr_17', name: 'Pulsar Ranger', nameZh: '脉冲游侠',
    rarity: NX_RARITY_RARE, type: NX_TYPE_PULSAR_RANGER,
    power: 30, defense: 18, speed: 38,
    description: '穿梭于脉冲星丛林的游侠，箭矢带有穿越时空的力量。',
  },
  nxg_r_qt_18: {
    id: 'nxg_r_qt_18', name: 'Quasar Colossus', nameZh: '类星巨人',
    rarity: NX_RARITY_RARE, type: NX_TYPE_QUASAR_TITAN,
    power: 48, defense: 44, speed: 8,
    description: '身高百米的类星体巨人，一脚可震碎小行星带。',
  },
  nxg_r_ed_19: {
    id: 'nxg_r_ed_19', name: 'Eclipse Sage', nameZh: '蚀影贤者',
    rarity: NX_RARITY_RARE, type: NX_TYPE_ECLIPSE_DRUID,
    power: 32, defense: 38, speed: 22,
    description: '洞悉蚀影本质的贤者，能让敌人在永夜中迷失自我。',
  },
  nxg_r_sa_20: {
    id: 'nxg_r_sa_20', name: 'Supernova Archmage', nameZh: '超新星大法师',
    rarity: NX_RARITY_RARE, type: NX_TYPE_SUPERNOVA_ARCHON,
    power: 42, defense: 20, speed: 26,
    description: '操控超新星能量的大法师，一念之间可令星辰陨落。',
  },
  nxg_r_vc_21: {
    id: 'nxg_r_vc_21', name: 'Vortex Champion', nameZh: '涡旋冠军',
    rarity: NX_RARITY_RARE, type: NX_TYPE_VORTEX_CHAMPION,
    power: 36, defense: 28, speed: 32,
    description: '涡旋竞技场的冠军勇士，旋风斩无坚不摧。',
  },

  // ── Epic (E) ───────────────────────────────────────────────────────
  nxg_e_sk_22: {
    id: 'nxg_e_sk_22', name: 'Solar Commander', nameZh: '太阳指挥官',
    rarity: NX_RARITY_EPIC, type: NX_TYPE_SOLAR_KNIGHT,
    power: 62, defense: 54, speed: 28,
    description: '统帅太阳骑士团的指挥官，日冕剑阵可焚灭整支舰队。',
  },
  nxg_e_nm_23: {
    id: 'nxg_e_nm_23', name: 'Nebula Hierophant', nameZh: '星云大祭司',
    rarity: NX_RARITY_EPIC, type: NX_TYPE_NEBULA_MAGE,
    power: 58, defense: 40, speed: 44,
    description: '星云教团最高祭司，能撕裂空间折叠传送整支军队。',
  },
  nxg_e_pr_24: {
    id: 'nxg_e_pr_24', name: 'Pulsar Hunter', nameZh: '脉冲猎人',
    rarity: NX_RARITY_EPIC, type: NX_TYPE_PULSAR_RANGER,
    power: 50, defense: 30, speed: 60,
    description: '追踪猎物穿越银河系的传奇猎人，箭速超越光速。',
  },
  nxg_e_qt_25: {
    id: 'nxg_e_qt_25', name: 'Quasar Titan', nameZh: '类星泰坦',
    rarity: NX_RARITY_EPIC, type: NX_TYPE_QUASAR_TITAN,
    power: 78, defense: 72, speed: 12,
    description: '觉醒了类星体之力的泰坦，身躯即是移动的堡垒。',
  },
  nxg_e_ed_26: {
    id: 'nxg_e_ed_26', name: 'Eclipse Archdruid', nameZh: '蚀影大德鲁伊',
    rarity: NX_RARITY_EPIC, type: NX_TYPE_ECLIPSE_DRUID,
    power: 54, defense: 62, speed: 36,
    description: '与永恒蚀影融合的大德鲁伊，其领域内万物凋零。',
  },
  nxg_e_sa_27: {
    id: 'nxg_e_sa_27', name: 'Supernova Praetor', nameZh: '超新星执政官',
    rarity: NX_RARITY_EPIC, type: NX_TYPE_SUPERNOVA_ARCHON,
    power: 70, defense: 34, speed: 42,
    description: '掌管超新星军团的执政官，号令之下万星齐爆。',
  },
  nxg_e_vc_28: {
    id: 'nxg_e_vc_28', name: 'Vortex Grand Duke', nameZh: '涡旋大公',
    rarity: NX_RARITY_EPIC, type: NX_TYPE_VORTEX_CHAMPION,
    power: 60, defense: 46, speed: 52,
    description: '涡旋王庭的大公爵，其漩涡之力可吞噬一切。',
  },

  // ── Legendary (L) ──────────────────────────────────────────────────
  nxg_l_sk_29: {
    id: 'nxg_l_sk_29', name: 'Solar King', nameZh: '太阳王',
    rarity: NX_RARITY_LEGENDARY, type: NX_TYPE_SOLAR_KNIGHT,
    power: 100, defense: 88, speed: 44,
    description: '传说中太阳骑士的始祖，其圣剑蕴含恒星核心的全部能量。',
  },
  nxg_l_nm_30: {
    id: 'nxg_l_nm_30', name: 'Nebula Sovereign', nameZh: '星云至尊',
    rarity: NX_RARITY_LEGENDARY, type: NX_TYPE_NEBULA_MAGE,
    power: 95, defense: 66, speed: 72,
    description: '诞生于星云深处的至尊法师，一念可改写宇宙法则。',
  },
  nxg_l_pr_31: {
    id: 'nxg_l_pr_31', name: 'Pulsar Legend', nameZh: '脉冲传说',
    rarity: NX_RARITY_LEGENDARY, type: NX_TYPE_PULSAR_RANGER,
    power: 82, defense: 48, speed: 98,
    description: '脉冲星中诞生的传说射手，其箭矢可穿透维度壁垒。',
  },
  nxg_l_qt_32: {
    id: 'nxg_l_qt_32', name: 'Quasar Deity', nameZh: '类星神将',
    rarity: NX_RARITY_LEGENDARY, type: NX_TYPE_QUASAR_TITAN,
    power: 128, defense: 118, speed: 18,
    description: '类星体意识觉醒的神将，其存在即是宇宙级的威慑。',
  },
  nxg_l_ed_33: {
    id: 'nxg_l_ed_33', name: 'Eclipse Oracle', nameZh: '蚀影神谕者',
    rarity: NX_RARITY_LEGENDARY, type: NX_TYPE_ECLIPSE_DRUID,
    power: 88, defense: 100, speed: 58,
    description: '预知宇宙终焉的神谕者，蚀影是其永恒的眷属。',
  },
  nxg_l_sa_34: {
    id: 'nxg_l_sa_34', name: 'Supernova Emperor', nameZh: '超新星大帝',
    rarity: NX_RARITY_LEGENDARY, type: NX_TYPE_SUPERNOVA_ARCHON,
    power: 115, defense: 56, speed: 68,
    description: '超新星文明的至高统治者，一举一动皆能引发星系级连锁反应。',
  },
  nxg_l_vc_35: {
    id: 'nxg_l_vc_35', name: 'Vortex Eternal', nameZh: '涡旋永恒者',
    rarity: NX_RARITY_LEGENDARY, type: NX_TYPE_VORTEX_CHAMPION,
    power: 98, defense: 76, speed: 84,
    description: '超越时间存在的涡旋战士，其漩涡之力永恒不灭。',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 8 CITADEL TOWERS
// ═══════════════════════════════════════════════════════════════════════════

interface NxTowerDef {
  id: string;
  name: string;
  nameZh: string;
  element: string;
  baseHp: number;
  baseDefense: number;
  passiveBonus: string;
  description: string;
  color: string;
}

const NX_TOWERS: Record<string, NxTowerDef> = {
  nxt_solar_spire: {
    id: 'nxt_solar_spire', name: 'Solar Spire', nameZh: '太阳尖塔',
    element: 'solar', baseHp: 500, baseDefense: 40,
    passiveBonus: '+15% 火焰伤害', color: NX_SOLAR,
    description: '矗立于堡垒最高处的太阳尖塔，汇聚恒星之火照亮整个星域。',
  },
  nxt_nebula_sanctum: {
    id: 'nxt_nebula_sanctum', name: 'Nebula Sanctum', nameZh: '星云圣殿',
    element: 'nebula', baseHp: 600, baseDefense: 50,
    passiveBonus: '+15% 魔法防御', color: NX_NEBULA,
    description: '弥漫着紫色星云的圣殿，为堡垒提供强大的魔法屏障。',
  },
  nxt_pulsar_bastion: {
    id: 'nxt_pulsar_bastion', name: 'Pulsar Bastion', nameZh: '脉冲堡垒',
    element: 'pulsar', baseHp: 450, baseDefense: 35,
    passiveBonus: '+20% 攻击速度', color: NX_PULSAR,
    description: '发射高频脉冲波的堡垒，是堡垒外围的快速反应基地。',
  },
  nxt_quasar_gate: {
    id: 'nxt_quasar_gate', name: 'Quasar Gate', nameZh: '类星之门',
    element: 'quasar', baseHp: 800, baseDefense: 65,
    passiveBonus: '+25% 全体防御', color: NX_CORONA,
    description: '坚不可摧的类星之门，是抵御大规模入侵的最后屏障。',
  },
  nxt_eclipse_vault: {
    id: 'nxt_eclipse_vault', name: 'Eclipse Vault', nameZh: '蚀影宝库',
    element: 'eclipse', baseHp: 550, baseDefense: 45,
    passiveBonus: '+10% 资源产出', color: NX_ECLIPSE,
    description: '隐藏在永恒蚀影中的宝库，储存着堡垒最珍贵的资源。',
  },
  nxt_supernova_forge: {
    id: 'nxt_supernova_forge', name: 'Supernova Forge', nameZh: '超新星铸造厂',
    element: 'supernova', baseHp: 700, baseDefense: 55,
    passiveBonus: '+20% 装备强化', color: NX_NOVA_WHITE,
    description: '利用超新星余热锻造武器的铸造厂，产出最顶级的星辉装备。',
  },
  nxt_vortex_nexus: {
    id: 'nxt_vortex_nexus', name: 'Vortex Nexus', nameZh: '涡旋枢纽',
    element: 'vortex', baseHp: 650, baseDefense: 48,
    passiveBonus: '+15% 技能冷却缩减', color: '#00FF7F',
    description: '连接所有塔楼的涡旋枢纽，协调堡垒的防御网络。',
  },
  nxt_void_citadel: {
    id: 'nxt_void_citadel', name: 'Void Citadel', nameZh: '虚空堡垒核心',
    element: 'void', baseHp: 1000, baseDefense: 80,
    passiveBonus: '+30% 全属性', color: NX_VOID,
    description: '新星堡垒的心脏，虚空能量的终极来源，守护此处即守护一切。',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 30 STELLAR MATERIALS
// ═══════════════════════════════════════════════════════════════════════════

interface NxMaterialDef {
  id: string;
  name: string;
  nameZh: string;
  rarity: string;
  category: string;
  description: string;
  color: string;
}

const NX_MATERIALS: Record<string, NxMaterialDef> = {
  nxm_stardust: {
    id: 'nxm_stardust', name: 'Stardust', nameZh: '星尘',
    rarity: NX_RARITY_COMMON, category: 'basic',
    description: '散落于星际间的微光尘埃，最基础的铸造材料。',
    color: '#FFFACD',
  },
  nxm_solar_fragment: {
    id: 'nxm_solar_fragment', name: 'Solar Fragment', nameZh: '太阳碎片',
    rarity: NX_RARITY_UNCOMMON, category: 'elemental',
    description: '太阳耀斑脱落的碎片，蕴含灼热能量。',
    color: NX_SOLAR,
  },
  nxm_nebula_essence: {
    id: 'nxm_nebula_essence', name: 'Nebula Essence', nameZh: '星云精华',
    rarity: NX_RARITY_UNCOMMON, category: 'elemental',
    description: '浓缩的星云能量液，法师的珍贵材料。',
    color: NX_NEBULA,
  },
  nxm_pulsar_crystal: {
    id: 'nxm_pulsar_crystal', name: 'Pulsar Crystal', nameZh: '脉冲水晶',
    rarity: NX_RARITY_UNCOMMON, category: 'elemental',
    description: '脉冲星辐射孕育的结晶体，能储存大量能量。',
    color: NX_PULSAR,
  },
  nxm_quasar_core: {
    id: 'nxm_quasar_core', name: 'Quasar Core', nameZh: '类星核心',
    rarity: NX_RARITY_RARE, category: 'core',
    description: '类星体的核心碎片，极其罕见的力量源泉。',
    color: NX_CORONA,
  },
  nxm_eclipse_stone: {
    id: 'nxm_eclipse_stone', name: 'Eclipse Stone', nameZh: '蚀影之石',
    rarity: NX_RARITY_RARE, category: 'core',
    description: '在蚀影永恒黑暗中凝固的暗石，蕴含禁忌之力。',
    color: NX_ECLIPSE,
  },
  nxm_supernova_ash: {
    id: 'nxm_supernova_ash', name: 'Supernova Ash', nameZh: '超新星灰烬',
    rarity: NX_RARITY_EPIC, category: 'core',
    description: '超新星爆发后残余的神秘灰烬，可用于终极强化。',
    color: NX_NOVA_WHITE,
  },
  nxm_vortex_rune: {
    id: 'nxm_vortex_rune', name: 'Vortex Rune', nameZh: '涡旋符文',
    rarity: NX_RARITY_EPIC, category: 'rune',
    description: '涡旋能量刻印的古老符文石，能扭曲空间法则。',
    color: '#00FF7F',
  },
  nxm_photon: {
    id: 'nxm_photon', name: 'Photon', nameZh: '光子',
    rarity: NX_RARITY_COMMON, category: 'particle',
    description: '纯光能量的基本粒子，用于能量电池充能。',
    color: '#FFFFE0',
  },
  nxm_dark_matter: {
    id: 'nxm_dark_matter', name: 'Dark Matter', nameZh: '暗物质',
    rarity: NX_RARITY_RARE, category: 'particle',
    description: '不可见的宇宙骨架材料，构建高级防御工事的关键。',
    color: '#1A1A2E',
  },
  nxm_neutron_ingot: {
    id: 'nxm_neutron_ingot', name: 'Neutron Ingot', nameZh: '中子星锭',
    rarity: NX_RARITY_EPIC, category: 'alloy',
    description: '中子星压力锻造的超密度金属锭，无坚不摧。',
    color: '#B0C4DE',
  },
  nxm_comet_tail: {
    id: 'nxm_comet_tail', name: 'Comet Tail', nameZh: '彗星尾',
    rarity: NX_RARITY_UNCOMMON, category: 'organic',
    description: '彗星尾部脱落的冰晶与尘埃混合物，有净化效果。',
    color: '#E0FFFF',
  },
  nxm_quantum_shard: {
    id: 'nxm_quantum_shard', name: 'Quantum Shard', nameZh: '量子碎片',
    rarity: NX_RARITY_RARE, category: 'particle',
    description: '量子纠缠态凝固而成的碎片，可用于传送装置。',
    color: '#FF69B4',
  },
  nxm_graviton: {
    id: 'nxm_graviton', name: 'Graviton', nameZh: '引力子',
    rarity: NX_RARITY_EPIC, category: 'particle',
    description: '传递引力相互作用的粒子，可制造重力场。',
    color: '#4169E1',
  },
  nxm_plasma_orb: {
    id: 'nxm_plasma_orb', name: 'Plasma Orb', nameZh: '等离子球',
    rarity: NX_RARITY_UNCOMMON, category: 'elemental',
    description: '高温等离子体凝固成的发光球体，能量充沛。',
    color: '#FF4500',
  },
  nxm_antimatter_cell: {
    id: 'nxm_antimatter_cell', name: 'Antimatter Cell', nameZh: '反物质电池',
    rarity: NX_RARITY_LEGENDARY, category: 'core',
    description: '密封的反物质能量电池，蕴含毁灭性的湮灭能量。',
    color: '#8B00FF',
  },
  nxm_magnetar_ore: {
    id: 'nxm_magnetar_ore', name: 'Magnetar Ore', nameZh: '磁星矿石',
    rarity: NX_RARITY_RARE, category: 'mineral',
    description: '磁星表面的超强磁性矿石，可用于制造电磁武器。',
    color: '#C0C0C0',
  },
  nxm_lightning_core: {
    id: 'nxm_lightning_core', name: 'Lightning Core', nameZh: '闪电核心',
    rarity: NX_RARITY_UNCOMMON, category: 'elemental',
    description: '凝聚雷电能量的核心体，脉冲游侠的箭头材料。',
    color: '#FFD700',
  },
  nxm_star_coin: {
    id: 'nxm_star_coin', name: 'Star Coin', nameZh: '星际币',
    rarity: NX_RARITY_COMMON, category: 'currency',
    description: '星际通用货币，用于在星际交易所购买物资。',
    color: '#DAA520',
  },
  nxm_soul_fragment: {
    id: 'nxm_soul_fragment', name: 'Soul Fragment', nameZh: '灵魂碎片',
    rarity: NX_RARITY_EPIC, category: 'spirit',
    description: '陨落守护者灵魂的结晶碎片，可赋予装备灵智。',
    color: '#FFB6C1',
  },
  nxm_cosmic_tear: {
    id: 'nxm_cosmic_tear', name: 'Cosmic Tear', nameZh: '宇宙之泪',
    rarity: NX_RARITY_LEGENDARY, category: 'spirit',
    description: '宇宙诞生时的第一滴泪，蕴含创世的原始力量。',
    color: '#87CEEB',
  },
  nxm_galactic_ink: {
    id: 'nxm_galactic_ink', name: 'Galactic Ink', nameZh: '银河墨水',
    rarity: NX_RARITY_UNCOMMON, category: 'crafting',
    description: '用银河系星光调制的魔法墨水，用于书写星图符文。',
    color: '#483D8B',
  },
  nxm_genesis_seed: {
    id: 'nxm_genesis_seed', name: 'Genesis Seed', nameZh: '创世之种',
    rarity: NX_RARITY_LEGENDARY, category: 'spirit',
    description: '宇宙大爆炸遗留下来的种子，可培育出星域级别的构造体。',
    color: '#32CD32',
  },
  nxm_eternal_sand: {
    id: 'nxm_eternal_sand', name: 'Eternal Sand', nameZh: '永恒之砂',
    rarity: NX_RARITY_EPIC, category: 'mineral',
    description: '时间尽头的沙粒，接触后可延缓物质的衰变。',
    color: '#F5DEB3',
  },
  nxm_star_iron: {
    id: 'nxm_star_iron', name: 'Star Iron', nameZh: '星辰铁',
    rarity: NX_RARITY_COMMON, category: 'mineral',
    description: '在恒星内核中锻造的纯铁，坚固耐用。',
    color: '#696969',
  },
  nxm_void_crystal: {
    id: 'nxm_void_crystal', name: 'Void Crystal', nameZh: '虚空水晶',
    rarity: NX_RARITY_RARE, category: 'core',
    description: '从虚空中开采的透明水晶，内部可见混沌翻涌。',
    color: '#191970',
  },
  nxm_corona_flame: {
    id: 'nxm_corona_flame', name: 'Corona Flame', nameZh: '日冕之火',
    rarity: NX_RARITY_RARE, category: 'elemental',
    description: '太阳日冕层剥离的永恒火焰，燃烧温度超过百万度。',
    color: '#FF6347',
  },
  nxm_black_hole_residue: {
    id: 'nxm_black_hole_residue', name: 'Black Hole Residue', nameZh: '黑洞残渣',
    rarity: NX_RARITY_LEGENDARY, category: 'core',
    description: '黑洞事件视界边缘提取的物质残渣，极度不稳定。',
    color: '#0D0D0D',
  },
  nxm_aurora_shard: {
    id: 'nxm_aurora_shard', name: 'Aurora Shard', nameZh: '极光碎片',
    rarity: NX_RARITY_UNCOMMON, category: 'elemental',
    description: '极光风暴凝结而成的彩色碎片，具有多重元素亲和力。',
    color: '#00FA9A',
  },
  nxm_stellar_heart: {
    id: 'nxm_stellar_heart', name: 'Stellar Heart', nameZh: '恒星之心',
    rarity: NX_RARITY_LEGENDARY, category: 'core',
    description: '恒星燃烧殆尽后留下的晶化核心，是宇宙最纯粹的能量体。',
    color: NX_SOLAR,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 25 STRUCTURES  (upgradeable to lv10)
// ═══════════════════════════════════════════════════════════════════════════

interface NxStructureDef {
  id: string;
  name: string;
  nameZh: string;
  category: string;
  maxLevel: number;
  baseCost: Record<string, number>;
  costMultiplier: number;
  effect: string;
  description: string;
  color: string;
}

const NX_STRUCTURES: Record<string, NxStructureDef> = {
  nxs_starlight_forge: {
    id: 'nxs_starlight_forge', name: 'Starlight Forge', nameZh: '星光铸造厂',
    category: 'production', maxLevel: 10,
    baseCost: { nxm_star_iron: 20, nxm_stardust: 30 }, costMultiplier: 1.5,
    effect: '每级+5% 装备锻造成功率',
    description: '利用星光能量锻造武器的工厂，是堡垒武器供给的核心。',
    color: '#FFD700',
  },
  nxs_nebula_lab: {
    id: 'nxs_nebula_lab', name: 'Nebula Laboratory', nameZh: '星云研究室',
    category: 'research', maxLevel: 10,
    baseCost: { nxm_nebula_essence: 15, nxm_galactic_ink: 10 }, costMultiplier: 1.6,
    effect: '每级+8% 研究速度',
    description: '探索星云奥秘的研究设施，解锁强力技能的摇篮。',
    color: NX_NEBULA,
  },
  nxs_pulsar_emitter: {
    id: 'nxs_pulsar_emitter', name: 'Pulsar Emitter', nameZh: '脉冲发射塔',
    category: 'defense', maxLevel: 10,
    baseCost: { nxm_pulsar_crystal: 12, nxm_lightning_core: 8 }, costMultiplier: 1.4,
    effect: '每级+12 防御伤害',
    description: '发射高频脉冲波的防御塔，可远距离攻击入侵者。',
    color: NX_PULSAR,
  },
  nxs_quasar_barracks: {
    id: 'nxs_quasar_barracks', name: 'Quasar Barracks', nameZh: '类星兵营',
    category: 'military', maxLevel: 10,
    baseCost: { nxm_quasar_core: 5, nxm_star_iron: 40 }, costMultiplier: 1.7,
    effect: '每级+2 守护者容量',
    description: '驻扎类星泰坦的重装兵营，可容纳更多守卫力量。',
    color: NX_CORONA,
  },
  nxs_eclipse_sanctum: {
    id: 'nxs_eclipse_sanctum', name: 'Eclipse Sanctum', nameZh: '蚀影圣殿',
    category: 'spiritual', maxLevel: 10,
    baseCost: { nxm_eclipse_stone: 8, nxm_soul_fragment: 3 }, costMultiplier: 1.8,
    effect: '每级+10% 治疗效果',
    description: '蚀影力量汇聚的圣殿，为守护者提供治愈与庇护。',
    color: NX_ECLIPSE,
  },
  nxs_supernova_altar: {
    id: 'nxs_supernova_altar', name: 'Supernova Altar', nameZh: '超新星祭坛',
    category: 'ritual', maxLevel: 10,
    baseCost: { nxm_supernova_ash: 6, nxm_stardust: 50 }, costMultiplier: 2.0,
    effect: '每级+15% 技能威力',
    description: '献祭超新星灰烬以获取强大力量的神秘祭坛。',
    color: NX_NOVA_WHITE,
  },
  nxs_vortex_core: {
    id: 'nxs_vortex_core', name: 'Vortex Core', nameZh: '涡旋核心',
    category: 'utility', maxLevel: 10,
    baseCost: { nxm_vortex_rune: 5, nxm_dark_matter: 10 }, costMultiplier: 1.5,
    effect: '每级-5% 技能冷却时间',
    description: '涡旋能量的核心处理器，加快技能循环效率。',
    color: '#00FF7F',
  },
  nxs_stardust_vault: {
    id: 'nxs_stardust_vault', name: 'Stardust Vault', nameZh: '星尘仓库',
    category: 'storage', maxLevel: 10,
    baseCost: { nxm_stardust: 60, nxm_star_iron: 15 }, costMultiplier: 1.3,
    effect: '每级+200 仓库容量',
    description: '安全储存星尘与材料的仓库，升级可增加储存上限。',
    color: '#FFFACD',
  },
  nxs_photon_farm: {
    id: 'nxs_photon_farm', name: 'Photon Farm', nameZh: '光子农场',
    category: 'production', maxLevel: 10,
    baseCost: { nxm_photon: 40, nxm_star_coin: 20 }, costMultiplier: 1.4,
    effect: '每级+3 光子/小时',
    description: '捕获光子能量的农场，持续产出基础能量粒子。',
    color: '#FFFFE0',
  },
  nxs_dark_matter_refinery: {
    id: 'nxs_dark_matter_refinery', name: 'Dark Matter Refinery', nameZh: '暗物质精炼厂',
    category: 'production', maxLevel: 10,
    baseCost: { nxm_dark_matter: 8, nxm_void_crystal: 5 }, costMultiplier: 1.9,
    effect: '每级+1 暗物质/小时',
    description: '从虚空中提炼暗物质的精密设施，产出稀有材料。',
    color: '#1A1A2E',
  },
  nxs_neutron_furnace: {
    id: 'nxs_neutron_furnace', name: 'Neutron Star Furnace', nameZh: '中子星熔炉',
    category: 'production', maxLevel: 10,
    baseCost: { nxm_neutron_ingot: 4, nxm_magnetar_ore: 10 }, costMultiplier: 2.0,
    effect: '每级+2 中子星锭/小时',
    description: '模拟中子星压力的超级熔炉，锻造最坚固的合金。',
    color: '#B0C4DE',
  },
  nxs_comet_launcher: {
    id: 'nxs_comet_launcher', name: 'Comet Launcher', nameZh: '彗星发射台',
    category: 'defense', maxLevel: 10,
    baseCost: { nxm_comet_tail: 15, nxm_star_iron: 25 }, costMultiplier: 1.5,
    effect: '每级+8 穿透伤害',
    description: '发射彗星冰晶弹的远程武器台，可穿透多层护盾。',
    color: '#E0FFFF',
  },
  nxs_quantum_shield_station: {
    id: 'nxs_quantum_shield_station', name: 'Quantum Shield Station', nameZh: '量子护盾站',
    category: 'defense', maxLevel: 10,
    baseCost: { nxm_quantum_shard: 6, nxm_dark_matter: 8 }, costMultiplier: 1.7,
    effect: '每级+50 护盾值',
    description: '利用量子纠缠生成力场的防御站，提供额外护盾。',
    color: '#FF69B4',
  },
  nxs_gravity_tower: {
    id: 'nxs_gravity_tower', name: 'Gravity Wave Tower', nameZh: '引力波塔',
    category: 'defense', maxLevel: 10,
    baseCost: { nxm_graviton: 4, nxm_void_crystal: 6 }, costMultiplier: 1.8,
    effect: '每级+3% 减速效果',
    description: '发射引力波减缓敌人行动的防御塔，配合陷阱效果极佳。',
    color: '#4169E1',
  },
  nxs_wormhole_portal: {
    id: 'nxs_wormhole_portal', name: 'Wormhole Portal', nameZh: '虫洞传送门',
    category: 'utility', maxLevel: 10,
    baseCost: { nxm_quantum_shard: 8, nxm_graviton: 5 }, costMultiplier: 2.2,
    effect: '每级+1 传送目的地',
    description: '开启虫洞通道的传送门，实现瞬间战略转移。',
    color: '#8B00FF',
  },
  nxs_plasma_wall: {
    id: 'nxs_plasma_wall', name: 'Plasma Wall', nameZh: '等离子墙',
    category: 'defense', maxLevel: 10,
    baseCost: { nxm_plasma_orb: 12, nxm_star_iron: 30 }, costMultiplier: 1.4,
    effect: '每级+80 墙壁HP',
    description: '等离子体构成的能量墙壁，可阻挡物理与能量攻击。',
    color: '#FF4500',
  },
  nxs_antimatter_engine: {
    id: 'nxs_antimatter_engine', name: 'Antimatter Engine', nameZh: '反物质引擎',
    category: 'power', maxLevel: 10,
    baseCost: { nxm_antimatter_cell: 3, nxm_neutron_ingot: 6 }, costMultiplier: 2.5,
    effect: '每级+15% 全局能量产出',
    description: '反物质湮灭驱动的超级引擎，为堡垒提供无尽能源。',
    color: '#8B00FF',
  },
  nxs_magnetar_mine: {
    id: 'nxs_magnetar_mine', name: 'Magnetar Mine', nameZh: '磁星矿场',
    category: 'production', maxLevel: 10,
    baseCost: { nxm_magnetar_ore: 15, nxm_star_coin: 30 }, costMultiplier: 1.5,
    effect: '每级+2 磁星矿石/小时',
    description: '开采磁星表面矿石的矿场，产出电磁材料。',
    color: '#C0C0C0',
  },
  nxs_lightning_array: {
    id: 'nxs_lightning_array', name: 'Lightning Array', nameZh: '闪电阵列',
    category: 'defense', maxLevel: 10,
    baseCost: { nxm_lightning_core: 10, nxm_pulsar_crystal: 8 }, costMultiplier: 1.6,
    effect: '每级+10 链式闪电伤害',
    description: '召唤链式闪电的防御阵列，可同时攻击多个目标。',
    color: NX_SOLAR,
  },
  nxs_interstellar_exchange: {
    id: 'nxs_interstellar_exchange', name: 'Interstellar Exchange', nameZh: '星际交易所',
    category: 'trade', maxLevel: 10,
    baseCost: { nxm_star_coin: 50, nxm_stardust: 40 }, costMultiplier: 1.3,
    effect: '每级+5% 交易折扣',
    description: '与其他星系文明进行物资交易的枢纽。',
    color: '#DAA520',
  },
  nxs_soul_beacon: {
    id: 'nxs_soul_beacon', name: 'Soul Beacon', nameZh: '灵魂灯塔',
    category: 'spiritual', maxLevel: 10,
    baseCost: { nxm_soul_fragment: 4, nxm_eclipse_stone: 6 }, costMultiplier: 1.8,
    effect: '每级+8% 灵魂碎片掉落率',
    description: '引导陨落守护者灵魂的灯塔，增加稀有材料获取。',
    color: '#FFB6C1',
  },
  nxs_eye_of_cosmos: {
    id: 'nxs_eye_of_cosmos', name: 'Eye of Cosmos', nameZh: '宇宙之眼',
    category: 'research', maxLevel: 10,
    baseCost: { nxm_cosmic_tear: 2, nxm_dark_matter: 12 }, costMultiplier: 2.5,
    effect: '每级+5% 敌人弱点暴露',
    description: '窥视宇宙真理的神器设施，揭示敌人的一切弱点。',
    color: '#87CEEB',
  },
  nxs_galactic_library: {
    id: 'nxs_galactic_library', name: 'Galactic Library', nameZh: '银河图书馆',
    category: 'research', maxLevel: 10,
    baseCost: { nxm_galactic_ink: 20, nxm_stardust: 60 }, costMultiplier: 1.4,
    effect: '每级+10% 经验获取',
    description: '收录银河系所有知识的宏伟图书馆，加速守护者成长。',
    color: '#483D8B',
  },
  nxs_genesis_furnace: {
    id: 'nxs_genesis_furnace', name: 'Genesis Furnace', nameZh: '创世熔炉',
    category: 'power', maxLevel: 10,
    baseCost: { nxm_genesis_seed: 1, nxm_stellar_heart: 1 }, costMultiplier: 3.0,
    effect: '每级+25% 创世能量',
    description: '传说中的创世熔炉，利用宇宙起源能量进行终极锻造。',
    color: '#32CD32',
  },
  nxs_tower_of_eternity: {
    id: 'nxs_tower_of_eternity', name: 'Tower of Eternity', nameZh: '永恒之塔',
    category: 'monument', maxLevel: 10,
    baseCost: { nxm_eternal_sand: 5, nxm_stellar_heart: 2 }, costMultiplier: 3.0,
    effect: '每级+5% 全局属性加成',
    description: '矗立于时间尽头的永恒之塔，是堡垒至高荣耀的象征。',
    color: '#F5DEB3',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 22 ABILITIES
// ═══════════════════════════════════════════════════════════════════════════

interface NxAbilityDef {
  id: string;
  name: string;
  nameZh: string;
  type: string;
  cooldown: number;
  duration: number;
  power: number;
  manaCost: number;
  description: string;
  color: string;
}

const NX_ABILITIES: Record<string, NxAbilityDef> = {
  nxa_light_saber_slash: {
    id: 'nxa_light_saber_slash', name: 'Light Saber Slash', nameZh: '光剑斩',
    type: 'attack', cooldown: 3, duration: 0, power: 45, manaCost: 15,
    description: '释放光剑横扫前方，对特定字母开头的单词额外加分。',
    color: NX_SOLAR,
  },
  nxa_nebula_shield: {
    id: 'nxa_nebula_shield', name: 'Nebula Shield', nameZh: '星云护盾',
    type: 'defense', cooldown: 8, duration: 5, power: 0, manaCost: 30,
    description: '召唤星云护盾环绕自身，完全免疫一次错误猜测的惩罚。',
    color: NX_NEBULA,
  },
  nxa_pulsar_scan: {
    id: 'nxa_pulsar_scan', name: 'Pulsar Scan', nameZh: '脉冲扫描',
    type: 'utility', cooldown: 6, duration: 0, power: 0, manaCost: 20,
    description: '发射脉冲波扫描目标单词，随机揭示一个隐藏字母。',
    color: NX_PULSAR,
  },
  nxa_gravity_pull: {
    id: 'nxa_gravity_pull', name: 'Gravity Pull', nameZh: '引力牵引',
    type: 'utility', cooldown: 10, duration: 3, power: 0, manaCost: 40,
    description: '利用引力场自动补全部分字母，显示单词前两个字母。',
    color: '#4169E1',
  },
  nxa_eclipse_devour: {
    id: 'nxa_eclipse_devour', name: 'Eclipse Devour', nameZh: '蚀影吞噬',
    type: 'attack', cooldown: 12, duration: 0, power: 60, manaCost: 45,
    description: '释放蚀影之力吞噬对手得分，窃取对手10%的分数。',
    color: NX_ECLIPSE,
  },
  nxa_supernova_burst: {
    id: 'nxa_supernova_burst', name: 'Supernova Burst', nameZh: '超新星爆发',
    type: 'attack', cooldown: 15, duration: 3, power: 0, manaCost: 60,
    description: '引爆超星能量，接下来3个单词得分翻倍。',
    color: NX_NOVA_WHITE,
  },
  nxa_vortex_teleport: {
    id: 'nxa_vortex_teleport', name: 'Vortex Teleport', nameZh: '涡旋传送',
    type: 'utility', cooldown: 8, duration: 0, power: 0, manaCost: 25,
    description: '开启涡旋通道直接跳至下一个单词，跳过当前难题。',
    color: '#00FF7F',
  },
  nxa_quantum_entangle: {
    id: 'nxa_quantum_entangle', name: 'Quantum Entangle', nameZh: '量子纠缠',
    type: 'special', cooldown: 20, duration: 5, power: 0, manaCost: 50,
    description: '将两个单词量子纠缠，完成其中一个自动完成另一个。',
    color: '#FF69B4',
  },
  nxa_dark_matter_barrier: {
    id: 'nxa_dark_matter_barrier', name: 'Dark Matter Barrier', nameZh: '暗物质屏障',
    type: 'defense', cooldown: 14, duration: 2, power: 0, manaCost: 35,
    description: '构建暗物质力场，在本轮中获得完全免疫。',
    color: '#1A1A2E',
  },
  nxa_photon_flood: {
    id: 'nxa_photon_flood', name: 'Photon Flood', nameZh: '光子洪流',
    type: 'utility', cooldown: 10, duration: 0, power: 0, manaCost: 30,
    description: '释放光子洪流，揭示目标单词中的所有元音字母。',
    color: '#FFFFE0',
  },
  nxa_comet_strike: {
    id: 'nxa_comet_strike', name: 'Comet Strike', nameZh: '彗星冲击',
    type: 'attack', cooldown: 7, duration: 0, power: 55, manaCost: 25,
    description: '召唤彗星撞击目标，移除所有错误猜测的字母标记。',
    color: '#E0FFFF',
  },
  nxa_neutron_fusion: {
    id: 'nxa_neutron_fusion', name: 'Neutron Fusion', nameZh: '中子星聚变',
    type: 'special', cooldown: 18, duration: 0, power: 80, manaCost: 55,
    description: '模拟中子星聚变，将两个不完整的单词部分合并补全。',
    color: '#B0C4DE',
  },
  nxa_wormhole_jump: {
    id: 'nxa_wormhole_jump', name: 'Wormhole Jump', nameZh: '虫洞跃迁',
    type: 'utility', cooldown: 25, duration: 0, power: 0, manaCost: 70,
    description: '开启虫洞跃迁，直接跳升至下一关。',
    color: '#8B00FF',
  },
  nxa_plasma_storm: {
    id: 'nxa_plasma_storm', name: 'Plasma Storm', nameZh: '等离子风暴',
    type: 'attack', cooldown: 16, duration: 4, power: 35, manaCost: 50,
    description: '召唤等离子风暴席卷战场，每秒对周围造成持续伤害。',
    color: '#FF4500',
  },
  nxa_antimatter_annihilate: {
    id: 'nxa_antimatter_annihilate', name: 'Antimatter Annihilate', nameZh: '反物质湮灭',
    type: 'ultimate', cooldown: 30, duration: 0, power: 150, manaCost: 100,
    description: '释放反物质湮灭能量，摧毁一切障碍并获得巨额分数。',
    color: '#8B00FF',
  },
  nxa_magnetar_attract: {
    id: 'nxa_magnetar_attract', name: 'Magnetar Attract', nameZh: '磁星吸引',
    type: 'special', cooldown: 12, duration: 6, power: 0, manaCost: 35,
    description: '激活磁星磁场吸引周围的材料与分数加成。',
    color: '#C0C0C0',
  },
  nxa_lightning_raid: {
    id: 'nxa_lightning_raid', name: 'Lightning Raid', nameZh: '闪电突袭',
    type: 'utility', cooldown: 9, duration: 3, power: 0, manaCost: 20,
    description: '闪电般加速答题，在此期间内不受时间惩罚。',
    color: NX_SOLAR,
  },
  nxa_soul_resonance: {
    id: 'nxa_soul_resonance', name: 'Soul Resonance', nameZh: '灵魂共鸣',
    type: 'special', cooldown: 15, duration: 5, power: 0, manaCost: 40,
    description: '与星空守护者灵魂共鸣，对主题相关单词获得额外奖励。',
    color: '#FFB6C1',
  },
  nxa_light_of_genesis: {
    id: 'nxa_light_of_genesis', name: 'Light of Genesis', nameZh: '创世之光',
    type: 'ultimate', cooldown: 40, duration: 0, power: 0, manaCost: 120,
    description: '释放宇宙创世之光，直接揭示整个单词的所有字母。',
    color: '#32CD32',
  },
  nxa_galactic_force: {
    id: 'nxa_galactic_force', name: 'Galactic Force', nameZh: '银河之力',
    type: 'ultimate', cooldown: 35, duration: 1, power: 0, manaCost: 90,
    description: '汇聚银河全部力量，一个单词的分数乘以五倍。',
    color: '#483D8B',
  },
  nxa_eternal_sanctuary: {
    id: 'nxa_eternal_sanctuary', name: 'Eternal Sanctuary', nameZh: '永恒庇护',
    type: 'defense', cooldown: 30, duration: 10, power: 0, manaCost: 80,
    description: '开启永恒庇护空间，在整个关卡中完全免疫一切负面效果。',
    color: '#F5DEB3',
  },
  nxa_corona_blaze: {
    id: 'nxa_corona_blaze', name: 'Corona Blaze', nameZh: '日冕烈焰',
    type: 'attack', cooldown: 11, duration: 3, power: 70, manaCost: 40,
    description: '以日冕层烈焰焚烧目标，连续3轮增加火焰伤害叠加。',
    color: NX_CORONA,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 18 ACHIEVEMENTS
// ═══════════════════════════════════════════════════════════════════════════

interface NxAchievementDef {
  id: string;
  name: string;
  nameZh: string;
  category: string;
  condition: string;
  reward: string;
  description: string;
  color: string;
}

const NX_ACHIEVEMENTS: Record<string, NxAchievementDef> = {
  nxa_recruit_first: {
    id: 'nxa_recruit_first', name: 'Stellar Recruit', nameZh: '星际新兵',
    category: 'guardian', condition: '首次征召守护者',
    reward: '100 星际币', description: '加入新星堡垒的第一步，征召你的首位星域守护者。',
    color: '#A0A0A0',
  },
  nxa_defend_first: {
    id: 'nxa_defend_first', name: 'Tower Sentinel', nameZh: '守塔卫士',
    category: 'tower', condition: '首次驻守塔楼',
    reward: '80 星际币', description: '勇敢地站上塔楼，成为新星堡垒的守卫者。',
    color: '#A0A0A0',
  },
  nxa_build_ten: {
    id: 'nxa_build_ten', name: 'Master Builder', nameZh: '建筑大师',
    category: 'structure', condition: '建造10座建筑',
    reward: '200 星际币 + 脉冲水晶x5', description: '展现卓越的建设能力，建造10座功能建筑。',
    color: '#4CAF50',
  },
  nxa_collect_all_materials: {
    id: 'nxa_collect_all_materials', name: 'Material Hoarder', nameZh: '材料收藏家',
    category: 'material', condition: '收集全部30种材料',
    reward: '创世之种x1', description: '集齐宇宙间所有30种珍贵材料，你是真正的收藏大师。',
    color: NX_SOLAR,
  },
  nxa_five_artifacts: {
    id: 'nxa_five_artifacts', name: 'Artifact Hunter', nameZh: '神器猎人',
    category: 'artifact', condition: '激活5件神器',
    reward: '500 星际币', description: '发掘并激活5件远古神器，揭开宇宙的秘密。',
    color: '#4CAF50',
  },
  nxa_five_events: {
    id: 'nxa_five_events', name: 'Cosmic Explorer', nameZh: '星际探险家',
    category: 'event', condition: '触发5种事件',
    reward: '涡旋符文x3', description: '经历丰富的星际冒险，触发5种不同的宇宙事件。',
    color: '#2196F3',
  },
  nxa_ten_guardians: {
    id: 'nxa_ten_guardians', name: 'Guardian Apex', nameZh: '守护者之巅',
    category: 'guardian', condition: '拥有10名守护者',
    reward: '暗物质x5', description: '组建一支十人精英守护者小队。',
    color: NX_NEBULA,
  },
  nxa_max_level_structure: {
    id: 'nxa_max_level_structure', name: 'Max Level Master', nameZh: '满级大师',
    category: 'structure', condition: '将任一建筑升至满级',
    reward: '中子星锭x3', description: '将任意建筑升级至最高等级，展现极致的投入。',
    color: NX_NEBULA,
  },
  nxa_all_structures: {
    id: 'nxa_all_structures', name: 'Full Citadel', nameZh: '永恒堡垒',
    category: 'structure', condition: '建造全部25座建筑',
    reward: '永恒之砂x5 + 称号解锁', description: '建造所有25座建筑，将新星堡垒发展至巅峰。',
    color: NX_SOLAR,
  },
  nxa_nebula_chain: {
    id: 'nxa_nebula_chain', name: 'Nebula Conqueror', nameZh: '星云征服者',
    category: 'event', condition: '完成星云事件链',
    reward: '星云精华x10', description: '成功应对一系列星云相关事件的考验。',
    color: NX_NEBULA,
  },
  nxa_solar_set: {
    id: 'nxa_solar_set', name: 'Solar Sanctum', nameZh: '太阳圣殿',
    category: 'artifact', condition: '激活太阳神器套装(3件)',
    reward: '太阳王冠强化', description: '集齐并激活太阳主题的三件套神器。',
    color: NX_SOLAR,
  },
  nxa_ten_abilities: {
    id: 'nxa_ten_abilities', name: 'Pulse Master', nameZh: '脉冲大师',
    category: 'ability', condition: '单局使用10种技能',
    reward: '超新星灰烬x2', description: '在一场游戏中灵活运用10种不同技能。',
    color: NX_PULSAR,
  },
  nxa_legendary_guardian: {
    id: 'nxa_legendary_guardian', name: 'Heart of Quasar', nameZh: '传说守护者',
    category: 'guardian', condition: '获得传奇守护者',
    reward: '恒星之心x1', description: '成功征召一位传奇级别的星域守护者。',
    color: NX_SOLAR,
  },
  nxa_supernova_event: {
    id: 'nxa_supernova_event', name: 'Supernova Era', nameZh: '超新星纪元',
    category: 'event', condition: '触发超新星遗迹事件',
    reward: '超新星灰烬x5', description: '见证超新星爆发的壮丽景象并获得珍贵材料。',
    color: NX_NOVA_WHITE,
  },
  nxa_vortex_complete: {
    id: 'nxa_vortex_complete', name: 'Lord of Vortex', nameZh: '涡旋之主',
    category: 'event', condition: '完成涡旋事件线',
    reward: '涡旋符文x5', description: '征服涡旋裂缝的威胁，成为涡旋力量的主宰。',
    color: '#00FF7F',
  },
  nxa_all_legendaries: {
    id: 'nxa_all_legendaries', name: 'Legendary Collection', nameZh: '传说收藏',
    category: 'guardian', condition: '集齐全部7位传奇守护者',
    reward: '宇宙之泪x1', description: '汇聚全部7位传奇守护者，组建终极战阵。',
    color: NX_SOLAR,
  },
  nxa_all_towers: {
    id: 'nxa_all_towers', name: 'Fortress Complete', nameZh: '全塔防线',
    category: 'tower', condition: '驻守全部8座塔楼',
    reward: '虚空水晶x5', description: '在所有8座塔楼上部署守护者，构筑完美防线。',
    color: NX_CORONA,
  },
  nxa_citadel_master: {
    id: 'nxa_citadel_master', name: 'Nova Citadel Master', nameZh: '新星堡垒之主',
    category: 'meta', condition: '达成以上全部成就',
    reward: '终极称号 + 全属性+50%', description: '完成所有挑战，成为新星堡垒的至高主宰。',
    color: NX_SOLAR,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 8 TITLES
// ═══════════════════════════════════════════════════════════════════════════

interface NxTitleDef {
  id: string;
  name: string;
  nameZh: string;
  bonus: string;
  requirement: string;
  description: string;
  color: string;
}

const NX_TITLES: Record<string, NxTitleDef> = {
  nxt_recruit: {
    id: 'nxt_recruit', name: 'Stellar Recruit', nameZh: '星际新兵',
    bonus: '+5% 经验获取', requirement: '征召首位守护者',
    description: '踏入星域的第一步，从此你的名字与星辰同在。',
    color: '#A0A0A0',
  },
  nxt_sentinel: {
    id: 'nxt_sentinel', name: 'Tower Sentinel', nameZh: '守塔卫士',
    bonus: '+5% 防御力', requirement: '首次驻守塔楼',
    description: '站在塔楼之上，你是黑暗中最亮的守望之光。',
    color: '#4CAF50',
  },
  nxt_nebula_walker: {
    id: 'nxt_nebula_walker', name: 'Nebula Walker', nameZh: '星云行者',
    bonus: '+5% 魔法伤害', requirement: '拥有3名星云法师',
    description: '穿行于星云之间的智者，魔法是你的语言。',
    color: NX_NEBULA,
  },
  nxt_pulse_hunter: {
    id: 'nxt_pulse_hunter', name: 'Pulse Hunter', nameZh: '脉冲猎人',
    bonus: '+5% 攻击速度', requirement: '拥有3名脉冲游侠',
    description: '以光速追踪猎物的猎人，无人能逃脱你的箭矢。',
    color: NX_PULSAR,
  },
  nxt_supernova_herald: {
    id: 'nxt_supernova_herald', name: 'Supernova Herald', nameZh: '超新星使者',
    bonus: '+5% 技能威力', requirement: '激活超新星神器',
    description: '超新星的使者，你的存在即是毁灭与重生的预告。',
    color: NX_NOVA_WHITE,
  },
  nxt_quasar_titan: {
    id: 'nxt_quasar_titan', name: 'Quasar Titan', nameZh: '类星泰坦',
    bonus: '+10% 全防御', requirement: '拥有3名类星泰坦',
    description: '不可撼动的类星之躯，你即是堡垒的移动城墙。',
    color: NX_CORONA,
  },
  nxt_vortex_king: {
    id: 'nxt_vortex_king', name: 'Vortex King', nameZh: '涡旋之王',
    bonus: '+5% 冷却缩减', requirement: '完成涡旋事件线',
    description: '驾驭涡旋之力的王者，时空在你脚下臣服。',
    color: '#00FF7F',
  },
  nxt_citadel_lord: {
    id: 'nxt_citadel_lord', name: 'Lord of Nova Citadel', nameZh: '新星堡垒之主',
    bonus: '+10% 全属性', requirement: '达成全部成就',
    description: '新星堡垒的至高主宰，星河万里尽在你掌中。',
    color: NX_SOLAR,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 15 ARTIFACTS
// ═══════════════════════════════════════════════════════════════════════════

interface NxArtifactDef {
  id: string;
  name: string;
  nameZh: string;
  rarity: string;
  set: string;
  passive: string;
  description: string;
  color: string;
}

const NX_ARTIFACTS: Record<string, NxArtifactDef> = {
  nxf_solar_crown: {
    id: 'nxf_solar_crown', name: 'Crown of Solar', nameZh: '太阳王冠',
    rarity: NX_RARITY_LEGENDARY, set: 'solar',
    passive: '+20% 太阳骑士攻击力',
    description: '太阳王亲手锻造的王冠，佩戴者可获得太阳的无尽光辉。',
    color: NX_SOLAR,
  },
  nxf_nebula_staff: {
    id: 'nxf_nebula_staff', name: 'Staff of Nebula', nameZh: '星云法杖',
    rarity: NX_RARITY_LEGENDARY, set: 'nebula',
    passive: '+20% 星云法师魔力',
    description: '以星云凝缩而成的法杖，挥动间可改变星空的格局。',
    color: NX_NEBULA,
  },
  nxf_pulse_bow: {
    id: 'nxf_pulse_bow', name: 'Pulse Bow', nameZh: '脉冲弓',
    rarity: NX_RARITY_EPIC, set: 'pulsar',
    passive: '+25% 脉冲游侠射速',
    description: '以脉冲星能量弦制成的弓，箭矢速度超越光速。',
    color: NX_PULSAR,
  },
  nxf_quasar_shield: {
    id: 'nxf_quasar_shield', name: 'Quasar Shield', nameZh: '类星之盾',
    rarity: NX_RARITY_LEGENDARY, set: 'quasar',
    passive: '+30% 全体防御力',
    description: '类星体核心铸造的巨盾，可抵挡星系级别的冲击。',
    color: NX_CORONA,
  },
  nxf_eclipse_mask: {
    id: 'nxf_eclipse_mask', name: 'Mask of Eclipse', nameZh: '蚀影面具',
    rarity: NX_RARITY_EPIC, set: 'eclipse',
    passive: '+15% 闪避率 +10% 暗伤害',
    description: '蚀影之神遗落的面具，佩戴者融入阴影之中。',
    color: NX_ECLIPSE,
  },
  nxf_supernova_heart: {
    id: 'nxf_supernova_heart', name: 'Heart of Supernova', nameZh: '超新星之心',
    rarity: NX_RARITY_LEGENDARY, set: 'supernova',
    passive: '+25% 全技能威力',
    description: '超新星爆发核心凝固而成的心脏，蕴含创世级别的能量。',
    color: NX_NOVA_WHITE,
  },
  nxf_vortex_orb: {
    id: 'nxf_vortex_orb', name: 'Vortex Orb', nameZh: '涡旋水晶球',
    rarity: NX_RARITY_EPIC, set: 'vortex',
    passive: '+20% 冷却缩减',
    description: '永恒涡旋能量封装的水晶球，可预见未来三步。',
    color: '#00FF7F',
  },
  nxf_stardust_cloak: {
    id: 'nxf_stardust_cloak', name: 'Stardust Cloak', nameZh: '星尘斗篷',
    rarity: NX_RARITY_RARE, set: 'general',
    passive: '+10% 速度 +5% 经验',
    description: '用亿万颗星尘编织的斗篷，轻盈如光。',
    color: '#FFFACD',
  },
  nxf_dark_blade: {
    id: 'nxf_dark_blade', name: 'Dark Matter Blade', nameZh: '暗物质之刃',
    rarity: NX_RARITY_EPIC, set: 'general',
    passive: '+30% 暗属性伤害',
    description: '以暗物质锻造的利刃，切割一切物质与能量。',
    color: '#1A1A2E',
  },
  nxf_neutron_amulet: {
    id: 'nxf_neutron_amulet', name: 'Neutron Amulet', nameZh: '中子星护符',
    rarity: NX_RARITY_RARE, set: 'general',
    passive: '+15% 最大生命值',
    description: '中子星碎片嵌制的护符，增强佩戴者的生命力。',
    color: '#B0C4DE',
  },
  nxf_wormhole_key: {
    id: 'nxf_wormhole_key', name: 'Wormhole Key', nameZh: '虫洞钥匙',
    rarity: NX_RARITY_LEGENDARY, set: 'general',
    passive: '解锁隐藏关卡',
    description: '开启通往未知星域虫洞的钥匙，通往传说之地。',
    color: '#8B00FF',
  },
  nxf_lightning_ring: {
    id: 'nxf_lightning_ring', name: 'Ring of Lightning', nameZh: '闪电之戒',
    rarity: NX_RARITY_RARE, set: 'pulsar',
    passive: '攻击附带链式闪电',
    description: '封印着永恒雷电的戒指，每次攻击都会引发连锁闪电。',
    color: NX_SOLAR,
  },
  nxf_book_of_genesis: {
    id: 'nxf_book_of_genesis', name: 'Book of Genesis', nameZh: '创世之书',
    rarity: NX_RARITY_LEGENDARY, set: 'supernova',
    passive: '+15% 全属性 +解锁终极技能',
    description: '记载宇宙创世奥秘的古老典籍，阅读者获得创世之力。',
    color: '#32CD32',
  },
  nxf_galactic_map: {
    id: 'nxf_galactic_map', name: 'Galactic Map', nameZh: '银河星图',
    rarity: NX_RARITY_EPIC, set: 'general',
    passive: '显示隐藏材料位置',
    description: '标注整个银河系资源分布的神秘星图。',
    color: '#483D8B',
  },
  nxf_crown_of_eternity: {
    id: 'nxf_crown_of_eternity', name: 'Crown of Eternity', nameZh: '永恒之冠',
    rarity: NX_RARITY_LEGENDARY, set: 'general',
    passive: '所有神器效果+10%',
    description: '时间尽头的王者之冠，增强所有已激活神器的效果。',
    color: '#F5DEB3',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 12 EVENTS
// ═══════════════════════════════════════════════════════════════════════════

interface NxEventDef {
  id: string;
  name: string;
  nameZh: string;
  type: string;
  duration: number;
  difficulty: number;
  reward: Record<string, number>;
  penalty: string;
  description: string;
  color: string;
}

const NX_EVENTS: Record<string, NxEventDef> = {
  nxe_nebula_storm: {
    id: 'nxe_nebula_storm', name: 'Nebula Storm', nameZh: '星云风暴来袭',
    type: 'danger', duration: 60, difficulty: 4,
    reward: { nxm_nebula_essence: 5, nxm_star_coin: 100 },
    penalty: '每秒损失2%塔楼HP',
    description: '巨大的星云风暴正向堡垒袭来，需要全力防御！',
    color: NX_NEBULA,
  },
  nxe_solar_flare: {
    id: 'nxe_solar_flare', name: 'Solar Flare', nameZh: '太阳耀斑',
    type: 'opportunity', duration: 45, difficulty: 2,
    reward: { nxm_solar_fragment: 8, nxm_photon: 20 },
    penalty: '无',
    description: '太阳耀斑带来了充沛的光能，抓紧时间收集！',
    color: NX_SOLAR,
  },
  nxe_pulse_wave: {
    id: 'nxe_pulse_wave', name: 'Pulse Wave Attack', nameZh: '脉冲波侵袭',
    type: 'danger', duration: 40, difficulty: 6,
    reward: { nxm_pulsar_crystal: 4, nxm_lightning_core: 3 },
    penalty: '守护者速度降低20%',
    description: '外星文明发射的脉冲波正在干扰堡垒系统！',
    color: NX_PULSAR,
  },
  nxe_comet_rain: {
    id: 'nxe_comet_rain', name: 'Comet Rain', nameZh: '彗星雨',
    type: 'gathering', duration: 90, difficulty: 1,
    reward: { nxm_comet_tail: 10, nxm_stardust: 30 },
    penalty: '无',
    description: '壮观的彗星雨划过天际，带来丰富的冰晶材料。',
    color: '#E0FFFF',
  },
  nxe_dark_tide: {
    id: 'nxe_dark_tide', name: 'Dark Matter Tide', nameZh: '暗物质潮汐',
    type: 'resource', duration: 60, difficulty: 3,
    reward: { nxm_dark_matter: 6, nxm_void_crystal: 3 },
    penalty: '视野范围缩小50%',
    description: '暗物质潮汐涌来，虽然影响视野但也带来了珍贵材料。',
    color: '#1A1A2E',
  },
  nxe_supernova_ruins: {
    id: 'nxe_supernova_ruins', name: 'Supernova Ruins', nameZh: '超新星遗迹',
    type: 'exploration', duration: 120, difficulty: 5,
    reward: { nxm_supernova_ash: 3, nxm_soul_fragment: 2 },
    penalty: '消耗额外体力',
    description: '探测到附近的超新星遗迹，可能隐藏着远古宝藏。',
    color: NX_NOVA_WHITE,
  },
  nxe_vortex_rift: {
    id: 'nxe_vortex_rift', name: 'Vortex Rift', nameZh: '涡旋裂缝',
    type: 'emergency', duration: 30, difficulty: 8,
    reward: { nxm_vortex_rune: 2, nxm_quantum_shard: 4 },
    penalty: '随机守护者陷入漩涡',
    description: '空间出现危险的涡旋裂缝，必须紧急修复！',
    color: '#00FF7F',
  },
  nxe_quantum_interference: {
    id: 'nxe_quantum_interference', name: 'Quantum Interference', nameZh: '量子干扰',
    type: 'debuff', duration: 50, difficulty: 3,
    reward: { nxm_quantum_shard: 5 },
    penalty: '技能冷却时间翻倍',
    description: '量子场的异常波动干扰了堡垒的技能系统。',
    color: '#FF69B4',
  },
  nxe_caravan: {
    id: 'nxe_caravan', name: 'Interstellar Caravan', nameZh: '星际商队',
    type: 'trade', duration: 45, difficulty: 0,
    reward: { nxm_star_coin: 200 },
    penalty: '无',
    description: '一队星际商队经过，提供了难得的交易机会。',
    color: '#DAA520',
  },
  nxe_neutron_burst: {
    id: 'nxe_neutron_burst', name: 'Neutron Star Burst', nameZh: '中子星爆发',
    type: 'catastrophe', duration: 20, difficulty: 9,
    reward: { nxm_neutron_ingot: 5, nxm_magnetar_ore: 8 },
    penalty: '所有建筑HP减半',
    description: '附近中子星发生剧烈爆发，威胁整个星域的安全！',
    color: '#B0C4DE',
  },
  nxe_aurora_festival: {
    id: 'nxe_aurora_festival', name: 'Aurora Festival', nameZh: '极光盛宴',
    type: 'celebration', duration: 80, difficulty: 0,
    reward: { nxm_aurora_shard: 10, nxm_star_coin: 150 },
    penalty: '无',
    description: '绚丽的极光笼罩了整个星域，守护者们欢庆这个特殊时刻。',
    color: '#00FA9A',
  },
  nxe_black_hole: {
    id: 'nxe_black_hole', name: 'Black Hole Erosion', nameZh: '黑洞侵蚀',
    type: 'survival', duration: 35, difficulty: 10,
    reward: { nxm_black_hole_residue: 2, nxm_stellar_heart: 1 },
    penalty: '持续损失全部资源',
    description: '微型黑洞正在侵蚀堡垒的根基，这是最严峻的生存考验！',
    color: '#0D0D0D',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface NxGuardianState {
  enlisted: boolean;
  level: number;
  experience: number;
  stationedAt: string | null;
  hp: number;
  maxHp: number;
}

interface NxTowerState {
  defenderId: string | null;
  hp: number;
  maxHp: number;
  defenseLevel: number;
  isUnderAttack: boolean;
}

interface NxStructureState {
  built: boolean;
  level: number;
  hp: number;
}

interface NxActiveAbility {
  id: string;
  remainingCooldown: number;
  activeUntil: number;
}

interface NxActiveEvent {
  id: string;
  startedAt: number;
  endsAt: number;
  completed: boolean;
}

interface NxStats {
  totalWordsCompleted: number;
  totalGuardiansEnlisted: number;
  totalTowersDefended: number;
  totalStructuresBuilt: number;
  totalArtifactsActivated: number;
  totalEventsTriggered: number;
  totalMaterialsCollected: number;
  totalDamageDealt: number;
  totalDamageReceived: number;
  totalPlayTime: number;
  highestCombo: number;
  currentStreak: number;
  citadelLevel: number;
  citadelExp: number;
  totalCitadelExp: number;
}

interface NxState {
  nxGuardians: Record<string, NxGuardianState>;
  nxTowers: Record<string, NxTowerState>;
  nxInventory: Record<string, number>;
  nxStructures: Record<string, NxStructureState>;
  nxArtifacts: Record<string, boolean>;
  nxAchievements: Record<string, boolean>;
  nxActiveAbilities: Record<string, NxActiveAbility>;
  nxActiveEvents: Record<string, NxActiveEvent>;
  nxTitle: string | null;
  nxEventsTriggered: string[];
  nxStats: NxStats;
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIAL STATE FACTORY
// ═══════════════════════════════════════════════════════════════════════════

function createInitialGuardianState(): Record<string, NxGuardianState> {
  const result: Record<string, NxGuardianState> = {};
  const keys = Object.keys(NX_GUARDIANS);
  for (let i = 0; i < keys.length; i++) {
    const id = keys[i];
    result[id] = {
      enlisted: false,
      level: 1,
      experience: 0,
      stationedAt: null,
      hp: 0,
      maxHp: 0,
    };
  }
  return result;
}

function createInitialTowerState(): Record<string, NxTowerState> {
  const result: Record<string, NxTowerState> = {};
  const keys = Object.keys(NX_TOWERS);
  for (let i = 0; i < keys.length; i++) {
    const id = keys[i];
    const def = NX_TOWERS[id];
    result[id] = {
      defenderId: null,
      hp: def.baseHp,
      maxHp: def.baseHp,
      defenseLevel: 1,
      isUnderAttack: false,
    };
  }
  return result;
}

function createInitialStructureState(): Record<string, NxStructureState> {
  const result: Record<string, NxStructureState> = {};
  const keys = Object.keys(NX_STRUCTURES);
  for (let i = 0; i < keys.length; i++) {
    const id = keys[i];
    result[id] = {
      built: false,
      level: 0,
      hp: 0,
    };
  }
  return result;
}

function createInitialInventory(): Record<string, number> {
  const result: Record<string, number> = {};
  const keys = Object.keys(NX_MATERIALS);
  for (let i = 0; i < keys.length; i++) {
    result[keys[i]] = 0;
  }
  result.nxm_star_coin = 100;
  result.nxm_stardust = 50;
  result.nxm_star_iron = 20;
  return result;
}

function createInitialStats(): NxStats {
  return {
    totalWordsCompleted: 0,
    totalGuardiansEnlisted: 0,
    totalTowersDefended: 0,
    totalStructuresBuilt: 0,
    totalArtifactsActivated: 0,
    totalEventsTriggered: 0,
    totalMaterialsCollected: 0,
    totalDamageDealt: 0,
    totalDamageReceived: 0,
    totalPlayTime: 0,
    highestCombo: 0,
    currentStreak: 0,
    citadelLevel: 1,
    citadelExp: 0,
    totalCitadelExp: 0,
  };
}

function createInitialState(): NxState {
  return {
    nxGuardians: createInitialGuardianState(),
    nxTowers: createInitialTowerState(),
    nxInventory: createInitialInventory(),
    nxStructures: createInitialStructureState(),
    nxArtifacts: {},
    nxAchievements: {},
    nxActiveAbilities: {},
    nxActiveEvents: {},
    nxTitle: null,
    nxEventsTriggered: [],
    nxStats: createInitialStats(),
  };
}

const NX_INITIAL_STATE = createInitialState();

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function nxGetEnlistCost(rarity: string): Record<string, number> {
  if (rarity === NX_RARITY_COMMON) {
    return { nxm_star_coin: 50, nxm_stardust: 20 };
  }
  if (rarity === NX_RARITY_UNCOMMON) {
    return { nxm_star_coin: 150, nxm_stardust: 50, nxm_solar_fragment: 2 };
  }
  if (rarity === NX_RARITY_RARE) {
    return { nxm_star_coin: 400, nxm_pulsar_crystal: 3, nxm_dark_matter: 2 };
  }
  if (rarity === NX_RARITY_EPIC) {
    return { nxm_star_coin: 1000, nxm_quasar_core: 2, nxm_eclipse_stone: 2, nxm_supernova_ash: 1 };
  }
  if (rarity === NX_RARITY_LEGENDARY) {
    return { nxm_star_coin: 2500, nxm_stellar_heart: 1, nxm_cosmic_tear: 1, nxm_genesis_seed: 1 };
  }
  return { nxm_star_coin: 50, nxm_stardust: 20 };
}

function nxCanAfford(inventory: Record<string, number>, cost: Record<string, number>): boolean {
  const keys = Object.keys(cost);
  for (let i = 0; i < keys.length; i++) {
    const materialId = keys[i];
    const needed = cost[materialId];
    const owned = inventory[materialId] || 0;
    if (owned < needed) {
      return false;
    }
  }
  return true;
}

function nxDeductCost(inventory: Record<string, number>, cost: Record<string, number>): void {
  const keys = Object.keys(cost);
  for (let i = 0; i < keys.length; i++) {
    const materialId = keys[i];
    const amount = cost[materialId];
    if (inventory[materialId] !== undefined) {
      inventory[materialId] = Math.max(0, inventory[materialId] - amount);
    }
  }
}

function nxAddReward(inventory: Record<string, number>, reward: Record<string, number>): void {
  const keys = Object.keys(reward);
  for (let i = 0; i < keys.length; i++) {
    const materialId = keys[i];
    const amount = reward[materialId];
    if (inventory[materialId] !== undefined) {
      inventory[materialId] = (inventory[materialId] || 0) + amount;
    } else {
      inventory[materialId] = amount;
    }
  }
}

function nxGetStructureUpgradeCost(structureId: string, targetLevel: number): Record<string, number> {
  const def = NX_STRUCTURES[structureId];
  if (!def) return {};
  const result: Record<string, number> = {};
  const keys = Object.keys(def.baseCost);
  for (let i = 0; i < keys.length; i++) {
    const matId = keys[i];
    const base = def.baseCost[matId];
    result[matId] = Math.floor(base * Math.pow(def.costMultiplier, targetLevel - 1));
  }
  return result;
}

function nxExpToLevel(level: number): number {
  return Math.floor(50 * Math.pow(level, 1.8));
}

function nxCitadelExpToLevel(level: number): number {
  return Math.floor(200 * Math.pow(level, 2.0));
}

function nxGuardianMaxHp(def: NxGuardianDef, level: number): number {
  const base = def.power + def.defense + def.speed;
  return Math.floor(base * 2 * (1 + (level - 1) * 0.15));
}

// ═══════════════════════════════════════════════════════════════════════════
// ACHIEVEMENT CHECKER
// ═══════════════════════════════════════════════════════════════════════════

function nxCheckAchievements(state: NxState): string[] {
  const newlyUnlocked: string[] = [];
  const guardianIds = Object.keys(state.nxGuardians);
  const enlistedCount = guardianIds.filter((id) => state.nxGuardians[id].enlisted).length;
  const towerIds = Object.keys(state.nxTowers);
  const defendedCount = towerIds.filter((id) => state.nxTowers[id].defenderId !== null).length;
  const builtStructures = Object.keys(state.nxStructures).filter((id) => state.nxStructures[id].built).length;
  const artifactCount = Object.keys(state.nxArtifacts).filter((id) => state.nxArtifacts[id] === true).length;
  const eventCount = state.nxEventsTriggered.length;
  const hasLegendary = guardianIds.some((id) => {
    const def = NX_GUARDIANS[id];
    if (!def || def.rarity !== NX_RARITY_LEGENDARY) return false;
    return state.nxGuardians[id].enlisted;
  });
  const legendaryCount = guardianIds.filter((id) => {
    const def = NX_GUARDIANS[id];
    if (!def || def.rarity !== NX_RARITY_LEGENDARY) return false;
    return state.nxGuardians[id].enlisted;
  }).length;
  const hasMaxStructure = Object.keys(state.nxStructures).some((id) => {
    const def = NX_STRUCTURES[id];
    const st = state.nxStructures[id];
    return st.built && def && st.level >= def.maxLevel;
  });

  if (!state.nxAchievements.nxa_recruit_first && enlistedCount >= 1) {
    newlyUnlocked.push('nxa_recruit_first');
  }
  if (!state.nxAchievements.nxa_defend_first && defendedCount >= 1) {
    newlyUnlocked.push('nxa_defend_first');
  }
  if (!state.nxAchievements.nxa_build_ten && builtStructures >= 10) {
    newlyUnlocked.push('nxa_build_ten');
  }
  if (!state.nxAchievements.nxa_five_artifacts && artifactCount >= 5) {
    newlyUnlocked.push('nxa_five_artifacts');
  }
  if (!state.nxAchievements.nxa_five_events && eventCount >= 5) {
    newlyUnlocked.push('nxa_five_events');
  }
  if (!state.nxAchievements.nxa_ten_guardians && enlistedCount >= 10) {
    newlyUnlocked.push('nxa_ten_guardians');
  }
  if (!state.nxAchievements.nxa_max_level_structure && hasMaxStructure) {
    newlyUnlocked.push('nxa_max_level_structure');
  }
  if (!state.nxAchievements.nxa_all_structures && builtStructures >= 25) {
    newlyUnlocked.push('nxa_all_structures');
  }
  if (!state.nxAchievements.nxa_ten_abilities && state.nxStats.highestCombo >= 10) {
    newlyUnlocked.push('nxa_ten_abilities');
  }
  if (!state.nxAchievements.nxa_legendary_guardian && hasLegendary) {
    newlyUnlocked.push('nxa_legendary_guardian');
  }
  if (!state.nxAchievements.nxa_all_legendaries && legendaryCount >= 7) {
    newlyUnlocked.push('nxa_all_legendaries');
  }
  if (!state.nxAchievements.nxa_all_towers && defendedCount >= 8) {
    newlyUnlocked.push('nxa_all_towers');
  }
  if (!state.nxAchievements.nxa_supernova_event && state.nxEventsTriggered.includes('nxe_supernova_ruins')) {
    newlyUnlocked.push('nxa_supernova_event');
  }
  if (!state.nxAchievements.nxa_vortex_complete && state.nxEventsTriggered.includes('nxe_vortex_rift')) {
    newlyUnlocked.push('nxa_vortex_complete');
  }
  if (!state.nxAchievements.nxa_nebula_chain && state.nxEventsTriggered.includes('nxe_nebula_storm')) {
    newlyUnlocked.push('nxa_nebula_chain');
  }

  const achievementKeys = Object.keys(NX_ACHIEVEMENTS);
  const unlockedCount = achievementKeys.filter((id) => state.nxAchievements[id] === true).length;
  if (!state.nxAchievements.nxa_citadel_master && unlockedCount + newlyUnlocked.length >= achievementKeys.length) {
    newlyUnlocked.push('nxa_citadel_master');
  }

  return newlyUnlocked;
}

// ═══════════════════════════════════════════════════════════════════════════
// useNovaCitadel HOOK
// ═══════════════════════════════════════════════════════════════════════════

export default function useNovaCitadel() {
  const [state, setState] = useState<NxState>(() => createInitialState());
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ─── Computed: Enlisted Guardians ──────────────────────────────────
  const enlistedGuardians = useMemo(() => {
    const result: string[] = [];
    const keys = Object.keys(state.nxGuardians);
    for (let i = 0; i < keys.length; i++) {
      if (state.nxGuardians[keys[i]].enlisted) {
        result.push(keys[i]);
      }
    }
    return result;
  }, [state]);

  // ─── Computed: Active Tower Count ──────────────────────────────────
  const activeTowerCount = useMemo(() => {
    let count = 0;
    const keys = Object.keys(state.nxTowers);
    for (let i = 0; i < keys.length; i++) {
      if (state.nxTowers[keys[i]].defenderId !== null) {
        count += 1;
      }
    }
    return count;
  }, [state]);

  // ─── Computed: Built Structures Count ──────────────────────────────
  const builtStructureCount = useMemo(() => {
    let count = 0;
    const keys = Object.keys(state.nxStructures);
    for (let i = 0; i < keys.length; i++) {
      if (state.nxStructures[keys[i]].built) {
        count += 1;
      }
    }
    return count;
  }, [state]);

  // ─── Computed: Total Citadel Power ─────────────────────────────────
  const totalCitadelPower = useMemo(() => {
    let power = 0;
    const gKeys = Object.keys(state.nxGuardians);
    for (let i = 0; i < gKeys.length; i++) {
      const gs = state.nxGuardians[gKeys[i]];
      if (gs.enlisted) {
        const def = NX_GUARDIANS[gKeys[i]];
        if (def) {
          power += (def.power + def.defense + def.speed) * gs.level;
        }
      }
    }
    const tKeys = Object.keys(state.nxTowers);
    for (let i = 0; i < tKeys.length; i++) {
      const ts = state.nxTowers[tKeys[i]];
      if (ts.defenderId !== null) {
        power += ts.hp;
      }
    }
    return power;
  }, [state]);

  // ─── Computed: Achievement Progress ────────────────────────────────
  const achievementProgress = useMemo(() => {
    const total = Object.keys(NX_ACHIEVEMENTS).length;
    let unlocked = 0;
    const keys = Object.keys(state.nxAchievements);
    for (let i = 0; i < keys.length; i++) {
      if (state.nxAchievements[keys[i]]) {
        unlocked += 1;
      }
    }
    return { total, unlocked, percentage: total > 0 ? Math.floor((unlocked / total) * 100) : 0 };
  }, [state]);

  // ─── Computed: Artifact Count ──────────────────────────────────────
  const activeArtifactCount = useMemo(() => {
    let count = 0;
    const keys = Object.keys(state.nxArtifacts);
    for (let i = 0; i < keys.length; i++) {
      if (state.nxArtifacts[keys[i]]) {
        count += 1;
      }
    }
    return count;
  }, [state]);

  // ─── Computed: Guardian Roster by Type ─────────────────────────────
  const guardianRosterByType = useMemo(() => {
    const roster: Record<string, string[]> = {};
    const typeKeys = Object.keys(NX_TYPE_LABELS);
    for (let t = 0; t < typeKeys.length; t++) {
      roster[typeKeys[t]] = [];
    }
    const gKeys = Object.keys(state.nxGuardians);
    for (let i = 0; i < gKeys.length; i++) {
      const id = gKeys[i];
      const gs = state.nxGuardians[id];
      if (gs.enlisted) {
        const def = NX_GUARDIANS[id];
        if (def) {
          if (roster[def.type]) {
            roster[def.type].push(id);
          }
        }
      }
    }
    return roster;
  }, [state]);

  // ─── Computed: Tower Defense Overview ──────────────────────────────
  const towerDefenseOverview = useMemo(() => {
    const overview: Array<{
      id: string;
      name: string;
      nameZh: string;
      hpPercent: number;
      defenderId: string | null;
      defenderName: string | null;
      color: string;
    }> = [];
    const tKeys = Object.keys(state.nxTowers);
    for (let i = 0; i < tKeys.length; i++) {
      const id = tKeys[i];
      const ts = state.nxTowers[id];
      const def = NX_TOWERS[id];
      if (def) {
        const hpPercent = ts.maxHp > 0 ? Math.floor((ts.hp / ts.maxHp) * 100) : 0;
        let defenderName: string | null = null;
        if (ts.defenderId && state.nxGuardians[ts.defenderId]) {
          const gDef = NX_GUARDIANS[ts.defenderId];
          if (gDef) {
            defenderName = gDef.nameZh;
          }
        }
        overview.push({
          id,
          name: def.name,
          nameZh: def.nameZh,
          hpPercent,
          defenderId: ts.defenderId,
          defenderName,
          color: def.color,
        });
      }
    }
    return overview;
  }, [state]);

  // ─── Computed: Citadel Level Progress ──────────────────────────────
  const citadelLevelProgress = useMemo(() => {
    const level = state.nxStats.citadelLevel;
    const exp = state.nxStats.citadelExp;
    const needed = nxCitadelExpToLevel(level);
    const percentage = needed > 0 ? Math.min(100, Math.floor((exp / needed) * 100)) : 100;
    return { level, exp, needed, percentage };
  }, [state]);

  // ─── Computed: Inventory Summary ───────────────────────────────────
  const inventorySummary = useMemo(() => {
    const categories: Record<string, number> = {};
    let totalItems = 0;
    const keys = Object.keys(state.nxInventory);
    for (let i = 0; i < keys.length; i++) {
      const amount = state.nxInventory[keys[i]];
      if (amount > 0) {
        totalItems += amount;
        const def = NX_MATERIALS[keys[i]];
        if (def) {
          if (categories[def.category] === undefined) {
            categories[def.category] = 0;
          }
          categories[def.category] += amount;
        }
      }
    }
    return { categories, totalItems };
  }, [state]);

  // ─── Computed: Active Events Count ─────────────────────────────────
  const activeEventsCount = useMemo(() => {
    return Object.keys(state.nxActiveEvents).length;
  }, [state]);

  // ─── Computed: Structure Upgrade Overview ──────────────────────────
  const structureOverview = useMemo(() => {
    const overview: Array<{
      id: string;
      name: string;
      nameZh: string;
      built: boolean;
      level: number;
      maxLevel: number;
      color: string;
    }> = [];
    const keys = Object.keys(NX_STRUCTURES);
    for (let i = 0; i < keys.length; i++) {
      const id = keys[i];
      const def = NX_STRUCTURES[id];
      const st = state.nxStructures[id];
      if (def && st) {
        overview.push({
          id,
          name: def.name,
          nameZh: def.nameZh,
          built: st.built,
          level: st.level,
          maxLevel: def.maxLevel,
          color: def.color,
        });
      }
    }
    return overview;
  }, [state]);

  // ═══════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════

  const enlistGuardian = useCallback((id: string): { success: boolean; message: string } => {
    const def = NX_GUARDIANS[id];
    if (!def) {
      return { success: false, message: `未知的守护者: ${id}` };
    }
    let result: { success: boolean; message: string } = { success: false, message: '' };
    setState((prev) => {
      const gs = prev.nxGuardians[id];
      if (gs.enlisted) {
        result = { success: false, message: `${def.nameZh} 已经在册` };
        return prev;
      }
      const cost = nxGetEnlistCost(def.rarity);
      if (!nxCanAfford(prev.nxInventory, cost)) {
        result = { success: false, message: `材料不足，无法征召 ${def.nameZh}` };
        return prev;
      }
      const newInventory = { ...prev.nxInventory };
      nxDeductCost(newInventory, cost);
      const newGuardians = { ...prev.nxGuardians, [id]: { ...gs, enlisted: true, hp: nxGuardianMaxHp(def, gs.level), maxHp: nxGuardianMaxHp(def, gs.level) } };
      const newStats = { ...prev.nxStats, totalGuardiansEnlisted: prev.nxStats.totalGuardiansEnlisted + 1 };
      const newState = { ...prev, nxInventory: newInventory, nxGuardians: newGuardians, nxStats: newStats };
      const newAchievements = nxCheckAchievements(newState);
      if (newAchievements.length > 0) {
        const updatedAchievements = { ...newState.nxAchievements };
        for (let i = 0; i < newAchievements.length; i++) {
          updatedAchievements[newAchievements[i]] = true;
        }
        result = { success: true, message: `成功征召 ${def.nameZh}！` };
        return { ...newState, nxAchievements: updatedAchievements };
      }
      result = { success: true, message: `成功征召 ${def.nameZh}！` };
      return newState;
    });
    return result;
  }, []);

  const defendTower = useCallback((towerId: string, guardianId: string): { success: boolean; message: string } => {
    const tDef = NX_TOWERS[towerId];
    if (!tDef) {
      return { success: false, message: `未知的塔楼: ${towerId}` };
    }
    const gDef = NX_GUARDIANS[guardianId];
    if (!gDef) {
      return { success: false, message: `未知的守护者: ${guardianId}` };
    }
    let result: { success: boolean; message: string } = { success: false, message: '' };
    setState((prev) => {
      const gs = prev.nxGuardians[guardianId];
      if (!gs.enlisted) {
        result = { success: false, message: `${gDef.nameZh} 尚未被征召` };
        return prev;
      }
      if (gs.stationedAt !== null) {
        result = { success: false, message: `${gDef.nameZh} 已驻守在 ${NX_TOWERS[gs.stationedAt]?.nameZh || '未知塔楼'}` };
        return prev;
      }
      const ts = prev.nxTowers[towerId];
      if (ts.defenderId !== null) {
        result = { success: false, message: `${tDef.nameZh} 已有驻守者` };
        return prev;
      }
      const newTowers = { ...prev.nxTowers, [towerId]: { ...ts, defenderId: guardianId } };
      const newGuardians = { ...prev.nxGuardians, [guardianId]: { ...gs, stationedAt: towerId } };
      const defendedCount = Object.keys(newTowers).filter((tid) => newTowers[tid].defenderId !== null).length;
      const newStats = { ...prev.nxStats, totalTowersDefended: Math.max(prev.nxStats.totalTowersDefended, defendedCount) };
      const newState = { ...prev, nxTowers: newTowers, nxGuardians: newGuardians, nxStats: newStats };
      const newAchievements = nxCheckAchievements(newState);
      if (newAchievements.length > 0) {
        const updatedAchievements = { ...newState.nxAchievements };
        for (let i = 0; i < newAchievements.length; i++) {
          updatedAchievements[newAchievements[i]] = true;
        }
        result = { success: true, message: `${gDef.nameZh} 已驻守 ${tDef.nameZh}` };
        return { ...newState, nxAchievements: updatedAchievements };
      }
      result = { success: true, message: `${gDef.nameZh} 已驻守 ${tDef.nameZh}` };
      return newState;
    });
    return result;
  }, []);

  const buildStructure = useCallback((id: string): { success: boolean; message: string } => {
    const def = NX_STRUCTURES[id];
    if (!def) {
      return { success: false, message: `未知的建筑: ${id}` };
    }
    let result: { success: boolean; message: string } = { success: false, message: '' };
    setState((prev) => {
      const ss = prev.nxStructures[id];
      const targetLevel = ss.built ? ss.level + 1 : 1;
      if (targetLevel > def.maxLevel) {
        result = { success: false, message: `${def.nameZh} 已达最高等级` };
        return prev;
      }
      const cost = nxGetStructureUpgradeCost(id, targetLevel);
      if (!nxCanAfford(prev.nxInventory, cost)) {
        if (ss.built) {
          result = { success: false, message: `材料不足，无法将 ${def.nameZh} 升级到 Lv${targetLevel}` };
        } else {
          result = { success: false, message: `材料不足，无法建造 ${def.nameZh}` };
        }
        return prev;
      }
      const newInventory = { ...prev.nxInventory };
      nxDeductCost(newInventory, cost);
      const newStructures = { ...prev.nxStructures, [id]: { built: true, level: targetLevel, hp: 100 * targetLevel } };
      const structGain = !ss.built ? 1 : 0;
      const citadelExpGain = targetLevel * 15;
      let newCitadelExp = prev.nxStats.citadelExp + citadelExpGain;
      let newCitadelLevel = prev.nxStats.citadelLevel;
      if (newCitadelExp >= nxCitadelExpToLevel(newCitadelLevel)) {
        newCitadelExp -= nxCitadelExpToLevel(newCitadelLevel);
        newCitadelLevel += 1;
      }
      const newStats = {
        ...prev.nxStats,
        totalStructuresBuilt: prev.nxStats.totalStructuresBuilt + structGain,
        citadelExp: newCitadelExp,
        citadelLevel: newCitadelLevel,
        totalCitadelExp: prev.nxStats.totalCitadelExp + citadelExpGain,
      };
      const newState = { ...prev, nxInventory: newInventory, nxStructures: newStructures, nxStats: newStats };
      const newAchievements = nxCheckAchievements(newState);
      if (newAchievements.length > 0) {
        const updatedAchievements = { ...newState.nxAchievements };
        for (let i = 0; i < newAchievements.length; i++) {
          updatedAchievements[newAchievements[i]] = true;
        }
        if (targetLevel === 1) {
          result = { success: true, message: `成功建造 ${def.nameZh}！` };
        } else {
          result = { success: true, message: `${def.nameZh} 升级至 Lv${targetLevel}！` };
        }
        return { ...newState, nxAchievements: updatedAchievements };
      }
      if (targetLevel === 1) {
        result = { success: true, message: `成功建造 ${def.nameZh}！` };
      } else {
        result = { success: true, message: `${def.nameZh} 升级至 Lv${targetLevel}！` };
      }
      return newState;
    });
    return result;
  }, []);

  const activateArtifact = useCallback((id: string): { success: boolean; message: string } => {
    const def = NX_ARTIFACTS[id];
    if (!def) {
      return { success: false, message: `未知的神器: ${id}` };
    }
    let result: { success: boolean; message: string } = { success: false, message: '' };
    setState((prev) => {
      if (prev.nxArtifacts[id]) {
        result = { success: false, message: `${def.nameZh} 已经被激活` };
        return prev;
      }
      const newArtifacts = { ...prev.nxArtifacts, [id]: true };
      const newStats = { ...prev.nxStats, totalArtifactsActivated: prev.nxStats.totalArtifactsActivated + 1 };
      const newState = { ...prev, nxArtifacts: newArtifacts, nxStats: newStats };
      const newAchievements = nxCheckAchievements(newState);
      if (newAchievements.length > 0) {
        const updatedAchievements = { ...newState.nxAchievements };
        for (let i = 0; i < newAchievements.length; i++) {
          updatedAchievements[newAchievements[i]] = true;
        }
        result = { success: true, message: `成功激活 ${def.nameZh}！${def.passive}` };
        return { ...newState, nxAchievements: updatedAchievements };
      }
      result = { success: true, message: `成功激活 ${def.nameZh}！${def.passive}` };
      return newState;
    });
    return result;
  }, []);

  const triggerCitadelEvent = useCallback((): { success: boolean; eventId: string; message: string } => {
    let result: { success: boolean; eventId: string; message: string } = { success: false, eventId: '', message: '' };
    setState((prev) => {
      const eventKeys = Object.keys(NX_EVENTS);
      const availableEvents: string[] = [];
      for (let i = 0; i < eventKeys.length; i++) {
        const eid = eventKeys[i];
        if (prev.nxActiveEvents[eid]) continue;
        if (!prev.nxEventsTriggered.includes(eid)) {
          availableEvents.push(eid);
        }
      }
      if (availableEvents.length === 0) {
        result = { success: false, eventId: '', message: '所有事件都已触发过，暂无新事件' };
        return prev;
      }
      const randomIndex = Math.floor(Math.random() * availableEvents.length);
      const eventId = availableEvents[randomIndex];
      const eventDef = NX_EVENTS[eventId];
      const now = Date.now();
      const newActiveEvents = { ...prev.nxActiveEvents, [eventId]: { id: eventId, startedAt: now, endsAt: now + eventDef.duration * 1000, completed: false } };
      const newEventsTriggered = prev.nxEventsTriggered.includes(eventId) ? prev.nxEventsTriggered : [...prev.nxEventsTriggered, eventId];
      const citadelExpGain = eventDef.difficulty * 20;
      let newCitadelExp = prev.nxStats.citadelExp + citadelExpGain;
      let newCitadelLevel = prev.nxStats.citadelLevel;
      if (newCitadelExp >= nxCitadelExpToLevel(newCitadelLevel)) {
        newCitadelExp -= nxCitadelExpToLevel(newCitadelLevel);
        newCitadelLevel += 1;
      }
      const newStats = {
        ...prev.nxStats,
        totalEventsTriggered: prev.nxStats.totalEventsTriggered + 1,
        citadelExp: newCitadelExp,
        citadelLevel: newCitadelLevel,
        totalCitadelExp: prev.nxStats.totalCitadelExp + citadelExpGain,
      };
      const newState = { ...prev, nxActiveEvents: newActiveEvents, nxEventsTriggered: newEventsTriggered, nxStats: newStats };
      const newAchievements = nxCheckAchievements(newState);
      if (newAchievements.length > 0) {
        const updatedAchievements = { ...newState.nxAchievements };
        for (let i = 0; i < newAchievements.length; i++) {
          updatedAchievements[newAchievements[i]] = true;
        }
        result = { success: true, eventId, message: `事件触发: ${eventDef.nameZh} — ${eventDef.description}` };
        return { ...newState, nxAchievements: updatedAchievements };
      }
      result = { success: true, eventId, message: `事件触发: ${eventDef.nameZh} — ${eventDef.description}` };
      return newState;
    });
    return result;
  }, []);

  const resetNovaCitadel = useCallback((): void => {
    setState(createInitialState());
  }, []);

  const addMaterial = useCallback((materialId: string, amount: number): void => {
    if (amount <= 0) return;
    setState((prev) => {
      if (prev.nxInventory[materialId] === undefined) return prev;
      return {
        ...prev,
        nxInventory: { ...prev.nxInventory, [materialId]: prev.nxInventory[materialId] + amount },
        nxStats: { ...prev.nxStats, totalMaterialsCollected: prev.nxStats.totalMaterialsCollected + amount },
      };
    });
  }, []);

  const removeMaterial = useCallback((materialId: string, amount: number): boolean => {
    let removed = false;
    setState((prev) => {
      if (prev.nxInventory[materialId] === undefined) return prev;
      if (prev.nxInventory[materialId] < amount) return prev;
      removed = true;
      return {
        ...prev,
        nxInventory: { ...prev.nxInventory, [materialId]: prev.nxInventory[materialId] - amount },
      };
    });
    return removed;
  }, []);

  const unequipGuardian = useCallback((guardianId: string): { success: boolean; message: string } => {
    let result: { success: boolean; message: string } = { success: false, message: '' };
    setState((prev) => {
      const gs = prev.nxGuardians[guardianId];
      if (!gs || !gs.enlisted) {
        result = { success: false, message: '守护者不存在或未征召' };
        return prev;
      }
      if (gs.stationedAt === null) {
        result = { success: false, message: '该守护者未驻守任何塔楼' };
        return prev;
      }
      const towerId = gs.stationedAt;
      const gDef = NX_GUARDIANS[guardianId];
      const name = gDef ? gDef.nameZh : guardianId;
      result = { success: true, message: `${name} 已从塔楼撤回` };
      return {
        ...prev,
        nxTowers: { ...prev.nxTowers, [towerId]: { ...prev.nxTowers[towerId], defenderId: null } },
        nxGuardians: { ...prev.nxGuardians, [guardianId]: { ...gs, stationedAt: null } },
      };
    });
    return result;
  }, []);

  const setActiveTitle = useCallback((titleId: string): { success: boolean; message: string } => {
    const def = NX_TITLES[titleId];
    if (!def) {
      return { success: false, message: `未知的称号: ${titleId}` };
    }
    setState((prev) => ({ ...prev, nxTitle: titleId }));
    return { success: true, message: `称号已切换为: ${def.nameZh}` };
  }, []);

  const completeEvent = useCallback((eventId: string): { success: boolean; message: string } => {
    let result: { success: boolean; message: string } = { success: false, message: '' };
    setState((prev) => {
      const ae = prev.nxActiveEvents[eventId];
      if (!ae) {
        result = { success: false, message: '该事件未在进行中' };
        return prev;
      }
      if (ae.completed) {
        result = { success: false, message: '该事件已完成' };
        return prev;
      }
      const eventDef = NX_EVENTS[eventId];
      const newInventory = { ...prev.nxInventory };
      if (eventDef && eventDef.reward) {
        nxAddReward(newInventory, eventDef.reward);
      }
      const newActiveEvents = { ...prev.nxActiveEvents };
      delete newActiveEvents[eventId];
      const name = eventDef ? eventDef.nameZh : eventId;
      result = { success: true, message: `事件完成: ${name}，奖励已发放！` };
      return { ...prev, nxInventory: newInventory, nxActiveEvents: newActiveEvents };
    });
    return result;
  }, []);

  const recordWordCompleted = useCallback((): void => {
    setState((prev) => {
      const newStreak = prev.nxStats.currentStreak + 1;
      const newHighest = newStreak > prev.nxStats.highestCombo ? newStreak : prev.nxStats.highestCombo;
      const citadelExpGain = 5 + newStreak;
      let newCitadelExp = prev.nxStats.citadelExp + citadelExpGain;
      let newCitadelLevel = prev.nxStats.citadelLevel;
      if (newCitadelExp >= nxCitadelExpToLevel(newCitadelLevel)) {
        newCitadelExp -= nxCitadelExpToLevel(newCitadelLevel);
        newCitadelLevel += 1;
      }
      return {
        ...prev,
        nxStats: {
          ...prev.nxStats,
          totalWordsCompleted: prev.nxStats.totalWordsCompleted + 1,
          currentStreak: newStreak,
          highestCombo: newHighest,
          citadelExp: newCitadelExp,
          citadelLevel: newCitadelLevel,
          totalCitadelExp: prev.nxStats.totalCitadelExp + citadelExpGain,
        },
      };
    });
  }, []);

  const resetStreak = useCallback((): void => {
    setState((prev) => ({ ...prev, nxStats: { ...prev.nxStats, currentStreak: 0 } }));
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // nxAPI RETURN  (Pattern A: constants directly on API object)
  // ═══════════════════════════════════════════════════════════════════

  const nxAPI = useMemo(() => ({
    // ── State ────────────────────────────────────────────────────────
    state,

    // ── Color Constants ──────────────────────────────────────────────
    NX_SOLAR,
    NX_NEBULA,
    NX_PULSAR,
    NX_NOVA_WHITE,
    NX_ECLIPSE,
    NX_CORONA,
    NX_VOID,

    // ── Rarity Constants ─────────────────────────────────────────────
    NX_RARITY_COMMON,
    NX_RARITY_UNCOMMON,
    NX_RARITY_RARE,
    NX_RARITY_EPIC,
    NX_RARITY_LEGENDARY,
    NX_RARITY_COLORS,
    NX_RARITY_MULTIPLIER,
    NX_RARITY_ORDER,

    // ── Type Constants ───────────────────────────────────────────────
    NX_TYPE_SOLAR_KNIGHT,
    NX_TYPE_NEBULA_MAGE,
    NX_TYPE_PULSAR_RANGER,
    NX_TYPE_QUASAR_TITAN,
    NX_TYPE_ECLIPSE_DRUID,
    NX_TYPE_SUPERNOVA_ARCHON,
    NX_TYPE_VORTEX_CHAMPION,
    NX_TYPE_COLORS,
    NX_TYPE_LABELS,
    NX_TYPE_ORDER,

    // ── Data Definitions ─────────────────────────────────────────────
    NX_GUARDIANS,
    NX_TOWERS,
    NX_MATERIALS,
    NX_STRUCTURES,
    NX_ABILITIES,
    NX_ACHIEVEMENTS,
    NX_TITLES,
    NX_ARTIFACTS,
    NX_EVENTS,

    // ── Computed Values ──────────────────────────────────────────────
    enlistedGuardians,
    activeTowerCount,
    builtStructureCount,
    totalCitadelPower,
    achievementProgress,
    activeArtifactCount,
    guardianRosterByType,
    towerDefenseOverview,
    citadelLevelProgress,
    inventorySummary,
    activeEventsCount,
    structureOverview,

    // ── Actions ──────────────────────────────────────────────────────
    enlistGuardian,
    defendTower,
    buildStructure,
    activateArtifact,
    triggerCitadelEvent,
    resetNovaCitadel,
    addMaterial,
    removeMaterial,
    unequipGuardian,
    setActiveTitle,
    completeEvent,
    recordWordCompleted,
    resetStreak,

    // ── Helpers (exposed for UI) ─────────────────────────────────────
    nxGetEnlistCost,
    nxCanAfford,
    nxGetStructureUpgradeCost,
    nxExpToLevel,
    nxCitadelExpToLevel,
    nxGuardianMaxHp,
  }), [
    state,
    enlistedGuardians,
    activeTowerCount,
    builtStructureCount,
    totalCitadelPower,
    achievementProgress,
    activeArtifactCount,
    guardianRosterByType,
    towerDefenseOverview,
    citadelLevelProgress,
    inventorySummary,
    activeEventsCount,
    structureOverview,
    enlistGuardian,
    defendTower,
    buildStructure,
    activateArtifact,
    triggerCitadelEvent,
    resetNovaCitadel,
    addMaterial,
    removeMaterial,
    unequipGuardian,
    setActiveTitle,
    completeEvent,
    recordWordCompleted,
    resetStreak,
  ]);

  return nxAPI;
}
