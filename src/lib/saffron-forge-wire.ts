/**
 * Saffron Forge Wire — Saffron Forge feature module for Word Snake
 *
 * A culinary forge where players learn 35 saffron recipes across 7 cuisine schools,
 * explore 8 forge chambers, collect 30 spice ingredients, build 25 upgradeable
 * structures, master 22 cooking abilities, earn 18 achievements, unlock 8 titles,
 * craft 15 legendary spice blends with historical lore, and respond to 12 forge
 * events — backed by a Zustand store with persist middleware.
 *
 * Storage key: saffron-forge-wire
 * Prefix: sf / SF_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type SFRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type SFSchool = 'Baking' | 'Brewing' | 'Distilling' | 'Infusing' | 'Smoking' | 'Crystallizing' | 'Fermenting'

export interface SFRecipeDef {
  readonly id: string
  readonly name: string
  readonly school: SFSchool
  readonly rarity: SFRarity
  readonly description: string
  readonly spiceRequirements: string[]
  readonly baseXp: number
  readonly baseCoins: number
  readonly difficulty: number
  readonly cookTimeSec: number
}

export interface SFChamberDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly minLevel: number
  readonly unlockCost: number
  readonly xpBonus: number
  readonly coinBonus: number
  readonly bonuses: string[]
}

export interface SFSpiceDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: SFRarity
  readonly value: number
  readonly source: string
  readonly flavor: string
}

export interface SFStructureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly category: string
  readonly baseCost: number
  readonly costMultiplier: number
  readonly maxLevel: number
  readonly bonusPerLevel: number
}

export interface SFAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly school: SFSchool
}

export interface SFAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface SFTitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredRecipes: number
}

export interface SFBlendDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly lore: string
  readonly rarity: SFRarity
  readonly powerBonus: number
  readonly componentSpices: string[]
}

export interface SFEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly severity: number
  readonly duration: number
  readonly effects: string[]
}

export interface SFStoreState {
  learnedRecipes: string[]
  collectedSpices: Record<string, number>
  craftedBlends: string[]
  builtChambers: string[]
  structures: Record<string, number>
  unlockedAbilities: string[]
  achievements: string[]
  currentTitle: string
  forgeLevel: number
  forgeExp: number
  forgeCoins: number
  totalXpEarned: number
  totalCoinsEarned: number
  totalRecipesCrafted: number
  totalBlendsCrafted: number
  totalSpicesCollected: number
  totalStructuresUpgraded: number
  activeEventId: string | null
  eventTimer: number
  activeChamber: string
}

export interface SFStoreActions {
  sfLearnRecipe: (recipeId: string) => boolean
  sfCollectSpice: (spiceId: string) => number
  sfCraftBlend: (blendId: string) => boolean
  sfBuildChamber: (chamberId: string) => boolean
  sfUpgradeStructure: (structureId: string) => boolean
  sfUnlockAbility: (abilityId: string) => boolean
  sfTriggerEvent: (eventId: string) => boolean
  sfCraftRecipe: (recipeId: string) => boolean
  sfSetActiveChamber: (chamberId: string) => boolean
  sfSetTitle: (titleId: string) => boolean
}

export type SFFullStore = SFStoreState & SFStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const SF_COLOR_SAFFRON_GOLD: string = '#F4C430'
export const SF_COLOR_TURMERIC_ORANGE: string = '#E28D00'
export const SF_COLOR_PAPRIKA_RED: string = '#C41E3A'
export const SF_COLOR_CINNAMON_BROWN: string = '#7B3F00'
export const SF_COLOR_CUMIN_TAN: string = '#C2B280'
export const SF_COLOR_BASIL_GREEN: string = '#2E8B57'
export const SF_COLOR_PEPPER_BLACK: string = '#1A1A1A'
export const SF_COLOR_VANILLA_CREAM: string = '#F3E5AB'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: XP & LEVEL HELPERS
// ═══════════════════════════════════════════════════════════════════

const SF_MAX_LEVEL = 50
const SF_INITIAL_COINS = 500

function sfCalcXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= SF_MAX_LEVEL) return Infinity
  return Math.floor(85 * Math.pow(1.13, level) + level * 16)
}

function sfCalcLevelFromXp(totalXp: number): number {
  let level = 1
  let remaining = totalXp
  while (level < SF_MAX_LEVEL) {
    const needed = sfCalcXpForLevel(level)
    if (remaining < needed) break
    remaining -= needed
    level++
  }
  return level
}

function sfCalcRarityMultiplier(rarity: SFRarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.5
    case 'rare': return 2.2
    case 'epic': return 3.5
    case 'legendary': return 6.0
  }
}

function sfCalcSchoolColor(school: SFSchool): string {
  switch (school) {
    case 'Baking': return SF_COLOR_SAFFRON_GOLD
    case 'Brewing': return SF_COLOR_CUMIN_TAN
    case 'Distilling': return SF_COLOR_CINNAMON_BROWN
    case 'Infusing': return SF_COLOR_BASIL_GREEN
    case 'Smoking': return SF_COLOR_PAPRIKA_RED
    case 'Crystallizing': return SF_COLOR_VANILLA_CREAM
    case 'Fermenting': return SF_COLOR_TURMERIC_ORANGE
  }
}

function sfFindRarityColor(rarity: SFRarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#F4C430'
    case 'rare': return '#2E8B57'
    case 'epic': return '#C41E3A'
    case 'legendary': return '#FFD700'
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: SYNERGY TABLES & CRAFTING CHANCES
// ═══════════════════════════════════════════════════════════════════

const SF_SCHOOL_SYNERGY: Record<SFSchool, SFSchool[]> = {
  Baking: ['Infusing', 'Crystallizing'],
  Brewing: ['Infusing', 'Fermenting'],
  Distilling: ['Smoking', 'Crystallizing'],
  Infusing: ['Brewing', 'Fermenting'],
  Smoking: ['Distilling', 'Baking'],
  Crystallizing: ['Distilling', 'Baking'],
  Fermenting: ['Brewing', 'Infusing'],
}

const SF_CHAMBER_BONUS_MAP: Record<string, { xpBonus: number; coinBonus: number }> = {
  rustic_kitchen: { xpBonus: 0.05, coinBonus: 0.05 },
  herb_garden: { xpBonus: 0.1, coinBonus: 0.08 },
  smokehouse: { xpBonus: 0.12, coinBonus: 0.15 },
  distillery: { xpBonus: 0.15, coinBonus: 0.12 },
  infusion_lab: { xpBonus: 0.18, coinBonus: 0.18 },
  crystal_pantry: { xpBonus: 0.2, coinBonus: 0.22 },
  fermentation_cave: { xpBonus: 0.22, coinBonus: 0.2 },
  saffron_sanctum: { xpBonus: 0.35, coinBonus: 0.35 },
}

function sfComputeChamberBonus(chamberId: string): { xpBonus: number; coinBonus: number } {
  return SF_CHAMBER_BONUS_MAP[chamberId] ?? { xpBonus: 0, coinBonus: 0 }
}

function sfComputeStructureBonus(structureId: string, level: number): number {
  const baseBonuses: Record<string, number> = {
    brick_oven: 3, stone_cauldron: 4, copper_still: 5, glass_infuser: 4,
    oak_smoker: 6, quartz_crystalizer: 7, clay_fermenter: 3, marble_counter: 2,
    iron_grate: 3, bronze_mortar: 4, silver_whisk: 5, gold_scale: 6,
    spice_rack: 2, herb_dryer: 3, pepper_mill: 4, salt_cellar: 2,
    saffron_press: 8, vanilla_extractor: 7, cinnamon_roller: 5, cumin_grinder: 4,
    basil_pistol: 3, tandoor_pit: 6, wok_station: 5, fondue_fountain: 4, syrup_cauldron: 3,
  }
  return (baseBonuses[structureId] ?? 2) * level
}

function sfCalcUpgradeCost(structureId: string, currentLevel: number): number {
  const def = SF_STRUCTURES.find(s => s.id === structureId)
  if (!def) return 0
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: SF_RECIPES — 35 Saffron Recipes (5 per school, 7 schools)
// ═══════════════════════════════════════════════════════════════════

export const SF_RECIPES: readonly SFRecipeDef[] = [
  // ── Baking (5: one per rarity) ────────────────────────────────
  {
    id: 'honey_saffron_bun',
    name: 'Honey Saffron Bun',
    school: 'Baking',
    rarity: 'common',
    description: 'A golden bun infused with delicate saffron threads and local honey. The dough is slow-proofed for 12 hours, giving it an airy texture and a warm, floral sweetness that melts on the tongue. A staple of rustic kitchens.',
    spiceRequirements: ['saffron_thread', 'honey_drops'],
    baseXp: 15,
    baseCoins: 10,
    difficulty: 1,
    cookTimeSec: 30,
  },
  {
    id: 'turmeric_pound_cake',
    name: 'Turmeric Pound Cake',
    school: 'Baking',
    rarity: 'uncommon',
    description: 'A dense, moist pound cake with vibrant turmeric coloring and a subtle earthy flavor. Each slice reveals a beautiful golden crumb, complemented by a hint of black pepper that elevates the sweetness to something sophisticated.',
    spiceRequirements: ['turmeric_root', 'black_peppercorn', 'vanilla_bean'],
    baseXp: 35,
    baseCoins: 25,
    difficulty: 2,
    cookTimeSec: 45,
  },
  {
    id: 'cinnamon_star_bread',
    name: 'Cinnamon Star Bread',
    school: 'Baking',
    rarity: 'rare',
    description: 'An elaborate bread shaped like a star, with layers of buttery dough wrapped around a cinnamon-sugar filling. When baked, the layers separate into golden points that are as beautiful as they are fragrant. Requires expert braiding technique.',
    spiceRequirements: ['cinnamon_stick', 'cardamom_pod', 'saffron_thread', 'star_anise'],
    baseXp: 80,
    baseCoins: 55,
    difficulty: 4,
    cookTimeSec: 60,
  },
  {
    id: 'paprika_saffron_twist',
    name: 'Paprika Saffron Twist',
    school: 'Baking',
    rarity: 'epic',
    description: 'A savory-sweet bread twist that marries the smoky heat of Hungarian paprika with the luxurious floral notes of saffron. The dough is colored in a striking red-gold swirl, and the aroma while baking fills an entire neighborhood.',
    spiceRequirements: ['paprika_powder', 'saffron_thread', 'smoked_salt', 'coriander_seed'],
    baseXp: 180,
    baseCoins: 120,
    difficulty: 5,
    cookTimeSec: 50,
  },
  {
    id: 'golden_phoenix_croissant',
    name: 'Golden Phoenix Croissant',
    school: 'Baking',
    rarity: 'legendary',
    description: 'A legendary croissant made with saffron-infused butter and 72-hour laminated dough. Each layer is thinner than paper, and the finished pastry glows with an internal golden light. Said to have been invented by an immortal baker in a dream.',
    spiceRequirements: ['saffron_thread', 'vanilla_bean', 'cardamom_pod', 'turmeric_root', 'nutmeg_seed'],
    baseXp: 400,
    baseCoins: 300,
    difficulty: 6,
    cookTimeSec: 90,
  },

  // ── Brewing (5) ──────────────────────────────────────────────
  {
    id: 'basil_clove_tea',
    name: 'Basil Clove Tea',
    school: 'Brewing',
    rarity: 'common',
    description: 'A simple but aromatic tea made by steeping fresh basil leaves with whole cloves. The result is a warming, slightly sweet brew with notes of eucalyptus and a gentle spiciness that clears the mind and soothes the throat.',
    spiceRequirements: ['basil_leaf', 'clove_bud'],
    baseXp: 12,
    baseCoins: 8,
    difficulty: 1,
    cookTimeSec: 10,
  },
  {
    id: 'ginger_turmeric_latte',
    name: 'Ginger Turmeric Latte',
    school: 'Brewing',
    rarity: 'uncommon',
    description: 'A creamy, golden latte made from freshly ground turmeric and ginger root, frothed with oat milk and sweetened with honey. Anti-inflammatory and deeply comforting, it has become the signature drink of wellness-minded forgers everywhere.',
    spiceRequirements: ['turmeric_root', 'ginger_root', 'honey_drops', 'black_peppercorn'],
    baseXp: 30,
    baseCoins: 20,
    difficulty: 2,
    cookTimeSec: 15,
  },
  {
    id: 'cumin_chamomile_elixir',
    name: 'Cumin Chamomile Elixir',
    school: 'Brewing',
    rarity: 'rare',
    description: 'An unusual but exquisite elixir combining the earthy warmth of toasted cumin with the floral delicacy of chamomile flowers. The cumin is dry-toasted before steeping, releasing a nutty depth that anchors the chamomile\'s ephemeral sweetness.',
    spiceRequirements: ['cumin_seed', 'chamomile_flower', 'honey_drops', 'lemon_peel'],
    baseXp: 70,
    baseCoins: 50,
    difficulty: 3,
    cookTimeSec: 20,
  },
  {
    id: 'five_spice_chai',
    name: 'Five-Spice Forge Chai',
    school: 'Brewing',
    rarity: 'epic',
    description: 'A powerful chai brewed with five harmonious spices: cinnamon, star anise, cloves, fennel, and a rare black cardamom. Simmered in milk for hours until the flavors merge into something greater than the sum of their parts. Unlocks deep focus.',
    spiceRequirements: ['cinnamon_stick', 'star_anise', 'clove_bud', 'fennel_seed', 'black_cardamom'],
    baseXp: 160,
    baseCoins: 110,
    difficulty: 5,
    cookTimeSec: 45,
  },
  {
    id: 'ambrosia_moonbrew',
    name: 'Ambrosia Moonbrew',
    school: 'Brewing',
    rarity: 'legendary',
    description: 'A mythical brew said to have been gifted to mortals by the moon goddess herself. Brewed only during a full moon using saffron, lotus extract, and dew collected from silver grass. One sip grants clarity of thought and a warm glow that lasts for hours.',
    spiceRequirements: ['saffron_thread', 'lotus_extract', 'star_anise', 'cardamom_pod', 'vanilla_bean'],
    baseXp: 380,
    baseCoins: 280,
    difficulty: 6,
    cookTimeSec: 120,
  },

  // ── Distilling (5) ───────────────────────────────────────────
  {
    id: 'peppermint_extract',
    name: 'Peppermint Extract',
    school: 'Distilling',
    rarity: 'common',
    description: 'A clear, intensely aromatic extract obtained by steam-distilling fresh peppermint leaves. A few drops transform any beverage or dessert, providing a cool, refreshing burst of pure menthol that cleanses the palate instantly.',
    spiceRequirements: ['peppermint_leaf'],
    baseXp: 14,
    baseCoins: 12,
    difficulty: 1,
    cookTimeSec: 40,
  },
  {
    id: 'rose_water',
    name: 'Rose Water Distillate',
    school: 'Distilling',
    rarity: 'uncommon',
    description: 'A fragrant floral water produced through careful hydro-distillation of damask rose petals. Used extensively in Middle Eastern and South Asian cooking, it adds a subtle, perfumed sweetness that cannot be replicated by any other ingredient.',
    spiceRequirements: ['rose_petal', 'honey_drops'],
    baseXp: 32,
    baseCoins: 22,
    difficulty: 2,
    cookTimeSec: 60,
  },
  {
    id: 'cinnamon_bark_essence',
    name: 'Cinnamon Bark Essence',
    school: 'Distilling',
    rarity: 'rare',
    description: 'A concentrated essence extracted from Ceylon cinnamon bark through slow vacuum distillation. The result is an amber liquid of extraordinary intensity — a single drop provides the warmth and complexity of an entire cinnamon stick.',
    spiceRequirements: ['cinnamon_stick', 'nutmeg_seed', 'clove_bud', 'allspice_berry'],
    baseXp: 75,
    baseCoins: 52,
    difficulty: 4,
    cookTimeSec: 90,
  },
  {
    id: 'ghost_pepper_tincture',
    name: 'Ghost Pepper Tincture',
    school: 'Distilling',
    rarity: 'epic',
    description: 'A fearsome tincture extracted from Bhut Jolokia ghost peppers using cold-press distillation to preserve the capsaicin\'s raw intensity. One drop in a full cauldron of soup transforms it from mild to inferno. Handle with extreme caution.',
    spiceRequirements: ['ghost_pepper', 'black_peppercorn', 'ginger_root', 'mustard_seed'],
    baseXp: 170,
    baseCoins: 130,
    difficulty: 5,
    cookTimeSec: 75,
  },
  {
    id: 'elixir_of_eternal_fire',
    name: 'Elixir of Eternal Fire',
    school: 'Distilling',
    rarity: 'legendary',
    description: 'The most potent distillate in the forge, combining saffron, cinnamon bark, ghost pepper, and a rare ember flower extract. The resulting liquid glows with internal fire and grants the drinker heightened culinary perception for an entire day.',
    spiceRequirements: ['saffron_thread', 'ghost_pepper', 'cinnamon_stick', 'ember_flower', 'cardamom_pod'],
    baseXp: 420,
    baseCoins: 320,
    difficulty: 6,
    cookTimeSec: 180,
  },

  // ── Infusing (5) ─────────────────────────────────────────────
  {
    id: 'garlic_chili_oil',
    name: 'Garlic Chili Infused Oil',
    school: 'Infusing',
    rarity: 'common',
    description: 'A versatile cooking oil infused with sliced garlic and dried red chilies. Slowly heated to extract flavors without burning, this oil becomes a staple condiment that adds instant depth and gentle heat to noodles, stir-fries, and dipping sauces.',
    spiceRequirements: ['garlic_clove', 'dried_chili'],
    baseXp: 11,
    baseCoins: 8,
    difficulty: 1,
    cookTimeSec: 25,
  },
  {
    id: 'vanilla_bean_butter',
    name: 'Vanilla Bean Compound Butter',
    school: 'Infusing',
    rarity: 'uncommon',
    description: 'Rich European-style butter blended with scraped vanilla bean seeds and a pinch of sea salt. The tiny black specks of vanilla distributed through the golden butter create a luxurious compound that melts into steak, lobster, or warm bread.',
    spiceRequirements: ['vanilla_bean', 'sea_salt_flake'],
    baseXp: 28,
    baseCoins: 20,
    difficulty: 2,
    cookTimeSec: 15,
  },
  {
    id: 'saffron_honey_infusion',
    name: 'Saffron Honey Infusion',
    school: 'Infusing',
    rarity: 'rare',
    description: 'A precious infusion where saffron threads are slowly steeped in raw wildflower honey for 30 days. The honey takes on a deep golden hue and a complex floral-spice profile that is both rare and addictive. Used in desserts and premium teas.',
    spiceRequirements: ['saffron_thread', 'honey_drops', 'rose_petal', 'lemon_peel'],
    baseXp: 65,
    baseCoins: 48,
    difficulty: 3,
    cookTimeSec: 10,
  },
  {
    id: 'truffle_sage_oil',
    name: 'Truffle Sage Aromatic Oil',
    school: 'Infusing',
    rarity: 'epic',
    description: 'An ultra-premium oil infused with black truffle shavings and fresh sage leaves under vacuum at precisely 45°C. The vacuum sealing forces the truffle\'s earthy, musky aroma deep into the oil molecules, creating an elixir that transforms simple pasta into haute cuisine.',
    spiceRequirements: ['truffle_shaving', 'sage_leaf', 'garlic_clove', 'black_peppercorn'],
    baseXp: 155,
    baseCoins: 115,
    difficulty: 4,
    cookTimeSec: 120,
  },
  {
    id: 'nectar_of_the_silk_road',
    name: 'Nectar of the Silk Road',
    school: 'Infusing',
    rarity: 'legendary',
    description: 'A legendary multi-layered infusion combining saffron, cardamom, rose water, vanilla, and a whisper of ambergris into a single harmonious nectar. This recipe was carried along the Silk Road for centuries by merchant-spice masters, each adding their own touch.',
    spiceRequirements: ['saffron_thread', 'cardamom_pod', 'rose_petal', 'vanilla_bean', 'ambergris_dust'],
    baseXp: 390,
    baseCoins: 290,
    difficulty: 6,
    cookTimeSec: 240,
  },

  // ── Smoking (5) ──────────────────────────────────────────────
  {
    id: 'smoked_paprika_blend',
    name: 'Smoked Paprika Blend',
    school: 'Smoking',
    rarity: 'common',
    description: 'A blend of sweet and hot paprika peppers slow-smoked over oak for 48 hours. The resulting powder has a deep reddish-brown color and a complex smoky-sweet flavor that forms the backbone of countless spice rubs and marinades.',
    spiceRequirements: ['paprika_powder', 'sea_salt_flake'],
    baseXp: 13,
    baseCoins: 9,
    difficulty: 1,
    cookTimeSec: 2880,
  },
  {
    id: 'lapsang_souchong_tea',
    name: 'Lapsang Souchong Tea',
    school: 'Smoking',
    rarity: 'uncommon',
    description: 'The original smoked tea, produced by drying tea leaves over pinewood fires in the Wuyi Mountains. Each leaf absorbs the essence of the smoke, creating a brew with an unmistakable campfire aroma balanced by a smooth, malty sweetness.',
    spiceRequirements: ['tea_leaf', 'pine_wood_chip'],
    baseXp: 33,
    baseCoins: 24,
    difficulty: 2,
    cookTimeSec: 1440,
  },
  {
    id: 'clove_orange_smoke',
    name: 'Clove-Orange Cold Smoke',
    school: 'Smoking',
    rarity: 'rare',
    description: 'A sophisticated cold-smoking technique where orange peel and whole cloves are smoldered in a special chamber to produce aromatic smoke. This smoke is then captured and infused into cheeses, butters, and chocolates, imparting a warm, festive quality.',
    spiceRequirements: ['clove_bud', 'orange_peel', 'cinnamon_stick', 'brown_sugar'],
    baseXp: 72,
    baseCoins: 55,
    difficulty: 4,
    cookTimeSec: 3600,
  },
  {
    id: 'dragon_breath_chili_smoke',
    name: 'Dragon Breath Chili Smoke',
    school: 'Smoking',
    rarity: 'epic',
    description: 'An extreme smoking technique where ghost peppers, habaneros, and smoked paprika are rendered into a thick, intense smoke that can flavor entire rooms of hanging charcuterie. The smoke itself is visible as a crimson haze. Not for the faint-hearted.',
    spiceRequirements: ['ghost_pepper', 'habanero_pepper', 'paprika_powder', 'cumin_seed'],
    baseXp: 165,
    baseCoins: 125,
    difficulty: 5,
    cookTimeSec: 1800,
  },
  {
    id: 'phoenix_feather_smoked_salt',
    name: 'Phoenix Feather Smoked Salt',
    school: 'Smoking',
    rarity: 'legendary',
    description: 'Maldon sea salt flakes slow-smoked over a blend of applewood, saffron threads, and rare phoenix feather grass. Each flake carries a golden tinge and a flavor that combines smoke, sea, and an inexplicable floral sweetness. Used by three-star chefs worldwide.',
    spiceRequirements: ['sea_salt_flake', 'saffron_thread', 'apple_wood_chip', 'phoenix_grass'],
    baseXp: 410,
    baseCoins: 310,
    difficulty: 6,
    cookTimeSec: 4320,
  },

  // ── Crystallizing (5) ────────────────────────────────────────
  {
    id: 'candied_ginger',
    name: 'Candied Crystallized Ginger',
    school: 'Crystallizing',
    rarity: 'common',
    description: 'Fresh ginger root boiled in sugar syrup until tender, then rolled in coarse sugar crystals. The result is a chewy, spicy-sweet confection with a fiery kick that lingers. A beloved snack and essential baking ingredient across Asia.',
    spiceRequirements: ['ginger_root'],
    baseXp: 10,
    baseCoins: 7,
    difficulty: 1,
    cookTimeSec: 45,
  },
  {
    id: 'cinnamon_candy_crystal',
    name: 'Cinnamon Candy Crystals',
    school: 'Crystallizing',
    rarity: 'uncommon',
    description: 'Large, translucent red crystals formed by slowly cooling a supersaturated cinnamon-sugar solution. Each crystal is a perfect geometric shape with an intense, warming cinnamon flavor that dissolves slowly on the tongue like a spicy hard candy.',
    spiceRequirements: ['cinnamon_stick', 'white_sugar'],
    baseXp: 31,
    baseCoins: 23,
    difficulty: 2,
    cookTimeSec: 90,
  },
  {
    id: 'saffron_rock_candy',
    name: 'Saffron Rock Candy',
    school: 'Crystallizing',
    rarity: 'rare',
    description: 'Stunning golden crystals grown on a string over several days from a saffron-infused sugar solution. Each crystal captures light like a tiny prism, and dissolving one in hot water creates a luxurious golden saffron tea of extraordinary clarity.',
    spiceRequirements: ['saffron_thread', 'white_sugar', 'cardamom_pod', 'rose_petal'],
    baseXp: 68,
    baseCoins: 50,
    difficulty: 3,
    cookTimeSec: 14400,
  },
  {
    id: 'vanilla_bean_diamonds',
    name: 'Vanilla Bean Diamond Crystals',
    school: 'Crystallizing',
    rarity: 'epic',
    description: 'Perfect diamond-shaped crystals formed from real vanilla bean extract under precisely controlled temperature and humidity conditions. Each crystal contains hundreds of tiny vanilla seeds visible within its structure, and a single one flavors an entire dessert.',
    spiceRequirements: ['vanilla_bean', 'white_sugar', 'nutmeg_seed', 'lemon_peel'],
    baseXp: 175,
    baseCoins: 135,
    difficulty: 5,
    cookTimeSec: 28800,
  },
  {
    id: ' philosophers_stone_candy',
    name: 'Philosopher\'s Stone Candy',
    school: 'Crystallizing',
    rarity: 'legendary',
    description: 'A mythical candy crystal said to be made from a recipe hidden in an ancient alchemical text. Combining saffron, cinnamon, vanilla, and a mysterious transmutation powder, these crystals shift color depending on the light and are said to grant creative inspiration.',
    spiceRequirements: ['saffron_thread', 'cinnamon_stick', 'vanilla_bean', 'transmutation_powder'],
    baseXp: 430,
    baseCoins: 350,
    difficulty: 6,
    cookTimeSec: 43200,
  },

  // ── Fermenting (5) ───────────────────────────────────────────
  {
    id: 'basic_miso_paste',
    name: 'Basic Miso Paste',
    school: 'Fermenting',
    rarity: 'common',
    description: 'A simple but essential fermented paste made from soybeans inoculated with koji culture and aged with sea salt. After 3 months of careful fermentation in cedar barrels, it develops a salty, umami-rich flavor that is the foundation of Japanese cooking.',
    spiceRequirements: ['sea_salt_flake', 'koji_spore'],
    baseXp: 16,
    baseCoins: 11,
    difficulty: 1,
    cookTimeSec: 7776000,
  },
  {
    id: 'kimchi_jjigae_base',
    name: 'Kimchi Fermentation Base',
    school: 'Fermenting',
    rarity: 'uncommon',
    description: 'A spicy fermented vegetable base made with napa cabbage, Korean chili flakes, garlic, ginger, and fish sauce. Left to ferment underground for weeks, it develops complex lactic acidity that is both tangy and deeply savory, essential for Korean stews.',
    spiceRequirements: ['garlic_clove', 'ginger_root', 'korean_chili_flake', 'fish_sauce'],
    baseXp: 34,
    baseCoins: 26,
    difficulty: 2,
    cookTimeSec: 604800,
  },
  {
    id: 'saffron_kefir',
    name: 'Saffron Kefir Culture',
    school: 'Fermenting',
    rarity: 'rare',
    description: 'An innovative fermented milk drink inoculated with rare kefir grains and steeped with saffron threads. The fermentation produces a tangy, slightly effervescent beverage with a beautiful golden color and probiotic properties that enhance nutrient absorption.',
    spiceRequirements: ['saffron_thread', 'kefir_grain', 'cardamom_pod', 'honey_drops'],
    baseXp: 78,
    baseCoins: 56,
    difficulty: 3,
    cookTimeSec: 172800,
  },
  {
    id: 'ghost_pepper_hot_sauce',
    name: 'Aged Ghost Pepper Hot Sauce',
    school: 'Fermenting',
    rarity: 'epic',
    description: 'A devastatingly hot sauce made by lacto-fermenting ghost peppers, garlic, and shallots for 6 months. The fermentation mellows the raw heat into a complex, fruity fire with notes of apricot and smoke. A single drop transforms any dish into an adventure.',
    spiceRequirements: ['ghost_pepper', 'garlic_clove', 'shallot', 'black_peppercorn'],
    baseXp: 185,
    baseCoins: 140,
    difficulty: 5,
    cookTimeSec: 15552000,
  },
  {
    id: 'elixir_vitae',
    name: 'Elixir Vitae — The Living Ferment',
    school: 'Fermenting',
    rarity: 'legendary',
    description: 'The ultimate fermentation — a living culture combining saffron, rare Tibetan goji berries, ginseng root, and a thousand-year-old mother culture. The elixir is said to evolve its own flavor profile over time, becoming more complex with each passing year. Truly alive.',
    spiceRequirements: ['saffron_thread', 'ginseng_root', 'goji_berry', 'kefir_grain'],
    baseXp: 440,
    baseCoins: 340,
    difficulty: 6,
    cookTimeSec: 31536000,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: SF_CHAMBERS — 8 Forge Chambers
// ═══════════════════════════════════════════════════════════════════

export const SF_CHAMBERS: readonly SFChamberDef[] = [
  {
    id: 'rustic_kitchen',
    name: 'Rustic Kitchen',
    description:
      'A warm, cluttered kitchen with a wood-fired stove and worn copper pots hanging from the ceiling. The scent of bread and spices fills every corner. This is where every forge master begins their journey, learning the fundamentals of spice and fire.',
    minLevel: 1,
    unlockCost: 0,
    xpBonus: 0.05,
    coinBonus: 0.05,
    bonuses: ['+5% XP gain', '+5% coin gain', 'Basic recipes available'],
  },
  {
    id: 'herb_garden',
    name: 'Herb Garden Atrium',
    description:
      'A sun-drenched glass atrium filled with rows of aromatic herbs and climbing spice vines. Bees buzz between basil flowers and rosemary bushes. The garden provides fresh ingredients directly to the forge and boosts all brewing and infusing recipes.',
    minLevel: 5,
    unlockCost: 200,
    xpBonus: 0.1,
    coinBonus: 0.08,
    bonuses: ['+10% XP gain', '+8% coin gain', 'Uncommon recipes unlocked'],
  },
  {
    id: 'smokehouse',
    name: 'The Smokehouse',
    description:
      'A weathered wooden building with smoke perpetually curling from its chimney. Inside, rows of hanging sausages, fish, and spice bundles absorb the rich flavors of applewood and hickory. The smoke here has a mystical quality that enhances all smoking recipes.',
    minLevel: 10,
    unlockCost: 600,
    xpBonus: 0.12,
    coinBonus: 0.15,
    bonuses: ['+12% XP gain', '+15% coin gain', 'Rare smoking recipes'],
  },
  {
    id: 'distillery',
    name: 'Alchemist\'s Distillery',
    description:
      'A laboratory-like chamber filled with gleaming copper stills, glass retorts, and crystalline collection vessels. Here, the volatile essences of spices are captured and concentrated into pure extracts, tinctures, and essential oils of extraordinary potency.',
    minLevel: 16,
    unlockCost: 1500,
    xpBonus: 0.15,
    coinBonus: 0.12,
    bonuses: ['+15% XP gain', '+12% coin gain', 'Distilling recipes available'],
  },
  {
    id: 'infusion_lab',
    name: 'Infusion Laboratory',
    description:
      'A pristine lab where vacuum chambers, ultrasonic baths, and centrifuges are used to force flavors deep into oils, butters, and liquids. The precision equipment here produces infusions of unmatched clarity and intensity, pushing the boundaries of flavor science.',
    minLevel: 22,
    unlockCost: 3500,
    xpBonus: 0.18,
    coinBonus: 0.18,
    bonuses: ['+18% XP gain', '+18% coin gain', 'Epic recipes unlocked'],
  },
  {
    id: 'crystal_pantry',
    name: 'Crystal Pantry',
    description:
      'A magical pantry where crystallization happens at an accelerated rate under enchanted conditions. Shelves of glowing spice crystals line the walls, each one a perfect geometric shape that refracts colored light across the room like a kaleidoscope.',
    minLevel: 28,
    unlockCost: 7000,
    xpBonus: 0.2,
    coinBonus: 0.22,
    bonuses: ['+20% XP gain', '+22% coin gain', 'Crystallizing mastery'],
  },
  {
    id: 'fermentation_cave',
    name: 'Subterranean Fermentation Cave',
    description:
      'A natural cave system beneath the forge where constant temperature and humidity create the perfect environment for fermentation. Ancient clay pots line the stalactite-covered walls, each one bubbling with a different living culture tended by generations of masters.',
    minLevel: 35,
    unlockCost: 14000,
    xpBonus: 0.22,
    coinBonus: 0.2,
    bonuses: ['+22% XP gain', '+20% coin gain', 'Advanced fermentation'],
  },
  {
    id: 'saffron_sanctum',
    name: 'The Saffron Sanctum',
    description:
      'The innermost heart of the forge, a sacred chamber bathed in golden light where the rarest and most powerful recipes are crafted. The walls are lined with saffron threads, and the air itself tastes of every spice ever discovered. Only true masters may enter.',
    minLevel: 42,
    unlockCost: 28000,
    xpBonus: 0.35,
    coinBonus: 0.35,
    bonuses: ['+35% XP gain', '+35% coin gain', 'Legendary recipe access', 'All schools enhanced'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: SF_SPICES — 30 Spice Ingredients
// ═══════════════════════════════════════════════════════════════════

export const SF_SPICES: readonly SFSpiceDef[] = [
  // Common (6)
  { id: 'sea_salt_flake', name: 'Sea Salt Flakes', description: 'Hand-harvested flakes from ancient salt pans, large crystalline structure that dissolves slowly on the tongue.', rarity: 'common', value: 3, source: 'herb_garden', flavor: 'salty, mineral, clean' },
  { id: 'black_peppercorn', name: 'Black Peppercorn', description: 'The king of spices. Dried unripe berries of the Piper nigrum vine, providing sharp heat and woody complexity.', rarity: 'common', value: 5, source: 'rustic_kitchen', flavor: 'sharp, woody, pungent' },
  { id: 'garlic_clove', name: 'Garlic Clove', description: 'Pungent, aromatic bulb fundamental to nearly every cuisine. Raw garlic is fiery; cooked garlic becomes sweet and nutty.', rarity: 'common', value: 4, source: 'herb_garden', flavor: 'pungent, savory, sweet when cooked' },
  { id: 'ginger_root', name: 'Fresh Ginger Root', description: 'Knobby rhizome with fiery flesh and citrusy notes. Essential in Asian cooking and a powerful anti-inflammatory ingredient.', rarity: 'common', value: 5, source: 'herb_garden', flavor: 'fiery, citrusy, warm' },
  { id: 'dried_chili', name: 'Dried Red Chili', description: 'Sun-dried chili peppers with concentrated heat and a deep, fruity flavor that develops during the drying process.', rarity: 'common', value: 4, source: 'smokehouse', flavor: 'hot, fruity, smoky' },
  { id: 'cumin_seed', name: 'Cumin Seed', description: 'Small oval seeds with an intensely warm, earthy flavor. Dry-toasting releases oils that transform their character completely.', rarity: 'common', value: 5, source: 'rustic_kitchen', flavor: 'earthy, warm, nutty' },

  // Uncommon (6)
  { id: 'turmeric_root', name: 'Turmeric Root', description: 'Brilliant orange rhizome with mild bitterness and a warm, peppery aroma. The source of golden color in curries and a powerful antioxidant.', rarity: 'uncommon', value: 20, source: 'herb_garden', flavor: 'earthy, bitter, warm, slightly mustardy' },
  { id: 'paprika_powder', name: 'Sweet Paprika Powder', description: 'Ground from dried sweet red peppers, this vibrant red powder adds color and a mild, sweet pepper flavor without significant heat.', rarity: 'uncommon', value: 18, source: 'smokehouse', flavor: 'sweet, mild pepper, fruity' },
  { id: 'cinnamon_stick', name: 'Cinnamon Stick', description: 'Rolled bark of the Cinnamomum tree. Ceylon cinnamon is delicate and complex; cassia cinnamon is bold and spicy. Both are essential.', rarity: 'uncommon', value: 22, source: 'distillery', flavor: 'sweet, warm, woody, spicy' },
  { id: 'basil_leaf', name: 'Fresh Basil Leaf', description: 'Aromatic herb with a sweet, slightly peppery flavor and a heady scent. Holy basil is more pungent; sweet basil is milder and versatile.', rarity: 'uncommon', value: 16, source: 'herb_garden', flavor: 'sweet, peppery, anise-like' },
  { id: 'honey_drops', name: 'Wildflower Honey Drops', description: 'Concentrated drops of pure wildflower honey, each containing the essence of thousands of flowers. Deeply floral and naturally sweet.', rarity: 'uncommon', value: 24, source: 'herb_garden', flavor: 'floral, sweet, complex' },
  { id: 'white_sugar', name: 'Crystal White Sugar', description: 'Refined sugar crystals that provide pure sweetness without color or flavor interference. Essential for crystallizing and candy-making.', rarity: 'uncommon', value: 12, source: 'crystal_pantry', flavor: 'pure sweet, clean' },

  // Rare (6)
  { id: 'cardamom_pod', name: 'Green Cardamom Pod', description: 'The queen of spices — small green pods containing intensely aromatic black seeds. Used in chai, desserts, and savory dishes across South Asia and the Middle East.', rarity: 'rare', value: 80, source: 'distillery', flavor: 'floral, citrusy, minty, spicy' },
  { id: 'star_anise', name: 'Star Anise', description: 'Star-shaped fruit of the Chinese evergreen tree with a strong licorice flavor. Essential in five-spice powder and pho broth, its flavor is both sweet and warming.', rarity: 'rare', value: 70, source: 'distillery', flavor: 'licorice, sweet, warm' },
  { id: 'vanilla_bean', name: 'Madagascar Vanilla Bean', description: 'The pod of a tropical orchid containing thousands of tiny fragrant seeds. Each bean takes 9 months to mature and develops complex flavor during curing.', rarity: 'rare', value: 100, source: 'crystal_pantry', flavor: 'sweet, floral, creamy, woody' },
  { id: 'clove_bud', name: 'Whole Clove Bud', description: 'Dried flower buds of the clove tree with an extraordinarily intense, warm, and sweet-spicy flavor. A few cloves go a very long way in any dish.', rarity: 'rare', value: 65, source: 'smokehouse', flavor: 'intensely sweet, warm, astringent' },
  { id: 'nutmeg_seed', name: 'Whole Nutmeg Seed', description: 'The hard seed of a tropical evergreen tree, prized since ancient times for its warm, sweet, and slightly nutty flavor. Freshly grated is infinitely superior to pre-ground.', rarity: 'rare', value: 75, source: 'crystal_pantry', flavor: 'warm, sweet, nutty, slightly bitter' },
  { id: 'sage_leaf', name: 'Fresh Sage Leaf', description: 'Silvery-green leaves with a robust, earthy flavor that pairs beautifully with rich meats and butter. A little goes a long way due to its strong aromatic oils.', rarity: 'rare', value: 55, source: 'herb_garden', flavor: 'earthy, savory, slightly peppery' },

  // Epic (6)
  { id: 'saffron_thread', name: 'Persian Saffron Thread', description: 'The most expensive spice in the world — hand-harvested stigmas of the Crocus sativus flower. It takes 150,000 flowers to produce one kilogram. Its flavor is impossible to replicate.', rarity: 'epic', value: 400, source: 'saffron_sanctum', flavor: 'floral, honeyed, earthy, metallic' },
  { id: 'ghost_pepper', name: 'Bhut Jolokia Ghost Pepper', description: 'Formerly the world\'s hottest pepper at over 1 million Scoville units. Its initial fruity sweetness gives way to devastating, building heat that can overwhelm the uninitiated.', rarity: 'epic', value: 350, source: 'smokehouse', flavor: 'fruity, smoky, extremely hot' },
  { id: 'rose_petal', name: 'Damask Rose Petal', description: 'Petals from the most fragrant variety of rose, used in Middle Eastern, Indian, and Persian cooking. Their delicate floral flavor is both romantic and surprisingly versatile.', rarity: 'epic', value: 300, source: 'infusion_lab', flavor: 'floral, sweet, perfumed' },
  { id: 'truffle_shaving', name: 'Black Winter Truffle Shaving', description: 'Paper-thin slices of black Périgord truffle harvested from oak roots in France. Its earthy, musky, and deeply savory aroma is one of the most sought-after flavors in haute cuisine.', rarity: 'epic', value: 500, source: 'infusion_lab', flavor: 'earthy, musky, garlicky, savory' },
  { id: 'korean_chili_flake', name: 'Gochugaru Korean Chili Flake', description: 'Sun-dried Korean red pepper flakes with moderate heat and a vibrant red color. Their slightly sweet, smoky flavor is essential for authentic kimchi and Korean cooking.', rarity: 'epic', value: 280, source: 'fermentation_cave', flavor: 'moderately hot, sweet, smoky, fruity' },
  { id: 'habanero_pepper', name: 'Orange Habanero Pepper', description: 'A small but extremely hot pepper with fruity, citrusy notes beneath the intense heat. Its distinctive floral aroma sets it apart from other hot peppers and makes it prized in Caribbean cuisine.', rarity: 'epic', value: 320, source: 'smokehouse', flavor: 'extremely hot, citrusy, fruity, floral' },

  // Legendary (6)
  { id: 'ember_flower', name: 'Ember Flower Extract', description: 'A mythical flower that blooms only in volcanic soil near active geysers. Its petals glow with internal heat and taste of liquid fire tempered with honey. Said to enhance any recipe with elemental fire energy.', rarity: 'legendary', value: 5000, source: 'saffron_sanctum', flavor: 'liquid fire, honeyed, elemental' },
  { id: 'phoenix_grass', name: 'Phoenix Feather Grass', description: 'A rare grass that grows only where phoenix feathers have fallen to earth. It burns without being consumed, releasing an aromatic smoke that grants enhanced culinary creativity to anyone who inhales it.', rarity: 'legendary', value: 5500, source: 'saffron_sanctum', flavor: 'smoky, ethereal, inspirational' },
  { id: 'ambergris_dust', name: 'Golden Ambergris Dust', description: 'An extremely rare substance produced in the digestive system of sperm whales, valued in perfumery and ultra-premium cooking. Its flavor is indescribably complex — oceanic, animalic, and sublimely sweet.', rarity: 'legendary', value: 8000, source: 'saffron_sanctum', flavor: 'oceanic, sweet, animalic, transcendent' },
  { id: 'transmutation_powder', name: 'Alchemist\'s Transmutation Powder', description: 'A legendary crystalline powder of unknown origin that is said to have the power to transform the flavor of any dish into something entirely new and unexpected. Its existence is debated among master chefs.', rarity: 'legendary', value: 7000, source: 'saffron_sanctum', flavor: 'undefined, transformative, mysterious' },
  { id: 'lotus_extract', name: 'Sacred Blue Lotus Extract', description: 'An extract from the sacred blue lotus flower of ancient Egypt, used in rituals and elite cuisine. Its flavor is simultaneously cooling and warming, with notes of blueberry and white tea.', rarity: 'legendary', value: 6500, source: 'saffron_sanctum', flavor: 'cooling, warming, blueberry, white tea' },
  { id: 'ginseng_root', name: 'Millennium Wild Ginseng Root', description: 'A wild ginseng root estimated to be over 1,000 years old, discovered in the mountains of Korean DMZ. Its ginsenoside content is hundreds of times that of cultivated ginseng, granting extraordinary vitality.', rarity: 'legendary', value: 9000, source: 'fermentation_cave', flavor: 'bitter, sweet, earthy, vital' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: SF_STRUCTURES — 25 Forge Structures
// ═══════════════════════════════════════════════════════════════════

export const SF_STRUCTURES: readonly SFStructureDef[] = [
  // Baking Structures (5)
  { id: 'brick_oven', name: 'Traditional Brick Oven', description: 'A wood-fired brick oven that reaches 500°C, perfect for artisan breads and pizzas with crispy charred crusts.', category: 'Baking', baseCost: 80, costMultiplier: 1.4, maxLevel: 10, bonusPerLevel: 3 },
  { id: 'stone_cauldron', name: 'Stone Mixing Cauldron', description: 'A massive granite cauldron for mixing large batches of dough. The stone retains temperature for consistent proofing.', category: 'Baking', baseCost: 150, costMultiplier: 1.5, maxLevel: 10, bonusPerLevel: 4 },
  { id: 'marble_counter', name: 'Cool Marble Countertop', description: 'A large slab of Italian marble that stays naturally cool, ideal for working temperature-sensitive pastry and chocolate.', category: 'Baking', baseCost: 200, costMultiplier: 1.4, maxLevel: 10, bonusPerLevel: 2 },
  { id: 'saffron_press', name: 'Saffron Thread Press', description: 'A precision tool for extracting maximum color and flavor from saffron threads before incorporating into dough.', category: 'Baking', baseCost: 1200, costMultiplier: 1.7, maxLevel: 10, bonusPerLevel: 8 },
  { id: 'tandoor_pit', name: 'Clay Tandoor Pit', description: 'A traditional clay oven pit used for baking naan, tandoori meats, and smoky flatbreads at extreme temperatures.', category: 'Baking', baseCost: 600, costMultiplier: 1.6, maxLevel: 10, bonusPerLevel: 6 },

  // Brewing Structures (4)
  { id: 'copper_still', name: 'Copper Distillation Still', description: 'A gleaming copper pot still for distilling essential oils and spirits. Copper reacts with sulfur compounds to produce cleaner distillates.', category: 'Brewing', baseCost: 300, costMultiplier: 1.5, maxLevel: 10, bonusPerLevel: 5 },
  { id: 'glass_infuser', name: 'Precision Glass Infuser', description: 'A borosilicate glass vessel with temperature control for crafting delicate infusions without flavor loss.', category: 'Brewing', baseCost: 250, costMultiplier: 1.5, maxLevel: 10, bonusPerLevel: 4 },
  { id: 'silver_whisk', name: 'Enchanted Silver Whisk', description: 'A perfectly balanced silver whisk said to incorporate air more efficiently than any other tool. Whipped cream reaches peak stiffness in seconds.', category: 'Brewing', baseCost: 500, costMultiplier: 1.6, maxLevel: 10, bonusPerLevel: 5 },
  { id: 'wok_station', name: 'High-Heat Wok Station', description: 'A specialized burner system that delivers intense, concentrated heat to a carbon steel wok for authentic stir-frying and flash-brewing.', category: 'Brewing', baseCost: 400, costMultiplier: 1.5, maxLevel: 10, bonusPerLevel: 5 },

  // Smoking Structures (4)
  { id: 'oak_smoker', name: 'Old Oak Smokehouse', description: 'A seasoned oak smokehouse with adjustable dampers for precise smoke density and temperature control over days of smoking.', category: 'Smoking', baseCost: 350, costMultiplier: 1.5, maxLevel: 10, bonusPerLevel: 6 },
  { id: 'iron_grate', name: 'Wrought Iron Smoking Grate', description: 'A heavy-duty iron grate system that allows multiple levels of smoking simultaneously, from cold smoke to hot smoking.', category: 'Smoking', baseCost: 200, costMultiplier: 1.4, maxLevel: 10, bonusPerLevel: 3 },
  { id: 'pepper_mill', name: 'Giant Stone Pepper Mill', description: 'A massive stone mill for grinding smoked peppers and spices to precise consistencies from coarse to super-fine.', category: 'Smoking', baseCost: 280, costMultiplier: 1.5, maxLevel: 10, bonusPerLevel: 4 },
  { id: 'cinnamon_roller', name: 'Cinnamon Bark Roller', description: 'A specialized tool for rolling and shaping cinnamon bark into perfect quills. Produces uniformly tight rolls for even smoking.', category: 'Smoking', baseCost: 450, costMultiplier: 1.6, maxLevel: 10, bonusPerLevel: 5 },

  // Crystallizing Structures (4)
  { id: 'quartz_crystalizer', name: 'Quartz Crystal Growth Chamber', description: 'A temperature-controlled chamber lined with natural quartz that accelerates sugar crystal formation under optimal conditions.', category: 'Crystallizing', baseCost: 500, costMultiplier: 1.6, maxLevel: 10, bonusPerLevel: 7 },
  { id: 'gold_scale', name: 'Precision Gold Analytical Scale', description: 'A precision weighing scale accurate to 0.001 grams. Essential for measuring rare spices in crystalline recipes where ratios must be exact.', category: 'Crystallizing', baseCost: 350, costMultiplier: 1.5, maxLevel: 10, bonusPerLevel: 6 },
  { id: 'vanilla_extractor', name: 'Vacuum Vanilla Extractor', description: 'A vacuum-sealed extraction system that pulls maximum flavor from vanilla beans in a fraction of the traditional steeping time.', category: 'Crystallizing', baseCost: 800, costMultiplier: 1.7, maxLevel: 10, bonusPerLevel: 7 },
  { id: 'fondue_fountain', name: 'Crystal Fondue Fountain', description: 'A tiered crystal fountain that maintains chocolate and sugar mixtures at perfect viscosity for crystallization experiments.', category: 'Crystallizing', baseCost: 300, costMultiplier: 1.5, maxLevel: 10, bonusPerLevel: 4 },

  // Fermenting Structures (4)
  { id: 'clay_fermenter', name: 'Traditional Clay Fermentation Pot', description: 'An unglazed clay onggi pot that breathes, allowing beneficial bacteria to thrive while keeping contaminants out. Essential for authentic ferments.', category: 'Fermenting', baseCost: 150, costMultiplier: 1.4, maxLevel: 10, bonusPerLevel: 3 },
  { id: 'bronze_mortar', name: 'Bronze Mortar and Pestle', description: 'A heavy bronze mortar for grinding spices and pastes with the perfect amount of friction. Bronze adds trace minerals that enhance fermentation.', category: 'Fermenting', baseCost: 220, costMultiplier: 1.5, maxLevel: 10, bonusPerLevel: 4 },
  { id: 'spice_rack', name: 'Wall-Mounted Spice Rack', description: 'An organized rack holding 48 spice jars at arm\'s reach, each labeled and dated for freshness. Speeds up all crafting operations significantly.', category: 'Fermenting', baseCost: 100, costMultiplier: 1.4, maxLevel: 10, bonusPerLevel: 2 },
  { id: 'syrup_cauldron', name: 'Enchanted Syrup Cauldron', description: 'A self-stirring cauldron that maintains syrup and sauce reductions at precise temperatures without burning. Never needs manual stirring.', category: 'Fermenting', baseCost: 350, costMultiplier: 1.5, maxLevel: 10, bonusPerLevel: 3 },

  // Utility Structures (4)
  { id: 'herb_dryer', name: 'Solar Herb Dehydrator', description: 'A solar-powered dehydrator that preserves herbs and spices at optimal moisture levels, extending shelf life by months.', category: 'Utility', baseCost: 120, costMultiplier: 1.4, maxLevel: 10, bonusPerLevel: 3 },
  { id: 'salt_cellar', name: 'Himalayan Salt Cellar', description: 'A cellar carved from a single block of pink Himalayan salt. Storing spices near it enhances their natural flavors and provides trace minerals.', category: 'Utility', baseCost: 90, costMultiplier: 1.4, maxLevel: 10, bonusPerLevel: 2 },
  { id: 'basil_pistol', name: 'Basil Oil Atomizer', description: 'A precision atomizer that disperses basil-infused oil in micro-droplets, creating instant flavor coatings on dishes.', category: 'Utility', baseCost: 180, costMultiplier: 1.5, maxLevel: 10, bonusPerLevel: 3 },
  { id: 'cumin_grinder', name: 'Electric Cumin Grinder', description: 'A high-speed electric grinder that produces perfectly uniform cumin powder in seconds, preserving volatile oils that manual grinding loses.', category: 'Utility', baseCost: 140, costMultiplier: 1.4, maxLevel: 10, bonusPerLevel: 4 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: SF_ABILITIES — 22 Cooking Abilities
// ═══════════════════════════════════════════════════════════════════

export const SF_ABILITIES: readonly SFAbilityDef[] = [
  { id: 'flame_control', name: 'Flame Control', description: 'Master the heat of any flame, adjusting temperature with perfect precision for any recipe requirement.', cooldown: 30, power: 10, school: 'Baking' },
  { id: 'spice_blending', name: 'Spice Blending Mastery', description: 'Intuitively combine any spices into harmonious blends that enhance each other\'s flavors without clashing.', cooldown: 45, power: 15, school: 'Infusing' },
  { id: 'temperature_mastery', name: 'Temperature Mastery', description: 'Sense the exact temperature of any surface, liquid, or gas by touch alone, enabling perfect cooking conditions.', cooldown: 20, power: 8, school: 'Baking' },
  { id: 'rapid_proofing', name: 'Rapid Proofing', description: 'Accelerate dough fermentation and proofing by channeling warmth, reducing proofing time by up to 75%.', cooldown: 60, power: 20, school: 'Baking' },
  { id: 'essence_extraction', name: 'Essence Extraction', description: 'Extract the pure essence from any spice, capturing its full flavor profile in a concentrated form.', cooldown: 50, power: 18, school: 'Distilling' },
  { id: 'smoke_weaving', name: 'Smoke Weaving', description: 'Control the density, direction, and flavor of smoke with hand gestures, creating perfect smoking conditions.', cooldown: 40, power: 14, school: 'Smoking' },
  { id: 'crystal_growth', name: 'Crystal Growth Acceleration', description: 'Speed up the crystallization process of sugars and salts, producing perfect crystals in a fraction of the normal time.', cooldown: 55, power: 22, school: 'Crystallizing' },
  { id: 'fermentation_sense', name: 'Fermentation Intuition', description: 'Sense the state of any fermentation by smell and sound, knowing exactly when a culture is at its peak.', cooldown: 35, power: 12, school: 'Fermenting' },
  { id: 'golden_touch', name: 'The Golden Touch', description: 'Any food you touch briefly with saffron-stained fingers gains enhanced flavor and a beautiful golden sheen.', cooldown: 120, power: 30, school: 'Baking' },
  { id: 'aroma_recall', name: 'Aroma Perfect Recall', description: 'Remember any scent you have ever encountered with perfect clarity, enabling exact reproduction of any flavor combination.', cooldown: 90, power: 25, school: 'Infusing' },
  { id: 'heat_shield', name: 'Heat Shield Palms', description: 'Your hands become immune to heat up to 500°C, allowing you to handle hot pans, coals, and molten sugar directly.', cooldown: 25, power: 8, school: 'Baking' },
  { id: 'vacuum_seal', name: 'Instant Vacuum Seal', description: 'Create a perfect vacuum around any container with a touch, instantly preserving freshness and accelerating infusions.', cooldown: 40, power: 15, school: 'Infusing' },
  { id: 'distill_twice', name: 'Double Distillation', description: 'Perform two distillation passes in a single step, producing extracts of exceptional purity and concentration.', cooldown: 70, power: 28, school: 'Distilling' },
  { id: 'cold_smoke', name: 'Cold Smoke Command', description: 'Generate smoke at exactly room temperature, allowing cold-smoking of delicate ingredients without cooking them.', cooldown: 45, power: 16, school: 'Smoking' },
  { id: 'sugar_glass', name: 'Sugar Glass Formation', description: 'Transform any sugar into perfect transparent glass that is edible, decorative, and shatters dramatically on impact.', cooldown: 50, power: 18, school: 'Crystallizing' },
  { id: 'wild_culture', name: 'Wild Culture Taming', description: 'Attract and domesticate wild fermentation cultures from the environment, creating unique and novel flavor profiles.', cooldown: 80, power: 24, school: 'Fermenting' },
  { id: 'spice_radar', name: 'Spice Detection Sense', description: 'Detect the presence, quality, and potency of any spice within 50 meters, even through walls and containers.', cooldown: 15, power: 6, school: 'Infusing' },
  { id: 'caramel_flash', name: 'Caramel Flash Point', description: 'Achieve perfect caramelization of any sugar in seconds by knowing and hitting the exact flash point every time.', cooldown: 35, power: 14, school: 'Crystallizing' },
  { id: 'brew_mastery', name: 'Master Brewer\'s Intuition', description: 'Know exactly how any combination of ingredients will taste before brewing, preventing failed experiments.', cooldown: 60, power: 20, school: 'Brewing' },
  { id: 'ember_breath', name: 'Ember Breath Technique', description: 'Exhale a controlled stream of superheated air that can ignite grills, light smokers, or caramelize sugar surfaces instantly.', cooldown: 30, power: 12, school: 'Smoking' },
  { id: 'culture_symbiosis', name: 'Culture Symbiosis', description: 'Merge two different fermentation cultures into a hybrid that possesses the best qualities of both parent cultures.', cooldown: 100, power: 32, school: 'Fermenting' },
  { id: 'saffron_bloom', name: 'Saffron Bloom', description: 'Release a cloud of golden saffron essence that enhances the flavor of every dish in a 10-meter radius for 5 minutes.', cooldown: 180, power: 40, school: 'Brewing' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: SF_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const SF_ACHIEVEMENTS: readonly SFAchievementDef[] = [
  { id: 'sf_ach_first_recipe', name: 'First Flame', description: 'Learn your very first saffron recipe in the forge.', condition: 'learn 1 recipe', reward: '+50 XP, +30 coins' },
  { id: 'sf_ach_spice_collector', name: 'Spice Collector', description: 'Collect 10 different types of spices for your pantry.', condition: 'collect 10 unique spices', reward: '+100 XP, +80 coins' },
  { id: 'sf_ach_five_recipes', name: 'Apprentice Cook', description: 'Learn 5 recipes from any cuisine school.', condition: 'learn 5 recipes', reward: '+150 XP, +100 coins' },
  { id: 'sf_ach_first_blend', name: 'First Fusion', description: 'Successfully craft your first legendary spice blend.', condition: 'craft 1 blend', reward: '+200 XP, +150 coins' },
  { id: 'sf_ach_chamber_unlock', name: 'Door Opener', description: 'Unlock your second forge chamber beyond the Rustic Kitchen.', condition: 'unlock 1 extra chamber', reward: '+120 XP, +90 coins' },
  { id: 'sf_ach_structure_builder', name: 'Builder\'s Hands', description: 'Build and upgrade your first structure to level 5.', condition: 'upgrade 1 structure to level 5', reward: '+250 XP, +200 coins' },
  { id: 'sf_ach_rare_recipe', name: 'Rare Discovery', description: 'Learn a rare recipe from any cuisine school.', condition: 'learn 1 rare recipe', reward: '+180 XP, +130 coins' },
  { id: 'sf_ach_epic_recipe', name: 'Epic Creation', description: 'Master an epic recipe that requires exceptional skill.', condition: 'learn 1 epic recipe', reward: '+300 XP, +250 coins' },
  { id: 'sf_ach_all_schools', name: 'Seven-School Scholar', description: 'Learn at least one recipe from every cuisine school.', condition: 'learn recipe from each school', reward: '+500 XP, +400 coins' },
  { id: 'sf_ach_ten_recipes', name: 'Recipe Master', description: 'Amass a collection of 10 learned recipes.', condition: 'learn 10 recipes', reward: '+300 XP, +220 coins' },
  { id: 'sf_ach_legendary_recipe', name: 'Legend of the Forge', description: 'Learn a legendary recipe — the pinnacle of culinary achievement.', condition: 'learn 1 legendary recipe', reward: '+800 XP, +600 coins' },
  { id: 'sf_ach_spice_hoarder', name: 'Spice Hoarder', description: 'Accumulate over 500 total spice units in your collection.', condition: 'collect 500 total spices', reward: '+350 XP, +280 coins' },
  { id: 'sf_ach_blend_master', name: 'Blend Artisan', description: 'Craft 5 different legendary spice blends.', condition: 'craft 5 blends', reward: '+600 XP, +500 coins' },
  { id: 'sf_ach_level_25', name: 'Forge Veteran', description: 'Reach forge level 25 through dedication and practice.', condition: 'reach level 25', reward: '+1000 XP, +800 coins' },
  { id: 'sf_ach_event_survivor', name: 'Event Survivor', description: 'Successfully endure 5 forge events without losing progress.', condition: 'survive 5 events', reward: '+400 XP, +300 coins' },
  { id: 'sf_ach_craft_50', name: 'Production Line', description: 'Craft a total of 50 recipes across all schools.', condition: 'craft 50 total recipes', reward: '+500 XP, +400 coins' },
  { id: 'sf_ach_max_structure', name: 'Ultimate Upgrade', description: 'Upgrade any single structure to its maximum level of 10.', condition: 'upgrade structure to level 10', reward: '+1200 XP, +1000 coins' },
  { id: 'sf_ach_forge_level_50', name: 'Saffron Archmage', description: 'Reach the maximum forge level of 50 and claim the title of Saffron Archmage.', condition: 'reach level 50', reward: '+5000 XP, +5000 coins, legendary title' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: SF_TITLES — 8 Forge Titles
// ═══════════════════════════════════════════════════════════════════

export const SF_TITLES: readonly SFTitleDef[] = [
  { id: 'sf_title_novice', name: 'Spice Novice', description: 'A beginner who has just started their journey into the world of spices and flavors. Every great chef starts here.', requiredLevel: 1, requiredRecipes: 0 },
  { id: 'sf_title_apprentice', name: 'Saffron Apprentice', description: 'An eager learner who has grasped the basics and is ready to explore the seven schools of the forge.', requiredLevel: 5, requiredRecipes: 3 },
  { id: 'sf_title_journeyman', name: 'Journeyman Forger', description: 'A skilled cook who can handle uncommon recipes and maintain a small spice collection with confidence.', requiredLevel: 12, requiredRecipes: 8 },
  { id: 'sf_title_artisan', name: 'Artisan Flavorist', description: 'A respected craftsperson whose rare recipes and spice blends are sought after by food enthusiasts.', requiredLevel: 20, requiredRecipes: 15 },
  { id: 'sf_title_expert', name: 'Forge Expert', description: 'An expert in multiple schools who commands respect across the culinary world for their innovative techniques.', requiredLevel: 28, requiredRecipes: 22 },
  { id: 'sf_title_master', name: 'Saffron Master', description: 'A master of the forge who has unlocked epic recipes and crafted legendary blends that inspire awe.', requiredLevel: 36, requiredRecipes: 30 },
  { id: 'sf_title_grandmaster', name: 'Grand Spice Alchemist', description: 'A grandmaster whose name is spoken alongside the legendary spice masters of history. Their creations transcend ordinary cooking.', requiredLevel: 44, requiredRecipes: 34 },
  { id: 'sf_title_archmage', name: 'Saffron Archmage', description: 'The pinnacle of achievement — a being of pure culinary magic who has mastered every school, every spice, every recipe, and every secret of the forge.', requiredLevel: 50, requiredRecipes: 35 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: SF_BLENDS — 15 Legendary Spice Blends
// ═══════════════════════════════════════════════════════════════════

export const SF_BLENDS: readonly SFBlendDef[] = [
  {
    id: 'blend_ras_el_hanout',
    name: 'Ras el Hanout',
    description: 'The legendary "head of the shop" blend from Moroccan markets, containing the seller\'s finest spices.',
    lore: 'In the souks of Marrakech, each spice merchant guards their own ras el hanout recipe as a family secret. The best blends contain up to 30 ingredients and are said to have aphrodisiac properties.',
    rarity: 'rare',
    powerBonus: 15,
    componentSpices: ['cinnamon_stick', 'cumin_seed', 'cardamom_pod', 'clove_bud', 'ginger_root'],
  },
  {
    id: 'blend_garam_masala',
    name: 'Garam Masala',
    description: 'A warm, aromatic Indian spice blend meaning "hot spice mix" — the soul of Indian cuisine.',
    lore: 'Every Indian family has their own garam masala recipe passed down through generations. Grandmothers teach their grandchildren to roast and grind it by hand, believing machine-ground spices lose their soul.',
    rarity: 'rare',
    powerBonus: 15,
    componentSpices: ['cinnamon_stick', 'cardamom_pod', 'clove_bud', 'black_peppercorn', 'cumin_seed'],
  },
  {
    id: 'blend_chinese_five_spice',
    name: 'Five-Spice Powder',
    description: 'A balanced Chinese blend incorporating all five fundamental flavors: sweet, sour, bitter, pungent, and salty.',
    lore: 'Chinese philosophy holds that food should balance all five flavors. This blend, used since the Han Dynasty (206 BCE), represents that balance in a single powder, making it perhaps the oldest intentionally crafted spice blend.',
    rarity: 'uncommon',
    powerBonus: 12,
    componentSpices: ['star_anise', 'cinnamon_stick', 'clove_bud', 'fennel_seed', 'ginger_root'],
  },
  {
    id: 'blend_berbere',
    name: 'Berbere Spice Mix',
    description: 'The fiery, complex Ethiopian chili blend that forms the foundation of Ethiopian cuisine.',
    lore: 'Berbere has been the defining spice of Ethiopian cooking for over a thousand years. Legend says it was first created by a monk who ground together every spice he could find while fasting, creating something divine from simplicity.',
    rarity: 'uncommon',
    powerBonus: 12,
    componentSpices: ['paprika_powder', 'dried_chili', 'ginger_root', 'cinnamon_stick', 'cumin_seed'],
  },
  {
    id: 'blend_chimichurri',
    name: 'Chimichurri Blend',
    description: 'An Argentine herb and spice blend that is the essential companion to grilled meats across South America.',
    lore: 'Gaucho cowboys carried chimichurri in leather pouches on horseback, believing the herbs kept them healthy on the plains. The blend became a symbol of Argentine identity and is now served at every asado.',
    rarity: 'common',
    powerBonus: 8,
    componentSpices: ['garlic_clove', 'basil_leaf', 'dried_chili', 'cumin_seed', 'sea_salt_flake'],
  },
  {
    id: 'blend_zaatar',
    name: 'Za\'atar Blend',
    description: 'A Middle Eastern blend of wild thyme, sumac, sesame, and salt with an ancient heritage.',
    lore: 'Archaeologists found traces of za\'atar in the tombs of Egyptian pharaohs. The blend was so valued in antiquity that it was used as currency. Today, it remains a symbol of Palestinian cultural identity.',
    rarity: 'common',
    powerBonus: 8,
    componentSpices: ['sea_salt_flake', 'cumin_seed', 'ginger_root', 'white_sugar', 'basil_leaf'],
  },
  {
    id: 'blend_dukkah',
    name: 'Dukkah',
    description: 'An Egyptian nut and spice blend traditionally served with bread and olive oil as a starter.',
    lore: 'The word "dukkah" comes from the Arabic "to pound" — referring to the traditional method of crushing the blend in a mortar. Egyptian street vendors sell it fresh daily, each claiming theirs is the original recipe from the time of the pharaohs.',
    rarity: 'uncommon',
    powerBonus: 12,
    componentSpices: ['cumin_seed', 'black_peppercorn', 'cinnamon_stick', 'sea_salt_flake', 'ginger_root'],
  },
  {
    id: 'blend_tandoori_masala',
    name: 'Tandoori Masala',
    description: 'A vibrant red-orange Indian marinade blend that gives tandoori dishes their signature color and smoky flavor.',
    lore: 'The tandoor oven was invented in ancient Punjab over 5,000 years ago. The masala blend was developed to complement the unique smoky, high-heat cooking environment, creating a flavor that cannot be replicated any other way.',
    rarity: 'uncommon',
    powerBonus: 12,
    componentSpices: ['paprika_powder', 'dried_chili', 'ginger_root', 'garlic_clove', 'cumin_seed'],
  },
  {
    id: 'blend_quatre_epices',
    name: 'Quatre Épices',
    description: 'A classic French four-spice blend used in charcuterie, terrines, and traditional French cuisine.',
    lore: 'Developed in medieval French monasteries, quatre épices was originally used to preserve meats before refrigeration. Monks discovered that the specific combination of four spices had antibacterial properties far exceeding the sum of their parts.',
    rarity: 'common',
    powerBonus: 8,
    componentSpices: ['black_peppercorn', 'cinnamon_stick', 'clove_bud', 'nutmeg_seed'],
  },
  {
    id: 'blend_saffron_elixir',
    name: 'Saffron Phoenix Elixir',
    description: 'A legendary blend centered on saffron that is said to grant culinary enlightenment.',
    lore: 'Created by the mythical Persian alchemist Ziryab in the 9th century, this blend was said to be so perfect that anyone who tasted it could identify every ingredient in any dish. The original recipe was lost for 500 years before being rediscovered in a forgotten Baghdad library.',
    rarity: 'epic',
    powerBonus: 25,
    componentSpices: ['saffron_thread', 'cardamom_pod', 'rose_petal', 'vanilla_bean'],
  },
  {
    id: 'blend_volcano_powder',
    name: 'Volcano Powder',
    description: 'An extreme heat blend combining the world\'s hottest peppers with ancient volcanic spices.',
    lore: 'Legend tells of a Mayan spice priest who threw the hottest peppers into an active volcano as an offering. The resulting ash-coated peppers were gathered and ground into the first volcano powder, a blend so hot it was only used in ritual ceremonies.',
    rarity: 'epic',
    powerBonus: 25,
    componentSpices: ['ghost_pepper', 'habanero_pepper', 'paprika_powder', 'cumin_seed'],
  },
  {
    id: 'blend_immortal_tea',
    name: 'Immortal\'s Tea Blend',
    description: 'A transcendent tea blend combining legendary ingredients said to grant longevity and clarity.',
    lore: 'Chinese emperor Qin Shi Huang sought this blend obsessively as part of his quest for immortality. The recipe was eventually assembled by a Taoist monk who lived to be 256 years old (according to legend). Each ingredient was gathered from a different sacred mountain.',
    rarity: 'epic',
    powerBonus: 25,
    componentSpices: ['ginseng_root', 'lotus_extract', 'star_anise', 'ginger_root'],
  },
  {
    id: 'blend_ambrosia_spice',
    name: 'Ambrosia Spice Mix',
    description: 'The food of the gods, recreated in spice form. Said to taste of sunlight and honey.',
    lore: 'In Greek mythology, ambrosia was the food that gave the gods their immortality. This modern recreation attempts to capture that divine essence using saffron, vanilla, and rose — the most precious gifts of the plant kingdom.',
    rarity: 'legendary',
    powerBonus: 40,
    componentSpices: ['saffron_thread', 'vanilla_bean', 'rose_petal', 'honey_drops', 'ambergris_dust'],
  },
  {
    id: 'blend_nirvana_masala',
    name: 'Nirvana Masala',
    description: 'A blend of such complexity and harmony that tasting it is said to induce a state of culinary enlightenment.',
    lore: 'Buddhist monks in the Himalayan monasteries of Ladakh developed this blend over centuries of meditation and experimentation. It is said to contain the essence of all five elements — earth, water, fire, air, and ether — in perfect balance.',
    rarity: 'legendary',
    powerBonus: 40,
    componentSpices: ['saffron_thread', 'cardamom_pod', 'cinnamon_stick', 'clove_bud', 'ginseng_root'],
  },
  {
    id: 'blend_cosmic_dust',
    name: 'Cosmic Dust',
    description: 'The rarest blend in existence, made from ingredients that defy ordinary classification.',
    lore: 'No one knows who first created Cosmic Dust, but it appears in records from every ancient civilization simultaneously — Egyptian, Chinese, Mayan, and Indian texts all describe an identical blend with the same impossible ingredients. Some believe it was not created by humans at all.',
    rarity: 'legendary',
    powerBonus: 50,
    componentSpices: ['saffron_thread', 'ember_flower', 'phoenix_grass', 'transmutation_powder', 'lotus_extract'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: SF_EVENTS — 12 Forge Events
// ═══════════════════════════════════════════════════════════════════

export const SF_EVENTS: readonly SFEventDef[] = [
  {
    id: 'sf_evt_spice_blight',
    name: 'Spice Blight',
    description: 'A mysterious blight sweeps through the herb garden, destroying common spices. Uncommon and rarer spices are unaffected but their collection rate drops temporarily.',
    severity: 3,
    duration: 300,
    effects: ['-50% common spice drops', '+20% rare spice chance'],
  },
  {
    id: 'sf_evt_merchant_caravan',
    name: 'Merchant Caravan Arrival',
    description: 'A caravan of exotic spice traders arrives at the forge, offering rare and epic spices at discounted prices for a limited time.',
    severity: 1,
    duration: 600,
    effects: ['-30% uncommon spice cost', '-20% rare spice cost', 'Exclusive epic spice available'],
  },
  {
    id: 'sf_evt_flavor_competition',
    name: 'Grand Flavor Competition',
    description: 'A prestigious culinary competition opens at the forge. Crafting recipes during this event grants double XP and bonus coins based on recipe difficulty.',
    severity: 1,
    duration: 900,
    effects: ['+100% recipe XP', '+50% coin bonus', 'Leaderboard ranking'],
  },
  {
    id: 'sf_evt_volcanic_eruption',
    name: 'Volcanic Heat Surge',
    description: 'The forge\'s volcanic heat source surges unexpectedly, dramatically increasing the temperature of all ovens and smokers. Baking and smoking recipes are significantly boosted.',
    severity: 2,
    duration: 480,
    effects: ['+50% baking speed', '+50% smoking quality', '-30% crystallizing precision'],
  },
  {
    id: 'sf_evt_monsoon_season',
    name: 'Monsoon Season',
    description: 'Heavy rains flood the herb garden but create ideal fermentation conditions. Fermenting recipes are enhanced while herb-based recipes suffer.',
    severity: 2,
    duration: 720,
    effects: ['+40% fermentation speed', '-30% herb gathering', '+25% kefir quality'],
  },
  {
    id: 'sf_evt_saffron_bloom',
    name: 'Saffron Bloom Festival',
    description: 'The saffron crocuses bloom in extraordinary abundance! A rare event that makes saffron recipes temporarily more rewarding and accessible.',
    severity: 1,
    duration: 360,
    effects: ['+200% saffron drops', '-50% saffron recipe cost', 'Saffron blend bonus'],
  },
  {
    id: 'sf_evt_ghost_pepper_rain',
    name: 'Ghost Pepper Rain',
    description: 'Ghost peppers fall from the sky in a bizarre meteorological event! The forge is inundated with hot peppers, making spicy recipes easier but everything else more challenging.',
    severity: 3,
    duration: 300,
    effects: ['+300% ghost pepper drops', '+100% heat in all recipes', '-20% other spice drops'],
  },
  {
    id: 'sf_evt_ancient_recipe_discovery',
    name: 'Ancient Recipe Unearthed',
    description: 'Archaeologists discover a clay tablet containing an ancient recipe in the forge\'s foundations. Learning it grants a permanent XP bonus to all recipes of that school.',
    severity: 1,
    duration: 1200,
    effects: ['Unlock hidden recipe', '+10% permanent XP in one school'],
  },
  {
    id: 'sf_evt_crystal_resonance',
    name: 'Crystal Resonance',
    description: 'The crystal pantry enters a state of harmonic resonance, accelerating all crystallization processes to supernatural speeds. Perfect crystals form in minutes instead of hours.',
    severity: 1,
    duration: 420,
    effects: ['+200% crystallizing speed', '+50% crystal quality', 'Rare crystal patterns unlock'],
  },
  {
    id: 'sf_evt_wild_ferment',
    name: 'Wild Fermentation Wave',
    description: 'Beneficial wild bacteria and yeast fill the air throughout the forge, supercharging all fermentation processes. Every pot, jar, and barrel begins bubbling with new life.',
    severity: 1,
    duration: 540,
    effects: ['+100% fermentation speed', 'Unique fermentation cultures appear', '+30% fermenting quality'],
  },
  {
    id: 'sf_evt_smoke_signal',
    name: 'Mystic Smoke Signal',
    description: 'Strange colored smoke rises from the smokehouse, carrying flavors from distant lands. Each puff reveals a temporary recipe modification that can create unique dishes.',
    severity: 2,
    duration: 600,
    effects: ['Temporary exotic recipes available', '+40% smoking recipes', 'Mystery flavor unlocks'],
  },
  {
    id: 'sf_evt_saffron_solar_eclipse',
    name: 'Saffron Solar Eclipse',
    description: 'A total solar eclipse turns the sky golden, and the saffron in the sanctum begins to glow with otherworldly light. All saffron-based recipes gain incredible power for a brief window.',
    severity: 4,
    duration: 180,
    effects: ['+500% saffron recipe power', 'Legendary recipes temporarily craftable', 'All blends gain +25% power'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const useSFStore = create<SFFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      learnedRecipes: [] as string[],
      collectedSpices: {} as Record<string, number>,
      craftedBlends: [] as string[],
      builtChambers: ['rustic_kitchen'] as string[],
      structures: {} as Record<string, number>,
      unlockedAbilities: [] as string[],
      achievements: [] as string[],
      currentTitle: 'sf_title_novice',
      forgeLevel: 1,
      forgeExp: 0,
      forgeCoins: SF_INITIAL_COINS,
      totalXpEarned: 0,
      totalCoinsEarned: 0,
      totalRecipesCrafted: 0,
      totalBlendsCrafted: 0,
      totalSpicesCollected: 0,
      totalStructuresUpgraded: 0,
      activeEventId: null as string | null,
      eventTimer: 0,
      activeChamber: 'rustic_kitchen',

      // ── sfLearnRecipe ──────────────────────────────────────────
      sfLearnRecipe: (recipeId: string): boolean => {
        const state = get()
        if (state.learnedRecipes.includes(recipeId)) return false
        const recipe = SF_RECIPES.find(r => r.id === recipeId)
        if (!recipe) return false
        if (state.forgeLevel < (recipe.rarity === 'legendary' ? 42 : recipe.rarity === 'epic' ? 28 : recipe.rarity === 'rare' ? 16 : recipe.rarity === 'uncommon' ? 8 : 1)) return false
        const cost = Math.floor(recipe.baseCoins * 3)
        if (state.forgeCoins < cost) return false
        const xpGain = Math.floor(recipe.baseXp * 0.5)
        set(prev => ({
          learnedRecipes: [...prev.learnedRecipes, recipeId],
          forgeCoins: prev.forgeCoins - cost,
          forgeExp: prev.forgeExp + xpGain,
          totalXpEarned: prev.totalXpEarned + xpGain,
          forgeLevel: sfCalcLevelFromXp(prev.forgeExp + xpGain),
        }))
        return true
      },

      // ── sfCollectSpice ─────────────────────────────────────────
      sfCollectSpice: (spiceId: string): number => {
        const spice = SF_SPICES.find(s => s.id === spiceId)
        if (!spice) return 0
        const amount = spice.rarity === 'legendary' ? 1 : spice.rarity === 'epic' ? 1 : spice.rarity === 'rare' ? 2 : spice.rarity === 'uncommon' ? 3 : 5
        const xpGain = Math.floor(spice.value * 0.5)
        set(prev => {
          const nextExp = prev.forgeExp + xpGain
          return {
            collectedSpices: { ...prev.collectedSpices, [spiceId]: (prev.collectedSpices[spiceId] || 0) + amount },
            forgeExp: nextExp,
            totalXpEarned: prev.totalXpEarned + xpGain,
            totalSpicesCollected: prev.totalSpicesCollected + amount,
            forgeLevel: sfCalcLevelFromXp(nextExp),
          }
        })
        return amount
      },

      // ── sfCraftBlend ───────────────────────────────────────────
      sfCraftBlend: (blendId: string): boolean => {
        const state = get()
        if (state.craftedBlends.includes(blendId)) return true
        const blend = SF_BLENDS.find(b => b.id === blendId)
        if (!blend) return false
        for (const spiceId of blend.componentSpices) {
          if ((state.collectedSpices[spiceId] || 0) < 1) return false
        }
        const xpGain = Math.floor(blend.powerBonus * 10)
        const coinGain = Math.floor(blend.powerBonus * 8)
        set(prev => {
          const updatedSpices = { ...prev.collectedSpices }
          for (const spiceId of blend.componentSpices) {
            updatedSpices[spiceId] = (updatedSpices[spiceId] || 0) - 1
            if (updatedSpices[spiceId] <= 0) delete updatedSpices[spiceId]
          }
          const nextExp = prev.forgeExp + xpGain
          return {
            craftedBlends: [...prev.craftedBlends, blendId],
            collectedSpices: updatedSpices,
            forgeExp: nextExp,
            forgeCoins: prev.forgeCoins + coinGain,
            totalXpEarned: prev.totalXpEarned + xpGain,
            totalCoinsEarned: prev.totalCoinsEarned + coinGain,
            totalBlendsCrafted: prev.totalBlendsCrafted + 1,
            forgeLevel: sfCalcLevelFromXp(nextExp),
          }
        })
        return true
      },

      // ── sfBuildChamber ─────────────────────────────────────────
      sfBuildChamber: (chamberId: string): boolean => {
        const state = get()
        if (state.builtChambers.includes(chamberId)) return true
        const chamber = SF_CHAMBERS.find(c => c.id === chamberId)
        if (!chamber) return false
        if (state.forgeLevel < chamber.minLevel) return false
        if (state.forgeCoins < chamber.unlockCost) return false
        set({
          builtChambers: [...state.builtChambers, chamberId],
          forgeCoins: state.forgeCoins - chamber.unlockCost,
        })
        return true
      },

      // ── sfUpgradeStructure ─────────────────────────────────────
      sfUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const currentLevel = state.structures[structureId] || 0
        const def = SF_STRUCTURES.find(s => s.id === structureId)
        if (!def) return false
        if (currentLevel >= def.maxLevel) return false
        const cost = sfCalcUpgradeCost(structureId, currentLevel)
        if (state.forgeCoins < cost) return false
        const xpGain = Math.floor(cost * 0.3)
        set(prev => {
          const nextExp = prev.forgeExp + xpGain
          return {
            structures: { ...prev.structures, [structureId]: (prev.structures[structureId] || 0) + 1 },
            forgeCoins: prev.forgeCoins - cost,
            forgeExp: nextExp,
            totalXpEarned: prev.totalXpEarned + xpGain,
            totalStructuresUpgraded: prev.totalStructuresUpgraded + 1,
            forgeLevel: sfCalcLevelFromXp(nextExp),
          }
        })
        return true
      },

      // ── sfUnlockAbility ────────────────────────────────────────
      sfUnlockAbility: (abilityId: string): boolean => {
        const state = get()
        if (state.unlockedAbilities.includes(abilityId)) return true
        const ability = SF_ABILITIES.find(a => a.id === abilityId)
        if (!ability) return false
        const cost = Math.floor(ability.power * 15)
        if (state.forgeCoins < cost) return false
        set(prev => ({
          unlockedAbilities: [...prev.unlockedAbilities, abilityId],
          forgeCoins: prev.forgeCoins - cost,
        }))
        return true
      },

      // ── sfTriggerEvent ─────────────────────────────────────────
      sfTriggerEvent: (eventId: string): boolean => {
        const state = get()
        if (state.activeEventId) return false
        const evt = SF_EVENTS.find(e => e.id === eventId)
        if (!evt) return false
        set({
          activeEventId: eventId,
          eventTimer: evt.duration,
        })
        return true
      },

      // ── sfCraftRecipe ──────────────────────────────────────────
      sfCraftRecipe: (recipeId: string): boolean => {
        const state = get()
        if (!state.learnedRecipes.includes(recipeId)) return false
        const recipe = SF_RECIPES.find(r => r.id === recipeId)
        if (!recipe) return false
        for (const spiceId of recipe.spiceRequirements) {
          if ((state.collectedSpices[spiceId] || 0) < 1) return false
        }
        const chamberBonus = sfComputeChamberBonus(state.activeChamber)
        const synergySchools = SF_SCHOOL_SYNERGY[recipe.school] ?? []
        const synergyMultiplier = synergySchools.some(s =>
          SF_RECIPES.filter(r => state.learnedRecipes.includes(r.id)).some(lr => lr.school === s)
        ) ? 1.15 : 1.0
        const rarityMult = sfCalcRarityMultiplier(recipe.rarity)
        const xpGain = Math.floor(recipe.baseXp * rarityMult * (1 + chamberBonus.xpBonus) * synergyMultiplier)
        const coinGain = Math.floor(recipe.baseCoins * rarityMult * (1 + chamberBonus.coinBonus) * synergyMultiplier)
        set(prev => {
          const updatedSpices = { ...prev.collectedSpices }
          for (const spiceId of recipe.spiceRequirements) {
            updatedSpices[spiceId] = (updatedSpices[spiceId] || 0) - 1
            if (updatedSpices[spiceId] <= 0) delete updatedSpices[spiceId]
          }
          const nextExp = prev.forgeExp + xpGain
          return {
            collectedSpices: updatedSpices,
            forgeExp: nextExp,
            forgeCoins: prev.forgeCoins + coinGain,
            totalXpEarned: prev.totalXpEarned + xpGain,
            totalCoinsEarned: prev.totalCoinsEarned + coinGain,
            totalRecipesCrafted: prev.totalRecipesCrafted + 1,
            forgeLevel: sfCalcLevelFromXp(nextExp),
          }
        })
        return true
      },

      // ── sfSetActiveChamber ─────────────────────────────────────
      sfSetActiveChamber: (chamberId: string): boolean => {
        const state = get()
        if (!state.builtChambers.includes(chamberId)) return false
        set({ activeChamber: chamberId })
        return true
      },

      // ── sfSetTitle ─────────────────────────────────────────────
      sfSetTitle: (titleId: string): boolean => {
        const state = get()
        const titleDef = SF_TITLES.find(t => t.id === titleId)
        if (!titleDef) return false
        if (state.forgeLevel < titleDef.requiredLevel) return false
        if (state.learnedRecipes.length < titleDef.requiredRecipes) return false
        set({ currentTitle: titleId })
        return true
      },
    }),
    {
      name: 'saffron-forge-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: HOOK — useSaffronForge
// ═══════════════════════════════════════════════════════════════════

export default function useSaffronForge() {
  const store = useSFStore()

  // ── Getter: Chamber Details ───────────────────────────────────
  const sfGetChamberDetails = useMemo(() => {
    return SF_CHAMBERS.map(chamber => ({
      ...chamber,
      built: store.builtChambers.includes(chamber.id),
      active: store.activeChamber === chamber.id,
      levelMet: store.forgeLevel >= chamber.minLevel,
      canAfford: store.forgeCoins >= chamber.unlockCost,
    }))
  }, [store])

  // ── Getter: Spice Inventory ──────────────────────────────────
  const sfGetSpiceInventory = useMemo(() => {
    return SF_SPICES.map(spice => ({
      ...spice,
      owned: store.collectedSpices[spice.id] || 0,
      rarityColor: sfFindRarityColor(spice.rarity),
    }))
  }, [store])

  // ── Getter: Learned Recipes ──────────────────────────────────
  const sfGetLearnedRecipes = useMemo(() => {
    return store.learnedRecipes.map(recipeId => {
      const def = SF_RECIPES.find(r => r.id === recipeId)
      if (!def) return null
      return {
        ...def,
        schoolColor: sfCalcSchoolColor(def.school),
        rarityColor: sfFindRarityColor(def.rarity),
        canCraft: def.spiceRequirements.every(sid => (store.collectedSpices[sid] || 0) >= 1),
      }
    }).filter(Boolean)
  }, [store])

  // ── Getter: Structure List ───────────────────────────────────
  const sfGetStructureList = useMemo(() => {
    return SF_STRUCTURES.map(def => {
      const level = store.structures[def.id] || 0
      const nextCost = sfCalcUpgradeCost(def.id, level)
      return {
        ...def,
        level,
        nextCost,
        maxed: level >= def.maxLevel,
        canAfford: store.forgeCoins >= nextCost,
        bonus: sfComputeStructureBonus(def.id, level),
      }
    })
  }, [store])

  // ── Getter: Total Forge Power ────────────────────────────────
  const sfGetForgePower = useMemo(() => {
    const structurePower = Object.entries(store.structures).reduce(
      (sum, [id, level]) => sum + sfComputeStructureBonus(id, level), 0
    )
    const blendPower = store.craftedBlends.reduce(
      (sum, blendId) => {
        const blend = SF_BLENDS.find(b => b.id === blendId)
        return sum + (blend?.powerBonus || 0)
      }, 0
    )
    const abilityPower = store.unlockedAbilities.reduce(
      (sum, abilityId) => {
        const ability = SF_ABILITIES.find(a => a.id === abilityId)
        return sum + (ability?.power || 0)
      }, 0
    )
    return {
      structurePower,
      blendPower,
      abilityPower,
      total: structurePower + blendPower + abilityPower + store.forgeLevel * 5,
    }
  }, [store])

  // ── Getter: Event Status ─────────────────────────────────────
  const sfGetEventStatus = useMemo(() => {
    if (!store.activeEventId) {
      return { active: false, event: null, timer: 0, severity: 0 }
    }
    const evt = SF_EVENTS.find(e => e.id === store.activeEventId)
    if (!evt) {
      return { active: false, event: null, timer: 0, severity: 0 }
    }
    return {
      active: store.eventTimer > 0,
      event: evt,
      timer: store.eventTimer,
      severity: evt.severity,
    }
  }, [store])

  // ── Getter: Active Event ─────────────────────────────────────
  const sfGetActiveEvent = useMemo(() => {
    if (!store.activeEventId || store.eventTimer <= 0) return null
    return SF_EVENTS.find(e => e.id === store.activeEventId) ?? null
  }, [store])

  // ── Getter: Next Title ───────────────────────────────────────
  const sfGetNextTitle = useMemo(() => {
    return SF_TITLES.find(t => store.forgeLevel < t.requiredLevel || store.learnedRecipes.length < t.requiredRecipes) ?? null
  }, [store])

  // ── Getter: Rarity Summary ───────────────────────────────────
  const sfGetRaritySummary = useMemo(() => {
    const allSpices = SF_SPICES
    const summary: Record<SFRarity, { total: number; owned: number; collected: number }> = {
      common: { total: 0, owned: 0, collected: 0 },
      uncommon: { total: 0, owned: 0, collected: 0 },
      rare: { total: 0, owned: 0, collected: 0 },
      epic: { total: 0, owned: 0, collected: 0 },
      legendary: { total: 0, owned: 0, collected: 0 },
    }
    for (const spice of allSpices) {
      summary[spice.rarity].total++
      if ((store.collectedSpices[spice.id] || 0) > 0) summary[spice.rarity].owned++
      summary[spice.rarity].collected += store.collectedSpices[spice.id] || 0
    }
    return summary
  }, [store])

  // ── Getter: School Summary ───────────────────────────────────
  const sfGetSchoolSummary = useMemo(() => {
    const schools: SFSchool[] = ['Baking', 'Brewing', 'Distilling', 'Infusing', 'Smoking', 'Crystallizing', 'Fermenting']
    return schools.map(school => {
      const recipes = SF_RECIPES.filter(r => r.school === school)
      const learned = recipes.filter(r => store.learnedRecipes.includes(r.id))
      return {
        school,
        color: sfCalcSchoolColor(school),
        total: recipes.length,
        learned: learned.length,
        progress: recipes.length > 0 ? learned.length / recipes.length : 0,
      }
    })
  }, [store])

  // ── Getter: Unlocked Achievements ────────────────────────────
  const sfGetAchievementProgress = useMemo(() => {
    const unlocked = store.achievements
    return { unlocked, total: SF_ACHIEVEMENTS.length, progress: unlocked.length }
  }, [store])

  // ── Getter: Title Progress ───────────────────────────────────
  const sfGetTitleProgress = useMemo(() => {
    const currentTitleDef = SF_TITLES.find(t => t.id === store.currentTitle)
    const nextTitle = sfGetNextTitle
    return {
      current: currentTitleDef,
      next: nextTitle,
      titlesUnlocked: SF_TITLES.filter(t =>
        store.forgeLevel >= t.requiredLevel && store.learnedRecipes.length >= t.requiredRecipes
      ).length,
      totalTitles: SF_TITLES.length,
    }
  }, [store])

  // ── Getter: Collected Blends ─────────────────────────────────
  const sfGetCollectedBlends = useMemo(() => {
    return SF_BLENDS.filter(b => store.craftedBlends.includes(b.id)).map(blend => ({
      ...blend,
      rarityColor: sfFindRarityColor(blend.rarity),
    }))
  }, [store])

  // ── Getter: Level Progress ───────────────────────────────────
  const sfGetLevelProgress = useMemo(() => {
    const currentLevelXp = sfCalcXpForLevel(store.forgeLevel)
    const nextLevelXp = sfCalcXpForLevel(store.forgeLevel + 1)
    const levelXpNeeded = nextLevelXp - currentLevelXp
    const progress = levelXpNeeded > 0 && levelXpNeeded !== Infinity
      ? (store.forgeExp - currentLevelXp) / levelXpNeeded
      : 0
    return {
      level: store.forgeLevel,
      exp: store.forgeExp,
      expNeeded: levelXpNeeded,
      progress: Math.min(1, Math.max(0, progress)),
      maxLevel: store.forgeLevel >= SF_MAX_LEVEL,
    }
  }, [store])

  // ── Getter: Ability List ─────────────────────────────────────
  const sfGetAbilityList = useMemo(() => {
    return SF_ABILITIES.map(ability => ({
      ...ability,
      schoolColor: sfCalcSchoolColor(ability.school),
      unlocked: store.unlockedAbilities.includes(ability.id),
      cost: Math.floor(ability.power * 15),
      canAfford: store.forgeCoins >= Math.floor(ability.power * 15),
    }))
  }, [store])

  // ── Getter: Event List ───────────────────────────────────────
  const sfGetEventList = useMemo(() => {
    return SF_EVENTS.map(evt => ({
      ...evt,
      active: store.activeEventId === evt.id,
    }))
  }, [store])

  // ── Getter: Stats Summary & Spice Count by School ────────────
  const { sfGetStatsSummary, sfGetSpiceCountByRarity } = useMemo(() => {
    const statsSummary = {
      level: store.forgeLevel,
      exp: store.forgeExp,
      coins: store.forgeCoins,
      totalXpEarned: store.totalXpEarned,
      totalCoinsEarned: store.totalCoinsEarned,
      totalRecipesCrafted: store.totalRecipesCrafted,
      totalBlendsCrafted: store.totalBlendsCrafted,
      totalSpicesCollected: store.totalSpicesCollected,
      totalStructuresUpgraded: store.totalStructuresUpgraded,
      recipesLearned: store.learnedRecipes.length,
      chambersBuilt: store.builtChambers.length,
      abilitiesUnlocked: store.unlockedAbilities.length,
      blendsCrafted: store.craftedBlends.length,
    }
    const spiceCountByRarity: Record<SFRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
    }
    for (const spice of SF_SPICES) {
      const amount = store.collectedSpices[spice.id] || 0
      if (amount > 0) spiceCountByRarity[spice.rarity] += amount
    }
    return { sfGetStatsSummary: statsSummary, sfGetSpiceCountByRarity: spiceCountByRarity }
  }, [store])

  // ── Getter: Upgrade Costs ────────────────────────────────────
  const sfGetUpgradeCosts = useMemo(() => {
    return SF_STRUCTURES.map(def => {
      const level = store.structures[def.id] || 0
      const nextCost = sfCalcUpgradeCost(def.id, level)
      return {
        structureId: def.id,
        name: def.name,
        level,
        nextCost,
        maxed: level >= def.maxLevel,
      }
    })
  }, [store])

  // ── Getter: Blend Bonus ──────────────────────────────────────
  const sfGetBlendBonus = useMemo(() => {
    const totalBonus = store.craftedBlends.reduce((sum, blendId) => {
      const blend = SF_BLENDS.find(b => b.id === blendId)
      return sum + (blend?.powerBonus || 0)
    }, 0)
    return {
      totalBonus,
      blends: store.craftedBlends.length,
      maxBlends: SF_BLENDS.length,
      bonusPerBlend: store.craftedBlends.length > 0 ? totalBonus / store.craftedBlends.length : 0,
    }
  }, [store])

  // ── Getter: Recipe Craftability ──────────────────────────────
  const sfGetRecipeCraftability = useMemo(() => {
    return SF_RECIPES.map(recipe => {
      const learned = store.learnedRecipes.includes(recipe.id)
      const hasSpices = recipe.spiceRequirements.every(sid => (store.collectedSpices[sid] || 0) >= 1)
      return {
        recipeId: recipe.id,
        name: recipe.name,
        school: recipe.school,
        rarity: recipe.rarity,
        learned,
        canCraft: learned && hasSpices,
        missingSpices: learned
          ? recipe.spiceRequirements.filter(sid => (store.collectedSpices[sid] || 0) < 1)
          : [],
      }
    })
  }, [store])

  // ── Getter: Chamber Bonus Current ────────────────────────────
  const sfGetCurrentChamberBonus = useMemo(() => {
    return sfComputeChamberBonus(store.activeChamber)
  }, [store])

  // ── Getter: Synergy Info ─────────────────────────────────────
  const sfGetSynergyInfo = useMemo(() => {
    const learnedSchools = new Set(
      store.learnedRecipes.map(id => SF_RECIPES.find(r => r.id === id)?.school).filter(Boolean) as SFSchool[]
    )
    const synergies = Object.entries(SF_SCHOOL_SYNERGY).map(([school, bonusSchools]) => ({
      school: school as SFSchool,
      active: learnedSchools.has(school as SFSchool),
      synergies: bonusSchools.filter(s => learnedSchools.has(s)),
      color: sfCalcSchoolColor(school as SFSchool),
    }))
    return synergies
  }, [store])

  // ── Getter: Recipe Mastery by School ──────────────────────────
  const sfGetRecipeMasteryBySchool = useMemo(() => {
    const schools: SFSchool[] = ['Baking', 'Brewing', 'Distilling', 'Infusing', 'Smoking', 'Crystallizing', 'Fermenting']
    return schools.map(school => {
      const recipes = SF_RECIPES.filter(r => r.school === school)
      const learned = recipes.filter(r => store.learnedRecipes.includes(r.id))
      const crafted = recipes.filter(r => store.learnedRecipes.includes(r.id)) // learned implies craftable
      const masteryXP = learned.reduce((sum, r) => sum + r.baseXp * sfCalcRarityMultiplier(r.rarity), 0)
      return {
        school,
        totalRecipes: recipes.length,
        learnedCount: learned.length,
        craftedCount: crafted.length,
        masteryXP: Math.floor(masteryXP),
        isMaxed: learned.length === recipes.length,
        color: sfCalcSchoolColor(school),
      }
    })
  }, [store])

  // ── Getter: Spice Collection Value ───────────────────────────
  const sfGetCollectionValue = useMemo(() => {
    let totalValue = 0
    let uniqueCount = 0
    for (const spice of SF_SPICES) {
      const amount = store.collectedSpices[spice.id] || 0
      if (amount > 0) {
        totalValue += spice.value * amount
        uniqueCount++
      }
    }
    return {
      totalValue,
      uniqueCount,
      totalUnique: SF_SPICES.length,
      collectionPercent: SF_SPICES.length > 0 ? uniqueCount / SF_SPICES.length : 0,
      averageValue: uniqueCount > 0 ? totalValue / uniqueCount : 0,
    }
  }, [store])

  // ── Getter: Active Synergy Multiplier ────────────────────────
  const sfGetActiveSynergyMultiplier = useMemo(() => {
    const learnedSchools = new Set(
      store.learnedRecipes.map(id => SF_RECIPES.find(r => r.id === id)?.school).filter(Boolean) as SFSchool[]
    )
    if (learnedSchools.size === 0) return 1.0
    let activeSynergies = 0
    let totalPossibleSynergies = 0
    for (const [school, bonusSchools] of Object.entries(SF_SCHOOL_SYNERGY)) {
      if (learnedSchools.has(school as SFSchool)) {
        for (const bonus of bonusSchools) {
          totalPossibleSynergies++
          if (learnedSchools.has(bonus)) activeSynergies++
        }
      }
    }
    return totalPossibleSynergies > 0 ? 1 + (activeSynergies / totalPossibleSynergies) * 0.3 : 1.0
  }, [store])

  // ── Getter: Structure Category Summary ───────────────────────
  const sfGetStructureCategorySummary = useMemo(() => {
    const categories: Record<string, { total: number; built: number; avgLevel: number; totalBonus: number }> = {}
    for (const def of SF_STRUCTURES) {
      if (!categories[def.category]) {
        categories[def.category] = { total: 0, built: 0, avgLevel: 0, totalBonus: 0 }
      }
      categories[def.category].total++
      const level = store.structures[def.id] || 0
      if (level > 0) {
        categories[def.category].built++
        categories[def.category].totalBonus += sfComputeStructureBonus(def.id, level)
      }
    }
    for (const cat of Object.values(categories)) {
      cat.avgLevel = cat.built > 0 ? cat.totalBonus / cat.built : 0
    }
    return categories
  }, [store])

  // ── Assemble sfAPI ───────────────────────────────────────────
  const sfAPI = {
    // Static data (direct constants)
    SF_RECIPES,
    SF_CHAMBERS,
    SF_SPICES,
    SF_STRUCTURES,
    SF_ABILITIES,
    SF_ACHIEVEMENTS,
    SF_TITLES,
    SF_BLENDS,
    SF_EVENTS,
    SF_COLOR_SAFFRON_GOLD,
    SF_COLOR_TURMERIC_ORANGE,
    SF_COLOR_PAPRIKA_RED,
    SF_COLOR_CINNAMON_BROWN,
    SF_COLOR_CUMIN_TAN,
    SF_COLOR_BASIL_GREEN,
    SF_COLOR_PEPPER_BLACK,
    SF_COLOR_VANILLA_CREAM,
    SF_MAX_LEVEL,

    // Computed getters
    sfGetChamberDetails,
    sfGetSpiceInventory,
    sfGetLearnedRecipes,
    sfGetStructureList,
    sfGetForgePower,
    sfGetEventStatus,
    sfGetActiveEvent,
    sfGetNextTitle,
    sfGetRaritySummary,
    sfGetSchoolSummary,
    sfGetAchievementProgress,
    sfGetTitleProgress,
    sfGetCollectedBlends,
    sfGetLevelProgress,
    sfGetAbilityList,
    sfGetEventList,
    sfGetStatsSummary,
    sfGetSpiceCountByRarity,
    sfGetUpgradeCosts,
    sfGetBlendBonus,
    sfGetRecipeCraftability,
    sfGetCurrentChamberBonus,
    sfGetSynergyInfo,
    sfGetRecipeMasteryBySchool,
    sfGetCollectionValue,
    sfGetActiveSynergyMultiplier,
    sfGetStructureCategorySummary,

    // Store actions
    sfLearnRecipe: store.sfLearnRecipe,
    sfCollectSpice: store.sfCollectSpice,
    sfCraftBlend: store.sfCraftBlend,
    sfBuildChamber: store.sfBuildChamber,
    sfUpgradeStructure: store.sfUpgradeStructure,
    sfUnlockAbility: store.sfUnlockAbility,
    sfTriggerEvent: store.sfTriggerEvent,
    sfCraftRecipe: store.sfCraftRecipe,
    sfSetActiveChamber: store.sfSetActiveChamber,
    sfSetTitle: store.sfSetTitle,

    // Raw store access
    store,
  }

  return sfAPI
}
