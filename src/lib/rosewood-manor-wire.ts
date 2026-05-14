// ============================================================================
// Rosewood Manor Wire (紫檀庄园) — Noble Estate Management Module
// ============================================================================
// SSR-safe: no localStorage, no window/document, no setInterval.
// All exported constants use `RW_` prefix, all API methods use `rw` prefix.
// Pattern A: constants placed directly on the returned API object.
// ============================================================================

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';

// ============================================================================
// SECTION 1: TYPES & INTERFACES
// ============================================================================

export type RwRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type RwNobleType =
  | 'rose_knight'
  | 'velvet_duke'
  | 'amber_baroness'
  | 'jade_countess'
  | 'ivory_lord'
  | 'sapphire_duchess'
  | 'crimson_earl';

export type RwMaterialType = 'timber' | 'fabric' | 'gem' | 'metal' | 'essence';

export type RwStructureCategory =
  | 'garden'
  | 'wing'
  | 'gallery'
  | 'cellar'
  | 'tower';

export type RwAbilityType = 'active' | 'passive';

export type RwEventEffect = 'buff' | 'debuff' | 'special';

export type RwTitleId =
  | 'rw_title_steward'
  | 'rw_title_chamberlain'
  | 'rw_title_castellan'
  | 'rw_title_lord'
  | 'rw_title_baron'
  | 'rw_title_viscount'
  | 'rw_title_marquis'
  | 'rw_title_duke';

export interface RwNobleDef {
  readonly id: string;
  readonly name: string;
  readonly nobleType: RwNobleType;
  readonly rarity: RwRarity;
  readonly prestige: number;
  readonly elegance: number;
  readonly influence: number;
  readonly wealth: number;
  readonly description: string;
  readonly recruitCost: number;
}

export interface RwNobleInstance {
  readonly id: string;
  nobleDefId: string;
  name: string;
  level: number;
  xp: number;
  prestige: number;
  elegance: number;
  influence: number;
  wealth: number;
  recruitedAt: number;
}

export interface RwEstateDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly emoji: string;
  readonly unlockRenown: number;
  readonly capacity: number;
  readonly bonusType: string;
  readonly bonusValue: number;
  readonly bgGradient: string;
}

export interface RwMaterialDef {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly type: RwMaterialType;
  readonly rarity: RwRarity;
  readonly prestigeBonus: number;
  readonly eleganceBonus: number;
  readonly value: number;
  readonly description: string;
}

export interface RwStructureDef {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly category: RwStructureCategory;
  readonly maxLevel: number;
  readonly baseEffect: number;
  readonly effectPerLevel: number;
  readonly baseCost: number;
  readonly costMultiplier: number;
  readonly description: string;
}

export interface RwStructureInstance {
  readonly id: string;
  structureDefId: string;
  level: number;
  builtAt: number;
}

export interface RwAbilityDef {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly nobleType: RwNobleType;
  readonly abilityType: RwAbilityType;
  readonly rarity: RwRarity;
  readonly energyCost: number;
  readonly cooldown: number;
  readonly power: number;
  readonly description: string;
}

export interface RwAchievementDef {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly condition: string;
  readonly rewardGold: number;
  readonly rewardRenown: number;
}

export interface RwTitleDef {
  readonly id: RwTitleId;
  readonly name: string;
  readonly emoji: string;
  readonly minRenown: number;
  readonly minNobles: number;
  readonly description: string;
}

export interface RwArtifactDef {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly rarity: RwRarity;
  readonly description: string;
  readonly power: number;
  readonly cost: number;
  readonly lore: string;
}

export interface RwEventDef {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly durationTurns: number;
  readonly effectType: RwEventEffect;
  readonly effectDescription: string;
  readonly description: string;
}

export interface RwInventoryEntry {
  materialId: string;
  count: number;
}

export interface RwStats {
  totalRecruited: number;
  totalBuilt: number;
  totalArtifactsActivated: number;
  totalEventsTriggered: number;
  totalRenownEarned: number;
  totalGoldSpent: number;
  totalStructuresUpgraded: number;
  currentStreak: number;
  bestStreak: number;
}

export interface RwManorState {
  nobles: RwNobleInstance[];
  estates: string[];
  inventory: RwInventoryEntry[];
  structures: RwStructureInstance[];
  abilities: string[];
  artifacts: string[];
  achievements: string[];
  activeTitle: RwTitleId;
  gold: number;
  renown: number;
  activeEvent: RwEventDef | null;
  eventTurnsRemaining: number;
  stats: RwStats;
}

// ============================================================================
// SECTION 2: COLOR THEME CONSTANTS
// ============================================================================

export const RW_ROSEWOOD: string = '#65000B';
export const RW_VELVET_CRIMSON: string = '#DC143C';
export const RW_GOLD: string = '#DAA520';
export const RW_IVORY: string = '#FFFFF0';
export const RW_DEEP_BURGUNDY: string = '#4A0000';
export const RW_MAHOGANY: string = '#8B1A1A';
export const RW_CHAMPAGNE: string = '#F7E7CE';
export const RW_DARK_EBONY: string = '#1C1C1C';

// ============================================================================
// SECTION 3: RW_NOBLE_TYPES — 7 Noble Archetype Definitions
// ============================================================================

export const RW_NOBLE_TYPES: readonly {
  readonly id: RwNobleType;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly primaryStat: 'prestige' | 'elegance' | 'influence' | 'wealth';
  readonly color: string;
  readonly lore: string;
}[] = [
  {
    id: 'rose_knight',
    name: 'Rose Knight',
    emoji: '🗡️',
    description: 'Martial protectors of the manor who wield thorned blades and crimson banners.',
    primaryStat: 'influence',
    color: RW_VELVET_CRIMSON,
    lore: 'Sworn to protect the Rosewood bloodline, Rose Knights train from childhood in the art of war and chivalry.',
  },
  {
    id: 'velvet_duke',
    name: 'Velvet Duke',
    emoji: '🎭',
    description: 'Refined aristocrats who command through elegance, diplomacy, and velvet charm.',
    primaryStat: 'elegance',
    color: RW_MAHOGANY,
    lore: 'The Velvet Dukes trace their lineage to the first courtier who wrapped the manor throne in crimson velvet.',
  },
  {
    id: 'amber_baroness',
    name: 'Amber Baroness',
    emoji: '🔶',
    description: 'Wealthy baronesses who control amber mines and golden trade routes.',
    primaryStat: 'wealth',
    color: RW_GOLD,
    lore: 'The Amber Baronesses hold the keys to the manor treasury, their amber reserves funding every grand endeavor.',
  },
  {
    id: 'jade_countess',
    name: 'Jade Countess',
    emoji: '💚',
    description: 'Wise healers and mystics who draw power from sacred jade artifacts.',
    primaryStat: 'prestige',
    color: '#2E7D32',
    lore: 'Jade Countesses serve as the spiritual backbone of the manor, their healing arts preserving noble vitality.',
  },
  {
    id: 'ivory_lord',
    name: 'Ivory Lord',
    emoji: '🗼',
    description: 'Radiant defenders whose ivory armor shines with holy light and purity.',
    primaryStat: 'elegance',
    color: RW_IVORY,
    lore: 'Ivory Lords are anointed in the manor chapel, their ivory armor blessed by seven generations of seers.',
  },
  {
    id: 'sapphire_duchess',
    name: 'Sapphire Duchess',
    emoji: '💎',
    description: 'Enigmatic nobles who command the deep waters and sapphire energies of the lake.',
    primaryStat: 'influence',
    color: '#1E3A5F',
    lore: 'The Sapphire Duchesses draw their power from the ancient sapphire lake beneath the manor foundations.',
  },
  {
    id: 'crimson_earl',
    name: 'Crimson Earl',
    emoji: '🩸',
    description: 'Fierce warriors whose crimson bloodline carries the manor\'s ancient fire.',
    primaryStat: 'prestige',
    color: RW_ROSEWOOD,
    lore: 'Crimson Earls are the martial heart of the manor, their blood literally burning with ancestral fury.',
  },
];

// ============================================================================
// SECTION 4: RW_NOBLES — 35 Manor Nobles (5 rarity × 7 types)
// ============================================================================

