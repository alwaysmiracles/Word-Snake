/**
 * pet-companion-wire.ts — Virtual Pet Companion System for Word Snake.
 *
 * Full pet lifecycle: adoption, feeding, playing, resting, evolution,
 * abilities, accessories, bonds, personality, and UI helpers.
 *
 * All state persists in localStorage under the `ws_pet_` prefix.
 * Every exported function uses try/catch and returns safe defaults.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The eight adoptable pet types. */
export type PetType =
  | "Dragon" | "Phoenix" | "Cat" | "Owl" | "Fox"
  | "Turtle" | "Rabbit" | "Unicorn";

/** Evolution stage identifiers. */
export type EvolutionStage = "egg" | "baby" | "teen" | "adult" | "mythic";

/** Mood label derived from the numeric mood value. */
export type MoodLabel = "happy" | "neutral" | "sad";

/** A single accessory item the pet can equip. */
export interface Accessory {
  id: string; name: string; description: string; icon: string;
  rarity: "common" | "rare" | "epic" | "legendary"; unlockLevel: number;
}

/** A pet ability unlocked through levelling. */
export interface PetAbility {
  id: string; name: string; description: string; icon: string;
  unlockLevel: number; cooldownMs: number; effect: Record<string, unknown>;
}

/** Visual appearance configuration for a pet. */
export interface PetAppearance {
  primaryColor: string; secondaryColor: string; eyeStyle: string;
  accessory: string | null; trailEffect: string; particleColor: string;
}

/** Bond between a pet and a word category. */
export interface PetBond { category: string; level: number; affinity: number; }

/** Personality trait entry. */
export interface PersonalityTrait { trait: string; description: string; }

/** Full pet data persisted in localStorage. */
export interface PetData {
  name: string; type: PetType; level: number; xp: number;
  mood: number; hunger: number; energy: number;
  appearance: PetAppearance; evolution: EvolutionStage;
  equippedAccessory: string | null; bonds: PetBond[];
  personality: PersonalityTrait[]; adoptedAt: number;
  lastFedAt: number; lastPlayedAt: number; lastRestedAt: number;
  totalGamesPlayed: number; totalScoreContributed: number;
}

/** Aggregate stats across all owned pets. */
export interface PetAggregateStats {
  totalPets: number; averageLevel: number; highestLevel: number;
  totalXP: number; evolvedPets: number;
  happiestPet: string | null; mostPlayedPet: string | null;
}

/** Dashboard returned by getPetDashboard. */
export interface PetDashboard {
  activePet: PetData | null; ownedPets: PetData[];
  aggregateStats: PetAggregateStats; abilities: PetAbility[];
  availableAccessories: Accessory[];
  nextEvolution: { level: number; stage: EvolutionStage } | null;
}

/** Compact card for displaying a pet in a list. */
export interface PetCard {
  name: string; type: PetType; level: number; mood: number;
  hunger: number; energy: number; evolution: EvolutionStage;
  icon: string; moodEmoji: string;
}

/** Compact card for an ability. */
export interface AbilityCard {
  id: string; name: string; description: string; icon: string;
  unlockLevel: number; cooldownMs: number; unlocked: boolean;
  onCooldown: boolean; cooldownRemainingMs: number;
}

/** Grid item for the accessories UI. */
export interface AccessoryGridItem {
  id: string; name: string; icon: string;
  rarity: Accessory["rarity"]; unlockLevel: number;
  unlocked: boolean; equipped: boolean;
}

