// ═══════════════════════════════════════════════════════════════
// Tea Party Wire — Magical Tea Party Management for Word Snake
// SSR-safe · Seeded PRNG · React hooks · ~2000 lines
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useRef, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────

export interface TpBlend {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  brewTimeMs: number;
  baseScore: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  color: string;
  xpReward: number;
  coinReward: number;
  brewTemperature: number;
  brewPressure: number;
  flavorProfile: string[];
}

export interface TpRoom {
  id: string;
  name: string;
  description: string;
  ambiance: string;
  capacity: number;
  unlockLevel: number;
  scoreMultiplier: number;
  themeColor: string;
  backgroundDescription: string;
}

export interface TpIngredient {
  id: string;
  name: string;
  description: string;
  cost: number;
  potency: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  element: 'fire' | 'water' | 'earth' | 'air' | 'spirit';
  effect: string;
}

export interface TpGuest {
  id: string;
  name: string;
  title: string;
  species: string;
  personality: string;
  favoriteBlend: string;
  favoriteRoom: string;
  tipMultiplier: number;
  requiredLevel: number;
  greeting: string;
  farewell: string;
}

export interface TpTeaSet {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  baseBonus: number;
  upgradeCost: number;
  style: string;
  pieces: number;
}

export interface TpQuest {
  id: string;
  name: string;
  description: string;
  type: 'brew' | 'serve' | 'collect' | 'score' | 'ceremony';
  target: number;
  reward: { xp: number; coins: number };
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
}

export interface TpNpc {
  id: string;
  name: string;
  role: string;
  dialogue: string[];
  shopItems: string[];
  location: string;
}

export interface TpAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  reward: { xp: number; coins: number; title?: string };
  hidden: boolean;
}

export interface TpBrewingSession {
  blendId: string;
  startTime: number;
  duration: number;
  quality: number;
  ingredients: string[];
  completed: boolean;
  boosters: string[];
}

export interface TpGuestSatisfaction {
  guestId: string;
  blendId: string;
  roomId: string;
  score: number;
  tip: number;
  grade: string;
}

export interface TpCeremonyResult {
  score: number;
  grade: string;
  xpEarned: number;
  coinsEarned: number;
  critique: string;
  styleUsed: string;
  elementHarmony: number;
}

export interface TpDailyTask {
  id: string;
  description: string;
  progress: number;
  target: number;
  reward: { xp: number; coins: number };
  claimed: boolean;
  daySeed: number;
  category: string;
}

export interface TpBooster {
  id: string;
  name: string;
  description: string;
  effect: 'quality' | 'speed' | 'score' | 'xp' | 'coins';
  multiplier: number;
  durationMs: number;
  cost: number;
  icon: string;
}

export interface TpTeaPartyState {
  level: number;
  xp: number;
  coins: number;
  ownedIngredients: Record<string, number>;
  ownedBoosters: Record<string, number>;
  unlockedRooms: string[];
  currentRoom: string;
  currentTeaSet: string;
  teaSetLevels: Record<string, number>;
  brewingQueue: TpBrewingSession[];
  completedBrews: number;
  guestsServed: number;
  totalScore: number;
  ceremoniesPerformed: number;
  achievementsUnlocked: string[];
  questsAccepted: string[];
  questProgress: Record<string, number>;
  questsCompleted: string[];
  dailyTasks: TpDailyTask[];
  dailyLastSeed: number;
  blendMastery: Record<string, number>;
  guestFavorites: Record<string, number>;
  title: string;
  prngSeed: number;
  totalBrewCount: number;
  totalGuestsServed: number;
  legendaryBrewCount: number;
  perfectCeremonies: number;
  ingredientsDiscovered: string[];
  roomsVisited: string[];
  ceremonyHistory: TpCeremonyResult[];
  highestScore: number;
  totalCoinsEarned: number;
  totalXpEarned: number;
}

// ─── Seeded PRNG (Mulberry32) ────────────────────────────────

function mb32Seed(a: number): number {
  return a | 0;
}

function mb32Next(state: number): [number, number] {
  let t = (state += 0x6d2b79f5);
  t = ((t ^ (t >>> 15)) * t | 0);
  t = (t ^ (t >>> 7)) * t | 0;
  return [state, (t ^ (t >>> 15)) >>> 0];
}

function seededRandom(seed: number): () => number {
  let s = mb32Seed(seed);
  return () => {
    const [ns, v] = mb32Next(s);
    s = ns;
    return v / 4294967296;
  };
}

function pickSeeded<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffleSeeded<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ─── Constants ────────────────────────────────────────────────

export const TP_MAX_LEVEL = 45;

export const TP_TITLE_THRESHOLDS: Array<{ level: number; title: string }> = [
  { level: 1, title: 'Tea Novice' },
  { level: 6, title: 'Leaf Apprentice' },
  { level: 12, title: 'Steeping Scholar' },
  { level: 18, title: 'Ceremony Adept' },
  { level: 25, title: 'Potion Brewer' },
  { level: 31, title: 'Elder Pourer' },
  { level: 38, title: 'Mystic Sommelier' },
  { level: 44, title: 'Grand Tea Master' },
];

export const TP_BLENDS: TpBlend[] = [
  { id: 'dragon_well', name: 'Dragon Well', description: 'A legendary green tea that shimmers like dragon scales when poured.', ingredients: ['dragon_scale_mint', 'jade_leaf', 'spring_water_dew'], brewTimeMs: 30000, baseScore: 120, rarity: 'legendary', color: '#2dd4bf', xpReward: 50, coinReward: 30, brewTemperature: 80, brewPressure: 1.0, flavorProfile: ['umami', 'sweet', 'nutty'] },
  { id: 'phoenix_eye', name: 'Phoenix Eye', description: 'Rolling tea pearls that ignite the palate with warm spice.', ingredients: ['phoenix_feather_spice', 'cinnamon_bark_dust', 'ember_root'], brewTimeMs: 25000, baseScore: 110, rarity: 'rare', color: '#f97316', xpReward: 45, coinReward: 25, brewTemperature: 95, brewPressure: 1.2, flavorProfile: ['spicy', 'warm', 'smoky'] },
  { id: 'moonlight_white', name: 'Moonlight White', description: 'Silver-needle tea harvested under full moons by moonlit spirits.', ingredients: ['moon_bloom_silver', 'star_petal', 'frost_essence'], brewTimeMs: 35000, baseScore: 130, rarity: 'legendary', color: '#e2e8f0', xpReward: 55, coinReward: 35, brewTemperature: 70, brewPressure: 0.8, flavorProfile: ['delicate', 'floral', 'cool'] },
  { id: 'thunderbolt_oolong', name: 'Thunderbolt Oolong', description: 'Electrifying partial-oxidation tea that crackles on the tongue.', ingredients: ['storm_cloud_leaf', 'lightning_sugar', 'thunder_clap_ginger'], brewTimeMs: 20000, baseScore: 95, rarity: 'rare', color: '#a78bfa', xpReward: 40, coinReward: 20, brewTemperature: 88, brewPressure: 1.5, flavorProfile: ['electric', 'bold', 'fruity'] },
  { id: 'sunset_herb', name: 'Sunset Herb', description: 'A warm herbal blend that paints the cup in golden-amber hues.', ingredients: ['sunflower_crown', 'golden_honey_drop', 'amber_resin'], brewTimeMs: 15000, baseScore: 70, rarity: 'common', color: '#fbbf24', xpReward: 25, coinReward: 12, brewTemperature: 100, brewPressure: 1.0, flavorProfile: ['sweet', 'mellow', 'herbal'] },
  { id: 'midnight_rose', name: 'Midnight Rose', description: 'A dark, romantic infusion of enchanted rosebuds.', ingredients: ['shadow_rose_bud', 'nightshade_berry', 'velvet_moss'], brewTimeMs: 22000, baseScore: 90, rarity: 'rare', color: '#be185d', xpReward: 38, coinReward: 18, brewTemperature: 85, brewPressure: 0.9, flavorProfile: ['rich', 'floral', 'deep'] },
  { id: 'frost_mint_snow', name: 'Frost Mint Snow', description: 'An icy-fresh blend served chilled with crystallized mint.', ingredients: ['ice_crystal_mint', 'snowdrop_nectar', 'glacier_sprout'], brewTimeMs: 18000, baseScore: 80, rarity: 'uncommon', color: '#67e8f9', xpReward: 30, coinReward: 15, brewTemperature: 5, brewPressure: 0.5, flavorProfile: ['fresh', 'cool', 'crisp'] },
  { id: 'ancient_bark', name: 'Ancient Bark', description: 'Earthy tea brewed from thousand-year-old enchanted trees.', ingredients: ['elder_root_bark', 'ancient_moss', 'petrified_sap'], brewTimeMs: 40000, baseScore: 140, rarity: 'legendary', color: '#92400e', xpReward: 60, coinReward: 40, brewTemperature: 90, brewPressure: 2.0, flavorProfile: ['earthy', 'woody', 'ancient'] },
  { id: 'fairy_blossom', name: 'Fairy Blossom', description: 'A delicate floral tea that makes the drinker feel lighter than air.', ingredients: ['fairy_wing_petal', 'dewdrop_clover', 'prism_dust'], brewTimeMs: 12000, baseScore: 65, rarity: 'uncommon', color: '#f9a8d4', xpReward: 22, coinReward: 10, brewTemperature: 75, brewPressure: 0.7, flavorProfile: ['light', 'sweet', 'airy'] },
  { id: 'volcano_spice', name: 'Volcano Spice', description: 'A dangerously hot blend from the volcanic tea gardens.', ingredients: ['lava_pepper', 'magma_cinnamon', 'obsidian_salt'], brewTimeMs: 28000, baseScore: 105, rarity: 'rare', color: '#dc2626', xpReward: 42, coinReward: 22, brewTemperature: 110, brewPressure: 2.5, flavorProfile: ['hot', 'fiery', 'intense'] },
  { id: 'ocean_depth', name: 'Ocean Depth', description: 'Deep-sea kelp tea with briny mineral complexity.', ingredients: ['kelp_pearl', 'sea_foam_fizz', 'coral_calcite'], brewTimeMs: 32000, baseScore: 115, rarity: 'rare', color: '#0ea5e9', xpReward: 48, coinReward: 28, brewTemperature: 60, brewPressure: 3.0, flavorProfile: ['briny', 'mineral', 'deep'] },
  { id: 'star_dust_chamomile', name: 'Stardust Chamomile', description: 'Calming chamomile laced with genuine cosmic dust.', ingredients: ['star_petal', 'comet_chamomile', 'nebula_honey'], brewTimeMs: 16000, baseScore: 75, rarity: 'uncommon', color: '#c4b5fd', xpReward: 28, coinReward: 14, brewTemperature: 95, brewPressure: 1.0, flavorProfile: ['calm', 'floral', 'cosmic'] },
  { id: 'forest_spirit_green', name: 'Forest Spirit Green', description: 'Green tea whispered into existence by ancient forest guardians.', ingredients: ['old_growth_leaf', 'spore_bloom', 'driftwood_sage'], brewTimeMs: 24000, baseScore: 88, rarity: 'uncommon', color: '#4ade80', xpReward: 35, coinReward: 17, brewTemperature: 78, brewPressure: 1.1, flavorProfile: ['green', 'earthy', 'fresh'] },
  { id: 'crystal_cave_earl', name: 'Crystal Cave Earl Grey', description: 'Earl grey aged in crystalline caverns for a mineral zing.', ingredients: ['bergamot_crystal', 'quartz_leaf', 'cave_pearl_blossom'], brewTimeMs: 20000, baseScore: 85, rarity: 'uncommon', color: '#818cf8', xpReward: 32, coinReward: 16, brewTemperature: 92, brewPressure: 1.3, flavorProfile: ['citrus', 'mineral', 'bold'] },
  { id: 'dream_weaver', name: 'Dream Weaver', description: 'A tea that induces prophetic dreams when consumed at dusk.', ingredients: ['dream_catcher_leaf', 'sleep_petal', 'mist_extract'], brewTimeMs: 45000, baseScore: 150, rarity: 'legendary', color: '#7c3aed', xpReward: 65, coinReward: 45, brewTemperature: 65, brewPressure: 0.6, flavorProfile: ['ethereal', 'mystical', 'dreamy'] },
  { id: 'rainbow_hibiscus', name: 'Rainbow Hibiscus', description: 'Every sip changes color — a prism of tropical flavors.', ingredients: ['rainbow_honey', 'prism_hibiscus', 'aurora_nectar'], brewTimeMs: 19000, baseScore: 82, rarity: 'uncommon', color: '#ec4899', xpReward: 33, coinReward: 15, brewTemperature: 88, brewPressure: 1.0, flavorProfile: ['tropical', 'colorful', 'tangy'] },
  { id: 'shadow_pu_erh', name: 'Shadow Pu-erh', description: 'Aged dark tea with deep, mysterious earthy notes.', ingredients: ['shadow_root', 'dark_earth_fungus', 'cave_water_drop'], brewTimeMs: 50000, baseScore: 160, rarity: 'legendary', color: '#44403c', xpReward: 70, coinReward: 50, brewTemperature: 100, brewPressure: 2.0, flavorProfile: ['dark', 'earthy', 'aged'] },
  { id: 'cloud_whisper', name: 'Cloud Whisper', description: 'An impossibly light white tea that seems to float off the tongue.', ingredients: ['cloud_cotton_bud', 'whisper_willow_leaf', 'sky_sugar'], brewTimeMs: 14000, baseScore: 68, rarity: 'common', color: '#f0f9ff', xpReward: 24, coinReward: 11, brewTemperature: 72, brewPressure: 0.4, flavorProfile: ['light', 'airy', 'subtle'] },
  { id: 'dragon_fire_chai', name: 'Dragon Fire Chai', description: 'A blazing spiced chai that warms from the inside out.', ingredients: ['dragon_breath_clove', 'flame_nutmeg', 'charcoal_cardamom'], brewTimeMs: 27000, baseScore: 100, rarity: 'rare', color: '#ea580c', xpReward: 41, coinReward: 21, brewTemperature: 100, brewPressure: 1.8, flavorProfile: ['spicy', 'warm', 'bold'] },
  { id: 'mermaid_tears', name: 'Mermaid Tears', description: 'A briny-sweet oceanic tea with iridescent pearl flakes.', ingredients: ['mermaid_scale_dew', 'pearl_sugar', 'tide_petal'], brewTimeMs: 33000, baseScore: 118, rarity: 'rare', color: '#06b6d4', xpReward: 50, coinReward: 29, brewTemperature: 55, brewPressure: 2.8, flavorProfile: ['sweet', 'oceanic', 'pearlescent'] },
  { id: 'thorn_crown_black', name: 'Thorn Crown Black', description: 'Bold, astringent black tea with a crown of rose-thorn flavor.', ingredients: ['thorn_rose_leaf', 'iron_bark', 'crown_berry'], brewTimeMs: 26000, baseScore: 98, rarity: 'rare', color: '#1e293b', xpReward: 39, coinReward: 19, brewTemperature: 98, brewPressure: 1.6, flavorProfile: ['bold', 'astringent', 'floral'] },
  { id: 'pixie_meadow', name: 'Pixie Meadow', description: 'A playful, sweet meadow-blend favored by tiny folk.', ingredients: ['pixie_buttercup', 'meadow_foam', 'honey_suckle_dew'], brewTimeMs: 11000, baseScore: 55, rarity: 'common', color: '#a3e635', xpReward: 20, coinReward: 9, brewTemperature: 80, brewPressure: 0.6, flavorProfile: ['sweet', 'playful', 'light'] },
  { id: 'phoenix_tears_white', name: 'Phoenix Tears White', description: 'Resilient white tea that supposedly grants renewal.', ingredients: ['phoenix_ash_blossom', 'rebirth_silver_tip', 'fire_opal_sugar'], brewTimeMs: 38000, baseScore: 135, rarity: 'legendary', color: '#fcd34d', xpReward: 58, coinReward: 38, brewTemperature: 75, brewPressure: 0.9, flavorProfile: ['renewing', 'warm', 'radiant'] },
  { id: 'emerald_island_matcha', name: 'Emerald Island Matcha', description: 'Vibrant matcha from floating emerald islands.', ingredients: ['island_matcha_powder', 'jade_stone_sugar', 'bamboo_whisk_dust'], brewTimeMs: 21000, baseScore: 92, rarity: 'uncommon', color: '#10b981', xpReward: 36, coinReward: 18, brewTemperature: 68, brewPressure: 1.4, flavorProfile: ['vibrant', 'umami', 'grassy'] },
  { id: 'copper_kettle_assam', name: 'Copper Kettle Assam', description: 'Rich, malty Assam with a coppery sheen.', ingredients: ['assam_golden_tip', 'copper_kettle_mineral', 'caramel_root'], brewTimeMs: 23000, baseScore: 86, rarity: 'uncommon', color: '#d97706', xpReward: 34, coinReward: 16, brewTemperature: 96, brewPressure: 1.5, flavorProfile: ['malty', 'rich', 'copper'] },
  { id: 'wisteria_dream', name: 'Wisteria Dream', description: 'Intoxicatingly fragrant purple tea beneath wisteria vines.', ingredients: ['wisteria_blossom', 'violet_sugar', 'lilac_mist'], brewTimeMs: 17000, baseScore: 78, rarity: 'uncommon', color: '#c084fc', xpReward: 31, coinReward: 15, brewTemperature: 82, brewPressure: 0.8, flavorProfile: ['fragrant', 'purple', 'floral'] },
  { id: 'crimson_lotus', name: 'Crimson Lotus', description: 'A meditative red tea that blooms like a lotus in the cup.', ingredients: ['crimson_lotus_seed', 'lotus_petal_dust', 'tranquility_water'], brewTimeMs: 36000, baseScore: 128, rarity: 'legendary', color: '#e11d48', xpReward: 54, coinReward: 33, brewTemperature: 85, brewPressure: 1.0, flavorProfile: ['meditative', 'rich', 'blooming'] },
  { id: 'dwarven_rockbrew', name: 'Dwarven Rockbrew', description: 'A hearty, mineral-heavy tea favored in underground halls.', ingredients: ['granite_leaf', 'iron_mushroom', 'cave_moss_honey'], brewTimeMs: 29000, baseScore: 102, rarity: 'rare', color: '#78716c', xpReward: 43, coinReward: 23, brewTemperature: 105, brewPressure: 3.0, flavorProfile: ['hearty', 'mineral', 'strong'] },
  { id: 'elven_starlight', name: 'Elven Starlight', description: 'Translucent elven tea that glows faintly in the dark.', ingredients: ['starlight_dew', 'moonbeam_leaf', 'elf_silver_sugar'], brewTimeMs: 42000, baseScore: 145, rarity: 'legendary', color: '#bae6fd', xpReward: 62, coinReward: 42, brewTemperature: 62, brewPressure: 0.5, flavorProfile: ['luminous', 'delicate', 'ethereal'] },
  { id: 'potion_professor_blend', name: 'Potion Professor Blend', description: 'A mad-scientist tea that bubbles and changes flavor.', ingredients: ['bubbling_mushroom', 'alchemical_honey', 'potion_base_leaf'], brewTimeMs: 31000, baseScore: 108, rarity: 'rare', color: '#84cc16', xpReward: 44, coinReward: 24, brewTemperature: 77, brewPressure: 1.7, flavorProfile: ['bubbly', 'changing', 'experimental'] },
  { id: 'celestial_peach', name: 'Celestial Peach', description: 'Immortal peach tea from heavenly orchards.', ingredients: ['immortal_peach_blossom', 'heavenly_spring_water', 'cloud_cream'], brewTimeMs: 44000, baseScore: 148, rarity: 'legendary', color: '#fb923c', xpReward: 63, coinReward: 43, brewTemperature: 70, brewPressure: 0.7, flavorProfile: ['divine', 'peachy', 'immortal'] },
  { id: 'enchanted_garden_chamomile', name: 'Enchanted Garden Chamomile', description: 'Soothing chamomile from a garden that never wilts.', ingredients: ['eternal_chamomile', 'garden_fairy_dust', 'serenity_sprout'], brewTimeMs: 13000, baseScore: 60, rarity: 'common', color: '#fef3c7', xpReward: 21, coinReward: 10, brewTemperature: 90, brewPressure: 0.8, flavorProfile: ['soothing', 'gentle', 'eternal'] },
];

