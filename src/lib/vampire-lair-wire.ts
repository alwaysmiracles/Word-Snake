// ============================================================================
// Vampire Lair Wire — 吸血鬼巢穴
// A gothic vampire simulation with blood management, coffin resting,
// mortal infiltration, shapeshifting, coven politics, and lair customization.
// ============================================================================
// CRITICAL: No React imports above the default export hook at the bottom.
// No localStorage, window, document, setInterval, setTimeout.
// All named exports use vb prefix. No named functions starting with "use".
// ============================================================================

// ── Enums ────────────────────────────────────────────────────────────────────

export enum VbBloodline {
  Dracula = "Dracula",
  Carmilla = "Carmilla",
  Lestat = "Lestat",
  Strigois = "Strigois",
  Nosferatu = "Nosferatu",
  Tepes = "Tepes",
  Moroii = "Moroii",
  Upir = "Upir",
}

export enum VbShapeshiftForm {
  Human = "Human",
  Bat = "Bat",
  Wolf = "Wolf",
  Mist = "Mist",
  Shadow = "Shadow",
}

export enum VbHunterType {
  VanHelsing = "VanHelsing",
  Belmont = "Belmont",
  Witcher = "Witcher",
  Priest = "Priest",
  Crusader = "Crusader",
  Scholar = "Scholar",
}

export enum VbCovenRank {
  Fledgling = "Fledgling",
  Neophyte = "Neophyte",
  Acolyte = "Acolyte",
  Master = "Master",
  Elder = "Elder",
}

export enum VbCoffinType {
  Wood = "Wood",
  Iron = "Iron",
  SilverLined = "SilverLined",
  Marble = "Marble",
  Obsidian = "Obsidian",
}

export enum VbMoonPhase {
  NewMoon = "NewMoon",
  WaxingCrescent = "WaxingCrescent",
  FirstQuarter = "FirstQuarter",
  WaxingGibbous = "WaxingGibbous",
  FullMoon = "FullMoon",
  WaningGibbous = "WaningGibbous",
  LastQuarter = "LastQuarter",
  WaningCrescent = "WaningCrescent",
}

export enum VbRoomType {
  Crypt = "Crypt",
  BloodCellar = "BloodCellar",
  RitualChamber = "RitualChamber",
  TrophyHall = "TrophyHall",
  Library = "Library",
}

export enum VbVictimType {
  Peasant = "Peasant",
  Merchant = "Merchant",
  Noble = "Noble",
  Priestess = "Priestess",
  Soldier = "Soldier",
  Scholar = "Scholar",
  Bard = "Bard",
  Witch = "Witch",
  Child = "Child",
  Traveler = "Traveler",
  Gypsy = "Gypsy",
  Alchemist = "Alchemist",
}

export enum VbAchievementId {
  FirstBite = "FirstBite",
  Bloodhoard = "Bloodhoard",
  FullMoonRise = "FullMoonRise",
  CovenElder = "CovenElder",
  ObsidianSlumber = "ObsidianSlumber",
  MasterOfShadows = "MasterOfShadows",
  HunterSlayer = "HunterSlayer",
  NightStalker = "NightStalker",
  BloodlinePure = "BloodlinePure",
  LairArchitect = "LairArchitect",
  DailyDevourer = "DailyDevourer",
  Undying = "Undying",
  ThousandBites = "ThousandBites",
  ShadowRealm = "ShadowRealm",
  CrimsonEmperor = "CrimsonEmperor",
}

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface VbBloodlineInfo {
  readonly id: VbBloodline;
  readonly name: string;
  readonly power: string;
  readonly passive: string;
  readonly huntBonus: number;
  readonly restBonus: number;
  readonly shapeshiftBonus: number;
  readonly stealthBonus: number;
  readonly lore: string;
}

export interface VbVictimInfo {
  readonly id: VbVictimType;
  readonly name: string;
  readonly bloodQuality: number;
  readonly bloodAmount: number;
  readonly dangerLevel: number;
  readonly escapeChance: number;
  readonly lore: string;
}

export interface VbHunterInfo {
  readonly id: VbHunterType;
  readonly name: string;
  readonly detection: number;
  readonly lethality: number;
  readonly weakness: string;
  readonly lore: string;
}

export interface VbCoffinInfo {
  readonly id: VbCoffinType;
  readonly name: string;
  readonly restQuality: number;
  readonly protection: number;
  readonly cost: number;
  readonly lore: string;
}

export interface VbRoomInfo {
  readonly id: VbRoomType;
  readonly name: string;
  readonly baseBonus: number;
  readonly maxLevel: number;
  readonly lore: string;
}

export interface VbAchievement {
  readonly id: VbAchievementId;
  readonly name: string;
  readonly description: string;
  readonly requirement: number;
  readonly category: string;
  readonly lore: string;
}

export interface VbShapeshiftState {
  readonly form: VbShapeshiftForm;
  readonly durationRemaining: number;
  readonly powerMultiplier: number;
  readonly stealthBonus: number;
  readonly speedBonus: number;
}

export interface VbHuntResult {
  readonly success: boolean;
  readonly victimType: VbVictimType;
  readonly bloodGained: number;
  readonly xpGained: number;
  readonly detected: boolean;
  readonly hunterEncounter: boolean;
  readonly hunterType: VbHunterType | null;
  readonly message: string;
}

export interface VbRestResult {
  readonly healthRestored: number;
  readonly powerRestored: number;
  readonly bloodConsumed: number;
  readonly coffinBonus: number;
  readonly moonBonus: number;
  readonly newAchievements: readonly VbAchievementId[];
  readonly message: string;
}

export interface VbShapeshiftResult {
  readonly success: boolean;
  readonly newForm: VbShapeshiftForm;
  readonly duration: number;
  readonly bonuses: VbShapeshiftState;
  readonly message: string;
}

export interface VbCovenAction {
  readonly success: boolean;
  readonly rankGained: boolean;
  readonly newRank: VbCovenRank | null;
  readonly influenceGained: number;
  readonly message: string;
}

export interface VbHunterEncounterResult {
  readonly survived: boolean;
  readonly hunterDefeated: boolean;
  readonly damageTaken: number;
  readonly xpGained: number;
  readonly message: string;
}

export interface VbRoomUpgrade {
  readonly roomId: VbRoomType;
  readonly newLevel: number;
  readonly cost: number;
  readonly success: boolean;
  readonly message: string;
}

export interface VbBloodShareResult {
  readonly success: boolean;
  readonly amountShared: number;
  readonly covenReputation: number;
  readonly message: string;
}

export interface VbDailyHuntResult {
  readonly totalBlood: number;
  readonly totalXP: number;
  readonly victims: readonly VbVictimType[];
  readonly huntersFought: number;
  readonly huntersDefeated: number;
  readonly newAchievements: readonly VbAchievementId[];
  readonly message: string;
}

export interface VbLairState {
  readonly rooms: Record<VbRoomType, number>;
  readonly totalDecorations: number;
  readonly ambiance: number;
  readonly securityLevel: number;
}

export interface VbMoonState {
  readonly phase: VbMoonPhase;
  readonly dayInCycle: number;
  readonly powerMultiplier: number;
  readonly isFullMoon: boolean;
  readonly isNewMoon: boolean;
}

export interface VbCovenState {
  readonly rank: VbCovenRank;
  readonly influence: number;
  readonly reputation: number;
  readonly members: number;
  readonly loyalty: number;
}

export interface VbVampireStats {
  readonly level: number;
  readonly xp: number;
  readonly xpToNext: number;
  readonly maxHealth: number;
  readonly health: number;
  readonly maxPower: number;
  readonly power: number;
  readonly totalBloodDrunk: number;
  readonly totalHunts: number;
  readonly totalKills: number;
  readonly totalHunterDefeats: number;
  readonly totalRests: number;
  readonly totalShapeshifts: number;
  readonly daysSurvived: number;
}

export interface VbBloodPool {
  readonly current: number;
  readonly max: number;
  readonly purity: number;
  readonly storedTypes: readonly VbVictimType[];
}

export interface VbVampireLairState {
  readonly vampireName: string;
  readonly bloodline: VbBloodline;
  readonly stats: VbVampireStats;
  readonly bloodPool: VbBloodPool;
  readonly coffinType: VbCoffinType;
  readonly shapeshift: VbShapeshiftState;
  readonly coven: VbCovenState;
  readonly lair: VbLairState;
  readonly moon: VbMoonState;
  readonly achievements: readonly VbAchievementId[];
  readonly dailyHuntsCompleted: number;
  readonly lastDailyHuntDay: number;
  readonly huntersDefeatedToday: number;
  readonly bloodlinePowerUnlocked: boolean;
  readonly currentDay: number;
}

// ── Constants: Bloodline Data ────────────────────────────────────────────────

const BLOODLINE_DATA: readonly VbBloodlineInfo[] = [
  {
    id: VbBloodline.Dracula,
    name: "Dracula",
    power: "Sovereign Command",
    passive: "+20% blood yield from nobles",
    huntBonus: 0.15,
    restBonus: 0.1,
    shapeshiftBonus: 0.1,
    stealthBonus: 0.05,
    lore: "The Voivode of Wallachia, whose name echoes through eternity.",
  },
  {
    id: VbBloodline.Carmilla,
    name: "Carmilla",
    power: "Seductive Charm",
    passive: "Victims 30% less likely to resist",
    huntBonus: 0.25,
    restBonus: 0.05,
    shapeshiftBonus: 0.05,
    stealthBonus: 0.2,
    lore: "A countess of shadows who whispers through the night.",
  },
  {
    id: VbBloodline.Lestat,
    name: "Lestat",
    power: "Theatrical Frenzy",
    passive: "+15% XP from all actions",
    huntBonus: 0.1,
    restBonus: 0.15,
    shapeshiftBonus: 0.2,
    stealthBonus: 0.0,
    lore: "The vampire who made darkness glamorous.",
  },
  {
    id: VbBloodline.Strigois,
    name: "Strigois",
    power: "Earth Tremor",
    passive: "+25% lair defense",
    huntBonus: 0.05,
    restBonus: 0.05,
    shapeshiftBonus: 0.1,
    stealthBonus: 0.25,
    lore: "Born of Romanian earth, the strigoi fears no cross.",
  },
  {
    id: VbBloodline.Nosferatu,
    name: "Nosferatu",
    power: "Plague Aura",
    passive: "Hunters take 20% more damage",
    huntBonus: 0.2,
    restBonus: 0.0,
    shapeshiftBonus: 0.15,
    stealthBonus: 0.1,
    lore: "Hideous and eternal, the rat-king of the catacombs.",
  },
  {
    id: VbBloodline.Tepes,
    name: "Tepes",
    power: "Impaler's Wrath",
    passive: "+30% hunter lethality",
    huntBonus: 0.15,
    restBonus: 0.1,
    shapeshiftBonus: 0.05,
    stealthBonus: 0.15,
    lore: "Vlad the Impaler, whose cruelty transcended death itself.",
  },
  {
    id: VbBloodline.Moroii,
    name: "Moroii",
    power: "Living Shadow",
    passive: "+25% shapeshift duration",
    huntBonus: 0.1,
    restBonus: 0.2,
    shapeshiftBonus: 0.25,
    stealthBonus: 0.1,
    lore: "Not quite dead, not quite alive — the moroii walks between.",
  },
  {
    id: VbBloodline.Upir,
    name: "Upir",
    power: "Frost Bite",
    passive: "+20% blood purity from cold regions",
    huntBonus: 0.2,
    restBonus: 0.15,
    shapeshiftBonus: 0.1,
    stealthBonus: 0.05,
    lore: "The Slavic terror, whose breath freezes the very blood.",
  },
] as const;

// ── Constants: Victim Data ───────────────────────────────────────────────────

const VICTIM_DATA: readonly VbVictimInfo[] = [
  { id: VbVictimType.Peasant, name: "Peasant", bloodQuality: 0.3, bloodAmount: 15, dangerLevel: 0.05, escapeChance: 0.2, lore: "Simple folk, easy prey but thin blood." },
  { id: VbVictimType.Merchant, name: "Merchant", bloodQuality: 0.4, bloodAmount: 20, dangerLevel: 0.1, escapeChance: 0.15, lore: "Well-fed traders with passable vitae." },
  { id: VbVictimType.Noble, name: "Noble", bloodQuality: 0.8, bloodAmount: 30, dangerLevel: 0.25, escapeChance: 0.05, lore: "Blue blood flows rich and intoxicating." },
  { id: VbVictimType.Priestess, name: "Priestess", bloodQuality: 0.9, bloodAmount: 25, dangerLevel: 0.5, escapeChance: 0.1, lore: "Divine essence courses through sacred veins." },
  { id: VbVictimType.Soldier, name: "Soldier", bloodQuality: 0.5, bloodAmount: 25, dangerLevel: 0.4, escapeChance: 0.1, lore: "Disciplined warriors, dangerous if alert." },
  { id: VbVictimType.Scholar, name: "Scholar", bloodQuality: 0.7, bloodAmount: 18, dangerLevel: 0.15, escapeChance: 0.15, lore: "Knowledge flavors their blood with subtlety." },
  { id: VbVictimType.Bard, name: "Bard", bloodQuality: 0.6, bloodAmount: 15, dangerLevel: 0.1, escapeChance: 0.3, lore: "Their songs mask the sound of your approach." },
  { id: VbVictimType.Witch, name: "Witch", bloodQuality: 0.85, bloodAmount: 20, dangerLevel: 0.6, escapeChance: 0.2, lore: "Arcane blood, potent yet unpredictable." },
  { id: VbVictimType.Child, name: "Child", bloodQuality: 0.95, bloodAmount: 8, dangerLevel: 0.02, escapeChance: 0.4, lore: "Innocent blood, purest of all — but the guilt lingers." },
  { id: VbVictimType.Traveler, name: "Traveler", bloodQuality: 0.5, bloodAmount: 20, dangerLevel: 0.2, escapeChance: 0.25, lore: "Weary wanderers, easy marks on lonely roads." },
  { id: VbVictimType.Gypsy, name: "Gypsy", bloodQuality: 0.7, bloodAmount: 18, dangerLevel: 0.3, escapeChance: 0.35, lore: "They sense the darkness before it arrives." },
  { id: VbVictimType.Alchemist, name: "Alchemist", bloodQuality: 0.75, bloodAmount: 22, dangerLevel: 0.35, escapeChance: 0.15, lore: "Mercury and arsenic tinge their vitae." },
] as const;

