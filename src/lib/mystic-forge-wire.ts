// ══════════════════════════════════════════════════════════════════════════════
// Mystic Forge Wire Module — Magical Crafting System for Word Snake
// Color Theme: violet/purple/gold (#8B5CF6, #A78BFA, #FBBF24)
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ─── Type Definitions ───────────────────────────────────────────────────────

export type MFRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface MFEssenceDef {
  id: string;
  name: string;
  description: string;
  rarity: MFRarity;
  color: string;
  basePower: number;
  icon: string;
}

export interface EssenceInstance {
  id: string;
  amount: number;
  refined: number;
  discovered: boolean;
  harvestCount: number;
}

export interface MFForgeDef {
  id: string;
  name: string;
  description: string;
  unlockLevel: number;
  cost: number;
  color: string;
  icon: string;
  bonusType: string;
  bonusValue: number;
}

export interface ForgeInstance {
  id: string;
  unlocked: boolean;
  active: boolean;
  level: number;
  uses: number;
  mastery: number;
}

export interface MFReagentDef {
  id: string;
  name: string;
  description: string;
  rarity: MFRarity;
  effect: string;
  value: number;
}

export interface MFStructureDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: string;
  unlockLevel: number;
  icon: string;
}

export interface MFSpellDef {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  cooldown: number;
  power: number;
  effect: string;
  unlockLevel: number;
  icon: string;
}

export interface MFAchievementDef {
  id: string;
  name: string;
  description: string;
  condition: string;
  reward: number;
  icon: string;
}

export interface MFTitleDef {
  id: number;
  name: string;
  requirement: string;
  bonusPercent: number;
  color: string;
}

export interface ArtifactInstance {
  id: string;
  name: string;
  power: number;
  enchantLevel: number;
  forgedAt: string;
  essence: string;
  rarity: MFRarity;
}

export interface RuneRecord {
  id: string;
  inscribed: boolean;
  charges: number;
  power: number;
}

export interface ExperimentRecord {
  id: string;
  essence: string;
  reagent: string;
  result: string;
  timestamp: number;
}

export interface ManaSurgeEvent {
  active: boolean;
  multiplier: number;
  remainingMs: number;
  type: string;
}

export interface MysticForgeState {
  level: number;
  xp: number;
  maxXp: number;
  coins: number;
  mana: number;
  maxMana: number;
  essences: Record<string, EssenceInstance>;
  forges: Record<string, ForgeInstance>;
  discoveries: string[];
  achievements: string[];
  currentTitle: number;
  inventory: Record<string, number>;
  dailyQuest: { completed: boolean; progress: number; target: number; type: string };
  dayStreak: number;
  artifacts: Record<string, ArtifactInstance>;
  runes: Record<string, RuneRecord>;
  experiments: ExperimentRecord[];
  totalHarvests: number;
  totalCrafts: number;
  totalEnchants: number;
  totalWordsForged: number;
  manaSurge: ManaSurgeEvent;
  lastDailyDate: string;
  forgeSpeedBonus: number;
  essenceYieldBonus: number;
  spellPowerBonus: number;
  enchantBonus: number;
  globalMultiplier: number;
  selectedForgeId: string | null;
  selectedEssenceId: string | null;
  selectedArtifactId: string | null;
  toastMessage: string;
  toastVisible: boolean;
}

// ─── Color Constants ────────────────────────────────────────────────────────

const MF_VIOLET = '#8B5CF6';
const MF_LAVENDER = '#A78BFA';
const MF_GOLD = '#FBBF24';
const MF_AMETHYST = '#6D28D9';
const MF_PLUM = '#9333EA';
const MF_STARLIGHT = '#C4B5FD';
const MF_EMBER = '#F59E0B';
const MF_OBSIDIAN = '#1F2937';
const MF_MIST = '#E9D5FF';
const MF_ARCANE_BLUE = '#3B82F6';

// ─── Essence Definitions (35 essences, 5 tiers) ─────────────────────────────

const MF_ESSENCES: MFEssenceDef[] = [
  // Common (7)
  { id: 'star_essence', name: 'Star Essence', description: 'Gathered from falling stars at twilight.', rarity: 'Common', color: MF_GOLD, basePower: 10, icon: '⭐' },
  { id: 'moon_dew_essence', name: 'Moon Dew Essence', description: 'Condensed moonlight captured in crystal vials.', rarity: 'Common', color: '#94A3B8', basePower: 10, icon: '🌙' },
  { id: 'wind_breath_essence', name: 'Wind Breath Essence', description: 'Breath of the ancient wind spirits.', rarity: 'Common', color: '#67E8F9', basePower: 12, icon: '💨' },
  { id: 'stone_root_essence', name: 'Stone Root Essence', description: 'Drawn from deep mountain roots.', rarity: 'Common', color: '#A8A29E', basePower: 10, icon: '🪨' },
  { id: 'river_flow_essence', name: 'River Flow Essence', description: 'Essence of perpetual river currents.', rarity: 'Common', color: '#38BDF8', basePower: 11, icon: '💧' },
  { id: 'ember_glow_essence', name: 'Ember Glow Essence', description: 'Faint warmth from dying embers.', rarity: 'Common', color: '#FB923C', basePower: 12, icon: '🔥' },
  { id: 'mist_essence', name: 'Mist Essence', description: 'Thick fog essence from enchanted moors.', rarity: 'Common', color: '#CBD5E1', basePower: 10, icon: '🌫️' },
  // Uncommon (7)
  { id: 'flame_essence', name: 'Flame Essence', description: 'Pure elemental fire captured in a ruby prism.', rarity: 'Uncommon', color: '#EF4444', basePower: 25, icon: '🔥' },
  { id: 'frost_essence', name: 'Frost Essence', description: 'Crystallized winter breath from ice wraiths.', rarity: 'Uncommon', color: '#60A5FA', basePower: 25, icon: '❄️' },
  { id: 'nature_essence', name: 'Nature Essence', description: 'Life force from the Heart Tree grove.', rarity: 'Uncommon', color: '#22C55E', basePower: 28, icon: '🌿' },
  { id: 'thunder_essence', name: 'Thunder Essence', description: 'Bottled lightning from storm peaks.', rarity: 'Uncommon', color: '#FACC15', basePower: 30, icon: '⚡' },
  { id: 'crystal_essence', name: 'Crystal Essence', description: 'Resonance harvested from singing crystals.', rarity: 'Uncommon', color: '#E879F9', basePower: 26, icon: '💎' },
  { id: 'tide_essence', name: 'Tide Essence', description: 'Power of the eternal ocean tides.', rarity: 'Uncommon', color: '#0EA5E9', basePower: 27, icon: '🌊' },
  { id: 'bloom_essence', name: 'Bloom Essence', description: 'Concentrated spring blossom energy.', rarity: 'Uncommon', color: '#F472B6', basePower: 24, icon: '🌸' },
  // Rare (7)
  { id: 'shadow_essence', name: 'Shadow Essence', description: 'Darkness given form from the void between worlds.', rarity: 'Rare', color: '#6366F1', basePower: 55, icon: '🌑' },
  { id: 'solar_essence', name: 'Solar Essence', description: 'Condensed solar fire from a captured sunrise.', rarity: 'Rare', color: '#F59E0B', basePower: 58, icon: '☀️' },
  { id: 'void_essence', name: 'Void Essence', description: 'Echo of nothingness from the abyss.', rarity: 'Rare', color: '#4C1D95', basePower: 60, icon: '🕳️' },
  { id: 'storm_essence', name: 'Storm Essence', description: 'The fury of a thousand tempests.', rarity: 'Rare', color: '#0284C7', basePower: 56, icon: '🌪️' },
  { id: 'iron_essence', name: 'Iron Essence', description: 'Molten metal from the world core.', rarity: 'Rare', color: '#78716C', basePower: 52, icon: '⚙️' },
  { id: 'spirit_essence', name: 'Spirit Essence', description: 'Ethereal wisps from the spirit realm.', rarity: 'Rare', color: '#C084FC', basePower: 57, icon: '👻' },
  { id: 'aurora_essence', name: 'Aurora Essence', description: 'Dancing lights of the northern veil.', rarity: 'Rare', color: '#A78BFA', basePower: 54, icon: '🌌' },
  // Epic (7)
  { id: 'arcane_essence', name: 'Arcane Essence', description: 'Pure unbound magical energy in liquid form.', rarity: 'Epic', color: MF_VIOLET, basePower: 110, icon: '🔮' },
  { id: 'dragon_essence', name: 'Dragon Essence', description: 'Ancient draconic power from elder wyrm scales.', rarity: 'Epic', color: '#DC2626', basePower: 120, icon: '🐉' },
  { id: 'celestial_essence', name: 'Celestial Essence', description: 'Stardust from the celestial throne.', rarity: 'Epic', color: '#FDE68A', basePower: 115, icon: '✨' },
  { id: 'death_essence', name: 'Death Essence', description: 'Chill of the final threshold.', rarity: 'Epic', color: '#1E1B4B', basePower: 112, icon: '💀' },
  { id: 'time_essence', name: 'Time Essence', description: 'Drops from the river of time itself.', rarity: 'Epic', color: '#7DD3FC', basePower: 118, icon: '⏳' },
  { id: 'dream_essence', name: 'Dream Essence', description: 'Solidified lucid dream energy.', rarity: 'Epic', color: '#C4B5FD', basePower: 108, icon: '💭' },
  { id: 'soul_essence', name: 'Soul Essence', description: 'Fragment of an ancient soul crystal.', rarity: 'Epic', color: '#F0ABFC', basePower: 116, icon: '💜' },
  // Legendary (7)
  { id: 'primordial_essence', name: 'Primordial Essence', description: 'The first essence, older than creation.', rarity: 'Legendary', color: '#FBBF24', basePower: 250, icon: '🏆' },
  { id: 'chaos_essence', name: 'Chaos Essence', description: 'Untamable entropy from before order.', rarity: 'Legendary', color: '#FF6B6B', basePower: 260, icon: '🌀' },
  { id: 'creation_essence', name: 'Creation Essence', description: 'The spark that birthed the cosmos.', rarity: 'Legendary', color: '#FDE68A', basePower: 270, icon: '🌟' },
  { id: 'eternity_essence', name: 'Eternity Essence', description: 'Infinite recursion given a single form.', rarity: 'Legendary', color: '#E9D5FF', basePower: 255, icon: '♾️' },
  { id: 'runic_essence', name: 'Runic Essence', description: 'The language of creation made manifest.', rarity: 'Legendary', color: '#A78BFA', basePower: 265, icon: '🔮' },
  { id: 'divine_essence', name: 'Divine Essence', description: 'A tear from the eye of a sleeping god.', rarity: 'Legendary', color: '#FDE68A', basePower: 275, icon: '👑' },
  { id: 'abyss_essence', name: 'Abyss Essence', description: 'The bottomless depth distilled into light.', rarity: 'Legendary', color: '#312E81', basePower: 280, icon: '🔺' },
];

// ─── Forge Chamber Definitions (8) ──────────────────────────────────────────

const MF_FORGES: MFForgeDef[] = [
  { id: 'elemental_crucible', name: 'Elemental Crucible', description: 'A forge fueled by raw elemental forces.', unlockLevel: 1, cost: 0, color: '#EF4444', icon: '🔥', bonusType: 'harvest', bonusValue: 1.1 },
  { id: 'astral_workshop', name: 'Astral Workshop', description: 'A celestial workspace hovering among stars.', unlockLevel: 3, cost: 500, color: MF_GOLD, icon: '🌟', bonusType: 'craft', bonusValue: 1.15 },
  { id: 'shadow_furnace', name: 'Shadow Furnace', description: 'A furnace burning with dark flame.', unlockLevel: 6, cost: 1200, color: '#6366F1', icon: '🌑', bonusType: 'enchant', bonusValue: 1.2 },
  { id: 'crystal_kiln', name: 'Crystal Kiln', description: 'Reinforced with resonating crystal matrices.', unlockLevel: 10, cost: 2500, color: '#E879F9', icon: '💎', bonusType: 'spell', bonusValue: 1.25 },
  { id: 'void_cauldron', name: 'Void Cauldron', description: 'Brews potions from the essence of nothingness.', unlockLevel: 15, cost: 5000, color: '#4C1D95', icon: '🕳️', bonusType: 'refine', bonusValue: 1.3 },
  { id: 'nature_hearth', name: 'Nature Hearth', description: 'A living hearth grown from the Heart Tree.', unlockLevel: 20, cost: 8000, color: '#22C55E', icon: '🌿', bonusType: 'harvest', bonusValue: 1.35 },
  { id: 'arcane_anvil', name: 'Arcane Anvil', description: 'An anvil inscribed with thousand-year runes.', unlockLevel: 25, cost: 12000, color: MF_VIOLET, icon: '🔮', bonusType: 'craft', bonusValue: 1.4 },
  { id: 'divine_brazier', name: 'Divine Brazier', description: 'A brazier lit with divine flame eternal.', unlockLevel: 30, cost: 20000, color: MF_GOLD, icon: '👑', bonusType: 'all', bonusValue: 1.5 },
];