export const TP_ROOMS: TpRoom[] = [
  { id: 'zen_garden', name: 'Zen Garden', description: 'A tranquil rock garden with flowing water and bamboo.', ambiance: 'peaceful', capacity: 4, unlockLevel: 1, scoreMultiplier: 1.0, themeColor: '#6ee7b7', backgroundDescription: 'Raked sand patterns surround mossy stones beneath cherry blossoms.' },
  { id: 'crystal_pavilion', name: 'Crystal Pavilion', description: 'Giant crystals refract light into mesmerizing patterns.', ambiance: 'magical', capacity: 6, unlockLevel: 5, scoreMultiplier: 1.15, themeColor: '#c4b5fd', backgroundDescription: 'Prismatic light dances through towering amethyst and quartz formations.' },
  { id: 'moonlit_terrace', name: 'Moonlit Terrace', description: 'An open-air terrace bathed in eternal moonlight.', ambiance: 'romantic', capacity: 5, unlockLevel: 10, scoreMultiplier: 1.25, themeColor: '#bae6fd', backgroundDescription: 'Silver moonlight cascades over silk cushions and hanging lanterns.' },
  { id: 'ancient_treehouse', name: 'Ancient Treehouse', description: 'A sprawling treehouse within a thousand-year oak.', ambiance: 'cozy', capacity: 4, unlockLevel: 3, scoreMultiplier: 1.05, themeColor: '#a3e635', backgroundDescription: 'Warm firelight glows inside carved wooden chambers among the branches.' },
  { id: 'volcanic_hot_spring', name: 'Volcanic Hot Spring', description: 'Natural hot springs where tea steeps in geothermal warmth.', ambiance: 'energetic', capacity: 8, unlockLevel: 15, scoreMultiplier: 1.35, themeColor: '#f87171', backgroundDescription: 'Steam rises from obsidian-lined pools surrounded by fire ferns.' },
  { id: 'underwater_grotto', name: 'Underwater Grotto', description: 'A breath-taking coral grotto with bioluminescent tea cups.', ambiance: 'mysterious', capacity: 6, unlockLevel: 20, scoreMultiplier: 1.4, themeColor: '#22d3ee', backgroundDescription: 'Bioluminescent jellyfish illuminate coral arches and pearl-studded tables.' },
  { id: 'floating_cloud_palace', name: 'Floating Cloud Palace', description: 'A palace drifting among the clouds with infinite views.', ambiance: 'majestic', capacity: 10, unlockLevel: 30, scoreMultiplier: 1.6, themeColor: '#e0e7ff', backgroundDescription: 'Golden spires pierce cotton-candy clouds with panoramic sunset views.' },
  { id: 'dragon_lair_den', name: 'Dragon Lair Den', description: 'A warm den lined with gold and ancient dragon relics.', ambiance: 'legendary', capacity: 12, unlockLevel: 40, scoreMultiplier: 1.8, themeColor: '#fbbf24', backgroundDescription: 'Mountains of gold coins surround a central hearth of dragonfire.' },
];

export const TP_INGREDIENTS: TpIngredient[] = [
  { id: 'dragon_scale_mint', name: 'Dragon Scale Mint', description: 'Mint leaves with a shimmering dragon-scale pattern.', cost: 25, potency: 8, rarity: 'legendary', element: 'fire', effect: 'boosts_quality' },
  { id: 'jade_leaf', name: 'Jade Leaf', description: 'Emerald-green tea leaves from jade mountains.', cost: 10, potency: 4, rarity: 'uncommon', element: 'earth', effect: 'adds_earthiness' },
  { id: 'spring_water_dew', name: 'Spring Water Dew', description: 'Collected from the first spring dew of enchanted meadows.', cost: 5, potency: 3, rarity: 'common', element: 'water', effect: 'purifies_blend' },
  { id: 'phoenix_feather_spice', name: 'Phoenix Feather Spice', description: 'A warm, fiery spice made from shed phoenix feathers.', cost: 20, potency: 7, rarity: 'rare', element: 'fire', effect: 'adds_warmth' },
  { id: 'cinnamon_bark_dust', name: 'Cinnamon Bark Dust', description: 'Fine aromatic dust from enchanted cinnamon trees.', cost: 6, potency: 3, rarity: 'common', element: 'earth', effect: 'adds_spice' },
  { id: 'ember_root', name: 'Ember Root', description: 'A root that smolders gently, releasing warmth.', cost: 12, potency: 5, rarity: 'uncommon', element: 'fire', effect: 'sustains_heat' },
  { id: 'moon_bloom_silver', name: 'Moon Bloom Silver', description: 'Silver blossoms that only open during a full moon.', cost: 18, potency: 6, rarity: 'rare', element: 'spirit', effect: 'enhances_aroma' },
  { id: 'star_petal', name: 'Star Petal', description: 'Petals from flowers that grow on fallen stars.', cost: 30, potency: 9, rarity: 'legendary', element: 'air', effect: 'boosts_xp' },
  { id: 'frost_essence', name: 'Frost Essence', description: 'Liquid frost distilled from winter solstice ice.', cost: 15, potency: 5, rarity: 'uncommon', element: 'water', effect: 'cools_brew' },
  { id: 'storm_cloud_leaf', name: 'Storm Cloud Leaf', description: 'Leaves infused with the energy of thunderstorms.', cost: 14, potency: 5, rarity: 'uncommon', element: 'air', effect: 'adds_intensity' },
  { id: 'lightning_sugar', name: 'Lightning Sugar', description: 'Crystallized sugar crackling with static charge.', cost: 22, potency: 7, rarity: 'rare', element: 'air', effect: 'boosts_score' },
  { id: 'rainbow_honey', name: 'Rainbow Honey', description: 'Honey that shifts through every color of the spectrum.', cost: 35, potency: 10, rarity: 'legendary', element: 'spirit', effect: 'master_boost' },
  { id: 'golden_honey_drop', name: 'Golden Honey Drop', description: 'Pure, golden honey from magical bees.', cost: 8, potency: 4, rarity: 'common', element: 'earth', effect: 'sweetens_blend' },
  { id: 'sunflower_crown', name: 'Sunflower Crown', description: 'The crown petals of a giant enchanted sunflower.', cost: 7, potency: 3, rarity: 'common', element: 'fire', effect: 'adds_brightness' },
  { id: 'shadow_rose_bud', name: 'Shadow Rose Bud', description: 'A dark rose bud that absorbs surrounding light.', cost: 16, potency: 6, rarity: 'rare', element: 'spirit', effect: 'deepens_flavor' },
  { id: 'ice_crystal_mint', name: 'Ice Crystal Mint', description: 'Mint that grows in crystalline ice formations.', cost: 11, potency: 4, rarity: 'uncommon', element: 'water', effect: 'refreshes_palate' },
  { id: 'fairy_wing_petal', name: 'Fairy Wing Petal', description: 'Delicate petals that flutter even when still.', cost: 13, potency: 5, rarity: 'uncommon', element: 'air', effect: 'lightens_blend' },
  { id: 'lava_pepper', name: 'Lava Pepper', description: 'Peppercorns harvested from active volcano slopes.', cost: 17, potency: 6, rarity: 'rare', element: 'fire', effect: 'adds_heat' },
  { id: 'nebula_honey', name: 'Nebula Honey', description: 'Cosmic honey with swirling galactic flavors.', cost: 40, potency: 10, rarity: 'legendary', element: 'spirit', effect: 'cosmic_boost' },
  { id: 'dream_catcher_leaf', name: 'Dream Catcher Leaf', description: 'Leaves that capture and hold dream energy.', cost: 28, potency: 8, rarity: 'legendary', element: 'spirit', effect: 'enhances_dreams' },
];