/** Preview for the next evolution stage. */
export interface EvolutionPreview {
  currentStage: EvolutionStage; nextStage: EvolutionStage | null;
  currentLevel: number; requiredLevel: number;
  progressPercent: number; bonusDescription: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_PREFIX = "ws_pet_";

const PET_TYPES: PetType[] = [
  "Dragon", "Phoenix", "Cat", "Owl", "Fox", "Turtle", "Rabbit", "Unicorn",
];

/** Level thresholds mapping to evolution stages. */
const EVOLUTION_THRESHOLDS: { level: number; stage: EvolutionStage }[] = [
  { level: 1, stage: "egg" }, { level: 5, stage: "baby" },
  { level: 10, stage: "teen" }, { level: 20, stage: "adult" },
  { level: 30, stage: "mythic" },
];

/** Base stats per pet type (mood, hunger, energy 0–100, plus icon). */
const PET_BASE_STATS: Record<PetType, { mood: number; hunger: number; energy: number; icon: string }> = {
  Dragon:  { mood: 70, hunger: 60, energy: 80, icon: "🐉" },
  Phoenix: { mood: 75, hunger: 55, energy: 90, icon: "🔥" },
  Cat:     { mood: 80, hunger: 70, energy: 65, icon: "🐱" },
  Owl:     { mood: 65, hunger: 50, energy: 60, icon: "🦉" },
  Fox:     { mood: 72, hunger: 65, energy: 75, icon: "🦊" },
  Turtle:  { mood: 60, hunger: 80, energy: 50, icon: "🐢" },
  Rabbit:  { mood: 85, hunger: 75, energy: 95, icon: "🐰" },
  Unicorn: { mood: 90, hunger: 45, energy: 70, icon: "🦄" },
};

/** XP required to advance from the given level to the next. */
function xpForLevel(level: number): number {
  return Math.floor(50 * Math.pow(level, 1.4));
}

/** Universal abilities available to all pet types, gated by level. */
const UNIVERSAL_ABILITIES: PetAbility[] = [
  { id: "score_boost", name: "Score Boost", description: "Grants a 25% score multiplier for 60 seconds.", icon: "⚡", unlockLevel: 2, cooldownMs: 120_000, effect: { multiplier: 1.25, durationMs: 60_000 } },
  { id: "word_shield", name: "Word Shield", description: "Protects from one collision or wrong-word penalty.", icon: "🛡️", unlockLevel: 4, cooldownMs: 180_000, effect: { charges: 1 } },
  { id: "xp_magnet", name: "XP Magnet", description: "Doubles XP earned from gameplay for 45 seconds.", icon: "🧲", unlockLevel: 7, cooldownMs: 240_000, effect: { multiplier: 2, durationMs: 45_000 } },
  { id: "time_freeze", name: "Time Freeze", description: "Pauses the game timer for 10 seconds.", icon: "⏸️", unlockLevel: 12, cooldownMs: 300_000, effect: { freezeDurationMs: 10_000 } },
  { id: "word_hint", name: "Word Hint", description: "Highlights the next letter on the grid for 15 seconds.", icon: "💡", unlockLevel: 15, cooldownMs: 200_000, effect: { highlightDurationMs: 15_000 } },
  { id: "lucky_charm", name: "Lucky Charm", description: "Guarantees at least one rare word appears on the grid.", icon: "🍀", unlockLevel: 20, cooldownMs: 360_000, effect: { rarity: "rare" } },
  { id: "mega_boost", name: "Mega Boost", description: "Activates all buffs simultaneously for 20 seconds.", icon: "🌟", unlockLevel: 25, cooldownMs: 600_000, effect: { multiplier: 2, durationMs: 20_000 } },
  { id: "legendary_roar", name: "Legendary Roar", description: "Clears all obstacles and grants triple XP for 30 seconds.", icon: "👑", unlockLevel: 30, cooldownMs: 900_000, effect: { clearObstacles: true, multiplier: 3, durationMs: 30_000 } },
];

/** Full catalogue of equippable accessories, sorted by rarity. */
const ALL_ACCESSORIES: Accessory[] = [
  { id: "tiny_hat", name: "Tiny Hat", description: "A fashionable top hat for distinguished pets.", icon: "🎩", rarity: "common", unlockLevel: 1 },
  { id: "bow_tie", name: "Bow Tie", description: "A classic red bow tie. Very dapper.", icon: "🎀", rarity: "common", unlockLevel: 1 },
  { id: "scarf", name: "Cozy Scarf", description: "Keeps your pet warm during winter sessions.", icon: "🧣", rarity: "common", unlockLevel: 2 },
  { id: "crown", name: "Golden Crown", description: "A shimmering crown that commands respect.", icon: "👑", rarity: "rare", unlockLevel: 5 },
  { id: "wings", name: "Fairy Wings", description: "Delicate wings that leave a sparkle trail.", icon: "🧚", rarity: "rare", unlockLevel: 8 },
  { id: "sunglasses", name: "Sunglasses", description: "Too cool for school.", icon: "😎", rarity: "rare", unlockLevel: 10 },
  { id: "magic_wand", name: "Magic Wand", description: "Channels arcane power for bonus effects.", icon: "🪄", rarity: "epic", unlockLevel: 15 },
  { id: "halo", name: "Celestial Halo", description: "An ethereal ring of light above the head.", icon: "😇", rarity: "epic", unlockLevel: 20 },
  { id: "dragon_armor", name: "Dragon Armor", description: "Impenetrable scales forged in dragonfire.", icon: "🛡️", rarity: "epic", unlockLevel: 25 },
  { id: "rainbow_mane", name: "Rainbow Mane", description: "A flowing mane of prismatic light.", icon: "🌈", rarity: "legendary", unlockLevel: 30 },
];

/** Default appearance applied to newly adopted pets. */
const DEFAULT_APPEARANCE: PetAppearance = {
  primaryColor: "#6C63FF", secondaryColor: "#FFD93D", eyeStyle: "round",
  accessory: null, trailEffect: "sparkle", particleColor: "#FFFFFF",
};

/** Pool of personality traits — two are randomly assigned on adoption. */
const PERSONALITY_POOL: PersonalityTrait[] = [
  { trait: "Curious", description: "Loves exploring new words." },
  { trait: "Brave", description: "Never backs down from a tough round." },
  { trait: "Lazy", description: "Prefers watching over participating." },
  { trait: "Energetic", description: "Always excited for the next game." },
  { trait: "Wise", description: "Offers helpful tips and motivation." },
  { trait: "Playful", description: "Tries to turn everything into a game." },
  { trait: "Loyal", description: "Stays by your side through every challenge." },
  { trait: "Shy", description: "Quietly cheers you on from the background." },
  { trait: "Mischievous", description: "Sometimes hides letters as a prank." },
  { trait: "Gentle", description: "Calms you down when things get hectic." },
  { trait: "Fierce", description: "Competes hard and plays to win." },
  { trait: "Dreamy", description: "Often lost in thought about rare words." },
];

/** Motivational / idle quotes the pet can say. */
const PET_QUOTES: string[] = [
  "You've got this! One word at a time! 💪",
  "I believe in you — let's find some amazing words today! ✨",
  "Remember: every expert was once a beginner. 📚",
  "Let's go on a word adventure together! 🗺️",
  "Take a deep breath… now let's slay that grid! 🐉",
  "My favourite word is 'serendipity'. What's yours? 💫",
  "Even dragons need a nap sometimes. 😴",
  "Score big, dream bigger! 🌟",
  "I just learned a new word — can you guess it? 🤔",
  "Together we're unstoppable! 🚀",
  "Don't forget to feed me later… just saying. 🍖",
  "You make every game feel like a victory! 🏆",
  "Shh… I'm concentrating on helping you find words. 🤫",
  "Let's set a new personal best today! 📈",
  "Hunger is kicking in… a snack would be nice. 🥕",
  "Words are magic, and so are you! ✨",
];

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Safely read and JSON-parse a `ws_pet_`-prefixed localStorage value. */
function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Safely JSON-stringify and write a value to `ws_pet_`-prefixed localStorage. */
function writeLS(key: string, value: unknown): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch { /* storage full or unavailable */ }
}