export const RW_NOBLES: readonly RwNobleDef[] = [
  // ── Rose Knights (5) ────────────────────────────────────────
  {
    id: 'rk_thorn_squire',
    name: 'Thorn Squire',
    nobleType: 'rose_knight',
    rarity: 'common',
    prestige: 12,
    elegance: 8,
    influence: 10,
    wealth: 5,
    description: 'A young squire whose armor bears the emblem of a blooming rose thorn.',
    recruitCost: 50,
  },
  {
    id: 'rk_crimson_lancer',
    name: 'Crimson Lancer',
    nobleType: 'rose_knight',
    rarity: 'uncommon',
    prestige: 24,
    elegance: 16,
    influence: 22,
    wealth: 12,
    description: 'A skilled lancer whose crimson pennant strikes fear in rival estate guards.',
    recruitCost: 160,
  },
  {
    id: 'rk_rose_commander',
    name: 'Rose Commander',
    nobleType: 'rose_knight',
    rarity: 'rare',
    prestige: 48,
    elegance: 32,
    influence: 45,
    wealth: 28,
    description: 'Commands the Rosewood Guard with an iron fist wrapped in velvet gloves.',
    recruitCost: 480,
  },
  {
    id: 'rk_bloodthorn_paladin',
    name: 'Bloodthorn Paladin',
    nobleType: 'rose_knight',
    rarity: 'epic',
    prestige: 75,
    elegance: 55,
    influence: 70,
    wealth: 45,
    description: 'An unyielding paladin whose bloodthorn blade has never been drawn in vain.',
    recruitCost: 1600,
  },
  {
    id: 'rk_rose sovereign',
    name: 'Rose Sovereign',
    nobleType: 'rose_knight',
    rarity: 'legendary',
    prestige: 120,
    elegance: 90,
    influence: 110,
    wealth: 75,
    description: 'The legendary sovereign who founded the Order of the Rose centuries ago.',
    recruitCost: 5000,
  },

  // ── Velvet Dukes (5) ────────────────────────────────────────
  {
    id: 'vd_silk_page',
    name: 'Silk Page',
    nobleType: 'velvet_duke',
    rarity: 'common',
    prestige: 10,
    elegance: 14,
    influence: 8,
    wealth: 10,
    description: 'A page who maintains the ducal velvet wardrobe with meticulous care.',
    recruitCost: 45,
  },
  {
    id: 'vd_velvet_baron',
    name: 'Velvet Baron',
    nobleType: 'velvet_duke',
    rarity: 'uncommon',
    prestige: 20,
    elegance: 28,
    influence: 18,
    wealth: 22,
    description: 'A baron draped in the finest velvet, whose elegance inspires the entire court.',
    recruitCost: 170,
  },
  {
    id: 'vd_crimson_count',
    name: 'Crimson Count',
    nobleType: 'velvet_duke',
    rarity: 'rare',
    prestige: 40,
    elegance: 52,
    influence: 38,
    wealth: 40,
    description: 'A count whose crimson velvet robes are woven with threads of pure gold.',
    recruitCost: 500,
  },
  {
    id: 'vd_grand_velvet_magnate',
    name: 'Grand Velvet Magnate',
    nobleType: 'velvet_duke',
    rarity: 'epic',
    prestige: 65,
    elegance: 78,
    influence: 60,
    wealth: 62,
    description: 'A magnate who controls the velvet trade routes across three provinces.',
    recruitCost: 1800,
  },
  {
    id: 'vd_velvet_emperor',
    name: 'Velvet Emperor',
    nobleType: 'velvet_duke',
    rarity: 'legendary',
    prestige: 105,
    elegance: 120,
    influence: 95,
    wealth: 90,
    description: 'An emperor whose name is synonymous with velvet itself. All fabric bends to his will.',
    recruitCost: 5500,
  },

  // ── Amber Baronesses (5) ────────────────────────────────────
  {
    id: 'ab_resin_maiden',
    name: 'Resin Maiden',
    nobleType: 'amber_baroness',
    rarity: 'common',
    prestige: 8,
    elegance: 10,
    influence: 12,
    wealth: 12,
    description: 'A maiden who polishes amber ornaments in the manor\'s sunlit halls.',
    recruitCost: 40,
  },
  {
    id: 'ab_golden_hostess',
    name: 'Golden Hostess',
    nobleType: 'amber_baroness',
    rarity: 'uncommon',
    prestige: 18,
    elegance: 22,
    influence: 25,
    wealth: 24,
    description: 'A hostess whose golden amber jewelry lights up every banquet she attends.',
    recruitCost: 150,
  },
  {
    id: 'ab_amber_matriarch',
    name: 'Amber Matriarch',
    nobleType: 'amber_baroness',
    rarity: 'rare',
    prestige: 38,
    elegance: 42,
    influence: 48,
    wealth: 46,
    description: 'A matriarch whose amber-encrusted throne is the centerpiece of the great hall.',
    recruitCost: 460,
  },
  {
    id: 'ab_fossil_sovereign',
    name: 'Fossil Sovereign',
    nobleType: 'amber_baroness',
    rarity: 'epic',
    prestige: 62,
    elegance: 68,
    influence: 72,
    wealth: 70,
    description: 'A sovereign who possesses ancient amber fossils containing prehistoric secrets.',
    recruitCost: 1700,
  },
  {
    id: 'ab_amber_queen',
    name: 'Amber Queen Eternal',
    nobleType: 'amber_baroness',
    rarity: 'legendary',
    prestige: 100,
    elegance: 108,
    influence: 105,
    wealth: 98,
    description: 'The eternal queen preserved in golden amber since the manor\'s founding day.',
    recruitCost: 5200,
  },

  // ── Jade Countesses (5) ─────────────────────────────────────
  {
    id: 'jc_jade_handmaiden',
    name: 'Jade Handmaiden',
    nobleType: 'jade_countess',
    rarity: 'common',
    prestige: 10,
    elegance: 12,
    influence: 14,
    wealth: 6,
    description: 'A handmaiden who tends the jade gardens with gentle, knowing hands.',
    recruitCost: 42,
  },
  {
    id: 'jc_emerald_lady',
    name: 'Emerald Lady',
    nobleType: 'jade_countess',
    rarity: 'uncommon',
    prestige: 22,
    elegance: 26,
    influence: 28,
    wealth: 16,
    description: 'A lady whose emerald combs are said to grant visions of future harvests.',
    recruitCost: 155,
  },
  {
    id: 'jc_jade_aristocrat',
    name: 'Jade Aristocrat',
    nobleType: 'jade_countess',
    rarity: 'rare',
    prestige: 44,
    elegance: 48,
    influence: 50,
    wealth: 35,
    description: 'An aristocrat whose jade collection rivals the imperial treasury itself.',
    recruitCost: 490,
  },
  {
    id: 'jc_nephrite_duchess',
    name: 'Nephrite Duchess',
    nobleType: 'jade_countess',
    rarity: 'epic',
    prestige: 70,
    elegance: 75,
    influence: 72,
    wealth: 55,
    description: 'A duchess whose nephrite crown was carved from a single flawless stone.',
    recruitCost: 1650,
  },
  {
    id: 'jc_jade_empress',
    name: 'Jade Empress of Ages',
    nobleType: 'jade_countess',
    rarity: 'legendary',
    prestige: 110,
    elegance: 112,
    influence: 108,
    wealth: 85,
    description: 'An empress whose jade aura has protected the manor for a thousand years.',
    recruitCost: 5400,
  },

  // ── Ivory Lords (5) ─────────────────────────────────────────
  {
    id: 'il_ivory_scout',
    name: 'Ivory Scout',
    nobleType: 'ivory_lord',
    rarity: 'common',
    prestige: 8,
    elegance: 16,
    influence: 10,
    wealth: 8,
    description: 'A scout who patrols the ivory walls of the manor at dawn and dusk.',
    recruitCost: 48,
  },
  {
    id: 'il_bone_marshall',
    name: 'Bone Marshall',
    nobleType: 'ivory_lord',
    rarity: 'uncommon',
    prestige: 20,
    elegance: 30,
    influence: 24,
    wealth: 18,
    description: 'A marshall whose ivory-hilted sword commands the manor\'s northern forces.',
    recruitCost: 165,
  },
  {
    id: 'il_ivory_viceroy',
    name: 'Ivory Viceroy',
    nobleType: 'ivory_lord',
    rarity: 'rare',
    prestige: 42,
    elegance: 55,
    influence: 44,
    wealth: 38,
    description: 'A viceroy whose ivory throne room gleams like a temple of pure light.',
    recruitCost: 510,
  },
  {
    id: 'il_pale_lord_commander',
    name: 'Pale Lord Commander',
    nobleType: 'ivory_lord',
    rarity: 'epic',
    prestige: 68,
    elegance: 82,
    influence: 65,
    wealth: 58,
    description: 'A commander whose ivory armor radiates an aura that repels all darkness.',
    recruitCost: 1750,
  },
  {
    id: 'il_ivory_archon',
    name: 'Ivory Archon of Light',
    nobleType: 'ivory_lord',
    rarity: 'legendary',
    prestige: 108,
    elegance: 125,
    influence: 100,
    wealth: 80,
    description: 'The archon whose very presence turns shadows to ivory and despair to hope.',
    recruitCost: 5600,
  },

  // ── Sapphire Duchesses (5) ──────────────────────────────────
  {
    id: 'sd_sapphire_cherub',
    name: 'Sapphire Cherub',
    nobleType: 'sapphire_duchess',
    rarity: 'common',
    prestige: 14,
    elegance: 10,
    influence: 8,
    wealth: 10,
    description: 'A cherub whose sapphire eyes mirror the deep waters of the estate lake.',
    recruitCost: 52,
  },
  {
    id: 'sd_azure_noblewoman',
    name: 'Azure Noblewoman',
    nobleType: 'sapphire_duchess',
    rarity: 'uncommon',
    prestige: 28,
    elegance: 20,
    influence: 20,
    wealth: 22,
    description: 'A noblewoman whose azure sapphires are the envy of every court in the land.',
    recruitCost: 175,
  },
  {
    id: 'sd_cerulean_vipress',
    name: 'Cerulean Vipress',
    nobleType: 'sapphire_duchess',
    rarity: 'rare',
    prestige: 50,
    elegance: 38,
    influence: 42,
    wealth: 42,
    description: 'A vipress whose cerulean gaze can freeze a rival noble with a single glance.',
    recruitCost: 520,
  },
  {
    id: 'sd_sapphire_regent',
    name: 'Sapphire Regent',
    nobleType: 'sapphire_duchess',
    rarity: 'epic',
    prestige: 78,
    elegance: 58,
    influence: 68,
    wealth: 65,
    description: 'A regent whose sapphire scepter once belonged to an ancient sea deity.',
    recruitCost: 1850,
  },
  {
    id: 'sd_deep_sapphire_empress',
    name: 'Deep Sapphire Empress',
    nobleType: 'sapphire_duchess',
    rarity: 'legendary',
    prestige: 118,
    elegance: 88,
    influence: 102,
    wealth: 92,
    description: 'The empress of the deepest sapphire mines, commanding oceans of blue fire.',
    recruitCost: 5800,
  },

  // ── Crimson Earls (5) ───────────────────────────────────────
  {
    id: 'ce_blood_page',
    name: 'Blood Page',
    nobleType: 'crimson_earl',
    rarity: 'common',
    prestige: 11,
    elegance: 8,
    influence: 16,
    wealth: 8,
    description: 'A page who serves the crimson wine at every manor feast with solemn pride.',
    recruitCost: 46,
  },
  {
    id: 'ce_scarlet_baronet',
    name: 'Scarlet Baronet',
    nobleType: 'crimson_earl',
    rarity: 'uncommon',
    prestige: 24,
    elegance: 18,
    influence: 30,
    wealth: 20,
    description: 'A baronet whose scarlet banner has led the manor to victory in twelve duels.',
    recruitCost: 160,
  },
  {
    id: 'ce_crimson_viscount',
    name: 'Crimson Viscount',
    nobleType: 'crimson_earl',
    rarity: 'rare',
    prestige: 46,
    elegance: 35,
    influence: 52,
    wealth: 40,
    description: 'A viscount whose crimson blade was forged in the blood-red fires of Mount Ash.',
    recruitCost: 470,
  },
  {
    id: 'ce_carmine_marshal',
    name: 'Carmine Marshal',
    nobleType: 'crimson_earl',
    rarity: 'epic',
    prestige: 72,
    elegance: 55,
    influence: 75,
    wealth: 60,
    description: 'A marshal whose carmine armies have never tasted defeat on any battlefield.',
    recruitCost: 1700,
  },
  {
    id: 'ce_crimson_sovereign',
    name: 'Crimson Sovereign',
    nobleType: 'crimson_earl',
    rarity: 'legendary',
    prestige: 115,
    elegance: 85,
    influence: 118,
    wealth: 88,
    description: 'The crimson sovereign whose bloodline carries the ancient fire of the manor.',
    recruitCost: 5700,
  },
];

// ============================================================================
// SECTION 5: RW_ESTATES — 8 Estate Locations
// ============================================================================

export const RW_ESTATES: readonly RwEstateDef[] = [
  {
    id: 'estate_main_hall',
    name: 'Main Hall of Rosewood',
    description: 'The grand central hall where all manor business is conducted beneath vaulted rosewood ceilings.',
    emoji: '🏛️',
    unlockRenown: 0,
    capacity: 6,
    bonusType: 'prestige',
    bonusValue: 10,
    bgGradient: 'linear-gradient(180deg, #65000B 0%, #DAA520 50%, #FFFFF0 100%)',
  },
  {
    id: 'estate_velvet_gardens',
    name: 'Velvet Gardens',
    description: 'Lush gardens where crimson roses bloom in geometric patterns beside velvet-draped pavilions.',
    emoji: '🌹',
    unlockRenown: 50,
    capacity: 5,
    bonusType: 'elegance',
    bonusValue: 12,
    bgGradient: 'linear-gradient(180deg, #DC143C 0%, #F7E7CE 50%, #65000B 100%)',
  },
  {
    id: 'estate_amber_greenhouse',
    name: 'Amber Greenhouse',
    description: 'A sunlit greenhouse where golden amber crystals amplify the growth of exotic flora.',
    emoji: '🌻',
    unlockRenown: 120,
    capacity: 4,
    bonusType: 'wealth',
    bonusValue: 15,
    bgGradient: 'linear-gradient(180deg, #DAA520 0%, #FFFFF0 50%, #4A0000 100%)',
  },
  {
    id: 'estate_jade_pavilion',
    name: 'Jade Pavilion',
    description: 'A tranquil pavilion built from carved jade, where nobles meditate beside whispering waters.',
    emoji: '💚',
    unlockRenown: 250,
    capacity: 4,
    bonusType: 'influence',
    bonusValue: 14,
    bgGradient: 'linear-gradient(180deg, #2E7D32 0%, #FFFFF0 50%, #65000B 100%)',
  },
  {
    id: 'estate_ivory_tower',
    name: 'Ivory Watchtower',
    description: 'A towering ivory spire that offers panoramic views of the entire rosewood estate grounds.',
    emoji: '🗼',
    unlockRenown: 400,
    capacity: 3,
    bonusType: 'prestige',
    bonusValue: 20,
    bgGradient: 'linear-gradient(180deg, #FFFFF0 0%, #DAA520 50%, #1C1C1C 100%)',
  },
  {
    id: 'estate_sapphire_lake',
    name: 'Sapphire Lake Estate',
    description: 'A crystalline lake fed by sapphire springs, surrounded by weeping willows and marble benches.',
    emoji: '💎',
    unlockRenown: 600,
    capacity: 4,
    bonusType: 'elegance',
    bonusValue: 18,
    bgGradient: 'linear-gradient(180deg, #1E3A5F 0%, #DC143C 50%, #65000B 100%)',
  },
  {
    id: 'estate_crimson_vault',
    name: 'Crimson Vault',
    description: 'An underground vault of crimson stone where the manor\'s most precious treasures are sealed.',
    emoji: '🔐',
    unlockRenown: 900,
    capacity: 3,
    bonusType: 'wealth',
    bonusValue: 25,
    bgGradient: 'linear-gradient(180deg, #4A0000 0%, #8B1A1A 50%, #DAA520 100%)',
  },
  {
    id: 'estate_royal_crypt',
    name: 'Royal Crypt of Rosewood',
    description: 'The sacred crypt beneath the manor where ancestral spirits guard the bloodline\'s eternal secrets.',
    emoji: '🕯️',
    unlockRenown: 1400,
    capacity: 2,
    bonusType: 'influence',
    bonusValue: 30,
    bgGradient: 'linear-gradient(180deg, #1C1C1C 0%, #65000B 50%, #DAA520 100%)',
  },
];