export const TP_GUESTS: TpGuest[] = [
  { id: 'queen_seraphina', name: 'Queen Seraphina', title: 'Monarch of the Silver Realm', species: 'Human', personality: 'Elegant and discerning', favoriteBlend: 'moonlight_white', favoriteRoom: 'crystal_pavilion', tipMultiplier: 2.5, requiredLevel: 1, greeting: 'A tea party? How delightful. I expect only the finest.', farewell: 'A most pleasant afternoon. You shall be summoned again.' },
  { id: 'archmage_elara', name: 'Archmage Elara', title: 'Grand Wizard of the Eastern Tower', species: 'Human', personality: 'Wise and curious', favoriteBlend: 'dream_weaver', favoriteRoom: 'floating_cloud_palace', tipMultiplier: 2.8, requiredLevel: 5, greeting: 'I sense great potential in your brews, young host.', farewell: 'The arcane flavors were most illuminating. Farewell.' },
  { id: 'thornwick', name: 'Thornwick', title: 'Elder of the Ancient Forest', species: 'Tree Spirit', personality: 'Patient and contemplative', favoriteBlend: 'ancient_bark', favoriteRoom: 'ancient_treehouse', tipMultiplier: 2.2, requiredLevel: 3, greeting: 'The roots speak highly of your garden. Let us share tea.', farewell: 'May your leaves never wither, little one.' },
  { id: 'luna_moth', name: 'Luna Moth', title: 'Guardian of Moonlit Glades', species: 'Fairy', personality: 'Whimsical and gentle', favoriteBlend: 'fairy_blossom', favoriteRoom: 'moonlit_terrace', tipMultiplier: 2.0, requiredLevel: 2, greeting: 'Ooh! Is that tea I smell? How enchanting!', farewell: 'That was simply magical! Toodle-oo!' },
  { id: 'ignis_dragonheart', name: 'Ignis Dragonheart', title: 'Last of the Fire Drakes', species: 'Dragon', personality: 'Fierce but appreciative', favoriteBlend: 'dragon_fire_chai', favoriteRoom: 'volcanic_hot_spring', tipMultiplier: 3.0, requiredLevel: 10, greeting: 'Do not waste my time with weak brews, mortal.', farewell: 'Acceptable. Perhaps you are not entirely hopeless.' },
  { id: 'coraline', name: 'Coraline', title: 'Princess of the Deep', species: 'Mermaid', personality: 'Playful and musical', favoriteBlend: 'mermaid_tears', favoriteRoom: 'underwater_grotto', tipMultiplier: 2.4, requiredLevel: 8, greeting: 'The currents brought me here. What treasures do you brew?', farewell: 'Sing with the tides, dear host. Until we meet again!' },
  { id: 'bard_felwinter', name: 'Bard Felwinter', title: 'The Eternal Troubadour', species: 'Human', personality: 'Jovial and dramatic', favoriteBlend: 'crimson_lotus', favoriteRoom: 'moonlit_terrace', tipMultiplier: 2.1, requiredLevel: 4, greeting: 'A round of tea! I shall compose a ballad about this!', farewell: 'This shall inspire a hundred verses. Bravo!' },
  { id: 'glacia', name: 'Glacia', title: 'Frost Queen of the Northern Wastes', species: 'Ice Elemental', personality: 'Cool and refined', favoriteBlend: 'frost_mint_snow', favoriteRoom: 'crystal_pavilion', tipMultiplier: 2.6, requiredLevel: 12, greeting: 'Your establishment is... adequately chilled. Proceed.', farewell: 'A crisp performance. Do maintain the temperature.' },
  { id: 'tinker_gearspring', name: 'Tinker Gearspring', title: 'Master Artificer', species: 'Gnome', personality: 'Energetic and inventive', favoriteBlend: 'potion_professor_blend', favoriteRoom: 'ancient_treehouse', tipMultiplier: 2.0, requiredLevel: 6, greeting: 'Have you considered mechanizing your brewing process?', farewell: 'Fascinating! I have seventeen new ideas. Farewell!' },
  { id: 'sage_ironwood', name: 'Sage Ironwood', title: 'Dwarven Tea Scholar', species: 'Dwarf', personality: 'Blunt and appreciative', favoriteBlend: 'dwarven_rockbrew', favoriteRoom: 'dragon_lair_den', tipMultiplier: 2.3, requiredLevel: 15, greeting: 'Hmph. Let us see if your brews have any backbone.', farewell: 'Not bad, not bad at all. Solid craftsmanship.' },
  { id: 'zephyr', name: 'Zephyr', title: 'Lord of the Western Winds', species: 'Air Elemental', personality: 'Restless and curious', favoriteBlend: 'cloud_whisper', favoriteRoom: 'floating_cloud_palace', tipMultiplier: 2.5, requiredLevel: 18, greeting: 'I heard whispers of exceptional tea on the winds.', farewell: 'I shall carry tales of your brews across the skies!' },
  { id: 'lady_nightshade', name: 'Lady Nightshade', title: 'Mistress of the Twilight Court', species: 'Vampire', personality: 'Sophisticated and mysterious', favoriteBlend: 'midnight_rose', favoriteRoom: 'moonlit_terrace', tipMultiplier: 2.7, requiredLevel: 20, greeting: 'How intriguing... a tea party at this hour.', farewell: 'Your dark blends are most... agreeable. Good evening.' },
  { id: 'oota_bloomhollow', name: 'Oota Bloomhollow', title: 'Chief Druid of the Meadowlands', species: 'Halfling', personality: 'Warm and generous', favoriteBlend: 'enchanted_garden_chamomile', favoriteRoom: 'zen_garden', tipMultiplier: 1.8, requiredLevel: 2, greeting: 'What a lovely garden! May I sample your herbs?', farewell: 'Wonderful! Here, take these rare seeds as thanks!' },
  { id: 'general_thunderstrike', name: 'General Thunderstrike', title: 'Commander of the Storm Legion', species: 'Human', personality: 'Strict but fair', favoriteBlend: 'thunderbolt_oolong', favoriteRoom: 'volcanic_hot_spring', tipMultiplier: 2.4, requiredLevel: 25, greeting: 'I require a brew worthy of my legions. Do your best.', farewell: 'A disciplined pour. You have my respect, host.' },
  { id: 'aurelion', name: 'Aurelion', title: 'The Celestial Dragon', species: 'Celestial Dragon', personality: 'Ancient and serene', favoriteBlend: 'elven_starlight', favoriteRoom: 'floating_cloud_palace', tipMultiplier: 4.0, requiredLevel: 35, greeting: 'I have watched civilizations rise over cups of tea.', farewell: 'In a thousand years, I shall remember this brew.' },
];

export const TP_TEASETS: TpTeaSet[] = [
  { id: 'clay_start', name: 'Humble Clay Set', description: 'A simple but honest clay tea set for beginners.', level: 1, maxLevel: 5, baseBonus: 1.0, upgradeCost: 50, style: 'rustic', pieces: 4 },
  { id: 'porcelain_dream', name: 'Porcelain Dream', description: 'Delicate porcelain painted with dreaming clouds.', level: 1, maxLevel: 5, baseBonus: 1.05, upgradeCost: 120, style: 'elegant', pieces: 6 },
  { id: 'jade_imperial', name: 'Jade Imperial Set', description: 'An imperial set carved from a single jade boulder.', level: 1, maxLevel: 8, baseBonus: 1.12, upgradeCost: 250, style: 'regal', pieces: 8 },
  { id: 'crystal_cascade', name: 'Crystal Cascade', description: 'Tea set made from enchanted singing crystal.', level: 1, maxLevel: 8, baseBonus: 1.18, upgradeCost: 400, style: 'magical', pieces: 7 },
  { id: 'dragon_bone', name: 'Dragon Bone Service', description: 'Crafted from the shed bones of ancient dragons.', level: 1, maxLevel: 10, baseBonus: 1.25, upgradeCost: 600, style: 'legendary', pieces: 10 },
  { id: 'moonstone_silver', name: 'Moonstone & Silver', description: 'Silver filigree set with glowing moonstone inlays.', level: 1, maxLevel: 10, baseBonus: 1.3, upgradeCost: 800, style: 'ethereal', pieces: 9 },
  { id: 'phoenix_gilded', name: 'Phoenix Gilded Service', description: 'Gold-gilded phoenix-motif set that radiates warmth.', level: 1, maxLevel: 12, baseBonus: 1.4, upgradeCost: 1200, style: 'majestic', pieces: 12 },
  { id: 'cosmic_void', name: 'Cosmic Void Set', description: 'A tea set that contains a pocket of the cosmos.', level: 1, maxLevel: 15, baseBonus: 1.55, upgradeCost: 2000, style: 'transcendent', pieces: 14 },
];

export const TP_BOOSTERS: TpBooster[] = [
  { id: 'boost_quality_silver', name: 'Silver Quality Booster', description: 'Increases brew quality by 20%.', effect: 'quality', multiplier: 1.2, durationMs: 60000, cost: 15, icon: '🥈' },
  { id: 'boost_quality_gold', name: 'Gold Quality Booster', description: 'Increases brew quality by 40%.', effect: 'quality', multiplier: 1.4, durationMs: 60000, cost: 40, icon: '🥇' },
  { id: 'boost_speed_swift', name: 'Swift Brew Charm', description: 'Reduces brewing time by 30%.', effect: 'speed', multiplier: 0.7, durationMs: 60000, cost: 20, icon: '⚡' },
  { id: 'boost_score_star', name: 'Star Score Amulet', description: 'Increases ceremony score by 25%.', effect: 'score', multiplier: 1.25, durationMs: 60000, cost: 30, icon: '⭐' },
  { id: 'boost_xp_wisdom', name: 'Wisdom Tea Infusion', description: 'Earn 35% more XP from all activities.', effect: 'xp', multiplier: 1.35, durationMs: 120000, cost: 50, icon: '📚' },
  { id: 'boost_coins_fortune', name: 'Fortune Cookie Crumble', description: 'Earn 50% more coins from guest tips.', effect: 'coins', multiplier: 1.5, durationMs: 60000, cost: 45, icon: '💰' },
];

export const TP_QUESTS: TpQuest[] = [
  { id: 'q_brew_3', name: 'First Brews', description: 'Brew 3 cups of tea.', type: 'brew', target: 3, reward: { xp: 30, coins: 20 }, difficulty: 'easy' },
  { id: 'q_serve_5', name: 'Welcome Guests', description: 'Serve 5 guests.', type: 'serve', target: 5, reward: { xp: 50, coins: 35 }, difficulty: 'easy' },
  { id: 'q_brew_legendary', name: 'Legendary Brew', description: 'Brew a legendary-grade tea.', type: 'brew', target: 1, reward: { xp: 80, coins: 50 }, difficulty: 'hard' },
  { id: 'q_score_500', name: 'High Scorer', description: 'Earn a total score of 500.', type: 'score', target: 500, reward: { xp: 60, coins: 40 }, difficulty: 'medium' },
  { id: 'q_ceremony_3', name: 'Ceremony Master', description: 'Perform 3 tea ceremonies.', type: 'ceremony', target: 3, reward: { xp: 100, coins: 60 }, difficulty: 'medium' },
  { id: 'q_collect_10', name: 'Ingredient Hoarder', description: 'Collect 10 different ingredients.', type: 'collect', target: 10, reward: { xp: 70, coins: 45 }, difficulty: 'medium' },
  { id: 'q_serve_queen', name: 'Royal Service', description: 'Serve Queen Seraphina.', type: 'serve', target: 1, reward: { xp: 120, coins: 80 }, difficulty: 'hard' },
  { id: 'q_brew_20', name: 'Tea Factory', description: 'Brew 20 cups of tea.', type: 'brew', target: 20, reward: { xp: 150, coins: 100 }, difficulty: 'hard' },
  { id: 'q_perfect_ceremony', name: 'Perfect Pour', description: 'Achieve a perfect ceremony score.', type: 'ceremony', target: 1, reward: { xp: 200, coins: 150 }, difficulty: 'legendary' },
  { id: 'q_all_rooms', name: 'World Traveler', description: 'Visit every tea room.', type: 'ceremony', target: 8, reward: { xp: 250, coins: 200 }, difficulty: 'legendary' },
];

export const TP_NPCS: TpNpc[] = [
  { id: 'npc_tea_merchant', name: 'Milo the Merchant', role: 'Ingredient Vendor', dialogue: ['Fresh ingredients from the enchanted valleys!', 'Today\'s special: Star Petals at a discount!', 'I just received a shipment of Dream Catcher Leaves!'], shopItems: ['star_petal', 'rainbow_honey', 'nebula_honey', 'dream_catcher_leaf', 'dragon_scale_mint'], location: 'zen_garden' },
  { id: 'npc_set_collector', name: 'Duchess Porcelain', role: 'Tea Set Curator', dialogue: ['Each tea set tells a story.', 'I have a new set from the Eastern Kingdoms.', 'The Cosmic Void set is my crown jewel.'], shopItems: [], location: 'crystal_pavilion' },
  { id: 'npc_brew_master', name: 'Master Oolong', role: 'Brewing Instructor', dialogue: ['The secret is patience.', 'Watch the color — it tells you everything.', 'Temperature control separates masters from amateurs.'], shopItems: [], location: 'ancient_treehouse' },
  { id: 'npc_quest_giver', name: 'Herald Windwhisper', role: 'Quest Board Keeper', dialogue: ['Adventurers seek tea-related challenges here.', 'A new quest has appeared on the board!', 'Complete quests for generous rewards.'], shopItems: [], location: 'zen_garden' },
];