// ─── Reagent Definitions (30) ───────────────────────────────────────────────

const MF_REAGENTS: MFReagentDef[] = [
  { id: 'moon_dust', name: 'Moon Dust', description: 'Fine silver powder from the lunar surface.', rarity: 'Common', effect: 'boosts refinement', value: 5 },
  { id: 'phoenix_tear', name: 'Phoenix Tear', description: 'A single tear from a reborn phoenix.', rarity: 'Legendary', effect: 'auto-revives failed craft', value: 500 },
  { id: 'dragon_scale', name: 'Dragon Scale', description: 'Iridescent scale shed by an elder dragon.', rarity: 'Epic', effect: 'doubles enchant power', value: 200 },
  { id: 'fairy_wing', name: 'Fairy Wing', description: 'Gossamer wing from a twilight fairy.', rarity: 'Uncommon', effect: 'increases harvest yield', value: 25 },
  { id: 'demon_heart', name: 'Demon Heart', description: 'Still-beating heart of a lesser demon.', rarity: 'Epic', effect: 'boosts dark essence crafting', value: 180 },
  { id: 'unicorn_horn', name: 'Unicorn Horn', description: 'Powdered horn of a pure white unicorn.', rarity: 'Legendary', effect: 'purifies any essence', value: 450 },
  { id: 'mandrake_root', name: 'Mandrake Root', description: 'A screaming root pulled at midnight.', rarity: 'Uncommon', effect: 'speeds up brewing', value: 30 },
  { id: 'star_fragment', name: 'Star Fragment', description: 'A shard of a fallen star.', rarity: 'Rare', effect: 'boosts celestial crafts', value: 80 },
  { id: 'void_salt', name: 'Void Salt', description: 'Crystallized void energy as salt grains.', rarity: 'Rare', effect: 'enhances void essence power', value: 75 },
  { id: 'golem_core', name: 'Golem Core', description: 'Energy core from an ancient guardian.', rarity: 'Epic', effect: 'auto-harvests essences', value: 190 },
  { id: 'mermaid_scale', name: 'Mermaid Scale', description: 'Shimmering scale from a deep-sea siren.', rarity: 'Rare', effect: 'boosts water essence crafts', value: 70 },
  { id: 'wyvern_venom', name: 'Wyvern Venom', description: 'Potent venom from a mountain wyvern.', rarity: 'Rare', effect: 'increases spell damage', value: 85 },
  { id: 'elf_dew', name: 'Elf Dew', description: 'Morning dew collected from elven forests.', rarity: 'Uncommon', effect: 'boosts nature essence', value: 28 },
  { id: 'troll_blood', name: 'Troll Blood', description: 'Thick regenerative blood from a cave troll.', rarity: 'Uncommon', effect: 'restores mana faster', value: 22 },
  { id: 'basilisk_eye', name: 'Basilisk Eye', description: 'Petrifying eye of a basilisk, still gleaming.', rarity: 'Epic', effect: 'chance to double coins', value: 175 },
  { id: 'griffin_feather', name: 'Griffin Feather', description: 'Golden feather from a noble griffin.', rarity: 'Rare', effect: 'increases flight spell duration', value: 90 },
  { id: 'obsidian_shard', name: 'Obsidian Shard', description: 'Volcanic glass with latent fire energy.', rarity: 'Common', effect: 'boosts fire essence crafts', value: 8 },
  { id: 'sage_blossom', name: 'Sage Blossom', description: 'Wisdom flower that blooms once a century.', rarity: 'Rare', effect: 'boosts xp gain', value: 65 },
  { id: 'shadow_thread', name: 'Shadow Thread', description: 'Spun from the darkness between dimensions.', rarity: 'Rare', effect: 'boosts shadow crafts', value: 78 },
  { id: 'sun_crystal', name: 'Sun Crystal', description: 'Crystal that absorbs and stores sunlight.', rarity: 'Uncommon', effect: 'passive mana regeneration', value: 35 },
  { id: 'frost_gem', name: 'Frost Gem', description: 'Gemstone that never melts, always cold.', rarity: 'Uncommon', effect: 'boosts frost essence power', value: 32 },
  { id: 'lich_bone', name: 'Lich Bone', description: 'Bone fragment from an ancient lich.', rarity: 'Epic', effect: 'boosts death essence crafts', value: 195 },
  { id: 'thunder_stone', name: 'Thunder Stone', description: 'Stone that crackles with stored lightning.', rarity: 'Rare', effect: 'boosts thunder spells', value: 72 },
  { id: 'ancient_scroll', name: 'Ancient Scroll', description: 'Scroll containing forgotten incantations.', rarity: 'Epic', effect: 'unlocks hidden recipes', value: 210 },
  { id: 'mushroom_spore', name: 'Mushroom Spore', description: 'Glowing spore from the deep caverns.', rarity: 'Common', effect: 'small harvest boost', value: 6 },
  { id: 'crystal_flower', name: 'Crystal Flower', description: 'A flower made of living crystal.', rarity: 'Uncommon', effect: 'boosts crystal essence', value: 38 },
  { id: 'angel_feather', name: 'Angel Feather', description: 'Pure white feather from a celestial being.', rarity: 'Legendary', effect: 'guarantees successful enchant', value: 480 },
  { id: 'chimera_fang', name: 'Chimera Fang', description: 'Venomous fang from a chimera.', rarity: 'Epic', effect: 'boosts all combat spells', value: 185 },
  { id: 'midnight_ink', name: 'Midnight Ink', description: 'Ink that writes itself in the dark.', rarity: 'Uncommon', effect: 'boosts rune inscription', value: 40 },
  { id: 'eternal_ember', name: 'Eternal Ember', description: 'An ember that never goes out.', rarity: 'Rare', effect: 'keeps forge lit between sessions', value: 95 },
];

// ─── Structure Definitions (25) ─────────────────────────────────────────────

const MF_STRUCTURES: MFStructureDef[] = [
  { id: 'essence_condenser', name: 'Essence Condenser', description: 'Condenses raw essence from the environment.', cost: 100, effect: 'auto-harvest 1 essence/min', unlockLevel: 1, icon: '🫧' },
  { id: 'spell_weaver', name: 'Spell Weaver', description: 'A loom that weaves spells into fabric.', cost: 300, effect: '+10% spell power', unlockLevel: 2, icon: '🧵' },
  { id: 'rune_inscriber', name: 'Rune Inscriber', description: 'Inscribes powerful runes onto artifacts.', cost: 500, effect: 'unlock rune crafting', unlockLevel: 3, icon: '✒️' },
  { id: 'alchemy_bench', name: 'Alchemy Bench', description: 'A well-equipped alchemy workstation.', cost: 250, effect: '+5% refinement success', unlockLevel: 2, icon: '⚗️' },
  { id: 'mana_well', name: 'Mana Well', description: 'Draws ambient mana from deep below.', cost: 400, effect: '+20 max mana', unlockLevel: 4, icon: '⛲' },
  { id: 'essence_silo', name: 'Essence Silo', description: 'Stores vast amounts of raw essence.', cost: 350, effect: '+100 essence storage', unlockLevel: 3, icon: '🏢' },
  { id: 'star_chart', name: 'Star Chart', description: 'Maps celestial alignments for power.', cost: 600, effect: 'boosts celestial essence', unlockLevel: 5, icon: '🗺️' },
  { id: 'enchantment_table', name: 'Enchantment Table', description: 'A table blessed with ancient magic.', cost: 800, effect: 'unlock enchanting', unlockLevel: 6, icon: '🪄' },
  { id: 'crystal_refinery', name: 'Crystal Refinery', description: 'Refines raw crystals into pure essence.', cost: 700, effect: '+15% refine output', unlockLevel: 5, icon: '🔧' },
  { id: 'shadow_vault', name: 'Shadow Vault', description: 'Stores dark artifacts safely.', cost: 1000, effect: 'unlock dark essence storage', unlockLevel: 7, icon: '🏦' },
  { id: 'divination_pool', name: 'Divination Pool', description: 'Reveals hidden recipes and secrets.', cost: 900, effect: '+10% discovery chance', unlockLevel: 8, icon: '🔮' },
  { id: 'elemental_shrine', name: 'Elemental Shrine', description: 'A shrine to all four elements.', cost: 1200, effect: 'boosts all elemental essence', unlockLevel: 9, icon: '⛩️' },
  { id: 'potion_rack', name: 'Potion Rack', description: 'Stores crafted potions neatly.', cost: 300, effect: '+50 potion storage', unlockLevel: 3, icon: '🧪' },
  { id: 'arcane_library', name: 'Arcane Library', description: 'Contains tomes of ancient knowledge.', cost: 1500, effect: '+20% xp gain', unlockLevel: 10, icon: '📚' },
  { id: 'mana_battery', name: 'Mana Battery', description: 'Stores excess mana for later use.', cost: 600, effect: '+50 max mana', unlockLevel: 6, icon: '🔋' },
  { id: 'void_anchor', name: 'Void Anchor', description: 'Stabilizes void essence extraction.', cost: 2000, effect: 'unlock void harvesting', unlockLevel: 12, icon: '⚓' },
  { id: 'essence_amplifier', name: 'Essence Amplifier', description: 'Amplifies essence power dramatically.', cost: 2500, effect: '+25% essence power', unlockLevel: 14, icon: '📢' },
  { id: 'mythic_forge', name: 'Mythic Forge', description: 'Forges mythic-tier artifacts.', cost: 3000, effect: 'unlock mythic crafting', unlockLevel: 16, icon: '⚒️' },
  { id: 'dream_catcher', name: 'Dream Catcher', description: 'Captures essence from dream realm.', cost: 1800, effect: 'passive dream essence gain', unlockLevel: 11, icon: '🕸️' },
  { id: 'time_altar', name: 'Time Altar', description: 'An altar that bends time locally.', cost: 3500, effect: 'reduces all cooldowns 10%', unlockLevel: 18, icon: '⏰' },
  { id: 'soul_crucible', name: 'Soul Crucible', description: 'Processes and purifies soul essence.', cost: 4000, effect: '+30% soul essence yield', unlockLevel: 20, icon: '🫀' },
  { id: 'prism_array', name: 'Prism Array', description: 'An array of focusing prisms.', cost: 2200, effect: '+15% all essence output', unlockLevel: 13, icon: '🔺' },
  { id: 'runic_circle', name: 'Runic Circle', description: 'A large circle for powerful rituals.', cost: 5000, effect: 'unlock ritual spells', unlockLevel: 22, icon: '⭕' },
  { id: 'divine_altar', name: 'Divine Altar', description: 'Communes with higher powers.', cost: 8000, effect: '+50% divine essence', unlockLevel: 25, icon: '🕊️' },
  { id: 'creation_engine', name: 'Creation Engine', description: 'The ultimate crafting device.', cost: 15000, effect: 'boosts everything 20%', unlockLevel: 30, icon: '🛠️' },
];

// ─── Spell Definitions (22) ─────────────────────────────────────────────────