// ============================================================================
// SECTION 6: RW_MATERIALS — 30 Luxury Materials
// ============================================================================

export const RW_MATERIALS: readonly RwMaterialDef[] = [
  // Common (8)
  { id: 'mat_rosewood_plank', name: 'Rosewood Plank', emoji: '🪵', type: 'timber', rarity: 'common', prestigeBonus: 2, eleganceBonus: 3, value: 10, description: 'A polished plank of dark rosewood, fragrant and durable.' },
  { id: 'mat_red_velvet_scrap', name: 'Red Velvet Scrap', emoji: '🧣', type: 'fabric', rarity: 'common', prestigeBonus: 1, eleganceBonus: 4, value: 12, description: 'A scrap of rich red velvet leftover from the drapery workshops.' },
  { id: 'mat_raw_amber_chunk', name: 'Raw Amber Chunk', emoji: '🟡', type: 'gem', rarity: 'common', prestigeBonus: 3, eleganceBonus: 2, value: 14, description: 'A rough chunk of amber with a tiny insect trapped inside.' },
  { id: 'mat_iron_ingot', name: 'Wrought Iron Ingot', emoji: '🔩', type: 'metal', rarity: 'common', prestigeBonus: 2, eleganceBonus: 1, value: 8, description: 'A standard wrought iron ingot from the manor forge.' },
  { id: 'mat_rose_essence', name: 'Rose Essence', emoji: '🌹', type: 'essence', rarity: 'common', prestigeBonus: 1, eleganceBonus: 5, value: 15, description: 'Distilled essence of manor roses, used in perfumes and potions.' },
  { id: 'mat_oak_beam', name: 'Seasoned Oak Beam', emoji: '🪓', type: 'timber', rarity: 'common', prestigeBonus: 3, eleganceBonus: 1, value: 11, description: 'A sturdy oak beam seasoned for two years in the manor cellars.' },
  { id: 'mat_cotton_bolt', name: 'Fine Cotton Bolt', emoji: '🧵', type: 'fabric', rarity: 'common', prestigeBonus: 1, eleganceBonus: 2, value: 9, description: 'A bolt of fine cotton for upholstering manor furniture.' },
  { id: 'mat_copper_wire', name: 'Copper Wire Spool', emoji: '🔗', type: 'metal', rarity: 'common', prestigeBonus: 2, eleganceBonus: 2, value: 13, description: 'A spool of thin copper wire for decorative metalwork.' },

  // Uncommon (7)
  { id: 'mat_ebony_veneer', name: 'Ebony Veneer Sheet', emoji: '🖤', type: 'timber', rarity: 'uncommon', prestigeBonus: 8, eleganceBonus: 10, value: 75, description: 'A paper-thin sheet of rare ebony wood for luxury inlays.' },
  { id: 'mat_silk_crimson', name: 'Crimson Silk Bolt', emoji: '👘', type: 'fabric', rarity: 'uncommon', prestigeBonus: 6, eleganceBonus: 12, value: 85, description: 'A full bolt of crimson silk woven by master weavers.' },
  { id: 'mat_fire_opal', name: 'Fire Opal Shard', emoji: '🔶', type: 'gem', rarity: 'uncommon', prestigeBonus: 12, eleganceBonus: 8, value: 90, description: 'A shimmering fire opal that glows with inner flame.' },
  { id: 'mat_silver_leaf', name: 'Silver Leaf Foil', emoji: '🥈', type: 'metal', rarity: 'uncommon', prestigeBonus: 10, eleganceBonus: 10, value: 80, description: 'Ultra-thin silver leaf for gilding manor furnishings.' },
  { id: 'mat_amber_resin_pure', name: 'Pure Amber Resin', emoji: '✨', type: 'essence', rarity: 'uncommon', prestigeBonus: 8, eleganceBonus: 14, value: 88, description: 'Clarified amber resin of exceptional clarity and warmth.' },
  { id: 'mat_sandalwood_log', name: 'Sandalwood Log', emoji: '🪵', type: 'timber', rarity: 'uncommon', prestigeBonus: 10, eleganceBonus: 8, value: 72, description: 'A fragrant sandalwood log for incense and carving.' },
  { id: 'mat_gold_thread_spool', name: 'Gold Thread Spool', emoji: '🧶', type: 'fabric', rarity: 'uncommon', prestigeBonus: 14, eleganceBonus: 6, value: 78, description: 'A spool of fine gold thread for embroidery work.' },

  // Rare (6)
  { id: 'mat_ancient_rosewood', name: 'Ancient Rosewood Heart', emoji: '❤️', type: 'timber', rarity: 'rare', prestigeBonus: 20, eleganceBonus: 22, value: 350, description: 'The heartwood of a thousand-year-old rosewood tree.' },
  { id: 'mat_velvet_mystic', name: 'Mystic Velvet Cloth', emoji: '🔮', type: 'fabric', rarity: 'rare', prestigeBonus: 18, eleganceBonus: 25, value: 380, description: 'Velvet woven under a full moon, said to absorb ambient magic.' },
  { id: 'mat_star_sapphire', name: 'Star Sapphire Gem', emoji: '⭐', type: 'gem', rarity: 'rare', prestigeBonus: 25, eleganceBonus: 20, value: 400, description: 'A star sapphire with a perfect six-rayed star visible in any light.' },
  { id: 'mat_platinum_bar', name: 'Platinum Ingot', emoji: '⬜', type: 'metal', rarity: 'rare', prestigeBonus: 22, eleganceBonus: 18, value: 360, description: 'A pure platinum ingot, the rarest of manor metals.' },
  { id: 'mat_phoenix_feather_dust', name: 'Phoenix Feather Dust', emoji: '🪶', type: 'essence', rarity: 'rare', prestigeBonus: 15, eleganceBonus: 28, value: 420, description: 'Fine dust from a phoenix feather, glowing with eternal warmth.' },
  { id: 'mat_moonstone_shard', name: 'Moonstone Shard', emoji: '🌙', type: 'gem', rarity: 'rare', prestigeBonus: 22, eleganceBonus: 22, value: 370, description: 'A luminous moonstone shard that changes color with the tides.' },

  // Epic (5)
  { id: 'mat_petrfied_rosewood', name: 'Petrified Rosewood Core', emoji: '🪨', type: 'timber', rarity: 'epic', prestigeBonus: 40, eleganceBonus: 35, value: 1500, description: 'Rosewood transformed to stone over millennia, impossibly heavy and beautiful.' },
  { id: 'mat_shadow_silk', name: 'Shadow Silk Weave', emoji: '🕸️', type: 'fabric', rarity: 'epic', prestigeBonus: 35, eleganceBonus: 45, value: 1600, description: 'Silk woven from shadow threads, nearly invisible in dim light.' },
  { id: 'mat_blood_diamond', name: 'Blood Diamond', emoji: '💎', type: 'gem', rarity: 'epic', prestigeBonus: 50, eleganceBonus: 30, value: 1800, description: 'A crimson diamond that pulses with a heartbeat-like rhythm.' },
  { id: 'mat_mythril_ingot', name: 'Mythril Ingot', emoji: '💠', type: 'metal', rarity: 'epic', prestigeBonus: 45, eleganceBonus: 38, value: 1700, description: 'An ingot of mythril, lighter than silk yet stronger than steel.' },
  { id: 'mat_rose_crown_essence', name: 'Essence of the Rose Crown', emoji: '👑', type: 'essence', rarity: 'epic', prestigeBonus: 38, eleganceBonus: 48, value: 1900, description: 'Distilled essence from the legendary Rose Crown of the first manor lord.' },

  // Legendary (4)
  { id: 'mat_world_tree_sap', name: 'World Tree Rosewood Sap', emoji: '🌳', type: 'timber', rarity: 'legendary', prestigeBonus: 80, eleganceBonus: 70, value: 8000, description: 'Sap from the World Tree\'s rosewood branch, source of all manor timber.' },
  { id: 'mat_fate_weave', name: 'Cloth of Destiny', emoji: '🌌', type: 'fabric', rarity: 'legendary', prestigeBonus: 70, eleganceBonus: 85, value: 9000, description: 'Fabric woven by the Fates themselves, each thread is a destiny.' },
  { id: 'mat_eternal_flame_gem', name: 'Eternal Flame Ruby', emoji: '🔥', type: 'gem', rarity: 'legendary', prestigeBonus: 90, eleganceBonus: 75, value: 10000, description: 'A ruby containing an eternal flame that has burned since the world began.' },
  { id: 'mat_celestial_aurum', name: 'Celestial Aurum', emoji: '🌟', type: 'metal', rarity: 'legendary', prestigeBonus: 85, eleganceBonus: 80, value: 12000, description: 'Gold mined from falling stars, warm to the touch and radiating cosmic energy.' },
];

// ============================================================================
// SECTION 7: RW_STRUCTURES — 25 Manor Structures (upgradeable to lv10)
// ============================================================================