// ── Constants: Hunter Data ───────────────────────────────────────────────────

const HUNTER_DATA: readonly VbHunterInfo[] = [
  { id: VbHunterType.VanHelsing, name: "Van Helsing", detection: 0.9, lethality: 0.85, weakness: "SilverLined", lore: "The most famous vampire hunter of all." },
  { id: VbHunterType.Belmont, name: "Belmont", detection: 0.7, lethality: 0.9, weakness: "Shadow", lore: "Whip-wielding heirs of a cursed bloodline." },
  { id: VbHunterType.Witcher, name: "Witcher", detection: 0.75, lethality: 0.7, weakness: "Mist", lore: "Mutated monster hunters for hire." },
  { id: VbHunterType.Priest, name: "Priest", detection: 0.5, lethality: 0.4, weakness: "Bat", lore: "Holy symbols and faith are their arsenal." },
  { id: VbHunterType.Crusader, name: "Crusader", detection: 0.6, lethality: 0.8, weakness: "Wolf", lore: "Fervent warriors who know no surrender." },
  { id: VbHunterType.Scholar, name: "Scholar", detection: 0.85, lethality: 0.3, weakness: "Mist", lore: "Knowledge is their weapon; they expose your weaknesses." },
] as const;

// ── Constants: Coffin Data ───────────────────────────────────────────────────

const COFFIN_DATA: readonly VbCoffinInfo[] = [
  { id: VbCoffinType.Wood, name: "Pine Coffin", restQuality: 0.2, protection: 0.1, cost: 0, lore: "A humble wooden box. Better than the ground." },
  { id: VbCoffinType.Iron, name: "Iron Sarcophagus", restQuality: 0.4, protection: 0.3, cost: 200, lore: "Cold iron repels weak spirits." },
  { id: VbCoffinType.SilverLined, name: "Silver-Lined Vault", restQuality: 0.6, protection: 0.5, cost: 500, lore: "Silver threads weave protection within." },
  { id: VbCoffinType.Marble, name: "Marble Catafalque", restQuality: 0.8, protection: 0.7, cost: 1000, lore: "Carved from the earth's ancient bones." },
  { id: VbCoffinType.Obsidian, name: "Obsidian Throne", restQuality: 1.0, protection: 1.0, cost: 2500, lore: "Volcanic glass that drinks the moonlight." },
] as const;

// ── Constants: Room Data ─────────────────────────────────────────────────────

const ROOM_DATA: readonly VbRoomInfo[] = [
  { id: VbRoomType.Crypt, name: "The Crypt", baseBonus: 0.1, maxLevel: 10, lore: "Your burial chamber, the heart of the lair." },
  { id: VbRoomType.BloodCellar, name: "Blood Cellar", baseBonus: 0.15, maxLevel: 10, lore: "Where the crimson vintage is stored and aged." },
  { id: VbRoomType.RitualChamber, name: "Ritual Chamber", baseBonus: 0.1, maxLevel: 10, lore: "Dark rites echo through stone corridors." },
  { id: VbRoomType.TrophyHall, name: "Trophy Hall", baseBonus: 0.05, maxLevel: 10, lore: "Mementos of centuries of predation." },
  { id: VbRoomType.Library, name: "Forbidden Library", baseBonus: 0.2, maxLevel: 10, lore: "Tomes of darkness that teach forbidden secrets." },
] as const;

// ── Constants: Achievement Data ──────────────────────────────────────────────

const ACHIEVEMENT_DATA: readonly VbAchievement[] = [
  { id: VbAchievementId.FirstBite, name: "First Bite", description: "Complete your first hunt", requirement: 1, category: "Hunting", lore: "The hunger is answered at last." },
  { id: VbAchievementId.Bloodhoard, name: "Blood Hoarder", description: "Store 500 blood at once", requirement: 500, category: "Blood", lore: "A gourmand of the crimson vintage." },
  { id: VbAchievementId.FullMoonRise, name: "Full Moon Rising", description: "Hunt during a full moon 10 times", requirement: 10, category: "Moon", lore: "Luna's blessing empowers the hunt." },
  { id: VbAchievementId.CovenElder, name: "Coven Elder", description: "Reach Elder rank", requirement: 1, category: "Coven", lore: "The council bends to your will." },
  { id: VbAchievementId.ObsidianSlumber, name: "Obsidian Slumber", description: "Own an Obsidian coffin", requirement: 1, category: "Coffin", lore: "Sleep in volcanic glass, dream in fire." },
  { id: VbAchievementId.MasterOfShadows, name: "Master of Shadows", description: "Shapeshift 100 times", requirement: 100, category: "Shapeshift", lore: "Your form is as fluid as darkness itself." },
  { id: VbAchievementId.HunterSlayer, name: "Hunter Slayer", description: "Defeat 25 hunters", requirement: 25, category: "Combat", lore: "The prey becomes the predator." },
  { id: VbAchievementId.NightStalker, name: "Night Stalker", description: "Complete 50 hunts", requirement: 50, category: "Hunting", lore: "The night belongs to you alone." },
  { id: VbAchievementId.BloodlinePure, name: "Pure Blood", description: "Unlock bloodline power", requirement: 1, category: "Bloodline", lore: "Your heritage manifests at last." },
  { id: VbAchievementId.LairArchitect, name: "Lair Architect", description: "Max all rooms to level 10", requirement: 5, category: "Lair", lore: "Your domain is a fortress of nightmares." },
  { id: VbAchievementId.DailyDevourer, name: "Daily Devourer", description: "Complete 30 daily hunts", requirement: 30, category: "Daily", lore: "An insatiable appetite, never sated." },
  { id: VbAchievementId.Undying, name: "The Undying", description: "Survive 100 days", requirement: 100, category: "Survival", lore: "Death itself cannot claim you now." },
  { id: VbAchievementId.ThousandBites, name: "Thousand Bites", description: "Drink 1000 total blood", requirement: 1000, category: "Blood", lore: "A thousand necks bear your mark." },
  { id: VbAchievementId.ShadowRealm, name: "Shadow Realm", description: "Reach level 50", requirement: 50, category: "Level", lore: "You have transcended mortal understanding." },
  { id: VbAchievementId.CrimsonEmperor, name: "Crimson Emperor", description: "Unlock all achievements", requirement: 14, category: "Mastery", lore: "The apex of vampiric existence." },
] as const;

// ── Constants: Moon Cycle ────────────────────────────────────────────────────

const MOON_CYCLE: readonly { phase: VbMoonPhase; multiplier: number }[] = [
  { phase: VbMoonPhase.NewMoon, multiplier: 0.4 },
  { phase: VbMoonPhase.WaxingCrescent, multiplier: 0.55 },
  { phase: VbMoonPhase.FirstQuarter, multiplier: 0.7 },
  { phase: VbMoonPhase.WaxingGibbous, multiplier: 0.85 },
  { phase: VbMoonPhase.FullMoon, multiplier: 1.5 },
  { phase: VbMoonPhase.WaningGibbous, multiplier: 0.85 },
  { phase: VbMoonPhase.LastQuarter, multiplier: 0.7 },
  { phase: VbMoonPhase.WaningCrescent, multiplier: 0.55 },
] as const;

const COVEN_RANK_THRESHOLDS: readonly { rank: VbCovenRank; influence: number }[] = [
  { rank: VbCovenRank.Fledgling, influence: 0 },
  { rank: VbCovenRank.Neophyte, influence: 100 },
  { rank: VbCovenRank.Acolyte, influence: 300 },
  { rank: VbCovenRank.Master, influence: 700 },
  { rank: VbCovenRank.Elder, influence: 1500 },
] as const;

const XP_TABLE: readonly number[] = (() => {
  const table: number[] = [0];
  for (let i = 1; i <= 50; i++) {
    table.push(Math.floor(100 * Math.pow(1.15, i - 1)));
  }
  return Object.freeze(table);
})();

// ── Lookup Helpers ───────────────────────────────────────────────────────────

export function vbGetBloodlineInfo(bloodline: VbBloodline): VbBloodlineInfo {
  const info = BLOODLINE_DATA.find((b) => b.id === bloodline);
  return info ?? BLOODLINE_DATA[0];
}

export function vbGetAllBloodlines(): readonly VbBloodlineInfo[] {
  return BLOODLINE_DATA;
}

export function vbGetVictimInfo(victim: VbVictimType): VbVictimInfo {
  const info = VICTIM_DATA.find((v) => v.id === victim);
  return info ?? VICTIM_DATA[0];
}

export function vbGetAllVictims(): readonly VbVictimInfo[] {
  return VICTIM_DATA;
}

export function vbGetHunterInfo(hunter: VbHunterType): VbHunterInfo {
  const info = HUNTER_DATA.find((h) => h.id === hunter);
  return info ?? HUNTER_DATA[0];
}

export function vbGetAllHunters(): readonly VbHunterInfo[] {
  return HUNTER_DATA;
}

export function vbGetCoffinInfo(coffin: VbCoffinType): VbCoffinInfo {
  const info = COFFIN_DATA.find((c) => c.id === coffin);
  return info ?? COFFIN_DATA[0];
}

export function vbGetAllCoffins(): readonly VbCoffinInfo[] {
  return COFFIN_DATA;
}

export function vbGetRoomInfo(room: VbRoomType): VbRoomInfo {
  const info = ROOM_DATA.find((r) => r.id === room);
  return info ?? ROOM_DATA[0];
}

export function vbGetAllRooms(): readonly VbRoomInfo[] {
  return ROOM_DATA;
}

export function vbGetAchievement(achievement: VbAchievementId): VbAchievement {
  const info = ACHIEVEMENT_DATA.find((a) => a.id === achievement);
  return info ?? ACHIEVEMENT_DATA[0];
}

export function vbGetAllAchievements(): readonly VbAchievement[] {
  return ACHIEVEMENT_DATA;
}

// ── State Factory ────────────────────────────────────────────────────────────

export function vbCreateInitialState(name: string, bloodline: VbBloodline): VbVampireLairState {
  const rooms: Record<VbRoomType, number> = {
    [VbRoomType.Crypt]: 1,
    [VbRoomType.BloodCellar]: 1,
    [VbRoomType.RitualChamber]: 1,
    [VbRoomType.TrophyHall]: 1,
    [VbRoomType.Library]: 1,
  };
  return Object.freeze({
    vampireName: name,
    bloodline,
    stats: Object.freeze({
      level: 1,
      xp: 0,
      xpToNext: XP_TABLE[1],
      maxHealth: 100,
      health: 100,
      maxPower: 50,
      power: 50,
      totalBloodDrunk: 0,
      totalHunts: 0,
      totalKills: 0,
      totalHunterDefeats: 0,
      totalRests: 0,
      totalShapeshifts: 0,
      daysSurvived: 0,
    }),
    bloodPool: Object.freeze({
      current: 50,
      max: 200,
      purity: 0.5,
      storedTypes: [] as readonly VbVictimType[],
    }),
    coffinType: VbCoffinType.Wood,
    shapeshift: Object.freeze({
      form: VbShapeshiftForm.Human,
      durationRemaining: 0,
      powerMultiplier: 1.0,
      stealthBonus: 0.0,
      speedBonus: 0.0,
    }),
    coven: Object.freeze({
      rank: VbCovenRank.Fledgling,
      influence: 0,
      reputation: 50,
      members: 0,
      loyalty: 50,
    }),
    lair: Object.freeze({
      rooms,
      totalDecorations: 0,
      ambiance: 0.2,
      securityLevel: 0.1,
    }),
    moon: Object.freeze({
      phase: VbMoonPhase.NewMoon,
      dayInCycle: 0,
      powerMultiplier: 0.4,
      isFullMoon: false,
      isNewMoon: true,
    }),
    achievements: [] as readonly VbAchievementId[],
    dailyHuntsCompleted: 0,
    lastDailyHuntDay: 0,
    huntersDefeatedToday: 0,
    bloodlinePowerUnlocked: false,
    currentDay: 1,
  });
}