/** Pick two random personality traits from the pool. */
function generatePersonality(): PersonalityTrait[] {
  return [...PERSONALITY_POOL].sort(() => Math.random() - 0.5).slice(0, 2);
}

/** Derive evolution stage from a level value. */
function computeEvolution(level: number): EvolutionStage {
  let stage: EvolutionStage = "egg";
  for (const t of EVOLUTION_THRESHOLDS) {
    if (level >= t.level) stage = t.stage;
  }
  return stage;
}

/** Return the threshold entry for the next evolution, or null at max stage. */
function nextEvolutionThreshold(
  level: number,
): { level: number; stage: EvolutionStage } | null {
  for (const t of EVOLUTION_THRESHOLDS) {
    if (level < t.level) return t;
  }
  return null;
}

/** Clamp a numeric value between 0 and 100. */
function clamp01(v: number): number {
  return Math.max(0, Math.min(100, v));
}

/** Persist the pet back into the owned-pets array in localStorage. */
function savePet(pet: PetData): void {
  try {
    const pets = readLS<PetData[]>("owned_pets", []);
    const idx = pets.findIndex((p) => p.name === pet.name);
    if (idx !== -1) pets[idx] = pet;
    else pets.push(pet);
    writeLS("owned_pets", pets);
  } catch { /* silently fail */ }
}

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * 1. Returns the currently active pet, or `null` if no pet is selected.
 * Active pet name is stored under `ws_pet_active_name`.
 */