export const RW_STRUCTURES: readonly RwStructureDef[] = [
  // ── Gardens (5) ─────────────────────────────────────────────
  { id: 'str_rose_garden', name: 'Rose Garden Terrace', emoji: '🌹', category: 'garden', maxLevel: 10, baseEffect: 3, effectPerLevel: 2, baseCost: 60, costMultiplier: 1.4, description: 'A terrace of crimson roses that blooms year-round under enchanted sunlight.' },
  { id: 'str_hedge_maze', name: 'Ivory Hedge Maze', emoji: '🌿', category: 'garden', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 100, costMultiplier: 1.5, description: 'A labyrinth of ivory-trimmed hedges that tests the wit of every visitor.' },
  { id: 'str_fountain_plaza', name: 'Golden Fountain Plaza', emoji: '⛲', category: 'garden', maxLevel: 10, baseEffect: 7, effectPerLevel: 3, baseCost: 180, costMultiplier: 1.5, description: 'A grand plaza centered on a fountain that flows with liquid gold at midnight.' },
  { id: 'str_orchard', name: 'Amber Orchard', emoji: '🍎', category: 'garden', maxLevel: 10, baseEffect: 8, effectPerLevel: 3, baseCost: 250, costMultiplier: 1.6, description: 'An ancient orchard bearing amber-skinned fruits of extraordinary sweetness.' },
  { id: 'str_zen_courtyard', name: 'Jade Zen Courtyard', emoji: '☯️', category: 'garden', maxLevel: 10, baseEffect: 10, effectPerLevel: 4, baseCost: 400, costMultiplier: 1.7, description: 'A serene courtyard of jade stones and raked sand for noble meditation.' },

  // ── Wings (5) ───────────────────────────────────────────────
  { id: 'str_west_wing', name: 'West Wing Quarters', emoji: '🛏️', category: 'wing', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 80, costMultiplier: 1.4, description: 'Comfortable guest quarters in the west wing with rosewood four-poster beds.' },
  { id: 'str_banquet_hall', name: 'Crimson Banquet Hall', emoji: '🍷', category: 'wing', maxLevel: 10, baseEffect: 8, effectPerLevel: 3, baseCost: 200, costMultiplier: 1.5, description: 'A magnificent hall where crimson-draped tables groan under the weight of feasts.' },
  { id: 'str_library_wing', name: 'Rosewood Library', emoji: '📚', category: 'wing', maxLevel: 10, baseEffect: 12, effectPerLevel: 4, baseCost: 350, costMultiplier: 1.6, description: 'A library lined with rosewood shelves containing centuries of noble knowledge.' },
  { id: 'str_music_room', name: 'Velvet Music Room', emoji: '🎵', category: 'wing', maxLevel: 10, baseEffect: 10, effectPerLevel: 4, baseCost: 300, costMultiplier: 1.6, description: 'Soundproofed with velvet, this room amplifies the beauty of every note played.' },
  { id: 'str_map_room', name: 'Cartographer\'s Study', emoji: '🗺️', category: 'wing', maxLevel: 10, baseEffect: 6, effectPerLevel: 3, baseCost: 150, costMultiplier: 1.5, description: 'A study filled with maps of every estate the manor has ever claimed.' },

  // ── Galleries (5) ───────────────────────────────────────────
  { id: 'str_portrait_gallery', name: 'Portrait Gallery', emoji: '🖼️', category: 'gallery', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 120, costMultiplier: 1.5, description: 'A long corridor lined with portraits of every manor lord since the founding.' },
  { id: 'str_armor_hall', name: 'Armor Display Hall', emoji: '🛡️', category: 'gallery', maxLevel: 10, baseEffect: 7, effectPerLevel: 3, baseCost: 220, costMultiplier: 1.5, description: 'Displays of gleaming armor worn by legendary rose knights of the past.' },
  { id: 'str_treasury_gallery', name: 'Treasury Exhibition', emoji: '💎', category: 'gallery', maxLevel: 10, baseEffect: 15, effectPerLevel: 5, baseCost: 500, costMultiplier: 1.7, description: 'A fortified gallery displaying the manor\'s most valuable treasures under enchanted glass.' },
  { id: 'str_tapestry_hall', name: 'Tapestry Grand Hall', emoji: '🎭', category: 'gallery', maxLevel: 10, baseEffect: 10, effectPerLevel: 4, baseCost: 320, costMultiplier: 1.6, description: 'Hanging tapestries depicting the great battles and triumphs of the manor.' },
  { id: 'str_sculpture_garden', name: 'Ivory Sculpture Garden', emoji: '🗿', category: 'gallery', maxLevel: 10, baseEffect: 12, effectPerLevel: 4, baseCost: 450, costMultiplier: 1.7, description: 'An open-air gallery of ivory sculptures by master artists of the realm.' },

  // ── Cellars (5) ─────────────────────────────────────────────
  { id: 'str_wine_cellar', name: 'Crimson Wine Cellar', emoji: '🍷', category: 'cellar', maxLevel: 10, baseEffect: 6, effectPerLevel: 3, baseCost: 140, costMultiplier: 1.5, description: 'A cellar housing vintages aged in crimson oak barrels for generations.' },
  { id: 'str_cheese_vault', name: 'Amber Cheese Vault', emoji: '🧀', category: 'cellar', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 90, costMultiplier: 1.4, description: 'A temperature-controlled vault for aging the finest amber-crusted cheeses.' },
  { id: 'str_spice_pantry', name: 'Exotic Spice Pantry', emoji: '🌶️', category: 'cellar', maxLevel: 10, baseEffect: 8, effectPerLevel: 3, baseCost: 200, costMultiplier: 1.6, description: 'Stocked with rare spices from distant lands traded for manor gold.' },
  { id: 'str_spirit_cellar', name: 'Spirit Aging Cellar', emoji: '🥃', category: 'cellar', maxLevel: 10, baseEffect: 10, effectPerLevel: 4, baseCost: 350, costMultiplier: 1.6, description: 'Where spirits age in enchanted casks that amplify their potency tenfold.' },
  { id: 'str_ice_vault', name: 'Sapphire Ice Vault', emoji: '🧊', category: 'cellar', maxLevel: 10, baseEffect: 12, effectPerLevel: 5, baseCost: 480, costMultiplier: 1.7, description: 'A vault of eternal sapphire ice that preserves delicacies indefinitely.' },

  // ── Towers (5) ──────────────────────────────────────────────
  { id: 'str_clock_tower', name: 'Rosewood Clock Tower', emoji: '🕐', category: 'tower', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 160, costMultiplier: 1.5, description: 'A towering clock of rosewood and gold that chimes with perfect melody.' },
  { id: 'str_astronomy_tower', name: 'Star Gazing Tower', emoji: '🔭', category: 'tower', maxLevel: 10, baseEffect: 10, effectPerLevel: 4, baseCost: 380, costMultiplier: 1.6, description: 'The highest point in the manor, where astronomers chart noble destinies.' },
  { id: 'str_bell_tower', name: 'Crimson Bell Tower', emoji: '🔔', category: 'tower', maxLevel: 10, baseEffect: 8, effectPerLevel: 3, baseCost: 280, costMultiplier: 1.6, description: 'Its crimson bell\'s toll can be heard across the entire estate and beyond.' },
  { id: 'str_alchemy_tower', name: 'Golden Alchemy Tower', emoji: '⚗️', category: 'tower', maxLevel: 10, baseEffect: 14, effectPerLevel: 5, baseCost: 520, costMultiplier: 1.7, description: 'Where alchemists transmute base materials into golden luxury goods.' },
  { id: 'str_sentinel_tower', name: 'Ivory Sentinel Tower', emoji: '🗼', category: 'tower', maxLevel: 10, baseEffect: 16, effectPerLevel: 6, baseCost: 650, costMultiplier: 1.8, description: 'The sentinel tower whose ivory light warns of approaching threats to the manor.' },
];

// ============================================================================
// SECTION 8: RW_ABILITIES — 22 Manor Abilities
// ============================================================================

export const RW_ABILITIES: readonly RwAbilityDef[] = [
  // Rose Knight abilities (3)
  { id: 'ab_thorn_lunge', name: 'Thorn Lunge', emoji: '🗡️', nobleType: 'rose_knight', abilityType: 'active', rarity: 'common', energyCost: 10, cooldown: 2, power: 15, description: 'A piercing lunge that damages rival estate defenses with thorn-like precision.' },
  { id: 'ab_rose_bloom', name: 'Rose Bloom Aura', emoji: '🌸', nobleType: 'rose_knight', abilityType: 'passive', rarity: 'rare', energyCost: 0, cooldown: 0, power: 20, description: 'Passive aura that regenerates allied noble morale over time like blooming roses.' },
  { id: 'ab_crimson_charge', name: 'Crimson Charge', emoji: '🐎', nobleType: 'rose_knight', abilityType: 'active', rarity: 'epic', energyCost: 25, cooldown: 4, power: 45, description: 'An unstoppable cavalry charge that breaks through any defensive formation.' },

  // Velvet Duke abilities (3)
  { id: 'ab_velvet_drape', name: 'Velvet Draping', emoji: '🎭', nobleType: 'velvet_duke', abilityType: 'active', rarity: 'common', energyCost: 8, cooldown: 1, power: 10, description: 'Drapes the battlefield in velvet, reducing enemy accuracy and charm.' },
  { id: 'ab_silk_charm', name: 'Silk Charm Weave', emoji: '🕸️', nobleType: 'velvet_duke', abilityType: 'passive', rarity: 'uncommon', energyCost: 0, cooldown: 0, power: 15, description: 'Weaves invisible silk threads that subtly manipulate negotiations in your favor.' },
  { id: 'ab_velvet_domination', name: 'Velvet Domination', emoji: '👑', nobleType: 'velvet_duke', abilityType: 'active', rarity: 'legendary', energyCost: 35, cooldown: 6, power: 70, description: 'Commanding presence that forces all rivals to kneel before your elegance.' },

  // Amber Baroness abilities (3)
  { id: 'ab_amber_shield', name: 'Amber Shield', emoji: '🛡️', nobleType: 'amber_baroness', abilityType: 'active', rarity: 'common', energyCost: 12, cooldown: 2, power: 18, description: 'Summons a shield of hardened amber that absorbs incoming damage.' },
  { id: 'ab_golden_touch', name: 'Golden Touch', emoji: '✨', nobleType: 'amber_baroness', abilityType: 'passive', rarity: 'rare', energyCost: 0, cooldown: 0, power: 25, description: 'Every resource gathered gains a bonus percentage of pure gold value.' },
  { id: 'ab_fossil_awakening', name: 'Fossil Awakening', emoji: '🦴', nobleType: 'amber_baroness', abilityType: 'active', rarity: 'epic', energyCost: 30, cooldown: 5, power: 55, description: 'Awakens ancient creatures trapped in amber fossils to fight alongside you.' },

  // Jade Countess abilities (3)
  { id: 'ab_jade_heal', name: 'Jade Restoration', emoji: '💚', nobleType: 'jade_countess', abilityType: 'active', rarity: 'common', energyCost: 10, cooldown: 2, power: 16, description: 'Channels jade energy to heal wounded nobles and restore their vitality.' },
  { id: 'ab_emerald_sight', name: 'Emerald Foresight', emoji: '👁️', nobleType: 'jade_countess', abilityType: 'passive', rarity: 'uncommon', energyCost: 0, cooldown: 0, power: 18, description: 'Grants visions of upcoming events, allowing better preparation for manor challenges.' },
  { id: 'ab_jade_empire', name: 'Jade Empire Blessing', emoji: '🏯', nobleType: 'jade_countess', abilityType: 'active', rarity: 'legendary', energyCost: 40, cooldown: 7, power: 80, description: 'Blesses the entire manor with jade energy, boosting all noble stats for a duration.' },

  // Ivory Lord abilities (3)
  { id: 'ab_ivory_flash', name: 'Ivory Flash', emoji: '⚡', nobleType: 'ivory_lord', abilityType: 'active', rarity: 'uncommon', energyCost: 14, cooldown: 2, power: 22, description: 'A blinding flash of ivory light that disorients all enemies on the field.' },
  { id: 'ab_bone_fortress', name: 'Bone Fortress', emoji: '🏰', nobleType: 'ivory_lord', abilityType: 'active', rarity: 'rare', energyCost: 20, cooldown: 3, power: 35, description: 'Raises an impenetrable fortress of interlocking ivory bones around your position.' },
  { id: 'ab_ivory_apotheosis', name: 'Ivory Apotheosis', emoji: '👼', nobleType: 'ivory_lord', abilityType: 'active', rarity: 'epic', energyCost: 28, cooldown: 5, power: 60, description: 'Transforms into an ivory being of pure light, gaining temporary invulnerability.' },

  // Sapphire Duchess abilities (3)
  { id: 'ab_sapphire_beam', name: 'Sapphire Beam', emoji: '💎', nobleType: 'sapphire_duchess', abilityType: 'active', rarity: 'uncommon', energyCost: 12, cooldown: 2, power: 20, description: 'Fires a concentrated beam of sapphire energy that cuts through defenses.' },
  { id: 'ab_azure_waters', name: 'Azure Tide', emoji: '🌊', nobleType: 'sapphire_duchess', abilityType: 'active', rarity: 'rare', energyCost: 22, cooldown: 3, power: 38, description: 'Summons a tidal wave of azure waters that sweeps enemies off their feet.' },
  { id: 'ab_deep_blue_domination', name: 'Deep Blue Dominion', emoji: '🌀', nobleType: 'sapphire_duchess', abilityType: 'passive', rarity: 'legendary', energyCost: 0, cooldown: 0, power: 75, description: 'Commands the deep ocean forces, granting control over all water-based elements.' },

  // Crimson Earl abilities (3)
  { id: 'ab_crimson_strike', name: 'Crimson Strike', emoji: '🩸', nobleType: 'crimson_earl', abilityType: 'active', rarity: 'common', energyCost: 10, cooldown: 2, power: 17, description: 'A swift strike imbued with crimson energy that leaves wounds that won\'t close.' },
  { id: 'ab_scarlet_fury', name: 'Scarlet Fury', emoji: '😈', nobleType: 'crimson_earl', abilityType: 'active', rarity: 'epic', energyCost: 26, cooldown: 4, power: 50, description: 'Enters a state of scarlet fury, doubling attack power at the cost of defense.' },
  { id: 'ab_blood_pact', name: 'Blood Pact', emoji: '📜', nobleType: 'crimson_earl', abilityType: 'passive', rarity: 'legendary', energyCost: 0, cooldown: 0, power: 65, description: 'A pact with the crimson bloodline that grants power proportional to damage taken.' },

  // Universal abilities (1)
  { id: 'ab_manor_rally', name: 'Manor Rally Cry', emoji: '📯', nobleType: 'rose_knight', abilityType: 'active', rarity: 'rare', energyCost: 18, cooldown: 3, power: 30, description: 'Rallies all manor nobles, temporarily boosting their collective morale and output.' },
];