export const TP_ACHIEVEMENTS: TpAchievement[] = [
  { id: 'ach_first_brew', name: 'First Steep', description: 'Brew your very first cup of tea.', icon: '🍵', condition: 'totalBrewCount >= 1', reward: { xp: 10, coins: 5 }, hidden: false },
  { id: 'ach_brew_10', name: 'Brewing Apprentice', description: 'Brew 10 cups of tea.', icon: '🫖', condition: 'totalBrewCount >= 10', reward: { xp: 30, coins: 20 }, hidden: false },
  { id: 'ach_brew_100', name: 'Tea Virtuoso', description: 'Brew 100 cups of tea.', icon: '🏆', condition: 'totalBrewCount >= 100', reward: { xp: 200, coins: 150, title: 'Tea Virtuoso' }, hidden: false },
  { id: 'ach_serve_1', name: 'First Guest', description: 'Serve your first guest.', icon: '👑', condition: 'totalGuestsServed >= 1', reward: { xp: 15, coins: 10 }, hidden: false },
  { id: 'ach_serve_25', name: 'Gracious Host', description: 'Serve 25 guests.', icon: '🏰', condition: 'totalGuestsServed >= 25', reward: { xp: 100, coins: 80 }, hidden: false },
  { id: 'ach_legendary_brew', name: 'Legend Brewer', description: 'Brew a legendary-rarity tea.', icon: '✨', condition: 'legendaryBrewCount >= 1', reward: { xp: 50, coins: 40 }, hidden: false },
  { id: 'ach_perfect_ceremony', name: 'Flawless Ceremony', description: 'Achieve a perfect tea ceremony score.', icon: '💎', condition: 'perfectCeremonies >= 1', reward: { xp: 150, coins: 100, title: 'Perfect Pourer' }, hidden: false },
  { id: 'ach_5_perfect', name: 'Five-Star Host', description: 'Perform 5 perfect ceremonies.', icon: '🌟', condition: 'perfectCeremonies >= 5', reward: { xp: 300, coins: 200 }, hidden: true },
  { id: 'ach_level_10', name: 'Rising Star', description: 'Reach level 10.', icon: '📈', condition: 'level >= 10', reward: { xp: 50, coins: 30 }, hidden: false },
  { id: 'ach_level_25', name: 'Master Rank', description: 'Reach level 25.', icon: '🎖️', condition: 'level >= 25', reward: { xp: 150, coins: 100 }, hidden: false },
  { id: 'ach_level_45', name: 'Grand Master', description: 'Reach the maximum level.', icon: '👑', condition: 'level >= 45', reward: { xp: 500, coins: 500, title: 'Supreme Master' }, hidden: true },
  { id: 'ach_all_ingredients', name: 'Alchemist\'s Pantry', description: 'Own at least 1 of every ingredient.', icon: '🧪', condition: 'ingredientsDiscovered.length >= 20', reward: { xp: 200, coins: 150 }, hidden: true },
  { id: 'ach_all_rooms', name: 'Globe Trotter', description: 'Unlock every tea room.', icon: '🌍', condition: 'roomsVisited.length >= 8', reward: { xp: 250, coins: 200 }, hidden: false },
  { id: 'ach_rich_host', name: 'Wealthy Host', description: 'Accumulate 5000 coins.', icon: '💰', condition: 'coins >= 5000', reward: { xp: 100, coins: 0 }, hidden: false },
  { id: 'ach_secret_blend', name: 'Secret Blend', description: 'Achieve max mastery on any blend.', icon: '🔮', condition: 'blendMasteryMax >= 10', reward: { xp: 180, coins: 120, title: 'Blend Master' }, hidden: true },
];

export const TP_CEREMONY_STYLES = [
  'traditional', 'minimalist', 'elaborate', 'meditative', 'theatrical', 'whispering', 'dragon_style', 'fairy_ring',
] as const;

export const TP_SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;

// ─── Grade Reference Table ───────────────────────────────────
// Ceremony grades from D (poor) to S (transcendent).
// Grades affect XP/coin multipliers, achievement triggers,
// and guest satisfaction ratings across all tea rooms.

export const TP_GRADE_THRESHOLDS: Record<string, { min: number; color: string; label: string; description: string }> = {
  S: { min: 250, color: '#fbbf24', label: 'Transcendent', description: 'A cup so perfect it transcends mortal understanding. The guest is forever changed.' },
  A: { min: 180, color: '#a78bfa', label: 'Exceptional', description: 'Near-perfect harmony of flavors, aroma, and presentation. A memorable experience.' },
  B: { min: 120, color: '#60a5fa', label: 'Commendable', description: 'A well-crafted brew with pleasing balance. Room for minor improvements.' },
  C: { min: 80, color: '#34d399', label: 'Acceptable', description: 'The tea meets basic expectations. Nothing remarkable, but nothing offensive.' },
  D: { min: 0, color: '#9ca3af', label: 'Needs Work', description: 'The brew falls short. Perhaps wrong temperature, poor ingredient quality, or rushed pour.' },
};

// ─── Rarity Configuration ────────────────────────────────────
// Each rarity tier determines cost scaling, score bonuses,
// and visual treatment in the tea party interface.

export const TP_RARITY_CONFIG: Record<string, { color: string; bgColor: string; label: string; scoreMultiplier: number; coinMultiplier: number }> = {
  common: { color: '#9ca3af', bgColor: '#f3f4f6', label: 'Common', scoreMultiplier: 1.0, coinMultiplier: 1.0 },
  uncommon: { color: '#22c55e', bgColor: '#f0fdf4', label: 'Uncommon', scoreMultiplier: 1.15, coinMultiplier: 1.1 },
  rare: { color: '#3b82f6', bgColor: '#eff6ff', label: 'Rare', scoreMultiplier: 1.35, coinMultiplier: 1.25 },
  legendary: { color: '#f59e0b', bgColor: '#fffbeb', label: 'Legendary', scoreMultiplier: 1.6, coinMultiplier: 1.5 },
};

// ─── Element Interaction Matrix ──────────────────────────────
// Defines how elemental ingredients interact when combined.
// Synergies boost quality; conflicts reduce it.

export const TP_ELEMENT_SYNERGIES: Array<{ elements: [string, string]; bonus: number; name: string }> = [
  { elements: ['fire', 'water'], bonus: 1.3, name: 'Steam Infusion' },
  { elements: ['fire', 'air'], bonus: 1.2, name: 'Blazing Gale' },
  { elements: ['earth', 'water'], bonus: 1.25, name: 'Living Moss' },
  { elements: ['air', 'spirit'], bonus: 1.35, name: 'Ethereal Whisper' },
  { elements: ['fire', 'spirit'], bonus: 1.4, name: 'Phoenix Blessing' },
  { elements: ['earth', 'spirit'], bonus: 1.2, name: 'Ancient Growth' },
  { elements: ['water', 'spirit'], bonus: 1.3, name: 'Moonlit Spring' },
  { elements: ['earth', 'air'], bonus: 1.15, name: 'Pollen Drift' },
];

// ─── Tea Party Tips (seeded rotation) ───────────────────────
// Helpful hints shown to the player, rotated daily.

export const TP_TIPS: string[] = [
  'Match a guest\'s favorite blend for a 30% score bonus!',
  'Serving in the guest\'s preferred room adds a 20% room bonus.',
  'Legendary teas require rare ingredients but yield massive rewards.',
  'Upgrade your tea set early — the bonus compounds with mastery.',
  'Higher mastery on a blend improves ceremony scores consistently.',
  'The Dragon Lair Den has the highest score multiplier at 1.8x.',
  'Use boosters wisely on legendary brews for maximum effect.',
  'Quests refresh daily — check the board for bonus rewards.',
  'Element synergies can dramatically boost your brew quality.',
  'Guests tip more when served their absolute favorite blend.',
  'The Fairy Ring ceremony style pairs best with delicate blends.',
  'Seasonal bonuses change quarterly — adapt your strategy.',
  'Ceremony history tracks your last 50 performances.',
  'Perfect ceremonies (S-grade) unlock special achievements.',
  'Aurelion the Celestial Dragon offers the highest tip multiplier at 4.0x!',
];

// ─── Brewing Temperature Guide ───────────────────────────────
// Optimal temperature ranges for different tea categories.

export const TP_TEMP_GUIDE: Array<{ category: string; min: number; max: number; ideal: number; tip: string }> = [
  { category: 'White Tea', min: 60, max: 80, ideal: 72, tip: 'Delicate leaves require gentle heat to preserve subtle flavors.' },
  { category: 'Green Tea', min: 70, max: 85, ideal: 78, tip: 'Too hot and green tea becomes bitter. Patience is key.' },
  { category: 'Oolong Tea', min: 80, max: 95, ideal: 88, tip: 'Oolong benefits from a range — experiment for complexity.' },
  { category: 'Black Tea', min: 90, max: 100, ideal: 96, tip: 'Near-boiling water extracts the full body of black teas.' },
  { category: 'Herbal Infusion', min: 95, max: 110, ideal: 100, tip: 'Herbs need sustained heat to release their essential oils.' },
  { category: 'Legendary Blend', min: 55, max: 110, ideal: 80, tip: 'Legendary teas have unique requirements — follow the recipe!' },
];

// ─── Default State ────────────────────────────────────────────

const INITIAL_SEED = 42;

function createDefaultState(seed: number = INITIAL_SEED): TpTeaPartyState {
  return {
    level: 1,
    xp: 0,
    coins: 100,
    ownedIngredients: { spring_water_dew: 3, cinnamon_bark_dust: 2, golden_honey_drop: 2 },
    ownedBoosters: { boost_quality_silver: 1, boost_speed_swift: 1 },
    unlockedRooms: ['zen_garden'],
    currentRoom: 'zen_garden',
    currentTeaSet: 'clay_start',
    teaSetLevels: {},
    brewingQueue: [],
    completedBrews: 0,
    guestsServed: 0,
    totalScore: 0,
    ceremoniesPerformed: 0,
    achievementsUnlocked: [],
    questsAccepted: [],
    questProgress: {},
    questsCompleted: [],
    dailyTasks: [],
    dailyLastSeed: 0,
    blendMastery: {},
    guestFavorites: {},
    title: 'Tea Novice',
    prngSeed: seed,
    totalBrewCount: 0,
    totalGuestsServed: 0,
    legendaryBrewCount: 0,
    perfectCeremonies: 0,
    ingredientsDiscovered: ['spring_water_dew', 'cinnamon_bark_dust', 'golden_honey_drop'],
    roomsVisited: ['zen_garden'],
    ceremonyHistory: [],
    highestScore: 0,
    totalCoinsEarned: 100,
    totalXpEarned: 0,
  };
}

// ─── XP Table ─────────────────────────────────────────────────

function xpForLevel(level: number): number {
  if (level >= TP_MAX_LEVEL) return Infinity;
  return Math.floor(80 * Math.pow(level, 1.35) + 50 * level);
}

function getTitleForLevel(level: number): string {
  let title = 'Tea Novice';
  for (const t of TP_TITLE_THRESHOLDS) {
    if (level >= t.level) title = t.title;
  }
  return title;
}

// ─── Ceremony Scoring ─────────────────────────────────────────

function computeCeremonyScore(
  blend: TpBlend,
  guest: TpGuest,
  room: TpRoom,
  teaSet: TpTeaSet,
  teaSetLevel: number,
  blendMastery: number,
  styleIndex: number,
  brewQuality: number,
): TpCeremonyResult {
  const matchBonus = blend.id === guest.favoriteBlend ? 1.3 : 1.0;
  const roomBonus = guest.favoriteRoom === room.id ? 1.2 : 1.0;
  const setBonus = teaSet.baseBonus + teaSetLevel * 0.02;
  const masteryBonus = 1 + blendMastery * 0.03;
  const styleBonus = 1 + styleIndex * 0.02;
  const qualityMult = 0.5 + brewQuality * 0.5;

  const rawScore = blend.baseScore * matchBonus * roomBonus * setBonus * masteryBonus * styleBonus * qualityMult * room.scoreMultiplier;
  const score = Math.floor(rawScore);

  let grade: string;
  if (score >= 250) grade = 'S';
  else if (score >= 180) grade = 'A';
  else if (score >= 120) grade = 'B';
  else if (score >= 80) grade = 'C';
  else grade = 'D';

  const xpEarned = Math.floor(score * 0.5) + blend.xpReward;
  const coinsEarned = Math.floor(score * guest.tipMultiplier * 0.3) + blend.coinReward;

  const critiques: Record<string, string[]> = {
    S: ['A transcendent experience! The guest was moved to tears of joy.', 'Absolutely divine — worthy of the Tea Gods themselves.'],
    A: ['An exceptional brew that delighted all senses harmoniously.', 'The guest was thoroughly impressed and will spread your fame.'],
    B: ['A solid and satisfying tea experience with room to grow.', 'The guest enjoyed their time and left with a smile.'],
    C: ['Acceptable, but the brew lacked harmony and finesse.', 'The guest was polite but left wanting more complexity.'],
    D: ['The brew lacked harmony. The guest was visibly disappointed.', 'A disappointing pour — the guest quietly slipped away.'],
  };

  const rng = seededRandom(score * 7 + 13);
  const critique = pickSeeded(critiques[grade], rng);
  const styleUsed = TP_CEREMONY_STYLES[styleIndex] ?? TP_CEREMONY_STYLES[0];

  const elementMap: Record<string, number> = { S: 10, A: 8, B: 6, C: 4, D: 2 };
  const elementHarmony = elementMap[grade] ?? 2;

  return { score, grade, xpEarned, coinsEarned, critique, styleUsed, elementHarmony };
}