export function getPet(): PetData | null {
  try {
    const activeName = readLS<string | null>("active_name", null);
    if (!activeName) return null;
    const pets = getOwnedPets();
    return pets.find((p) => p.name === activeName) ?? null;
  } catch {
    return null;
  }
}

/**
 * 2. Returns the full catalogue of unlockable pet types with their base
 * stats and icons. This is a static lookup — it does not depend on owned pets.
 */
export function getAvailablePets(): {
  type: PetType; icon: string;
  baseMood: number; baseHunger: number; baseEnergy: number;
}[] {
  try {
    return PET_TYPES.map((type) => {
      const b = PET_BASE_STATS[type];
      return { type, icon: b.icon, baseMood: b.mood, baseHunger: b.hunger, baseEnergy: b.energy };
    });
  } catch {
    return PET_TYPES.map((t) => ({ type: t, icon: "?", baseMood: 50, baseHunger: 50, baseEnergy: 50 }));
  }
}

/**
 * 3. Adopt a new pet of the given `type` and `name`.
 * Starts at level 1 with the type's base stats and two random personality traits.
 * Returns the new `PetData`, or `null` if the name is taken or invalid.
 */
export function adoptPet(type: PetType, name: string): PetData | null {
  try {
    if (!name || name.trim().length === 0) return null;
    if (!PET_TYPES.includes(type)) return null;
    const pets = getOwnedPets();
    if (pets.some((p) => p.name === name)) return null;
    const base = PET_BASE_STATS[type];
    const newPet: PetData = {
      name: name.trim(), type, level: 1, xp: 0,
      mood: base.mood, hunger: base.hunger, energy: base.energy,
      appearance: { ...DEFAULT_APPEARANCE }, evolution: "egg",
      equippedAccessory: null, bonds: [], personality: generatePersonality(),
      adoptedAt: Date.now(), lastFedAt: Date.now(), lastPlayedAt: 0,
      lastRestedAt: 0, totalGamesPlayed: 0, totalScoreContributed: 0,
    };
    pets.push(newPet);
    writeLS("owned_pets", pets);
    if (!readLS<string | null>("active_name", null)) writeLS("active_name", newPet.name);
    return newPet;
  } catch {
    return null;
  }
}

/**
 * 4. Switch the active pet to the one identified by `name`.
 * Returns `true` if the switch was successful (pet must exist).
 */
export function switchPet(name: string): boolean {
  try {
    const pets = getOwnedPets();
    if (!pets.some((p) => p.name === name)) return false;
    writeLS("active_name", name);
    return true;
  } catch {
    return false;
  }
}

/**
 * 5. Release (permanently delete) a pet by name.
 * If the released pet was active, the next available pet becomes active.
 * Returns `true` if the release succeeded.
 */
export function releasePet(name: string): boolean {
  try {
    let pets = getOwnedPets();
    const idx = pets.findIndex((p) => p.name === name);
    if (idx === -1) return false;
    pets.splice(idx, 1);
    writeLS("owned_pets", pets);
    const currentActive = readLS<string | null>("active_name", null);
    if (currentActive === name) writeLS("active_name", pets.length > 0 ? pets[0].name : null);
    return true;
  } catch {
    return false;
  }
}

/** 6. Returns all owned pets as an array. Empty if nothing adopted yet. */
export function getOwnedPets(): PetData[] {
  try { return readLS<PetData[]>("owned_pets", []); } catch { return []; }
}