const MF_SPELLS: MFSpellDef[] = [
  { id: 'essence_transmute', name: 'Essence Transmute', description: 'Convert one essence type to another.', manaCost: 15, cooldown: 30, power: 1, effect: 'transmute', unlockLevel: 1, icon: '🔄' },
  { id: 'arcane_surge', name: 'Arcane Surge', description: 'Surge of arcane energy boosting all output.', manaCost: 30, cooldown: 60, power: 2, effect: 'multiplier_boost', unlockLevel: 2, icon: '⚡' },
  { id: 'mana_burst', name: 'Mana Burst', description: 'Instantly restore a large amount of mana.', manaCost: 0, cooldown: 120, power: 50, effect: 'mana_restore', unlockLevel: 3, icon: '💙' },
  { id: 'harvest_boom', name: 'Harvest Boom', description: 'Massive essence harvest from all sources.', manaCost: 25, cooldown: 45, power: 3, effect: 'mass_harvest', unlockLevel: 4, icon: '🌾' },
  { id: 'refinement_focus', name: 'Refinement Focus', description: 'Guarantees next refinement succeeds.', manaCost: 20, cooldown: 90, power: 1, effect: 'guarantee_refine', unlockLevel: 5, icon: '🎯' },
  { id: 'enchant_glow', name: 'Enchant Glow', description: 'Boosts enchantment success rate temporarily.', manaCost: 35, cooldown: 120, power: 1.5, effect: 'enchant_boost', unlockLevel: 6, icon: '✨' },
  { id: 'void_rift', name: 'Void Rift', description: 'Opens a rift to draw void essence.', manaCost: 40, cooldown: 180, power: 5, effect: 'void_harvest', unlockLevel: 8, icon: '🕳️' },
  { id: 'time_warp', name: 'Time Warp', description: 'Speeds up all timers for a duration.', manaCost: 50, cooldown: 300, power: 2, effect: 'speed_boost', unlockLevel: 10, icon: '⏩' },
  { id: 'elemental_storm', name: 'Elemental Storm', description: 'Summons all four elements at once.', manaCost: 60, cooldown: 240, power: 4, effect: 'elemental_harvest', unlockLevel: 12, icon: '🌪️' },
  { id: 'shadow_veil', name: 'Shadow Veil', description: 'Hides activities, doubles rewards.', manaCost: 30, cooldown: 200, power: 2, effect: 'reward_double', unlockLevel: 14, icon: '🥷' },
  { id: 'divine_blessing', name: 'Divine Blessing', description: 'Blessed by the gods, all gains tripled.', manaCost: 80, cooldown: 600, power: 3, effect: 'triple_rewards', unlockLevel: 16, icon: '🙏' },
  { id: 'runic_explosion', name: 'Runic Explosion', description: 'All runes fire simultaneously.', manaCost: 45, cooldown: 150, power: 5, effect: 'runic_burst', unlockLevel: 18, icon: '💥' },
  { id: 'essence_siphon', name: 'Essence Siphon', description: 'Siphon essence from distant sources.', manaCost: 20, cooldown: 60, power: 2, effect: 'remote_harvest', unlockLevel: 5, icon: '🧲' },
  { id: 'mana_shield', name: 'Mana Shield', description: 'Protects from negative events.', manaCost: 25, cooldown: 180, power: 1, effect: 'protection', unlockLevel: 7, icon: '🛡️' },
  { id: 'craft_mastery', name: 'Craft Mastery', description: 'Next craft has guaranteed quality.', manaCost: 40, cooldown: 200, power: 1, effect: 'perfect_craft', unlockLevel: 9, icon: '🏆' },
  { id: 'starfall', name: 'Starfall', description: 'Rains stars providing random rare essences.', manaCost: 55, cooldown: 300, power: 3, effect: 'random_rare', unlockLevel: 11, icon: '🌠' },
  { id: 'soul_bind', name: 'Soul Bind', description: 'Binds soul to artifact for permanence.', manaCost: 70, cooldown: 600, power: 1, effect: 'soul_bind', unlockLevel: 20, icon: '🔗' },
  { id: 'creation_spark', name: 'Creation Spark', description: 'Creates a new artifact from nothing.', manaCost: 100, cooldown: 900, power: 1, effect: 'create_artifact', unlockLevel: 25, icon: '💫' },
  { id: 'chaos_bolt', name: 'Chaos Bolt', description: 'Unpredictable but powerful effect.', manaCost: 35, cooldown: 90, power: 6, effect: 'random_effect', unlockLevel: 15, icon: '🌀' },
  { id: 'frost_nova', name: 'Frost Nova', description: 'Freezes all cooldowns in place.', manaCost: 45, cooldown: 300, power: 1, effect: 'freeze_cooldowns', unlockLevel: 13, icon: '🧊' },
  { id: 'nature_bloom', name: 'Nature Bloom', description: 'Causes all nature structures to bloom.', manaCost: 30, cooldown: 150, power: 2, effect: 'nature_boost', unlockLevel: 8, icon: '🌺' },
  { id: 'arcane_cannon', name: 'Arcane Cannon', description: 'Fires a devastating arcane blast.', manaCost: 90, cooldown: 500, power: 10, effect: 'massive_damage', unlockLevel: 28, icon: '🔫' },
];

// ─── Achievement Definitions (18) ───────────────────────────────────────────

const MF_ACHIEVEMENTS: MFAchievementDef[] = [
  { id: 'first_harvest', name: 'First Harvest', description: 'Harvest your first essence.', condition: 'totalHarvests >= 1', reward: 50, icon: '🌱' },
  { id: 'essence_collector', name: 'Essence Collector', description: 'Collect 100 total essences.', condition: 'totalHarvests >= 100', reward: 200, icon: '📦' },
  { id: 'master_alchemist', name: 'Master Alchemist', description: 'Perform 50 refinements.', condition: 'totalCrafts >= 50', reward: 500, icon: '🧪' },
  { id: 'forge_ignited', name: 'Forge Ignited', description: 'Unlock your first forge chamber.', condition: 'forges >= 1', reward: 100, icon: '🔥' },
  { id: 'all_forge_master', name: 'All Forge Master', description: 'Unlock all 8 forge chambers.', condition: 'forges >= 8', reward: 2000, icon: '⚒️' },
  { id: 'artifact_creator', name: 'Artifact Creator', description: 'Craft your first artifact.', condition: 'totalCrafts >= 1', reward: 150, icon: '🏺' },
  { id: 'enchant_master', name: 'Enchant Master', description: 'Enchant an artifact to level 5.', condition: 'maxEnchant >= 5', reward: 800, icon: '✨' },
  { id: 'rune_scribe', name: 'Rune Scribe', description: 'Inscribe your first rune.', condition: 'runes >= 1', reward: 200, icon: '✒️' },
  { id: 'spell_caster', name: 'Spell Caster', description: 'Cast 10 different spells.', condition: 'spellsCast >= 10', reward: 300, icon: '🔮' },
  { id: 'mana_overflow', name: 'Mana Overflow', description: 'Reach maximum mana capacity.', condition: 'mana >= maxMana', reward: 400, icon: '💙' },
  { id: 'legendary_find', name: 'Legendary Find', description: 'Discover a legendary essence.', condition: 'legendaryEssence', reward: 1000, icon: '🌟' },
  { id: 'word_forger', name: 'Word Forger', description: 'Forge 200 words in the forge.', condition: 'totalWordsForged >= 200', reward: 1500, icon: '📝' },
  { id: 'streak_keeper', name: 'Streak Keeper', description: 'Maintain a 7-day streak.', condition: 'dayStreak >= 7', reward: 500, icon: '📅' },
  { id: 'mana_surge_champion', name: 'Mana Surge Champion', description: 'Trigger 5 mana surges.', condition: 'manaSurges >= 5', reward: 750, icon: '⚡' },
  { id: 'discovery_legend', name: 'Discovery Legend', description: 'Make 30 alchemical discoveries.', condition: 'discoveries >= 30', reward: 2000, icon: '🔍' },
  { id: 'coin_hoarder', name: 'Coin Hoarder', description: 'Accumulate 10,000 coins.', condition: 'coins >= 10000', reward: 1000, icon: '💰' },
  { id: 'level_30_reached', name: 'Level 30 Reached', description: 'Reach mystic forger level 30.', condition: 'level >= 30', reward: 5000, icon: '🏅' },
  { id: 'grand_artificer', name: 'Grand Artificer', description: 'Complete every achievement.', condition: 'allAchievements', reward: 10000, icon: '👑' },
];

// ─── Title Definitions (8) ──────────────────────────────────────────────────

const MF_TITLES: MFTitleDef[] = [
  { id: 0, name: 'Novice Alchemist', requirement: 'Default title for beginners.', bonusPercent: 0, color: '#9CA3AF' },
  { id: 1, name: 'Apprentice Forgemaster', requirement: 'Reach level 5.', bonusPercent: 5, color: '#60A5FA' },
  { id: 2, name: 'Essence Harvester', requirement: 'Harvest 50 essences total.', bonusPercent: 8, color: '#34D399' },
  { id: 3, name: 'Rune Inscriber', requirement: 'Inscribe 10 runes.', bonusPercent: 10, color: '#F472B6' },
  { id: 4, name: 'Arcane Artificer', requirement: 'Craft 25 artifacts.', bonusPercent: 15, color: MF_VIOLET },
  { id: 5, name: 'Mystic Enchanter', requirement: 'Enchant 5 artifacts to max.', bonusPercent: 18, color: MF_PLUM },
  { id: 6, name: 'Grand Sorcerer', requirement: 'Cast 50 spells total.', bonusPercent: 22, color: MF_GOLD },
  { id: 7, name: 'Grand Mystic Artificer', requirement: 'Complete all achievements.', bonusPercent: 30, color: '#FDE68A' },
];

// ─── Rarity Multiplier Map ──────────────────────────────────────────────────

const MF_RARITY_MULTIPLIER: Record<MFRarity, number> = {
  Common: 1,
  Uncommon: 1.5,
  Rare: 2.5,
  Epic: 5,
  Legendary: 10,
};

// ─── Quest Types ────────────────────────────────────────────────────────────

const MF_QUEST_TYPES = [
  'harvest_essence',
  'craft_artifact',
  'cast_spell',
  'refine_essence',
  'inscribe_rune',
  'forge_words',
] as const;

// ─── Default State Factory ──────────────────────────────────────────────────