// ── Moon System ──────────────────────────────────────────────────────────────

export function vbAdvanceMoon(state: VbVampireLairState): VbMoonState {
  const nextDay = (state.moon.dayInCycle + 1) % 8;
  const moonInfo = MOON_CYCLE[nextDay];
  return Object.freeze({
    phase: moonInfo.phase,
    dayInCycle: nextDay,
    powerMultiplier: moonInfo.multiplier,
    isFullMoon: moonInfo.phase === VbMoonPhase.FullMoon,
    isNewMoon: moonInfo.phase === VbMoonPhase.NewMoon,
  });
}

export function vbGetMoonPhaseName(phase: VbMoonPhase): string {
  const names: Record<VbMoonPhase, string> = {
    [VbMoonPhase.NewMoon]: "🌑 New Moon",
    [VbMoonPhase.WaxingCrescent]: "🌒 Waxing Crescent",
    [VbMoonPhase.FirstQuarter]: "🌓 First Quarter",
    [VbMoonPhase.WaxingGibbous]: "🌔 Waxing Gibbous",
    [VbMoonPhase.FullMoon]: "🌕 Full Moon",
    [VbMoonPhase.WaningGibbous]: "🌖 Waning Gibbous",
    [VbMoonPhase.LastQuarter]: "🌗 Last Quarter",
    [VbMoonPhase.WaningCrescent]: "🌘 Waning Crescent",
  };
  return names[phase];
}

export function vbGetMoonPowerMultiplier(state: VbVampireLairState): number {
  return state.moon.powerMultiplier;
}

// ── Blood Management ─────────────────────────────────────────────────────────

export function vbCalculateBloodGain(
  victim: VbVictimType,
  bloodline: VbBloodline,
  moonMultiplier: number,
  vampireLevel: number
): number {
  const victimInfo = vbGetVictimInfo(victim);
  const bloodlineInfo = vbGetBloodlineInfo(bloodline);
  const levelBonus = 1 + (vampireLevel - 1) * 0.02;
  const total = victimInfo.bloodAmount * victimInfo.bloodQuality * (1 + bloodlineInfo.huntBonus) * moonMultiplier * levelBonus;
  return Math.floor(total);
}

export function vbAddBlood(state: VbVampireLairState, amount: number, victimType: VbVictimType): VbBloodPool {
  const newCurrent = Math.min(state.bloodPool.current + amount, state.bloodPool.max);
  const victimInfo = vbGetVictimInfo(victimType);
  const totalBlood = state.bloodPool.current * state.bloodPool.purity + amount * victimInfo.bloodQuality;
  const newTotal = Math.max(1, newCurrent + amount);
  const newPurity = Math.min(1.0, totalBlood / newTotal);
  const existingTypes = state.bloodPool.storedTypes;
  const newTypes = existingTypes.includes(victimType) ? existingTypes : [...existingTypes, victimType];
  return Object.freeze({
    current: newCurrent,
    max: state.bloodPool.max,
    purity: Math.round(newPurity * 1000) / 1000,
    storedTypes: Object.freeze(newTypes),
  });
}

export function vbConsumeBlood(state: VbVampireLairState, amount: number): { pool: VbBloodPool; consumed: number } {
  const actual = Math.min(amount, state.bloodPool.current);
  return {
    pool: Object.freeze({
      ...state.bloodPool,
      current: state.bloodPool.current - actual,
    }),
    consumed: actual,
  };
}

export function vbGetBloodPoolCapacity(state: VbVampireLairState): number {
  return state.bloodPool.max;
}

export function vbExpandBloodPool(state: VbVampireLairState, amount: number): VbBloodPool {
  const cellarBonus = vbGetRoomInfo(VbRoomType.BloodCellar).baseBonus * state.lair.rooms[VbRoomType.BloodCellar];
  const expansion = Math.floor(amount * (1 + cellarBonus));
  return Object.freeze({
    ...state.bloodPool,
    max: state.bloodPool.max + expansion,
  });
}

export function vbShareBlood(state: VbVampireLairState, amount: number): VbBloodShareResult {
  const actual = Math.min(amount, state.bloodPool.current);
  if (actual <= 0) {
    return Object.freeze({
      success: false,
      amountShared: 0,
      covenReputation: 0,
      message: "Not enough blood to share with the coven.",
    });
  }
  const reputationGain = Math.floor(actual * 0.5);
  return Object.freeze({
    success: true,
    amountShared: actual,
    covenReputation: reputationGain,
    message: `You shared ${actual} units of blood with the coven. Reputation +${reputationGain}.`,
  });
}

// ── Hunting System ───────────────────────────────────────────────────────────

export function vbSelectVictim(rng: number): VbVictimType {
  const victims = VICTIM_DATA;
  const totalWeight = victims.reduce((sum, v) => sum + (1 - v.dangerLevel), 0);
  let roll = rng * totalWeight;
  for (const victim of victims) {
    roll -= (1 - victim.dangerLevel);
    if (roll <= 0) return victim.id;
  }
  return VbVictimType.Peasant;
}

export function vbHunt(
  state: VbVampireLairState,
  victimType: VbVictimType,
  stealthRoll: number
): VbHuntResult {
  const victimInfo = vbGetVictimInfo(victimType);
  const bloodlineInfo = vbGetBloodlineInfo(state.bloodline);
  const shapeshiftStealth = state.shapeshift.stealthBonus;
  const moonMult = state.moon.powerMultiplier;

  // Determine if victim escapes
  const effectiveEscape = victimInfo.escapeChance * (1 - shapeshiftStealth) * (1 - bloodlineInfo.stealthBonus);
  const escaped = stealthRoll < effectiveEscape;

  if (escaped) {
    const detectionRoll = Math.random();
    const detected = detectionRoll > 0.6;
    const hunterChance = detected ? 0.3 * victimInfo.dangerLevel : 0.05;
    const hunterEncounter = Math.random() < hunterChance;
    const hunterType = hunterEncounter ? vbSelectHunter() : null;

    return Object.freeze({
      success: false,
      victimType,
      bloodGained: 0,
      xpGained: 5,
      detected,
      hunterEncounter,
      hunterType,
      message: hunterEncounter
        ? `${victimInfo.name} escaped and alerted ${hunterType ? vbGetHunterInfo(hunterType).name : "a hunter"}!`
        : `${victimInfo.name} fled into the night.`,
    });
  }

  const bloodGained = vbCalculateBloodGain(victimType, state.bloodline, moonMult, state.stats.level);
  const baseXP = Math.floor(20 + victimInfo.bloodQuality * 30);
  const xpGained = Math.floor(baseXP * moonMult * (1 + bloodlineInfo.huntBonus));

  // Hunter detection chance
  const detectionChance = 0.1 * victimInfo.dangerLevel * (1 - shapeshiftStealth);
  const detected = Math.random() < detectionChance;
  const hunterEncounter = detected && Math.random() < 0.4;
  const hunterType = hunterEncounter ? vbSelectHunter() : null;

  return Object.freeze({
    success: true,
    victimType,
    bloodGained,
    xpGained,
    detected,
    hunterEncounter,
    hunterType,
    message: hunterEncounter
      ? `You drained the ${victimInfo.name} but ${hunterType ? vbGetHunterInfo(hunterType).name : "a hunter"} approaches!`
      : `You fed upon the ${victimInfo.name}. +${bloodGained} blood, +${xpGained} XP.`,
  });
}

function vbSelectHunter(): VbHunterType {
  const hunters = HUNTER_DATA;
  const idx = Math.floor(Math.random() * hunters.length);
  return hunters[idx].id;
}

export function vbGetHuntSuccessChance(
  state: VbVampireLairState,
  victimType: VbVictimType
): number {
  const victimInfo = vbGetVictimInfo(victimType);
  const bloodlineInfo = vbGetBloodlineInfo(state.bloodline);
  const stealth = 1 - victimInfo.escapeChance * (1 - state.shapeshift.stealthBonus) * (1 - bloodlineInfo.stealthBonus);
  return Math.min(0.95, Math.max(0.1, stealth));
}

// ── Hunter Encounter System ──────────────────────────────────────────────────

export function vbEncounterHunter(
  state: VbVampireLairState,
  hunterType: VbHunterType,
  combatRoll: number
): VbHunterEncounterResult {
  const hunterInfo = vbGetHunterInfo(hunterType);
  const bloodlineInfo = vbGetBloodlineInfo(state.bloodline);
  const coffinInfo = vbGetCoffinInfo(state.coffinType);
  const lairDefense = state.lair.securityLevel;

  // Combat power calculation
  const vampirePower = (state.stats.power / state.stats.maxPower) *
    (1 + bloodlineInfo.huntBonus) *
    (1 + state.moon.powerMultiplier * 0.3) *
    (1 + coffinInfo.protection * 0.2) *
    (1 + lairDefense * 0.3);

  const hunterPower = hunterInfo.lethality * hunterInfo.detection;

  // Bloodline-specific weaknesses
  const formWeakness = state.shapeshift.form === VbShapeshiftForm.Human
    ? 1.0
    : hunterInfo.weakness === state.shapeshift.form
      ? 0.6
      : 1.2;

  const effectiveHunterPower = hunterPower * formWeakness;
  const defeatThreshold = vampirePower / (vampirePower + effectiveHunterPower);

  const defeated = combatRoll < defeatThreshold;
  const damageTaken = defeated
    ? Math.floor(hunterInfo.lethality * 15 * (1 - coffinInfo.protection * 0.3))
    : 0;

  const xpGained = defeated
    ? Math.floor(50 + hunterInfo.lethality * 100)
    : Math.floor(10 + hunterInfo.detection * 20);

  const message = defeated
    ? `You vanquished ${hunterInfo.name}! +${xpGained} XP. ${damageTaken > 0 ? `Took ${damageTaken} damage.` : "No damage taken."}`
    : `You barely escaped ${hunterInfo.name}. -${damageTaken} health. +${xpGained} XP.`;

  return Object.freeze({
    survived: true,
    hunterDefeated: defeated,
    damageTaken,
    xpGained,
    message,
  });
}

export function vbGetHunterDangerLevel(state: VbVampireLairState, hunterType: VbHunterType): number {
  const hunterInfo = vbGetHunterInfo(hunterType);
  const bloodlineInfo = vbGetBloodlineInfo(state.bloodline);
  const danger = hunterInfo.lethality * (1 - bloodlineInfo.huntBonus * 0.5);
  return Math.round(Math.min(1.0, danger) * 100) / 100;
}

export function vbCalculateHunterDetectionChance(state: VbVampireLairState): number {
  const lairSecurity = state.lair.securityLevel;
  const stealth = vbGetBloodlineInfo(state.bloodline).stealthBonus;
  const baseChance = 0.15;
  return Math.max(0.02, baseChance * (1 - lairSecurity) * (1 - stealth));
}

// ── Coffin / Rest System ─────────────────────────────────────────────────────

export function vbRest(state: VbVampireLairState): VbRestResult {
  const coffinInfo = vbGetCoffinInfo(state.coffinType);
  const bloodlineInfo = vbGetBloodlineInfo(state.bloodline);
  const moonBonus = state.moon.isNewMoon ? 1.3 : 1.0;

  // Blood consumed for rest
  const bloodNeeded = Math.floor(10 + state.stats.level * 2);
  const { pool, consumed } = vbConsumeBlood(state, bloodNeeded);

  // Health restoration
  const healthRestoreBase = state.stats.maxHealth * coffinInfo.restQuality;
  const healthRestored = Math.min(
    state.stats.maxHealth - state.stats.health,
    Math.floor(healthRestoreBase * (1 + bloodlineInfo.restBonus) * moonBonus * (consumed / bloodNeeded))
  );

  // Power restoration
  const powerRestoreBase = state.stats.maxPower * coffinInfo.restQuality;
  const powerRestored = Math.min(
    state.stats.maxPower - state.stats.power,
    Math.floor(powerRestoreBase * (1 + bloodlineInfo.restBonus) * moonBonus)
  );

  // Check for new achievements
  const newAchievements = vbCheckRestAchievements(state, consumed, healthRestored, powerRestored);

  const message = coffinInfo.id === VbCoffinType.Obsidian
    ? "You slumber in volcanic glass. Power courses through your veins."
    : `You rest in your ${coffinInfo.name}. +${healthRestored} HP, +${powerRestored} Power.`;

  return Object.freeze({
    healthRestored,
    powerRestored,
    bloodConsumed: consumed,
    coffinBonus: coffinInfo.restQuality,
    moonBonus,
    newAchievements,
    message,
  });
}

function vbCheckRestAchievements(
  state: VbVampireLairState,
  bloodConsumed: number,
  healthRestored: number,
  powerRestored: number
): readonly VbAchievementId[] {
  const unlocked: VbAchievementId[] = [];
  if (state.coffinType === VbCoffinType.Obsidian && !state.achievements.includes(VbAchievementId.ObsidianSlumber)) {
    unlocked.push(VbAchievementId.ObsidianSlumber);
  }
  return Object.freeze(unlocked);
}