/**
 * 7. Feed the active pet. Increases hunger by 20 (capped at 100) and
 * slightly boosts mood (+5). Returns the updated pet or `null`.
 */
export function feedPet(): PetData | null {
  try {
    const pet = getPet();
    if (!pet) return null;
    pet.hunger = clamp01(pet.hunger + 20);
    pet.mood = clamp01(pet.mood + 5);
    pet.lastFedAt = Date.now();
    savePet(pet);
    return pet;
  } catch {
    return null;
  }
}

/**
 * 8. Play with the active pet. Increases mood by 25 but costs 10 energy
 * and 5 hunger. Returns the updated pet (unchanged if too tired).
 */
export function playWithPet(): PetData | null {
  try {
    const pet = getPet();
    if (!pet) return null;
    if (pet.energy < 10) return pet;
    pet.mood = clamp01(pet.mood + 25);
    pet.energy = clamp01(pet.energy - 10);
    pet.hunger = clamp01(pet.hunger - 5);
    pet.lastPlayedAt = Date.now();
    savePet(pet);
    return pet;
  } catch {
    return null;
  }
}

/**
 * 9. Rest the active pet. Increases energy by 30 (capped at 100).
 * Returns the updated pet or `null`.
 */
export function restPet(): PetData | null {
  try {
    const pet = getPet();
    if (!pet) return null;
    pet.energy = clamp01(pet.energy + 30);
    pet.lastRestedAt = Date.now();
    savePet(pet);
    return pet;
  } catch {
    return null;
  }
}

/** 10. Returns the current level of the active pet, or 0 if none active. */
export function getPetLevel(): number {
  try { return getPet()?.level ?? 0; } catch { return 0; }
}

/** 11. Returns the current XP of the active pet, or 0 if none active. */
export function getPetXP(): number {
  try { return getPet()?.xp ?? 0; } catch { return 0; }
}

/**
 * 12. Add XP to the active pet. Handles level-ups and evolution
 * recalculation automatically. Returns the updated pet, or `null`.
 * @param amount — Raw XP to add (e.g. 10% of the game score).
 */
export function addPetXP(amount: number): PetData | null {
  try {
    const pet = getPet();
    if (!pet || amount <= 0) return pet;
    pet.xp += amount;
    let needed = xpForLevel(pet.level + 1);
    while (pet.xp >= needed) {
      pet.xp -= needed;
      pet.level += 1;
      pet.mood = clamp01(pet.mood + 10);
      pet.energy = clamp01(pet.energy + 10);
      needed = xpForLevel(pet.level + 1);
    }
    pet.evolution = computeEvolution(pet.level);
    savePet(pet);
    return pet;
  } catch {
    return null;
  }
}

/**
 * 13. Returns aggregate statistics across all owned pets: total count,
 * average / highest level, total XP, evolved count, happiest and most-played.
 */
export function getPetStats(): PetAggregateStats {
  const empty: PetAggregateStats = {
    totalPets: 0, averageLevel: 0, highestLevel: 0, totalXP: 0,
    evolvedPets: 0, happiestPet: null, mostPlayedPet: null,
  };
  try {
    const pets = getOwnedPets();
    if (pets.length === 0) return empty;
    const totalLevel = pets.reduce((s, p) => s + p.level, 0);
    const totalXP = pets.reduce(
      (s, p) => s + p.xp + Array.from({ length: p.level }, (_, i) => xpForLevel(i + 1)).reduce((a, b) => a + b, 0), 0,
    );
    const evolved = pets.filter((p) => p.evolution !== "egg").length;
    const happiest = pets.reduce((best, p) => (p.mood > (best?.mood ?? -1) ? p : best));
    const mostPlayed = pets.reduce((best, p) => (p.totalGamesPlayed > (best?.totalGamesPlayed ?? -1) ? p : best));
    return {
      totalPets: pets.length,
      averageLevel: Math.round(totalLevel / pets.length),
      highestLevel: Math.max(...pets.map((p) => p.level)),
      totalXP, evolvedPets: evolved,
      happiestPet: happiest.name, mostPlayedPet: mostPlayed.name,
    };
  } catch {
    return empty;
  }
}

/** 14. Returns the current mood (0–100) of the active pet. */
export function getPetMood(): number {
  try { return getPet()?.mood ?? 0; } catch { return 0; }
}

