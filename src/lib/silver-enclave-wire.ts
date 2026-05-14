import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

type SERarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
type SEDiscipline = 'sword' | 'poison' | 'fist' | 'palm' | 'blade' | 'chain' | 'hammer' | 'spirit'
type SEMaterialTier = 'raw' | 'processed' | 'refined' | 'alloy' | 'essence' | 'legendary'
type SEStructureType = 'training' | 'meditation' | 'weapon' | 'resource' | 'defense' | 'ceremonial' | 'storage'
type SEEventType = 'siege' | 'visitor' | 'ceremony' | 'eclipse' | 'discovery' | 'betrayal' | 'festival' | 'cataclysm' | 'pilgrimage' | 'revelation' | 'insurrection' | 'convergence'
type SEAbilityTier = 'basic' | 'advanced' | 'master'

interface SERarityInfo {
  key: SERarity
  label: string
  color: string
  powerMultiplier: number
  recruitWeight: number
  xpBonus: number
}

interface SEDisciplineInfo {
  key: SEDiscipline
  label: string
  icon: string
  color: string
  description: string
  counterTo: SEDiscipline | null
  weakTo: SEDiscipline | null
}

interface SEMonkDef {
  readonly id: string
  readonly name: string
  readonly rarity: SERarity
  readonly discipline: SEDiscipline
  readonly basePower: number
  readonly maxLevel: number
  readonly description: string
  readonly lore: string
  readonly passiveAbility: string
  readonly recruitCost: number
}

interface SESanctumDef {
  readonly id: string
  readonly name: string
  readonly dangerLevel: number
  readonly description: string
  readonly requiredLevel: number
  readonly rewards: readonly string[]
  readonly hazards: readonly string[]
  readonly environmentColor: string
  readonly bossName: string
  readonly monkDisciplineBonus: SEDiscipline | null
}

interface SEMaterialDef {
  readonly id: string
  readonly name: string
  readonly tier: SEMaterialTier
  readonly rarity: SERarity
  readonly description: string
  readonly refineFrom: readonly string[] | null
  readonly refineCost: number
  readonly sellPrice: number
  readonly usedIn: readonly string[]
}

interface SEStructureDef {
  readonly id: string
  readonly name: string
  readonly type: SEStructureType
  readonly description: string
  readonly maxLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly bonusPerLevel: number
  readonly effect: string
}

interface SEAbilityDef {
  readonly id: string
  readonly name: string
  readonly discipline: SEDiscipline
  readonly tier: SEAbilityTier
  readonly description: string
  readonly effect: string
  readonly cooldown: number
  readonly requiredLevel: number
  readonly monkRequirement: number
}

interface SEAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly conditionKey: string
  readonly targetValue: number
  readonly rewardSilver: number
  readonly rewardXp: number
}

interface SETitleDef {
  readonly id: string
  readonly name: string
  readonly requiredLevel: number
  readonly description: string
  readonly bonusPower: number
  readonly bonusSilverRate: number
}

interface SEArtifactDef {
  readonly id: string
  readonly name: string
  readonly rarity: SERarity
  readonly discipline: SEDiscipline | 'none'
  readonly description: string
  readonly lore: string
  readonly power: number
  readonly effect: string
}

interface SEEventDef {
  readonly id: string
  readonly name: string
  readonly type: SEEventType
  readonly description: string
  readonly duration: number
  readonly effects: readonly string[]
  readonly rewards: readonly string[]
  readonly severity: number
}

interface SESynergy {
  readonly disciplineA: SEDiscipline
  readonly disciplineB: SEDiscipline
  readonly name: string
  readonly bonus: number
  readonly description: string
}

interface SEStoreState {
  recruitedMonkIds: string[]
  materialQuantities: Record<string, number>
  structureLevels: Record<string, number>
  unlockedAbilityIds: string[]
  earnedAchievementIds: string[]
  currentTitleId: string
  foundArtifactIds: string[]
  completedCeremonyIds: string[]
  silverBalance: number
  enclaveLevel: number
  enclaveXp: number
  totalRecruited: number
  totalRefined: number
  totalForged: number
  totalBuilt: number
  totalCeremonies: number