export function vbUpgradeCoffin(state: VbVampireLairState): { newState: VbVampireLairState; success: boolean; message: string } {
  const currentIndex = COFFIN_DATA.findIndex((c) => c.id === state.coffinType);
  if (currentIndex >= COFFIN_DATA.length - 1) {
    return {
      newState: state,
      success: false,
      message: "Your coffin is already the finest available.",
    };
  }
  const nextCoffin = COFFIN_DATA[currentIndex + 1];
  if (state.bloodPool.current < nextCoffin.cost) {
    return {
      newState: state,
      success: false,
      message: `Not enough blood. Need ${nextCoffin.cost}, have ${state.bloodPool.current}.`,
    };
  }
  const newPool = Object.freeze({ ...state.bloodPool, current: state.bloodPool.current - nextCoffin.cost });
  return {
    newState: Object.freeze({ ...state, coffinType: nextCoffin.id, bloodPool: newPool }),
    success: true,
    message: `Upgraded to ${nextCoffin.name}! Rest quality: ${nextCoffin.restQuality * 100}%.`,
  };
}

export function vbGetRestQuality(state: VbVampireLairState): number {
  const coffinInfo = vbGetCoffinInfo(state.coffinType);
  const bloodlineInfo = vbGetBloodlineInfo(state.bloodline);
  const moonBonus = state.moon.isNewMoon ? 1.3 : 1.0;
  return Math.min(1.5, coffinInfo.restQuality * (1 + bloodlineInfo.restBonus) * moonBonus);
}

// ── Shapeshift System ────────────────────────────────────────────────────────

export function vbShapeshift(
  state: VbVampireLairState,
  targetForm: VbShapeshiftForm
): VbShapeshiftResult {
  if (targetForm === VbShapeshiftForm.Human) {
    return Object.freeze({
      success: true,
      newForm: VbShapeshiftForm.Human,
      duration: 0,
      bonuses: Object.freeze({
        form: VbShapeshiftForm.Human,
        durationRemaining: 0,
        powerMultiplier: 1.0,
        stealthBonus: 0.0,
        speedBonus: 0.0,
      }),
      message: "You resume your human guise.",
    });
  }

  if (state.stats.power < 10) {
    return Object.freeze({
      success: false,
      newForm: state.shapeshift.form,
      duration: 0,
      bonuses: state.shapeshift,
      message: "Not enough power to shapeshift. Rest first.",
    });
  }

  const bloodlineInfo = vbGetBloodlineInfo(state.bloodline);
  const baseDuration = 5;
  const formStats = vbGetShapeshiftStats(targetForm);
  const duration = Math.floor(baseDuration * (1 + bloodlineInfo.shapeshiftBonus) * state.moon.powerMultiplier * 0.7);

  return Object.freeze({
    success: true,
    newForm: targetForm,
    duration,
    bonuses: Object.freeze({
      form: targetForm,
      durationRemaining: duration,
      powerMultiplier: formStats.powerMultiplier,
      stealthBonus: formStats.stealthBonus,
      speedBonus: formStats.speedBonus,
    }),
    message: `You transform into ${vbGetFormName(targetForm)}! Duration: ${duration} turns.`,
  });
}

function vbGetShapeshiftStats(form: VbShapeshiftForm): { powerMultiplier: number; stealthBonus: number; speedBonus: number } {
  const stats: Record<VbShapeshiftForm, { powerMultiplier: number; stealthBonus: number; speedBonus: number }> = {
    [VbShapeshiftForm.Human]: { powerMultiplier: 1.0, stealthBonus: 0.0, speedBonus: 0.0 },
    [VbShapeshiftForm.Bat]: { powerMultiplier: 0.6, stealthBonus: 0.4, speedBonus: 0.8 },
    [VbShapeshiftForm.Wolf]: { powerMultiplier: 1.4, stealthBonus: -0.1, speedBonus: 0.5 },
    [VbShapeshiftForm.Mist]: { powerMultiplier: 0.3, stealthBonus: 0.8, speedBonus: 0.3 },
    [VbShapeshiftForm.Shadow]: { powerMultiplier: 0.8, stealthBonus: 0.9, speedBonus: 0.6 },
  };
  return stats[form];
}

export function vbGetFormName(form: VbShapeshiftForm): string {
  const names: Record<VbShapeshiftForm, string> = {
    [VbShapeshiftForm.Human]: "Human",
    [VbShapeshiftForm.Bat]: "a Bat",
    [VbShapeshiftForm.Wolf]: "a Wolf",
    [VbShapeshiftForm.Mist]: "Mist",
    [VbShapeshiftForm.Shadow]: "a Shadow",
  };
  return names[form];
}

export function vbGetAllForms(): readonly VbShapeshiftForm[] {
  return Object.freeze([
    VbShapeshiftForm.Human,
    VbShapeshiftForm.Bat,
    VbShapeshiftForm.Wolf,
    VbShapeshiftForm.Mist,
    VbShapeshiftForm.Shadow,
  ]);
}

export function vbDecayShapeshift(state: VbVampireLairState): VbShapeshiftState {
  if (state.shapeshift.form === VbShapeshiftForm.Human) {
    return state.shapeshift;
  }
  const remaining = state.shapeshift.durationRemaining - 1;
  if (remaining <= 0) {
    return Object.freeze({
      form: VbShapeshiftForm.Human,
      durationRemaining: 0,
      powerMultiplier: 1.0,
      stealthBonus: 0.0,
      speedBonus: 0.0,
    });
  }
  return Object.freeze({
    ...state.shapeshift,
    durationRemaining: remaining,
  });
}

// ── Coven Politics ───────────────────────────────────────────────────────────

export function vbPerformCovenAction(
  state: VbVampireLairState,
  actionType: "tribute" | "politics" | "ritual" | "recruit"
): VbCovenAction {
  const bloodCosts: Record<string, number> = {
    tribute: 30,
    politics: 0,
    ritual: 50,
    recruit: 20,
  };
  const influenceGains: Record<string, number> = {
    tribute: 25,
    politics: 15,
    ritual: 40,
    recruit: 10,
  };

  const cost = bloodCosts[actionType] ?? 0;
  if (state.bloodPool.current < cost) {
    return Object.freeze({
      success: false,
      rankGained: false,
      newRank: null,
      influenceGained: 0,
      message: "Not enough blood for this coven action.",
    });
  }

  const baseGain = influenceGains[actionType] ?? 10;
  const rankBonus = (state.coven.rank === VbCovenRank.Master) ? 1.5 : (state.coven.rank === VbCovenRank.Elder) ? 2.0 : 1.0;
  const gained = Math.floor(baseGain * rankBonus * state.moon.powerMultiplier);

  const newInfluence = state.coven.influence + gained;
  const newRank = vbCalculateRank(newInfluence);
  const rankGained = newRank !== state.coven.rank;

  const messages: Record<string, string> = {
    tribute: rankGained
      ? `Your tribute of ${cost} blood earned +${gained} influence. You've been promoted to ${newRank}!`
      : `Your tribute of ${cost} blood earned +${gained} influence.`,
    politics: rankGained
      ? `Political maneuvering gained +${gained} influence. Promoted to ${newRank}!`
      : `Political maneuvering gained +${gained} influence.`,
    ritual: rankGained
      ? `The dark ritual consumed ${cost} blood and granted +${gained} influence. Promoted to ${newRank}!`
      : `The dark ritual consumed ${cost} blood and granted +${gained} influence.`,
    recruit: rankGained
      ? `You spent ${cost} blood recruiting. +${gained} influence. Promoted to ${newRank}!`
      : `You spent ${cost} blood recruiting. +${gained} influence.`,
  };

  return Object.freeze({
    success: true,
    rankGained,
    newRank: rankGained ? newRank : null,
    influenceGained: gained,
    message: messages[actionType] ?? `Coven action performed. +${gained} influence.`,
  });
}

function vbCalculateRank(influence: number): VbCovenRank {
  for (let i = COVEN_RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (influence >= COVEN_RANK_THRESHOLDS[i].influence) {
      return COVEN_RANK_THRESHOLDS[i].rank;
    }
  }
  return VbCovenRank.Fledgling;
}

export function vbGetRankProgress(state: VbVampireLairState): { current: number; needed: number; percent: number } {
  const currentRankIdx = COVEN_RANK_THRESHOLDS.findIndex((r) => r.rank === state.coven.rank);
  if (currentRankIdx >= COVEN_RANK_THRESHOLDS.length - 1) {
    return { current: state.coven.influence, needed: state.coven.influence, percent: 100 };
  }
  const currentThreshold = COVEN_RANK_THRESHOLDS[currentRankIdx].influence;
  const nextThreshold = COVEN_RANK_THRESHOLDS[currentRankIdx + 1].influence;
  const progress = state.coven.influence - currentThreshold;
  const needed = nextThreshold - currentThreshold;
  return {
    current: progress,
    needed,
    percent: Math.floor((progress / needed) * 100),
  };
}

export function vbGetAllRanks(): readonly { rank: VbCovenRank; influence: number }[] {
  return COVEN_RANK_THRESHOLDS;
}

export function vbGetRankName(rank: VbCovenRank): string {
  const names: Record<VbCovenRank, string> = {
    [VbCovenRank.Fledgling]: "Fledgling 🦇",
    [VbCovenRank.Neophyte]: "Neophyte 🌑",
    [VbCovenRank.Acolyte]: "Acolyte ⛧",
    [VbCovenRank.Master]: "Master 🩸",
    [VbCovenRank.Elder]: "Elder 👑",
  };
  return names[rank];
}

// ── Lair Customization ───────────────────────────────────────────────────────

export function vbUpgradeRoom(
  state: VbVampireLairState,
  roomId: VbRoomType
): VbRoomUpgrade {
  const roomInfo = vbGetRoomInfo(roomId);
  const currentLevel = state.lair.rooms[roomId];

  if (currentLevel >= roomInfo.maxLevel) {
    return Object.freeze({
      roomId,
      newLevel: currentLevel,
      cost: 0,
      success: false,
      message: `${roomInfo.name} is already at maximum level ${roomInfo.maxLevel}.`,
    });
  }

  const cost = Math.floor(50 * Math.pow(1.8, currentLevel - 1));
  if (state.bloodPool.current < cost) {
    return Object.freeze({
      roomId,
      newLevel: currentLevel,
      cost,
      success: false,
      message: `Need ${cost} blood to upgrade ${roomInfo.name}. Have ${state.bloodPool.current}.`,
    });
  }

  return Object.freeze({
    roomId,
    newLevel: currentLevel + 1,
    cost,
    success: true,
    message: `${roomInfo.name} upgraded to level ${currentLevel + 1}! -${cost} blood.`,
  });
}

export function vbCalculateLairAmbiance(state: VbVampireLairState): number {
  let ambiance = 0.1;
  for (const room of ROOM_DATA) {
    const level = state.lair.rooms[room.id];
    ambiance += room.baseBonus * level;
  }
  return Math.min(1.0, ambiance);
}

export function vbCalculateLairSecurity(state: VbVampireLairState): number {
  const cryptLevel = state.lair.rooms[VbRoomType.Crypt];
  const ritualLevel = state.lair.rooms[VbRoomType.RitualChamber];
  const trophyLevel = state.lair.rooms[VbRoomType.TrophyHall];
  const security = 0.1 + cryptLevel * 0.04 + ritualLevel * 0.03 + trophyLevel * 0.02;
  return Math.min(1.0, security);
}

export function vbGetLairDescription(state: VbVampireLairState): string {
  const ambiance = vbCalculateLairAmbiance(state);
  const security = vbCalculateLairSecurity(state);
  const coffinInfo = vbGetCoffinInfo(state.coffinType);

  if (ambiance >= 0.8 && security >= 0.6) {
    return `A magnificent gothic lair. The ${coffinInfo.name} sits in the grand crypt. Wards shimmer along every corridor.`;
  }
  if (ambiance >= 0.5) {
    return `A respectable lair with tasteful dark decor. The ${coffinInfo.name} provides adequate comfort.`;
  }
  return `A modest dwelling. The ${coffinInfo.name} rests on bare stone. Much work remains.`;
}

export function vbGetRoomLevelDescription(roomId: VbRoomType, level: number): string {
  const roomInfo = vbGetRoomInfo(roomId);
  if (level >= 8) return `${roomInfo.name} radiates dark majesty. Masterwork runes cover every surface.`;
  if (level >= 5) return `${roomInfo.name} is well-furnished with gothic elegance.`;
  if (level >= 3) return `${roomInfo.name} shows signs of careful attention.`;
  return `${roomInfo.name} is barely furnished. Cobwebs and dust dominate.`;
}

// ── XP & Leveling ────────────────────────────────────────────────────────────