// ============================================================================
// SECTION 9: RW_ACHIEVEMENTS — 18 Achievements
// ============================================================================

export const RW_ACHIEVEMENTS: readonly RwAchievementDef[] = [
  { id: 'ach_first_noble', name: 'First Recruit', emoji: '🎖️', description: 'Recruit your first noble into the Rosewood Manor.', condition: 'Recruit 1 noble', rewardGold: 100, rewardRenown: 10 },
  { id: 'ach_five_nobles', name: 'Noble Gathering', emoji: '👥', description: 'Assemble a court of five nobles.', condition: 'Recruit 5 nobles', rewardGold: 300, rewardRenown: 30 },
  { id: 'ach_ten_nobles', name: 'Grand Assembly', emoji: '🏛️', description: 'Gather ten nobles under one roof.', condition: 'Recruit 10 nobles', rewardGold: 600, rewardRenown: 60 },
  { id: 'ach_all_types', name: 'Complete Court', emoji: '🎨', description: 'Recruit at least one noble of every type.', condition: 'Have all 7 noble types', rewardGold: 1000, rewardRenown: 100 },
  { id: 'ach_first_structure', name: 'Foundation Stone', emoji: '🧱', description: 'Build your first manor structure.', condition: 'Build 1 structure', rewardGold: 80, rewardRenown: 15 },
  { id: 'ach_ten_structures', name: 'Building Spree', emoji: '🏗️', description: 'Construct ten structures across the manor.', condition: 'Build 10 structures', rewardGold: 800, rewardRenown: 80 },
  { id: 'ach_max_upgrade', name: 'Peak Perfection', emoji: '⬆️', description: 'Upgrade any structure to its maximum level.', condition: 'Max level any structure', rewardGold: 500, rewardRenown: 50 },
  { id: 'ach_first_artifact', name: 'Artifact Unearthed', emoji: '🏺', description: 'Activate your first manor artifact.', condition: 'Activate 1 artifact', rewardGold: 200, rewardRenown: 25 },
  { id: 'ach_five_artifacts', name: 'Treasure Hoard', emoji: '💰', description: 'Collect and activate five artifacts.', condition: 'Activate 5 artifacts', rewardGold: 1000, rewardRenown: 100 },
  { id: 'ach_ten_artifacts', name: 'Legendary Collection', emoji: '👑', description: 'Assemble a collection of ten activated artifacts.', condition: 'Activate 10 artifacts', rewardGold: 3000, rewardRenown: 250 },
  { id: 'ach_first_event', name: 'Eventful Day', emoji: '📅', description: 'Trigger your first manor event.', condition: 'Trigger 1 event', rewardGold: 50, rewardRenown: 10 },
  { id: 'ach_twenty_events', name: 'Event Veteran', emoji: '🎪', description: 'Experience twenty different manor events.', condition: 'Trigger 20 events', rewardGold: 1500, rewardRenown: 150 },
  { id: 'ach_renown_500', name: 'Rising Renown', emoji: '⭐', description: 'Reach 500 total renown.', condition: 'Earn 500 renown', rewardGold: 500, rewardRenown: 0 },
  { id: 'ach_renown_2000', name: 'Famous Estate', emoji: '🌟', description: 'Reach 2000 total renown.', condition: 'Earn 2000 renown', rewardGold: 2000, rewardRenown: 0 },
  { id: 'ach_gold_5000', name: 'Wealthy Manor', emoji: '🤑', description: 'Accumulate 5000 gold at once.', condition: 'Have 5000 gold', rewardGold: 0, rewardRenown: 200 },
  { id: 'ach_streak_five', name: 'Hot Streak', emoji: '🔥', description: 'Maintain a streak of five successful actions.', condition: '5 action streak', rewardGold: 250, rewardRenown: 30 },
  { id: 'ach_streak_twenty', name: 'Unstoppable', emoji: '💥', description: 'Maintain a streak of twenty successful actions.', condition: '20 action streak', rewardGold: 2000, rewardRenown: 200 },
  { id: 'ach_all_estates', name: 'Estate Magnate', emoji: '🌍', description: 'Unlock all eight estate locations.', condition: 'Unlock all estates', rewardGold: 5000, rewardRenown: 500 },
];

// ============================================================================
// SECTION 10: RW_TITLES — 8 Titles
// ============================================================================

export const RW_TITLES: readonly RwTitleDef[] = [
  { id: 'rw_title_steward', name: 'Manor Steward', emoji: '🔑', minRenown: 0, minNobles: 0, description: 'The humble steward who tends the rosewood halls with quiet dedication.' },
  { id: 'rw_title_chamberlain', name: 'Chief Chamberlain', emoji: '📜', minRenown: 50, minNobles: 2, description: 'The chief chamberlain who manages the daily affairs of the growing estate.' },
  { id: 'rw_title_castellan', name: 'Castellan', emoji: '🏰', minRenown: 150, minNobles: 4, description: 'The castellan who commands the manor defenses and maintains order.' },
  { id: 'rw_title_lord', name: 'Lord of Rosewood', emoji: '🌺', minRenown: 350, minNobles: 6, description: 'A true lord whose name is spoken with respect throughout the realm.' },
  { id: 'rw_title_baron', name: 'Baron of Crimson Vale', emoji: '🎭', minRenown: 600, minNobles: 10, description: 'The baron who rules the fertile Crimson Vale from their manor seat.' },
  { id: 'rw_title_viscount', name: 'Viscount of Amber Heights', emoji: '🌟', minRenown: 1000, minNobles: 15, description: 'The viscount whose amber-height estates command views of three provinces.' },
  { id: 'rw_title_marquis', name: 'Marquis of Ivory Reach', emoji: '👑', minRenown: 1800, minNobles: 20, description: 'The marquis whose ivory reach extends across the entire northern territories.' },
  { id: 'rw_title_duke', name: 'Duke of Rosewood Manor', emoji: '⚜️', minRenown: 3000, minNobles: 30, description: 'The supreme duke who has elevated Rosewood Manor to legendary status.' },
];

// ============================================================================
// SECTION 11: RW_ARTIFACTS — 15 Manor Artifacts
// ============================================================================

export const RW_ARTIFACTS: readonly RwArtifactDef[] = [
  { id: 'art_rosewood_signet', name: 'Rosewood Signet Ring', emoji: '💍', rarity: 'common', description: 'A simple signet ring carved from rosewood, bearing the manor crest.', power: 5, cost: 80, lore: 'Every steward receives one upon taking office.' },
  { id: 'art_crimson_key', name: 'Crimson Master Key', emoji: '🔑', rarity: 'common', description: 'A master key that opens every lock within the manor walls.', power: 6, cost: 100, lore: 'Forged by the first locksmith of Rosewood Manor.' },
  { id: 'art_velvet_gloves', name: 'Velvet Dueling Gloves', emoji: '🧤', rarity: 'common', description: 'Gloves of fine crimson velvet worn during manor duels.', power: 4, cost: 70, lore: 'Slapping someone with these gloves is a formal challenge.' },
  { id: 'art_amber_pendant', name: 'Amber Heart Pendant', emoji: '🔶', rarity: 'uncommon', description: 'A pendant containing a perfectly preserved ancient flower in amber.', power: 15, cost: 280, lore: 'The flower inside is from a species now extinct.' },
  { id: 'art_jade_chess_set', name: 'Jade Noble Chess Set', emoji: '♟️', rarity: 'uncommon', description: 'A complete chess set carved from different shades of jade.', power: 18, cost: 320, lore: 'Each piece represents a legendary noble from manor history.' },
  { id: 'art_silver_candelabra', name: 'Silver Rose Candelabra', emoji: '🕯️', rarity: 'uncommon', description: 'A seven-branched candelabra shaped like a blooming rose tree.', power: 14, cost: 250, lore: 'Its candles never extinguish, even in the strongest wind.' },
  { id: 'art_ivory_crown_shard', name: 'Ivory Crown Shard', emoji: '👑', rarity: 'rare', description: 'A fragment of the original Ivory Crown of the first manor lord.', power: 35, cost: 700, lore: 'When assembled with the other shards, it grants incredible power.' },
  { id: 'art_crimson_blade', name: 'Crimson Edge Blade', emoji: '⚔️', rarity: 'rare', description: 'A blade forged from crimson steel that never dulls.', power: 40, cost: 800, lore: 'It has tasted the blood of a hundred rival estate champions.' },
  { id: 'art_golden_hourglass', name: 'Golden Hourglass', emoji: '⏳', rarity: 'rare', description: 'An hourglass of pure gold whose sand flows upward.', power: 30, cost: 650, lore: 'Time flows differently near it — one hour feels like minutes.' },
  { id: 'art_velvet_throne_cushion', name: 'Velvet Throne Cushion', emoji: '🪑', rarity: 'epic', description: 'A cushion of enchanted velvet that grants wisdom to whoever sits on it.', power: 60, cost: 2000, lore: 'Woven from threads harvested by moonlight spiders.' },
  { id: 'art_amber_dragon_statue', name: 'Amber Dragon Statue', emoji: '🐉', rarity: 'epic', description: 'A life-sized dragon statue carved from a single massive amber block.', power: 70, cost: 2500, lore: 'Some say the dragon within is merely sleeping, not carved.' },
  { id: 'art_sapphire_grimoire', name: 'Sapphire Grimoire', emoji: '📖', rarity: 'epic', description: 'A grimoire bound in sapphire-crusted leather, filled with manor spells.', power: 55, cost: 1800, lore: 'Only the manor lord can read its shifting magical text.' },
  { id: 'art_roots_of_rosewood', name: 'Roots of Rosewood', emoji: '🌳', rarity: 'legendary', description: 'The literal roots of the ancestral rosewood tree, pulsing with life.', power: 100, cost: 8000, lore: 'Planted by the founder\'s own hands a millennium ago.' },
  { id: 'art_crown_of_thorns_gold', name: 'Crown of Golden Thorns', emoji: '⚜️', rarity: 'legendary', description: 'A crown of pure gold shaped like rose thorns, both beautiful and dangerous.', power: 120, cost: 10000, lore: 'To wear it is to accept both glory and suffering.' },
  { id: 'art_heart_of_manor', name: 'Heart of the Manor', emoji: '❤️', rarity: 'legendary', description: 'A crystallized heart of rosewood essence that sustains the entire estate.', power: 150, cost: 15000, lore: 'If it ever stops beating, the manor will crumble to dust.' },
];