/** 15. Returns the current hunger (0–100) of the active pet. */
export function getPetHunger(): number {
  try { return getPet()?.hunger ?? 0; } catch { return 0; }
}

/** 16. Returns the current energy (0–100) of the active pet. */
export function getPetEnergy(): number {
  try { return getPet()?.energy ?? 0; } catch { return 0; }
}

/**
 * 17. Returns the visual appearance configuration for the active pet.
 * Falls back to `DEFAULT_APPEARANCE` when no pet is active.
 */
export function getPetAppearance(): PetAppearance {
  try { return getPet()?.appearance ?? { ...DEFAULT_APPEARANCE }; } catch { return { ...DEFAULT_APPEARANCE }; }
}

/**
 * 18. Customise the active pet's appearance. Accepts a partial config —
 * any field not provided keeps its current value. Returns the updated appearance.
 */
export function setPetAppearance(config: Partial<PetAppearance>): PetAppearance {
  try {
    const pet = getPet();
    const base = pet?.appearance ?? { ...DEFAULT_APPEARANCE };
    const updated: PetAppearance = {
      primaryColor: config.primaryColor ?? base.primaryColor,
      secondaryColor: config.secondaryColor ?? base.secondaryColor,
      eyeStyle: config.eyeStyle ?? base.eyeStyle,
      accessory: config.accessory ?? base.accessory,
      trailEffect: config.trailEffect ?? base.trailEffect,
      particleColor: config.particleColor ?? base.particleColor,
    };
    if (pet) { pet.appearance = updated; savePet(pet); }
    return updated;
  } catch {
    return { ...DEFAULT_APPEARANCE };
  }
}

/** 19. Returns all accessories in the game catalogue (static list). */
export function getPetAccessories(): Accessory[] {
  try { return [...ALL_ACCESSORIES]; } catch { return []; }
}

/**
 * 20. Equip an accessory on the active pet by `id`.
 * Only succeeds if the pet's level meets the unlock requirement.
 * Returns `true` on success.
 */
export function equipAccessory(id: string): boolean {
  try {
    const pet = getPet();
    if (!pet) return false;
    const acc = ALL_ACCESSORIES.find((a) => a.id === id);
    if (!acc || pet.level < acc.unlockLevel) return false;
    pet.equippedAccessory = id;
    pet.appearance.accessory = id;
    savePet(pet);
    return true;
  } catch {
    return false;
  }
}

/**
 * 21. Returns abilities the active pet has unlocked (based on current level).
 */
export function getPetAbilities(): PetAbility[] {
  try {
    const level = getPet()?.level ?? 0;
    return UNIVERSAL_ABILITIES.filter((a) => a.unlockLevel <= level);
  } catch {
    return [];
  }
}

/**
 * 22. Activate a pet ability by `id`. Enforces cooldown tracking via localStorage.
 * Returns the ability's effect payload on success, or `null` on failure.
 */
export function usePetAbility(id: string): Record<string, unknown> | null {
  try {
    const pet = getPet();
    if (!pet) return null;
    const ability = UNIVERSAL_ABILITIES.find((a) => a.id === id);
    if (!ability || pet.level < ability.unlockLevel) return null;
    const cdKey = `ability_cd_${id}`;
    const lastUsed = readLS<number>(cdKey, 0);
    if (Date.now() - lastUsed < ability.cooldownMs) return null;
    writeLS(cdKey, Date.now());
    return ability.effect;
  } catch {
    return null;
  }
}

/** 23. Returns the current evolution stage of the active pet. */
export function getPetEvolution(): EvolutionStage {
  try { return getPet()?.evolution ?? "egg"; } catch { return "egg"; }
}

/**
 * 24. Checks whether the active pet can evolve to the next stage.
 * Returns `true` when the pet has not yet reached mythic.
 */
export function canEvolve(): boolean {
  try {
    const pet = getPet();
    if (!pet) return false;
    return nextEvolutionThreshold(pet.level) !== null;
  } catch {
    return false;
  }
}