export function vbAddXP(state: VbVampireLairState, amount: number): VbVampireStats {
  const bloodlineInfo = vbGetBloodlineInfo(state.bloodline);
  const moonBonus = state.moon.isFullMoon ? 1.2 : 1.0;
  const xpGain = Math.floor(amount * moonBonus);
  let newXp = state.stats.xp + xpGain;
  let newLevel = state.stats.level;
  let newXpToNext = state.stats.xpToNext;

  while (newLevel < 50 && newXp >= newXpToNext) {
    newXp -= newXpToNext;
    newLevel++;
    newXpToNext = XP_TABLE[newLevel] ?? XP_TABLE[50];
  }

  const newMaxHealth = 100 + (newLevel - 1) * 20;
  const newMaxPower = 50 + (newLevel - 1) * 15;

  return Object.freeze({
    ...state.stats,
    level: newLevel,
    xp: newXp,
    xpToNext: newXpToNext,
    maxHealth: newMaxHealth,
    maxPower: newMaxPower,
  });
}

export function vbGetXpToLevel(level: number): number {
  if (level < 1 || level > 50) return 0;
  return XP_TABLE[level];
}

export function vbGetLevelTitle(level: number): string {
  if (level >= 45) return "Ancient Vampire";
  if (level >= 35) return "Methuselah";
  if (level >= 25) return "Elder Vampire";
  if (level >= 15) return "Mature Vampire";
  if (level >= 10) return "Established Vampire";
  if (level >= 5) return "Young Vampire";
  return "Fledgling";
}

export function vbGetLevelProgress(state: VbVampireLairState): number {
  if (state.stats.level >= 50) return 100;
  return Math.floor((state.stats.xp / state.stats.xpToNext) * 100);
}

// ── Achievement System ───────────────────────────────────────────────────────

export function vbCheckAchievements(state: VbVampireLairState): readonly VbAchievementId[] {
  const newlyUnlocked: VbAchievementId[] = [];
  const s = state.stats;
  const checks: Array<{ id: VbAchievementId; condition: boolean }> = [
    { id: VbAchievementId.FirstBite, condition: s.totalHunts >= 1 },
    { id: VbAchievementId.Bloodhoard, condition: state.bloodPool.current >= 500 },
    { id: VbAchievementId.CovenElder, condition: state.coven.rank === VbCovenRank.Elder },
    { id: VbAchievementId.ObsidianSlumber, condition: state.coffinType === VbCoffinType.Obsidian },
    { id: VbAchievementId.MasterOfShadows, condition: s.totalShapeshifts >= 100 },
    { id: VbAchievementId.HunterSlayer, condition: s.totalHunterDefeats >= 25 },
    { id: VbAchievementId.NightStalker, condition: s.totalHunts >= 50 },
    { id: VbAchievementId.BloodlinePure, condition: state.bloodlinePowerUnlocked },
    { id: VbAchievementId.DailyDevourer, condition: state.dailyHuntsCompleted >= 30 },
    { id: VbAchievementId.Undying, condition: s.daysSurvived >= 100 },
    { id: VbAchievementId.ThousandBites, condition: s.totalBloodDrunk >= 1000 },
    { id: VbAchievementId.ShadowRealm, condition: s.level >= 50 },
  ];

  // Lair architect: all rooms at max level
  const allRoomsMax = ROOM_DATA.every(
    (r) => state.lair.rooms[r.id] >= r.maxLevel
  );
  checks.push({ id: VbAchievementId.LairArchitect, condition: allRoomsMax });

  for (const check of checks) {
    if (check.condition && !state.achievements.includes(check.id)) {
      newlyUnlocked.push(check.id);
    }
  }

  // Crimson Emperor: all other achievements unlocked
  const otherIds = ACHIEVEMENT_DATA.filter((a) => a.id !== VbAchievementId.CrimsonEmperor).map((a) => a.id);
  const allOthersUnlocked = otherIds.every((id) => state.achievements.includes(id) || newlyUnlocked.includes(id));
  if (allOthersUnlocked && !state.achievements.includes(VbAchievementId.CrimsonEmperor)) {
    newlyUnlocked.push(VbAchievementId.CrimsonEmperor);
  }

  return Object.freeze(newlyUnlocked);
}

export function vbIsAchievementUnlocked(state: VbVampireLairState, id: VbAchievementId): boolean {
  return state.achievements.includes(id);
}

export function vbGetAchievementProgress(state: VbVampireLairState, id: VbAchievementId): number {
  const achievement = vbGetAchievement(id);
  const s = state.stats;
  const progressMap: Record<VbAchievementId, number> = {
    [VbAchievementId.FirstBite]: Math.min(s.totalHunts, 1),
    [VbAchievementId.Bloodhoard]: Math.min(state.bloodPool.current, 500) / 500,
    [VbAchievementId.FullMoonRise]: 0, // tracked separately
    [VbAchievementId.CovenElder]: state.coven.rank === VbCovenRank.Elder ? 1 : 0,
    [VbAchievementId.ObsidianSlumber]: state.coffinType === VbCoffinType.Obsidian ? 1 : 0,
    [VbAchievementId.MasterOfShadows]: Math.min(s.totalShapeshifts, 100) / 100,
    [VbAchievementId.HunterSlayer]: Math.min(s.totalHunterDefeats, 25) / 25,
    [VbAchievementId.NightStalker]: Math.min(s.totalHunts, 50) / 50,
    [VbAchievementId.BloodlinePure]: state.bloodlinePowerUnlocked ? 1 : 0,
    [VbAchievementId.LairArchitect]: (() => {
      const maxed = ROOM_DATA.filter((r) => state.lair.rooms[r.id] >= r.maxLevel).length;
      return maxed / ROOM_DATA.length;
    })(),
    [VbAchievementId.DailyDevourer]: Math.min(state.dailyHuntsCompleted, 30) / 30,
    [VbAchievementId.Undying]: Math.min(s.daysSurvived, 100) / 100,
    [VbAchievementId.ThousandBites]: Math.min(s.totalBloodDrunk, 1000) / 1000,
    [VbAchievementId.ShadowRealm]: Math.min(s.level, 50) / 50,
    [VbAchievementId.CrimsonEmperor]: (() => {
      const others = ACHIEVEMENT_DATA.filter((a) => a.id !== VbAchievementId.CrimsonEmperor);
      const unlocked = others.filter((a) => state.achievements.includes(a.id)).length;
      return unlocked / others.length;
    })(),
  };
  return Math.min(1.0, progressMap[id] ?? 0);
}

// ── Bloodline Power ──────────────────────────────────────────────────────────

export function vbUnlockBloodlinePower(state: VbVampireLairState): { success: boolean; message: string } {
  if (state.bloodlinePowerUnlocked) {
    return { success: false, message: "Your bloodline power is already unlocked." };
  }
  if (state.stats.level < 10) {
    return { success: false, message: "Reach level 10 to unlock your bloodline power." };
  }
  if (state.bloodPool.current < 100) {
    return { success: false, message: "Need 100 blood to unlock bloodline power." };
  }
  const bloodlineInfo = vbGetBloodlineInfo(state.bloodline);
  return {
    success: true,
    message: `Bloodline power "${bloodlineInfo.power}" unlocked! ${bloodlineInfo.passive}`,
  };
}

export function vbActivateBloodlinePower(
  state: VbVampireLairState
): { powerUsed: boolean; effect: string; bloodCost: number } {
  if (!state.bloodlinePowerUnlocked) {
    return { powerUsed: false, effect: "Bloodline power not yet unlocked.", bloodCost: 0 };
  }
  if (state.bloodPool.current < 50) {
    return { powerUsed: false, effect: "Need 50 blood to activate bloodline power.", bloodCost: 0 };
  }
  const bloodlineInfo = vbGetBloodlineInfo(state.bloodline);
  return {
    powerUsed: true,
    effect: `${bloodlineInfo.power} surges through you! All bonuses doubled for 3 turns.`,
    bloodCost: 50,
  };
}

// ── Daily Hunt ───────────────────────────────────────────────────────────────

export function vbCanDailyHunt(state: VbVampireLairState, currentDay: number): boolean {
  return state.lastDailyHuntDay < currentDay;
}

export function vbPerformDailyHunt(
  state: VbVampireLairState,
  currentDay: number
): VbDailyHuntResult {
  if (!vbCanDailyHunt(state, currentDay)) {
    return Object.freeze({
      totalBlood: 0,
      totalXP: 0,
      victims: [],
      huntersFought: 0,
      huntersDefeated: 0,
      newAchievements: [],
      message: "You've already completed your daily hunt today.",
    });
  }

  const huntCount = 3 + Math.floor(state.stats.level / 10);
  const victims: VbVictimType[] = [];
  let totalBlood = 0;
  let totalXP = 0;
  let huntersFought = 0;
  let huntersDefeated = 0;

  for (let i = 0; i < huntCount; i++) {
    const victim = vbSelectVictim(Math.random());
    victims.push(victim);
    const result = vbHunt(state, victim, Math.random());
    totalBlood += result.bloodGained;
    totalXP += result.xpGained;
    if (result.hunterEncounter) {
      huntersFought++;
      const combatResult = vbEncounterHunter(state, result.hunterType ?? VbHunterType.Priest, Math.random());
      if (combatResult.hunterDefeated) {
        huntersDefeated++;
        totalXP += combatResult.xpGained;
      }
    }
  }

  const newAchievements = vbCheckDailyAchievements(state, totalBlood, huntCount);
  const message = huntersFought > 0
    ? `Daily hunt complete! ${totalBlood} blood, ${totalXP} XP. Fought ${huntersFought} hunters, defeated ${huntersDefeated}.`
    : `Daily hunt complete! ${totalBlood} blood, ${totalXP} XP from ${huntCount} hunts.`;

  return Object.freeze({
    totalBlood,
    totalXP,
    victims: Object.freeze(victims),
    huntersFought,
    huntersDefeated,
    newAchievements,
    message,
  });
}

function vbCheckDailyAchievements(
  state: VbVampireLairState,
  totalBlood: number,
  huntCount: number
): readonly VbAchievementId[] {
  const unlocked: VbAchievementId[] = [];
  if (!state.achievements.includes(VbAchievementId.DailyDevourer)) {
    // This is checked in the main vbCheckAchievements based on dailyHuntsCompleted
  }
  if (!state.achievements.includes(VbAchievementId.ThousandBites)) {
    if (state.stats.totalBloodDrunk + totalBlood >= 1000) {
      unlocked.push(VbAchievementId.ThousandBites);
    }
  }
  return Object.freeze(unlocked);
}

// ── Day Advancement ──────────────────────────────────────────────────────────

export function vbAdvanceDay(state: VbVampireLairState): VbVampireLairState {
  const newMoon = vbAdvanceMoon(state);
  const newShapeshift = vbDecayShapeshift(state);
  const newDay = state.currentDay + 1;

  // Passive blood loss (starvation)
  const bloodLoss = Math.max(1, Math.floor(state.stats.level * 0.5));
  const newBloodCurrent = Math.max(0, state.bloodPool.current - bloodLoss);

  // Health regeneration (minor)
  const healthRegen = Math.floor(5 + state.stats.level * 0.5);
  const newHealth = Math.min(state.stats.maxHealth, state.stats.health + healthRegen);

  // Power regeneration
  const powerRegen = Math.floor(3 + state.stats.level * 0.3);
  const newPower = Math.min(state.stats.maxPower, state.stats.power + powerRegen);

  // Update stats
  const newStats = Object.freeze({
    ...state.stats,
    health: newHealth,
    power: newPower,
    daysSurvived: state.stats.daysSurvived + 1,
  });

  const newBloodPool = Object.freeze({
    ...state.bloodPool,
    current: newBloodCurrent,
  });

  // Calculate new lair stats
  const newLair = Object.freeze({
    ...state.lair,
    ambiance: vbCalculateLairAmbiance({ ...state, lair: state.lair }),
    securityLevel: vbCalculateLairSecurity({ ...state, lair: state.lair }),
  });

  return Object.freeze({
    ...state,
    currentDay: newDay,
    moon: newMoon,
    shapeshift: newShapeshift,
    stats: newStats,
    bloodPool: newBloodPool,
    lair: newLair,
    huntersDefeatedToday: 0,
  });
}

export function vbIsStarving(state: VbVampireLairState): boolean {
  return state.bloodPool.current <= 0;
}

export function vbGetStarvationDamage(state: VbVampireLairState): number {
  if (!vbIsStarving(state)) return 0;
  return Math.floor(10 + state.stats.level * 2);
}

// ── Transformation / Apply Results ───────────────────────────────────────────

export function vbApplyHuntResult(
  state: VbVampireLairState,
  result: VbHuntResult
): VbVampireLairState {
  let newState = state;
  if (result.success) {
    const newPool = vbAddBlood(newState, result.bloodGained, result.victimType);
    const newStats = Object.freeze({
      ...newState.stats,
      totalBloodDrunk: newState.stats.totalBloodDrunk + result.bloodGained,
      totalHunts: newState.stats.totalHunts + 1,
      totalKills: newState.stats.totalKills + 1,
    });
    const statsWithXP = vbAddXP({ ...newState, stats: newStats }, result.xpGained);
    newState = Object.freeze({ ...newState, bloodPool: newPool, stats: statsWithXP });
  } else {
    const newStats = vbAddXP(newState, result.xpGained);
    newState = Object.freeze({ ...newState, stats: newStats });
  }
  return newState;
}