// ============================================================================
// SECTION 12: RW_EVENTS — 12 Manor Events
// ============================================================================

export const RW_EVENTS: readonly RwEventDef[] = [
  { id: 'evt_noble_ball', name: 'Grand Noble Ball', emoji: '💃', durationTurns: 3, effectType: 'buff', effectDescription: 'All nobles gain +10 elegance for the duration.', description: 'A grand ball is held in the main hall, attracting nobles from across the realm.' },
  { id: 'evt_amber_meteor', name: 'Amber Meteor Shower', emoji: '☄️', durationTurns: 2, effectType: 'buff', effectDescription: 'Double material collection for 2 turns.', description: 'A shower of amber-rich meteors rains upon the manor gardens.' },
  { id: 'evt_velvet_plague', name: 'Velvet Moth Plague', emoji: '🦋', durationTurns: 3, effectType: 'debuff', effectDescription: 'All fabric materials lose 20% value.', description: 'Hungry velvet moths descend upon the manor, devouring precious fabrics.' },
  { id: 'evt_jade_spring', name: 'Jade Spring Awakening', emoji: '💧', durationTurns: 4, effectType: 'buff', effectDescription: 'All nobles gain +15 prestige.', description: 'An ancient jade spring beneath the manor surges to life, blessing all who drink.' },
  { id: 'evt_ghost_banquet', name: 'Ghost Banquet', emoji: '👻', durationTurns: 2, effectType: 'special', effectDescription: 'Random noble receives +30 influence or loses 20 influence.', description: 'Ghostly apparitions hold a banquet, offering deals to the living nobles.' },
  { id: 'evt_crimson_storm', name: 'Crimson Thunderstorm', emoji: '⛈️', durationTurns: 2, effectType: 'debuff', effectDescription: 'Cannot build or upgrade structures for 2 turns.', description: 'A violent crimson-tinged storm batters the manor, halting all construction.' },
  { id: 'evt_merchant_caravan', name: 'Exotic Merchant Caravan', emoji: '🐪', durationTurns: 3, effectType: 'buff', effectDescription: 'All material costs reduced by 30%.', description: 'A wealthy merchant caravan arrives with rare goods at bargain prices.' },
  { id: 'evt_ivory_fog', name: 'Ivory Mist Enchantment', emoji: '🌫️', durationTurns: 3, effectType: 'buff', effectDescription: 'Artifact activation costs halved.', description: 'A mysterious ivory mist rolls through the manor, amplifying magical artifacts.' },
  { id: 'evt_rival_siege', name: 'Rival Estate Siege', emoji: '🏹', durationTurns: 3, effectType: 'debuff', effectDescription: 'Lose 5% gold each turn until repelled.', description: 'A rival estate launches a siege, cutting off supply lines and draining gold.' },
  { id: 'evt_sapphire_eclipse', name: 'Sapphire Lunar Eclipse', emoji: '🌓', durationTurns: 2, effectType: 'special', effectDescription: 'Gain 200 renown or lose 100 renown randomly.', description: 'A rare sapphire lunar eclipse occurs, its cosmic energy bringing fortune or ruin.' },
  { id: 'evt_rose_bloom_festival', name: 'Rose Bloom Festival', emoji: '🌷', durationTurns: 5, effectType: 'buff', effectDescription: 'Recruitment costs reduced by 40%.', description: 'The annual Rose Bloom Festival attracts aspiring nobles seeking to join the manor.' },
  { id: 'evt_ancient_vault', name: 'Ancient Vault Discovery', emoji: ' Treasury', durationTurns: 1, effectType: 'special', effectDescription: 'Gain 500-2000 gold instantly.', description: 'Miners discover an ancient vault beneath the cellar filled with forgotten gold.' },
];

// ============================================================================
// SECTION 13: RW_RARITY_CONFIG — Rarity Tier Configuration
// ============================================================================

export const RW_RARITY_CONFIG: readonly {
  readonly rarity: RwRarity;
  readonly label: string;
  readonly emoji: string;
  readonly color: string;
  readonly recruitChance: number;
  readonly statMultiplier: number;
}[] = [
  { rarity: 'common', label: 'Common', emoji: '⚪', color: '#9CA3AF', recruitChance: 50, statMultiplier: 1.0 },
  { rarity: 'uncommon', label: 'Uncommon', emoji: '🟢', color: '#22C55E', recruitChance: 30, statMultiplier: 1.5 },
  { rarity: 'rare', label: 'Rare', emoji: '🔵', color: '#3B82F6', recruitChance: 14, statMultiplier: 2.0 },
  { rarity: 'epic', label: 'Epic', emoji: '🟣', color: '#A855F7', recruitChance: 5, statMultiplier: 3.0 },
  { rarity: 'legendary', label: 'Legendary', emoji: '🟡', color: '#EAB308', recruitChance: 1, statMultiplier: 5.0 },
];

// ============================================================================
// SECTION 14: HELPER FUNCTIONS
// ============================================================================