// ─── Achievement Checking ─────────────────────────────────────

function evaluateCondition(cond: string, state: TpTeaPartyState): boolean {
  const maxMastery = Object.values(state.blendMastery).reduce((a, b) => Math.max(a, b), 0);
  const checks: Record<string, () => boolean> = {
    'totalBrewCount >= 1': () => state.totalBrewCount >= 1,
    'totalBrewCount >= 10': () => state.totalBrewCount >= 10,
    'totalBrewCount >= 100': () => state.totalBrewCount >= 100,
    'totalGuestsServed >= 1': () => state.totalGuestsServed >= 1,
    'totalGuestsServed >= 25': () => state.totalGuestsServed >= 25,
    'legendaryBrewCount >= 1': () => state.legendaryBrewCount >= 1,
    'perfectCeremonies >= 1': () => state.perfectCeremonies >= 1,
    'perfectCeremonies >= 5': () => state.perfectCeremonies >= 5,
    'level >= 10': () => state.level >= 10,
    'level >= 25': () => state.level >= 25,
    'level >= 45': () => state.level >= 45,
    'ingredientsDiscovered.length >= 20': () => state.ingredientsDiscovered.length >= 20,
    'roomsVisited.length >= 8': () => state.roomsVisited.length >= 8,
    'coins >= 5000': () => state.coins >= 5000,
    'blendMasteryMax >= 10': () => maxMastery >= 10,
  };
  return checks[cond]?.() ?? false;
}

// ─── Daily Tasks Generator ────────────────────────────────────

function generateDailyTasks(seed: number): TpDailyTask[] {
  const rng = seededRandom(seed);
  const templates: Array<{ desc: string; type: string; target: number; xp: number; coins: number; category: string }> = [
    { desc: 'Brew {n} cups of any tea', type: 'brew', target: 3, xp: 20, coins: 15, category: 'brewing' },
    { desc: 'Serve {n} guests today', type: 'serve', target: 2, xp: 25, coins: 20, category: 'hosting' },
    { desc: 'Perform {n} tea ceremonies', type: 'ceremony', target: 1, xp: 30, coins: 25, category: 'ceremony' },
    { desc: 'Earn {n} total score points', type: 'score', target: 200, xp: 35, coins: 20, category: 'scoring' },
    { desc: 'Brew {n} rare or legendary teas', type: 'brew_rare', target: 1, xp: 40, coins: 30, category: 'brewing' },
    { desc: 'Buy {n} ingredients from the shop', type: 'collect', target: 2, xp: 15, coins: 10, category: 'collecting' },
    { desc: 'Upgrade a tea set once', type: 'upgrade', target: 1, xp: 25, coins: 15, category: 'upgrading' },
    { desc: 'Visit a different tea room', type: 'explore', target: 1, xp: 20, coins: 12, category: 'exploration' },
  ];

  const shuffled = shuffleSeeded(templates, rng);
  return shuffled.slice(0, 3).map((t, i) => ({
    id: `daily_${seed}_${i}`,
    description: t.desc.replace('{n}', String(t.target)),
    progress: 0,
    target: t.target,
    reward: { xp: t.xp, coins: t.coins },
    claimed: false,
    daySeed: seed,
    category: t.category,
  }));
}

// ─── Hook ─────────────────────────────────────────────────────