export function vbApplyHunterResult(
  state: VbVampireLairState,
  result: VbHunterEncounterResult
): VbVampireLairState {
  const newHealth = Math.max(0, state.stats.health - result.damageTaken);
  const baseStats = Object.freeze({
    ...state.stats,
    health: newHealth,
    totalHunterDefeats: state.stats.totalHunterDefeats + (result.hunterDefeated ? 1 : 0),
  });
  const statsWithXP = vbAddXP({ ...state, stats: baseStats }, result.xpGained);
  return Object.freeze({ ...state, stats: statsWithXP });
}

export function vbApplyRestResult(
  state: VbVampireLairState,
  result: VbRestResult
): VbVampireLairState {
  const newHealth = Math.min(state.stats.maxHealth, state.stats.health + result.healthRestored);
  const newPower = Math.min(state.stats.maxPower, state.stats.power + result.powerRestored);
  const newBlood = Object.freeze({
    ...state.bloodPool,
    current: state.bloodPool.current - result.bloodConsumed,
  });
  const newStats = Object.freeze({
    ...state.stats,
    health: newHealth,
    power: newPower,
    totalRests: state.stats.totalRests + 1,
  });
  const newAchievements = [...state.achievements, ...result.newAchievements];
  return Object.freeze({ ...state, stats: newStats, bloodPool: newBlood, achievements: Object.freeze(newAchievements) });
}

export function vbApplyShapeshiftResult(
  state: VbVampireLairState,
  result: VbShapeshiftResult
): VbVampireLairState {
  if (!result.success) return state;
  const powerCost = 10;
  const newPower = Math.max(0, state.stats.power - powerCost);
  const newStats = Object.freeze({
    ...state.stats,
    power: newPower,
    totalShapeshifts: state.stats.totalShapeshifts + 1,
  });
  return Object.freeze({ ...state, stats: newStats, shapeshift: result.bonuses });
}

export function vbApplyCovenAction(
  state: VbVampireLairState,
  result: VbCovenAction,
  bloodCost: number
): VbVampireLairState {
  if (!result.success) return state;
  const newBlood = Object.freeze({ ...state.bloodPool, current: state.bloodPool.current - bloodCost });
  const newCoven = Object.freeze({
    ...state.coven,
    influence: state.coven.influence + result.influenceGained,
    rank: result.newRank ?? state.coven.rank,
    reputation: state.coven.reputation + Math.floor(result.influenceGained * 0.3),
  });
  return Object.freeze({ ...state, bloodPool: newBlood, coven: newCoven });
}

export function vbApplyRoomUpgrade(
  state: VbVampireLairState,
  result: VbRoomUpgrade
): VbVampireLairState {
  if (!result.success) return state;
  const newRooms = { ...state.lair.rooms, [result.roomId]: result.newLevel };
  const newLair = Object.freeze({
    ...state.lair,
    rooms: newRooms,
    ambiance: vbCalculateLairAmbiance({ ...state, lair: { ...state.lair, rooms: newRooms } }),
    securityLevel: vbCalculateLairSecurity({ ...state, lair: { ...state.lair, rooms: newRooms } }),
  });
  const newBlood = Object.freeze({ ...state.bloodPool, current: state.bloodPool.current - result.cost });
  return Object.freeze({ ...state, lair: newLair, bloodPool: newBlood });
}

export function vbApplyDailyHuntResult(
  state: VbVampireLairState,
  result: VbDailyHuntResult,
  currentDay: number
): VbVampireLairState {
  const newPool = vbAddBlood(state, result.totalBlood, result.victims[0] ?? VbVictimType.Peasant);
  const newStats = Object.freeze({
    ...state.stats,
    totalBloodDrunk: state.stats.totalBloodDrunk + result.totalBlood,
    totalHunts: state.stats.totalHunts + result.victims.length,
    totalKills: state.stats.totalKills + result.victims.length,
    totalHunterDefeats: state.stats.totalHunterDefeats + result.huntersDefeated,
  });
  const statsWithXP = vbAddXP({ ...state, stats: newStats }, result.totalXP);
  const newAchievements = [...state.achievements, ...result.newAchievements];
  return Object.freeze({
    ...state,
    stats: statsWithXP,
    bloodPool: newPool,
    achievements: Object.freeze(newAchievements),
    dailyHuntsCompleted: state.dailyHuntsCompleted + 1,
    lastDailyHuntDay: currentDay,
    huntersDefeatedToday: state.huntersDefeatedToday + result.huntersDefeated,
  });
}

// ── Bloodline Power Bonus Helpers ────────────────────────────────────────────

export function vbGetHuntMultiplier(state: VbVampireLairState): number {
  const bloodlineInfo = vbGetBloodlineInfo(state.bloodline);
  return 1 + bloodlineInfo.huntBonus;
}

export function vbGetRestMultiplier(state: VbVampireLairState): number {
  const bloodlineInfo = vbGetBloodlineInfo(state.bloodline);
  return 1 + bloodlineInfo.restBonus;
}

export function vbGetShapeshiftMultiplier(state: VbVampireLairState): number {
  const bloodlineInfo = vbGetBloodlineInfo(state.bloodline);
  return 1 + bloodlineInfo.shapeshiftBonus;
}

export function vbGetStealthMultiplier(state: VbVampireLairState): number {
  const bloodlineInfo = vbGetBloodlineInfo(state.bloodline);
  return 1 + bloodlineInfo.stealthBonus + state.shapeshift.stealthBonus;
}

export function vbGetOverallPower(state: VbVampireLairState): number {
  const levelPower = state.stats.level / 50;
  const moonPower = state.moon.powerMultiplier;
  const formPower = state.shapeshift.powerMultiplier;
  const rankPower = vbGetRankPowerMultiplier(state.coven.rank);
  const bloodlinePower = state.bloodlinePowerUnlocked ? 1.2 : 1.0;
  return Math.min(5.0, levelPower * moonPower * formPower * rankPower * bloodlinePower);
}

function vbGetRankPowerMultiplier(rank: VbCovenRank): number {
  const multipliers: Record<VbCovenRank, number> = {
    [VbCovenRank.Fledgling]: 0.8,
    [VbCovenRank.Neophyte]: 0.9,
    [VbCovenRank.Acolyte]: 1.0,
    [VbCovenRank.Master]: 1.15,
    [VbCovenRank.Elder]: 1.3,
  };
  return multipliers[rank];
}

// ── State Validation ─────────────────────────────────────────────────────────