function rwGenerateId(): string {
  return `rw_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function rwCreateInitialState(): RwManorState {
  return {
    nobles: [],
    estates: ['estate_main_hall'],
    inventory: [],
    structures: [],
    abilities: [],
    artifacts: [],
    achievements: [],
    activeTitle: 'rw_title_steward',
    gold: 500,
    renown: 0,
    activeEvent: null,
    eventTurnsRemaining: 0,
    stats: {
      totalRecruited: 0,
      totalBuilt: 0,
      totalArtifactsActivated: 0,
      totalEventsTriggered: 0,
      totalRenownEarned: 0,
      totalGoldSpent: 0,
      totalStructuresUpgraded: 0,
      currentStreak: 0,
      bestStreak: 0,
    },
  };
}

function rwGetUpgradeCost(structure: RwStructureDef, currentLevel: number): number {
  if (currentLevel >= structure.maxLevel) return 0;
  let cost = structure.baseCost;
  for (let i = 0; i < currentLevel; i++) {
    cost = Math.floor(cost * structure.costMultiplier);
  }
  return cost;
}

function rwStructureEffect(structure: RwStructureDef, level: number): number {
  return structure.baseEffect + structure.effectPerLevel * level;
}

// ============================================================================
// SECTION 15: MAIN HOOK — useRosewoodManor
// ============================================================================

export default function useRosewoodManor() {
  const [state, setState] = useState<RwManorState>(() => rwCreateInitialState());

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ---- COMPUTED VALUES (useMemo, deps include `state`) ----

  const rwTotalPrestige = useMemo((): number => {
    return state.nobles.reduce((sum, n) => sum + n.prestige, 0);
  }, [state]);

  const rwTotalElegance = useMemo((): number => {
    return state.nobles.reduce((sum, n) => sum + n.elegance, 0);
  }, [state]);

  const rwTotalInfluence = useMemo((): number => {
    return state.nobles.reduce((sum, n) => sum + n.influence, 0);
  }, [state]);

  const rwTotalStructurePower = useMemo((): number => {
    let total = 0;
    for (const inst of state.structures) {
      const def = RW_STRUCTURES.find(s => s.id === inst.structureDefId);
      if (def) {
        total += rwStructureEffect(def, inst.level);
      }
    }
    return total;
  }, [state]);

  const rwManorPower = useMemo((): number => {
    return rwTotalPrestige + rwTotalElegance + rwTotalInfluence + rwTotalStructurePower;
  }, [rwTotalPrestige, rwTotalElegance, rwTotalInfluence, rwTotalStructurePower]);

  const rwNobleCount = useMemo((): number => {
    return state.nobles.length;
  }, [state]);

  const rwStructureCount = useMemo((): number => {
    return state.structures.length;
  }, [state]);

  const rwArtifactCount = useMemo((): number => {
    return state.artifacts.length;
  }, [state]);

  const rwAchievementCount = useMemo((): number => {
    return state.achievements.length;
  }, [state]);

  const rwCurrentTitle = useMemo((): RwTitleDef => {
    let title = RW_TITLES[0];
    for (const t of RW_TITLES) {
      if (state.renown >= t.minRenown && state.nobles.length >= t.minNobles) {
        title = t;
      }
    }
    return title;
  }, [state]);

  const rwUnlockedEstates = useMemo((): RwEstateDef[] => {
    return RW_ESTATES.filter(e => state.estates.includes(e.id));
  }, [state]);

  const rwLockedEstates = useMemo((): RwEstateDef[] => {
    return RW_ESTATES.filter(e => !state.estates.includes(e.id));
  }, [state]);

  const rwNextEstate = useMemo((): RwEstateDef | null => {
    for (const e of RW_ESTATES) {
      if (!state.estates.includes(e.id)) return e;
    }
    return null;
  }, [state]);

  const rwHasActiveEvent = useMemo((): boolean => {
    return state.activeEvent !== null;
  }, [state]);

  const rwUnlockedAchievements = useMemo((): RwAchievementDef[] => {
    return RW_ACHIEVEMENTS.filter(a => state.achievements.includes(a.id));
  }, [state]);

  const rwLockedAchievements = useMemo((): RwAchievementDef[] => {
    return RW_ACHIEVEMENTS.filter(a => !state.achievements.includes(a.id));
  }, [state]);

  const rwActivatedAbilities = useMemo((): RwAbilityDef[] => {
    return RW_ABILITIES.filter(a => state.abilities.includes(a.id));
  }, [state]);

  const rwAvailableAbilities = useMemo((): RwAbilityDef[] => {
    return RW_ABILITIES.filter(a => !state.abilities.includes(a.id));
  }, [state]);

  const rwCollectedArtifacts = useMemo((): RwArtifactDef[] => {
    return RW_ARTIFACTS.filter(a => state.artifacts.includes(a.id));
  }, [state]);

  const rwUncollectedArtifacts = useMemo((): RwArtifactDef[] => {
    return RW_ARTIFACTS.filter(a => !state.artifacts.includes(a.id));
  }, [state]);

  // ---- EFFECT: Auto-check title advancement ----

  useEffect(() => {
    const bestTitle = RW_TITLES[RW_TITLES.length - 1];
    for (const t of RW_TITLES) {
      if (state.renown >= t.minRenown && state.nobles.length >= t.minNobles) {
        if (t.minRenown > bestTitle.minRenown || (t.minRenown === bestTitle.minRenown && t.minNobles > bestTitle.minNobles)) {
          continue;
        }
      }
    }
    if (stateRef.current.activeTitle !== rwCurrentTitle.id) {
      setState(prev => ({ ...prev, activeTitle: rwCurrentTitle.id }));
    }
  }, [state, rwCurrentTitle]);

  // ---- ACTIONS ----

  const recruitNoble = useCallback((nobleDefId: string): RwNobleInstance | null => {
    const def = RW_NOBLES.find(n => n.id === nobleDefId);
    if (!def) return null;
    if (stateRef.current.gold < def.recruitCost) return null;
    if (stateRef.current.nobles.length >= 35) return null;

    const instance: RwNobleInstance = {
      id: rwGenerateId(),
      nobleDefId: def.id,
      name: def.name,
      level: 1,
      xp: 0,
      prestige: def.prestige,
      elegance: def.elegance,
      influence: def.influence,
      wealth: def.wealth,
      recruitedAt: Date.now(),
    };

    setState(prev => ({
      ...prev,
      gold: prev.gold - def.recruitCost,
      nobles: [...prev.nobles, instance],
      stats: {
        ...prev.stats,
        totalRecruited: prev.stats.totalRecruited + 1,
        totalGoldSpent: prev.stats.totalGoldSpent + def.recruitCost,
        currentStreak: prev.stats.currentStreak + 1,
        bestStreak: Math.max(prev.stats.bestStreak, prev.stats.currentStreak + 1),
      },
    }));

    return instance;
  }, []);

  const manageEstate = useCallback((estateId: string): boolean => {
    const estate = RW_ESTATES.find(e => e.id === estateId);
    if (!estate) return false;
    if (stateRef.current.estates.includes(estateId)) return false;
    if (stateRef.current.renown < estate.unlockRenown) return false;

    setState(prev => ({
      ...prev,
      estates: [...prev.estates, estateId],
      renown: prev.renown - estate.unlockRenown,
    }));

    return true;
  }, []);

  const buildStructure = useCallback((structureDefId: string, upgrade: boolean = false): boolean => {
    const def = RW_STRUCTURES.find(s => s.id === structureDefId);
    if (!def) return false;

    const existing = stateRef.current.structures.find(s => s.structureDefId === structureDefId);

    if (upgrade && existing) {
      if (existing.level >= def.maxLevel) return false;
      const cost = rwGetUpgradeCost(def, existing.level);
      if (stateRef.current.gold < cost) return false;

      setState(prev => ({
        ...prev,
        gold: prev.gold - cost,
        structures: prev.structures.map(s =>
          s.id === existing.id ? { ...s, level: s.level + 1 } : s
        ),
        stats: {
          ...prev.stats,
          totalGoldSpent: prev.stats.totalGoldSpent + cost,
          totalStructuresUpgraded: prev.stats.totalStructuresUpgraded + 1,
          currentStreak: prev.stats.currentStreak + 1,
          bestStreak: Math.max(prev.stats.bestStreak, prev.stats.currentStreak + 1),
        },
      }));

      return true;
    }

    if (existing) return false;
    if (stateRef.current.gold < def.baseCost) return false;

    const instance: RwStructureInstance = {
      id: rwGenerateId(),
      structureDefId: def.id,
      level: 1,
      builtAt: Date.now(),
    };

    setState(prev => ({
      ...prev,
      gold: prev.gold - def.baseCost,
      structures: [...prev.structures, instance],
      stats: {
        ...prev.stats,
        totalBuilt: prev.stats.totalBuilt + 1,
        totalGoldSpent: prev.stats.totalGoldSpent + def.baseCost,
        currentStreak: prev.stats.currentStreak + 1,
        bestStreak: Math.max(prev.stats.bestStreak, prev.stats.currentStreak + 1),
      },
    }));

    return true;
  }, []);

  const activateArtifact = useCallback((artifactId: string): boolean => {
    const def = RW_ARTIFACTS.find(a => a.id === artifactId);
    if (!def) return false;
    if (stateRef.current.artifacts.includes(artifactId)) return false;
    if (stateRef.current.gold < def.cost) return false;

    setState(prev => ({
      ...prev,
      gold: prev.gold - def.cost,
      artifacts: [...prev.artifacts, artifactId],
      stats: {
        ...prev.stats,
        totalArtifactsActivated: prev.stats.totalArtifactsActivated + 1,
        totalGoldSpent: prev.stats.totalGoldSpent + def.cost,
        currentStreak: prev.stats.currentStreak + 1,
        bestStreak: Math.max(prev.stats.bestStreak, prev.stats.currentStreak + 1),
      },
    }));

    return true;
  }, []);

  const triggerManorEvent = useCallback((): RwEventDef | null => {
    if (stateRef.current.activeEvent !== null) return null;

    const event = RW_EVENTS[Math.floor(Math.random() * RW_EVENTS.length)];

    setState(prev => ({
      ...prev,
      activeEvent: event,
      eventTurnsRemaining: event.durationTurns,
      stats: {
        ...prev.stats,
        totalEventsTriggered: prev.stats.totalEventsTriggered + 1,
      },
    }));

    if (event.effectType === 'buff') {
      const renownGain = 10 + Math.floor(Math.random() * 20);
      setState(prev => ({
        ...prev,
        renown: prev.renown + renownGain,
        stats: {
          ...prev.stats,
          totalRenownEarned: prev.stats.totalRenownEarned + renownGain,
        },
      }));
    }

    if (event.effectType === 'debuff') {
      const goldLoss = Math.floor(stateRef.current.gold * 0.05);
      setState(prev => ({
        ...prev,
        gold: Math.max(0, prev.gold - goldLoss),
        stats: {
          ...prev.stats,
          currentStreak: 0,
        },
      }));
    }

    return event;
  }, []);

  const advanceEvent = useCallback((): RwEventDef | null => {
    if (stateRef.current.activeEvent === null) return null;
    if (stateRef.current.eventTurnsRemaining <= 1) {
      setState(prev => ({
        ...prev,
        activeEvent: null,
        eventTurnsRemaining: 0,
      }));
      return null;
    }

    setState(prev => ({
      ...prev,
      eventTurnsRemaining: prev.eventTurnsRemaining - 1,
    }));

    return stateRef.current.activeEvent;
  }, []);

  const resetRosewoodManor = useCallback((): void => {
    setState(rwCreateInitialState());
  }, []);

  // ---- STATE ACCESSORS ----

  const rwGetState = useCallback((): RwManorState => {
    return stateRef.current;
  }, []);

  const rwGetNobleDef = useCallback((nobleDefId: string): RwNobleDef | null => {
    return RW_NOBLES.find(n => n.id === nobleDefId) ?? null;
  }, []);

  const rwGetNoblesByType = useCallback((nobleType: RwNobleType): RwNobleDef[] => {
    return RW_NOBLES.filter(n => n.nobleType === nobleType);
  }, []);

  const rwGetNoblesByRarity = useCallback((rarity: RwRarity): RwNobleDef[] => {
    return RW_NOBLES.filter(n => n.rarity === rarity);
  }, []);

  const rwGetStructureDef = useCallback((structureDefId: string): RwStructureDef | null => {
    return RW_STRUCTURES.find(s => s.id === structureDefId) ?? null;
  }, []);

  const rwGetStructuresByCategory = useCallback((category: RwStructureCategory): RwStructureDef[] => {
    return RW_STRUCTURES.filter(s => s.category === category);
  }, []);

  const rwGetUpgradeCostForStructure = useCallback((structureDefId: string): number => {
    const def = RW_STRUCTURES.find(s => s.id === structureDefId);
    if (!def) return 0;
    const existing = stateRef.current.structures.find(s => s.structureDefId === structureDefId);
    const currentLevel = existing ? existing.level : 0;
    return rwGetUpgradeCost(def, currentLevel);
  }, []);

  const rwGetMaterialDef = useCallback((materialId: string): RwMaterialDef | null => {
    return RW_MATERIALS.find(m => m.id === materialId) ?? null;
  }, []);

  const rwGetMaterialsByType = useCallback((type: RwMaterialType): RwMaterialDef[] => {
    return RW_MATERIALS.filter(m => m.type === type);
  }, []);

  const rwGetMaterialsByRarity = useCallback((rarity: RwRarity): RwMaterialDef[] => {
    return RW_MATERIALS.filter(m => m.rarity === rarity);
  }, []);

  const rwGetArtifactDef = useCallback((artifactId: string): RwArtifactDef | null => {
    return RW_ARTIFACTS.find(a => a.id === artifactId) ?? null;
  }, []);

  const rwGetArtifactsByRarity = useCallback((rarity: RwRarity): RwArtifactDef[] => {
    return RW_ARTIFACTS.filter(a => a.rarity === rarity);
  }, []);

  const rwGetAbilityDef = useCallback((abilityId: string): RwAbilityDef | null => {
    return RW_ABILITIES.find(a => a.id === abilityId) ?? null;
  }, []);

  const rwGetAchievementDef = useCallback((achievementId: string): RwAchievementDef | null => {
    return RW_ACHIEVEMENTS.find(a => a.id === achievementId) ?? null;
  }, []);

  const rwGetEstateDef = useCallback((estateId: string): RwEstateDef | null => {
    return RW_ESTATES.find(e => e.id === estateId) ?? null;
  }, []);

  const rwCanRecruit = useCallback((nobleDefId: string): boolean => {
    const def = RW_NOBLES.find(n => n.id === nobleDefId);
    if (!def) return false;
    if (stateRef.current.gold < def.recruitCost) return false;
    if (stateRef.current.nobles.length >= 35) return false;
    return true;
  }, []);

  const rwCanBuild = useCallback((structureDefId: string): boolean => {
    const def = RW_STRUCTURES.find(s => s.id === structureDefId);
    if (!def) return false;
    const existing = stateRef.current.structures.find(s => s.structureDefId === structureDefId);
    if (existing) return false;
    if (stateRef.current.gold < def.baseCost) return false;
    return true;
  }, []);

  const rwCanUpgrade = useCallback((structureDefId: string): boolean => {
    const def = RW_STRUCTURES.find(s => s.id === structureDefId);
    if (!def) return false;
    const existing = stateRef.current.structures.find(s => s.structureDefId === structureDefId);
    if (!existing) return false;
    if (existing.level >= def.maxLevel) return false;
    const cost = rwGetUpgradeCost(def, existing.level);
    if (stateRef.current.gold < cost) return false;
    return true;
  }, []);

  const rwCanActivateArtifact = useCallback((artifactId: string): boolean => {
    const def = RW_ARTIFACTS.find(a => a.id === artifactId);
    if (!def) return false;
    if (stateRef.current.artifacts.includes(artifactId)) return false;
    if (stateRef.current.gold < def.cost) return false;
    return true;
  }, []);

  const rwCanUnlockEstate = useCallback((estateId: string): boolean => {
    const estate = RW_ESTATES.find(e => e.id === estateId);
    if (!estate) return false;
    if (stateRef.current.estates.includes(estateId)) return false;
    if (stateRef.current.renown < estate.unlockRenown) return false;
    return true;
  }, []);

  const rwAddGold = useCallback((amount: number): void => {
    setState(prev => ({
      ...prev,
      gold: prev.gold + amount,
    }));
  }, []);

  const rwSpendGold = useCallback((amount: number): boolean => {
    if (stateRef.current.gold < amount) return false;
    setState(prev => ({
      ...prev,
      gold: prev.gold - amount,
      stats: {
        ...prev.stats,
        totalGoldSpent: prev.stats.totalGoldSpent + amount,
      },
    }));
    return true;
  }, []);

  const rwAddRenown = useCallback((amount: number): void => {
    setState(prev => ({
      ...prev,
      renown: prev.renown + amount,
      stats: {
        ...prev.stats,
        totalRenownEarned: prev.stats.totalRenownEarned + amount,
      },
    }));
  }, []);

  const rwAddMaterial = useCallback((materialId: string, count: number): void => {
    setState(prev => {
      const existing = prev.inventory.find(i => i.materialId === materialId);
      if (existing) {
        return {
          ...prev,
          inventory: prev.inventory.map(i =>
            i.materialId === materialId ? { ...i, count: i.count + count } : i
          ),
        };
      }
      return {
        ...prev,
        inventory: [...prev.inventory, { materialId, count }],
      };
    });
  }, []);

  const rwRemoveMaterial = useCallback((materialId: string, count: number): boolean => {
    const entry = stateRef.current.inventory.find(i => i.materialId === materialId);
    if (!entry || entry.count < count) return false;

    setState(prev => {
      const newInventory = prev.inventory.map(i =>
        i.materialId === materialId ? { ...i, count: i.count - count } : i
      ).filter(i => i.count > 0);
      return { ...prev, inventory: newInventory };
    });

    return true;
  }, []);

  const rwGetInventoryCount = useCallback((materialId: string): number => {
    const entry = stateRef.current.inventory.find(i => i.materialId === materialId);
    return entry ? entry.count : 0;
  }, []);

  const rwGetNobleTypesPresent = useCallback((): RwNobleType[] => {
    const types = new Set<RwNobleType>();
    for (const instance of stateRef.current.nobles) {
      const def = RW_NOBLES.find(n => n.id === instance.nobleDefId);
      if (def) {
        types.add(def.nobleType);
      }
    }
    return Array.from(types);
  }, []);

  const rwGetNobleInstance = useCallback((instanceId: string): RwNobleInstance | null => {
    return stateRef.current.nobles.find(n => n.id === instanceId) ?? null;
  }, []);

  const rwGetStructureInstance = useCallback((instanceId: string): RwStructureInstance | null => {
    return stateRef.current.structures.find(s => s.id === instanceId) ?? null;
  }, []);

  const rwGetStructureLevel = useCallback((structureDefId: string): number => {
    const existing = stateRef.current.structures.find(s => s.structureDefId === structureDefId);
    return existing ? existing.level : 0;
  }, []);

  const rwGetManorSummary = useCallback((): Record<string, number | string> => {
    return {
      totalNobles: stateRef.current.nobles.length,
      totalStructures: stateRef.current.structures.length,
      totalArtifacts: stateRef.current.artifacts.length,
      totalAchievements: stateRef.current.achievements.length,
      totalEstates: stateRef.current.estates.length,
      gold: stateRef.current.gold,
      renown: stateRef.current.renown,
      activeTitle: stateRef.current.activeTitle,
      currentStreak: stateRef.current.stats.currentStreak,
      bestStreak: stateRef.current.stats.bestStreak,
    };
  }, []);

  // ---- ADVANCED QUERIES ----

  const rwGetNobleTypeDef = useCallback((nobleType: RwNobleType): typeof RW_NOBLE_TYPES[number] | null => {
    return RW_NOBLE_TYPES.find(t => t.id === nobleType) ?? null;
  }, []);

  const rwGetRarityConfig = useCallback((rarity: RwRarity): typeof RW_RARITY_CONFIG[number] | null => {
    return RW_RARITY_CONFIG.find(r => r.rarity === rarity) ?? null;
  }, []);

  const rwGetAbilitiesByNobleType = useCallback((nobleType: RwNobleType): RwAbilityDef[] => {
    return RW_ABILITIES.filter(a => a.nobleType === nobleType);
  }, []);

  const rwGetAbilitiesByType = useCallback((abilityType: RwAbilityType): RwAbilityDef[] => {
    return RW_ABILITIES.filter(a => a.abilityType === abilityType);
  }, []);

  const rwGetAbilitiesByRarity = useCallback((rarity: RwRarity): RwAbilityDef[] => {
    return RW_ABILITIES.filter(a => a.rarity === rarity);
  }, []);

  const rwGetRandomNobleForRecruitment = useCallback((): RwNobleDef | null => {
    const recruitedIds = new Set(stateRef.current.nobles.map(n => n.nobleDefId));
    const available = RW_NOBLES.filter(n => !recruitedIds.has(n.id));
    if (available.length === 0) return null;

    // Weighted random based on rarity config
    let totalWeight = 0;
    const weights: number[] = [];
    for (const noble of available) {
      const rarityConf = RW_RARITY_CONFIG.find(r => r.rarity === noble.rarity);
      const weight = rarityConf ? rarityConf.recruitChance : 10;
      weights.push(weight);
      totalWeight += weight;
    }

    let roll = Math.random() * totalWeight;
    for (let i = 0; i < available.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return available[i];
    }

    return available[available.length - 1];
  }, []);

  const rwGetTotalInventoryValue = useCallback((): number => {
    let total = 0;
    for (const entry of stateRef.current.inventory) {
      const mat = RW_MATERIALS.find(m => m.id === entry.materialId);
      if (mat) {
        total += mat.value * entry.count;
      }
    }
    return total;
  }, []);

  const rwGetTotalArtifactPower = useCallback((): number => {
    let total = 0;
    for (const artifactId of stateRef.current.artifacts) {
      const artifact = RW_ARTIFACTS.find(a => a.id === artifactId);
      if (artifact) {
        total += artifact.power;
      }
    }
    return total;
  }, []);

  const rwGetStructureDefForInstance = useCallback((instanceId: string): RwStructureDef | null => {
    const instance = stateRef.current.structures.find(s => s.id === instanceId);
    if (!instance) return null;
    return RW_STRUCTURES.find(s => s.id === instance.structureDefId) ?? null;
  }, []);

  const rwIsStructureMaxed = useCallback((structureDefId: string): boolean => {
    const def = RW_STRUCTURES.find(s => s.id === structureDefId);
    if (!def) return false;
    const existing = stateRef.current.structures.find(s => s.structureDefId === structureDefId);
    if (!existing) return false;
    return existing.level >= def.maxLevel;
  }, []);

  const rwCanAfford = useCallback((amount: number): boolean => {
    return stateRef.current.gold >= amount;
  }, []);

  const rwHasEnoughRenown = useCallback((amount: number): boolean => {
    return stateRef.current.renown >= amount;
  }, []);

  const rwGetNoblesByTypeInCourt = useCallback((nobleType: RwNobleType): RwNobleInstance[] => {
    return stateRef.current.nobles.filter(instance => {
      const def = RW_NOBLES.find(n => n.id === instance.nobleDefId);
      return def !== null && def.nobleType === nobleType;
    });
  }, []);

  const rwGetNobleRarityDistribution = useCallback((): Record<RwRarity, number> => {
    const distribution: Record<RwRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
    };
    for (const instance of stateRef.current.nobles) {
      const def = RW_NOBLES.find(n => n.id === instance.nobleDefId);
      if (def) {
        distribution[def.rarity]++;
      }
    }
    return distribution;
  }, []);

  const rwGetStructureCategoryTotals = useCallback((): Record<RwStructureCategory, { count: number; totalLevel: number }> => {
    const totals: Record<RwStructureCategory, { count: number; totalLevel: number }> = {
      garden: { count: 0, totalLevel: 0 },
      wing: { count: 0, totalLevel: 0 },
      gallery: { count: 0, totalLevel: 0 },
      cellar: { count: 0, totalLevel: 0 },
      tower: { count: 0, totalLevel: 0 },
    };
    for (const instance of stateRef.current.structures) {
      const def = RW_STRUCTURES.find(s => s.id === instance.structureDefId);
      if (def) {
        totals[def.category].count++;
        totals[def.category].totalLevel += instance.level;
      }
    }
    return totals;
  }, []);

  // ---- PATTERN A: RETURN — Constants + Computed + State + Actions ----

  return {
    // ── Color Theme Constants ──
    RW_ROSEWOOD,
    RW_VELVET_CRIMSON,
    RW_GOLD,
    RW_IVORY,
    RW_DEEP_BURGUNDY,
    RW_MAHOGANY,
    RW_CHAMPAGNE,
    RW_DARK_EBONY,

    // ── Data Constants ──
    RW_NOBLES,
    RW_NOBLE_TYPES,
    RW_ESTATES,
    RW_MATERIALS,
    RW_STRUCTURES,
    RW_ABILITIES,
    RW_ACHIEVEMENTS,
    RW_TITLES,
    RW_ARTIFACTS,
    RW_EVENTS,
    RW_RARITY_CONFIG,

    // ── Computed Values ──
    rwTotalPrestige,
    rwTotalElegance,
    rwTotalInfluence,
    rwTotalStructurePower,
    rwManorPower,
    rwNobleCount,
    rwStructureCount,
    rwArtifactCount,
    rwAchievementCount,
    rwCurrentTitle,
    rwUnlockedEstates,
    rwLockedEstates,
    rwNextEstate,
    rwHasActiveEvent,
    rwUnlockedAchievements,
    rwLockedAchievements,
    rwActivatedAbilities,
    rwAvailableAbilities,
    rwCollectedArtifacts,
    rwUncollectedArtifacts,

    // ── State ──
    state,
    rwNobles: state.nobles,
    rwEstates: state.estates,
    rwInventory: state.inventory,
    rwArtifacts: state.artifacts,
    rwAchievements: state.achievements,
    rwTitle: state.activeTitle,
    rwEvents: state.activeEvent,
    rwActiveEvent: state.activeEvent,
    rwEventTurnsRemaining: state.eventTurnsRemaining,
    rwGold: state.gold,
    rwRenown: state.renown,
    rwStats: state.stats,

    // ── Primary Actions ──
    recruitNoble,
    manageEstate,
    buildStructure,
    activateArtifact,
    triggerManorEvent,
    resetRosewoodManor,

    // ── Secondary Actions ──
    advanceEvent,
    rwGetState,
    rwAddGold,
    rwSpendGold,
    rwAddRenown,
    rwAddMaterial,
    rwRemoveMaterial,
    rwGetInventoryCount,

    // ── Query Accessors ──
    rwGetNobleDef,
    rwGetNoblesByType,
    rwGetNoblesByRarity,
    rwGetStructureDef,
    rwGetStructuresByCategory,
    rwGetUpgradeCostForStructure,
    rwGetMaterialDef,
    rwGetMaterialsByType,
    rwGetMaterialsByRarity,
    rwGetArtifactDef,
    rwGetArtifactsByRarity,
    rwGetAbilityDef,
    rwGetAchievementDef,
    rwGetEstateDef,
    rwGetNobleInstance,
    rwGetStructureInstance,
    rwGetStructureLevel,
    rwGetNobleTypesPresent,
    rwGetManorSummary,

    // ── Validation Helpers ──
    rwCanRecruit,
    rwCanBuild,
    rwCanUpgrade,
    rwCanActivateArtifact,
    rwCanUnlockEstate,

    // ── Advanced Queries ──
    rwGetNobleTypeDef,
    rwGetRarityConfig,
    rwGetAbilitiesByNobleType,
    rwGetAbilitiesByType,
    rwGetAbilitiesByRarity,
    rwGetRandomNobleForRecruitment,
    rwGetTotalInventoryValue,
    rwGetTotalArtifactPower,
    rwGetStructureDefForInstance,
    rwIsStructureMaxed,
    rwCanAfford,
    rwHasEnoughRenown,
    rwGetNoblesByTypeInCourt,
    rwGetNobleRarityDistribution,
    rwGetStructureCategoryTotals,
  };
}