export function useTeaParty(initialSeed: number = INITIAL_SEED) {
  const [state, setState] = useState<TpTeaPartyState>(() => createDefaultState(initialSeed));
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const update = useCallback((fn: (prev: TpTeaPartyState) => TpTeaPartyState) => {
    setState(prev => {
      const next = fn(prev);
      const newTitle = getTitleForLevel(next.level);
      if (newTitle !== next.title) {
        next.title = newTitle;
      }
      return next;
    });
  }, []);

  // ── Achievement checker (declared early for forward refs) ──

  const tpCheckAchievements = useCallback((): string[] => {
    const newlyUnlocked: string[] = [];
    update(prev => {
      const unlocked = [...prev.achievementsUnlocked];
      for (const ach of TP_ACHIEVEMENTS) {
        if (unlocked.includes(ach.id)) continue;
        if (evaluateCondition(ach.condition, prev)) {
          unlocked.push(ach.id);
          newlyUnlocked.push(ach.id);
        }
      }
      return { ...prev, achievementsUnlocked: unlocked };
    });
    return newlyUnlocked;
  }, [update]);

  // ── Core State ──────────────────────────────────────────────

  const tpGetState = useCallback((): TpTeaPartyState => stateRef.current, []);

  const tpResetState = useCallback((seed?: number) => {
    setState(createDefaultState(seed ?? INITIAL_SEED));
  }, []);

  const tpGetLevel = useCallback((): number => stateRef.current.level, []);

  const tpGetTitle = useCallback((): string => stateRef.current.title, []);

  const tpGetProgress = useCallback((): { current: number; needed: number; percent: number } => {
    const s = stateRef.current;
    const needed = xpForLevel(s.level);
    return { current: s.xp, needed, percent: needed === Infinity ? 100 : Math.min(100, (s.xp / needed) * 100) };
  }, []);

  const tpAddXP = useCallback((amount: number) => {
    update(prev => {
      let { level, xp } = prev;
      const earnedXP = amount;
      xp += earnedXP;
      while (level < TP_MAX_LEVEL && xp >= xpForLevel(level)) {
        xp -= xpForLevel(level);
        level += 1;
      }
      if (level >= TP_MAX_LEVEL) xp = 0;
      return { ...prev, level, xp, totalXpEarned: prev.totalXpEarned + earnedXP };
    });
  }, [update]);

  const tpGetCoins = useCallback((): number => stateRef.current.coins, []);

  const tpAddCoins = useCallback((amount: number) => {
    update(prev => ({ ...prev, coins: prev.coins + amount, totalCoinsEarned: prev.totalCoinsEarned + amount }));
  }, [update]);

  const tpSpendCoins = useCallback((amount: number): boolean => {
    let success = false;
    update(prev => {
      if (prev.coins < amount) return prev;
      success = true;
      return { ...prev, coins: prev.coins - amount };
    });
    return success;
  }, [update]);

  // ── Blends ──────────────────────────────────────────────────

  const tpGetBlends = useCallback((filter?: { rarity?: TpBlend['rarity'] }): TpBlend[] => {
    if (!filter?.rarity) return TP_BLENDS;
    return TP_BLENDS.filter(b => b.rarity === filter.rarity);
  }, []);

  const tpGetBlendById = useCallback((id: string): TpBlend | undefined => {
    return TP_BLENDS.find(b => b.id === id);
  }, []);

  const tpGetBlendMastery = useCallback((blendId: string): number => {
    return stateRef.current.blendMastery[blendId] ?? 0;
  }, []);

  const tpGetBlendRarity = useCallback((blendId: string): string => {
    return TP_BLENDS.find(b => b.id === blendId)?.rarity ?? 'common';
  }, []);

  const tpGetBlendColor = useCallback((blendId: string): string => {
    return TP_BLENDS.find(b => b.id === blendId)?.color ?? '#888888';
  }, []);

  const tpCanBrew = useCallback((blendId: string): { canBrew: boolean; missing: string[] } => {
    const blend = TP_BLENDS.find(b => b.id === blendId);
    if (!blend) return { canBrew: false, missing: ['Unknown blend'] };
    const owned = stateRef.current.ownedIngredients;
    const missing: string[] = [];
    for (const ingId of blend.ingredients) {
      if ((owned[ingId] ?? 0) < 1) {
        missing.push(ingId);
      }
    }
    return { canBrew: missing.length === 0, missing };
  }, []);

  const tpBrew = useCallback((blendId: string): TpBrewingSession | null => {
    let result: TpBrewingSession | null = null;
    update(prev => {
      const blend = TP_BLENDS.find(b => b.id === blendId);
      if (!blend) return prev;
      const owned = { ...prev.ownedIngredients };
      for (const ingId of blend.ingredients) {
        if ((owned[ingId] ?? 0) < 1) return prev;
      }
      for (const ingId of blend.ingredients) {
        owned[ingId] = (owned[ingId] ?? 0) - 1;
        if (owned[ingId] <= 0) delete owned[ingId];
      }
      const now = Date.now();
      const session: TpBrewingSession = {
        blendId,
        startTime: now,
        duration: blend.brewTimeMs,
        quality: 0.5 + seededRandom(now + prev.prngSeed)() * 0.5,
        ingredients: [...blend.ingredients],
        completed: false,
        boosters: [],
      };
      result = session;
      return {
        ...prev,
        ownedIngredients: owned,
        brewingQueue: [...prev.brewingQueue, session],
      };
    });
    return result;
  }, [update]);

  const tpBrewWithBooster = useCallback((blendId: string, boosterId: string): TpBrewingSession | null => {
    let result: TpBrewingSession | null = null;
    update(prev => {
      const blend = TP_BLENDS.find(b => b.id === blendId);
      const booster = TP_BOOSTERS.find(bp => bp.id === boosterId);
      if (!blend || !booster) return prev;
      const ownedIng = { ...prev.ownedIngredients };
      for (const ingId of blend.ingredients) {
        if ((ownedIng[ingId] ?? 0) < 1) return prev;
      }
      const ownedBst = { ...prev.ownedBoosters };
      if ((ownedBst[boosterId] ?? 0) < 1) return prev;
      for (const ingId of blend.ingredients) {
        ownedIng[ingId] = (ownedIng[ingId] ?? 0) - 1;
        if (ownedIng[ingId] <= 0) delete ownedIng[ingId];
      }
      ownedBst[boosterId] = (ownedBst[boosterId] ?? 0) - 1;
      if (ownedBst[boosterId] <= 0) delete ownedBst[boosterId];
      const now = Date.now();
      let duration = blend.brewTimeMs;
      if (booster.effect === 'speed') duration = Math.floor(duration * booster.multiplier);
      const session: TpBrewingSession = {
        blendId,
        startTime: now,
        duration,
        quality: booster.effect === 'quality'
          ? Math.min(1, (0.5 + seededRandom(now + prev.prngSeed)() * 0.5) * booster.multiplier)
          : 0.5 + seededRandom(now + prev.prngSeed)() * 0.5,
        ingredients: [...blend.ingredients],
        completed: false,
        boosters: [boosterId],
      };
      result = session;
      return { ...prev, ownedIngredients: ownedIng, ownedBoosters: ownedBst, brewingQueue: [...prev.brewingQueue, session] };
    });
    return result;
  }, [update]);

  const tpCollectBrew = useCallback((index: number): { blend: TpBlend; quality: number; xp: number; coins: number } | null => {
    let collected: { blend: TpBlend; quality: number; xp: number; coins: number } | null = null;
    update(prev => {
      const session = prev.brewingQueue[index];
      if (!session || session.completed) return prev;
      const blend = TP_BLENDS.find(b => b.id === session.blendId);
      if (!blend) return prev;
      const mastery = (prev.blendMastery[blend.id] ?? 0) + 1;
      const isLegendary = blend.rarity === 'legendary';
      const newQueue = [...prev.brewingQueue];
      newQueue[index] = { ...session, completed: true };
      let xpReward = blend.xpReward;
      let coinReward = blend.coinReward;
      for (const bId of session.boosters) {
        const booster = TP_BOOSTERS.find(b => b.id === bId);
        if (booster) {
          if (booster.effect === 'xp') xpReward = Math.floor(xpReward * booster.multiplier);
          if (booster.effect === 'coins') coinReward = Math.floor(coinReward * booster.multiplier);
        }
      }
      collected = { blend, quality: session.quality, xp: xpReward, coins: coinReward };
      return {
        ...prev,
        brewingQueue: newQueue,
        completedBrews: prev.completedBrews + 1,
        totalBrewCount: prev.totalBrewCount + 1,
        legendaryBrewCount: prev.legendaryBrewCount + (isLegendary ? 1 : 0),
        blendMastery: { ...prev.blendMastery, [blend.id]: mastery },
        xp: prev.xp + xpReward,
        coins: prev.coins + coinReward,
        totalXpEarned: prev.totalXpEarned + xpReward,
        totalCoinsEarned: prev.totalCoinsEarned + coinReward,
        level: prev.level,
        questProgress: {
          ...prev.questProgress,
          q_brew_3: (prev.questProgress['q_brew_3'] ?? 0) + 1,
          q_brew_20: (prev.questProgress['q_brew_20'] ?? 0) + 1,
          q_brew_legendary: isLegendary ? (prev.questProgress['q_brew_legendary'] ?? 0) + 1 : (prev.questProgress['q_brew_legendary'] ?? 0),
          q_collect_10: prev.ingredientsDiscovered.length >= 10 ? prev.questProgress['q_collect_10'] ?? 10 : (prev.questProgress['q_collect_10'] ?? 0),
        },
      };
    });
    if (collected) {
      setTimeout(() => tpCheckAchievements(), 0);
    }
    return collected;
  }, [update, tpCheckAchievements]);

  const tpGetBrewingQueue = useCallback((): TpBrewingSession[] => stateRef.current.brewingQueue, []);

  const tpIsBrewReady = useCallback((index: number): boolean => {
    const session = stateRef.current.brewingQueue[index];
    if (!session) return false;
    return Date.now() - session.startTime >= session.duration;
  }, []);

  const tpGetBrewProgress = useCallback((index: number): number => {
    const session = stateRef.current.brewingQueue[index];
    if (!session) return 0;
    return Math.min(1, (Date.now() - session.startTime) / session.duration);
  }, []);

  const tpGetBrewTimeRemaining = useCallback((index: number): number => {
    const session = stateRef.current.brewingQueue[index];
    if (!session) return 0;
    return Math.max(0, session.duration - (Date.now() - session.startTime));
  }, []);

  const tpCancelBrew = useCallback((index: number): boolean => {
    let success = false;
    update(prev => {
      const session = prev.brewingQueue[index];
      if (!session || session.completed) return prev;
      const owned = { ...prev.ownedIngredients };
      for (const ingId of session.ingredients) {
        owned[ingId] = (owned[ingId] ?? 0) + 1;
      }
      const ownedBst = { ...prev.ownedBoosters };
      for (const bId of session.boosters) {
        ownedBst[bId] = (ownedBst[bId] ?? 0) + 1;
      }
      const newQueue = prev.brewingQueue.filter((_, i) => i !== index);
      success = true;
      return { ...prev, ownedIngredients: owned, ownedBoosters: ownedBst, brewingQueue: newQueue };
    });
    return success;
  }, [update]);

  const tpBrewMultiple = useCallback((blendIds: string[]): TpBrewingSession[] => {
    const results: TpBrewingSession[] = [];
    update(prev => {
      const owned = { ...prev.ownedIngredients };
      const newQueue = [...prev.brewingQueue];
      const now = Date.now();
      let seed = prev.prngSeed;
      for (const blendId of blendIds) {
        const blend = TP_BLENDS.find(b => b.id === blendId);
        if (!blend) continue;
        let canBrew = true;
        for (const ingId of blend.ingredients) {
          if ((owned[ingId] ?? 0) < 1) { canBrew = false; break; }
        }
        if (!canBrew) continue;
        for (const ingId of blend.ingredients) {
          owned[ingId] = (owned[ingId] ?? 0) - 1;
          if (owned[ingId] <= 0) delete owned[ingId];
        }
        seed += 77;
        const session: TpBrewingSession = {
          blendId,
          startTime: now + newQueue.length * 500,
          duration: blend.brewTimeMs,
          quality: 0.5 + seededRandom(now + seed)() * 0.5,
          ingredients: [...blend.ingredients],
          completed: false,
          boosters: [],
        };
        newQueue.push(session);
        results.push(session);
      }
      return { ...prev, ownedIngredients: owned, brewingQueue: newQueue, prngSeed: seed };
    });
    return results;
  }, [update]);

  const tpQuickBrew = useCallback((blendId: string): { blend: TpBlend; quality: number } | null => {
    const blend = TP_BLENDS.find(b => b.id === blendId);
    if (!blend || blend.rarity === 'legendary') return null;
    const check = tpCanBrew(blendId);
    if (!check.canBrew) return null;
    const rng = seededRandom(Date.now() + stateRef.current.prngSeed);
    const quality = 0.6 + rng() * 0.4;
    update(prev => {
      const owned = { ...prev.ownedIngredients };
      for (const ingId of blend.ingredients) {
        owned[ingId] = (owned[ingId] ?? 0) - 1;
        if (owned[ingId] <= 0) delete owned[ingId];
      }
      return {
        ...prev,
        ownedIngredients: owned,
        completedBrews: prev.completedBrews + 1,
        totalBrewCount: prev.totalBrewCount + 1,
        legendaryBrewCount: prev.legendaryBrewCount + (blend.rarity === 'legendary' ? 1 : 0),
        blendMastery: { ...prev.blendMastery, [blendId]: (prev.blendMastery[blendId] ?? 0) + 1 },
        xp: prev.xp + blend.xpReward,
        coins: prev.coins + blend.coinReward,
        totalXpEarned: prev.totalXpEarned + blend.xpReward,
        totalCoinsEarned: prev.totalCoinsEarned + blend.coinReward,
        questProgress: {
          ...prev.questProgress,
          q_brew_3: (prev.questProgress['q_brew_3'] ?? 0) + 1,
          q_brew_20: (prev.questProgress['q_brew_20'] ?? 0) + 1,
        },
      };
    });
    setTimeout(() => tpCheckAchievements(), 0);
    return { blend, quality };
  }, [update, tpCanBrew, tpCheckAchievements]);

  const tpGetRecommendedBlend = useCallback((): TpBlend | null => {
    const s = stateRef.current;
    const available = TP_BLENDS.filter(b => {
      for (const ingId of b.ingredients) {
        if ((s.ownedIngredients[ingId] ?? 0) < 1) return false;
      }
      return true;
    });
    if (available.length === 0) return null;
    const currentGuests = TP_GUESTS.filter(g => g.requiredLevel <= s.level);
    if (currentGuests.length > 0) {
      const guestFavBlends = currentGuests.map(g => g.favoriteBlend);
      for (const fav of guestFavBlends) {
        const found = available.find(b => b.id === fav);
        if (found) return found;
      }
    }
    const rng = seededRandom(s.prngSeed + Date.now());
    return pickSeeded(available, rng);
  }, []);

  const tpGetMissingIngredients = useCallback((blendId: string): TpIngredient[] => {
    const blend = TP_BLENDS.find(b => b.id === blendId);
    if (!blend) return [];
    const owned = stateRef.current.ownedIngredients;
    return blend.ingredients
      .filter(id => (owned[id] ?? 0) < 1)
      .map(id => TP_INGREDIENTS.find(i => i.id === id))
      .filter((i): i is TpIngredient => i !== undefined);
  }, []);

  const tpGetCollectedBlends = useCallback((): string[] => {
    return Object.keys(stateRef.current.blendMastery);
  }, []);

  const tpGetUncollectedBlends = useCallback((): TpBlend[] => {
    const collected = Object.keys(stateRef.current.blendMastery);
    return TP_BLENDS.filter(b => !collected.includes(b.id));
  }, []);

  const tpGetBrewPower = useCallback((blendId: string): number => {
    const blend = TP_BLENDS.find(b => b.id === blendId);
    if (!blend) return 0;
    const mastery = stateRef.current.blendMastery[blendId] ?? 0;
    const ingredientPower = blend.ingredients.reduce((sum, ingId) => {
      const ing = TP_INGREDIENTS.find(i => i.id === ingId);
      return sum + (ing?.potency ?? 0);
    }, 0);
    return Math.floor((blend.baseScore + ingredientPower * 2 + mastery * 5) * (1 + mastery * 0.02));
  }, []);

  // ── Rooms ───────────────────────────────────────────────────

  const tpGetRooms = useCallback((): TpRoom[] => TP_ROOMS, []);

  const tpGetRoomById = useCallback((id: string): TpRoom | undefined => TP_ROOMS.find(r => r.id === id), []);

  const tpGetCurrentRoom = useCallback((): TpRoom => {
    const current = stateRef.current.currentRoom;
    return TP_ROOMS.find(r => r.id === current) ?? TP_ROOMS[0];
  }, []);

  const tpSetRoom = useCallback((roomId: string): boolean => {
    const room = TP_ROOMS.find(r => r.id === roomId);
    if (!room) return false;
    update(prev => {
      if (prev.level < room.unlockLevel) return prev;
      const visited = prev.roomsVisited.includes(roomId) ? prev.roomsVisited : [...prev.roomsVisited, roomId];
      return { ...prev, currentRoom: roomId, unlockedRooms: prev.unlockedRooms.includes(roomId) ? prev.unlockedRooms : [...prev.unlockedRooms, roomId], roomsVisited: visited };
    });
    return true;
  }, [update]);

  const tpIsRoomUnlocked = useCallback((roomId: string): boolean => {
    return stateRef.current.unlockedRooms.includes(roomId);
  }, []);

  const tpGetRoomUnlockLevel = useCallback((roomId: string): number => {
    return TP_ROOMS.find(r => r.id === roomId)?.unlockLevel ?? 999;
  }, []);

  const tpGetRoomCapacity = useCallback((roomId: string): number => {
    return TP_ROOMS.find(r => r.id === roomId)?.capacity ?? 0;
  }, []);

  // ── Ingredients ─────────────────────────────────────────────

  const tpGetIngredients = useCallback((filter?: { element?: TpIngredient['element']; rarity?: TpIngredient['rarity'] }): TpIngredient[] => {
    let result = TP_INGREDIENTS;
    if (filter?.element) result = result.filter(i => i.element === filter.element);
    if (filter?.rarity) result = result.filter(i => i.rarity === filter.rarity);
    return result;
  }, []);

  const tpGetOwnedIngredients = useCallback((): Record<string, number> => stateRef.current.ownedIngredients, []);

  const tpGetIngredientCount = useCallback((id: string): number => stateRef.current.ownedIngredients[id] ?? 0, []);

  const tpBuyIngredient = useCallback((ingredientId: string, qty: number = 1): boolean => {
    const ingredient = TP_INGREDIENTS.find(i => i.id === ingredientId);
    if (!ingredient) return false;
    const totalCost = ingredient.cost * qty;
    let success = false;
    update(prev => {
      if (prev.coins < totalCost) return prev;
      success = true;
      const owned = { ...prev.ownedIngredients, [ingredientId]: (prev.ownedIngredients[ingredientId] ?? 0) + qty };
      const discovered = prev.ingredientsDiscovered.includes(ingredientId) ? prev.ingredientsDiscovered : [...prev.ingredientsDiscovered, ingredientId];
      return { ...prev, coins: prev.coins - totalCost, ownedIngredients: owned, ingredientsDiscovered: discovered };
    });
    return success;
  }, [update]);

  const tpUseIngredient = useCallback((ingredientId: string): boolean => {
    let success = false;
    update(prev => {
      const count = prev.ownedIngredients[ingredientId] ?? 0;
      if (count < 1) return prev;
      success = true;
      const owned = { ...prev.ownedIngredients, [ingredientId]: count - 1 };
      if (owned[ingredientId] <= 0) delete owned[ingredientId];
      return { ...prev, ownedIngredients: owned };
    });
    return success;
  }, [update]);

  const tpGetIngredientById = useCallback((id: string): TpIngredient | undefined => TP_INGREDIENTS.find(i => i.id === id), []);

  const tpGetIngredientsByElement = useCallback((element: TpIngredient['element']): TpIngredient[] => {
    return TP_INGREDIENTS.filter(i => i.element === element);
  }, []);

  const tpGetTotalIngredientValue = useCallback((): number => {
    const owned = stateRef.current.ownedIngredients;
    let total = 0;
    for (const [id, count] of Object.entries(owned)) {
      const ing = TP_INGREDIENTS.find(i => i.id === id);
      if (ing) total += ing.cost * count;
    }
    return total;
  }, []);

  const tpGetElementBalance = useCallback((): Record<string, number> => {
    const owned = stateRef.current.ownedIngredients;
    const balance: Record<string, number> = { fire: 0, water: 0, earth: 0, air: 0, spirit: 0 };
    for (const [id, count] of Object.entries(owned)) {
      const ing = TP_INGREDIENTS.find(i => i.id === id);
      if (ing) balance[ing.element] += count * ing.potency;
    }
    return balance;
  }, []);

  const tpGetTotalIngredientCount = useCallback((): number => {
    return Object.values(stateRef.current.ownedIngredients).reduce((a, b) => a + b, 0);
  }, []);

  // ── Boosters ────────────────────────────────────────────────

  const tpGetBoosters = useCallback((): TpBooster[] => TP_BOOSTERS, []);

  const tpGetBoosterById = useCallback((id: string): TpBooster | undefined => TP_BOOSTERS.find(b => b.id === id), []);

  const tpGetOwnedBoosters = useCallback((): Record<string, number> => stateRef.current.ownedBoosters, []);

  const tpBuyBooster = useCallback((boosterId: string): boolean => {
    const booster = TP_BOOSTERS.find(b => b.id === boosterId);
    if (!booster) return false;
    let success = false;
    update(prev => {
      if (prev.coins < booster.cost) return prev;
      success = true;
      return {
        ...prev,
        coins: prev.coins - booster.cost,
        ownedBoosters: { ...prev.ownedBoosters, [boosterId]: (prev.ownedBoosters[boosterId] ?? 0) + 1 },
      };
    });
    return success;
  }, [update]);

  const tpGetBoosterCount = useCallback((boosterId: string): number => stateRef.current.ownedBoosters[boosterId] ?? 0, []);

  // ── Guests ──────────────────────────────────────────────────

  const tpGetGuests = useCallback((filter?: { minLevel?: number }): TpGuest[] => {
    let result = TP_GUESTS;
    if (filter?.minLevel !== undefined) result = result.filter(g => g.requiredLevel <= filter.minLevel!);
    return result;
  }, []);

  const tpGetGuestById = useCallback((id: string): TpGuest | undefined => TP_GUESTS.find(g => g.id === id), []);

  const tpGetAvailableGuests = useCallback((): TpGuest[] => {
    return TP_GUESTS.filter(g => g.requiredLevel <= stateRef.current.level);
  }, []);

  const tpServeGuest = useCallback((guestId: string, blendId: string, roomId?: string): TpGuestSatisfaction | null => {
    let result: TpGuestSatisfaction | null = null;
    update(prev => {
      const guest = TP_GUESTS.find(g => g.id === guestId);
      const blend = TP_BLENDS.find(b => b.id === blendId);
      const room = TP_ROOMS.find(r => r.id === (roomId ?? prev.currentRoom));
      if (!guest || !blend || !room) return prev;
      if (guest.requiredLevel > prev.level) return prev;
      const teaSet = TP_TEASETS.find(ts => ts.id === prev.currentTeaSet) ?? TP_TEASETS[0];
      const teaSetLvl = prev.teaSetLevels[teaSet.id] ?? 1;
      const mastery = prev.blendMastery[blendId] ?? 0;
      const rng = seededRandom(Date.now() + prev.prngSeed);
      const styleIdx = Math.floor(rng() * TP_CEREMONY_STYLES.length);
      const ceremony = computeCeremonyScore(blend, guest, room, teaSet, teaSetLvl, mastery, styleIdx, 0.7 + rng() * 0.3);
      const sat: TpGuestSatisfaction = {
        guestId,
        blendId,
        roomId: room.id,
        score: ceremony.score,
        tip: ceremony.coinsEarned,
        grade: ceremony.grade,
      };
      result = sat;
      const newHistory = [...prev.ceremonyHistory, ceremony].slice(-50);
      return {
        ...prev,
        guestsServed: prev.guestsServed + 1,
        totalGuestsServed: prev.totalGuestsServed + 1,
        totalScore: prev.totalScore + ceremony.score,
        highestScore: Math.max(prev.highestScore, ceremony.score),
        ceremoniesPerformed: prev.ceremoniesPerformed + 1,
        perfectCeremonies: prev.perfectCeremonies + (ceremony.grade === 'S' ? 1 : 0),
        xp: prev.xp + ceremony.xpEarned,
        coins: prev.coins + ceremony.coinsEarned,
        totalXpEarned: prev.totalXpEarned + ceremony.xpEarned,
        totalCoinsEarned: prev.totalCoinsEarned + ceremony.coinsEarned,
        guestFavorites: { ...prev.guestFavorites, [guestId]: (prev.guestFavorites[guestId] ?? 0) + 1 },
        ceremonyHistory: newHistory,
        blendMastery: { ...prev.blendMastery, [blendId]: (prev.blendMastery[blendId] ?? 0) + 1 },
        totalBrewCount: prev.totalBrewCount + 1,
        legendaryBrewCount: prev.legendaryBrewCount + (blend.rarity === 'legendary' ? 1 : 0),
        questProgress: {
          ...prev.questProgress,
          q_serve_5: (prev.questProgress['q_serve_5'] ?? 0) + 1,
          q_serve_queen: guestId === 'queen_seraphina' ? (prev.questProgress['q_serve_queen'] ?? 0) + 1 : (prev.questProgress['q_serve_queen'] ?? 0),
          q_ceremony_3: (prev.questProgress['q_ceremony_3'] ?? 0) + 1,
          q_score_500: (prev.questProgress['q_score_500'] ?? 0) + ceremony.score,
          q_perfect_ceremony: ceremony.grade === 'S' ? (prev.questProgress['q_perfect_ceremony'] ?? 0) + 1 : (prev.questProgress['q_perfect_ceremony'] ?? 0),
          q_all_rooms: prev.roomsVisited.length,
        },
      };
    });
    if (result) {
      setTimeout(() => tpCheckAchievements(), 0);
    }
    return result;
  }, [update, tpCheckAchievements]);

  const tpGetGuestFavoriteCount = useCallback((guestId: string): number => stateRef.current.guestFavorites[guestId] ?? 0, []);

  const tpGetGuestGreeting = useCallback((guestId: string): string => {
    return TP_GUESTS.find(g => g.id === guestId)?.greeting ?? '...';
  }, []);

  const tpGetGuestFarewell = useCallback((guestId: string): string => {
    return TP_GUESTS.find(g => g.id === guestId)?.farewell ?? 'Farewell.';
  }, []);

  // ── Tea Sets ────────────────────────────────────────────────

  const tpGetTeaSets = useCallback((): TpTeaSet[] => TP_TEASETS, []);

  const tpGetTeaSetById = useCallback((id: string): TpTeaSet | undefined => TP_TEASETS.find(t => t.id === id), []);

  const tpGetCurrentTeaSet = useCallback((): TpTeaSet => {
    const current = stateRef.current.currentTeaSet;
    return TP_TEASETS.find(t => t.id === current) ?? TP_TEASETS[0];
  }, []);

  const tpSetTeaSet = useCallback((setId: string): boolean => {
    const set = TP_TEASETS.find(t => t.id === setId);
    if (!set) return false;
    update(prev => ({ ...prev, currentTeaSet: setId }));
    return true;
  }, [update]);

  const tpUpgradeSet = useCallback((setId: string): boolean => {
    let success = false;
    update(prev => {
      const teaSet = TP_TEASETS.find(t => t.id === setId);
      if (!teaSet) return prev;
      const currentLvl = prev.teaSetLevels[setId] ?? 1;
      if (currentLvl >= teaSet.maxLevel) return prev;
      const cost = Math.floor(teaSet.upgradeCost * Math.pow(1.5, currentLvl - 1));
      if (prev.coins < cost) return prev;
      success = true;
      return {
        ...prev,
        coins: prev.coins - cost,
        teaSetLevels: { ...prev.teaSetLevels, [setId]: currentLvl + 1 },
        questProgress: {
          ...prev.questProgress,
          q_collect_10: prev.questProgress['q_collect_10'] ?? 0,
        },
      };
    });
    return success;
  }, [update]);

  const tpGetTeaSetLevel = useCallback((setId: string): number => stateRef.current.teaSetLevels[setId] ?? 1, []);

  const tpGetTeaSetBonus = useCallback((setId: string): number => {
    const teaSet = TP_TEASETS.find(t => t.id === setId);
    if (!teaSet) return 1;
    const lvl = stateRef.current.teaSetLevels[setId] ?? 1;
    return teaSet.baseBonus + lvl * 0.02;
  }, []);

  const tpGetUpgradeCost = useCallback((setId: string): number => {
    const teaSet = TP_TEASETS.find(t => t.id === setId);
    if (!teaSet) return Infinity;
    const lvl = stateRef.current.teaSetLevels[setId] ?? 1;
    if (lvl >= teaSet.maxLevel) return Infinity;
    return Math.floor(teaSet.upgradeCost * Math.pow(1.5, lvl - 1));
  }, []);

  const tpIsTeaSetMaxed = useCallback((setId: string): boolean => {
    const teaSet = TP_TEASETS.find(t => t.id === setId);
    if (!teaSet) return true;
    const lvl = stateRef.current.teaSetLevels[setId] ?? 1;
    return lvl >= teaSet.maxLevel;
  }, []);

  // ── Quests ──────────────────────────────────────────────────

  const tpGetQuests = useCallback((): TpQuest[] => TP_QUESTS, []);

  const tpAcceptQuest = useCallback((questId: string): boolean => {
    const quest = TP_QUESTS.find(q => q.id === questId);
    if (!quest) return false;
    let success = false;
    update(prev => {
      if (prev.questsAccepted.includes(questId) || prev.questsCompleted.includes(questId)) return prev;
      success = true;
      return {
        ...prev,
        questsAccepted: [...prev.questsAccepted, questId],
        questProgress: { ...prev.questProgress, [questId]: 0 },
      };
    });
    return success;
  }, [update]);

  const tpGetQuestProgress = useCallback((questId: string): number => stateRef.current.questProgress[questId] ?? 0, []);

  const tpGetQuestStatus = useCallback((questId: string): 'not_accepted' | 'in_progress' | 'completable' | 'completed' => {
    const s = stateRef.current;
    if (s.questsCompleted.includes(questId)) return 'completed';
    if (!s.questsAccepted.includes(questId)) return 'not_accepted';
    const quest = TP_QUESTS.find(q => q.id === questId);
    if (!quest) return 'not_accepted';
    const progress = s.questProgress[questId] ?? 0;
    return progress >= quest.target ? 'completable' : 'in_progress';
  }, []);

  const tpCompleteQuest = useCallback((questId: string): { xp: number; coins: number } | null => {
    let reward: { xp: number; coins: number } | null = null;
    update(prev => {
      const quest = TP_QUESTS.find(q => q.id === questId);
      if (!quest) return prev;
      if (!prev.questsAccepted.includes(questId) || prev.questsCompleted.includes(questId)) return prev;
      const progress = prev.questProgress[questId] ?? 0;
      if (progress < quest.target) return prev;
      reward = quest.reward;
      return {
        ...prev,
        questsCompleted: [...prev.questsCompleted, questId],
        xp: prev.xp + quest.reward.xp,
        coins: prev.coins + quest.reward.coins,
        totalXpEarned: prev.totalXpEarned + quest.reward.xp,
        totalCoinsEarned: prev.totalCoinsEarned + quest.reward.coins,
      };
    });
    if (reward) {
      setTimeout(() => tpCheckAchievements(), 0);
    }
    return reward;
  }, [update, tpCheckAchievements]);

  const tpGetAcceptedQuests = useCallback((): string[] => {
    return stateRef.current.questsAccepted.filter(id => !stateRef.current.questsCompleted.includes(id));
  }, []);

  const tpGetCompletedQuests = useCallback((): string[] => stateRef.current.questsCompleted, []);

  const tpGetQuestById = useCallback((id: string): TpQuest | undefined => TP_QUESTS.find(q => q.id === id), []);

  // ── Achievements ────────────────────────────────────────────

  const tpGetAchievements = useCallback((filter?: { unlocked?: boolean }): TpAchievement[] => {
    if (filter?.unlocked === true) return TP_ACHIEVEMENTS.filter(a => stateRef.current.achievementsUnlocked.includes(a.id));
    if (filter?.unlocked === false) return TP_ACHIEVEMENTS.filter(a => !stateRef.current.achievementsUnlocked.includes(a.id));
    return TP_ACHIEVEMENTS;
  }, []);

  const tpIsAchievementUnlocked = useCallback((id: string): boolean => stateRef.current.achievementsUnlocked.includes(id), []);

  const tpGetAchievementProgress = useCallback((id: string): { current: number; target: number } => {
    const ach = TP_ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return { current: 0, target: 1 };
    const s = stateRef.current;
    const map: Record<string, () => number> = {
      'ach_first_brew': () => Math.min(1, s.totalBrewCount),
      'ach_brew_10': () => Math.min(10, s.totalBrewCount),
      'ach_brew_100': () => Math.min(100, s.totalBrewCount),
      'ach_serve_1': () => Math.min(1, s.totalGuestsServed),
      'ach_serve_25': () => Math.min(25, s.totalGuestsServed),
      'ach_legendary_brew': () => Math.min(1, s.legendaryBrewCount),
      'ach_perfect_ceremony': () => Math.min(1, s.perfectCeremonies),
      'ach_5_perfect': () => Math.min(5, s.perfectCeremonies),
      'ach_level_10': () => Math.min(10, s.level),
      'ach_level_25': () => Math.min(25, s.level),
      'ach_level_45': () => Math.min(45, s.level),
      'ach_all_ingredients': () => s.ingredientsDiscovered.length,
      'ach_all_rooms': () => s.roomsVisited.length,
      'ach_rich_host': () => Math.min(5000, s.coins),
      'ach_secret_blend': () => Math.min(10, Object.values(s.blendMastery).reduce((a, b) => Math.max(a, b), 0)),
    };
    const targets: Record<string, number> = {
      ach_first_brew: 1, ach_brew_10: 10, ach_brew_100: 100, ach_serve_1: 1, ach_serve_25: 25,
      ach_legendary_brew: 1, ach_perfect_ceremony: 1, ach_5_perfect: 5, ach_level_10: 10, ach_level_25: 25,
      ach_level_45: 45, ach_all_ingredients: 20, ach_all_rooms: 8, ach_rich_host: 5000, ach_secret_blend: 10,
    };
    return { current: map[id]?.() ?? 0, target: targets[id] ?? 1 };
  }, []);

  const tpGetAchievementCount = useCallback((): { unlocked: number; total: number } => {
    return { unlocked: stateRef.current.achievementsUnlocked.length, total: TP_ACHIEVEMENTS.length };
  }, []);

  const tpGetAchievementById = useCallback((id: string): TpAchievement | undefined => TP_ACHIEVEMENTS.find(a => a.id === id), []);

  // ── Daily Tasks ─────────────────────────────────────────────

  const tpGetDailySeed = useCallback((): number => {
    const now = new Date();
    return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  }, []);

  const tpGetDailyTasks = useCallback((): TpDailyTask[] => {
    const seed = tpGetDailySeed();
    const s = stateRef.current;
    if (s.dailyLastSeed !== seed) {
      const tasks = generateDailyTasks(seed);
      update(prev => ({ ...prev, dailyTasks: tasks, dailyLastSeed: seed }));
      return tasks;
    }
    return s.dailyTasks;
  }, [tpGetDailySeed, update]);

  const tpUpdateDailyProgress = useCallback((taskIndex: number, increment: number) => {
    update(prev => {
      const tasks = [...prev.dailyTasks];
      if (taskIndex < 0 || taskIndex >= tasks.length) return prev;
      const task = { ...tasks[taskIndex] };
      if (task.claimed) return prev;
      task.progress = Math.min(task.target, task.progress + increment);
      tasks[taskIndex] = task;
      return { ...prev, dailyTasks: tasks };
    });
  }, [update]);

  const tpClaimDailyReward = useCallback((taskIndex: number): { xp: number; coins: number } | null => {
    let reward: { xp: number; coins: number } | null = null;
    update(prev => {
      const tasks = [...prev.dailyTasks];
      if (taskIndex < 0 || taskIndex >= tasks.length) return prev;
      const task = tasks[taskIndex];
      if (task.claimed || task.progress < task.target) return prev;
      reward = task.reward;
      tasks[taskIndex] = { ...task, claimed: true };
      return { ...prev, dailyTasks: tasks, xp: prev.xp + task.reward.xp, coins: prev.coins + task.reward.coins, totalXpEarned: prev.totalXpEarned + task.reward.xp, totalCoinsEarned: prev.totalCoinsEarned + task.reward.coins };
    });
    return reward;
  }, [update]);

  const tpAreDailyTasksComplete = useCallback((): boolean => {
    return stateRef.current.dailyTasks.length > 0 && stateRef.current.dailyTasks.every(t => t.claimed);
  }, []);

  // ── NPCs ────────────────────────────────────────────────────

  const tpGetNpcs = useCallback((): TpNpc[] => TP_NPCS, []);

  const tpGetNpcById = useCallback((id: string): TpNpc | undefined => TP_NPCS.find(n => n.id === id), []);

  const tpGetNpcDialogue = useCallback((npcId: string): string => {
    const npc = TP_NPCS.find(n => n.id === npcId);
    if (!npc || npc.dialogue.length === 0) return '...';
    const rng = seededRandom(stateRef.current.prngSeed + npcId.length);
    return pickSeeded(npc.dialogue, rng);
  }, []);

  const tpGetNpcsByLocation = useCallback((roomId: string): TpNpc[] => {
    return TP_NPCS.filter(n => n.location === roomId);
  }, []);

  // ── Ceremony ────────────────────────────────────────────────

  const tpPerformCeremony = useCallback((blendId: string, guestId: string, styleIndex?: number): TpCeremonyResult | null => {
    let result: TpCeremonyResult | null = null;
    update(prev => {
      const blend = TP_BLENDS.find(b => b.id === blendId);
      const guest = TP_GUESTS.find(g => g.id === guestId);
      const room = TP_ROOMS.find(r => r.id === prev.currentRoom);
      const teaSet = TP_TEASETS.find(t => t.id === prev.currentTeaSet) ?? TP_TEASETS[0];
      if (!blend || !guest || !room) return prev;
      if (guest.requiredLevel > prev.level) return prev;
      const teaSetLvl = prev.teaSetLevels[teaSet.id] ?? 1;
      const mastery = prev.blendMastery[blendId] ?? 0;
      const rng = seededRandom(Date.now() + prev.prngSeed + 999);
      const style = styleIndex ?? Math.floor(rng() * TP_CEREMONY_STYLES.length);
      const quality = 0.6 + rng() * 0.4;
      const ceremony = computeCeremonyScore(blend, guest, room, teaSet, teaSetLvl, mastery, style, quality);
      result = ceremony;
      const newHistory = [...prev.ceremonyHistory, ceremony].slice(-50);
      return {
        ...prev,
        totalScore: prev.totalScore + ceremony.score,
        highestScore: Math.max(prev.highestScore, ceremony.score),
        ceremoniesPerformed: prev.ceremoniesPerformed + 1,
        totalGuestsServed: prev.totalGuestsServed + 1,
        perfectCeremonies: prev.perfectCeremonies + (ceremony.grade === 'S' ? 1 : 0),
        xp: prev.xp + ceremony.xpEarned,
        coins: prev.coins + ceremony.coinsEarned,
        totalXpEarned: prev.totalXpEarned + ceremony.xpEarned,
        totalCoinsEarned: prev.totalCoinsEarned + ceremony.coinsEarned,
        blendMastery: { ...prev.blendMastery, [blendId]: (prev.blendMastery[blendId] ?? 0) + 1 },
        guestFavorites: { ...prev.guestFavorites, [guestId]: (prev.guestFavorites[guestId] ?? 0) + 1 },
        totalBrewCount: prev.totalBrewCount + 1,
        legendaryBrewCount: prev.legendaryBrewCount + (blend.rarity === 'legendary' ? 1 : 0),
        ceremonyHistory: newHistory,
        questProgress: {
          ...prev.questProgress,
          q_brew_3: (prev.questProgress['q_brew_3'] ?? 0) + 1,
          q_brew_20: (prev.questProgress['q_brew_20'] ?? 0) + 1,
          q_serve_5: (prev.questProgress['q_serve_5'] ?? 0) + 1,
          q_score_500: (prev.questProgress['q_score_500'] ?? 0) + ceremony.score,
          q_ceremony_3: (prev.questProgress['q_ceremony_3'] ?? 0) + 1,
          q_perfect_ceremony: ceremony.grade === 'S' ? (prev.questProgress['q_perfect_ceremony'] ?? 0) + 1 : (prev.questProgress['q_perfect_ceremony'] ?? 0),
          q_all_rooms: prev.roomsVisited.length,
        },
      };
    });
    if (result) {
      setTimeout(() => tpCheckAchievements(), 0);
    }
    return result;
  }, [update, tpCheckAchievements]);

  const tpGetCeremonyStyles = useCallback((): readonly string[] => TP_CEREMONY_STYLES, []);

  const tpGetTotalScore = useCallback((): number => stateRef.current.totalScore, []);

  const tpGetCeremoniesPerformed = useCallback((): number => stateRef.current.ceremoniesPerformed, []);

  const tpGetHighestScore = useCallback((): number => stateRef.current.highestScore, []);

  const tpGetCeremonyHistory = useCallback((): TpCeremonyResult[] => stateRef.current.ceremonyHistory, []);

  const tpGetAverageScore = useCallback((): number => {
    const history = stateRef.current.ceremonyHistory;
    if (history.length === 0) return 0;
    return Math.floor(history.reduce((sum, h) => sum + h.score, 0) / history.length);
  }, []);

  // ── Stats ───────────────────────────────────────────────────

  const tpGetStats = useCallback(() => {
    const s = stateRef.current;
    return {
      level: s.level,
      title: s.title,
      xp: s.xp,
      coins: s.coins,
      totalBrews: s.totalBrewCount,
      totalGuestsServed: s.totalGuestsServed,
      totalScore: s.totalScore,
      highestScore: s.highestScore,
      ceremoniesPerformed: s.ceremoniesPerformed,
      legendaryBrews: s.legendaryBrewCount,
      perfectCeremonies: s.perfectCeremonies,
      achievementsUnlocked: s.achievementsUnlocked.length,
      questsCompleted: s.questsCompleted.length,
      ingredientsDiscovered: s.ingredientsDiscovered.length,
      roomsVisited: s.roomsVisited.length,
      totalCoinsEarned: s.totalCoinsEarned,
      totalXpEarned: s.totalXpEarned,
    };
  }, []);

  const tpGetTopBlend = useCallback((): TpBlend | null => {
    const mastery = stateRef.current.blendMastery;
    let topId = '';
    let topCount = 0;
    for (const [id, count] of Object.entries(mastery)) {
      if (count > topCount) { topId = id; topCount = count; }
    }
    return topId ? (TP_BLENDS.find(b => b.id === topId) ?? null) : null;
  }, []);

  const tpGetTopGuest = useCallback((): TpGuest | null => {
    const favs = stateRef.current.guestFavorites;
    let topId = '';
    let topCount = 0;
    for (const [id, count] of Object.entries(favs)) {
      if (count > topCount) { topId = id; topCount = count; }
    }
    return topId ? (TP_GUESTS.find(g => g.id === topId) ?? null) : null;
  }, []);

  const tpGetPartyScore = useCallback((): number => {
    const s = stateRef.current;
    const baseScore = s.totalScore;
    const achievementBonus = s.achievementsUnlocked.length * 50;
    const masteryBonus = Object.values(s.blendMastery).reduce((a, b) => a + b, 0) * 10;
    const guestBonus = s.totalGuestsServed * 20;
    const ceremonyBonus = s.perfectCeremonies * 100;
    return baseScore + achievementBonus + masteryBonus + guestBonus + ceremonyBonus;
  }, []);

  const tpGetPartyRank = useCallback((): string => {
    const score = tpGetPartyScore();
    if (score >= 10000) return 'Mythic Host';
    if (score >= 5000) return 'Legendary Host';
    if (score >= 2000) return 'Eminent Host';
    if (score >= 1000) return 'Skilled Host';
    if (score >= 500) return 'Apprentice Host';
    return 'Novice Host';
  }, [tpGetPartyScore]);

  const tpGetSeasonalBonus = useCallback((): { season: string; bonusBlend: string; bonusMultiplier: number } => {
    const month = new Date().getMonth();
    let season: string;
    if (month >= 2 && month <= 4) season = 'spring';
    else if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'autumn';
    else season = 'winter';
    const seasonBlends: Record<string, string> = {
      spring: 'fairy_blossom',
      summer: 'sunset_herb',
      autumn: 'dragon_fire_chai',
      winter: 'frost_mint_snow',
    };
    return { season, bonusBlend: seasonBlends[season], bonusMultiplier: 1.2 };
  }, []);

  const tpGetCollectionProgress = useCallback((): { blends: number; guests: number; ingredients: number; rooms: number; totalBlends: number; totalGuests: number; totalIngredients: number; totalRooms: number } => {
    const s = stateRef.current;
    return {
      blends: Object.keys(s.blendMastery).length,
      guests: Object.keys(s.guestFavorites).length,
      ingredients: s.ingredientsDiscovered.length,
      rooms: s.roomsVisited.length,
      totalBlends: TP_BLENDS.length,
      totalGuests: TP_GUESTS.length,
      totalIngredients: TP_INGREDIENTS.length,
      totalRooms: TP_ROOMS.length,
    };
  }, []);

  // ── RNG Utilities ───────────────────────────────────────────

  const tpGetSeededRandom = useCallback((seed: number): number => {
    const rng = seededRandom(seed + stateRef.current.prngSeed);
    return rng();
  }, []);

  const tpPickRandom = useCallback(<T,>(arr: T[], seed?: number): T => {
    const s = seed ?? Date.now();
    const rng = seededRandom(s + stateRef.current.prngSeed);
    return pickSeeded(arr, rng);
  }, []);

  // ── Serialize / Deserialize ─────────────────────────────────

  const tpSerialize = useCallback((): string => {
    return JSON.stringify(stateRef.current);
  }, []);

  const tpDeserialize = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as TpTeaPartyState;
      if (typeof parsed.level !== 'number' || typeof parsed.coins !== 'number') return false;
      setState(parsed);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    // Core (8)
    tpGetState,
    tpResetState,
    tpGetLevel,
    tpGetTitle,
    tpGetProgress,
    tpAddXP,
    tpGetCoins,
    tpAddCoins,
    tpSpendCoins,
    // Blends (14)
    tpGetBlends,
    tpGetBlendById,
    tpGetBlendMastery,
    tpGetBlendRarity,
    tpGetBlendColor,
    tpCanBrew,
    tpBrew,
    tpBrewWithBooster,
    tpCollectBrew,
    tpGetBrewingQueue,
    tpIsBrewReady,
    tpGetBrewProgress,
    tpGetBrewTimeRemaining,
    tpCancelBrew,
    tpBrewMultiple,
    tpQuickBrew,
    tpGetRecommendedBlend,
    tpGetMissingIngredients,
    tpGetCollectedBlends,
    tpGetUncollectedBlends,
    tpGetBrewPower,
    // Rooms (7)
    tpGetRooms,
    tpGetRoomById,
    tpGetCurrentRoom,
    tpSetRoom,
    tpIsRoomUnlocked,
    tpGetRoomUnlockLevel,
    tpGetRoomCapacity,
    // Ingredients (9)
    tpGetIngredients,
    tpGetOwnedIngredients,
    tpGetIngredientCount,
    tpBuyIngredient,
    tpUseIngredient,
    tpGetIngredientById,
    tpGetIngredientsByElement,
    tpGetTotalIngredientValue,
    tpGetElementBalance,
    tpGetTotalIngredientCount,
    // Boosters (4)
    tpGetBoosters,
    tpGetBoosterById,
    tpGetOwnedBoosters,
    tpBuyBooster,
    tpGetBoosterCount,
    // Guests (6)
    tpGetGuests,
    tpGetGuestById,
    tpGetAvailableGuests,
    tpServeGuest,
    tpGetGuestFavoriteCount,
    tpGetGuestGreeting,
    tpGetGuestFarewell,
    // Tea Sets (8)
    tpGetTeaSets,
    tpGetTeaSetById,
    tpGetCurrentTeaSet,
    tpSetTeaSet,
    tpUpgradeSet,
    tpGetTeaSetLevel,
    tpGetTeaSetBonus,
    tpGetUpgradeCost,
    tpIsTeaSetMaxed,
    // Quests (8)
    tpGetQuests,
    tpAcceptQuest,
    tpGetQuestProgress,
    tpGetQuestStatus,
    tpCompleteQuest,
    tpGetAcceptedQuests,
    tpGetCompletedQuests,
    tpGetQuestById,
    // Achievements (7)
    tpGetAchievements,
    tpIsAchievementUnlocked,
    tpCheckAchievements,
    tpGetAchievementProgress,
    tpGetAchievementCount,
    tpGetAchievementById,
    // Daily (4)
    tpGetDailyTasks,
    tpUpdateDailyProgress,
    tpClaimDailyReward,
    tpAreDailyTasksComplete,
    // NPCs (3)
    tpGetNpcs,
    tpGetNpcById,
    tpGetNpcDialogue,
    tpGetNpcsByLocation,
    // Ceremony (8)
    tpPerformCeremony,
    tpGetCeremonyStyles,
    tpGetTotalScore,
    tpGetCeremoniesPerformed,
    tpGetHighestScore,
    tpGetCeremonyHistory,
    tpGetAverageScore,
    // Stats (10)
    tpGetStats,
    tpGetTopBlend,
    tpGetTopGuest,
    tpGetPartyScore,
    tpGetPartyRank,
    tpGetSeasonalBonus,
    tpGetCollectionProgress,
    // RNG (2)
    tpGetSeededRandom,
    tpPickRandom,
    // Serialization (2)
    tpSerialize,
    tpDeserialize,
  };
}

export default useTeaParty;