export function vbValidateState(state: VbVampireLairState): { valid: boolean; errors: readonly string[] } {
  const errors: string[] = [];

  if (state.stats.level < 1 || state.stats.level > 50) {
    errors.push("Level must be between 1 and 50.");
  }
  if (state.stats.health > state.stats.maxHealth) {
    errors.push("Health exceeds max health.");
  }
  if (state.stats.power > state.stats.maxPower) {
    errors.push("Power exceeds max power.");
  }
  if (state.bloodPool.current > state.bloodPool.max) {
    errors.push("Blood exceeds max capacity.");
  }
  if (state.bloodPool.current < 0) {
    errors.push("Blood cannot be negative.");
  }
  if (state.stats.xp < 0) {
    errors.push("XP cannot be negative.");
  }

  for (const room of ROOM_DATA) {
    const level = state.lair.rooms[room.id];
    if (level < 0 || level > room.maxLevel) {
      errors.push(`Room ${room.name} level must be 0-${room.maxLevel}.`);
    }
  }

  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

// ── Serialization ────────────────────────────────────────────────────────────

export function vbSerializeState(state: VbVampireLairState): string {
  return JSON.stringify(state, null, 2);
}

export function vbDeserializeState(json: string): VbVampireLairState | null {
  try {
    const parsed = JSON.parse(json);
    if (parsed && parsed.vampireName && parsed.bloodline && parsed.stats) {
      return parsed as VbVampireLairState;
    }
    return null;
  } catch {
    return null;
  }
}

// ── Computed / Derived State ─────────────────────────────────────────────────

export function vbGetVampireSummary(state: VbVampireLairState): string {
  const bloodlineInfo = vbGetBloodlineInfo(state.bloodline);
  const rankName = vbGetRankName(state.coven.rank);
  const levelTitle = vbGetLevelTitle(state.stats.level);
  const moonName = vbGetMoonPhaseName(state.moon.phase);
  return (
    `${state.vampireName} the ${levelTitle} | ` +
    `Bloodline: ${bloodlineInfo.name} | ` +
    `Rank: ${rankName} | ` +
    `Level: ${state.stats.level} | ` +
    `Blood: ${state.bloodPool.current}/${state.bloodPool.max} | ` +
    `Moon: ${moonName} | ` +
    `Form: ${vbGetFormName(state.shapeshift.form)} | ` +
    `Days: ${state.stats.daysSurvived}`
  );
}

export function vbGetBloodPurityLabel(purity: number): string {
  if (purity >= 0.9) return "Pristine ✨";
  if (purity >= 0.7) return "Rich 🍷";
  if (purity >= 0.5) return "Average 🩸";
  if (purity >= 0.3) return "Diluted 💧";
  return "Tainted ☠️";
}

export function vbGetHealthStatusLabel(health: number, maxHealth: number): string {
  const percent = health / maxHealth;
  if (percent >= 0.8) return "Vigorous";
  if (percent >= 0.6) return "Healthy";
  if (percent >= 0.4) return "Wounded";
  if (percent >= 0.2) return "Critical";
  return "Near Death";
}

export function vbGetPowerStatusLabel(power: number, maxPower: number): string {
  const percent = power / maxPower;
  if (percent >= 0.8) return "Overflowing";
  if (percent >= 0.6) return "Strong";
  if (percent >= 0.4) return "Moderate";
  if (percent >= 0.2) return "Weakened";
  return "Depleted";
}

export function vbGetDangerAssessment(state: VbVampireLairState): "Safe" | "Caution" | "Danger" | "Critical" {
  if (state.stats.health < state.stats.maxHealth * 0.2) return "Critical";
  if (vbIsStarving(state)) return "Danger";
  if (state.moon.isFullMoon && state.stats.power < state.stats.maxPower * 0.3) return "Danger";
  if (state.huntersDefeatedToday > 3) return "Caution";
  return "Safe";
}

export function vbGetRecommendedAction(state: VbVampireLairState): string {
  const danger = vbGetDangerAssessment(state);
  if (danger === "Critical") return "Rest immediately in your coffin!";
  if (danger === "Danger") return "Find a victim quickly or retreat to your lair.";
  if (danger === "Caution") return "Be cautious. Hunters may be tracking you.";
  if (vbIsStarving(state)) return "You hunger. Hunt before the thirst consumes you.";
  if (state.moon.isFullMoon && state.shapeshift.form === VbShapeshiftForm.Human) {
    return "The full moon empowers you. Shapeshift and hunt!";
  }
  if (state.stats.power < state.stats.maxPower * 0.3) {
    return "Your power is low. Consider resting.";
  }
  if (state.coven.rank === VbCovenRank.Fledgling && state.bloodPool.current > 100) {
    return "Perform coven actions to rise through the ranks.";
  }
  return "The night is young. Choose your pursuit.";
}

// ── Coven Loyalty & Members ──────────────────────────────────────────────────

export function vbRecruitCovenMember(state: VbVampireLairState): { success: boolean; message: string } {
  const recruitCost = 30 + state.coven.members * 15;
  if (state.bloodPool.current < recruitCost) {
    return {
      success: false,
      message: `Need ${recruitCost} blood to recruit. Have ${state.bloodPool.current}.`,
    };
  }
  const maxMembers = vbGetMaxCovenMembers(state.coven.rank);
  if (state.coven.members >= maxMembers) {
    return {
      success: false,
      message: `Maximum coven members for ${vbGetRankName(state.coven.rank)} is ${maxMembers}.`,
    };
  }
  return {
    success: true,
    message: `A new vampire joins your coven! Total members: ${state.coven.members + 1}. Cost: ${recruitCost} blood.`,
  };
}

export function vbGetMaxCovenMembers(rank: VbCovenRank): number {
  const limits: Record<VbCovenRank, number> = {
    [VbCovenRank.Fledgling]: 0,
    [VbCovenRank.Neophyte]: 3,
    [VbCovenRank.Acolyte]: 7,
    [VbCovenRank.Master]: 12,
    [VbCovenRank.Elder]: 20,
  };
  return limits[rank];
}

export function vbCalculateCovenLoyalty(state: VbVampireLairState): number {
  const repBonus = state.coven.reputation / 200;
  const memberPenalty = state.coven.members * 0.02;
  const rankBonus = vbGetRankPowerMultiplier(state.coven.rank) * 0.1;
  return Math.min(100, Math.max(0, 50 + repBonus * 50 - memberPenalty * 50 + rankBonus * 50));
}

// ── Full Moon Specials ───────────────────────────────────────────────────────

export function vbGetFullMoonBonus(state: VbVampireLairState): { bloodBonus: number; xpBonus: number; powerBonus: number } {
  if (!state.moon.isFullMoon) {
    return Object.freeze({ bloodBonus: 0, xpBonus: 0, powerBonus: 0 });
  }
  const bloodlineInfo = vbGetBloodlineInfo(state.bloodline);
  return Object.freeze({
    bloodBonus: Math.floor(20 * bloodlineInfo.huntBonus),
    xpBonus: Math.floor(30 * bloodlineInfo.huntBonus),
    powerBonus: Math.floor(15 * bloodlineInfo.restBonus),
  });
}

export function vbIsFullMoonActive(state: VbVampireLairState): boolean {
  return state.moon.isFullMoon;
}

export function vbIsNewMoonActive(state: VbVampireLairState): boolean {
  return state.moon.isNewMoon;
}

// ── Blood Consumption Effects ────────────────────────────────────────────────

export function vbGetBloodEffect(victimType: VbVictimType): { healthGain: number; powerGain: number; specialEffect: string } {
  const victimInfo = vbGetVictimInfo(victimType);
  const healthGain = Math.floor(victimInfo.bloodQuality * 10);
  const powerGain = Math.floor(victimInfo.bloodQuality * 8);

  const effects: Record<VbVictimType, string> = {
    [VbVictimType.Peasant]: "A meager meal. Barely satisfying.",
    [VbVictimType.Merchant]: "Adequate sustenance. A hint of spice in the blood.",
    [VbVictimType.Noble]: "Exquisite! Noble blood fills you with vigor.",
    [VbVictimType.Priestess]: "Divine essence! Your wounds close rapidly.",
    [VbVictimType.Soldier]: "Martial blood courses through you. Strength surges.",
    [VbVictimType.Scholar]: "The blood carries fragments of knowledge. Clarity.",
    [VbVictimType.Bard]: "Their last melody echoes in your mind. Euphoria.",
    [VbVictimType.Witch]: "Arcane energy crackles through your veins!",
    [VbVictimType.Child]: "The purest blood. Overwhelming power, lingering guilt.",
    [VbVictimType.Traveler]: "Road-weary blood. Tales of distant lands in every drop.",
    [VbVictimType.Gypsy]: "Fortune's favor. Your senses sharpen impossibly.",
    [VbVictimType.Alchemist]: "Alchemical vitae. Strange visions dance behind your eyes.",
  };

  return Object.freeze({
    healthGain,
    powerGain,
    specialEffect: effects[victimType],
  });
}

// ── Victim Spawn Weighting ───────────────────────────────────────────────────

export function vbGetVictimSpawnWeights(state: VbVampireLairState): Record<VbVictimType, number> {
  const weights: Partial<Record<VbVictimType, number>> = {};
  for (const victim of VICTIM_DATA) {
    const levelAccess = state.stats.level >= victim.dangerLevel * 50 ? 1 : 0.3;
    const moonFactor = state.moon.isFullMoon ? 1.2 : 1.0;
    weights[victim.id] = (1 - victim.dangerLevel) * levelAccess * moonFactor;
  }
  return Object.freeze(weights as Record<VbVictimType, number>);
}

// ── Hunter Tracking ──────────────────────────────────────────────────────────

export function vbGetActiveHunters(state: VbVampireLairState): readonly VbHunterType[] {
  if (state.huntersDefeatedToday >= 5) return Object.freeze([]);
  const active: VbHunterType[] = [];
  const baseChance = 0.3 - state.lair.securityLevel * 0.2;
  const stealthReduction = vbGetBloodlineInfo(state.bloodline).stealthBonus;

  for (const hunter of HUNTER_DATA) {
    const adjustedChance = baseChance * hunter.detection * (1 - stealthReduction);
    if (Math.random() < adjustedChance) {
      active.push(hunter.id);
    }
  }
  return Object.freeze(active);
}

// ── Comparative Power Analysis ───────────────────────────────────────────────

export function vbCompareBloodlineStrength(bloodline1: VbBloodline, bloodline2: VbBloodline): string {
  const info1 = vbGetBloodlineInfo(bloodline1);
  const info2 = vbGetBloodlineInfo(bloodline2);
  const total1 = info1.huntBonus + info1.restBonus + info1.shapeshiftBonus + info1.stealthBonus;
  const total2 = info2.huntBonus + info2.restBonus + info2.shapeshiftBonus + info2.stealthBonus;

  if (total1 > total2) return `${info1.name} excels overall over ${info2.name}.`;
  if (total2 > total1) return `${info2.name} excels overall over ${info1.name}.`;
  return `${info1.name} and ${info2.name} are evenly matched.`;
}

export function vbGetBestVictimForXP(state: VbVampireLairState): VbVictimType {
  let best = VbVictimType.Peasant;
  let bestValue = 0;
  for (const victim of VICTIM_DATA) {
    const value = victim.bloodQuality * 30 * (1 - victim.dangerLevel * 0.5);
    if (value > bestValue) {
      bestValue = value;
      best = victim.id;
    }
  }
  return best;
}

export function vbGetBestVictimForBlood(state: VbVampireLairState): VbVictimType {
  let best = VbVictimType.Peasant;
  let bestValue = 0;
  for (const victim of VICTIM_DATA) {
    const value = victim.bloodAmount * victim.bloodQuality * (1 - victim.escapeChance);
    if (value > bestValue) {
      bestValue = value;
      best = victim.id;
    }
  }
  return best;
}

export function vbGetBestShapeshiftForHunting(state: VbVampireLairState): VbShapeshiftForm {
  return VbShapeshiftForm.Bat; // Bats have best stealth for hunting
}

export function vbGetBestShapeshiftForCombat(state: VbVampireLairState): VbShapeshiftForm {
  return VbShapeshiftForm.Wolf; // Wolves have highest power multiplier
}

// ── Lores & Flavor Text ──────────────────────────────────────────────────────

export function vbGetBloodlineLore(bloodline: VbBloodline): string {
  return vbGetBloodlineInfo(bloodline).lore;
}

export function vbGetVictimLore(victim: VbVictimType): string {
  return vbGetVictimInfo(victim).lore;
}

export function vbGetHunterLore(hunter: VbHunterType): string {
  return vbGetHunterInfo(hunter).lore;
}

export function vbGetCoffinLore(coffin: VbCoffinType): string {
  return vbGetCoffinInfo(coffin).lore;
}

export function vbGetRoomLore(room: VbRoomType): string {
  return vbGetRoomInfo(room).lore;
}

export function vbGetAchievementLore(achievement: VbAchievementId): string {
  return vbGetAchievement(achievement).lore;
}

export function vbGetRandomFlavorText(): string {
  const texts = [
    "The night whispers your name, eternal one.",
    "Shadows dance at your command.",
    "Blood is the currency of immortality.",
    "Even the moon fears your gaze.",
    "The mortals sleep, unaware of your hunger.",
    "Centuries pass like moments to the undying.",
    "Your coffin calls. The dawn approaches.",
    "The hunt is the only truth.",
    "In darkness, you find your truest self.",
    "The coven awaits your command, master.",
    "Each drop tells a story. Each story, a life.",
    "The cross means nothing to one who has transcended fear.",
    "Your reflection fades, but your legend grows.",
    "The village sleeps. The feast begins.",
    "Immortality is a hunger that never fades.",
    "Silver burns, but the memory of pain fades.",
    "The garlic wreath — a mortal's desperate hope.",
    "Your lair is your kingdom. Defend it with blood.",
    "The bats circle. Your kin are near.",
    "Full moon rises. The ancient power awakens.",
  ];
  return texts[Math.floor(Math.random() * texts.length)];
}

// ── Coffin upgrade chain helpers ─────────────────────────────────────────────

export function vbGetNextCoffinInChain(state: VbVampireLairState): VbCoffinInfo | null {
  const currentIndex = COFFIN_DATA.findIndex((c) => c.id === state.coffinType);
  if (currentIndex >= COFFIN_DATA.length - 1) return null;
  return COFFIN_DATA[currentIndex + 1];
}

export function vbGetCoffinUpgradePath(): readonly VbCoffinType[] {
  return Object.freeze(COFFIN_DATA.map((c) => c.id));
}

// ── State Snapshot ───────────────────────────────────────────────────────────

export function vbCreateSnapshot(state: VbVampireLairState): string {
  const summary = vbGetVampireSummary(state);
  const danger = vbGetDangerAssessment(state);
  return `${summary} | Danger: ${danger} | Achievements: ${state.achievements.length}/${ACHIEVEMENT_DATA.length}`;
}

// ── Blood type storage management ────────────────────────────────────────────

export function vbGetStoredBloodTypeCount(state: VbVampireLairState): number {
  return state.bloodPool.storedTypes.length;
}

export function vbHasBloodType(state: VbVampireLairState, victimType: VbVictimType): boolean {
  return state.bloodPool.storedTypes.includes(victimType);
}

export function vbGetUniqueBloodTypesCollected(state: VbVampireLairState): number {
  return state.bloodPool.storedTypes.length;
}

export function vbGetBloodTypeCompletion(state: VbVampireLairState): number {
  return Math.floor((state.bloodPool.storedTypes.length / VICTIM_DATA.length) * 100);
}

// ── Power calculations for combat ────────────────────────────────────────────

export function vbCalculateCombatPower(state: VbVampireLairState): number {
  const base = state.stats.level * 10 + state.stats.power * 0.5;
  const bloodline = vbGetBloodlineInfo(state.bloodline);
  const formMult = state.shapeshift.powerMultiplier;
  const moonMult = state.moon.powerMultiplier;
  const healthMult = state.stats.health / state.stats.maxHealth;
  return Math.floor(base * formMult * moonMult * (1 + bloodline.huntBonus) * (0.5 + healthMult * 0.5));
}

export function vbCalculateDefensePower(state: VbVampireLairState): number {
  const coffinInfo = vbGetCoffinInfo(state.coffinType);
  const lairDefense = vbCalculateLairSecurity(state);
  const bloodlineStealth = vbGetBloodlineInfo(state.bloodline).stealthBonus;
  const formStealth = state.shapeshift.stealthBonus;
  return Math.floor(50 * (coffinInfo.protection + lairDefense + bloodlineStealth + formStealth));
}

export function vbCalculateFleeChance(state: VbVampireLairState): number {
  const formSpeed = state.shapeshift.speedBonus;
  const bloodlineStealth = vbGetBloodlineInfo(state.bloodline).stealthBonus;
  const moonBonus = state.moon.isNewMoon ? 0.15 : 0;
  return Math.min(0.9, 0.3 + formSpeed * 0.3 + bloodlineStealth * 0.2 + moonBonus);
}

// ── Nutrition / Feeding ──────────────────────────────────────────────────────

export function vbCalculateNutrition(state: VbVampireLairState): number {
  if (state.bloodPool.current <= 0) return 0;
  const satiation = state.bloodPool.current / state.bloodPool.max;
  const quality = state.bloodPool.purity;
  return Math.min(1.0, satiation * 0.6 + quality * 0.4);
}

export function vbGetFeedingRecommendation(state: VbVampireLairState): { shouldFeed: boolean; urgency: "None" | "Low" | "Medium" | "High" | "Critical" } {
  const nutrition = vbCalculateNutrition(state);
  if (nutrition >= 0.7) return { shouldFeed: false, urgency: "None" };
  if (nutrition >= 0.5) return { shouldFeed: true, urgency: "Low" };
  if (nutrition >= 0.3) return { shouldFeed: true, urgency: "Medium" };
  if (nutrition >= 0.1) return { shouldFeed: true, urgency: "High" };
  return { shouldFeed: true, urgency: "Critical" };
}

// ── Blood Pool Purity Management ─────────────────────────────────────────────

export function vbDiluteBloodPool(state: VbVampireLairState): VbBloodPool {
  return Object.freeze({
    ...state.bloodPool,
    purity: Math.max(0, state.bloodPool.purity - 0.1),
  });
}

export function vbPurifyBloodPool(state: VbVampireLairState): VbBloodPool {
  const purificationCost = 30;
  if (state.bloodPool.current < purificationCost) return state.bloodPool;
  return Object.freeze({
    ...state.bloodPool,
    current: state.bloodPool.current - purificationCost,
    purity: Math.min(1.0, state.bloodPool.purity + 0.15),
  });
}

export function vbGetPurificationCost(): number {
  return 30;
}

// ── Final Stat Calculations ──────────────────────────────────────────────────

export function vbGetTotalPlayStats(state: VbVampireLairState): {
  totalActions: number;
  efficiency: number;
  dominance: number;
} {
  const totalActions =
    state.stats.totalHunts +
    state.stats.totalRests +
    state.stats.totalShapeshifts +
    state.stats.totalHunterDefeats;
  const efficiency =
    totalActions > 0
      ? state.stats.totalKills / totalActions
      : 0;
  const dominance =
    state.stats.totalHunterDefeats / Math.max(1, state.stats.totalHunterDefeats + state.stats.daysSurvived);
  return Object.freeze({
    totalActions,
    efficiency: Math.round(efficiency * 100) / 100,
    dominance: Math.round(dominance * 100) / 100,
  });
}

// ── Coven Ritual Helpers ─────────────────────────────────────────────────────

export function vbPerformDarkRitual(
  state: VbVampireLairState,
  ritualType: "power" | "health" | "blood" | "stealth"
): { success: boolean; effect: string; bloodCost: number } {
  const costs: Record<string, number> = { power: 40, health: 30, blood: 50, stealth: 35 };
  const cost = costs[ritualType] ?? 30;

  if (state.bloodPool.current < cost) {
    return { success: false, effect: `Not enough blood for ${ritualType} ritual. Need ${cost}.`, bloodCost: 0 };
  }

  const roomLevel = state.lair.rooms[VbRoomType.RitualChamber];
  const roomBonus = 1 + vbGetRoomInfo(VbRoomType.RitualChamber).baseBonus * roomLevel;

  const effects: Record<string, string> = {
    power: `Dark energies surge! +${Math.floor(25 * roomBonus)} power restored.`,
    health: `The ritual mends your flesh. +${Math.floor(40 * roomBonus)} health.`,
    blood: `Blood materializes from the void. +${Math.floor(30 * roomBonus)} blood.`,
    stealth: `Shadows cling to you. Stealth enhanced for 5 turns.`,
  };

  return {
    success: true,
    effect: effects[ritualType] ?? "The ritual completes with a whisper.",
    bloodCost: cost,
  };
}

// ── Pre-computed Lookup Maps ─────────────────────────────────────────────────

const VICTIM_MAP: ReadonlyMap<VbVictimType, VbVictimInfo> = new Map(
  VICTIM_DATA.map((v) => [v.id, v])
);

const HUNTER_MAP: ReadonlyMap<VbHunterType, VbHunterInfo> = new Map(
  HUNTER_DATA.map((h) => [h.id, h])
);

const COFFIN_MAP: ReadonlyMap<VbCoffinType, VbCoffinInfo> = new Map(
  COFFIN_DATA.map((c) => [c.id, c])
);

const ROOM_MAP: ReadonlyMap<VbRoomType, VbRoomInfo> = new Map(
  ROOM_DATA.map((r) => [r.id, r])
);

const ACHIEVEMENT_MAP: ReadonlyMap<VbAchievementId, VbAchievement> = new Map(
  ACHIEVEMENT_DATA.map((a) => [a.id, a])
);

export function vbGetVictimById(id: VbVictimType): VbVictimInfo {
  return VICTIM_MAP.get(id) ?? VICTIM_DATA[0];
}

export function vbGetHunterById(id: VbHunterType): VbHunterInfo {
  return HUNTER_MAP.get(id) ?? HUNTER_DATA[0];
}

export function vbGetCoffinById(id: VbCoffinType): VbCoffinInfo {
  return COFFIN_MAP.get(id) ?? COFFIN_DATA[0];
}

export function vbGetRoomById(id: VbRoomType): VbRoomInfo {
  return ROOM_MAP.get(id) ?? ROOM_DATA[0];
}

export function vbGetAchievementById(id: VbAchievementId): VbAchievement {
  return ACHIEVEMENT_MAP.get(id) ?? ACHIEVEMENT_DATA[0];
}

// ── Enum Iterators ───────────────────────────────────────────────────────────

export function vbGetAllBloodlineIds(): readonly VbBloodline[] {
  return Object.freeze(Object.values(VbBloodline));
}

export function vbGetAllVictimTypes(): readonly VbVictimType[] {
  return Object.freeze(Object.values(VbVictimType));
}

export function vbGetAllHunterTypes(): readonly VbHunterType[] {
  return Object.freeze(Object.values(VbHunterType));
}

export function vbGetAllCoffinTypes(): readonly VbCoffinType[] {
  return Object.freeze(Object.values(VbCoffinType));
}

export function vbGetAllRoomTypes(): readonly VbRoomType[] {
  return Object.freeze(Object.values(VbRoomType));
}

export function vbGetAllAchievementIds(): readonly VbAchievementId[] {
  return Object.freeze(Object.values(VbAchievementId));
}

export function vbGetAllMoonPhases(): readonly VbMoonPhase[] {
  return Object.freeze(Object.values(VbMoonPhase));
}

export function vbGetAllCovenRanks(): readonly VbCovenRank[] {
  return Object.freeze(Object.values(VbCovenRank));
}

// ── Bloodline passive application ────────────────────────────────────────────

export function vbApplyBloodlinePassive(
  state: VbVampireLairState,
  action: "hunt" | "rest" | "shapeshift" | "defend"
): number {
  const bloodlineInfo = vbGetBloodlineInfo(state.bloodline);
  const bonusMap: Record<string, number> = {
    hunt: bloodlineInfo.huntBonus,
    rest: bloodlineInfo.restBonus,
    shapeshift: bloodlineInfo.shapeshiftBonus,
    defend: bloodlineInfo.stealthBonus,
  };
  return bonusMap[action] ?? 0;
}

// ── Night event generation ───────────────────────────────────────────────────

export function vbGenerateNightEvent(state: VbVampireLairState): {
  eventType: "wanderer" | "hunter_patrol" | "full_moon_revel" | "coven_summons" | "stranger_at_door" | "storm";
  description: string;
  choices: readonly string[];
} {
  const events = [
    {
      eventType: "wanderer" as const,
      description: "A lone wanderer stumbles near your lair. Their heartbeat calls to you.",
      choices: Object.freeze(["Hunt them", "Let them pass", "Follow at a distance"]),
    },
    {
      eventType: "hunter_patrol" as const,
      description: "You sense holy symbols and silver nearby. A hunter patrol passes close.",
      choices: Object.freeze(["Ambush", "Hide in shadow", "Flee deeper into the lair"]),
    },
    {
      eventType: "full_moon_revel" as const,
      description: "The full moon bathes the world in silver light. Your power surges.",
      choices: Object.freeze(["Hunt under moonlight", "Perform a ritual", "Shapeshift and explore"]),
    },
    {
      eventType: "coven_summons" as const,
      description: "A raven delivers a blood-written summons from the coven council.",
      choices: Object.freeze(["Attend immediately", "Send a proxy", "Ignore the summons"]),
    },
    {
      eventType: "stranger_at_door" as const,
      description: "Someone knocks at your crypt door. The scent is... unusual.",
      choices: Object.freeze(["Open the door", "Peek through the crack", "Ignore them"]),
    },
    {
      eventType: "storm" as const,
      description: "Thunder crashes. Lightning reveals a figure on the hill above your lair.",
      choices: Object.freeze(["Investigate", "Barricade and wait", "Use the storm as cover to hunt"]),
    },
  ];

  const fullMoonEvents = [
    {
      eventType: "full_moon_revel" as const,
      description: "Luna's gaze empowers you beyond mortal limits. The world trembles.",
      choices: Object.freeze(["Embrace the power", "Share it with the coven", "Store it for later"]),
    },
  ];

  if (state.moon.isFullMoon && Math.random() < 0.4) {
    return fullMoonEvents[0];
  }

  return events[Math.floor(Math.random() * events.length)];
}

// ── Score Calculation ────────────────────────────────────────────────────────

export function vbCalculateVampireScore(state: VbVampireLairState): number {
  const levelScore = state.stats.level * 100;
  const killScore = state.stats.totalKills * 10;
  const hunterScore = state.stats.totalHunterDefeats * 50;
  const achievementScore = state.achievements.length * 200;
  const covenScore = Object.values(VbCovenRank).indexOf(state.coven.rank) * 500;
  const lairScore = Object.values(state.lair.rooms).reduce((a, b) => a + b, 0) * 30;
  const survivalScore = state.stats.daysSurvived * 5;
  const bloodlineScore = state.bloodlinePowerUnlocked ? 1000 : 0;
  const coffinScore = COFFIN_DATA.findIndex((c) => c.id === state.coffinType) * 200;

  return levelScore + killScore + hunterScore + achievementScore + covenScore +
    lairScore + survivalScore + bloodlineScore + coffinScore;
}

export function vbGetVampireGrade(score: number): string {
  if (score >= 20000) return "S+ — Crimson Emperor";
  if (score >= 15000) return "S — Ancient Lord";
  if (score >= 10000) return "A — Master Predator";
  if (score >= 7000) return "B — Experienced Hunter";
  if (score >= 4000) return "C — Rising Darkness";
  if (score >= 2000) return "D — Young Predator";
  return "F — Fresh Fledgling";
}

// ============================================================================
// DEFAULT EXPORT HOOK — React imports ONLY here
// ============================================================================
import { useState } from "react";

export default function useVampireLair(initialState?: VbVampireLairState) {
  const [state, setState] = useState<VbVampireLairState>(
    initialState ?? vbCreateInitialState("Lord Valtor", VbBloodline.Dracula)
  );

  const hunt = (victimType: VbVictimType, stealthRoll: number) => {
    setState((prev) => {
      const result = vbHunt(prev, victimType, stealthRoll);
      const updated = vbApplyHuntResult(prev, result);
      const newAchievements = vbCheckAchievements(updated);
      if (newAchievements.length > 0) {
        return Object.freeze({
          ...updated,
          achievements: Object.freeze([...updated.achievements, ...newAchievements]),
        });
      }
      return updated;
    });
  };

  const rest = () => {
    setState((prev) => {
      const result = vbRest(prev);
      return vbApplyRestResult(prev, result);
    });
  };

  const shapeshift = (form: VbShapeshiftForm) => {
    setState((prev) => {
      const result = vbShapeshift(prev, form);
      return vbApplyShapeshiftResult(prev, result);
    });
  };

  const encounterHunter = (hunterType: VbHunterType, roll: number) => {
    setState((prev) => {
      const result = vbEncounterHunter(prev, hunterType, roll);
      return vbApplyHunterResult(prev, result);
    });
  };

  const performCovenAction = (actionType: "tribute" | "politics" | "ritual" | "recruit") => {
    setState((prev) => {
      const costs: Record<string, number> = { tribute: 30, politics: 0, ritual: 50, recruit: 20 };
      const result = vbPerformCovenAction(prev, actionType);
      const updated = vbApplyCovenAction(prev, result, costs[actionType] ?? 0);
      const newAchievements = vbCheckAchievements(updated);
      if (newAchievements.length > 0) {
        return Object.freeze({
          ...updated,
          achievements: Object.freeze([...updated.achievements, ...newAchievements]),
        });
      }
      return updated;
    });
  };

  const upgradeRoom = (roomId: VbRoomType) => {
    setState((prev) => {
      const result = vbUpgradeRoom(prev, roomId);
      const updated = vbApplyRoomUpgrade(prev, result);
      const newAchievements = vbCheckAchievements(updated);
      if (newAchievements.length > 0) {
        return Object.freeze({
          ...updated,
          achievements: Object.freeze([...updated.achievements, ...newAchievements]),
        });
      }
      return updated;
    });
  };

  const upgradeCoffin = () => {
    setState((prev) => {
      const result = vbUpgradeCoffin(prev);
      return result.newState;
    });
  };

  const performDailyHunt = (currentDay: number) => {
    setState((prev) => {
      const result = vbPerformDailyHunt(prev, currentDay);
      const updated = vbApplyDailyHuntResult(prev, result, currentDay);
      const newAchievements = vbCheckAchievements(updated);
      if (newAchievements.length > 0) {
        return Object.freeze({
          ...updated,
          achievements: Object.freeze([...updated.achievements, ...newAchievements]),
        });
      }
      return updated;
    });
  };

  const advanceDay = () => {
    setState((prev) => vbAdvanceDay(prev));
  };

  const shareBlood = (amount: number) => {
    setState((prev) => {
      const result = vbShareBlood(prev, amount);
      if (!result.success) return prev;
      const newPool = Object.freeze({ ...prev.bloodPool, current: prev.bloodPool.current - result.amountShared });
      const newCoven = Object.freeze({
        ...prev.coven,
        reputation: prev.coven.reputation + result.covenReputation,
      });
      return Object.freeze({ ...prev, bloodPool: newPool, coven: newCoven });
    });
  };

  const unlockBloodlinePower = () => {
    setState((prev) => {
      const result = vbUnlockBloodlinePower(prev);
      if (!result.success) return prev;
      return Object.freeze({
        ...prev,
        bloodlinePowerUnlocked: true,
        bloodPool: Object.freeze({ ...prev.bloodPool, current: prev.bloodPool.current - 100 }),
      });
    });
  };

  const expandBloodPool = (amount: number) => {
    setState((prev) => {
      const newPool = vbExpandBloodPool(prev, amount);
      return Object.freeze({ ...prev, bloodPool: newPool });
    });
  };

  const purifyBlood = () => {
    setState((prev) => {
      const newPool = vbPurifyBloodPool(prev);
      return Object.freeze({ ...prev, bloodPool: newPool });
    });
  };

  const performRitual = (ritualType: "power" | "health" | "blood" | "stealth") => {
    setState((prev) => {
      const result = vbPerformDarkRitual(prev, ritualType);
      if (!result.success) return prev;
      return Object.freeze({
        ...prev,
        bloodPool: Object.freeze({ ...prev.bloodPool, current: prev.bloodPool.current - result.bloodCost }),
      });
    });
  };

  return Object.freeze({
    state,
    hunt,
    rest,
    shapeshift,
    encounterHunter,
    performCovenAction,
    upgradeRoom,
    upgradeCoffin,
    performDailyHunt,
    advanceDay,
    shareBlood,
    unlockBloodlinePower,
    expandBloodPool,
    purifyBlood,
    performRitual,
  });
}