/**
 * 25. Evolves the active pet to its next stage if the level threshold is met.
 * Grants +15 mood and +15 energy as an evolution bonus.
 * Returns the updated pet, or `null` if no pet / already maxed.
 */
export function evolvePet(): PetData | null {
  try {
    const pet = getPet();
    if (!pet) return null;
    const next = nextEvolutionThreshold(pet.level);
    if (!next) return pet;
    pet.evolution = next.stage;
    pet.mood = clamp01(pet.mood + 15);
    pet.energy = clamp01(pet.energy + 15);
    savePet(pet);
    return pet;
  } catch {
    return null;
  }
}

/**
 * 26. Returns all bonds between the active pet and word categories.
 * Each bond tracks `affinity` (0–100) and an integer `level` (0–4).
 */
export function getPetBonds(): PetBond[] {
  try { return getPet()?.bonds ?? []; } catch { return []; }
}

/**
 * 27. Increase the bond between the active pet and a word category.
 * Creates a new bond if one doesn't exist. Bond level increments every
 * 25 affinity points (max level 4). Returns the updated bond or `null`.
 */
export function addBond(category: string, amount: number): PetBond | null {
  try {
    const pet = getPet();
    if (!pet || amount <= 0) return null;
    let bond = pet.bonds.find((b) => b.category === category);
    if (!bond) { bond = { category, level: 0, affinity: 0 }; pet.bonds.push(bond); }
    bond.affinity = clamp01(bond.affinity + amount);
    bond.level = Math.floor(bond.affinity / 25);
    savePet(pet);
    return bond;
  } catch {
    return null;
  }
}

/** 28. Returns the generated personality traits for the active pet. */
export function getPetPersonality(): PersonalityTrait[] {
  try { return getPet()?.personality ?? []; } catch { return []; }
}

/**
 * 29. Returns a random motivational or idle quote from the pet.
 * Sad and hungry pets may return food-related dialogue.
 * Falls back to a generic message if no pet is active.
 */
export function getPetQuote(): string {
  try {
    const pet = getPet();
    if (!pet) return "Adopt a pet to hear what they have to say! 🐾";
    if (pet.mood < 30 && pet.hunger < 30) {
      const h = [
        "I'm so hungry… and sad. A snack would really help. 🥺",
        "My tummy is rumbling. Can we eat first? 🍖",
        "Low energy, low mood… I need a break. 😢",
      ];
      return h[Math.floor(Math.random() * h.length)];
    }
    if (pet.mood < 30) {
      const s = ["I'm feeling a bit down today. Play with me? 🥺", "Cheer me up — let's go find some words! 💧"];
      return s[Math.floor(Math.random() * s.length)];
    }
    return PET_QUOTES[Math.floor(Math.random() * PET_QUOTES.length)];
  } catch {
    return "Something went wrong, but I still believe in you! 💖";
  }
}

/**
 * 30. Returns an emoji for the active pet's current mood:
 * `😊` happy (≥60), `😐` neutral (30–59), `😢` sad (<30).
 */
export function getPetMoodIcon(): string {
  try {
    const m = getPetMood();
    if (m >= 60) return "😊";
    if (m >= 30) return "😐";
    return "😢";
  } catch {
    return "😐";
  }
}

/**
 * 31. Returns a comprehensive dashboard object with the active pet, all
 * owned pets, aggregate stats, unlocked abilities, accessories catalogue,
 * and next evolution target. Ideal for a full management UI.
 */
export function getPetDashboard(): PetDashboard {
  const empty: PetDashboard = {
    activePet: null, ownedPets: [],
    aggregateStats: { totalPets: 0, averageLevel: 0, highestLevel: 0, totalXP: 0, evolvedPets: 0, happiestPet: null, mostPlayedPet: null },
    abilities: [], availableAccessories: [], nextEvolution: null,
  };
  try {
    const activePet = getPet();
    const ownedPets = getOwnedPets();
    return {
      activePet, ownedPets, aggregateStats: getPetStats(),
      abilities: UNIVERSAL_ABILITIES.filter((a) => (activePet?.level ?? 0) >= a.unlockLevel),
      availableAccessories: ALL_ACCESSORIES,
      nextEvolution: activePet ? nextEvolutionThreshold(activePet.level) : null,
    };
  } catch {
    return empty;
  }
}