function createDefaultMysticForgeState(): MysticForgeState {
  const essences: Record<string, EssenceInstance> = {};
  for (const e of MF_ESSENCES) {
    essences[e.id] = { id: e.id, amount: 0, refined: 0, discovered: false, harvestCount: 0 };
  }
  const forges: Record<string, ForgeInstance> = {};
  for (const f of MF_FORGES) {
    forges[f.id] = { id: f.id, unlocked: f.unlockLevel <= 1, active: f.unlockLevel <= 1, level: 1, uses: 0, mastery: 0 };
  }
  const runes: Record<string, RuneRecord> = {};
  const runeNames = ['fire_rune', 'ice_rune', 'shadow_rune', 'light_rune', 'void_rune', 'nature_rune', 'arcane_rune', 'time_rune'];
  for (const r of runeNames) {
    runes[r] = { id: r, inscribed: false, charges: 0, power: 0 };
  }
  return {
    level: 1,
    xp: 0,
    maxXp: 100,
    coins: 50,
    mana: 50,
    maxMana: 100,
    essences,
    forges,
    discoveries: [],
    achievements: [],
    currentTitle: 0,
    inventory: {},
    dailyQuest: { completed: false, progress: 0, target: 5, type: 'harvest_essence' },
    dayStreak: 0,
    artifacts: {},
    runes,
    experiments: [],
    totalHarvests: 0,
    totalCrafts: 0,
    totalEnchants: 0,
    totalWordsForged: 0,
    manaSurge: { active: false, multiplier: 1, remainingMs: 0, type: 'none' },
    lastDailyDate: '',
    forgeSpeedBonus: 0,
    essenceYieldBonus: 0,
    spellPowerBonus: 0,
    enchantBonus: 0,
    globalMultiplier: 1,
    selectedForgeId: 'elemental_crucible',
    selectedEssenceId: 'star_essence',
    selectedArtifactId: null,
    toastMessage: '',
    toastVisible: false,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN HOOK
// ══════════════════════════════════════════════════════════════════════════════

export default function useMysticForge(initialState?: MysticForgeState) {
  const [state, setState] = useState<MysticForgeState>(
    initialState ?? createDefaultMysticForgeState()
  );
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ─── Computed Values ───────────────────────────────────────────────────────

  const xpPercent = useMemo(() => {
    if (state.maxXp === 0) return 0;
    return Math.min(100, (state.xp / state.maxXp) * 100);
  }, [state]);

  const manaPercent = useMemo(() => {
    if (state.maxMana === 0) return 0;
    return Math.min(100, (state.mana / state.maxMana) * 100);
  }, [state]);

  const currentTitleDef = useMemo(() => {
    return MF_TITLES.find(t => t.id === state.currentTitle) ?? MF_TITLES[0];
  }, [state]);

  const totalEssenceCount = useMemo(() => {
    let total = 0;
    for (const key of Object.keys(state.essences)) {
      const e = state.essences[key];
      if (e) { total += e.amount + e.refined; }
    }
    return total;
  }, [state]);

  const totalArtifactPower = useMemo(() => {
    let total = 0;
    for (const key of Object.keys(state.artifacts)) {
      const a = state.artifacts[key];
      if (a) { total += a.power * (1 + a.enchantLevel * 0.2); }
    }
    return Math.floor(total);
  }, [state]);

  const activeForgeCount = useMemo(() => {
    let count = 0;
    for (const key of Object.keys(state.forges)) {
      const f = state.forges[key];
      if (f && f.active) count++;
    }
    return count;
  }, [state]);

  const totalInventoryCount = useMemo(() => {
    let count = 0;
    for (const key of Object.keys(state.inventory)) {
      count += state.inventory[key] ?? 0;
    }
    return count;
  }, [state]);

  const unlockedForgeCount = useMemo(() => {
    let count = 0;
    for (const key of Object.keys(state.forges)) {
      const f = state.forges[key];
      if (f && f.unlocked) count++;
    }
    return count;
  }, [state]);

  const discoveredEssenceCount = useMemo(() => {
    let count = 0;
    for (const key of Object.keys(state.essences)) {
      const e = state.essences[key];
      if (e && e.discovered) count++;
    }
    return count;
  }, [state]);

  const dailyQuestPercent = useMemo(() => {
    if (state.dailyQuest.target === 0) return 0;
    return Math.min(100, (state.dailyQuest.progress / state.dailyQuest.target) * 100);
  }, [state]);

  const effectiveMultiplier = useMemo(() => {
    const titleBonus = 1 + (currentTitleDef.bonusPercent / 100);
    return state.globalMultiplier * titleBonus;
  }, [state, currentTitleDef]);

  const spellsUnlockedCount = useMemo(() => {
    return MF_SPELLS.filter(s => s.unlockLevel <= state.level).length;
  }, [state]);

  const canClaimDaily = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return state.lastDailyDate !== today;
  }, [state]);

  // ─── Core Setters ─────────────────────────────────────────────────────────

  const setLevel = useCallback((level: number) => {
    setState(prev => ({ ...prev, level: Math.max(1, level) }));
  }, []);

  const setXp = useCallback((xp: number) => {
    setState(prev => ({ ...prev, xp: Math.max(0, xp) }));
  }, []);

  const setCoins = useCallback((coins: number) => {
    setState(prev => ({ ...prev, coins: Math.max(0, coins) }));
  }, []);

  const setMana = useCallback((mana: number) => {
    setState(prev => ({ ...prev, mana: Math.max(0, Math.min(prev.maxMana, mana)) }));
  }, []);

  const setMaxMana = useCallback((maxMana: number) => {
    setState(prev => ({ ...prev, maxMana: Math.max(10, maxMana) }));
  }, []);

  const setMaxXp = useCallback((maxXp: number) => {
    setState(prev => ({ ...prev, maxXp: Math.max(10, maxXp) }));
  }, []);

  const setDayStreak = useCallback((dayStreak: number) => {
    setState(prev => ({ ...prev, dayStreak: Math.max(0, dayStreak) }));
  }, []);

  const setCurrentTitle = useCallback((titleId: number) => {
    setState(prev => ({ ...prev, currentTitle: titleId }));
  }, []);

  const setGlobalMultiplier = useCallback((mult: number) => {
    setState(prev => ({ ...prev, globalMultiplier: Math.max(1, mult) }));
  }, []);

  const setSelectedForgeId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedForgeId: id }));
  }, []);

  const setSelectedEssenceId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedEssenceId: id }));
  }, []);

  const setSelectedArtifactId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedArtifactId: id }));
  }, []);

  // ─── Toast Helpers ─────────────────────────────────────────────────────────

  const showToast = useCallback((message: string) => {
    setState(prev => ({ ...prev, toastMessage: message, toastVisible: true }));
    setTimeout(() => {
      setState(prev => ({ ...prev, toastVisible: false }));
    }, 2500);
  }, []);

  const hideToast = useCallback(() => {
    setState(prev => ({ ...prev, toastVisible: false }));
  }, []);

  // ─── XP and Leveling ──────────────────────────────────────────────────────

  const addXp = useCallback((amount: number) => {
    const effective = Math.floor(amount * effectiveMultiplier);
    setState(prev => {
      let newXp = prev.xp + effective;
      let newLevel = prev.level;
      let newMaxXp = prev.maxXp;
      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel += 1;
        newMaxXp = Math.floor(100 * Math.pow(1.15, newLevel - 1));
      }
      return { ...prev, xp: newXp, level: newLevel, maxXp: newMaxXp };
    });
  }, [effectiveMultiplier]);

  const addCoins = useCallback((amount: number) => {
    setState(prev => ({ ...prev, coins: prev.coins + Math.floor(amount) }));
  }, []);

  const spendCoins = useCallback((amount: number): boolean => {
    let success = false;
    setState(prev => {
      if (prev.coins >= amount) {
        success = true;
        return { ...prev, coins: prev.coins - amount };
      }
      return prev;
    });
    return success;
  }, []);

  const addMana = useCallback((amount: number) => {
    setState(prev => ({ ...prev, mana: Math.min(prev.maxMana, prev.mana + amount) }));
  }, []);

  const spendMana = useCallback((amount: number): boolean => {
    let success = false;
    setState(prev => {
      if (prev.mana >= amount) {
        success = true;
        return { ...prev, mana: prev.mana - amount };
      }
      return prev;
    });
    return success;
  }, []);

  // ─── Essence Management ───────────────────────────────────────────────────

  const getEssenceDef = useCallback((essenceId: string): MFEssenceDef | undefined => {
    return MF_ESSENCES.find(e => e.id === essenceId);
  }, []);

  const getEssence = useCallback((essenceId: string): EssenceInstance | undefined => {
    return stateRef.current.essences[essenceId];
  }, []);

  const addEssence = useCallback((essenceId: string, amount: number) => {
    const yieldBonus = stateRef.current.essenceYieldBonus;
    const surgeMult = stateRef.current.manaSurge.active ? stateRef.current.manaSurge.multiplier : 1;
    const finalAmount = Math.floor(amount * (1 + yieldBonus) * surgeMult);
    setState(prev => {
      const ess = prev.essences[essenceId];
      if (!ess) return prev;
      const newEssences = { ...prev.essences };
      newEssences[essenceId] = {
        ...ess,
        amount: ess.amount + finalAmount,
        discovered: true,
        harvestCount: ess.harvestCount + 1,
      };
      return { ...prev, essences: newEssences, totalHarvests: prev.totalHarvests + 1 };
    });
    addXp(Math.floor(amount * 2));
    addCoins(Math.floor(amount * 0.5));
  }, [addXp, addCoins]);

  const spendEssence = useCallback((essenceId: string, amount: number): boolean => {
    let success = false;
    setState(prev => {
      const ess = prev.essences[essenceId];
      if (!ess || ess.amount < amount) return prev;
      success = true;
      const newEssences = { ...prev.essences };
      newEssences[essenceId] = { ...ess, amount: ess.amount - amount };
      return { ...prev, essences: newEssences };
    });
    return success;
  }, []);

  const refineEssence = useCallback((essenceId: string): boolean => {
    const ess = stateRef.current.essences[essenceId];
    if (!ess || ess.amount < 5) return false;
    setState(prev => {
      const e = prev.essences[essenceId];
      if (!e || e.amount < 5) return prev;
      const newEssences = { ...prev.essences };
      newEssences[essenceId] = { ...e, amount: e.amount - 5, refined: e.refined + 2 };
      return { ...prev, essences: newEssences, totalCrafts: prev.totalCrafts + 1 };
    });
    addXp(15);
    return true;
  }, [addXp]);

  const discoverEssence = useCallback((essenceId: string) => {
    setState(prev => {
      const ess = prev.essences[essenceId];
      if (!ess) return prev;
      if (prev.discoveries.includes(essenceId)) return prev;
      const newEssences = { ...prev.essences };
      newEssences[essenceId] = { ...ess, discovered: true };
      return { ...prev, essences: newEssences, discoveries: [...prev.discoveries, essenceId] };
    });
    showToast('New essence discovered!');
    addXp(25);
  }, [addXp, showToast]);

  const canRefine = useCallback((essenceId: string): boolean => {
    const ess = stateRef.current.essences[essenceId];
    return ess !== undefined && ess.amount >= 5;
  }, []);

  // ─── Forge Chamber Management ─────────────────────────────────────────────

  const getForgeDef = useCallback((forgeId: string): MFForgeDef | undefined => {
    return MF_FORGES.find(f => f.id === forgeId);
  }, []);

  const getForge = useCallback((forgeId: string): ForgeInstance | undefined => {
    return stateRef.current.forges[forgeId];
  }, []);

  const unlockForge = useCallback((forgeId: string): boolean => {
    const def = MF_FORGES.find(f => f.id === forgeId);
    if (!def) return false;
    const current = stateRef.current;
    if (current.level < def.unlockLevel) return false;
    if (!spendCoins(def.cost)) return false;
    setState(prev => {
      const newForges = { ...prev.forges };
      newForges[forgeId] = { ...prev.forges[forgeId], unlocked: true, active: true };
      return { ...prev, forges: newForges };
    });
    showToast(`Forge chamber unlocked: ${def.name}!`);
    addXp(50);
    return true;
  }, [spendCoins, addXp, showToast]);

  const activateForge = useCallback((forgeId: string) => {
    setState(prev => {
      const f = prev.forges[forgeId];
      if (!f || !f.unlocked) return prev;
      const newForges = { ...prev.forges };
      newForges[forgeId] = { ...f, active: !f.active };
      return { ...prev, forges: newForges };
    });
  }, []);

  const useForge = useCallback((forgeId: string) => {
    setState(prev => {
      const f = prev.forges[forgeId];
      if (!f || !f.unlocked || !f.active) return prev;
      const newForges = { ...prev.forges };
      const newMastery = Math.min(100, f.mastery + 5);
      const leveledUp = newMastery >= 100 && f.level < 10;
      newForges[forgeId] = {
        ...f,
        uses: f.uses + 1,
        mastery: leveledUp ? 0 : newMastery,
        level: leveledUp ? f.level + 1 : f.level,
      };
      return { ...prev, forges: newForges };
    });
    addXp(8);
  }, [addXp]);

  const upgradeForge = useCallback((forgeId: string): boolean => {
    const f = stateRef.current.forges[forgeId];
    if (!f || f.level >= 10) return false;
    const cost = f.level * 200;
    if (!spendCoins(cost)) return false;
    setState(prev => {
      const newForges = { ...prev.forges };
      newForges[forgeId] = { ...prev.forges[forgeId], level: prev.forges[forgeId].level + 1 };
      return { ...prev, forges: newForges };
    });
    showToast('Forge upgraded!');
    return true;
  }, [spendCoins, showToast]);

  const canUnlockForge = useCallback((forgeId: string): boolean => {
    const def = MF_FORGES.find(f => f.id === forgeId);
    if (!def) return false;
    const current = stateRef.current;
    return current.level >= def.unlockLevel && current.coins >= def.cost;
  }, []);

  // ─── Artifact Management ──────────────────────────────────────────────────

  const createArtifact = useCallback((essenceId: string, artifactName: string): boolean => {
    const ess = stateRef.current.essences[essenceId];
    if (!ess || ess.refined < 3) return false;
    const def = MF_ESSENCES.find(e => e.id === essenceId);
    if (!def) return false;
    const artifactId = `artifact_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const power = Math.floor(def.basePower * (1 + Math.random() * 0.5));
    setState(prev => {
      const newEssences = { ...prev.essences };
      newEssences[essenceId] = { ...prev.essences[essenceId], refined: prev.essences[essenceId].refined - 3 };
      const newArtifacts = { ...prev.artifacts };
      newArtifacts[artifactId] = {
        id: artifactId,
        name: artifactName,
        power,
        enchantLevel: 0,
        forgedAt: new Date().toISOString(),
        essence: essenceId,
        rarity: def.rarity,
      };
      return { ...prev, essences: newEssences, artifacts: newArtifacts, totalCrafts: prev.totalCrafts + 1 };
    });
    showToast(`Artifact forged: ${artifactName}!`);
    addXp(30);
    return true;
  }, [addXp, showToast]);

  const enchantArtifact = useCallback((artifactId: string): boolean => {
    const artifact = stateRef.current.artifacts[artifactId];
    if (!artifact || artifact.enchantLevel >= 10) return false;
    const cost = (artifact.enchantLevel + 1) * 100;
    if (!spendCoins(cost)) return false;
    const ess = stateRef.current.essences[artifact.essence];
    if (!ess || ess.refined < 1) return false;
    setState(prev => {
      const newEssences = { ...prev.essences };
      newEssences[artifact.essence] = { ...prev.essences[artifact.essence], refined: prev.essences[artifact.essence].refined - 1 };
      const newArtifacts = { ...prev.artifacts };
      newArtifacts[artifactId] = {
        ...prev.artifacts[artifactId],
        enchantLevel: prev.artifacts[artifactId].enchantLevel + 1,
        power: Math.floor(prev.artifacts[artifactId].power * 1.15),
      };
      return { ...prev, essences: newEssences, artifacts: newArtifacts, totalEnchants: prev.totalEnchants + 1 };
    });
    showToast('Artifact enchanted!');
    addXp(20);
    return true;
  }, [spendCoins, addXp, showToast]);

  const destroyArtifact = useCallback((artifactId: string) => {
    setState(prev => {
      const newArtifacts = { ...prev.artifacts };
      const art = newArtifacts[artifactId];
      if (!art) return prev;
      delete newArtifacts[artifactId];
      const newEssences = { ...prev.essences };
      if (newEssences[art.essence]) {
        newEssences[art.essence] = {
          ...newEssences[art.essence],
          refined: newEssences[art.essence].refined + 1,
        };
      }
      return { ...prev, artifacts: newArtifacts, essences: newEssences };
    });
    showToast('Artifact destroyed, essence reclaimed.');
  }, [showToast]);

  const getArtifactPower = useCallback((artifactId: string): number => {
    const a = stateRef.current.artifacts[artifactId];
    if (!a) return 0;
    return Math.floor(a.power * (1 + a.enchantLevel * 0.2));
  }, []);

  const canEnchantArtifact = useCallback((artifactId: string): boolean => {
    const a = stateRef.current.artifacts[artifactId];
    if (!a || a.enchantLevel >= 10) return false;
    const cost = (a.enchantLevel + 1) * 100;
    const ess = stateRef.current.essences[a.essence];
    return stateRef.current.coins >= cost && ess !== undefined && ess.refined >= 1;
  }, []);

  const getArtifactList = useCallback((): ArtifactInstance[] => {
    return Object.values(stateRef.current.artifacts);
  }, []);

  // ─── Rune Management ──────────────────────────────────────────────────────

  const inscribeRune = useCallback((runeId: string): boolean => {
    const rune = stateRef.current.runes[runeId];
    if (!rune) return false;
    const cost = 150;
    if (!spendCoins(cost)) return false;
    setState(prev => {
      const newRunes = { ...prev.runes };
      newRunes[runeId] = {
        ...prev.runes[runeId],
        inscribed: true,
        charges: 5,
        power: 10 + prev.level * 2,
      };
      return { ...prev, runes: newRunes };
    });
    showToast('Rune inscribed successfully!');
    addXp(20);
    return true;
  }, [spendCoins, addXp, showToast]);

  const activateRune = useCallback((runeId: string): boolean => {
    const rune = stateRef.current.runes[runeId];
    if (!rune || !rune.inscribed || rune.charges <= 0) return false;
    setState(prev => {
      const newRunes = { ...prev.runes };
      newRunes[runeId] = { ...prev.runes[runeId], charges: prev.runes[runeId].charges - 1 };
      return { ...prev, runes: newRunes };
    });
    addXp(5);
    addMana(10);
    return true;
  }, [addXp, addMana]);

  const rechargeRune = useCallback((runeId: string): boolean => {
    const rune = stateRef.current.runes[runeId];
    if (!rune || !rune.inscribed) return false;
    const cost = 50;
    if (!spendCoins(cost)) return false;
    setState(prev => {
      const newRunes = { ...prev.runes };
      newRunes[runeId] = { ...prev.runes[runeId], charges: Math.min(10, prev.runes[runeId].charges + 3) };
      return { ...prev, runes: newRunes };
    });
    showToast('Rune recharged!');
    return true;
  }, [spendCoins, showToast]);

  const canInscribeRune = useCallback((runeId: string): boolean => {
    const rune = stateRef.current.runes[runeId];
    return rune !== undefined && !rune.inscribed && stateRef.current.coins >= 150;
  }, []);

  // ─── Spell Casting ─────────────────────────────────────────────────────────

  const canCastSpell = useCallback((spellId: string): boolean => {
    const spell = MF_SPELLS.find(s => s.id === spellId);
    if (!spell) return false;
    return stateRef.current.level >= spell.unlockLevel && stateRef.current.mana >= spell.manaCost;
  }, []);

  const castSpell = useCallback((spellId: string): boolean => {
    const spell = MF_SPELLS.find(s => s.id === spellId);
    if (!spell) return false;
    if (stateRef.current.level < spell.unlockLevel) return false;
    if (!spendMana(spell.manaCost)) return false;
    setState(prev => {
      switch (spell.effect) {
        case 'mana_restore':
          return { ...prev, mana: Math.min(prev.maxMana, prev.mana + spell.power) };
        case 'multiplier_boost':
          return { ...prev, globalMultiplier: prev.globalMultiplier + (spell.power * 0.1) };
        case 'mass_harvest': {
          const newEssences = { ...prev.essences };
          const keys = Object.keys(newEssences);
          for (const key of keys.slice(0, 5)) {
            if (newEssences[key]) {
              newEssences[key] = { ...newEssences[key], amount: newEssences[key].amount + spell.power, discovered: true };
            }
          }
          return { ...prev, essences: newEssences, totalHarvests: prev.totalHarvests + 5 };
        }
        case 'random_rare': {
          const rares = MF_ESSENCES.filter(e => e.rarity === 'Rare' || e.rarity === 'Epic');
          if (rares.length === 0) return prev;
          const pick = rares[Math.floor(Math.random() * rares.length)];
          const newEssences = { ...prev.essences };
          if (newEssences[pick.id]) {
            newEssences[pick.id] = { ...newEssences[pick.id], amount: newEssences[pick.id].amount + spell.power, discovered: true };
          }
          return { ...prev, essences: newEssences, totalHarvests: prev.totalHarvests + spell.power };
        }
        default:
          return prev;
      }
    });
    addXp(Math.floor(spell.manaCost * 1.5));
    showToast(`Spell cast: ${spell.name}!`);
    return true;
  }, [spendMana, addXp, showToast]);

  const getSpellDef = useCallback((spellId: string): MFSpellDef | undefined => {
    return MF_SPELLS.find(s => s.id === spellId);
  }, []);

  const getUnlockedSpells = useCallback((): MFSpellDef[] => {
    return MF_SPELLS.filter(s => s.unlockLevel <= stateRef.current.level);
  }, []);

  const getLockedSpells = useCallback((): MFSpellDef[] => {
    return MF_SPELLS.filter(s => s.unlockLevel > stateRef.current.level);
  }, []);

  // ─── Reagent Management ───────────────────────────────────────────────────

  const getReagentDef = useCallback((reagentId: string): MFReagentDef | undefined => {
    return MF_REAGENTS.find(r => r.id === reagentId);
  }, []);

  const addReagent = useCallback((reagentId: string, amount: number) => {
    setState(prev => ({
      ...prev,
      inventory: { ...prev.inventory, [reagentId]: (prev.inventory[reagentId] ?? 0) + amount },
    }));
  }, []);

  const spendReagent = useCallback((reagentId: string, amount: number): boolean => {
    const current = stateRef.current.inventory[reagentId] ?? 0;
    if (current < amount) return false;
    setState(prev => {
      const newInv = { ...prev.inventory };
      newInv[reagentId] = (newInv[reagentId] ?? 0) - amount;
      if (newInv[reagentId] <= 0) delete newInv[reagentId];
      return { ...prev, inventory: newInv };
    });
    return true;
  }, []);

  const hasReagent = useCallback((reagentId: string, amount: number): boolean => {
    return (stateRef.current.inventory[reagentId] ?? 0) >= amount;
  }, []);

  // ─── Structure Management ──────────────────────────────────────────────────

  const getStructureDef = useCallback((structureId: string): MFStructureDef | undefined => {
    return MF_STRUCTURES.find(s => s.id === structureId);
  }, []);

  const buildStructure = useCallback((structureId: string): boolean => {
    const def = MF_STRUCTURES.find(s => s.id === structureId);
    if (!def) return false;
    if (stateRef.current.level < def.unlockLevel) return false;
    if (!spendCoins(def.cost)) return false;
    addReagent(structureId, 1);
    showToast(`Structure built: ${def.name}!`);
    addXp(40);
    return true;
  }, [spendCoins, addReagent, addXp, showToast]);

  const hasStructure = useCallback((structureId: string): boolean => {
    return (stateRef.current.inventory[structureId] ?? 0) > 0;
  }, []);

  // ─── Alchemical Experiments ───────────────────────────────────────────────

  const performExperiment = useCallback((essenceId: string, reagentId: string): string => {
    const results = ['breakthrough', 'stable_compound', 'volatile_mix', 'mystic_resonance', 'failed'];
    const weights = [0.1, 0.3, 0.25, 0.2, 0.15];
    let rand = Math.random();
    let result = results[results.length - 1];
    for (let i = 0; i < weights.length; i++) {
      rand -= weights[i];
      if (rand <= 0) { result = results[i]; break; }
    }
    setState(prev => ({
      ...prev,
      experiments: [
        ...prev.experiments,
        { id: `exp_${Date.now()}`, essence: essenceId, reagent: reagentId, result, timestamp: Date.now() },
      ],
    }));
    if (result === 'breakthrough' || result === 'mystic_resonance') {
      if (!prev_discoveries_includes(stateRef.current, essenceId + reagentId)) {
        setState(prev2 => ({
          ...prev2,
          discoveries: [...prev2.discoveries, essenceId + reagentId],
        }));
      }
      addXp(50);
      addCoins(100);
      showToast(`Experiment result: ${result}!`);
    } else {
      addXp(10);
      showToast(`Experiment: ${result}`);
    }
    return result;
  }, [addXp, addCoins, showToast]);

  const getRecentExperiments = useCallback((count: number): ExperimentRecord[] => {
    return stateRef.current.experiments.slice(-count);
  }, []);

  // ─── Mana Surge Events ────────────────────────────────────────────────────

  const triggerManaSurge = useCallback(() => {
    const types = ['harvest', 'craft', 'enchant', 'spell', 'all'];
    const type = types[Math.floor(Math.random() * types.length)];
    const multiplier = 1.5 + Math.random() * 2;
    setState(prev => ({
      ...prev,
      manaSurge: { active: true, multiplier, remainingMs: 30000, type },
    }));
    showToast(`Mana Surge: ${type} x${multiplier.toFixed(1)}!`);
  }, [showToast]);

  const tickManaSurge = useCallback((deltaMs: number) => {
    setState(prev => {
      if (!prev.manaSurge.active) return prev;
      const remaining = prev.manaSurge.remainingMs - deltaMs;
      if (remaining <= 0) {
        return { ...prev, manaSurge: { active: false, multiplier: 1, remainingMs: 0, type: 'none' } };
      }
      return { ...prev, manaSurge: { ...prev.manaSurge, remainingMs: remaining } };
    });
  }, []);

  const clearManaSurge = useCallback(() => {
    setState(prev => ({ ...prev, manaSurge: { active: false, multiplier: 1, remainingMs: 0, type: 'none' } }));
  }, []);

  // ─── Daily Quest System ───────────────────────────────────────────────────

  const generateDailyQuest = useCallback(() => {
    const type = MF_QUEST_TYPES[Math.floor(Math.random() * MF_QUEST_TYPES.length)];
    const target = 3 + Math.floor(Math.random() * 8);
    setState(prev => ({
      ...prev,
      dailyQuest: { completed: false, progress: 0, target, type },
    }));
  }, []);

  const advanceDailyQuest = useCallback(() => {
    setState(prev => {
      if (prev.dailyQuest.completed) return prev;
      const newProgress = prev.dailyQuest.progress + 1;
      const completed = newProgress >= prev.dailyQuest.target;
      if (completed) {
        return {
          ...prev,
          dailyQuest: { ...prev.dailyQuest, progress: newProgress, completed: true },
          coins: prev.coins + 200,
          xp: prev.xp + 50,
        };
      }
      return { ...prev, dailyQuest: { ...prev.dailyQuest, progress: newProgress } };
    });
  }, []);

  const claimDailyReward = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => {
      const newStreak = prev.lastDailyDate === getYesterdayDate() ? prev.dayStreak + 1 : 1;
      const streakBonus = Math.min(newStreak * 10, 100);
      return {
        ...prev,
        lastDailyDate: today,
        dayStreak: newStreak,
        coins: prev.coins + 100 + streakBonus,
        mana: Math.min(prev.maxMana, prev.mana + 20),
      };
    });
    showToast('Daily reward claimed!');
    generateDailyQuest();
  }, [showToast, generateDailyQuest]);

  // ─── Word Forging Integration ─────────────────────────────────────────────

  const forgeWord = useCallback((word: string): number => {
    const wordLength = word.length;
    const basePoints = wordLength * 5;
    const forgeBonus = stateRef.current.forges[stateRef.current.selectedForgeId ?? '']?.active ? 1.2 : 1;
    const points = Math.floor(basePoints * effectiveMultiplier * forgeBonus);
    setState(prev => ({ ...prev, totalWordsForged: prev.totalWordsForged + 1 }));
    addXp(points);
    addCoins(Math.floor(points * 0.3));
    advanceDailyQuest();
    return points;
  }, [effectiveMultiplier, addXp, addCoins, advanceDailyQuest]);

  const getForgeWordMultiplier = useCallback((): number => {
    const forge = stateRef.current.forges[stateRef.current.selectedForgeId ?? ''];
    if (!forge || !forge.active) return 1;
    const def = MF_FORGES.find(f => f.id === forge.id);
    if (!def) return 1;
    return def.bonusValue;
  }, []);

  // ─── Achievement Checking ─────────────────────────────────────────────────

  const checkAchievements = useCallback((): string[] => {
    const newlyUnlocked: string[] = [];
    const s = stateRef.current;
    const checks: Record<string, boolean> = {
      first_harvest: s.totalHarvests >= 1,
      essence_collector: s.totalHarvests >= 100,
      master_alchemist: s.totalCrafts >= 50,
      forge_ignited: unlockedForgeCount_for_state(s) >= 1,
      all_forge_master: unlockedForgeCount_for_state(s) >= 8,
      artifact_creator: s.totalCrafts >= 1,
      enchant_master: maxEnchant_for_state(s) >= 5,
      rune_scribe: inscribedRuneCount(s) >= 1,
      spell_caster: s.level >= 10,
      mana_overflow: s.mana >= s.maxMana,
      legendary_find: hasLegendaryEssence(s),
      word_forger: s.totalWordsForged >= 200,
      streak_keeper: s.dayStreak >= 7,
      mana_surge_champion: s.manaSurge.active || s.totalHarvests >= 50,
      discovery_legend: s.discoveries.length >= 30,
      coin_hoarder: s.coins >= 10000,
      level_30_reached: s.level >= 30,
      grand_artificer: MF_ACHIEVEMENTS.every(a => s.achievements.includes(a.id)),
    };
    for (const [id, met] of Object.entries(checks)) {
      if (met && !s.achievements.includes(id)) {
        newlyUnlocked.push(id);
      }
    }
    if (newlyUnlocked.length > 0) {
      setState(prev => ({
        ...prev,
        achievements: [...prev.achievements, ...newlyUnlocked],
        coins: prev.coins + newlyUnlocked.reduce((sum, id) => {
          const ach = MF_ACHIEVEMENTS.find(a => a.id === id);
          return sum + (ach?.reward ?? 0);
        }, 0),
      }));
      for (const id of newlyUnlocked) {
        const ach = MF_ACHIEVEMENTS.find(a => a.id === id);
        if (ach) showToast(`Achievement unlocked: ${ach.name}!`);
      }
    }
    return newlyUnlocked;
  }, [showToast]);

  const isAchievementUnlocked = useCallback((achievementId: string): boolean => {
    return stateRef.current.achievements.includes(achievementId);
  }, []);

  const getAchievementProgress = useCallback((): { id: string; name: string; progress: number; target: number }[] => {
    const s = stateRef.current;
    return MF_ACHIEVEMENTS.map(a => {
      let progress = 0;
      let target = 1;
      switch (a.id) {
        case 'first_harvest': progress = Math.min(1, s.totalHarvests); target = 1; break;
        case 'essence_collector': progress = s.totalHarvests; target = 100; break;
        case 'master_alchemist': progress = s.totalCrafts; target = 50; break;
        case 'forge_ignited': progress = unlockedForgeCount_for_state(s); target = 1; break;
        case 'all_forge_master': progress = unlockedForgeCount_for_state(s); target = 8; break;
        case 'artifact_creator': progress = Math.min(1, s.totalCrafts); target = 1; break;
        case 'enchant_master': progress = maxEnchant_for_state(s); target = 5; break;
        case 'rune_scribe': progress = inscribedRuneCount(s); target = 1; break;
        case 'spell_caster': progress = Math.min(1, s.level >= 10 ? 1 : 0); target = 1; break;
        case 'mana_overflow': progress = s.mana; target = s.maxMana; break;
        case 'legendary_find': progress = hasLegendaryEssence(s) ? 1 : 0; target = 1; break;
        case 'word_forger': progress = s.totalWordsForged; target = 200; break;
        case 'streak_keeper': progress = s.dayStreak; target = 7; break;
        case 'discovery_legend': progress = s.discoveries.length; target = 30; break;
        case 'coin_hoarder': progress = s.coins; target = 10000; break;
        case 'level_30_reached': progress = s.level; target = 30; break;
        case 'grand_artificer': progress = s.achievements.length; target = MF_ACHIEVEMENTS.length; break;
        default: progress = 0; target = 1;
      }
      return { id: a.id, name: a.name, progress, target };
    });
  }, []);

  // ─── Title Management ─────────────────────────────────────────────────────

  const getAvailableTitles = useCallback((): MFTitleDef[] => {
    const s = stateRef.current;
    return MF_TITLES.filter(t => {
      switch (t.id) {
        case 0: return true;
        case 1: return s.level >= 5;
        case 2: return s.totalHarvests >= 50;
        case 3: return inscribedRuneCount(s) >= 10;
        case 4: return Object.keys(s.artifacts).length >= 25;
        case 5: return maxEnchant_for_state(s) >= 5;
        case 6: return s.totalCrafts >= 50;
        case 7: return MF_ACHIEVEMENTS.every(a => s.achievements.includes(a.id));
        default: return false;
      }
    });
  }, []);

  const equipTitle = useCallback((titleId: number) => {
    setState(prev => ({ ...prev, currentTitle: titleId }));
    showToast(`Title equipped: ${MF_TITLES.find(t => t.id === titleId)?.name ?? 'Unknown'}!`);
  }, [showToast]);

  // ─── Reset and State Management ───────────────────────────────────────────

  const resetState = useCallback(() => {
    setState(createDefaultMysticForgeState());
    showToast('Mystic Forge reset to initial state.');
  }, [showToast]);

  const getState = useCallback((): MysticForgeState => {
    return stateRef.current;
  }, []);

  // ─── Bonus Setters ────────────────────────────────────────────────────────

  const setForgeSpeedBonus = useCallback((bonus: number) => {
    setState(prev => ({ ...prev, forgeSpeedBonus: bonus }));
  }, []);

  const setEssenceYieldBonus = useCallback((bonus: number) => {
    setState(prev => ({ ...prev, essenceYieldBonus: bonus }));
  }, []);

  const setSpellPowerBonus = useCallback((bonus: number) => {
    setState(prev => ({ ...prev, spellPowerBonus: bonus }));
  }, []);

  const setEnchantBonus = useCallback((bonus: number) => {
    setState(prev => ({ ...prev, enchantBonus: bonus }));
  }, []);

  // ─── Essence Harvesting by Rarity ─────────────────────────────────────────

  const harvestRandomEssence = useCallback((): string | null => {
    const available = MF_ESSENCES.filter(e => {
      if (e.rarity === 'Legendary') return stateRef.current.level >= 20;
      if (e.rarity === 'Epic') return stateRef.current.level >= 10;
      if (e.rarity === 'Rare') return stateRef.current.level >= 5;
      return true;
    });
    if (available.length === 0) return null;
    const weights = available.map(e => MF_RARITY_MULTIPLIER[e.rarity] === 10 ? 1 : MF_RARITY_MULTIPLIER[e.rarity] === 5 ? 3 : MF_RARITY_MULTIPLIER[e.rarity] === 2.5 ? 8 : 20);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;
    let picked = available[0];
    for (let i = 0; i < available.length; i++) {
      rand -= weights[i];
      if (rand <= 0) { picked = available[i]; break; }
    }
    const amount = 1 + Math.floor(Math.random() * MF_RARITY_MULTIPLIER[picked.rarity]);
    addEssence(picked.id, amount);
    return picked.id;
  }, [addEssence]);

  const harvestEssenceByType = useCallback((rarity: MFRarity): string | null => {
    const matching = MF_ESSENCES.filter(e => e.rarity === rarity);
    if (matching.length === 0) return null;
    const pick = matching[Math.floor(Math.random() * matching.length)];
    const amount = 1 + Math.floor(Math.random() * MF_RARITY_MULTIPLIER[rarity]);
    addEssence(pick.id, amount);
    return pick.id;
  }, [addEssence]);

  // ─── Quick Craft Helpers ──────────────────────────────────────────────────

  const quickCraftPotion = useCallback((): boolean => {
    if (!hasReagent('moon_dust', 2)) return false;
    if (!spendReagent('moon_dust', 2)) return false;
    addMana(25);
    addXp(10);
    showToast('Potion crafted: Mana Tonic!');
    return true;
  }, [hasReagent, spendReagent, addMana, addXp, showToast]);

  const quickCraftScroll = useCallback((): boolean => {
    if (!hasReagent('midnight_ink', 1)) return false;
    if (!spendReagent('midnight_ink', 1)) return false;
    addXp(15);
    addCoins(30);
    showToast('Scroll crafted: Arcane Scroll!');
    return true;
  }, [hasReagent, spendReagent, addXp, addCoins, showToast]);

  const quickCraftTalisman = useCallback((): boolean => {
    if (!hasReagent('star_fragment', 1) || !hasReagent('fairy_wing', 1)) return false;
    if (!spendReagent('star_fragment', 1) || !spendReagent('fairy_wing', 1)) return false;
    setState(prev => ({ ...prev, enchantBonus: prev.enchantBonus + 0.05 }));
    showToast('Talisman crafted: Star-Fairy Talisman!');
    addXp(25);
    return true;
  }, [hasReagent, spendReagent, addXp, showToast]);

  const quickBrewElixir = useCallback((): boolean => {
    if (!hasReagent('phoenix_tear', 1) || !hasReagent('dragon_scale', 1)) return false;
    if (!spendReagent('phoenix_tear', 1) || !spendReagent('dragon_scale', 1)) return false;
    addMana(999);
    addXp(100);
    addCoins(500);
    showToast('Elixir brewed: Phoenix Dragon Elixir!');
    return true;
  }, [hasReagent, spendReagent, addMana, addXp, addCoins, showToast]);

  // ─── Bulk Operations ──────────────────────────────────────────────────────

  const harvestMultiple = useCallback((count: number) => {
    for (let i = 0; i < count; i++) {
      harvestRandomEssence();
    }
  }, [harvestRandomEssence]);

  const refineMultiple = useCallback((essenceId: string, count: number): number => {
    let refined = 0;
    for (let i = 0; i < count; i++) {
      if (refineEssence(essenceId)) refined++;
    }
    return refined;
  }, [refineEssence]);

  const disenchantAllArtifacts = useCallback((): number => {
    let count = 0;
    const ids = Object.keys(stateRef.current.artifacts);
    for (const id of ids) {
      destroyArtifact(id);
      count++;
    }
    return count;
  }, [destroyArtifact]);

  // ─── Stat Queries ─────────────────────────────────────────────────────────

  const getEssencesByRarity = useCallback((rarity: MFRarity): EssenceInstance[] => {
    return MF_ESSENCES.filter(e => e.rarity === rarity).map(e => stateRef.current.essences[e.id]).filter(Boolean) as EssenceInstance[];
  }, []);

  const getArtifactsByRarity = useCallback((rarity: MFRarity): ArtifactInstance[] => {
    return Object.values(stateRef.current.artifacts).filter(a => a.rarity === rarity);
  }, []);

  const getInventoryValue = useCallback((): number => {
    let total = 0;
    for (const [id, count] of Object.entries(stateRef.current.inventory)) {
      const def = MF_REAGENTS.find(r => r.id === id);
      if (def) total += def.value * count;
    }
    return total;
  }, []);

  const getRarityColor = useCallback((rarity: MFRarity): string => {
    switch (rarity) {
      case 'Common': return '#9CA3AF';
      case 'Uncommon': return '#22C55E';
      case 'Rare': return '#3B82F6';
      case 'Epic': return MF_VIOLET;
      case 'Legendary': return MF_GOLD;
    }
  }, []);

  const getForgeBonus = useCallback((forgeId: string): number => {
    const f = stateRef.current.forges[forgeId];
    if (!f || !f.active) return 1;
    const def = MF_FORGES.find(fd => fd.id === forgeId);
    if (!def) return 1;
    return def.bonusValue * (1 + (f.level - 1) * 0.1);
  }, []);

  const getActiveForgeBonuses = useCallback((): Record<string, number> => {
    const bonuses: Record<string, number> = { harvest: 1, craft: 1, enchant: 1, spell: 1, refine: 1, all: 1 };
    for (const key of Object.keys(stateRef.current.forges)) {
      const f = stateRef.current.forges[key];
      if (!f || !f.active) continue;
      const def = MF_FORGES.find(fd => fd.id === f.id);
      if (!def) continue;
      const bonus = def.bonusValue * (1 + (f.level - 1) * 0.1);
      if (bonuses[def.bonusType] !== undefined) {
        bonuses[def.bonusType] *= bonus;
      }
    }
    return bonuses;
  }, []);

  // ─── Color Helpers ────────────────────────────────────────────────────────

  const getPrimaryColor = useCallback((): string => MF_VIOLET, []);
  const getSecondaryColor = useCallback((): string => MF_LAVENDER, []);
  const getAccentColor = useCallback((): string => MF_GOLD, []);
  const getBackgroundGradient = useCallback((): string => {
    return `linear-gradient(135deg, ${MF_AMETHYST}, ${MF_VIOLET}, ${MF_LAVENDER})`;
  }, []);

  const getRarityBorderColor = useCallback((rarity: MFRarity): string => {
    switch (rarity) {
      case 'Common': return '#6B7280';
      case 'Uncommon': return '#16A34A';
      case 'Rare': return '#2563EB';
      case 'Epic': return '#7C3AED';
      case 'Legendary': return '#D97706';
    }
  }, []);

  // ─── Export Formatting ────────────────────────────────────────────────────

  const exportState = useCallback((): string => {
    return JSON.stringify(stateRef.current, null, 2);
  }, []);

  const importState = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as MysticForgeState;
      if (parsed.level !== undefined && parsed.essences !== undefined) {
        setState(parsed);
        showToast('State imported successfully!');
        return true;
      }
      return false;
    } catch {
      showToast('Failed to import state: invalid JSON.');
      return false;
    }
  }, [showToast]);

  const getSaveData = useCallback((): MysticForgeState => {
    return { ...stateRef.current };
  }, []);

  // ─── Event Handlers (React-friendly) ──────────────────────────────────────

  const handleHarvestClick = useCallback((essenceId: string) => {
    addEssence(essenceId, 1 + Math.floor(Math.random() * 3));
  }, [addEssence]);

  const handleRefineClick = useCallback((essenceId: string) => {
    refineEssence(essenceId);
  }, [refineEssence]);

  const handleForgeWordClick = useCallback((word: string) => {
    forgeWord(word);
  }, [forgeWord]);

  const handleCastSpellClick = useCallback((spellId: string) => {
    castSpell(spellId);
  }, [castSpell]);

  const handleEnchantClick = useCallback((artifactId: string) => {
    enchantArtifact(artifactId);
  }, [enchantArtifact]);

  const handleInscribeRuneClick = useCallback((runeId: string) => {
    inscribeRune(runeId);
  }, [inscribeRune]);

  const handleForgeSelect = useCallback((forgeId: string) => {
    setSelectedForgeId(forgeId);
  }, [setSelectedForgeId]);

  const handleEssenceSelect = useCallback((essenceId: string) => {
    setSelectedEssenceId(essenceId);
  }, [setSelectedEssenceId]);

  const handleCreateArtifactClick = useCallback((essenceId: string, name: string) => {
    createArtifact(essenceId, name);
  }, [createArtifact]);

  const handleExperimentClick = useCallback((essenceId: string, reagentId: string) => {
    performExperiment(essenceId, reagentId);
  }, [performExperiment]);

  const handleClaimDailyClick = useCallback(() => {
    if (canClaimDaily) { claimDailyReward(); }
  }, [canClaimDaily, claimDailyReward]);

  const handleBuyReagentClick = useCallback((reagentId: string, cost: number) => {
    if (spendCoins(cost)) {
      addReagent(reagentId, 1);
      showToast('Reagent purchased!');
    }
  }, [spendCoins, addReagent, showToast]);

  const handleBuildStructureClick = useCallback((structureId: string) => {
    buildStructure(structureId);
  }, [buildStructure]);

  const handleEquipTitleClick = useCallback((titleId: number) => {
    equipTitle(titleId);
  }, [equipTitle]);

  const handleTitleClick = useCallback((titleId: number) => {
    if (titleId !== undefined) { equipTitle(titleId); }
  }, [equipTitle]);

  const handleRuneUseClick = useCallback((runeId: string) => {
    activateRune(runeId);
  }, [activateRune]);

  const handleRuneRechargeClick = useCallback((runeId: string) => {
    rechargeRune(runeId);
  }, [rechargeRune]);

  const handleDestroyArtifactClick = useCallback((artifactId: string) => {
    destroyArtifact(artifactId);
  }, [destroyArtifact]);

  const handleResetClick = useCallback(() => {
    resetState();
  }, [resetState]);

  const handleTriggerSurgeClick = useCallback(() => {
    triggerManaSurge();
  }, [triggerManaSurge]);

  const handleQuickPotionClick = useCallback(() => {
    quickCraftPotion();
  }, [quickCraftPotion]);

  const handleQuickScrollClick = useCallback(() => {
    quickCraftScroll();
  }, [quickCraftScroll]);

  const handleQuickTalismanClick = useCallback(() => {
    quickCraftTalisman();
  }, [quickCraftTalisman]);

  const handleQuickElixirClick = useCallback(() => {
    quickBrewElixir();
  }, [quickBrewElixir]);

  const handleCheckAchievementsClick = useCallback(() => {
    checkAchievements();
  }, [checkAchievements]);

  const handleExportClick = useCallback(() => {
    const data = exportState();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mystic-forge-save.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [exportState]);

  const handleImportClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const text = ev.target?.result as string;
          importState(text);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [importState]);

  // ─── Description Helpers ──────────────────────────────────────────────────

  const getEssenceDescription = useCallback((essenceId: string): string => {
    const def = MF_ESSENCES.find(e => e.id === essenceId);
    return def?.description ?? 'Unknown essence.';
  }, []);

  const getForgeDescription = useCallback((forgeId: string): string => {
    const def = MF_FORGES.find(f => f.id === forgeId);
    return def?.description ?? 'Unknown forge.';
  }, []);

  const getSpellDescription = useCallback((spellId: string): string => {
    const def = MF_SPELLS.find(s => s.id === spellId);
    return def?.description ?? 'Unknown spell.';
  }, []);

  const getReagentDescription = useCallback((reagentId: string): string => {
    const def = MF_REAGENTS.find(r => r.id === reagentId);
    return def?.description ?? 'Unknown reagent.';
  }, []);

  const getStructureDescription = useCallback((structureId: string): string => {
    const def = MF_STRUCTURES.find(s => s.id === structureId);
    return def?.description ?? 'Unknown structure.';
  }, []);

  const getAchievementDescription = useCallback((achievementId: string): string => {
    const def = MF_ACHIEVEMENTS.find(a => a.id === achievementId);
    return def?.description ?? 'Unknown achievement.';
  }, []);

  const getTitleDescription = useCallback((titleId: number): string => {
    const def = MF_TITLES.find(t => t.id === titleId);
    return def?.requirement ?? 'Unknown title.';
  }, []);

  const getEssenceColor = useCallback((essenceId: string): string => {
    const def = MF_ESSENCES.find(e => e.id === essenceId);
    return def?.color ?? '#9CA3AF';
  }, []);

  const getEssenceIcon = useCallback((essenceId: string): string => {
    const def = MF_ESSENCES.find(e => e.id === essenceId);
    return def?.icon ?? '❓';
  }, []);

  const getForgeIcon = useCallback((forgeId: string): string => {
    const def = MF_FORGES.find(f => f.id === forgeId);
    return def?.icon ?? '⚒️';
  }, []);

  const getSpellIcon = useCallback((spellId: string): string => {
    const def = MF_SPELLS.find(s => s.id === spellId);
    return def?.icon ?? '✨';
  }, []);

  const getStructureIcon = useCallback((structureId: string): string => {
    const def = MF_STRUCTURES.find(s => s.id === structureId);
    return def?.icon ?? '🏠';
  }, []);

  // ─── Misc Helpers ─────────────────────────────────────────────────────────

  const getTotalPlayTime = useCallback((): string => {
    const experiments = stateRef.current.experiments.length;
    const hours = Math.floor(experiments / 10);
    const mins = Math.floor((experiments % 10) * 6);
    return `${hours}h ${mins}m`;
  }, []);

  const getPowerRank = useCallback((): string => {
    const power = totalArtifactPower + stateRef.current.level * 10;
    if (power >= 10000) return 'Mythic';
    if (power >= 5000) return 'Legendary';
    if (power >= 2000) return 'Epic';
    if (power >= 500) return 'Rare';
    if (power >= 100) return 'Uncommon';
    return 'Common';
  }, [totalArtifactPower]);

  const formatNumber = useCallback((n: number): string => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  }, []);

  const getLevelTitle = useCallback((): string => {
    const lvl = stateRef.current.level;
    if (lvl >= 30) return 'Grand Artificer';
    if (lvl >= 25) return 'Master Forgemaster';
    if (lvl >= 20) return 'Archmage';
    if (lvl >= 15) return 'High Enchanter';
    if (lvl >= 10) return 'Journeyman Alchemist';
    if (lvl >= 5) return 'Apprentice Forgemaster';
    return 'Novice Alchemist';
  }, []);

  const getNextUnlock = useCallback((): { type: string; name: string; level: number } | null => {
    const lvl = stateRef.current.level;
    const nextForge = MF_FORGES.find(f => f.unlockLevel > lvl);
    const nextSpell = MF_SPELLS.find(s => s.unlockLevel > lvl);
    const nextStruct = MF_STRUCTURES.find(s => s.unlockLevel > lvl);
    const candidates: { type: string; name: string; level: number }[] = [];
    if (nextForge) candidates.push({ type: 'Forge', name: nextForge.name, level: nextForge.unlockLevel });
    if (nextSpell) candidates.push({ type: 'Spell', name: nextSpell.name, level: nextSpell.unlockLevel });
    if (nextStruct) candidates.push({ type: 'Structure', name: nextStruct.name, level: nextStruct.unlockLevel });
    candidates.sort((a, b) => a.level - b.level);
    return candidates.length > 0 ? candidates[0] : null;
  }, []);

  const getDailyQuestDescription = useCallback((): string => {
    const q = stateRef.current.dailyQuest;
    switch (q.type) {
      case 'harvest_essence': return `Harvest ${q.target} essences`;
      case 'craft_artifact': return `Craft ${q.target} artifacts`;
      case 'cast_spell': return `Cast ${q.target} spells`;
      case 'refine_essence': return `Refine essences ${q.target} times`;
      case 'inscribe_rune': return `Inscribe ${q.target} runes`;
      case 'forge_words': return `Forge ${q.target} words`;
      default: return 'Complete the daily quest';
    }
  }, []);

  const getManaSurgeDescription = useCallback((): string => {
    const s = stateRef.current.manaSurge;
    if (!s.active) return 'No active mana surge.';
    return `${s.type} surge active! x${s.multiplier.toFixed(1)} for ${Math.ceil(s.remainingMs / 1000)}s`;
  }, []);

  const getRandomDiscovery = useCallback((): string | null => {
    const undiscovered = MF_ESSENCES.filter(e => !stateRef.current.essences[e.id]?.discovered);
    if (undiscovered.length === 0) return null;
    return undiscovered[Math.floor(Math.random() * undiscovered.length)].id;
  }, []);

  const performRandomDiscovery = useCallback((): string | null => {
    const id = getRandomDiscovery();
    if (!id) return null;
    discoverEssence(id);
    return id;
  }, [getRandomDiscovery, discoverEssence]);

  const getExperimentSuccessRate = useCallback((): number => {
    const total = stateRef.current.experiments.length;
    if (total === 0) return 0;
    const successes = stateRef.current.experiments.filter(e => e.result === 'breakthrough' || e.result === 'stable_compound' || e.result === 'mystic_resonance').length;
    return Math.floor((successes / total) * 100);
  }, []);

  const getMostHarvestedEssence = useCallback((): string | null => {
    let maxCount = 0;
    let maxId: string | null = null;
    for (const key of Object.keys(stateRef.current.essences)) {
      const e = stateRef.current.essences[key];
      if (e && e.harvestCount > maxCount) {
        maxCount = e.harvestCount;
        maxId = key;
      }
    }
    return maxId;
  }, []);

  const getMostPowerfulArtifact = useCallback((): ArtifactInstance | null => {
    let maxPower = 0;
    let best: ArtifactInstance | null = null;
    for (const key of Object.keys(stateRef.current.artifacts)) {
      const a = stateRef.current.artifacts[key];
      if (a) {
        const power = Math.floor(a.power * (1 + a.enchantLevel * 0.2));
        if (power > maxPower) { maxPower = power; best = a; }
      }
    }
    return best;
  }, []);

  const hasAnyArtifacts = useCallback((): boolean => {
    return Object.keys(stateRef.current.artifacts).length > 0;
  }, []);

  const hasAnyRunes = useCallback((): boolean => {
    return Object.values(stateRef.current.runes).some(r => r.inscribed);
  }, []);

  const getRuneCount = useCallback((): number => {
    return Object.values(stateRef.current.runes).filter(r => r.inscribed).length;
  }, []);

  const getTotalRunesCharges = useCallback((): number => {
    return Object.values(stateRef.current.runes).reduce((sum, r) => sum + r.charges, 0);
  }, []);

  const getCompletionPercent = useCallback((): number => {
    const totalItems = MF_ESSENCES.length + MF_FORGES.length + MF_ACHIEVEMENTS.length + MF_SPELLS.length;
    let completed = 0;
    completed += discoveredEssenceCount;
    completed += unlockedForgeCount;
    completed += stateRef.current.achievements.length;
    completed += MF_SPELLS.filter(s => s.unlockLevel <= stateRef.current.level).length;
    return Math.floor((completed / totalItems) * 100);
  }, [discoveredEssenceCount, unlockedForgeCount]);

  const getStatsSummary = useCallback((): Record<string, number | string> => {
    const s = stateRef.current;
    return {
      level: s.level,
      xp: `${s.xp}/${s.maxXp}`,
      coins: s.coins,
      mana: `${s.mana}/${s.maxMana}`,
      essencesDiscovered: discoveredEssenceCount,
      totalEssences: MF_ESSENCES.length,
      forgesUnlocked: unlockedForgeCount,
      totalForges: MF_FORGES.length,
      artifactsCreated: Object.keys(s.artifacts).length,
      totalHarvests: s.totalHarvests,
      totalCrafts: s.totalCrafts,
      totalEnchants: s.totalEnchants,
      wordsForged: s.totalWordsForged,
      dayStreak: s.dayStreak,
      achievements: s.achievements.length,
      totalAchievements: MF_ACHIEVEMENTS.length,
      completionPercent: getCompletionPercent(),
      powerRank: getPowerRank(),
      title: currentTitleDef.name,
    };
  }, [discoveredEssenceCount, unlockedForgeCount, getCompletionPercent, getPowerRank, currentTitleDef]);

  // ══════════════════════════════════════════════════════════════════════════════
  // RETURN: Hook interface with state + all functions + constants + computed
  // ══════════════════════════════════════════════════════════════════════════════

  return {
    // ── State ──
    state,
    // ── Constants ──
    MF_ESSENCES,
    MF_FORGES,
    MF_REAGENTS,
    MF_STRUCTURES,
    MF_SPELLS,
    MF_ACHIEVEMENTS,
    MF_TITLES,
    MF_RARITY_MULTIPLIER,
    MF_VIOLET,
    MF_LAVENDER,
    MF_GOLD,
    MF_AMETHYST,
    MF_PLUM,
    MF_STARLIGHT,
    MF_EMBER,
    MF_OBSIDIAN,
    MF_MIST,
    MF_ARCANE_BLUE,
    // ── Computed ──
    xpPercent,
    manaPercent,
    currentTitleDef,
    totalEssenceCount,
    totalArtifactPower,
    activeForgeCount,
    totalInventoryCount,
    unlockedForgeCount,
    discoveredEssenceCount,
    dailyQuestPercent,
    effectiveMultiplier,
    spellsUnlockedCount,
    canClaimDaily,
    // ── Core Setters ──
    setLevel,
    setXp,
    setCoins,
    setMana,
    setMaxMana,
    setMaxXp,
    setDayStreak,
    setCurrentTitle,
    setGlobalMultiplier,
    setSelectedForgeId,
    setSelectedEssenceId,
    setSelectedArtifactId,
    // ── Toast ──
    showToast,
    hideToast,
    // ── XP & Leveling ──
    addXp,
    addCoins,
    spendCoins,
    addMana,
    spendMana,
    // ── Essences ──
    getEssenceDef,
    getEssence,
    addEssence,
    spendEssence,
    refineEssence,
    discoverEssence,
    canRefine,
    getEssencesByRarity,
    harvestRandomEssence,
    harvestEssenceByType,
    harvestMultiple,
    refineMultiple,
    getEssenceDescription,
    getEssenceColor,
    getEssenceIcon,
    // ── Forges ──
    getForgeDef,
    getForge,
    unlockForge,
    activateForge,
    useForge,
    upgradeForge,
    canUnlockForge,
    getForgeBonus,
    getActiveForgeBonuses,
    getForgeDescription,
    getForgeIcon,
    // ── Artifacts ──
    createArtifact,
    enchantArtifact,
    destroyArtifact,
    getArtifactPower,
    canEnchantArtifact,
    getArtifactList,
    getArtifactsByRarity,
    disenchantAllArtifacts,
    hasAnyArtifacts,
    getMostPowerfulArtifact,
    // ── Runes ──
    inscribeRune,
    activateRune,
    rechargeRune,
    canInscribeRune,
    hasAnyRunes,
    getRuneCount,
    getTotalRunesCharges,
    // ── Spells ──
    canCastSpell,
    castSpell,
    getSpellDef,
    getUnlockedSpells,
    getLockedSpells,
    getSpellDescription,
    getSpellIcon,
    // ── Reagents ──
    getReagentDef,
    addReagent,
    spendReagent,
    hasReagent,
    getReagentDescription,
    // ── Structures ──
    getStructureDef,
    buildStructure,
    hasStructure,
    getStructureDescription,
    getStructureIcon,
    // ── Experiments ──
    performExperiment,
    getRecentExperiments,
    getExperimentSuccessRate,
    // ── Mana Surge ──
    triggerManaSurge,
    tickManaSurge,
    clearManaSurge,
    getManaSurgeDescription,
    // ── Daily Quest ──
    generateDailyQuest,
    advanceDailyQuest,
    claimDailyReward,
    getDailyQuestDescription,
    // ── Word Forging ──
    forgeWord,
    getForgeWordMultiplier,
    // ── Achievements ──
    checkAchievements,
    isAchievementUnlocked,
    getAchievementProgress,
    getAchievementDescription,
    // ── Titles ──
    getAvailableTitles,
    equipTitle,
    getTitleDescription,
    // ── Quick Craft ──
    quickCraftPotion,
    quickCraftScroll,
    quickCraftTalisman,
    quickBrewElixir,
    // ── Bonus Setters ──
    setForgeSpeedBonus,
    setEssenceYieldBonus,
    setSpellPowerBonus,
    setEnchantBonus,
    // ── Discovery ──
    getRandomDiscovery,
    performRandomDiscovery,
    // ── Colors ──
    getPrimaryColor,
    getSecondaryColor,
    getAccentColor,
    getBackgroundGradient,
    getRarityColor,
    getRarityBorderColor,
    // ── State Management ──
    resetState,
    getState,
    exportState,
    importState,
    getSaveData,
    // ── Event Handlers ──
    handleHarvestClick,
    handleRefineClick,
    handleForgeWordClick,
    handleCastSpellClick,
    handleEnchantClick,
    handleInscribeRuneClick,
    handleForgeSelect,
    handleEssenceSelect,
    handleCreateArtifactClick,
    handleExperimentClick,
    handleClaimDailyClick,
    handleBuyReagentClick,
    handleBuildStructureClick,
    handleEquipTitleClick,
    handleTitleClick,
    handleRuneUseClick,
    handleRuneRechargeClick,
    handleDestroyArtifactClick,
    handleResetClick,
    handleTriggerSurgeClick,
    handleQuickPotionClick,
    handleQuickScrollClick,
    handleQuickTalismanClick,
    handleQuickElixirClick,
    handleCheckAchievementsClick,
    handleExportClick,
    handleImportClick,
    // ── Misc ──
    formatNumber,
    getLevelTitle,
    getNextUnlock,
    getTotalPlayTime,
    getPowerRank,
    getMostHarvestedEssence,
    getInventoryValue,
    getCompletionPercent,
    getStatsSummary,
  };
}

// ─── Helper Functions (outside hook) ────────────────────────────────────────

function getYesterdayDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function prev_discoveries_includes(state: MysticForgeState, key: string): boolean {
  return state.discoveries.includes(key);
}

function unlockedForgeCount_for_state(s: MysticForgeState): number {
  let count = 0;
  for (const key of Object.keys(s.forges)) {
    if (s.forges[key]?.unlocked) count++;
  }
  return count;
}

function maxEnchant_for_state(s: MysticForgeState): number {
  let max = 0;
  for (const key of Object.keys(s.artifacts)) {
    const a = s.artifacts[key];
    if (a && a.enchantLevel > max) max = a.enchantLevel;
  }
  return max;
}

function inscribedRuneCount(s: MysticForgeState): number {
  let count = 0;
  for (const key of Object.keys(s.runes)) {
    if (s.runes[key]?.inscribed) count++;
  }
  return count;
}

function hasLegendaryEssence(s: MysticForgeState): boolean {
  const legendaryIds = MF_ESSENCES.filter(e => e.rarity === 'Legendary').map(e => e.id);
  return legendaryIds.some(id => s.essences[id]?.discovered);
}