  recruitMonk: (monkId: string) => boolean
  collectMaterial: (materialId: string, amount: number) => boolean
  refineSilver: (materialId: string) => boolean
  forgeWeapon: (artifactId: string) => boolean
  buildStructure: (structureId: string) => boolean
  upgradeStructure: (structureId: string) => boolean
  unlockAbility: (abilityId: string) => boolean
  earnAchievement: (achievementId: string) => boolean
  setTitle: (titleId: string) => boolean
  findArtifact: (artifactId: string) => void
  performCeremony: (ceremonyId: string) => boolean
  resetSilverEnclave: () => void
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const SE_COLOR_SILVER = '#C0C0C0'
const SE_COLOR_STEEL = '#708090'
const SE_COLOR_MOONLIGHT = '#E8E8F0'
const SE_COLOR_BLADE_WHITE = '#F5F5FF'
const SE_COLOR_FORGE_ORANGE = '#CC7722'
const SE_COLOR_SHADOW_GRAY = '#404040'
const SE_COLOR_ICE_BLUE = '#ADD8E6'
const SE_COLOR_HOLY_GOLD = '#FFD700'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: RARITY & DISCIPLINE INFO
// ═══════════════════════════════════════════════════════════════════

const SE_RARITY_INFO: Record<SERarity, SERarityInfo> = {
  common: { key: 'common', label: 'Common', color: SE_COLOR_STEEL, powerMultiplier: 1, recruitWeight: 50, xpBonus: 1 },
  uncommon: { key: 'uncommon', label: 'Uncommon', color: SE_COLOR_ICE_BLUE, powerMultiplier: 1.5, recruitWeight: 30, xpBonus: 1.5 },
  rare: { key: 'rare', label: 'Rare', color: SE_COLOR_MOONLIGHT, powerMultiplier: 2.5, recruitWeight: 14, xpBonus: 2.5 },
  epic: { key: 'epic', label: 'Epic', color: SE_COLOR_FORGE_ORANGE, powerMultiplier: 4, recruitWeight: 5, xpBonus: 4 },
  legendary: { key: 'legendary', label: 'Legendary', color: SE_COLOR_HOLY_GOLD, powerMultiplier: 7, recruitWeight: 1, xpBonus: 7 },
}

const SE_RARITY_ORDER: readonly SERarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

const SE_DISCIPLINE_INFO: Record<SEDiscipline, SEDisciplineInfo> = {
  sword: { key: 'sword', label: 'Sword', icon: '⚔️', color: SE_COLOR_BLADE_WHITE, description: 'Masters of silver-edged blades and cutting techniques', counterTo: 'blade', weakTo: 'chain' },
  poison: { key: 'poison', label: 'Poison', icon: '🐍', color: '#7CFC00', description: 'Experts in silver-venom alchemy and toxic arts', counterTo: 'palm', weakTo: 'spirit' },
  fist: { key: 'fist', label: 'Fist', icon: '👊', color: SE_COLOR_SHADOW_GRAY, description: 'Monks who harden their bodies into silver weapons', counterTo: 'hammer', weakTo: 'blade' },
  palm: { key: 'palm', label: 'Palm', icon: '🤚', color: SE_COLOR_SILVER, description: 'Healers and energy channelers using open palm strikes', counterTo: 'poison', weakTo: 'fist' },
  blade: { key: 'blade', label: 'Blade', icon: '🗡️', color: '#B0C4DE', description: 'Dual-wielding specialists with unmatched speed', counterTo: 'fist', weakTo: 'sword' },
  chain: { key: 'chain', label: 'Chain', icon: '⛓️', color: '#A9A9A9', description: 'Masters of chain weapons and binding techniques', counterTo: 'sword', weakTo: 'hammer' },
  hammer: { key: 'hammer', label: 'Hammer', icon: '🔨', color: SE_COLOR_FORGE_ORANGE, description: 'Heavy weapon specialists who forge and fight', counterTo: 'chain', weakTo: 'fist' },
  spirit: { key: 'spirit', label: 'Spirit', icon: '✨', color: SE_COLOR_MOONLIGHT, description: 'Mystical monks who channel silver spirit energy', counterTo: 'poison', weakTo: null },
}

const SE_DISCIPLINES: readonly SEDiscipline[] = ['sword', 'poison', 'fist', 'palm', 'blade', 'chain', 'hammer', 'spirit']

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: SYNERGY TABLES
// ═══════════════════════════════════════════════════════════════════

const SE_DISCIPLINE_SYNERGIES: readonly SESynergy[] = [
  { disciplineA: 'sword', disciplineB: 'blade', name: 'Dual Steel Synergy', bonus: 15, description: 'Sword and blade monks fight in perfect tandem, +15% attack power' },
  { disciplineA: 'fist', disciplineB: 'palm', name: 'Iron Body Synergy', bonus: 20, description: 'Fist and palm training creates unbreakable defense, +20% defense' },
  { disciplineA: 'chain', disciplineB: 'hammer', name: 'Heavy Impact Synergy', bonus: 25, description: 'Chains immobilize while hammers deliver crushing blows, +25% stun chance' },
  { disciplineA: 'poison', disciplineB: 'spirit', name: 'Phantom Venom Synergy', bonus: 18, description: 'Spirit-enhanced poison bypasses all resistance, +18% DoT effectiveness' },
  { disciplineA: 'blade', disciplineB: 'chain', name: 'Whirlwind Synergy', bonus: 12, description: 'Blades and chains create devastating whirlwind attacks, +12% AoE damage' },
  { disciplineA: 'sword', disciplineB: 'spirit', name: 'Holy Blade Synergy', bonus: 22, description: 'Spirit energy infuses silver swords with divine light, +22% holy damage' },
  { disciplineA: 'hammer', disciplineB: 'fist', name: 'Forge Fist Synergy', bonus: 16, description: 'Hammer-fist combination delivers crushing blows, +16% impact damage' },
  { disciplineA: 'palm', disciplineB: 'spirit', name: 'Divine Healing Synergy', bonus: 30, description: 'Spirit-enhanced palm heals all allies, +30% healing effectiveness' },
  { disciplineA: 'poison', disciplineB: 'blade', name: 'Toxic Edge Synergy', bonus: 14, description: 'Poison-coated blades deliver lasting damage, +14% poison duration' },
  { disciplineA: 'chain', disciplineB: 'fist', name: 'Binding Strike Synergy', bonus: 10, description: 'Chains hold enemies while fists strike freely, +10% hit accuracy' },
]

const SE_RARITY_INTERACTIONS: Record<SEDiscipline, { strongVs: SERarity[]; weakVs: SERarity[] }> = {
  sword: { strongVs: ['common', 'uncommon'], weakVs: ['epic', 'legendary'] },
  poison: { strongVs: ['rare', 'epic'], weakVs: ['common', 'legendary'] },
  fist: { strongVs: ['uncommon', 'rare'], weakVs: ['common', 'epic'] },
  palm: { strongVs: ['legendary'], weakVs: ['rare'] },
  blade: { strongVs: ['common', 'rare'], weakVs: ['uncommon', 'epic'] },
  chain: { strongVs: ['epic', 'legendary'], weakVs: ['uncommon', 'rare'] },
  hammer: { strongVs: ['uncommon', 'epic'], weakVs: ['rare', 'legendary'] },
  spirit: { strongVs: ['legendary'], weakVs: [] },
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: SILVER MONKS (35 — 5 rarities × 7 core disciplines)
// ═══════════════════════════════════════════════════════════════════

const SE_MONKS: readonly SEMonkDef[] = [
  // ── Common (7) ──────────────────────────────────────────────────
  {
    id: 'se_monk_sword_c1',
    name: 'Initiate Jian',
    rarity: 'common',
    discipline: 'sword',
    basePower: 12,
    maxLevel: 10,
    description: 'A humble swordsman beginning his journey along the silver path.',
    lore: 'Jian arrived at the enclave gates with nothing but a rusty blade and unwavering determination.',
    passiveAbility: 'Silver Glimmer — 3% chance to reflect attacks',
    recruitCost: 50,
  },
  {
    id: 'se_monk_poison_c1',
    name: 'Apprentice Viper',
    rarity: 'common',
    discipline: 'poison',
    basePower: 10,
    maxLevel: 10,
    description: 'A young poisoner studying the properties of silver-based toxins.',
    lore: 'Viper was cast out from her village for practicing forbidden alchemy on silver ore.',
    passiveAbility: 'Toxic Touch — Basic attacks deal 2 poison damage over 3s',
    recruitCost: 45,
  },
  {
    id: 'se_monk_fist_c1',
    name: 'Stone Fists Kael',
    rarity: 'common',
    discipline: 'fist',
    basePower: 14,
    maxLevel: 10,
    description: 'A peasant who trained his fists against the mountains themselves.',
    lore: 'Kael spent ten years punching the canyon walls until his fists gleamed like polished silver.',
    passiveAbility: 'Rock Solid — +5% physical damage reduction',
    recruitCost: 55,
  },
  {
    id: 'se_monk_palm_c1',
    name: 'Palm Breeze Mei',
    rarity: 'common',
    discipline: 'palm',
    basePower: 11,
    maxLevel: 10,
    description: 'A gentle monk learning the flowing palm techniques of the silver wind.',
    lore: 'Mei discovered she could channel healing energy through her palms during a mountain storm.',
    passiveAbility: 'Gentle Breeze — Heals allies for 1 HP every 5s',
    recruitCost: 48,
  },
  {
    id: 'se_monk_blade_c1',
    name: 'Shard Novice Ryo',
    rarity: 'common',
    discipline: 'blade',
    basePower: 13,
    maxLevel: 10,
    description: 'A quick learner who wields twin shards of refined silver.',
    lore: 'Ryo found two perfect silver shards in a collapsed mine and taught himself to dual-wield.',
    passiveAbility: 'Dual Slash — +4% attack speed with paired blades',
    recruitCost: 52,
  },
  {
    id: 'se_monk_chain_c1',
    name: 'Iron Link Garan',
    rarity: 'common',
    discipline: 'chain',
    basePower: 11,
    maxLevel: 10,
    description: 'A former blacksmith who adapted chain-weaving into a combat art.',
    lore: 'Garan forged silver chains by day and learned to wield them in combat by night.',
    passiveAbility: 'Chain Pull — Can pull enemies within 2 tiles',
    recruitCost: 46,
  },
  {
    id: 'se_monk_hammer_c1',
    name: 'Forge Fist Thane',
    rarity: 'common',
    discipline: 'hammer',
    basePower: 15,
    maxLevel: 10,
    description: 'A broad-shouldered monk from the silver forges of the deep mountains.',
    lore: 'Thane carries a hammer forged from the first silver ever mined from the enclave mountain.',
    passiveAbility: 'Heavy Blow — 8% chance to stun on hit',
    recruitCost: 58,
  },
  // ── Uncommon (7) ────────────────────────────────────────────────
  {
    id: 'se_monk_sword_u1',
    name: 'Silver Edge Liang',
    rarity: 'uncommon',
    discipline: 'sword',
    basePower: 22,
    maxLevel: 10,
    description: 'A disciplined swordsman whose form is as flawless as his silver blade.',
    lore: 'Liang studied under three masters before arriving at the enclave, perfecting a unique silver sword style.',
    passiveAbility: 'Edge Precision — +10% critical hit chance',
    recruitCost: 120,
  },
  {
    id: 'se_monk_poison_u1',
    name: 'Nightshade Yue',
    rarity: 'uncommon',
    discipline: 'poison',
    basePower: 20,
    maxLevel: 10,
    description: 'An alchemist who crafts deadly poisons from rare silver compounds.',
    lore: 'Yue spent years in the deep forests extracting silver toxins from nightshade flowers.',
    passiveAbility: 'Toxic Cloud — Area attacks leave a poison patch for 4s',
    recruitCost: 110,
  },
  {
    id: 'se_monk_fist_u1',
    name: 'Iron Mountain Bao',
    rarity: 'uncommon',
    discipline: 'fist',
    basePower: 25,
    maxLevel: 10,
    description: 'A monk whose fists have literally shattered boulders during training.',
    lore: 'Bao once punched through a mountainside to create a shortcut, earning his legendary nickname.',
    passiveAbility: 'Iron Skin — +12% physical damage reduction',
    recruitCost: 130,
  },
  {
    id: 'se_monk_palm_u1',
    name: 'Cloud Touch Shin',
    rarity: 'uncommon',
    discipline: 'palm',
    basePower: 21,
    maxLevel: 10,
    description: 'A serene monk who channels silver wind energy through open palms.',
    lore: 'Shin meditated atop the cloud peak for forty days, learning to command the winds.',
    passiveAbility: 'Wind Palm — Ranged palm attack with 6m reach',
    recruitCost: 115,
  },
  {
    id: 'se_monk_blade_u1',
    name: 'Twin Fang Kira',
    rarity: 'uncommon',
    discipline: 'blade',
    basePower: 23,
    maxLevel: 10,
    description: 'A dual-wielding specialist whose speed is matched only by her precision.',
    lore: 'Kira was raised by wolves and learned to fight with two silver fangs she found in a cave.',
    passiveAbility: 'Fang Fury — Every 3rd attack deals double damage',
    recruitCost: 125,
  },
  {
    id: 'se_monk_chain_u1',
    name: 'Shadow Bind Orin',
    rarity: 'uncommon',
    discipline: 'chain',
    basePower: 20,
    maxLevel: 10,
    description: 'A stealthy chain fighter who strikes from the darkness between strikes.',
    lore: 'Orin was a dungeon escapee who turned his shackles into the deadliest chains in the enclave.',
    passiveAbility: 'Shadow Chain — Chains become invisible in dark areas',
    recruitCost: 112,
  },
  {
    id: 'se_monk_hammer_u1',
    name: 'Thunder Strike Grimm',
    rarity: 'uncommon',
    discipline: 'hammer',
    basePower: 26,
    maxLevel: 10,
    description: 'A massive monk whose hammer strikes echo with rolling thunder.',
    lore: 'Grimm was struck by lightning atop Silver Peak and absorbed the storm into his hammer.',
    passiveAbility: 'Thunder Clap — AoE stun within 3m on every 5th hit',
    recruitCost: 135,
  },
  // ── Rare (7) ────────────────────────────────────────────────────
  {
    id: 'se_monk_sword_r1',
    name: 'Moonlit Saber Hua',
    rarity: 'rare',
    discipline: 'sword',
    basePower: 38,
    maxLevel: 10,
    description: 'A swordsman who draws moonlight into his silver blade, glowing with lunar energy.',
    lore: 'Hua forged his blade under a blood moon and sealed a lunar spirit within the steel.',
    passiveAbility: 'Moon Phase — Damage increases during night cycles by 20%',
    recruitCost: 280,
  },
  {
    id: 'se_monk_poison_r1',
    name: 'Jade Scorpion Feng',
    rarity: 'rare',
    discipline: 'poison',
    basePower: 35,
    maxLevel: 10,
    description: 'An elite poison master from the Jade Scorpion sect with deadly precision.',
    lore: 'Feng carries a living jade scorpion on his shoulder that secretes silver venom on command.',
    passiveAbility: 'Venom Cascade — Poison effects stack up to 5 times',
    recruitCost: 260,
  },
  {
    id: 'se_monk_fist_r1',
    name: 'Diamond Fist Xun',
    rarity: 'rare',
    discipline: 'fist',
    basePower: 42,
    maxLevel: 10,
    description: 'A monk whose fists have been hardened to rival the toughness of diamond.',
    lore: 'Xun submerged his hands in liquid silver for a hundred days, creating indestructible fists.',
    passiveAbility: 'Diamond Body — Immune to physical damage below 15 HP',
    recruitCost: 300,
  },
  {
    id: 'se_monk_palm_r1',
    name: 'Lotus Palm Yun',
    rarity: 'rare',
    discipline: 'palm',
    basePower: 36,
    maxLevel: 10,
    description: 'A healer whose silver palms channel restorative energy that can revive the fallen.',
    lore: 'Yun was gifted the Silver Lotus by a dying spirit, granting her palms unlimited healing power.',
    passiveAbility: 'Lotus Bloom — Heals all allies within 5m for 3 HP per second',
    recruitCost: 270,
  },
  {
    id: 'se_monk_blade_r1',
    name: 'Storm Razor Qin',
    rarity: 'rare',
    discipline: 'blade',
    basePower: 40,
    maxLevel: 10,
    description: 'A blademaster who moves and strikes with the speed and fury of a living tempest.',
    lore: 'Qin was born during a silver storm and has carried its fury within his twin blades ever since.',
    passiveAbility: 'Storm Dance — Attack speed increases by 5% for each consecutive hit',
    recruitCost: 290,
  },
  {
    id: 'se_monk_chain_r1',
    name: 'Serpent Coil Ming',
    rarity: 'rare',
    discipline: 'chain',
    basePower: 37,
    maxLevel: 10,
    description: 'A chain master whose silver chains writhe and strike like living serpents.',
    lore: 'Ming tamed the Silver Serpent of the Eastern Caves and wove its scales into his chains.',
    passiveAbility: 'Serpent Strike — Chains independently attack nearby enemies',
    recruitCost: 275,
  },
  {
    id: 'se_monk_hammer_r1',
    name: 'Earth Shatter Wu',
    rarity: 'rare',
    discipline: 'hammer',
    basePower: 44,
    maxLevel: 10,
    description: 'A monk whose hammer can crack the earth and split mountains in a single blow.',
    lore: 'Wu carved the enclave\'s main valley with a single hammer strike during the founding era.',
    passiveAbility: 'Earthquake — Hammer slams create a 4m shockwave',
    recruitCost: 310,
  },
  // ── Epic (7) ────────────────────────────────────────────────────
  {
    id: 'se_monk_sword_e1',
    name: 'Astral Blade Shen',
    rarity: 'epic',
    discipline: 'sword',
    basePower: 62,
    maxLevel: 10,
    description: 'A legendary swordsman who draws his blade across the boundary between planes.',
    lore: 'Shen once cut a hole between the mortal realm and the astral plane with a single swing.',
    passiveAbility: 'Dimensional Cut — Attacks can phase through armor and shields',
    recruitCost: 600,
  },
  {
    id: 'se_monk_poison_e1',
    name: 'Plague Empress Dai',
    rarity: 'epic',
    discipline: 'poison',
    basePower: 58,
    maxLevel: 10,
    description: 'A feared poison empress whose silver toxins can wilt entire landscapes.',
    lore: 'Empress Dai was sealed away for a century for poisoning an entire kingdom with silver dust.',
    passiveAbility: 'Plague Aura — Enemies within 8m slowly lose 5 HP per second',
    recruitCost: 560,
  },
  {
    id: 'se_monk_fist_e1',
    name: 'Void Breaker Long',
    rarity: 'epic',
    discipline: 'fist',
    basePower: 68,
    maxLevel: 10,
    description: 'A transcendent monk whose fists can punch through the fabric of reality.',
    lore: 'Long once punched a hole in reality to rescue his brother from the void dimension.',
    passiveAbility: 'Void Punch — Every 10th attack ignores all defenses',
    recruitCost: 650,
  },
  {
    id: 'se_monk_palm_e1',
    name: 'Silver Sage Po',
    rarity: 'epic',
    discipline: 'palm',
    basePower: 60,
    maxLevel: 10,
    description: 'An ancient palm master of transcendent wisdom whose touch mends all wounds.',
    lore: 'Sage Po has lived for three hundred years, sustained by silver energy channeled through his palms.',
    passiveAbility: 'Transcendent Palm — Can heal any debuff and restore 10% max HP',
    recruitCost: 580,
  },
  {
    id: 'se_monk_blade_e1',
    name: 'Phantom Edge Ning',
    rarity: 'epic',
    discipline: 'blade',
    basePower: 64,
    maxLevel: 10,
    description: 'A blademaster who exists partially in shadow, striking from impossible angles.',
    lore: 'Ning trained in the Shadow Realm for fifty years, becoming one with the darkness between blades.',
    passiveAbility: 'Phase Strike — 25% chance to become untargetable during attacks',
    recruitCost: 620,
  },
  {
    id: 'se_monk_chain_e1',
    name: 'Dragon Bind Kuang',
    rarity: 'epic',
    discipline: 'chain',
    basePower: 61,
    maxLevel: 10,
    description: 'A chain master whose silver chains are enchanted to restrain even ancient dragons.',
    lore: 'Kuang captured the Silver Dragon of the Northern Peaks using nothing but chains and willpower.',
    passiveAbility: 'Dragon Bind — Chains deal 3x damage to large enemies',
    recruitCost: 590,
  },
  {
    id: 'se_monk_hammer_e1',
    name: 'Star Forge Tian',
    rarity: 'epic',
    discipline: 'hammer',
    basePower: 70,
    maxLevel: 10,
    description: 'A cosmic monk whose hammer is forged from the heart of a dying star.',
    lore: 'Tian reached into the sky during a meteor shower and pulled down a star to forge his hammer.',
    passiveAbility: 'Star Fall — Critical hits create an explosion dealing 50% splash damage',
    recruitCost: 670,
  },
  // ── Legendary (7) ───────────────────────────────────────────────
  {
    id: 'se_monk_sword_l1',
    name: 'Silver God of Blades',
    rarity: 'legendary',
    discipline: 'sword',
    basePower: 95,
    maxLevel: 10,
    description: 'The ultimate swordsman, a living legend whose blade has never been defeated.',
    lore: 'Said to be the reincarnation of the Silver War God, his blade can cut through anything in existence.',
    passiveAbility: 'Divine Edge — All attacks are critical hits; ignores all damage reduction',
    recruitCost: 2000,
  },
  {
    id: 'se_monk_poison_l1',
    name: 'Eternal Serpent Empress',
    rarity: 'legendary',
    discipline: 'poison',
    basePower: 88,
    maxLevel: 10,
    description: 'An immortal master of all venoms whose very presence is lethal.',
    lore: 'The Eternal Serpent has existed since before the enclave was founded, her venom the source of all silver toxins.',
    passiveAbility: 'Eternal Venom — Poison effects never expire and spread to nearby enemies',
    recruitCost: 1800,
  },
  {
    id: 'se_monk_fist_l1',
    name: 'Adamantine Saint',
    rarity: 'legendary',
    discipline: 'fist',
    basePower: 100,
    maxLevel: 10,
    description: 'An indestructible monk whose body has transcended mortal limitations.',
    lore: 'The Adamantine Saint meditated in a volcano for a millennium, emerging with an indestructible body.',
    passiveAbility: 'Adamantine Form — Immune to all damage below 50 HP; +30% counter-attack damage',
    recruitCost: 2200,
  },
  {
    id: 'se_monk_palm_l1',
    name: 'Holy Silver Palm',
    rarity: 'legendary',
    discipline: 'palm',
    basePower: 90,
    maxLevel: 10,
    description: 'A divine healer whose silver palms can cure any ailment and revive the dead.',
    lore: 'It is said the Holy Silver Palm resurrected the first enclave elder and can restore life itself.',
    passiveAbility: 'Divine Resurrection — Can fully heal and revive one fallen ally per battle',
    recruitCost: 1900,
  },
  {
    id: 'se_monk_blade_l1',
    name: 'Silver Reaper',
    rarity: 'legendary',
    discipline: 'blade',
    basePower: 92,
    maxLevel: 10,
    description: 'A blademaster who commands a thousand silver blades with pure thought alone.',
    lore: 'The Silver Reaper harvests souls with a thousand floating blades, each one a silver needle of death.',
    passiveAbility: 'Thousand Blades — Summons 10 autonomous blade copies that attack independently',
    recruitCost: 1950,
  },
  {
    id: 'se_monk_chain_l1',
    name: 'World Binder',
    rarity: 'legendary',
    discipline: 'chain',
    basePower: 93,
    maxLevel: 10,
    description: 'A master who can bind the very fabric of reality using chains of pure silver.',
    lore: 'The World Binder once chained a falling star to prevent it from destroying the enclave mountain.',
    passiveAbility: 'Reality Bind — Can immobilize any enemy regardless of power for 5 seconds',
    recruitCost: 2100,
  },
  {
    id: 'se_monk_hammer_l1',
    name: 'Forge of Creation',
    rarity: 'legendary',
    discipline: 'hammer',
    basePower: 98,
    maxLevel: 10,
    description: 'A cosmic monk who shapes worlds and forges destinies with each hammer strike.',
    lore: 'The Forge of Creation built the enclave itself with a single hammer blow that raised the mountain.',
    passiveAbility: 'World Shaper — Hammer attacks reshape terrain; creates silver barriers for 10s',
    recruitCost: 2300,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: SANCTUM CHAMBERS (8)
// ═══════════════════════════════════════════════════════════════════

const SE_SANCTUMS: readonly SESanctumDef[] = [
  {
    id: 'se_sanctum_whispering_cave',
    name: 'Whispering Cave',
    dangerLevel: 1,
    description: 'A shallow cave where silver walls murmur secrets to those who listen carefully.',
    requiredLevel: 1,
    rewards: ['Raw Silver Ore', 'Basic monk experience', 'Minor silver essence'],
    hazards: ['Loose rocks', 'Echoing disorientation'],
    environmentColor: SE_COLOR_STEEL,
    bossName: 'Cave Silver Wisp',
    monkDisciplineBonus: 'spirit',
  },
  {
    id: 'se_sanctum_silver_stream',
    name: 'Silver Stream Grotto',
    dangerLevel: 2,
    description: 'An underground river flowing with liquid silver, home to rare aquatic materials.',
    requiredLevel: 3,
    rewards: ['Refined Silver Bar', 'Moonstone Shard', 'Water silver essence'],
    hazards: ['Slippery banks', 'Silver current undertow'],
    environmentColor: SE_COLOR_ICE_BLUE,
    bossName: 'Silver River Serpent',
    monkDisciplineBonus: 'palm',
  },
  {
    id: 'se_sanctum_jade_hollow',
    name: 'Jade Hollow Chamber',
    dangerLevel: 3,
    description: 'A chamber of jade and silver where ancient monks once held their first ceremonies.',
    requiredLevel: 6,
    rewards: ['Jade Silver Alloy', 'Training manuals', 'Medium silver essence'],
    hazards: ['Jade trap floors', 'Poisonous jade spores'],
    environmentColor: '#50C878',
    bossName: 'Jade Guardian Golem',
    monkDisciplineBonus: 'fist',
  },
  {
    id: 'se_sanctum_frost_peak',
    name: 'Frost Peak Sanctuary',
    dangerLevel: 4,
    description: 'A frozen sanctum at the mountain peak where frost and silver create deadly beauty.',
    requiredLevel: 10,
    rewards: ['Frost Silver Ingot', 'Starfall Dust', 'Cold resistance essence'],
    hazards: ['Blinding blizzards', 'Ice floor traps', 'Freezing winds'],
    environmentColor: SE_COLOR_MOONLIGHT,
    bossName: 'Frost Silver Wyrm',
    monkDisciplineBonus: 'sword',
  },
  {
    id: 'se_sanctum_shadow_depths',
    name: 'Shadow Depths Vault',
    dangerLevel: 5,
    description: 'A lightless vault where shadow creatures guard the most valuable silver deposits.',
    requiredLevel: 15,
    rewards: ['Shadow Silver Fusion', 'Shadow Quartz cluster', 'Shadow essence'],
    hazards: ['Complete darkness', 'Shadow clones', 'Sanity drain'],
    environmentColor: SE_COLOR_SHADOW_GRAY,
    bossName: 'Shadow Silver Specter',
    monkDisciplineBonus: 'chain',
  },
  {
    id: 'se_sanctum_crystal_heart',
    name: 'Crystal Heart Shrine',
    dangerLevel: 6,
    description: 'The geode-like heart of the mountain, pulsing with crystallized silver energy.',
    requiredLevel: 22,
    rewards: ['Crystal Silver Core', 'Moonbeam Gem', 'Crystal resonance essence'],
    hazards: ['Crystal shard storms', 'Resonance dissonance', 'Collapsing crystals'],
    environmentColor: '#9370DB',
    bossName: 'Crystal Silver Titan',
    monkDisciplineBonus: 'blade',
  },
  {
    id: 'se_sanctum_void_chamber',
    name: 'Void Chamber of Echoes',
    dangerLevel: 7,
    description: 'A chamber that exists partially in the void, where reality is thin and danger extreme.',
    requiredLevel: 32,
    rewards: ['Void Silver Catalyst', 'Star-Iron Compound', 'Void-touched essence'],
    hazards: ['Void rifts', 'Temporal distortion', 'Gravity anomalies'],
    environmentColor: '#0f0f23',
    bossName: 'Void Silver Aberration',
    monkDisciplineBonus: 'spirit',
  },
  {
    id: 'se_sanctum_divine_forge',
    name: 'Divine Forge Sanctum',
    dangerLevel: 8,
    description: 'The innermost sanctum containing the legendary Divine Silver Forge itself.',
    requiredLevel: 42,
    rewards: ['Genesis Silver Shard', 'Philosopher\'s Silver', 'Divine silver essence'],
    hazards: ['Divine fire eruptions', 'Forged guardians', 'Molten silver floods'],
    environmentColor: SE_COLOR_HOLY_GOLD,
    bossName: 'Divine Silver Colossus',
    monkDisciplineBonus: 'hammer',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: SILVER MATERIALS (30)
// ═══════════════════════════════════════════════════════════════════

const SE_MATERIALS: readonly SEMaterialDef[] = [
  // ── Raw (6) ─────────────────────────────────────────────────────
  { id: 'se_mat_raw_silver_ore', name: 'Raw Silver Ore', tier: 'raw', rarity: 'common', description: 'Unprocessed silver ore extracted from the enclave mountain veins.', refineFrom: null, refineCost: 0, sellPrice: 3, usedIn: ['se_mat_refined_silver_bar', 'se_mat_silversteel_alloy'] },
  { id: 'se_mat_iron_sand', name: 'Iron Sand', tier: 'raw', rarity: 'common', description: 'Fine magnetic sand found near the mountain base, useful in steel-making.', refineFrom: null, refineCost: 0, sellPrice: 2, usedIn: ['se_mat_steel_ingot', 'se_mat_star_iron_compound'] },
  { id: 'se_mat_cold_iron_chunk', name: 'Cold Iron Chunk', tier: 'raw', rarity: 'uncommon', description: 'Iron that has been naturally chilled by mountain frost for centuries.', refineFrom: null, refineCost: 0, sellPrice: 8, usedIn: ['se_mat_cold_iron_plate', 'se_mat_frost_silver_ingot'] },
  { id: 'se_mat_shadow_quartz', name: 'Shadow Quartz', tier: 'raw', rarity: 'uncommon', description: 'Dark crystalline quartz found in the deeper, darker tunnels.', refineFrom: null, refineCost: 0, sellPrice: 10, usedIn: ['se_mat_ground_shadow_quartz', 'se_mat_shadow_silver_fusion'] },
  { id: 'se_mat_moonstone_shard', name: 'Moonstone Shard', tier: 'raw', rarity: 'rare', description: 'Luminous moonstone fragments that glow under moonlight.', refineFrom: null, refineCost: 0, sellPrice: 25, usedIn: ['se_mat_polished_moonstone', 'se_mat_moon_silver_blend'] },
  { id: 'se_mat_starfall_dust', name: 'Starfall Dust', tier: 'raw', rarity: 'rare', description: 'Stardust collected from meteorites that strike the silver mountain.', refineFrom: null, refineCost: 0, sellPrice: 30, usedIn: ['se_mat_condensed_starlight', 'se_mat_star_iron_compound'] },
  // ── Processed (6) ───────────────────────────────────────────────
  { id: 'se_mat_refined_silver_bar', name: 'Refined Silver Bar', tier: 'processed', rarity: 'common', description: 'Pure silver smelted from raw ore, ready for crafting.', refineFrom: ['se_mat_raw_silver_ore', 'se_mat_raw_silver_ore', 'se_mat_raw_silver_ore'], refineCost: 15, sellPrice: 10, usedIn: ['se_mat_silversteel_alloy', 'se_mat_silver_thread', 'se_mat_silver_blood_essence'] },
  { id: 'se_mat_steel_ingot', name: 'Steel Ingot', tier: 'processed', rarity: 'common', description: 'Strong steel forged from iron sand in the enclave furnaces.', refineFrom: ['se_mat_iron_sand', 'se_mat_iron_sand', 'se_mat_iron_sand'], refineCost: 12, sellPrice: 8, usedIn: ['se_mat_silversteel_alloy', 'se_mat_tempered_steel_blade'] },
  { id: 'se_mat_cold_iron_plate', name: 'Cold Iron Plate', tier: 'processed', rarity: 'uncommon', description: 'A slab of cold iron, resistant to magical and spiritual attacks.', refineFrom: ['se_mat_cold_iron_chunk', 'se_mat_cold_iron_chunk'], refineCost: 25, sellPrice: 18, usedIn: ['se_mat_adamantine_silver'] },
  { id: 'se_mat_ground_shadow_quartz', name: 'Ground Shadow Quartz', tier: 'processed', rarity: 'uncommon', description: 'Finely powdered shadow quartz used in alchemical mixtures.', refineFrom: ['se_mat_shadow_quartz', 'se_mat_shadow_quartz'], refineCost: 20, sellPrice: 16, usedIn: ['se_mat_shadow_silver_fusion', 'se_mat_shadow_crystal'] },
  { id: 'se_mat_polished_moonstone', name: 'Polished Moonstone', tier: 'processed', rarity: 'rare', description: 'A perfectly cut moonstone that captures and stores lunar energy.', refineFrom: ['se_mat_moonstone_shard', 'se_mat_moonstone_shard'], refineCost: 40, sellPrice: 40, usedIn: ['se_mat_moon_silver_blend', 'se_mat_moonbeam_gem'] },
  { id: 'se_mat_condensed_starlight', name: 'Condensed Starlight', tier: 'processed', rarity: 'rare', description: 'Liquid starlight captured in a silver vial, radiating cosmic warmth.', refineFrom: ['se_mat_starfall_dust', 'se_mat_starfall_dust', 'se_mat_starfall_dust'], refineCost: 50, sellPrice: 50, usedIn: ['se_mat_star_iron_compound', 'se_mat_starfire_essence'] },
  // ── Refined (6) ─────────────────────────────────────────────────
  { id: 'se_mat_silver_thread', name: 'Silver Thread', tier: 'refined', rarity: 'uncommon', description: 'Incredibly thin silver wire woven from refined bars, used in armor and crafting.', refineFrom: ['se_mat_refined_silver_bar', 'se_mat_refined_silver_bar'], refineCost: 30, sellPrice: 22, usedIn: ['se_mat_adamantine_silver'] },
  { id: 'se_mat_tempered_steel_blade', name: 'Tempered Steel Blade', tier: 'refined', rarity: 'uncommon', description: 'A perfectly tempered steel blade blank, ready for enchantment.', refineFrom: ['se_mat_steel_ingot', 'se_mat_steel_ingot', 'se_mat_refined_silver_bar'], refineCost: 35, sellPrice: 26, usedIn: ['se_mat_silversteel_alloy'] },
  { id: 'se_mat_frost_silver_ingot', name: 'Frost Silver Ingot', tier: 'refined', rarity: 'rare', description: 'Silver infused with eternal frost, cold to the touch and deadly to wield.', refineFrom: ['se_mat_refined_silver_bar', 'se_mat_cold_iron_chunk'], refineCost: 55, sellPrice: 45, usedIn: ['se_mat_adamantine_silver', 'se_mat_moon_silver_blend'] },
  { id: 'se_mat_shadow_crystal', name: 'Shadow Crystal', tier: 'refined', rarity: 'rare', description: 'A dark crystal formed from compressed shadow quartz, absorbs light.', refineFrom: ['se_mat_ground_shadow_quartz', 'se_mat_ground_shadow_quartz', 'se_mat_ground_shadow_quartz'], refineCost: 45, sellPrice: 38, usedIn: ['se_mat_shadow_silver_fusion'] },
  { id: 'se_mat_moonbeam_gem', name: 'Moonbeam Gem', tier: 'refined', rarity: 'epic', description: 'A gem that focuses moonlight into a concentrated beam of silver energy.', refineFrom: ['se_mat_polished_moonstone', 'se_mat_polished_moonstone', 'se_mat_refined_silver_bar'], refineCost: 80, sellPrice: 75, usedIn: ['se_mat_moon_silver_blend', 'se_mat_divine_silver_aura'] },
  { id: 'se_mat_starfire_essence', name: 'Starfire Essence', tier: 'refined', rarity: 'epic', description: 'The distilled essence of starlight, blazing with cosmic fire energy.', refineFrom: ['se_mat_condensed_starlight', 'se_mat_condensed_starlight'], refineCost: 90, sellPrice: 85, usedIn: ['se_mat_star_iron_compound'] },
  // ── Alloy (5) ───────────────────────────────────────────────────
  { id: 'se_mat_silversteel_alloy', name: 'Silversteel Alloy', tier: 'alloy', rarity: 'rare', description: 'A perfect alloy of silver and steel, stronger than either alone.', refineFrom: ['se_mat_refined_silver_bar', 'se_mat_tempered_steel_blade'], refineCost: 60, sellPrice: 55, usedIn: ['se_mat_adamantine_silver'] },
  { id: 'se_mat_star_iron_compound', name: 'Star-Iron Compound', tier: 'alloy', rarity: 'epic', description: 'Iron bonded with starfire essence, creating impossibly strong metal.', refineFrom: ['se_mat_steel_ingot', 'se_mat_condensed_starlight', 'se_mat_starfire_essence'], refineCost: 120, sellPrice: 110, usedIn: ['se_mat_adamantine_silver'] },
  { id: 'se_mat_moon_silver_blend', name: 'Moon-Silver Blend', tier: 'alloy', rarity: 'epic', description: 'Silver merged with moonstone energy, glowing with soft lunar light.', refineFrom: ['se_mat_refined_silver_bar', 'se_mat_frost_silver_ingot', 'se_mat_moonbeam_gem'], refineCost: 100, sellPrice: 95, usedIn: ['se_mat_philosopher_silver'] },
  { id: 'se_mat_shadow_silver_fusion', name: 'Shadow-Silver Fusion', tier: 'alloy', rarity: 'epic', description: 'Silver fused with shadow crystal, creating metal that absorbs darkness.', refineFrom: ['se_mat_refined_silver_bar', 'se_mat_shadow_crystal', 'se_mat_ground_shadow_quartz'], refineCost: 95, sellPrice: 90, usedIn: ['se_mat_adamantine_silver'] },
  { id: 'se_mat_adamantine_silver', name: 'Adamantine Silver', tier: 'alloy', rarity: 'legendary', description: 'The ultimate silver alloy, indestructible and radiating pure silver energy.', refineFrom: ['se_mat_silversteel_alloy', 'se_mat_silver_thread', 'se_mat_cold_iron_plate', 'se_mat_star_iron_compound', 'se_mat_shadow_silver_fusion'], refineCost: 300, sellPrice: 280, usedIn: ['se_mat_eternal_silver_core'] },
  // ── Essence (4) ─────────────────────────────────────────────────
  { id: 'se_mat_silver_blood_essence', name: 'Silver Blood Essence', tier: 'essence', rarity: 'uncommon', description: 'A vial of liquid silver that pulses like a heartbeat, used in ceremonies.', refineFrom: ['se_mat_refined_silver_bar', 'se_mat_refined_silver_bar'], refineCost: 40, sellPrice: 30, usedIn: ['se_mat_enclave_spirit_dew', 'se_mat_divine_silver_aura'] },
  { id: 'se_mat_enclave_spirit_dew', name: 'Enclave Spirit Dew', tier: 'essence', rarity: 'rare', description: 'Dew collected at dawn from the enclave gardens, infused with silver spirit.', refineFrom: ['se_mat_silver_blood_essence', 'se_mat_silver_blood_essence', 'se_mat_moonstone_shard'], refineCost: 70, sellPrice: 60, usedIn: ['se_mat_divine_silver_aura'] },
  { id: 'se_mat_divine_silver_aura', name: 'Divine Silver Aura', tier: 'essence', rarity: 'legendary', description: 'Concentrated divine silver energy, the most powerful essence in the enclave.', refineFrom: ['se_mat_enclave_spirit_dew', 'se_mat_moonbeam_gem', 'se_mat_starfire_essence'], refineCost: 250, sellPrice: 240, usedIn: ['se_mat_philosopher_silver'] },
  { id: 'se_mat_void_silver_catalyst', name: 'Void Silver Catalyst', tier: 'essence', rarity: 'legendary', description: 'Silver that has touched the void and returned changed, a catalyst for transformation.', refineFrom: ['se_mat_shadow_silver_fusion', 'se_mat_condensed_starlight', 'se_mat_silver_blood_essence'], refineCost: 220, sellPrice: 210, usedIn: ['se_mat_philosopher_silver', 'se_mat_eternal_silver_core'] },
  // ── Legendary (3) ───────────────────────────────────────────────
  { id: 'se_mat_philosopher_silver', name: 'Philosopher\'s Silver', tier: 'legendary', rarity: 'legendary', description: 'The legendary silver of the ancients, said to grant eternal life and infinite power.', refineFrom: ['se_mat_moon_silver_blend', 'se_mat_adamantine_silver', 'se_mat_divine_silver_aura', 'se_mat_void_silver_catalyst'], refineCost: 500, sellPrice: 500, usedIn: ['se_mat_genesis_silver_shard'] },
  { id: 'se_mat_eternal_silver_core', name: 'Eternal Silver Core', tier: 'legendary', rarity: 'legendary', description: 'A self-sustaining silver core that generates infinite silver energy forever.', refineFrom: ['se_mat_adamantine_silver', 'se_mat_void_silver_catalyst', 'se_mat_philosopher_silver'], refineCost: 600, sellPrice: 580, usedIn: [] },
  { id: 'se_mat_genesis_silver_shard', name: 'Genesis Silver Shard', tier: 'legendary', rarity: 'legendary', description: 'A shard of the original silver that created the mountain — the rarest material in existence.', refineFrom: ['se_mat_philosopher_silver', 'se_mat_eternal_silver_core', 'se_mat_philosopher_silver'], refineCost: 800, sellPrice: 800, usedIn: [] },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: ENCLAVE STRUCTURES (25 — upgradeable to level 10)
// ═══════════════════════════════════════════════════════════════════

const SE_STRUCTURES: readonly SEStructureDef[] = [
  // ── Training (5) ────────────────────────────────────────────────
  { id: 'se_struct_training_hall', name: 'Training Hall', type: 'training', description: 'A grand hall where monks practice their combat techniques daily.', maxLevel: 10, baseCost: 100, costMultiplier: 1.4, bonusPerLevel: 5, effect: '+5% monk XP gain per level' },
  { id: 'se_struct_weapon_drill_ground', name: 'Weapon Drill Ground', type: 'training', description: 'An outdoor training ground with weapon dummies and targets.', maxLevel: 10, baseCost: 120, costMultiplier: 1.4, bonusPerLevel: 3, effect: '+3% weapon discipline power per level' },
  { id: 'se_struct_meditation_courtyard', name: 'Meditation Courtyard', type: 'training', description: 'A peaceful courtyard with silver fountains for mental training.', maxLevel: 10, baseCost: 80, costMultiplier: 1.3, bonusPerLevel: 4, effect: '+4% spirit discipline power per level' },
  { id: 'se_struct_sparring_arena', name: 'Sparring Arena', type: 'training', description: 'A circular arena where monks test their skills in controlled combat.', maxLevel: 10, baseCost: 150, costMultiplier: 1.5, bonusPerLevel: 6, effect: '+6% monk combat effectiveness per level' },
  { id: 'se_struct_shadow_training_room', name: 'Shadow Training Room', type: 'training', description: 'A dark room where monks train against shadow illusions of themselves.', maxLevel: 10, baseCost: 200, costMultiplier: 1.5, bonusPerLevel: 4, effect: '+4% defense and counter-attack per level' },
  // ── Meditation (4) ──────────────────────────────────────────────
  { id: 'se_struct_meditation_chamber', name: 'Meditation Chamber', type: 'meditation', description: 'A quiet chamber lined with silver mirrors for deep meditation.', maxLevel: 10, baseCost: 90, costMultiplier: 1.3, bonusPerLevel: 5, effect: '+5% XP recovery rate per level' },
  { id: 'se_struct_zen_garden', name: 'Zen Garden', type: 'meditation', description: 'A serene garden with raked silver sand and miniature silver trees.', maxLevel: 10, baseCost: 110, costMultiplier: 1.35, bonusPerLevel: 3, effect: '+3% monk happiness per level' },
  { id: 'se_struct_spirit_well', name: 'Spirit Well', type: 'meditation', description: 'A mystical well that draws spirit energy from deep within the mountain.', maxLevel: 10, baseCost: 180, costMultiplier: 1.45, bonusPerLevel: 8, effect: '+8% spirit ability effectiveness per level' },
  { id: 'se_struct_star_gazing_tower', name: 'Star Gazing Tower', type: 'meditation', description: 'A tall tower with a silver dome for observing stars and gathering cosmic energy.', maxLevel: 10, baseCost: 250, costMultiplier: 1.5, bonusPerLevel: 6, effect: '+6% night combat bonus per level' },
  // ── Weapon (4) ──────────────────────────────────────────────────
  { id: 'se_struct_silver_weapon_rack', name: 'Silver Weapon Rack', type: 'weapon', description: 'A display rack holding masterwork silver weapons for the monks.', maxLevel: 10, baseCost: 130, costMultiplier: 1.4, bonusPerLevel: 4, effect: '+4% weapon damage per level' },
  { id: 'se_struct_blade_sharpening_station', name: 'Blade Sharpening Station', type: 'weapon', description: 'A specialized station with silver whetstones for keeping blades razor-sharp.', maxLevel: 10, baseCost: 100, costMultiplier: 1.35, bonusPerLevel: 3, effect: '+3% critical hit chance per level' },
  { id: 'se_struct_armor_forge', name: 'Armor Forge', type: 'weapon', description: 'A heavy forge for crafting silver armor plating and protective gear.', maxLevel: 10, baseCost: 200, costMultiplier: 1.45, bonusPerLevel: 5, effect: '+5% defense per level' },
  { id: 'se_struct_hammer_anvil', name: 'Hammer Anvil', type: 'weapon', description: 'A legendary anvil blessed by the Forge of Creation for weapon forging.', maxLevel: 10, baseCost: 160, costMultiplier: 1.4, bonusPerLevel: 4, effect: '+4% forging success rate per level' },
  // ── Resource (4) ────────────────────────────────────────────────
  { id: 'se_struct_silver_mine_shaft', name: 'Silver Mine Shaft', type: 'resource', description: 'A deep mine shaft that extracts raw silver from the mountain core.', maxLevel: 10, baseCost: 200, costMultiplier: 1.5, bonusPerLevel: 10, effect: '+10 silver per hour per level' },
  { id: 'se_struct_refinery', name: 'Refinery', type: 'resource', description: 'A refinery that processes raw materials into refined silver goods.', maxLevel: 10, baseCost: 250, costMultiplier: 1.5, bonusPerLevel: 8, effect: '+8% refining output per level' },
  { id: 'se_struct_material_vault', name: 'Material Vault', type: 'resource', description: 'A secure vault for storing precious silver materials and alloys.', maxLevel: 10, baseCost: 120, costMultiplier: 1.3, bonusPerLevel: 50, effect: '+50 material storage capacity per level' },
  { id: 'se_struct_alchemy_lab', name: 'Alchemy Lab', type: 'resource', description: 'A laboratory for experimenting with silver-based alchemical compounds.', maxLevel: 10, baseCost: 300, costMultiplier: 1.55, bonusPerLevel: 5, effect: '+5% rare material discovery chance per level' },
  // ── Defense (4) ─────────────────────────────────────────────────
  { id: 'se_struct_enclave_wall', name: 'Enclave Wall', type: 'defense', description: 'Massive silver-reinforced walls protecting the enclave from invaders.', maxLevel: 10, baseCost: 300, costMultiplier: 1.6, bonusPerLevel: 10, effect: '+10% siege defense per level' },
  { id: 'se_struct_watch_tower', name: 'Watch Tower', type: 'defense', description: 'Tall silver towers that provide early warning of approaching threats.', maxLevel: 10, baseCost: 180, costMultiplier: 1.45, bonusPerLevel: 15, effect: '+15% enemy detection range per level' },
  { id: 'se_struct_trap_hallway', name: 'Trap Hallway', type: 'defense', description: 'A corridor rigged with silver traps that slow and damage intruders.', maxLevel: 10, baseCost: 150, costMultiplier: 1.4, bonusPerLevel: 8, effect: '+8% trap damage per level' },
  { id: 'se_struct_guard_barracks', name: 'Guard Barracks', type: 'defense', description: 'Housing for the enclave guard, increasing patrol effectiveness.', maxLevel: 10, baseCost: 220, costMultiplier: 1.5, bonusPerLevel: 12, effect: '+12 guard capacity per level' },
  // ── Ceremonial (2) ──────────────────────────────────────────────
  { id: 'se_struct_ceremony_hall', name: 'Ceremony Hall', type: 'ceremonial', description: 'A grand hall where sacred silver ceremonies and rituals are performed.', maxLevel: 10, baseCost: 400, costMultiplier: 1.6, bonusPerLevel: 10, effect: '+10% ceremony effectiveness per level' },
  { id: 'se_struct_altar_of_silver', name: 'Altar of Silver', type: 'ceremonial', description: 'The most sacred altar in the enclave, radiating pure silver energy.', maxLevel: 10, baseCost: 500, costMultiplier: 1.65, bonusPerLevel: 15, effect: '+15% ceremony rewards per level' },
  // ── Storage (2) ─────────────────────────────────────────────────
  { id: 'se_struct_reliquary', name: 'Reliquary', type: 'storage', description: 'A sacred vault for storing discovered artifacts and holy relics.', maxLevel: 10, baseCost: 200, costMultiplier: 1.4, bonusPerLevel: 5, effect: '+5 artifact storage slots per level' },
  { id: 'se_struct_archive_chamber', name: 'Archive Chamber', type: 'storage', description: 'A vast library containing centuries of silver enclave knowledge and scrolls.', maxLevel: 10, baseCost: 160, costMultiplier: 1.35, bonusPerLevel: 3, effect: '+3% research speed per level' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: SILVER ABILITIES (22 — 8 disciplines, 2-3 each)
// ═══════════════════════════════════════════════════════════════════

const SE_ABILITIES: readonly SEAbilityDef[] = [
  // ── Sword (3) ───────────────────────────────────────────────────
  { id: 'se_abl_silver_slash', name: 'Silver Slash', discipline: 'sword', tier: 'basic', description: 'A basic sword technique infused with silver energy.', effect: 'Deals 150% weapon damage with silver energy bonus.', cooldown: 5, requiredLevel: 1, monkRequirement: 1 },
  { id: 'se_abl_crescent_moon_blade', name: 'Crescent Moon Blade', discipline: 'sword', tier: 'advanced', description: 'An advanced technique that creates a crescent-shaped energy projectile.', effect: 'Fires a crescent projectile dealing 200% damage in a wide arc.', cooldown: 12, requiredLevel: 10, monkRequirement: 2 },
  { id: 'se_abl_infinite_sword_rain', name: 'Infinite Sword Rain', discipline: 'sword', tier: 'master', description: 'A master technique that summons a rain of ethereal silver swords from the sky.', effect: 'Rains 20 silver swords over a 10m area dealing 300% total damage.', cooldown: 30, requiredLevel: 25, monkRequirement: 3 },
  // ── Poison (3) ──────────────────────────────────────────────────
  { id: 'se_abl_silver_venom_strike', name: 'Silver Venom Strike', discipline: 'poison', tier: 'basic', description: 'Coats the weapon in a silver-based venom that weakens enemies.', effect: 'Applies Silver Venom dealing 10 damage per second for 8 seconds.', cooldown: 6, requiredLevel: 1, monkRequirement: 1 },
  { id: 'se_abl_toxic_mist_cloud', name: 'Toxic Mist Cloud', discipline: 'poison', tier: 'advanced', description: 'Creates a thick cloud of silver-laced toxic mist.', effect: 'Creates a 6m mist cloud dealing 15 damage per second for 10 seconds.', cooldown: 15, requiredLevel: 12, monkRequirement: 2 },
  { id: 'se_abl_pandemic_touch', name: 'Pandemic Touch', discipline: 'poison', tier: 'master', description: 'A master poison technique that infects all nearby enemies simultaneously.', effect: 'Infects all enemies within 12m with an escalating poison lasting 15 seconds.', cooldown: 35, requiredLevel: 28, monkRequirement: 3 },
  // ── Fist (3) ────────────────────────────────────────────────────
  { id: 'se_abl_silver_fist_strike', name: 'Silver Fist Strike', discipline: 'fist', tier: 'basic', description: 'Empowers the fist with silver energy for a devastating punch.', effect: 'Deals 180% unarmed damage with a 20% stun chance.', cooldown: 5, requiredLevel: 1, monkRequirement: 1 },
  { id: 'se_abl_iron_body', name: 'Iron Body', discipline: 'fist', tier: 'advanced', description: 'Temporarily hardens the monk\'s body into living silver armor.', effect: 'Grants 50% damage reduction for 8 seconds.', cooldown: 18, requiredLevel: 10, monkRequirement: 2 },
  { id: 'se_abl_shattering_palm', name: 'Shattering Palm', discipline: 'fist', tier: 'master', description: 'A devastating palm strike that shatters through any defense.', effect: 'Deals 350% damage that ignores all shields and armor for 1 target.', cooldown: 25, requiredLevel: 22, monkRequirement: 3 },
  // ── Palm (3) ────────────────────────────────────────────────────
  { id: 'se_abl_healing_palm', name: 'Healing Palm', discipline: 'palm', tier: 'basic', description: 'Channels healing silver energy through the palm to restore vitality.', effect: 'Heals a target for 25% of max HP.', cooldown: 8, requiredLevel: 1, monkRequirement: 1 },
  { id: 'se_abl_silver_wind_palm', name: 'Silver Wind Palm', discipline: 'palm', tier: 'advanced', description: 'Releases a powerful ranged palm attack riding on silver wind currents.', effect: 'Fires a wind palm projectile dealing 180% damage at 8m range.', cooldown: 10, requiredLevel: 11, monkRequirement: 2 },
  { id: 'se_abl_resurrection_palm', name: 'Resurrection Palm', discipline: 'palm', tier: 'master', description: 'A miraculous technique that can bring fallen allies back to life.', effect: 'Revives a fallen ally with 30% HP. Once per battle.', cooldown: 60, requiredLevel: 30, monkRequirement: 3 },
  // ── Blade (3) ───────────────────────────────────────────────────
  { id: 'se_abl_twin_blade_dance', name: 'Twin Blade Dance', discipline: 'blade', tier: 'basic', description: 'A rapid dual-blade combo that overwhelms enemies with speed.', effect: 'Unleashes 5 rapid strikes dealing 40% damage each.', cooldown: 6, requiredLevel: 1, monkRequirement: 1 },
  { id: 'se_abl_blade_storm', name: 'Blade Storm', discipline: 'blade', tier: 'advanced', description: 'A spinning blade attack that creates a deadly whirlwind of steel.', effect: 'Spins dealing 60% damage per second to all enemies within 4m for 5 seconds.', cooldown: 14, requiredLevel: 13, monkRequirement: 2 },
  { id: 'se_abl_thousand_blade_illusion', name: 'Thousand Blade Illusion', discipline: 'blade', tier: 'master', description: 'Creates phantom blades that attack from every direction simultaneously.', effect: 'Summons 12 phantom blades that each deal 50% damage independently.', cooldown: 28, requiredLevel: 26, monkRequirement: 3 },
  // ── Chain (3) ───────────────────────────────────────────────────
  { id: 'se_abl_silver_chain_whip', name: 'Silver Chain Whip', discipline: 'chain', tier: 'basic', description: 'Lashes out with a silver chain at extended range.', effect: 'Deals 140% damage at 6m range with 30% snare chance.', cooldown: 5, requiredLevel: 1, monkRequirement: 1 },
  { id: 'se_abl_binding_chains', name: 'Binding Chains', discipline: 'chain', tier: 'advanced', description: 'Wraps silver chains around a target, completely immobilizing them.', effect: 'Immobilizes a target for 4 seconds, dealing 100% damage.', cooldown: 12, requiredLevel: 14, monkRequirement: 2 },
  { id: 'se_abl_chain_prison', name: 'Chain Prison', discipline: 'chain', tier: 'master', description: 'Creates a massive cage of chains that traps all enemies in an area.', effect: 'Traps all enemies within 8m in chains for 6 seconds, dealing 50% damage per second.', cooldown: 32, requiredLevel: 27, monkRequirement: 3 },
  // ── Hammer (2) ──────────────────────────────────────────────────
  { id: 'se_abl_forge_hammer_strike', name: 'Forge Hammer Strike', discipline: 'hammer', tier: 'basic', description: 'A devastating overhead hammer strike with the force of a forge press.', effect: 'Deals 200% damage with a 30% knockback chance.', cooldown: 7, requiredLevel: 1, monkRequirement: 1 },
  { id: 'se_abl_earthquake_slam', name: 'Earthquake Slam', discipline: 'hammer', tier: 'master', description: 'Slams the hammer into the ground, causing a devastating earthquake.', effect: 'Creates a shockwave dealing 250% damage in a 10m radius, stunning all enemies for 3 seconds.', cooldown: 35, requiredLevel: 29, monkRequirement: 2 },
  // ── Spirit (2) ──────────────────────────────────────────────────
  { id: 'se_abl_silver_aura_shield', name: 'Silver Aura Shield', discipline: 'spirit', tier: 'basic', description: 'Surrounds the monk with a protective aura of silver spirit energy.', effect: 'Creates a shield absorbing 200 damage for 10 seconds.', cooldown: 12, requiredLevel: 5, monkRequirement: 1 },
  { id: 'se_abl_spirit_weapon_manifestation', name: 'Spirit Weapon Manifestation', discipline: 'spirit', tier: 'master', description: 'Temporarily enhances all allied weapons with powerful spirit energy.', effect: 'All allies gain +40% weapon damage for 12 seconds.', cooldown: 40, requiredLevel: 35, monkRequirement: 2 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: ACHIEVEMENTS (18)
// ═══════════════════════════════════════════════════════════════════

const SE_ACHIEVEMENTS: readonly SEAchievementDef[] = [
  { id: 'se_ach_first_recruit', name: 'First Recruit', description: 'Recruit your first silver monk into the enclave.', conditionKey: 'totalRecruited', targetValue: 1, rewardSilver: 25, rewardXp: 50 },
  { id: 'se_ach_recruit_10', name: 'Growing Order', description: 'Recruit 10 silver monks to strengthen the enclave.', conditionKey: 'totalRecruited', targetValue: 10, rewardSilver: 150, rewardXp: 300 },
  { id: 'se_ach_recruit_25', name: 'Thriving Enclave', description: 'Recruit 25 silver monks, creating a formidable order.', conditionKey: 'totalRecruited', targetValue: 25, rewardSilver: 400, rewardXp: 800 },
  { id: 'se_ach_all_common', name: 'Complete Foundation', description: 'Recruit all common monks to establish the base order.', conditionKey: 'totalRecruited', targetValue: 7, rewardSilver: 100, rewardXp: 200 },
  { id: 'se_ach_rare_find', name: 'Rare Discovery', description: 'Recruit a rare-tier monk into your enclave.', conditionKey: 'totalRecruited', targetValue: 1, rewardSilver: 200, rewardXp: 400 },
  { id: 'se_ach_epic_find', name: 'Epic Recruit', description: 'Recruit an epic-tier monk to lead your forces.', conditionKey: 'totalRecruited', targetValue: 1, rewardSilver: 500, rewardXp: 1000 },
  { id: 'se_ach_legendary_find', name: 'Legend Arrives', description: 'Recruit a legendary monk — a truly momentous occasion.', conditionKey: 'totalRecruited', targetValue: 1, rewardSilver: 1500, rewardXp: 3000 },
  { id: 'se_ach_all_disciplines', name: 'Seven Paths Mastered', description: 'Recruit monks from all 7 core disciplines.', conditionKey: 'totalRecruited', targetValue: 7, rewardSilver: 300, rewardXp: 600 },
  { id: 'se_ach_first_refine', name: 'Silver Smelter', description: 'Refine your first batch of silver materials.', conditionKey: 'totalRefined', targetValue: 1, rewardSilver: 30, rewardXp: 60 },
  { id: 'se_ach_refine_50', name: 'Master Refiner', description: 'Refine 50 materials total, becoming a master smelter.', conditionKey: 'totalRefined', targetValue: 50, rewardSilver: 350, rewardXp: 700 },
  { id: 'se_ach_first_forge', name: 'First Forging', description: 'Forge your first weapon at the enclave forge.', conditionKey: 'totalForged', targetValue: 1, rewardSilver: 40, rewardXp: 80 },
  { id: 'se_ach_first_structure', name: 'Foundation Laid', description: 'Build your first enclave structure.', conditionKey: 'totalBuilt', targetValue: 1, rewardSilver: 50, rewardXp: 100 },
  { id: 'se_ach_structure_10', name: 'Expanding Walls', description: 'Build 10 structures to create a thriving enclave.', conditionKey: 'totalBuilt', targetValue: 10, rewardSilver: 300, rewardXp: 600 },
  { id: 'se_ach_level_10', name: 'Rising Power', description: 'Reach enclave level 10.', conditionKey: 'enclaveLevel', targetValue: 10, rewardSilver: 200, rewardXp: 400 },
  { id: 'se_ach_level_25', name: 'Silver Fortress', description: 'Reach enclave level 25, establishing a true fortress.', conditionKey: 'enclaveLevel', targetValue: 25, rewardSilver: 800, rewardXp: 1600 },
  { id: 'se_ach_first_ceremony', name: 'Sacred Ritual', description: 'Perform your first silver ceremony at the altar.', conditionKey: 'totalCeremonies', targetValue: 1, rewardSilver: 60, rewardXp: 120 },
  { id: 'se_ach_five_artifacts', name: 'Artifact Collector', description: 'Discover 5 legendary silver artifacts.', conditionKey: 'foundArtifactIds', targetValue: 5, rewardSilver: 500, rewardXp: 1000 },
  { id: 'se_ach_all_titles', name: 'Title Master', description: 'Unlock all available silver enclave titles.', conditionKey: 'enclaveLevel', targetValue: 50, rewardSilver: 2000, rewardXp: 4000 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: TITLES (8 — Silver Initiate → Silver God)
// ═══════════════════════════════════════════════════════════════════

const SE_TITLES: readonly SETitleDef[] = [
  { id: 'se_title_initiate', name: 'Silver Initiate', requiredLevel: 1, description: 'A newcomer to the Silver Enclave, beginning their path of silver.', bonusPower: 0, bonusSilverRate: 0 },
  { id: 'se_title_acolyte', name: 'Silver Acolyte', requiredLevel: 5, description: 'An initiated member who has proven their dedication to the silver path.', bonusPower: 5, bonusSilverRate: 5 },
  { id: 'se_title_disciple', name: 'Silver Disciple', requiredLevel: 10, description: 'A devoted disciple who trains daily in the silver arts and disciplines.', bonusPower: 12, bonusSilverRate: 10 },
  { id: 'se_title_warden', name: 'Silver Warden', requiredLevel: 18, description: 'A guardian of the enclave, sworn to protect the silver mountain and its secrets.', bonusPower: 20, bonusSilverRate: 18 },
  { id: 'se_title_commander', name: 'Silver Commander', requiredLevel: 25, description: 'A seasoned commander who leads monk squads into the most dangerous sanctums.', bonusPower: 30, bonusSilverRate: 25 },
  { id: 'se_title_sovereign', name: 'Silver Sovereign', requiredLevel: 33, description: 'A ruler of the silver domain, commanding respect from allies and fear from enemies.', bonusPower: 45, bonusSilverRate: 35 },
  { id: 'se_title_exarch', name: 'Silver Exarch', requiredLevel: 42, description: 'A supreme exarch whose power rivals the ancient founders of the enclave.', bonusPower: 65, bonusSilverRate: 50 },
  { id: 'se_title_god', name: 'Silver God', requiredLevel: 50, description: 'The ultimate title — a being of pure silver energy, approaching divinity itself.', bonusPower: 100, bonusSilverRate: 75 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: LEGENDARY ARTIFACTS (15)
// ═══════════════════════════════════════════════════════════════════

const SE_ARTIFACTS: readonly SEArtifactDef[] = [
  {
    id: 'se_art_moonlit_katana',
    name: 'Moonlit Silver Katana',
    rarity: 'rare',
    discipline: 'sword',
    description: 'A katana forged under a full moon that glows with lunar silver energy.',
    lore: 'The Moonlit Silver Katana was forged by the first sword master of the enclave during a blood moon eclipse. Its edge never dulls and it grows stronger at night.',
    power: 45,
    effect: '+20% damage at night; glow effect reveals hidden enemies',
  },
  {
    id: 'se_art_jade_serpent_dagger',
    name: 'Jade Serpent Dagger',
    rarity: 'rare',
    discipline: 'poison',
    description: 'A green-jade dagger with a silver serpent coiled around the hilt.',
    lore: 'The Jade Serpent Dagger secretes a poison so refined that the victim feels nothing until it is too late. Its original owner ruled a poison kingdom for centuries.',
    power: 38,
    effect: 'Poisoned strikes deal triple damage over 10 seconds',
  },
  {
    id: 'se_art_iron_fists_of_bao',
    name: 'Iron Fists of Bao',
    rarity: 'uncommon',
    discipline: 'fist',
    description: 'Heavy silver gauntlets that turn any punch into a devastating blow.',
    lore: 'Bao the Unyielding wore these gauntlets when he punched a hole through the enclave mountain wall to create the eastern entrance.',
    power: 32,
    effect: '+30% unarmed damage; punches create shockwaves in a 2m radius',
  },
  {
    id: 'se_art_lotus_palm_gauntlets',
    name: 'Lotus Palm Gauntlets',
    rarity: 'epic',
    discipline: 'palm',
    description: 'Elegant silver gauntlets engraved with lotus patterns that radiate healing energy.',
    lore: 'Crafted by the Silver Sage Po, these gauntlets can channel the life force of a thousand lotus blossoms through a single touch.',
    power: 55,
    effect: '+40% healing effectiveness; passive healing aura within 3m',
  },
  {
    id: 'se_art_twin_shard_blades',
    name: 'Twin Shard Blades',
    rarity: 'rare',
    discipline: 'blade',
    description: 'A pair of perfectly matched silver shards honed into lethal blades.',
    lore: 'These blades were cut from a single massive silver crystal found in the heart of the mountain. They vibrate when near each other.',
    power: 42,
    effect: '+15% attack speed when dual-wielding; blades resonate for bonus AoE',
  },
  {
    id: 'se_art_chain_of_shadows',
    name: 'Chain of Shadows',
    rarity: 'uncommon',
    discipline: 'chain',
    description: 'A chain made from shadow-infused silver that becomes invisible in darkness.',
    lore: 'The Chain of Shadows was pulled from the deepest sanctum by the first chain master. It moves on its own in complete darkness.',
    power: 35,
    effect: 'Chain attacks from stealth deal 50% bonus damage; invisible in dark areas',
  },
  {
    id: 'se_art_thunder_hammer_grimm',
    name: 'Thunder Hammer of Grimm',
    rarity: 'rare',
    discipline: 'hammer',
    description: 'A massive war hammer crackling with captured lightning from Silver Peak.',
    lore: 'When Grimm struck the summit of Silver Peak during a thunderstorm, the mountain itself forged this hammer from a bolt of pure lightning.',
    power: 50,
    effect: 'Every 3rd hit releases a lightning bolt; 25% chance to stun all enemies in 4m',
  },
  {
    id: 'se_art_silver_sages_staff',
    name: 'Silver Sage\'s Staff',
    rarity: 'epic',
    discipline: 'spirit',
    description: 'An ancient staff topped with a silver orb containing a trapped spirit.',
    lore: 'The spirit within this staff is said to be the first elder of the enclave, who chose to remain as a guide for future generations.',
    power: 58,
    effect: '+50% spirit ability power; staff orb pulses to reveal hidden paths',
  },
  {
    id: 'se_art_adamantine_silver_armor',
    name: 'Adamantine Silver Armor',
    rarity: 'legendary',
    discipline: 'none',
    description: 'Full plate armor forged from Adamantine Silver, nearly indestructible.',
    lore: 'This armor was forged during the Siege of Ten Thousand, when the enclave faced its greatest threat. It has never been breached.',
    power: 90,
    effect: '50% damage reduction from all sources; reflects 20% melee damage back to attackers',
  },
  {
    id: 'se_art_eternal_silver_chalice',
    name: 'Eternal Silver Chalice',
    rarity: 'legendary',
    discipline: 'none',
    description: 'A chalice that never empties, providing infinite silver healing energy.',
    lore: 'The Eternal Silver Chalice was a gift from the mountain spirit itself. Water drawn from it cures any ailment and extends life.',
    power: 85,
    effect: 'Full HP restore once per battle; passive regeneration of 2% HP per second',
  },
  {
    id: 'se_art_starfire_forge_hammer',
    name: 'Starfire Forge Hammer',
    rarity: 'legendary',
    discipline: 'hammer',
    description: 'A hammer forged from a dying star, capable of forging legendary items.',
    lore: 'The Starfire Forge Hammer fell from the sky during the Celestial Convergence. With it, any material can be transformed into any other.',
    power: 95,
    effect: '+40% forging success rate; forged items gain 25% bonus power; creates starfire AoE',
  },
  {
    id: 'se_art_silver_gods_edge',
    name: 'Silver God\'s Edge',
    rarity: 'legendary',
    discipline: 'sword',
    description: 'The legendary sword of the Silver War God, said to cut through reality itself.',
    lore: 'Forged before the enclave existed, this sword was the weapon that the Silver War God used to carve the mountain from the earth.',
    power: 100,
    effect: 'All attacks ignore armor and shields; 30% chance to instantly defeat non-boss enemies',
  },
  {
    id: 'se_art_void_binder_chains',
    name: 'Void Binder Chains',
    rarity: 'legendary',
    discipline: 'chain',
    description: 'Chains that extend into the void dimension, binding anything across planes.',
    lore: 'The Void Binder Chains were used to seal the Great Void Rift. They exist simultaneously in all dimensions and can bind anything.',
    power: 92,
    effect: 'Can immobilize any enemy including bosses for 5 seconds; chains phase through walls',
  },
  {
    id: 'se_art_genesis_silver_core',
    name: 'Genesis Silver Core',
    rarity: 'legendary',
    discipline: 'none',
    description: 'The heart of the silver mountain itself, containing infinite creative energy.',
    lore: 'The Genesis Silver Core is the source of all silver in the mountain. Legends say it was the first thing created when the world was born.',
    power: 98,
    effect: '+50% to all monk stats; generates 100 silver per hour; reveals all sanctum secrets',
  },
  {
    id: 'se_art_philosopher_crown',
    name: 'Philosopher\'s Silver Crown',
    rarity: 'legendary',
    discipline: 'none',
    description: 'A crown made from Philosopher\'s Silver that grants supreme wisdom and power.',
    lore: 'Worn by the first Enclave Elder, this crown grants its wearer knowledge of all silver secrets past, present, and future.',
    power: 96,
    effect: '+30% XP gain; reveals optimal forging recipes; unlocks hidden ceremony effects',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: ENCLAVE EVENTS (12)
// ═══════════════════════════════════════════════════════════════════

const SE_EVENTS: readonly SEEventDef[] = [
  {
    id: 'se_evt_siege',
    name: 'Siege of the Silver Gate',
    type: 'siege',
    description: 'An army of shadow creatures besieges the enclave gates, testing your defenses.',
    duration: 300,
    effects: ['Enclave defense reduced by 20%', 'Monk combat XP doubled', 'Wall structures take damage'],
    rewards: ['Bonus silver from defeated enemies', 'Rare material drops', 'Defense experience'],
    severity: 7,
  },
  {
    id: 'se_evt_visitor',
    name: 'Wandering Master',
    type: 'visitor',
    description: 'A legendary wandering martial artist arrives at the enclave, offering wisdom.',
    duration: 600,
    effects: ['One random monk gains 50% XP boost for duration', 'Training costs halved', 'New abilities available'],
    rewards: ['Free monk training session', 'Exclusive technique scroll', 'Rare discipline knowledge'],
    severity: 1,
  },
  {
    id: 'se_evt_ceremony',
    name: 'Silver Moon Ceremony',
    type: 'ceremony',
    description: 'The silver moon aligns perfectly with the mountain, enabling a grand ceremony.',
    duration: 120,
    effects: ['Ceremony effectiveness increased by 100%', 'All monks gain silver aura', 'Spirit energy surges'],
    rewards: ['Double ceremony rewards', 'Random artifact discovery chance', 'Enclave XP bonus'],
    severity: 1,
  },
  {
    id: 'se_evt_eclipse',
    name: 'Lunar Eclipse',
    type: 'eclipse',
    description: 'A total lunar eclipse darkens the silver mountain, awakening shadow creatures.',
    duration: 480,
    effects: ['Shadow discipline power doubled', 'Poison effects enhanced by 50%', 'Visibility reduced'],
    rewards: ['Exclusive shadow materials', 'Shadow sanctum access', 'Rare monk encounter chance'],
    severity: 5,
  },
  {
    id: 'se_evt_discovery',
    name: 'Ancient Library Discovery',
    type: 'discovery',
    description: 'Miners break through into a sealed chamber filled with ancient silver scrolls.',
    duration: 360,
    effects: ['Research speed increased by 200%', 'New blueprint unlocks available', 'XP gain boosted'],
    rewards: ['Ancient forging recipes', 'Lost discipline techniques', 'History of the enclave'],
    severity: 2,
  },
  {
    id: 'se_evt_betrayal',
    name: 'Inner Circle Betrayal',
    type: 'betrayal',
    description: 'A trusted monk reveals themselves as a spy from a rival faction.',
    duration: 240,
    effects: ['One monk becomes unavailable', 'Enclave security compromised', 'Morale reduced'],
    rewards: ['Spy reveals enemy secrets', 'Loyalty bonuses for remaining monks', 'Counter-intelligence knowledge'],
    severity: 6,
  },
  {
    id: 'se_evt_festival',
    name: 'Festival of Silver Lights',
    type: 'festival',
    description: 'The annual festival where thousands of silver lanterns illuminate the mountain.',
    duration: 720,
    effects: ['All monk happiness increased', 'Recruitment costs reduced by 30%', 'Silver income doubled'],
    rewards: ['Festival exclusive items', 'Ceremony bonuses', 'Community reputation boost'],
    severity: 1,
  },
  {
    id: 'se_evt_cataclysm',
    name: 'Mountain Cataclysm',
    type: 'cataclysm',
    description: 'A massive earthquake shakes the silver mountain, damaging structures and opening new paths.',
    duration: 300,
    effects: ['Random structure damaged', 'New sanctum passages revealed', 'Mining output tripled'],
    rewards: ['Exposed rare mineral veins', 'New underground areas', 'Salvageable ancient materials'],
    severity: 8,
  },
  {
    id: 'se_evt_pilgrimage',
    name: 'Pilgrimage of the Faithful',
    type: 'pilgrimage',
    description: 'Hundreds of silver faithful journey to the enclave, bringing offerings and recruits.',
    duration: 900,
    effects: ['Recruitment pool expanded', 'Silver donations increased', 'Training queues filled'],
    rewards: ['New monk recruits', 'Silver offerings', 'Reputation and title progress'],
    severity: 1,
  },
  {
    id: 'se_evt_revelation',
    name: 'Revelation at the Altar',
    type: 'revelation',
    description: 'The Altar of Silver begins to glow with an ancient message from the founders.',
    duration: 180,
    effects: ['All spirit abilities enhanced', 'Hidden sanctuary paths revealed', 'XP multiplied by 3'],
    rewards: ['Founder\'s secret technique', 'Sacred silver relic', 'Permanent enlightenment bonus'],
    severity: 3,
  },
  {
    id: 'se_evt_insurrection',
    name: 'Monk Insurrection',
    type: 'insurrection',
    description: 'A faction of monks demands changes to the enclave leadership and traditions.',
    duration: 480,
    effects: ['Monk effectiveness reduced by 25%', 'Structure bonuses halved', 'Internal conflict'],
    rewards: ['Reformed enclave policies', 'Stronger monk loyalty after resolution', 'New governance options'],
    severity: 6,
  },
  {
    id: 'se_evt_convergence',
    name: 'Convergence of Silver Stars',
    type: 'convergence',
    description: 'A once-in-a-century celestial event where silver stars align above the mountain.',
    duration: 600,
    effects: ['All abilities enhanced by 50%', 'Legendary material discovery chance', 'Divine intervention possible'],
    rewards: ['Exclusive legendary artifact', 'Permanent stat bonuses', 'Title upgrade opportunity'],
    severity: 4,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: HELPER FUNCTIONS (hoisted with function declarations)
// ═══════════════════════════════════════════════════════════════════

function seCalcLevelFromXp(xp: number): number {
  if (xp < 100) return 1
  return Math.min(50, Math.floor(1 + Math.sqrt(xp / 50)))
}

function seCalcXpForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.floor(50 * (level - 1) * (level - 1))
}

function seCalcMonkTotalPower(monkId: string, store: SEStoreState): number {
  const def = SE_MONKS.find((m) => m.id === monkId)
  if (!def) return 0
  const rarityInfo = SE_RARITY_INFO[def.rarity]
  const titleDef = SE_TITLES.find((t) => t.id === store.currentTitleId)
  const titleBonus = titleDef ? titleDef.bonusPower : 0
  return Math.floor(def.basePower * rarityInfo.powerMultiplier + titleBonus)
}

function seCalcEnclaveDefense(store: SEStoreState): number {
  let totalDefense = store.enclaveLevel * 5
  for (const [structId, level] of Object.entries(store.structureLevels)) {
    const def = SE_STRUCTURES.find((s) => s.id === structId)
    if (def && def.type === 'defense') {
      totalDefense += Math.floor(def.bonusPerLevel * level)
    }
  }
  return totalDefense
}

function seCalcSilverIncome(store: SEStoreState): number {
  let income = store.enclaveLevel * 2
  for (const [structId, level] of Object.entries(store.structureLevels)) {
    const def = SE_STRUCTURES.find((s) => s.id === structId)
    if (def && def.type === 'resource') {
      income += Math.floor(def.bonusPerLevel * level)
    }
  }
  const titleDef = SE_TITLES.find((t) => t.id === store.currentTitleId)
  const silverRateBonus = titleDef ? titleDef.bonusSilverRate : 0
  income = Math.floor(income * (1 + silverRateBonus / 100))
  return income
}

function seFindDisciplineSynergy(discA: SEDiscipline, discB: SEDiscipline): SESynergy | null {
  return SE_DISCIPLINE_SYNERGIES.find(
    (s) => (s.disciplineA === discA && s.disciplineB === discB) || (s.disciplineA === discB && s.disciplineB === discA)
  ) ?? null
}

function seGetRecruitedDisciplines(store: SEStoreState): readonly SEDiscipline[] {
  const disciplines = new Set<SEDiscipline>()
  for (const monkId of store.recruitedMonkIds) {
    const def = SE_MONKS.find((m) => m.id === monkId)
    if (def) disciplines.add(def.discipline)
  }
  return Array.from(disciplines)
}

function seGetRarityColor(rarity: SERarity): string {
  return SE_RARITY_INFO[rarity]?.color ?? SE_COLOR_STEEL
}

function seGetDisciplineColor(discipline: SEDiscipline): string {
  return SE_DISCIPLINE_INFO[discipline]?.color ?? SE_COLOR_SILVER
}

function seGetUpgradeCost(structId: string, currentLevel: number): number {
  const def = SE_STRUCTURES.find((s) => s.id === structId)
  if (!def) return 0
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

function seCheckAchievementCondition(state: SEStoreState, achievementId: string): boolean {
  const ach = SE_ACHIEVEMENTS.find((a) => a.id === achievementId)
  if (!ach) return false
  switch (ach.conditionKey) {
    case 'totalRecruited':
      return state.totalRecruited >= ach.targetValue
    case 'totalRefined':
      return state.totalRefined >= ach.targetValue
    case 'totalForged':
      return state.totalForged >= ach.targetValue
    case 'totalBuilt':
      return state.totalBuilt >= ach.targetValue
    case 'totalCeremonies':
      return state.totalCeremonies >= ach.targetValue
    case 'enclaveLevel':
      return state.enclaveLevel >= ach.targetValue
    case 'foundArtifactIds':
      return state.foundArtifactIds.length >= ach.targetValue
    default:
      return false
  }
}

function seHasAllCommonMonks(store: SEStoreState): boolean {
  const commonMonks = SE_MONKS.filter((m) => m.rarity === 'common')
  return commonMonks.every((m) => store.recruitedMonkIds.includes(m.id))
}

function seHasMonkOfRarity(store: SEStoreState, rarity: SERarity): boolean {
  return store.recruitedMonkIds.some((id) => {
    const def = SE_MONKS.find((m) => m.id === id)
    return def !== undefined && def.rarity === rarity
  })
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const SE_INITIAL_SILVER = 200
const SE_MAX_LEVEL = 50

const useSEStore = create<SEStoreState>()(
  persist(
    (set, get) => ({
      // ── State ─────────────────────────────────────────────────
      recruitedMonkIds: [],
      materialQuantities: {},
      structureLevels: {},
      unlockedAbilityIds: [],
      earnedAchievementIds: [],
      currentTitleId: 'se_title_initiate',
      foundArtifactIds: [],
      completedCeremonyIds: [],
      silverBalance: SE_INITIAL_SILVER,
      enclaveLevel: 1,
      enclaveXp: 0,
      totalRecruited: 0,
      totalRefined: 0,
      totalForged: 0,
      totalBuilt: 0,
      totalCeremonies: 0,

      // ── recruitMonk ──────────────────────────────────────────
      recruitMonk: (monkId: string): boolean => {
        const state = get()
        const monkDef = SE_MONKS.find((m) => m.id === monkId)
        if (!monkDef) return false
        if (state.recruitedMonkIds.includes(monkId)) return false
        if (state.enclaveLevel < (monkDef.rarity === 'common' ? 1 : monkDef.rarity === 'uncommon' ? 3 : monkDef.rarity === 'rare' ? 8 : monkDef.rarity === 'epic' ? 18 : 30)) return false
        if (state.silverBalance < monkDef.recruitCost) return false

        const xpGain = Math.floor(monkDef.basePower * SE_RARITY_INFO[monkDef.rarity].xpBonus)
        set((prev) => ({
          recruitedMonkIds: [...prev.recruitedMonkIds, monkId],
          silverBalance: prev.silverBalance - monkDef.recruitCost,
          enclaveXp: prev.enclaveXp + xpGain,
          enclaveLevel: seCalcLevelFromXp(prev.enclaveXp + xpGain),
          totalRecruited: prev.totalRecruited + 1,
        }))
        return true
      },

      // ── collectMaterial ──────────────────────────────────────
      collectMaterial: (materialId: string, amount: number): boolean => {
        const state = get()
        const matDef = SE_MATERIALS.find((m) => m.id === materialId)
        if (!matDef) return false
        if (amount <= 0) return false

        set((prev) => ({
          materialQuantities: {
            ...prev.materialQuantities,
            [materialId]: (prev.materialQuantities[materialId] ?? 0) + amount,
          },
        }))
        return true
      },

      // ── refineSilver ─────────────────────────────────────────
      refineSilver: (materialId: string): boolean => {
        const state = get()
        const matDef = SE_MATERIALS.find((m) => m.id === materialId)
        if (!matDef) return false
        if (!matDef.refineFrom || matDef.refineFrom.length === 0) return false
        if (state.silverBalance < matDef.refineCost) return false

        const hasAllIngredients = matDef.refineFrom.every((ingId) => (state.materialQuantities[ingId] ?? 0) >= 1)
        if (!hasAllIngredients) return false

        const newQuantities = { ...state.materialQuantities }
        for (const ingId of matDef.refineFrom) {
          newQuantities[ingId] = (newQuantities[ingId] ?? 0) - 1
          if (newQuantities[ingId] <= 0) delete newQuantities[ingId]
        }
        newQuantities[materialId] = (newQuantities[materialId] ?? 0) + 1

        const xpGain = Math.floor(matDef.refineCost * 0.5)
        set((prev) => ({
          materialQuantities: newQuantities,
          silverBalance: prev.silverBalance - matDef.refineCost,
          enclaveXp: prev.enclaveXp + xpGain,
          enclaveLevel: seCalcLevelFromXp(prev.enclaveXp + xpGain),
          totalRefined: prev.totalRefined + 1,
        }))
        return true
      },

      // ── forgeWeapon ──────────────────────────────────────────
      forgeWeapon: (artifactId: string): boolean => {
        const state = get()
        const artDef = SE_ARTIFACTS.find((a) => a.id === artifactId)
        if (!artDef) return false
        if (state.foundArtifactIds.includes(artifactId)) return false
        if (state.silverBalance < artDef.power * 2) return false

        const xpGain = Math.floor(artDef.power * 2)
        set((prev) => ({
          foundArtifactIds: [...prev.foundArtifactIds, artifactId],
          silverBalance: prev.silverBalance - Math.floor(artDef.power * 2),
          enclaveXp: prev.enclaveXp + xpGain,
          enclaveLevel: seCalcLevelFromXp(prev.enclaveXp + xpGain),
          totalForged: prev.totalForged + 1,
        }))
        return true
      },

      // ── buildStructure ───────────────────────────────────────
      buildStructure: (structureId: string): boolean => {
        const state = get()
        const structDef = SE_STRUCTURES.find((s) => s.id === structureId)
        if (!structDef) return false
        if (state.structureLevels[structureId] !== undefined) return false
        if (state.silverBalance < structDef.baseCost) return false

        const xpGain = Math.floor(structDef.baseCost * 0.3)
        set((prev) => ({
          structureLevels: { ...prev.structureLevels, [structureId]: 1 },
          silverBalance: prev.silverBalance - structDef.baseCost,
          enclaveXp: prev.enclaveXp + xpGain,
          enclaveLevel: seCalcLevelFromXp(prev.enclaveXp + xpGain),
          totalBuilt: prev.totalBuilt + 1,
        }))
        return true
      },

      // ── upgradeStructure ─────────────────────────────────────
      upgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structDef = SE_STRUCTURES.find((s) => s.id === structureId)
        if (!structDef) return false
        const currentLevel = state.structureLevels[structureId] ?? 0
        if (currentLevel <= 0) return false
        if (currentLevel >= structDef.maxLevel) return false

        const cost = seGetUpgradeCost(structureId, currentLevel)
        if (state.silverBalance < cost) return false

        const xpGain = Math.floor(cost * 0.2)
        set((prev) => ({
          structureLevels: { ...prev.structureLevels, [structureId]: currentLevel + 1 },
          silverBalance: prev.silverBalance - cost,
          enclaveXp: prev.enclaveXp + xpGain,
          enclaveLevel: seCalcLevelFromXp(prev.enclaveXp + xpGain),
        }))
        return true
      },

      // ── unlockAbility ────────────────────────────────────────
      unlockAbility: (abilityId: string): boolean => {
        const state = get()
        const ablDef = SE_ABILITIES.find((a) => a.id === abilityId)
        if (!ablDef) return false
        if (state.unlockedAbilityIds.includes(abilityId)) return false
        if (state.enclaveLevel < ablDef.requiredLevel) return false

        const xpGain = Math.floor(ablDef.requiredLevel * 15)
        set((prev) => ({
          unlockedAbilityIds: [...prev.unlockedAbilityIds, abilityId],
          enclaveXp: prev.enclaveXp + xpGain,
          enclaveLevel: seCalcLevelFromXp(prev.enclaveXp + xpGain),
        }))
        return true
      },

      // ── earnAchievement ──────────────────────────────────────
      earnAchievement: (achievementId: string): boolean => {
        const state = get()
        if (state.earnedAchievementIds.includes(achievementId)) return false
        if (!seCheckAchievementCondition(state, achievementId)) return false

        const ach = SE_ACHIEVEMENTS.find((a) => a.id === achievementId)
        if (!ach) return false

        set((prev) => ({
          earnedAchievementIds: [...prev.earnedAchievementIds, achievementId],
          silverBalance: prev.silverBalance + ach.rewardSilver,
          enclaveXp: prev.enclaveXp + ach.rewardXp,
          enclaveLevel: seCalcLevelFromXp(prev.enclaveXp + ach.rewardXp),
        }))
        return true
      },

      // ── setTitle ─────────────────────────────────────────────
      setTitle: (titleId: string): boolean => {
        const state = get()
        const titleDef = SE_TITLES.find((t) => t.id === titleId)
        if (!titleDef) return false
        if (state.enclaveLevel < titleDef.requiredLevel) return false

        set({ currentTitleId: titleId })
        return true
      },

      // ── findArtifact ─────────────────────────────────────────
      findArtifact: (artifactId: string): void => {
        const state = get()
        if (state.foundArtifactIds.includes(artifactId)) return
        set((prev) => ({ foundArtifactIds: [...prev.foundArtifactIds, artifactId] }))
      },

      // ── performCeremony ──────────────────────────────────────
      performCeremony: (ceremonyId: string): boolean => {
        const state = get()
        if (state.completedCeremonyIds.includes(ceremonyId)) return false
        if (state.silverBalance < 100) return false

        const xpGain = 150
        set((prev) => ({
          completedCeremonyIds: [...prev.completedCeremonyIds, ceremonyId],
          silverBalance: prev.silverBalance - 100,
          enclaveXp: prev.enclaveXp + xpGain,
          enclaveLevel: seCalcLevelFromXp(prev.enclaveXp + xpGain),
          totalCeremonies: prev.totalCeremonies + 1,
        }))
        return true
      },

      // ── resetSilverEnclave ───────────────────────────────────
      resetSilverEnclave: (): void => {
        set({
          recruitedMonkIds: [],
          materialQuantities: {},
          structureLevels: {},
          unlockedAbilityIds: [],
          earnedAchievementIds: [],
          currentTitleId: 'se_title_initiate',
          foundArtifactIds: [],
          completedCeremonyIds: [],
          silverBalance: SE_INITIAL_SILVER,
          enclaveLevel: 1,
          enclaveXp: 0,
          totalRecruited: 0,
          totalRefined: 0,
          totalForged: 0,
          totalBuilt: 0,
          totalCeremonies: 0,
        })
      },
    }),
    {
      name: 'silver-enclave-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: DEFAULT EXPORT HOOK
// ═══════════════════════════════════════════════════════════════════

export default function useSilverEnclave() {
  const store = useSEStore()

  // ── Getter: Monk Roster ────────────────────────────────────────
  const seGetMonkRoster = useMemo(() => {
    return store.recruitedMonkIds.map((monkId) => {
      const def = SE_MONKS.find((m) => m.id === monkId)
      const totalPower = seCalcMonkTotalPower(monkId, store)
      return {
        monkId,
        def,
        totalPower,
        rarityColor: def ? seGetRarityColor(def.rarity) : SE_COLOR_STEEL,
        disciplineColor: def ? seGetDisciplineColor(def.discipline) : SE_COLOR_SILVER,
      }
    })
  }, [store])

  // ── Getter: Enclave Defense ────────────────────────────────────
  const seGetDefense = useMemo(() => seCalcEnclaveDefense(store), [store])

  // ── Getter: Silver Income ──────────────────────────────────────
  const seGetSilverIncome = useMemo(() => seCalcSilverIncome(store), [store])

  // ── Getter: Structure Details ──────────────────────────────────
  const seGetStructureDetails = useMemo(() => {
    return SE_STRUCTURES.map((structDef) => {
      const level = store.structureLevels[structDef.id] ?? 0
      const isBuilt = level > 0
      const isMaxed = level >= structDef.maxLevel
      const upgradeCost = isBuilt && !isMaxed ? seGetUpgradeCost(structDef.id, level) : 0
      return {
        ...structDef,
        level,
        isBuilt,
        isMaxed,
        upgradeCost,
        totalBonus: Math.floor(structDef.bonusPerLevel * level),
      }
    })
  }, [store])

  // ── Getter: Active Synergies ───────────────────────────────────
  const seGetActiveSynergies = useMemo(() => {
    const disciplines = seGetRecruitedDisciplines(store)
    const synergies: SESynergy[] = []
    for (const syn of SE_DISCIPLINE_SYNERGIES) {
      if (disciplines.includes(syn.disciplineA) && disciplines.includes(syn.disciplineB)) {
        synergies.push(syn)
      }
    }
    return synergies
  }, [store])

  // ── Getter: Material Inventory ─────────────────────────────────
  const seGetMaterialInventory = useMemo(() => {
    return SE_MATERIALS.map((matDef) => ({
      ...matDef,
      quantity: store.materialQuantities[matDef.id] ?? 0,
      canRefine: !!(matDef.refineFrom && matDef.refineFrom.length > 0 &&
        matDef.refineFrom.every((ingId) => (store.materialQuantities[ingId] ?? 0) >= 1)),
      canAffordRefine: store.silverBalance >= matDef.refineCost,
    }))
  }, [store])

  // ── Getter: Available Abilities ────────────────────────────────
  const seGetAvailableAbilities = useMemo(() => {
    return SE_ABILITIES.filter((ablDef) => {
      if (store.unlockedAbilityIds.includes(ablDef.id)) return false
      return store.enclaveLevel >= ablDef.requiredLevel
    })
  }, [store])

  // ── Getter: Unlocked Abilities ─────────────────────────────────
  const seGetUnlockedAbilities = useMemo(() => {
    return store.unlockedAbilityIds.map((id) => SE_ABILITIES.find((a) => a.id === id)).filter(Boolean)
  }, [store])

  // ── Getter: Achievement Progress ───────────────────────────────
  const seGetAchievementProgress = useMemo(() => {
    return SE_ACHIEVEMENTS.map((ach) => {
      const earned = store.earnedAchievementIds.includes(ach.id)
      let current = 0
      switch (ach.conditionKey) {
        case 'totalRecruited': current = store.totalRecruited; break
        case 'totalRefined': current = store.totalRefined; break
        case 'totalForged': current = store.totalForged; break
        case 'totalBuilt': current = store.totalBuilt; break
        case 'totalCeremonies': current = store.totalCeremonies; break
        case 'enclaveLevel': current = store.enclaveLevel; break
        case 'foundArtifactIds': current = store.foundArtifactIds.length; break
      }
      return {
        ...ach,
        earned,
        current,
        progress: Math.min(1, current / ach.targetValue),
      }
    })
  }, [store])

  // ── Getter: Title Progress ─────────────────────────────────────
  const seGetTitleProgress = useMemo(() => {
    return SE_TITLES.map((titleDef) => ({
      ...titleDef,
      isActive: store.currentTitleId === titleDef.id,
      isUnlocked: store.enclaveLevel >= titleDef.requiredLevel,
    }))
  }, [store])

  // ── Getter: Sanctum Access ─────────────────────────────────────
  const seGetSanctumAccess = useMemo(() => {
    return SE_SANCTUMS.map((sanctum) => ({
      ...sanctum,
      isAccessible: store.enclaveLevel >= sanctum.requiredLevel,
      hasBonusDiscipline: sanctum.monkDisciplineBonus !== null &&
        store.recruitedMonkIds.some((id) => {
          const def = SE_MONKS.find((m) => m.id === id)
          return def !== undefined && def.discipline === sanctum.monkDisciplineBonus
        }),
    }))
  }, [store])

  // ── Getter: Level Progress ─────────────────────────────────────
  const seLevelProgress = useMemo(() => {
    const nextLevel = Math.min(SE_MAX_LEVEL, store.enclaveLevel + 1)
    const currentLevelXp = seCalcXpForLevel(store.enclaveLevel)
    const nextLevelXp = seCalcXpForLevel(nextLevel)
    const xpInCurrentLevel = store.enclaveXp - currentLevelXp
    const xpNeeded = nextLevelXp - currentLevelXp
    return {
      currentLevel: store.enclaveLevel,
      nextLevel,
      currentXp: store.enclaveXp,
      xpInCurrentLevel,
      xpNeeded: nextLevel > store.enclaveLevel ? xpNeeded : 0,
      percent: nextLevel > store.enclaveLevel ? Math.floor((xpInCurrentLevel / xpNeeded) * 100) : 100,
      isMaxed: store.enclaveLevel >= SE_MAX_LEVEL,
    }
  }, [store])

  // ── Getter: Rarity Summary ─────────────────────────────────────
  const seGetRaritySummary = useMemo(() => {
    const summary = SE_RARITY_ORDER.map((rarity) => {
      const monks = SE_MONKS.filter((m) => m.rarity === rarity)
      const recruited = monks.filter((m) => store.recruitedMonkIds.includes(m.id)).length
      return { rarity, total: monks.length, recruited, allCollected: recruited >= monks.length }
    })
    return summary
  }, [store])

  // ── Getter: Discipline Summary ─────────────────────────────────
  const seGetDisciplineSummary = useMemo(() => {
    return SE_DISCIPLINES.map((disc) => {
      const info = SE_DISCIPLINE_INFO[disc]
      const monks = SE_MONKS.filter((m) => m.discipline === disc)
      const recruited = monks.filter((m) => store.recruitedMonkIds.includes(m.id)).length
      const abilities = SE_ABILITIES.filter((a) => a.discipline === disc)
      const unlocked = abilities.filter((a) => store.unlockedAbilityIds.includes(a.id)).length
      return {
        discipline: disc,
        info,
        monkCount: monks.length,
        recruitedCount: recruited,
        abilityCount: abilities.length,
        unlockedAbilityCount: unlocked,
        hasMonk: recruited > 0,
      }
    })
  }, [store])

  // ── Assemble seAPI (Pattern A: direct constants) ───────────────
  const seAPI = {
    // ── Constants ───────────────────────────────────────────────
    SE_MONKS,
    SE_SANCTUMS,
    SE_MATERIALS,
    SE_STRUCTURES,
    SE_ABILITIES,
    SE_ACHIEVEMENTS,
    SE_TITLES,
    SE_ARTIFACTS,
    SE_EVENTS,
    SE_DISCIPLINE_SYNERGIES,
    SE_DISCIPLINES,
    SE_RARITY_ORDER,
    SE_RARITY_INFO,
    SE_DISCIPLINE_INFO,
    SE_COLOR_SILVER,
    SE_COLOR_STEEL,
    SE_COLOR_MOONLIGHT,
    SE_COLOR_BLADE_WHITE,
    SE_COLOR_FORGE_ORANGE,
    SE_COLOR_SHADOW_GRAY,
    SE_COLOR_ICE_BLUE,
    SE_COLOR_HOLY_GOLD,

    // ── State ───────────────────────────────────────────────────
    recruitedMonkIds: store.recruitedMonkIds,
    materialQuantities: store.materialQuantities,
    structureLevels: store.structureLevels,
    unlockedAbilityIds: store.unlockedAbilityIds,
    earnedAchievementIds: store.earnedAchievementIds,
    currentTitleId: store.currentTitleId,
    foundArtifactIds: store.foundArtifactIds,
    completedCeremonyIds: store.completedCeremonyIds,
    silverBalance: store.silverBalance,
    enclaveLevel: store.enclaveLevel,
    enclaveXp: store.enclaveXp,
    totalRecruited: store.totalRecruited,
    totalRefined: store.totalRefined,
    totalForged: store.totalForged,
    totalBuilt: store.totalBuilt,
    totalCeremonies: store.totalCeremonies,

    // ── Actions ─────────────────────────────────────────────────
    recruitMonk: store.recruitMonk,
    collectMaterial: store.collectMaterial,
    refineSilver: store.refineSilver,
    forgeWeapon: store.forgeWeapon,
    buildStructure: store.buildStructure,
    upgradeStructure: store.upgradeStructure,
    unlockAbility: store.unlockAbility,
    earnAchievement: store.earnAchievement,
    setTitle: store.setTitle,
    findArtifact: store.findArtifact,
    performCeremony: store.performCeremony,
    resetSilverEnclave: store.resetSilverEnclave,

    // ── Getters ─────────────────────────────────────────────────
    seGetMonkRoster,
    seGetDefense,
    seGetSilverIncome,
    seGetStructureDetails,
    seGetActiveSynergies,
    seGetMaterialInventory,
    seGetAvailableAbilities,
    seGetUnlockedAbilities,
    seGetAchievementProgress,
    seGetTitleProgress,
    seGetSanctumAccess,
    seLevelProgress,
    seGetRaritySummary,
    seGetDisciplineSummary,
  }

  return seAPI
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: EXPORTED CONSTANTS & STATISTICS
// ═══════════════════════════════════════════════════════════════════

export const SE_TOTAL_MONK_TYPES: number = SE_MONKS.length
export const SE_TOTAL_SANCTUMS: number = SE_SANCTUMS.length
export const SE_TOTAL_MATERIALS: number = SE_MATERIALS.length
export const SE_TOTAL_STRUCTURES: number = SE_STRUCTURES.length
export const SE_TOTAL_ABILITIES: number = SE_ABILITIES.length
export const SE_TOTAL_ACHIEVEMENTS: number = SE_ACHIEVEMENTS.length
export const SE_TOTAL_TITLES: number = SE_TITLES.length
export const SE_TOTAL_ARTIFACTS: number = SE_ARTIFACTS.length
export const SE_TOTAL_EVENTS: number = SE_EVENTS.length
export const SE_MAX_STRUCTURE_LEVEL: number = 10
export const SE_MAX_MONK_LEVEL: number = 10
export const SE_INITIAL_SILVER_EXPORTED: number = SE_INITIAL_SILVER
export const SE_MAX_LEVEL_EXPORTED: number = SE_MAX_LEVEL

export const SE_CORE_DISCIPLINES: readonly SEDiscipline[] = ['sword', 'poison', 'fist', 'palm', 'blade', 'chain', 'hammer']

export const SE_STRUCTURE_TYPES: readonly SEStructureType[] = [
  'training', 'meditation', 'weapon', 'resource', 'defense', 'ceremonial', 'storage',
]

export const SE_EVENT_TYPES: readonly SEEventType[] = [
  'siege', 'visitor', 'ceremony', 'eclipse', 'discovery', 'betrayal',
  'festival', 'cataclysm', 'pilgrimage', 'revelation', 'insurrection', 'convergence',
]

export const SE_MODULE_STATS = {
  monkTypes: SE_MONKS.length,
  sanctums: SE_SANCTUMS.length,
  materials: SE_MATERIALS.length,
  structures: SE_STRUCTURES.length,
  abilities: SE_ABILITIES.length,
  achievements: SE_ACHIEVEMENTS.length,
  titles: SE_TITLES.length,
  artifacts: SE_ARTIFACTS.length,
  events: SE_EVENTS.length,
  disciplines: SE_DISCIPLINES.length,
  synergies: SE_DISCIPLINE_SYNERGIES.length,
  maxEnclaveLevel: SE_MAX_LEVEL,
  maxStructureLevel: 10,
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 18: RE-EXPORTED TYPES (for external consumption)
// ═══════════════════════════════════════════════════════════════════

export type {
  SERarity,
  SEDiscipline,
  SEMaterialTier,
  SEStructureType,
  SEEventType,
  SEAbilityTier,
  SERarityInfo,
  SEDisciplineInfo,
  SEMonkDef,
  SESanctumDef,
  SEMaterialDef,
  SEStructureDef,
  SEAbilityDef,
  SEAchievementDef,
  SETitleDef,
  SEArtifactDef,
  SEEventDef,
  SESynergy,
  SEStoreState,
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 19: THEME COLORS OBJECT
// ═══════════════════════════════════════════════════════════════════

export const SE_THEME_COLORS: Record<string, string> = {
  silver: SE_COLOR_SILVER,
  steel: SE_COLOR_STEEL,
  moonlight: SE_COLOR_MOONLIGHT,
  bladeWhite: SE_COLOR_BLADE_WHITE,
  forgeOrange: SE_COLOR_FORGE_ORANGE,
  shadowGray: SE_COLOR_SHADOW_GRAY,
  iceBlue: SE_COLOR_ICE_BLUE,
  holyGold: SE_COLOR_HOLY_GOLD,
  background: '#1a1a2e',
  surface: '#2d2d44',
  textPrimary: '#E8E8F0',
  textSecondary: '#A0A0B0',
  accent: SE_COLOR_SILVER,
  danger: '#E0115F',
  success: SE_COLOR_ICE_BLUE,
  warning: SE_COLOR_FORGE_ORANGE,
}

export const SE_DISCIPLINE_COLORS: Record<SEDiscipline, string> = {
  sword: SE_COLOR_BLADE_WHITE,
  poison: '#7CFC00',
  fist: SE_COLOR_SHADOW_GRAY,
  palm: SE_COLOR_SILVER,
  blade: '#B0C4DE',
  chain: '#A9A9A9',
  hammer: SE_COLOR_FORGE_ORANGE,
  spirit: SE_COLOR_MOONLIGHT,
}

export const SE_MATERIAL_TIER_COLORS: Record<SEMaterialTier, string> = {
  raw: '#8B7355',
  processed: SE_COLOR_STEEL,
  refined: SE_COLOR_ICE_BLUE,
  alloy: SE_COLOR_SILVER,
  essence: SE_COLOR_MOONLIGHT,
  legendary: SE_COLOR_HOLY_GOLD,
}

export const SE_STRUCTURE_TYPE_COLORS: Record<SEStructureType, string> = {
  training: SE_COLOR_FORGE_ORANGE,
  meditation: SE_COLOR_MOONLIGHT,
  weapon: SE_COLOR_BLADE_WHITE,
  resource: SE_COLOR_ICE_BLUE,
  defense: SE_COLOR_SHADOW_GRAY,
  ceremonial: SE_COLOR_HOLY_GOLD,
  storage: SE_COLOR_STEEL,
}