/**
 * 32. Returns a compact card for the active pet (name, type, level, stats,
 * icon, mood emoji). Useful for sidebar or header widgets. `null` if inactive.
 */
export function getPetCard(): PetCard | null {
  try {
    const pet = getPet();
    if (!pet) return null;
    const moodEmoji = pet.mood >= 60 ? "😊" : pet.mood < 30 ? "😢" : "😐";
    return {
      name: pet.name, type: pet.type, level: pet.level,
      mood: pet.mood, hunger: pet.hunger, energy: pet.energy,
      evolution: pet.evolution, icon: PET_BASE_STATS[pet.type]?.icon ?? "🐾", moodEmoji,
    };
  } catch {
    return null;
  }
}

/**
 * 33. Returns a compact card for a specific ability by `id`, including
 * unlock status and cooldown state. `null` if `id` is unrecognised.
 */
export function getAbilityCard(id: string): AbilityCard | null {
  try {
    const ability = UNIVERSAL_ABILITIES.find((a) => a.id === id);
    if (!ability) return null;
    const level = getPet()?.level ?? 0;
    const unlocked = level >= ability.unlockLevel;
    const lastUsed = readLS<number>(`ability_cd_${id}`, 0);
    const elapsed = Date.now() - lastUsed;
    const onCooldown = unlocked && elapsed < ability.cooldownMs;
    return {
      id: ability.id, name: ability.name, description: ability.description,
      icon: ability.icon, unlockLevel: ability.unlockLevel,
      cooldownMs: ability.cooldownMs, unlocked, onCooldown,
      cooldownRemainingMs: onCooldown ? ability.cooldownMs - elapsed : 0,
    };
  } catch {
    return null;
  }
}

/**
 * 34. Returns a grid-friendly list of all accessories annotated with
 * unlock and equip status relative to the active pet's level.
 */
export function getAccessoryGrid(): AccessoryGridItem[] {
  try {
    const pet = getPet();
    const level = pet?.level ?? 0;
    const equipped = pet?.equippedAccessory ?? null;
    return ALL_ACCESSORIES.map((a) => ({
      id: a.id, name: a.name, icon: a.icon, rarity: a.rarity,
      unlockLevel: a.unlockLevel, unlocked: level >= a.unlockLevel,
      equipped: equipped === a.id,
    }));
  } catch {
    return [];
  }
}

/**
 * 35. Returns a preview of the active pet's next evolution: current and
 * next stage, required level, progress %, and a bonus description.
 */
export function getEvolutionPreview(): EvolutionPreview {
  const fallback: EvolutionPreview = {
    currentStage: "egg", nextStage: "baby", currentLevel: 0,
    requiredLevel: 5, progressPercent: 0,
    bonusDescription: "Adopt a pet to begin your evolution journey!",
  };
  try {
    const pet = getPet();
    if (!pet) return fallback;
    const next = nextEvolutionThreshold(pet.level);
    if (!next) {
      return {
        currentStage: pet.evolution, nextStage: null,
        currentLevel: pet.level, requiredLevel: pet.level, progressPercent: 100,
        bonusDescription: "Your pet has reached its ultimate mythic form! 🌟",
      };
    }
    const curThresh = EVOLUTION_THRESHOLDS.find((t) => t.stage === pet.evolution)?.level ?? 1;
    const range = next.level - curThresh;
    const pct = range > 0 ? Math.round(((pet.level - curThresh) / range) * 100) : 100;
    const bonusMap: Record<EvolutionStage, string> = {
      baby: "Unlocks playful animations and a larger sprite.",
      teen: "Gains access to tier-2 abilities and trails.",
      adult: "Maximum ability power and a grand aura effect.",
      mythic: "Legendary status — all bonuses doubled, unique crown glow.",
      egg: "Your journey begins here!",
    };
    return {
      currentStage: pet.evolution, nextStage: next.stage,
      currentLevel: pet.level, requiredLevel: next.level,
      progressPercent: pct, bonusDescription: bonusMap[next.stage] ?? "Unknown bonus.",
    };
  } catch {
    return { ...fallback, bonusDescription: "Unable to load evolution data." };
  }
}
