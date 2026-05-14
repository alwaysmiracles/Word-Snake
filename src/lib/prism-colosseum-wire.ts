import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// Prism Colosseum — Word Snake Wire Module
// ───────────────────────────────────────────────────────────────────────────────
// A legendary arena where light itself becomes a weapon. Players forge prism
// weapons, compete in rainbow tournaments, and master the spectrum of
// light-based combat across eight dazzling arena zones.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Color Theme Constants ────────────────────────────────────────────────────

const PB_COLOR_RUBY = '#E0115F';
const PB_COLOR_SAPPHIRE = '#0F52BA';
const PB_COLOR_EMERALD = '#50C878';
const PB_COLOR_AMBER = '#FFBF00';
const PB_COLOR_PRISM = 'linear-gradient(90deg, #E0115F, #0F52BA, #50C878, #FFBF00)';
const PB_COLOR_AMETHYST = '#9B59B6';
const PB_COLOR_OBSIDIAN = '#1a1a2e';
const PB_COLOR_RAINBOW = '#FF6B6B';
const PB_COLOR_WHITE_LIGHT = '#F8F9FA';
const PB_COLOR_DARK_PRISM = '#16213E';
const PB_COLOR_GOLD_GLOW = '#FFD700';
const PB_COLOR_SILVER_SHINE = '#C0C0C0';

// ─── Rarity Tier Constants ────────────────────────────────────────────────────

const PB_RARITY_COMMON = 'common';
const PB_RARITY_UNUSUAL = 'unusual';
const PB_RARITY_RARE = 'rare';
const PB_RARITY_EPIC = 'epic';
const PB_RARITY_LEGENDARY = 'legendary';

const PB_RARITY_COLORS: Record<string, string> = {
  [PB_RARITY_COMMON]: '#9E9E9E',
  [PB_RARITY_UNUSUAL]: '#4CAF50',
  [PB_RARITY_RARE]: '#00CED1',
  [PB_RARITY_EPIC]: PB_COLOR_AMETHYST,
  [PB_RARITY_LEGENDARY]: PB_COLOR_GOLD_GLOW,
};

const PB_RARITY_MULTIPLIER: Record<string, number> = {
  [PB_RARITY_COMMON]: 1,
  [PB_RARITY_UNUSUAL]: 2,
  [PB_RARITY_RARE]: 4,
  [PB_RARITY_EPIC]: 8,
  [PB_RARITY_LEGENDARY]: 16,
};

// ─── Spectrum Type Constants ──────────────────────────────────────────────────

const PB_SPECTRUM_RED = 'red';
const PB_SPECTRUM_ORANGE = 'orange';
const PB_SPECTRUM_YELLOW = 'yellow';
const PB_SPECTRUM_GREEN = 'green';
const PB_SPECTRUM_BLUE = 'blue';
const PB_SPECTRUM_INDIGO = 'indigo';
const PB_SPECTRUM_VIOLET = 'violet';
const PB_SPECTRUM_WHITE = 'white';
const PB_SPECTRUM_AMETHYST = 'amethyst';
const PB_SPECTRUM_GOLD_GLOW = 'gold_glow';
const PB_SPECTRUM_PRISM = 'prism';

const PB_SPECTRUM_COLORS: Record<string, string> = {
  [PB_SPECTRUM_RED]: PB_COLOR_RUBY,
  [PB_SPECTRUM_ORANGE]: '#FF8C00',
  [PB_SPECTRUM_YELLOW]: PB_COLOR_AMBER,
  [PB_SPECTRUM_GREEN]: PB_COLOR_EMERALD,
  [PB_SPECTRUM_BLUE]: PB_COLOR_SAPPHIRE,
  [PB_SPECTRUM_INDIGO]: '#4B0082',
  [PB_SPECTRUM_VIOLET]: PB_COLOR_AMETHYST,
  [PB_SPECTRUM_WHITE]: PB_COLOR_WHITE_LIGHT,
  [PB_SPECTRUM_PRISM]: '#FF69B4',
};

const PB_ALL_SPECTRUMS = [
  PB_SPECTRUM_RED, PB_SPECTRUM_ORANGE, PB_SPECTRUM_YELLOW,
  PB_SPECTRUM_GREEN, PB_SPECTRUM_BLUE, PB_SPECTRUM_INDIGO,
  PB_SPECTRUM_VIOLET, PB_SPECTRUM_WHITE, PB_SPECTRUM_PRISM,
];

// ─── Title Definitions (8) ────────────────────────────────────────────────────

const PB_TITLES = [
  { name: 'Light Novice', requiredRenown: 0, icon: '🕯️', bonusPower: 0, bonusXp: 0 },
  { name: 'Prism Apprentice', requiredRenown: 100, icon: '💎', bonusPower: 5, bonusXp: 5 },
  { name: 'Spectrum Adept', requiredRenown: 300, icon: '🌈', bonusPower: 12, bonusXp: 10 },
  { name: 'Chromatic Knight', requiredRenown: 600, icon: '⚔️', bonusPower: 20, bonusXp: 18 },
  { name: 'Radiant Champion', requiredRenown: 1200, icon: '🌟', bonusPower: 30, bonusXp: 25 },
  { name: 'Prism Warrior', requiredRenown: 2500, icon: '🔮', bonusPower: 45, bonusXp: 35 },
  { name: 'Luminary Overlord', requiredRenown: 5000, icon: '👑', bonusPower: 65, bonusXp: 50 },
  { name: 'Prism Champion', requiredRenown: 10000, icon: '🏆', bonusPower: 100, bonusXp: 75 },
];

// ─── Arena Zone Definitions (8) ───────────────────────────────────────────────

interface ArenaZoneDef {
  id: string;
  name: string;
  description: string;
  spectrumType: string;
  unlockCost: number;
  battleBonus: number;
  xpMultiplier: number;
  gemBonus: number;
  color: string;
  requiredRenown: number;
}

const PB_ARENA_ZONES: ArenaZoneDef[] = [
  { id: 'az01', name: 'Ruby Arena', description: 'A scorching arena bathed in crimson light, where champions test their raw power.', spectrumType: PB_SPECTRUM_RED, unlockCost: 0, battleBonus: 0, xpMultiplier: 1.0, gemBonus: 0, color: PB_COLOR_RUBY, requiredRenown: 0 },
  { id: 'az02', name: 'Sapphire Ring', description: 'An icy blue battlefield where calm precision defeats brute force.', spectrumType: PB_SPECTRUM_BLUE, unlockCost: 200, battleBonus: 5, xpMultiplier: 1.1, gemBonus: 1, color: PB_COLOR_SAPPHIRE, requiredRenown: 100 },
  { id: 'az03', name: 'Emerald Pit', description: 'A lush underground pit radiating verdant energy that heals champions.', spectrumType: PB_SPECTRUM_GREEN, unlockCost: 500, battleBonus: 10, xpMultiplier: 1.2, gemBonus: 2, color: PB_COLOR_EMERALD, requiredRenown: 300 },
  { id: 'az04', name: 'Amber Throne', description: 'A golden chamber where champions fight for glory and treasure.', spectrumType: PB_SPECTRUM_YELLOW, unlockCost: 800, battleBonus: 15, xpMultiplier: 1.3, gemBonus: 3, color: PB_COLOR_AMBER, requiredRenown: 600 },
  { id: 'az05', name: 'Violet Sanctum', description: 'A mystical violet sanctuary where arcane prism powers are amplified.', spectrumType: PB_SPECTRUM_VIOLET, unlockCost: 1500, battleBonus: 20, xpMultiplier: 1.4, gemBonus: 4, color: PB_COLOR_AMETHYST, requiredRenown: 1200 },
  { id: 'az06', name: 'Obsidian Depths', description: 'A pitch-black arena where only pure light can guide champions to victory.', spectrumType: PB_SPECTRUM_INDIGO, unlockCost: 2500, battleBonus: 25, xpMultiplier: 1.5, gemBonus: 5, color: PB_COLOR_OBSIDIAN, requiredRenown: 2500 },
  { id: 'az07', name: 'Crystal Cascade', description: 'A shimmering waterfall of light prisms that refracts every attack.', spectrumType: PB_SPECTRUM_ORANGE, unlockCost: 4000, battleBonus: 30, xpMultiplier: 1.6, gemBonus: 6, color: '#FF8C00', requiredRenown: 5000 },
  { id: 'az08', name: 'Prism Apex', description: 'The ultimate arena at the apex where all colors merge into pure white light.', spectrumType: PB_SPECTRUM_WHITE, unlockCost: 8000, battleBonus: 40, xpMultiplier: 2.0, gemBonus: 10, color: PB_COLOR_WHITE_LIGHT, requiredRenown: 10000 },
];

// ─── Prism Gem Definitions (30) ──────────────────────────────────────────────

interface PrismGemDef {
  id: string;
  name: string;
  spectrumType: string;
  rarity: string;
  lightPower: number;
  sellPrice: number;
  description: string;
  color: string;
}

const PB_GEMS: PrismGemDef[] = [
  // ── Common (8) ──
  { id: 'gem01', name: 'Rough Ruby Shard', spectrumType: PB_SPECTRUM_RED, rarity: PB_RARITY_COMMON, lightPower: 5, sellPrice: 10, description: 'A rough shard of ruby crystal with faint inner glow.', color: '#E0115F' },
  { id: 'gem02', name: 'Clouded Sapphire', spectrumType: PB_SPECTRUM_BLUE, rarity: PB_RARITY_COMMON, lightPower: 5, sellPrice: 10, description: 'A clouded sapphire that barely refracts light.', color: '#0F52BA' },
  { id: 'gem03', name: 'Raw Emerald Chip', spectrumType: PB_SPECTRUM_GREEN, rarity: PB_RARITY_COMMON, lightPower: 4, sellPrice: 8, description: 'A small emerald chip with uneven facets.', color: '#50C878' },
  { id: 'gem04', name: 'Amber Bead', spectrumType: PB_SPECTRUM_YELLOW, rarity: PB_RARITY_COMMON, lightPower: 4, sellPrice: 8, description: 'A simple amber bead that captures sunlight.', color: '#FFBF00' },
  { id: 'gem05', name: 'Flawed Amethyst', spectrumType: PB_SPECTRUM_VIOLET, rarity: PB_RARITY_COMMON, lightPower: 5, sellPrice: 10, description: 'An amethyst with visible internal cracks.', color: '#9B59B6' },
  { id: 'gem06', name: 'Dull Indigo Stone', spectrumType: PB_SPECTRUM_INDIGO, rarity: PB_RARITY_COMMON, lightPower: 3, sellPrice: 6, description: 'A dark indigo stone lacking luster.', color: '#4B0082' },
  { id: 'gem07', name: 'Tangerine Prism', spectrumType: PB_SPECTRUM_ORANGE, rarity: PB_RARITY_COMMON, lightPower: 4, sellPrice: 8, description: 'A small orange prism with basic refraction.', color: '#FF8C00' },
  { id: 'gem08', name: 'Frosted Quartz', spectrumType: PB_SPECTRUM_WHITE, rarity: PB_RARITY_COMMON, lightPower: 3, sellPrice: 7, description: 'A frosted quartz crystal with dim glow.', color: '#F8F9FA' },
  // ── Unusual (7) ──
  { id: 'gem09', name: 'Carved Ruby Lens', spectrumType: PB_SPECTRUM_RED, rarity: PB_RARITY_UNUSUAL, lightPower: 15, sellPrice: 35, description: 'A precisely cut ruby lens that focuses red light into beams.', color: '#E0115F' },
  { id: 'gem10', name: 'Starlight Sapphire', spectrumType: PB_SPECTRUM_BLUE, rarity: PB_RARITY_UNUSUAL, lightPower: 16, sellPrice: 38, description: 'A sapphire that stores starlight within its depths.', color: '#0F52BA' },
  { id: 'gem11', name: 'Living Emerald Seed', spectrumType: PB_SPECTRUM_GREEN, rarity: PB_RARITY_UNUSUAL, lightPower: 14, sellPrice: 32, description: 'An emerald seed that pulses with growing energy.', color: '#50C878' },
  { id: 'gem12', name: 'Golden Focus Lens', spectrumType: PB_SPECTRUM_YELLOW, rarity: PB_RARITY_UNUSUAL, lightPower: 15, sellPrice: 36, description: 'A golden lens that amplifies any light passing through.', color: '#FFBF00' },
  { id: 'gem13', name: 'Violet Prism Shard', spectrumType: PB_SPECTRUM_VIOLET, rarity: PB_RARITY_UNUSUAL, lightPower: 16, sellPrice: 40, description: 'A violet shard that splits light into vivid spectrums.', color: '#9B59B6' },
  { id: 'gem14', name: 'Indigo Refractor', spectrumType: PB_SPECTRUM_INDIGO, rarity: PB_RARITY_UNUSUAL, lightPower: 14, sellPrice: 30, description: 'An indigo crystal that bends light around obstacles.', color: '#4B0082' },
  { id: 'gem15', name: 'Solar Fire Opal', spectrumType: PB_SPECTRUM_ORANGE, rarity: PB_RARITY_UNUSUAL, lightPower: 17, sellPrice: 42, description: 'A fiery opal that radiates warmth and light energy.', color: '#FF8C00' },
  // ── Rare (7) ──
  { id: 'gem16', name: 'Blood Ruby Core', spectrumType: PB_SPECTRUM_RED, rarity: PB_RARITY_RARE, lightPower: 40, sellPrice: 120, description: 'A flawless ruby core containing concentrated red light essence.', color: '#E0115F' },
  { id: 'gem17', name: 'Abyssal Sapphire', spectrumType: PB_SPECTRUM_BLUE, rarity: PB_RARITY_RARE, lightPower: 42, sellPrice: 130, description: 'A deep sapphire from the ocean floor with tidal light power.', color: '#0F52BA' },
  { id: 'gem18', name: 'Ancient Emerald Tablet', spectrumType: PB_SPECTRUM_GREEN, rarity: PB_RARITY_RARE, lightPower: 38, sellPrice: 110, description: 'An ancient emerald tablet inscribed with light runes.', color: '#50C878' },
  { id: 'gem19', name: 'Sunstone Matrix', spectrumType: PB_SPECTRUM_YELLOW, rarity: PB_RARITY_RARE, lightPower: 40, sellPrice: 125, description: 'A crystalline matrix that channels pure solar energy.', color: '#FFBF00' },
  { id: 'gem20', name: 'Amethyst Prism Array', spectrumType: PB_SPECTRUM_VIOLET, rarity: PB_RARITY_RARE, lightPower: 44, sellPrice: 135, description: 'An array of linked amethyst prisms with amplifying resonance.', color: '#9B59B6' },
  { id: 'gem21', name: 'Indigo Void Crystal', spectrumType: PB_SPECTRUM_INDIGO, rarity: PB_RARITY_RARE, lightPower: 38, sellPrice: 115, description: 'A crystal that absorbs and redirects void energy.', color: '#4B0082' },
  { id: 'gem22', name: 'Phoenix Fire Prism', spectrumType: PB_SPECTRUM_ORANGE, rarity: PB_RARITY_RARE, lightPower: 45, sellPrice: 140, description: 'A prism reborn in phoenix flame, radiating orange light.', color: '#FF8C00' },
  // ── Epic (4) ──
  { id: 'gem23', name: 'Prism Heart Ruby', spectrumType: PB_SPECTRUM_RED, rarity: PB_RARITY_EPIC, lightPower: 100, sellPrice: 400, description: 'The legendary heart ruby that powers the entire Ruby Arena.', color: '#E0115F' },
  { id: 'gem24', name: 'Tidal Sapphire Crown', spectrumType: PB_SPECTRUM_BLUE, rarity: PB_RARITY_EPIC, lightPower: 105, sellPrice: 420, description: 'A crown of tidal sapphires from the deepest ocean trench.', color: '#0F52BA' },
  { id: 'gem25', name: 'World Tree Emerald', spectrumType: PB_SPECTRUM_GREEN, rarity: PB_RARITY_EPIC, lightPower: 95, sellPrice: 380, description: 'An emerald grown from the roots of the world tree itself.', color: '#50C878' },
  { id: 'gem26', name: 'Astral Violet Gem', spectrumType: PB_SPECTRUM_VIOLET, rarity: PB_RARITY_EPIC, lightPower: 110, sellPrice: 450, description: 'A gem that falls from the astral plane during cosmic events.', color: '#9B59B6' },
  // ── Legendary (4) ──
  { id: 'gem27', name: 'White Light Diamond', spectrumType: PB_SPECTRUM_WHITE, rarity: PB_RARITY_LEGENDARY, lightPower: 250, sellPrice: 1500, description: 'The purest white light diamond, said to contain dawn itself.', color: '#F8F9FA' },
  { id: 'gem28', name: 'Prismatic Singularity', spectrumType: PB_SPECTRUM_PRISM, rarity: PB_RARITY_LEGENDARY, lightPower: 300, sellPrice: 2000, description: 'A singularity that contains every color of the spectrum at once.', color: '#FF69B4' },
  { id: 'gem29', name: 'Eternal Flame Ruby', spectrumType: PB_SPECTRUM_RED, rarity: PB_RARITY_LEGENDARY, lightPower: 280, sellPrice: 1800, description: 'A ruby that burns with undying crimson firelight forever.', color: '#E0115F' },
  { id: 'gem30', name: 'Cosmic Prism Shard', spectrumType: PB_SPECTRUM_PRISM, rarity: PB_RARITY_LEGENDARY, lightPower: 350, sellPrice: 2500, description: 'A shard of the cosmic prism that created all light in the universe.', color: '#FFD700' },
];

// ─── Prism Champion Definitions (35 across 5 tiers) ─────────────────────────

interface PrismChampionDef {
  id: string;
  name: string;
  spectrumType: string;
  rarity: string;
  lightPower: number;
  agility: number;
  description: string;
  color: string;
}

const PB_CHAMPIONS: PrismChampionDef[] = [
  // ── Common (7) ──
  { id: 'ch01', name: 'Spark Runner', spectrumType: PB_SPECTRUM_RED, rarity: PB_RARITY_COMMON, lightPower: 20, agility: 15, description: 'A nimble fighter who channels basic red light into quick strikes.', color: '#E0115F' },
  { id: 'ch02', name: 'Frost Flicker', spectrumType: PB_SPECTRUM_BLUE, rarity: PB_RARITY_COMMON, lightPower: 18, agility: 20, description: 'A swift glacial warrior who freezes opponents with blue light.', color: '#0F52BA' },
  { id: 'ch03', name: 'Sprout Sentinel', spectrumType: PB_SPECTRUM_GREEN, rarity: PB_RARITY_COMMON, lightPower: 22, agility: 12, description: 'A nature guardian whose green light heals allies in battle.', color: '#50C878' },
  { id: 'ch04', name: 'Dust Dancer', spectrumType: PB_SPECTRUM_YELLOW, rarity: PB_RARITY_COMMON, lightPower: 16, agility: 22, description: 'A golden warrior who moves like sunlight through dust.', color: '#FFBF00' },
  { id: 'ch05', name: 'Shadow Shimmer', spectrumType: PB_SPECTRUM_VIOLET, rarity: PB_RARITY_COMMON, lightPower: 19, agility: 18, description: 'A stealthy violet fighter who strikes from shadows.', color: '#9B59B6' },
  { id: 'ch06', name: 'Gloom Guardian', spectrumType: PB_SPECTRUM_INDIGO, rarity: PB_RARITY_COMMON, lightPower: 21, agility: 14, description: 'A stoic indigo defender who absorbs enemy attacks.', color: '#4B0082' },
  { id: 'ch07', name: 'Blaze Brat', spectrumType: PB_SPECTRUM_ORANGE, rarity: PB_RARITY_COMMON, lightPower: 17, agility: 21, description: 'An energetic orange fighter with unpredictable fiery moves.', color: '#FF8C00' },
  // ── Unusual (7) ──
  { id: 'ch08', name: 'Crimson Fang', spectrumType: PB_SPECTRUM_RED, rarity: PB_RARITY_UNUSUAL, lightPower: 45, agility: 35, description: 'A fearsome red champion whose fangs drip with liquid light.', color: '#E0115F' },
  { id: 'ch09', name: 'Tidal Warden', spectrumType: PB_SPECTRUM_BLUE, rarity: PB_RARITY_UNUSUAL, lightPower: 48, agility: 32, description: 'A warden of the deep whose blue light commands ocean tides.', color: '#0F52BA' },
  { id: 'ch10', name: 'Thorn Weaver', spectrumType: PB_SPECTRUM_GREEN, rarity: PB_RARITY_UNUSUAL, lightPower: 42, agility: 38, description: 'A cunning green champion who weaves light into razor thorns.', color: '#50C878' },
  { id: 'ch11', name: 'Gilt Knight', spectrumType: PB_SPECTRUM_YELLOW, rarity: PB_RARITY_UNUSUAL, lightPower: 40, agility: 40, description: 'A golden knight in gilded armor reflecting every attack.', color: '#FFBF00' },
  { id: 'ch12', name: 'Violet Mirage', spectrumType: PB_SPECTRUM_VIOLET, rarity: PB_RARITY_UNUSUAL, lightPower: 46, agility: 36, description: 'An illusionist violet champion who creates copies with light.', color: '#9B59B6' },
  { id: 'ch13', name: 'Abyss Walker', spectrumType: PB_SPECTRUM_INDIGO, rarity: PB_RARITY_UNUSUAL, lightPower: 50, agility: 30, description: 'An indigo traveler who walks between dimensions using void light.', color: '#4B0082' },
  { id: 'ch14', name: 'Ember Sage', spectrumType: PB_SPECTRUM_ORANGE, rarity: PB_RARITY_UNUSUAL, lightPower: 44, agility: 34, description: 'A wise orange sage who reads the future in flame patterns.', color: '#FF8C00' },
  // ── Rare (7) ──
  { id: 'ch15', name: 'Ruby Warlord', spectrumType: PB_SPECTRUM_RED, rarity: PB_RARITY_RARE, lightPower: 95, agility: 65, description: 'A legendary ruby warlord whose crimson aura devastates all foes.', color: '#E0115F' },
  { id: 'ch16', name: 'Sapphire Oracle', spectrumType: PB_SPECTRUM_BLUE, rarity: PB_RARITY_RARE, lightPower: 100, agility: 60, description: 'An oracle of blue light who foresees every enemy move.', color: '#0F52BA' },
  { id: 'ch17', name: 'Emerald Archon', spectrumType: PB_SPECTRUM_GREEN, rarity: PB_RARITY_RARE, lightPower: 88, agility: 72, description: 'An archon of nature whose emerald light regenerates endlessly.', color: '#50C878' },
  { id: 'ch18', name: 'Solar Paragon', spectrumType: PB_SPECTRUM_YELLOW, rarity: PB_RARITY_RARE, lightPower: 92, agility: 68, description: 'A paragon of solar power whose golden light blinds enemies.', color: '#FFBF00' },
  { id: 'ch19', name: 'Violet Enchantress', spectrumType: PB_SPECTRUM_VIOLET, rarity: PB_RARITY_RARE, lightPower: 97, agility: 63, description: 'An enchantress whose violet light controls minds and matter.', color: '#9B59B6' },
  { id: 'ch20', name: 'Indigo Colossus', spectrumType: PB_SPECTRUM_INDIGO, rarity: PB_RARITY_RARE, lightPower: 110, agility: 45, description: 'A massive indigo titan wielding a void light warhammer.', color: '#4B0082' },
  { id: 'ch21', name: 'Phoenix Blaze', spectrumType: PB_SPECTRUM_ORANGE, rarity: PB_RARITY_RARE, lightPower: 90, agility: 75, description: 'A phoenix warrior reborn from orange flame in every battle.', color: '#FF8C00' },
  // ── Epic (7) ──
  { id: 'ch22', name: 'Scarlet Empress', spectrumType: PB_SPECTRUM_RED, rarity: PB_RARITY_EPIC, lightPower: 200, agility: 120, description: 'The empress of all red light, commanding the Ruby Arena itself.', color: '#E0115F' },
  { id: 'ch23', name: 'Azure Leviathan', spectrumType: PB_SPECTRUM_BLUE, rarity: PB_RARITY_EPIC, lightPower: 210, agility: 110, description: 'A leviathan of blue light from the deepest sapphire ocean.', color: '#0F52BA' },
  { id: 'ch24', name: 'Verdant Monarch', spectrumType: PB_SPECTRUM_GREEN, rarity: PB_RARITY_EPIC, lightPower: 190, agility: 130, description: 'The monarch of emerald light who rules over all nature.', color: '#50C878' },
  { id: 'ch25', name: 'Celestial Gold', spectrumType: PB_SPECTRUM_YELLOW, rarity: PB_RARITY_EPIC, lightPower: 195, agility: 125, description: 'A celestial being forged from pure golden starlight.', color: '#FFBF00' },
  { id: 'ch26', name: 'Void Sovereign', spectrumType: PB_SPECTRUM_INDIGO, rarity: PB_RARITY_EPIC, lightPower: 220, agility: 100, description: 'The sovereign of void and indigo, master of the shadow realm.', color: '#4B0082' },
  { id: 'ch27', name: 'Amethyst Phoenix', spectrumType: PB_SPECTRUM_VIOLET, rarity: PB_RARITY_EPIC, lightPower: 205, agility: 135, description: 'A phoenix of violet light that resurrects infinitely.', color: '#9B59B6' },
  { id: 'ch28', name: 'Solar Eclipse', spectrumType: PB_SPECTRUM_ORANGE, rarity: PB_RARITY_EPIC, lightPower: 215, agility: 115, description: 'A living eclipse whose orange corona annihilates darkness.', color: '#FF8C00' },
  // ── Legendary (7) ──
  { id: 'ch29', name: 'Prismatic Titan', spectrumType: PB_SPECTRUM_PRISM, rarity: PB_RARITY_LEGENDARY, lightPower: 500, agility: 250, description: 'A titan of pure prismatic light wielding all spectrum colors.', color: '#FF69B4' },
  { id: 'ch30', name: 'White Light Seraph', spectrumType: PB_SPECTRUM_WHITE, rarity: PB_RARITY_LEGENDARY, lightPower: 480, agility: 280, description: 'An angelic seraph of white light, purity incarnate.', color: '#F8F9FA' },
  { id: 'ch31', name: 'Blood Moon King', spectrumType: PB_SPECTRUM_RED, rarity: PB_RARITY_LEGENDARY, lightPower: 520, agility: 230, description: 'The legendary king who rules during blood moon with crimson might.', color: '#E0115F' },
  { id: 'ch32', name: 'Starweaver Prime', spectrumType: PB_SPECTRUM_VIOLET, rarity: PB_RARITY_LEGENDARY, lightPower: 510, agility: 270, description: 'The prime starweaver who bends cosmic violet threads of fate.', color: '#9B59B6' },
  { id: 'ch33', name: 'Dawn Breaker', spectrumType: PB_SPECTRUM_YELLOW, rarity: PB_RARITY_LEGENDARY, lightPower: 490, agility: 260, description: 'The champion of dawn whose golden light ends eternal night.', color: '#FFD700' },
  { id: 'ch34', name: 'Eternity Prism', spectrumType: PB_SPECTRUM_PRISM, rarity: PB_RARITY_LEGENDARY, lightPower: 600, agility: 300, description: 'The eternal prism containing infinite light from all timelines.', color: '#FFD700' },
  { id: 'ch35', name: 'Omega White', spectrumType: PB_SPECTRUM_WHITE, rarity: PB_RARITY_LEGENDARY, lightPower: 550, agility: 240, description: 'The final champion of white light, embodiment of ultimate truth.', color: '#FFFFFF' },
];

// ─── Arena Structure Definitions (25, upgradeable to Lv10) ───────────────────

interface ArenaStructureDef {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  renownPerLevel: number;
  icon: string;
  category: string;
  spectrumType: string;
}

const PB_STRUCTURES: ArenaStructureDef[] = [
  { id: 'as01', name: 'Prism Forge', description: 'Forges raw light into prism weapons for champions.', baseCost: 100, costMultiplier: 1.6, maxLevel: 10, renownPerLevel: 8, icon: '⚒️', category: 'production', spectrumType: PB_SPECTRUM_PRISM },
  { id: 'as02', name: 'Light Well', description: 'Draws radiant energy from deep underground light veins.', baseCost: 80, costMultiplier: 1.5, maxLevel: 10, renownPerLevel: 6, icon: '💧', category: 'resource', spectrumType: PB_SPECTRUM_WHITE },
  { id: 'as03', name: 'Crystal Armory', description: 'Stores and maintains prism weapons and gear.', baseCost: 120, costMultiplier: 1.6, maxLevel: 10, renownPerLevel: 7, icon: '⚔️', category: 'military', spectrumType: PB_SPECTRUM_BLUE },
  { id: 'as04', name: 'Spectrum Lab', description: 'Researches new spectrum abilities and light tech.', baseCost: 200, costMultiplier: 1.8, maxLevel: 10, renownPerLevel: 10, icon: '🔬', category: 'research', spectrumType: PB_SPECTRUM_VIOLET },
  { id: 'as05', name: 'Champion Barracks', description: 'Houses and trains prism champions for combat.', baseCost: 150, costMultiplier: 1.7, maxLevel: 10, renownPerLevel: 9, icon: '🏰', category: 'training', spectrumType: PB_SPECTRUM_RED },
  { id: 'as06', name: 'Gem Cutting Table', description: 'Cuts and refines raw gems into powerful focus lenses.', baseCost: 100, costMultiplier: 1.5, maxLevel: 10, renownPerLevel: 7, icon: '💎', category: 'production', spectrumType: PB_SPECTRUM_GREEN },
  { id: 'as07', name: 'Refraction Tower', description: 'A tower that bends and amplifies ambient light across the arena.', baseCost: 250, costMultiplier: 1.8, maxLevel: 10, renownPerLevel: 12, icon: '🗼', category: 'defense', spectrumType: PB_SPECTRUM_PRISM },
  { id: 'as08', name: 'Healing Prism Garden', description: 'A garden of prisms that emit restorative light for wounded champions.', baseCost: 130, costMultiplier: 1.6, maxLevel: 10, renownPerLevel: 8, icon: '🌺', category: 'support', spectrumType: PB_SPECTRUM_GREEN },
  { id: 'as09', name: 'Arena Grandstand', description: 'Expands spectator seating, increasing renown from victories.', baseCost: 180, costMultiplier: 1.7, maxLevel: 10, renownPerLevel: 11, icon: '🏟️', category: 'economy', spectrumType: PB_SPECTRUM_YELLOW },
  { id: 'as10', name: 'Shadow Vault', description: 'Stores captured dark light for conversion into usable energy.', baseCost: 160, costMultiplier: 1.6, maxLevel: 10, renownPerLevel: 9, icon: '🌑', category: 'resource', spectrumType: PB_SPECTRUM_INDIGO },
  { id: 'as11', name: 'Tournament Gate', description: 'Gateway to tournament brackets and competitive matches.', baseCost: 200, costMultiplier: 1.8, maxLevel: 10, renownPerLevel: 13, icon: '🚪', category: 'competition', spectrumType: PB_SPECTRUM_PRISM },
  { id: 'as12', name: 'Prism Library', description: 'Contains ancient tomes on spectrum mastery techniques.', baseCost: 170, costMultiplier: 1.7, maxLevel: 10, renownPerLevel: 10, icon: '📚', category: 'research', spectrumType: PB_SPECTRUM_BLUE },
  { id: 'as13', name: 'Light Beacon', description: 'A beacon that attracts rare gems and champions from afar.', baseCost: 220, costMultiplier: 1.8, maxLevel: 10, renownPerLevel: 11, icon: '🔦', category: 'economy', spectrumType: PB_SPECTRUM_YELLOW },
  { id: 'as14', name: 'Training Dummy Array', description: 'Holographic training dummies that simulate real opponents.', baseCost: 90, costMultiplier: 1.4, maxLevel: 10, renownPerLevel: 6, icon: '🥊', category: 'training', spectrumType: PB_SPECTRUM_RED },
  { id: 'as15', name: 'Gem Vault', description: 'Securely stores precious gems and prevents degradation.', baseCost: 140, costMultiplier: 1.5, maxLevel: 10, renownPerLevel: 8, icon: '🏦', category: 'storage', spectrumType: PB_SPECTRUM_AMETHYST },
  { id: 'as16', name: 'Rainbow Bridge', description: 'Connects different arena zones for faster travel.', baseCost: 280, costMultiplier: 1.9, maxLevel: 10, renownPerLevel: 14, icon: '🌈', category: 'infrastructure', spectrumType: PB_SPECTRUM_PRISM },
  { id: 'as17', name: 'Prism Shrine', description: 'A sacred shrine that blesses champions before battle.', baseCost: 150, costMultiplier: 1.6, maxLevel: 10, renownPerLevel: 9, icon: '⛩️', category: 'support', spectrumType: PB_SPECTRUM_WHITE },
  { id: 'as18', name: 'Forge Hammer Station', description: 'Specialized station for upgrading prism weapons.', baseCost: 160, costMultiplier: 1.7, maxLevel: 10, renownPerLevel: 10, icon: '🔨', category: 'production', spectrumType: PB_SPECTRUM_ORANGE },
  { id: 'as19', name: 'Spectrum Scanner', description: 'Scans for rare gems hidden deep underground.', baseCost: 190, costMultiplier: 1.7, maxLevel: 10, renownPerLevel: 11, icon: '📡', category: 'exploration', spectrumType: PB_SPECTRUM_VIOLET },
  { id: 'as20', name: 'Champion Hall of Fame', description: 'Displays legendary champions and their achievements.', baseCost: 300, costMultiplier: 2.0, maxLevel: 10, renownPerLevel: 15, icon: '🏅', category: 'prestige', spectrumType: PB_SPECTRUM_GOLD_GLOW },
  { id: 'as21', name: 'Light Cannon Platform', description: 'Defensive platform with mounted prism light cannons.', baseCost: 200, costMultiplier: 1.8, maxLevel: 10, renownPerLevel: 12, icon: '💥', category: 'defense', spectrumType: PB_SPECTRUM_RED },
  { id: 'as22', name: 'Renown Obelisk', description: 'An obelisk that passively generates renown over time.', baseCost: 250, costMultiplier: 1.9, maxLevel: 10, renownPerLevel: 16, icon: '🗿', category: 'economy', spectrumType: PB_SPECTRUM_PRISM },
  { id: 'as23', name: 'Prism Meditation Chamber', description: 'A quiet chamber for champions to meditate and gain XP.', baseCost: 120, costMultiplier: 1.5, maxLevel: 10, renownPerLevel: 7, icon: '🧘', category: 'training', spectrumType: PB_SPECTRUM_INDIGO },
  { id: 'as24', name: 'Trophy Display Vault', description: 'Showcases tournament trophies and rare prize gems.', baseCost: 180, costMultiplier: 1.7, maxLevel: 10, renownPerLevel: 10, icon: '🏆', category: 'prestige', spectrumType: PB_SPECTRUM_YELLOW },
  { id: 'as25', name: 'Eternal Flame Cauldron', description: 'A cauldron of eternal prismatic flame that empowers all structures.', baseCost: 500, costMultiplier: 2.0, maxLevel: 10, renownPerLevel: 20, icon: '🔥', category: 'special', spectrumType: PB_SPECTRUM_PRISM },
];

// ─── Spectrum Ability Definitions (22) ───────────────────────────────────────

interface SpectrumAbilityDef {
  id: string;
  name: string;
  description: string;
  spectrumType: string;
  cooldown: number;
  cost: number;
  effectType: string;
  effectValue: number;
  icon: string;
  category: string;
}

const PB_ABILITIES: SpectrumAbilityDef[] = [
  { id: 'sa01', name: 'Crimson Strike', description: 'A devastating red light beam that deals massive damage.', spectrumType: PB_SPECTRUM_RED, cooldown: 3, cost: 20, effectType: 'damage', effectValue: 50, icon: '🔴', category: 'attack' },
  { id: 'sa02', name: 'Frost Bind', description: 'Blue light chains that freeze and immobilize an opponent.', spectrumType: PB_SPECTRUM_BLUE, cooldown: 4, cost: 30, effectType: 'stun', effectValue: 2, icon: '🔵', category: 'control' },
  { id: 'sa03', name: 'Verdant Renewal', description: 'Green light pulse that heals champions and restores stamina.', spectrumType: PB_SPECTRUM_GREEN, cooldown: 5, cost: 25, effectType: 'heal', effectValue: 40, icon: '🟢', category: 'support' },
  { id: 'sa04', name: 'Golden Shield', description: 'A barrier of golden light that absorbs incoming attacks.', spectrumType: PB_SPECTRUM_YELLOW, cooldown: 4, cost: 25, effectType: 'shield', effectValue: 60, icon: '🟡', category: 'defense' },
  { id: 'sa05', name: 'Vortex Blink', description: 'Instant teleport using indigo void light to escape danger.', spectrumType: PB_SPECTRUM_INDIGO, cooldown: 3, cost: 15, effectType: 'teleport', effectValue: 1, icon: '🟤', category: 'mobility' },
  { id: 'sa06', name: 'Amplify Aura', description: 'Violet light that doubles all ally stats for a short duration.', spectrumType: PB_SPECTRUM_VIOLET, cooldown: 6, cost: 40, effectType: 'buff', effectValue: 2, icon: '🟣', category: 'support' },
  { id: 'sa07', name: 'Inferno Wave', description: 'An orange fire wave that sweeps across the entire arena.', spectrumType: PB_SPECTRUM_ORANGE, cooldown: 5, cost: 35, effectType: 'aoe_damage', effectValue: 30, icon: '🟠', category: 'attack' },
  { id: 'sa08', name: 'White Purification', description: 'Pure white light that cures all debuffs and negative effects.', spectrumType: PB_SPECTRUM_WHITE, cooldown: 6, cost: 45, effectType: 'cleanse', effectValue: 1, icon: '⚪', category: 'support' },
  { id: 'sa09', name: 'Prism Barrage', description: 'A barrage of multicolored prisms that strike all enemies.', spectrumType: PB_SPECTRUM_PRISM, cooldown: 7, cost: 50, effectType: 'aoe_damage', effectValue: 45, icon: '🌈', category: 'attack' },
  { id: 'sa10', name: 'Ruby Fortress', description: 'Conjures a ruby crystal fortress around your position.', spectrumType: PB_SPECTRUM_RED, cooldown: 5, cost: 30, effectType: 'fortify', effectValue: 80, icon: 'castle', category: 'defense' },
  { id: 'sa11', name: 'Sapphire Song', description: 'A melodic blue light frequency that confuses enemies.', spectrumType: PB_SPECTRUM_BLUE, cooldown: 4, cost: 20, effectType: 'confuse', effectValue: 3, icon: 'sing', category: 'control' },
  { id: 'sa12', name: 'Emerald Growth', description: 'Accelerates gem growth, granting bonus gem harvest for 3 turns.', spectrumType: PB_SPECTRUM_GREEN, cooldown: 6, cost: 35, effectType: 'gem_bonus', effectValue: 3, icon: 'seedling', category: 'economy' },
  { id: 'sa13', name: 'Golden Rush', description: 'Instantly gain renown equal to your current arena level.', spectrumType: PB_SPECTRUM_YELLOW, cooldown: 8, cost: 60, effectType: 'renown_boost', effectValue: 1, icon: 'coins', category: 'economy' },
  { id: 'sa14', name: 'Shadow Clone', description: 'Creates an indigo clone that fights alongside your champion.', spectrumType: PB_SPECTRUM_INDIGO, cooldown: 7, cost: 45, effectType: 'clone', effectValue: 1, icon: 'ghost', category: 'support' },
  { id: 'sa15', name: 'Violet Domain', description: 'Transforms the arena into a violet domain for 2 turns.', spectrumType: PB_SPECTRUM_VIOLET, cooldown: 9, cost: 55, effectValue: 2, icon: 'globe', category: 'ultimate' },
  { id: 'sa16', name: 'Phoenix Rebirth', description: 'Revives a fallen champion with full health using orange fire.', spectrumType: PB_SPECTRUM_ORANGE, cooldown: 10, cost: 70, effectType: 'revive', effectValue: 1, icon: 'zap', category: 'support' },
  { id: 'sa17', name: 'Radiant Blast', description: 'An omnidirectional white light explosion centered on the caster.', spectrumType: PB_SPECTRUM_WHITE, cooldown: 8, cost: 55, effectType: 'aoe_damage', effectValue: 60, icon: 'sparkles', category: 'attack' },
  { id: 'sa18', name: 'Prism Synthesis', description: 'Combines three gems into one of higher rarity.', spectrumType: PB_SPECTRUM_PRISM, cooldown: 10, cost: 80, effectType: 'synthesize', effectValue: 1, icon: 'blend', category: 'crafting' },
  { id: 'sa19', name: 'Spectrum Shift', description: 'Changes a champion affinity to match the current arena.', spectrumType: PB_SPECTRUM_PRISM, cooldown: 5, cost: 30, effectType: 'affinity_shift', effectValue: 1, icon: 'repeat', category: 'tactical' },
  { id: 'sa20', name: 'Light Speed Dash', description: 'A burst of light speed that guarantees first strike in battle.', spectrumType: PB_SPECTRUM_WHITE, cooldown: 4, cost: 25, effectType: 'first_strike', effectValue: 1, icon: 'zap', category: 'tactical' },
  { id: 'sa21', name: 'Chromatic Storm', description: 'Summons a devastating storm of all seven spectrum colors.', spectrumType: PB_SPECTRUM_PRISM, cooldown: 12, cost: 100, effectType: 'ultimate_damage', effectValue: 150, icon: 'zap', category: 'ultimate' },
  { id: 'sa22', name: 'Prism Reset', description: 'Resets all ability cooldowns by refracting time through a prism.', spectrumType: PB_SPECTRUM_PRISM, cooldown: 15, cost: 120, effectType: 'reset_cooldowns', effectValue: 0, icon: 'clock', category: 'special' },
];

// ─── Achievement Definitions (18) ────────────────────────────────────────────

interface AchievementDef {
  id: string;
  name: string;
  description: string;
  condition: string;
  reward: { renown: number; gems: number };
  icon: string;
}

const PB_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'pa01', name: 'First Light', description: 'Collect your first prism gem.', condition: 'gems_collected >= 1', reward: { renown: 20, gems: 1 }, icon: '🕯️' },
  { id: 'pa02', name: 'Champion Recruiter', description: 'Recruit your first prism champion.', condition: 'champions_recruited >= 1', reward: { renown: 30, gems: 2 }, icon: '🤝' },
  { id: 'pa03', name: 'Arena Pioneer', description: 'Unlock your second arena zone.', condition: 'zones_unlocked >= 2', reward: { renown: 50, gems: 3 }, icon: '🗺️' },
  { id: 'pa04', name: 'Gem Collector', description: 'Collect 10 prism gems.', condition: 'gems_collected >= 10', reward: { renown: 100, gems: 5 }, icon: '💎' },
  { id: 'pa05', name: 'Forge Master', description: 'Forge 5 prism weapons.', condition: 'weapons_forged >= 5', reward: { renown: 120, gems: 6 }, icon: '⚒️' },
  { id: 'pa06', name: 'Tournament Victor', description: 'Win your first tournament battle.', condition: 'tournaments_won >= 1', reward: { renown: 150, gems: 8 }, icon: '🏆' },
  { id: 'pa07', name: 'Spectrum Scholar', description: 'Master 3 different spectrum types.', condition: 'spectrums_mastered >= 3', reward: { renown: 200, gems: 10 }, icon: '📚' },
  { id: 'pa08', name: 'Legendary Collector', description: 'Collect 5 legendary gems.', condition: 'legendary_gems >= 5', reward: { renown: 500, gems: 25 }, icon: '🌟' },
  { id: 'pa09', name: 'Arena Architect', description: 'Build all 25 arena structures.', condition: 'structures_built >= 25', reward: { renown: 800, gems: 40 }, icon: '🏗️' },
  { id: 'pa10', name: 'Master Builder', description: 'Upgrade any structure to level 10.', condition: 'max_structure_level >= 10', reward: { renown: 600, gems: 30 }, icon: '🏗️' },
  { id: 'pa11', name: 'Full Spectrum', description: 'Master all 7 base spectrum types.', condition: 'spectrums_mastered >= 7', reward: { renown: 1000, gems: 50 }, icon: '🌈' },
  { id: 'pa12', name: 'Colosseum Conqueror', description: 'Win 10 tournament battles.', condition: 'tournaments_won >= 10', reward: { renown: 700, gems: 35 }, icon: '⚔️' },
  { id: 'pa13', name: 'Champion Army', description: 'Recruit 15 prism champions.', condition: 'champions_recruited >= 15', reward: { renown: 400, gems: 20 }, icon: '👥' },
  { id: 'pa14', name: 'Gem Hoarder', description: 'Collect all 30 prism gems.', condition: 'gems_collected >= 30', reward: { renown: 2000, gems: 100 }, icon: '👑' },
  { id: 'pa15', name: 'Ability Adept', description: 'Use 30 spectrum abilities in total.', condition: 'abilities_used >= 30', reward: { renown: 300, gems: 15 }, icon: '🔮' },
  { id: 'pa16', name: 'Daily Devotee', description: 'Complete 7 daily quests.', condition: 'daily_quests_completed >= 7', reward: { renown: 250, gems: 12 }, icon: '📅' },
  { id: 'pa17', name: 'Renown Legend', description: 'Accumulate 5000 total renown.', condition: 'total_renown >= 5000', reward: { renown: 1500, gems: 75 }, icon: '✨' },
  { id: 'pa18', name: 'Prism Champion Title', description: 'Achieve the title of Prism Champion.', condition: 'title_index >= 7', reward: { renown: 5000, gems: 250 }, icon: '🏅' },
];

// ─── State Interface Types ────────────────────────────────────────────────────

interface CollectedGem {
  id: string;
  collectedAt: number;
}

interface RecruitedChampion {
  id: string;
  recruitedAt: number;
  level: number;
  xp: number;
}

interface OwnedZone {
  id: string;
  unlocked: boolean;
  battlesWon: number;
}

interface StructureRecord {
  id: string;
  level: number;
}

interface AbilityRecord {
  id: string;
  currentCooldown: number;
  timesUsed: number;
}

interface AchievementRecord {
  id: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

interface TournamentRecord {
  id: string;
  arenaZoneId: string;
  championId: string;
  opponentName: string;
  result: 'victory' | 'defeat' | 'draw';
  renownReward: number;
  completedAt: number;
}

interface DailyQuest {
  id: string;
  description: string;
  questType: string;
  targetValue: number;
  currentValue: number;
  reward: { renown: number; gems: number };
  expiresAt: number;
  completed: boolean;
  claimed: boolean;
}

interface SpectrumMasteryRecord {
  spectrumType: string;
  currentXp: number;
  level: number;
  mastered: boolean;
}

interface EventLogEntry {
  id: string;
  type: 'gem' | 'champion' | 'zone' | 'structure' | 'ability' | 'tournament' | 'achievement' | 'daily' | 'spectrum' | 'title' | 'forge';
  message: string;
  renownChange: number;
  gemChange: number;
  timestamp: number;
}

interface PrismColosseumState {
  gems: CollectedGem[];
  champions: RecruitedChampion[];
  zones: OwnedZone[];
  structures: StructureRecord[];
  abilities: AbilityRecord[];
  achievements: AchievementRecord[];
  tournaments: TournamentRecord[];
  dailyQuests: DailyQuest[];
  spectrumMastery: SpectrumMasteryRecord[];
  currentZoneId: string;
  totalRenown: number;
  totalRenownEarned: number;
  totalGemsCollected: number;
  weaponsForged: number;
  abilitiesUsed: number;
  dailyQuestsCompleted: number;
  championsRecruited: number;
  tournamentsWon: number;
  titleIndex: number;
  turnCount: number;
  eventLog: EventLogEntry[];
}

// ─── Output Interface Types ───────────────────────────────────────────────────

interface PrismColosseumStats {
  totalGems: number;
  gemsByRarity: Record<string, number>;
  gemsBySpectrum: Record<string, number>;
  totalChampions: number;
  zonesUnlocked: number;
  totalStructureLevels: number;
  maxStructureLevel: number;
  tournamentsWon: number;
  tournamentsPlayed: number;
  totalRenown: number;
  totalRenownEarned: number;
  currentTitle: string;
  titleIcon: string;
  weaponsForged: number;
  abilitiesUsed: number;
  achievementsUnlocked: number;
  achievementsTotal: number;
  spectrumsMastered: number;
  turnCount: number;
}

interface PrismColosseumProgress {
  nextTitle: { name: string; icon: string; progress: number; required: number };
  gemCompletion: number;
  zoneCompletion: number;
  structureCompletion: number;
  championCompletion: number;
  achievementCompletion: number;
  spectrumCompletion: number;
  overallCompletion: number;
}

interface BattleReadiness {
  level: string;
  label: string;
  color: string;
  recommendedPower: number;
  currentPower: number;
}

interface RenownHealth {
  level: string;
  label: string;
  color: string;
  surplus: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions (outside the hook)
// ═══════════════════════════════════════════════════════════════════════════════

function createInitialState(): PrismColosseumState {
  return {
    gems: [],
    champions: [],
    zones: PB_ARENA_ZONES.map(z => ({
      id: z.id,
      unlocked: z.id === 'az01',
      battlesWon: 0,
    })),
    structures: PB_STRUCTURES.map(s => ({
      id: s.id,
      level: 0,
    })),
    abilities: PB_ABILITIES.map(a => ({
      id: a.id,
      currentCooldown: 0,
      timesUsed: 0,
    })),
    achievements: PB_ACHIEVEMENTS.map(a => ({
      id: a.id,
      unlocked: false,
      unlockedAt: null,
    })),
    tournaments: [],
    dailyQuests: [],
    spectrumMastery: PB_ALL_SPECTRUMS.map(st => ({
      spectrumType: st,
      currentXp: 0,
      level: 0,
      mastered: false,
    })),
    currentZoneId: 'az01',
    totalRenown: 200,
    totalRenownEarned: 200,
    totalGemsCollected: 0,
    weaponsForged: 0,
    abilitiesUsed: 0,
    dailyQuestsCompleted: 0,
    championsRecruited: 0,
    tournamentsWon: 0,
    titleIndex: 0,
    turnCount: 0,
    eventLog: [],
  };
}

function rollGemRarity(): string {
  const roll = Math.random() * 100;
  if (roll < 30) return PB_RARITY_COMMON;
  if (roll < 55) return PB_RARITY_UNUSUAL;
  if (roll < 78) return PB_RARITY_RARE;
  if (roll < 92) return PB_RARITY_EPIC;
  return PB_RARITY_LEGENDARY;
}

function generateDailyQuests(): DailyQuest[] {
  const questTypes = [
    { type: 'collect_gems', desc: 'Collect {n} gems', target: () => Math.floor(Math.random() * 3) + 2 },
    { type: 'win_battle', desc: 'Win {n} tournament battles', target: () => Math.floor(Math.random() * 2) + 1 },
    { type: 'use_ability', desc: 'Use {n} spectrum abilities', target: () => Math.floor(Math.random() * 4) + 2 },
    { type: 'upgrade_structure', desc: 'Upgrade {n} arena structures', target: () => Math.floor(Math.random() * 2) + 1 },
    { type: 'train_champion', desc: 'Train {n} champions', target: () => Math.floor(Math.random() * 2) + 1 },
  ];
  const now = Date.now();
  const shuffled = questTypes.sort(() => Math.random() - 0.5).slice(0, 3);
  return shuffled.map((qt, i) => {
    const n = qt.target();
    const renownReward = n * 15 + Math.floor(Math.random() * 20) + 10;
    const gemReward = Math.floor(Math.random() * 3) + 1;
    return {
      id: `dq_${now}_${i}`,
      description: qt.desc.replace('{n}', String(n)),
      questType: qt.type,
      targetValue: n,
      currentValue: 0,
      reward: { renown: renownReward, gems: gemReward },
      expiresAt: now + 24 * 60 * 60 * 1000,
      completed: false,
      claimed: false,
    };
  });
}

function calculateUpgradeCost(structureDef: ArenaStructureDef, currentLevel: number): number {
  return Math.floor(structureDef.baseCost * Math.pow(structureDef.costMultiplier, currentLevel));
}

function determineTitleIndex(renown: number): number {
  for (let i = PB_TITLES.length - 1; i >= 0; i--) {
    if (renown >= PB_TITLES[i].requiredRenown) return i;
  }
  return 0;
}

function evaluateAchievements(state: PrismColosseumState): AchievementRecord[] {
  const metrics: Record<string, number> = {
    gems_collected: state.gems.length,
    champions_recruited: state.championsRecruited,
    zones_unlocked: state.zones.filter(z => z.unlocked).length,
    tournaments_won: state.tournamentsWon,
    spectrums_mastered: state.spectrumMastery.filter(s => s.mastered).length,
    legendary_gems: state.gems.filter(gid => {
      const def = PB_GEMS.find(g => g.id === gid.id);
      return def && def.rarity === PB_RARITY_LEGENDARY;
    }).length,
    structures_built: state.structures.filter(s => s.level > 0).length,
    max_structure_level: Math.max(...state.structures.map(s => s.level)),
    abilities_used: state.abilitiesUsed,
    daily_quests_completed: state.dailyQuestsCompleted,
    total_renown: state.totalRenownEarned,
    title_index: state.titleIndex,
    weapons_forged: state.weaponsForged,
  };

  return state.achievements.map(ach => {
    if (ach.unlocked) return ach;
    const def = PB_ACHIEVEMENTS.find(a => a.id === ach.id);
    if (!def) return ach;
    const match = def.condition.match(/(\w+)\s*>=\s*(\d+)/);
    if (!match) return ach;
    const key = match[1];
    const threshold = parseInt(match[2], 10);
    const value = metrics[key] ?? 0;
    if (value >= threshold) {
      return { ...ach, unlocked: true, unlockedAt: Date.now() };
    }
    return ach;
  });
}

function makeEventLogId(): string {
  return `plog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
}

function rollChampionRarity(): string {
  const roll = Math.random() * 100;
  if (roll < 35) return PB_RARITY_COMMON;
  if (roll < 60) return PB_RARITY_UNUSUAL;
  if (roll < 80) return PB_RARITY_RARE;
  if (roll < 94) return PB_RARITY_EPIC;
  return PB_RARITY_LEGENDARY;
}

function calculateBattleOutcome(
  championPower: number,
  championAgility: number,
  zoneBonus: number,
  titleBonus: number,
  opponentPower: number,
  opponentAgility: number,
): { result: 'victory' | 'defeat' | 'draw'; renownReward: number } {
  const totalPlayerPower = championPower + championAgility + zoneBonus + titleBonus;
  const totalOpponentPower = opponentPower + opponentAgility;
  if (totalPlayerPower > totalOpponentPower * 1.2) {
    return { result: 'victory', renownReward: 30 + Math.floor(Math.random() * 20) };
  }
  if (totalPlayerPower < totalOpponentPower * 0.8) {
    return { result: 'defeat', renownReward: 5 };
  }
  if (totalPlayerPower > totalOpponentPower) {
    return { result: 'victory', renownReward: 20 + Math.floor(Math.random() * 15) };
  }
  return { result: 'draw', renownReward: 10 };
}

function generateOpponentName(zoneSpectrum: string): string {
  const namesBySpectrum: Record<string, string[]> = {
    [PB_SPECTRUM_RED]: ['Crimson Shadow', 'Ruby Phantom', 'Blood Drifter', 'Scarlet Wraith'],
    [PB_SPECTRUM_BLUE]: ['Frost Sentinel', 'Azure Shade', 'Cobalt Spirit', 'Sapphire Ghost'],
    [PB_SPECTRUM_GREEN]: ['Verdant Horror', 'Emerald Fang', 'Jade Stalker', 'Forest Lurker'],
    [PB_SPECTRUM_YELLOW]: ['Golden Mimic', 'Amber Golem', 'Solar Puppet', 'Gilt Specter'],
    [PB_SPECTRUM_VIOLET]: ['Amethyst Witch', 'Violet Shade', 'Mauve Phantom', 'Crystal Wraith'],
    [PB_SPECTRUM_INDIGO]: ['Void Crawler', 'Abyss Walker', 'Indigo Revenant', 'Dark Shambler'],
    [PB_SPECTRUM_ORANGE]: ['Flame Djinn', 'Ember Fiend', 'Phoenix Clone', 'Fire Elemental'],
    [PB_SPECTRUM_WHITE]: ['Prism Doppelganger', 'Light Phantom', 'Dawn Shadow', 'Radiant Illusion'],
    [PB_SPECTRUM_PRISM]: ['Chromatic Aberration', 'Rainbow Horror', 'Spectrum Beast', 'Prism Demon'],
  };
  const pool = namesBySpectrum[zoneSpectrum] ?? namesBySpectrum[P_SPECTRUM_PRISM] ?? namesBySpectrum[P_SPECTRUM_RED];
  return pool[Math.floor(Math.random() * pool.length)] ?? 'Unknown Fighter';
}

function calculateSpectrumAffinityBonus(championSpectrum: string, zoneSpectrum: string): number {
  if (championSpectrum === zoneSpectrum) return 25;
  if (championSpectrum === PB_SPECTRUM_PRISM || championSpectrum === PB_SPECTRUM_WHITE) return 15;
  return 0;
}

function calculateGemSynthesisResult(rarity: string): string | null {
  const order = [PB_RARITY_COMMON, PB_RARITY_UNUSUAL, PB_RARITY_RARE, PB_RARITY_EPIC, PB_RARITY_LEGENDARY];
  const idx = order.indexOf(rarity);
  if (idx < 0 || idx >= order.length - 1) return null;
  return order[idx + 1];
}

function calculateTotalGemValue(gems: CollectedGem[]): number {
  return gems.reduce((sum, g) => {
    const def = PB_GEMS.find(gd => gd.id === g.id);
    return sum + (def ? def.sellPrice : 0);
  }, 0);
}

function calculateAverageChampionLevel(champions: RecruitedChampion[]): number {
  if (champions.length === 0) return 0;
  return champions.reduce((sum, c) => sum + c.level, 0) / champions.length;
}

function calculateChampionPowerRanking(
  champions: (RecruitedChampion & PrismChampionDef)[],
): (RecruitedChampion & PrismChampionDef)[] {
  return [...champions].sort((a, b) => {
    const powerA = a.lightPower + a.level * 5 + a.agility + a.level * 2;
    const powerB = b.lightPower + b.level * 5 + b.agility + b.level * 2;
    return powerB - powerA;
  });
}

function generateTournamentSummary(tournaments: TournamentRecord[]): {
  wins: number; losses: number; draws: number; totalRenown: number; bestZone: string } {
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let totalRenown = 0;
  const zoneWins: Record<string, number> = {};

  for (const t of tournaments) {
    if (t.result === 'victory') {
      wins++;
      zoneWins[t.arenaZoneId] = (zoneWins[t.arenaZoneId] ?? 0) + 1;
    } else if (t.result === 'defeat') {
      losses++;
    } else {
      draws++;
    }
    totalRenown += t.renownReward;
  }

  let bestZone = '';
  let bestCount = 0;
  for (const [zoneId, count] of Object.entries(zoneWins)) {
    if (count > bestCount) {
      bestCount = count;
      bestZone = zoneId;
    }
  }

  return { wins, losses, draws, totalRenown, bestZone };
}

function generateBattleRecommendation(
  playerPower: number,
  playerAgility: number,
  zoneBonus: number,
  titleBonus: number,
): { minPower: number; recommendedLevel: number; difficultyLabel: string } {
  const total = playerPower + playerAgility + zoneBonus + titleBonus;
  const minPower = Math.floor(total * 0.7);
  const recommendedLevel = Math.max(1, Math.floor(minPower / 15));
  const ratio = total / Math.max(1, minPower * 2);

  let difficultyLabel: string;
  if (ratio >= 1.5) difficultyLabel = 'Easy';
  else if (ratio >= 1.0) difficultyLabel = 'Moderate';
  else if (ratio >= 0.6) difficultyLabel = 'Hard';
  else difficultyLabel = 'Extreme';

  return { minPower, recommendedLevel, difficultyLabel };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export default function usePrismColosseum() {
  const [state, setState] = useState<PrismColosseumState>(createInitialState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Generate daily quests if none exist or expired
  useEffect(() => {
    const now = Date.now();
    const hasActive = state.dailyQuests.some(q => q.expiresAt > now && !q.claimed);
    if (!hasActive || state.dailyQuests.length === 0) {
      setState(prev => ({ ...prev, dailyQuests: generateDailyQuests() }));
    }
  }, [state.dailyQuests, state.turnCount]);

  // ─── Internal: log event to event log ──────────────────────────────────
  const logEvent = useCallback((
    type: EventLogEntry['type'],
    message: string,
    renownChange: number,
    gemChange: number,
  ) => {
    setState(prev => ({
      ...prev,
      eventLog: [
        ...prev.eventLog.slice(-199),
        {
          id: makeEventLogId(),
          type,
          message,
          renownChange,
          gemChange,
          timestamp: Date.now(),
        },
      ],
    }));
  }, []);

  // ─── Internal: recalc title and check achievements ─────────────────────
  const recalcAndCheck = useCallback((prevState: PrismColosseumState): Partial<PrismColosseumState> => {
    const newTitleIndex = determineTitleIndex(prevState.totalRenown);
    const newAchievements = evaluateAchievements(prevState);
    const updates: Partial<PrismColosseumState> = {};
    if (newTitleIndex !== prevState.titleIndex) {
      updates.titleIndex = newTitleIndex;
    }
    const newUnlocks = newAchievements.filter((a, i) => a.unlocked && !prevState.achievements[i].unlocked);
    if (newUnlocks.length > 0) {
      updates.achievements = newAchievements;
    }
    return updates;
  }, []);

  // ─── Collect Prism Gem ─────────────────────────────────────────────────
  const collectGem = useCallback(() => {
    setState(prev => {
      const alreadyCollected = new Set(prev.gems.map(g => g.id));
      const rarity = rollGemRarity();
      const candidates = PB_GEMS.filter(g => g.rarity === rarity && !alreadyCollected.has(g.id));

      let chosen: PrismGemDef;
      if (candidates.length > 0) {
        chosen = candidates[Math.floor(Math.random() * candidates.length)];
      } else {
        const anyUncollected = PB_GEMS.filter(g => !alreadyCollected.has(g.id));
        if (anyUncollected.length === 0) return prev;
        chosen = anyUncollected[Math.floor(Math.random() * anyUncollected.length)];
      }

      const gemRenown = Math.floor(chosen.lightPower * 0.5);
      const recalc = recalcAndCheck({
        ...prev,
        totalRenown: prev.totalRenown + gemRenown,
        totalRenownEarned: prev.totalRenownEarned + gemRenown,
        totalGemsCollected: prev.totalGemsCollected + 1,
      });

      return {
        ...prev,
        ...recalc,
        totalRenown: prev.totalRenown + gemRenown,
        totalRenownEarned: prev.totalRenownEarned + gemRenown,
        totalGemsCollected: prev.totalGemsCollected + 1,
        gems: [...prev.gems, { id: chosen.id, collectedAt: Date.now() }],
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            type: 'gem' as const,
            message: `Collected ${chosen.name} (${chosen.rarity})`,
            renownChange: gemRenown,
            gemChange: 1,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcAndCheck]);

  // ─── Recruit Champion ──────────────────────────────────────────────────
  const recruitChampion = useCallback(() => {
    setState(prev => {
      const rarity = rollChampionRarity();
      const candidates = PB_CHAMPIONS.filter(c => c.rarity === rarity);
      if (candidates.length === 0) return prev;
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      const recruitCost = Math.floor((PB_RARITY_MULTIPLIER[chosen.rarity] ?? 1) * 20);
      if (prev.totalRenown < recruitCost) return prev;

      const recalc = recalcAndCheck({
        ...prev,
        totalRenown: prev.totalRenown - recruitCost,
        championsRecruited: prev.championsRecruited + 1,
      });

      return {
        ...prev,
        ...recalc,
        totalRenown: prev.totalRenown - recruitCost,
        championsRecruited: prev.championsRecruited + 1,
        champions: [...prev.champions, { id: chosen.id, recruitedAt: Date.now(), level: 1, xp: 0 }],
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            type: 'champion' as const,
            message: `Recruited ${chosen.name} (${chosen.rarity})`,
            renownChange: -recruitCost,
            gemChange: 0,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcAndCheck]);

  // ─── Train Champion ────────────────────────────────────────────────────
  const trainChampion = useCallback((championId: string) => {
    setState(prev => {
      const idx = prev.champions.findIndex(c => c.id === championId);
      if (idx === -1) return prev;
      const champion = prev.champions[idx];
      const trainCost = Math.floor((champion.level + 1) * 10);
      if (prev.totalRenown < trainCost) return prev;

      const xpGain = 20 + champion.level * 5;
      const newXp = champion.xp + xpGain;
      const xpNeeded = champion.level * 50;
      let newLevel = champion.level;
      let remainingXp = newXp;
      if (newXp >= xpNeeded) {
        newLevel = Math.min(champion.level + 1, 50);
        remainingXp = newXp - xpNeeded;
      }

      const updatedChampions = [...prev.champions];
      updatedChampions[idx] = { ...champion, level: newLevel, xp: remainingXp };

      return {
        ...prev,
        totalRenown: prev.totalRenown - trainCost,
        champions: updatedChampions,
        turnCount: prev.turnCount + 1,
      };
    });
  }, []);

  // ─── Forge Prism Weapon ────────────────────────────────────────────────
  const forgePrism = useCallback((gemIds: string[]) => {
    setState(prev => {
      if (gemIds.length < 3) return prev;
      const ownedGemIds = new Set(prev.gems.map(g => g.id));
      for (const gid of gemIds) {
        if (!ownedGemIds.has(gid)) return prev;
      }

      const gems = gemIds.map(id => PB_GEMS.find(g => g.id === id)).filter(Boolean) as PrismGemDef[];
      const totalPower = gems.reduce((s, g) => s + g.lightPower, 0);
      const forgeCost = Math.floor(totalPower * 0.3);
      if (prev.totalRenown < forgeCost) return prev;

      const remainingGems = prev.gems.filter(g => !gemIds.includes(g.id));
      const recalc = recalcAndCheck({
        ...prev,
        totalRenown: prev.totalRenown - forgeCost,
        weaponsForged: prev.weaponsForged + 1,
      });

      return {
        ...prev,
        ...recalc,
        totalRenown: prev.totalRenown - forgeCost,
        weaponsForged: prev.weaponsForged + 1,
        gems: remainingGems,
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            type: 'forge' as const,
            message: `Forged a prism weapon from ${gemIds.length} gems (power: ${totalPower})`,
            renownChange: -forgeCost,
            gemChange: -gemIds.length,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcAndCheck]);

  // ─── Enter Tournament Battle ───────────────────────────────────────────
  const enterTournament = useCallback((championId: string, arenaZoneId: string) => {
    setState(prev => {
      const champion = prev.champions.find(c => c.id === championId);
      if (!champion) return prev;
      const zone = prev.zones.find(z => z.id === arenaZoneId);
      if (!zone || !zone.unlocked) return prev;

      const championDef = PB_CHAMPIONS.find(c => c.id === championId);
      if (!championDef) return prev;
      const zoneDef = PB_ARENA_ZONES.find(z => z.id === arenaZoneId);
      if (!zoneDef) return prev;
      const titleDef = PB_TITLES[prev.titleIndex];

      const opponentPower = 50 + Math.floor(Math.random() * 200);
      const opponentAgility = 30 + Math.floor(Math.random() * 100);
      const outcome = calculateBattleOutcome(
        championDef.lightPower + champion.level * 5,
        championDef.agility + champion.level * 2,
        zoneDef.battleBonus,
        titleDef.bonusPower,
        opponentPower,
        opponentAgility,
      );

      const isVictory = outcome.result === 'victory';
      const recalc = recalcAndCheck({
        ...prev,
        totalRenown: prev.totalRenown + outcome.renownReward,
        totalRenownEarned: prev.totalRenownEarned + outcome.renownReward,
        tournamentsWon: prev.tournamentsWon + (isVictory ? 1 : 0),
      });

      const updatedZones = prev.zones.map(z => {
        if (z.id === arenaZoneId && isVictory) {
          return { ...z, battlesWon: z.battlesWon + 1 };
        }
        return z;
      });

      const record: TournamentRecord = {
        id: `tr_${Date.now()}`,
        arenaZoneId,
        championId,
        opponentName: `Shadow Fighter Lv.${Math.floor(opponentPower / 20)}`,
        result: outcome.result,
        renownReward: outcome.renownReward,
        completedAt: Date.now(),
      };

      return {
        ...prev,
        ...recalc,
        totalRenown: prev.totalRenown + outcome.renownReward,
        totalRenownEarned: prev.totalRenownEarned + outcome.renownReward,
        tournamentsWon: prev.tournamentsWon + (isVictory ? 1 : 0),
        zones: updatedZones,
        tournaments: [...prev.tournaments.slice(-49), record],
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            type: 'tournament' as const,
            message: `Tournament ${outcome.result} in ${zoneDef.name} (+${outcome.renownReward} renown)`,
            renownChange: outcome.renownReward,
            gemChange: 0,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcAndCheck]);

  // ─── Unlock Arena Zone ─────────────────────────────────────────────────
  const unlockZone = useCallback((zoneId: string) => {
    setState(prev => {
      const zoneDef = PB_ARENA_ZONES.find(z => z.id === zoneId);
      if (!zoneDef) return prev;
      const zone = prev.zones.find(z => z.id === zoneId);
      if (!zone || zone.unlocked) return prev;
      if (prev.totalRenown < zoneDef.unlockCost) return prev;

      const recalc = recalcAndCheck({
        ...prev,
        totalRenown: prev.totalRenown - zoneDef.unlockCost,
      });

      return {
        ...prev,
        ...recalc,
        totalRenown: prev.totalRenown - zoneDef.unlockCost,
        zones: prev.zones.map(z => {
          if (z.id === zoneId) return { ...z, unlocked: true };
          return z;
        }),
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            type: 'zone' as const,
            message: `Unlocked ${zoneDef.name}`,
            renownChange: -zoneDef.unlockCost,
            gemChange: 0,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcAndCheck]);

  // ─── Upgrade Structure ─────────────────────────────────────────────────
  const upgradeStructure = useCallback((structureId: string) => {
    setState(prev => {
      const structureDef = PB_STRUCTURES.find(s => s.id === structureId);
      if (!structureDef) return prev;
      const record = prev.structures.find(s => s.id === structureId);
      if (!record || record.level >= structureDef.maxLevel) return prev;

      const cost = calculateUpgradeCost(structureDef, record.level);
      if (prev.totalRenown < cost) return prev;

      const recalc = recalcAndCheck({
        ...prev,
        totalRenown: prev.totalRenown - cost,
      });

      return {
        ...prev,
        ...recalc,
        totalRenown: prev.totalRenown - cost,
        structures: prev.structures.map(s => {
          if (s.id === structureId) return { ...s, level: s.level + 1 };
          return s;
        }),
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            type: 'structure' as const,
            message: `Upgraded ${structureDef.name} to level ${record.level + 1}`,
            renownChange: -cost,
            gemChange: 0,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcAndCheck]);

  // ─── Activate Spectrum Ability ────────────────────────────────────────
  const activateAbility = useCallback((abilityId: string) => {
    setState(prev => {
      const abilityDef = PB_ABILITIES.find(a => a.id === abilityId);
      if (!abilityDef) return prev;
      const record = prev.abilities.find(a => a.id === abilityId);
      if (!record || record.currentCooldown > 0) return prev;
      if (prev.totalRenown < abilityDef.cost) return prev;

      const updatedAbilities = prev.abilities.map(a => {
        if (a.id === abilityId) {
          return { ...a, currentCooldown: abilityDef.cooldown, timesUsed: a.timesUsed + 1 };
        }
        return { ...a, currentCooldown: Math.max(0, a.currentCooldown - 1) };
      });

      // Add spectrum mastery XP
      const specRecord = prev.spectrumMastery.find(s => s.spectrumType === abilityDef.spectrumType);
      let updatedMastery = prev.spectrumMastery;
      if (specRecord) {
        const masteryXpGain = 10 + Math.floor(abilityDef.effectValue * 0.5);
        updatedMastery = prev.spectrumMastery.map(s => {
          if (s.spectrumType === abilityDef.spectrumType) {
            const newXp = s.currentXp + masteryXpGain;
            const xpNeeded = (s.level + 1) * 100;
            let newLevel = s.level;
            let remXp = newXp;
            let mastered = s.mastered;
            if (newXp >= xpNeeded && s.level < 10) {
              newLevel = s.level + 1;
              remXp = newXp - xpNeeded;
              if (newLevel >= 10) mastered = true;
            }
            return { ...s, currentXp: remXp, level: newLevel, mastered };
          }
          return s;
        });
      }

      const recalc = recalcAndCheck({
        ...prev,
        totalRenown: prev.totalRenown - abilityDef.cost,
        abilitiesUsed: prev.abilitiesUsed + 1,
        spectrumMastery: updatedMastery,
      });

      return {
        ...prev,
        ...recalc,
        totalRenown: prev.totalRenown - abilityDef.cost,
        abilitiesUsed: prev.abilitiesUsed + 1,
        abilities: updatedAbilities,
        spectrumMastery: updatedMastery,
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            type: 'ability' as const,
            message: `Activated ${abilityDef.name}`,
            renownChange: -abilityDef.cost,
            gemChange: 0,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcAndCheck]);

  // ─── Complete Daily Quest Progress ─────────────────────────────────────
  const advanceDailyQuest = useCallback((questType: string, amount: number) => {
    setState(prev => {
      const updatedQuests = prev.dailyQuests.map(q => {
        if (q.questType === questType && !q.completed) {
          const newVal = Math.min(q.targetValue, q.currentValue + amount);
          return { ...q, currentValue: newVal, completed: newVal >= q.targetValue };
        }
        return q;
      });
      return { ...prev, dailyQuests: updatedQuests };
    });
  }, []);

  // ─── Claim Daily Quest Reward ─────────────────────────────────────────
  const claimDailyQuest = useCallback((questId: string) => {
    setState(prev => {
      const quest = prev.dailyQuests.find(q => q.id === questId);
      if (!quest || !quest.completed || quest.claimed) return prev;

      const recalc = recalcAndCheck({
        ...prev,
        totalRenown: prev.totalRenown + quest.reward.renown,
        totalRenownEarned: prev.totalRenownEarned + quest.reward.renown,
        dailyQuestsCompleted: prev.dailyQuestsCompleted + 1,
      });

      return {
        ...prev,
        ...recalc,
        totalRenown: prev.totalRenown + quest.reward.renown,
        totalRenownEarned: prev.totalRenownEarned + quest.reward.renown,
        dailyQuestsCompleted: prev.dailyQuestsCompleted + 1,
        dailyQuests: prev.dailyQuests.map(q => {
          if (q.id === questId) return { ...q, claimed: true };
          return q;
        }),
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            type: 'daily' as const,
            message: `Completed daily quest: ${quest.description}`,
            renownChange: quest.reward.renown,
            gemChange: quest.reward.gems,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcAndCheck]);

  // ─── Switch Active Zone ────────────────────────────────────────────────
  const switchZone = useCallback((zoneId: string) => {
    setState(prev => {
      const zone = prev.zones.find(z => z.id === zoneId);
      if (!zone || !zone.unlocked) return prev;
      return { ...prev, currentZoneId: zoneId };
    });
  }, []);

  // ─── Advance Turn (tick cooldowns) ────────────────────────────────────
  const advanceTurn = useCallback(() => {
    setState(prev => {
      const updatedAbilities = prev.abilities.map(a => ({
        ...a,
        currentCooldown: Math.max(0, a.currentCooldown - 1),
      }));

      const recalc = recalcAndCheck({
        ...prev,
        abilities: updatedAbilities,
      });

      return {
        ...prev,
        ...recalc,
        abilities: updatedAbilities,
        turnCount: prev.turnCount + 1,
      };
    });
  }, [recalcAndCheck]);

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED VALUES (useMemo)
  // ═══════════════════════════════════════════════════════════════════════════

  const enrichedGems = useMemo(() => {
    return state.gems.map(g => {
      const def = PB_GEMS.find(gd => gd.id === g.id);
      if (!def) return null;
      return { ...g, ...def };
    }).filter(Boolean) as (CollectedGem & PrismGemDef)[];
  }, [state.gems]);

  const enrichedChampions = useMemo(() => {
    return state.champions.map(c => {
      const def = PB_CHAMPIONS.find(cd => cd.id === c.id);
      if (!def) return null;
      return { ...c, ...def };
    }).filter(Boolean) as (RecruitedChampion & PrismChampionDef)[];
  }, [state.champions]);

  const enrichedZones = useMemo(() => {
    return state.zones.map(z => {
      const def = PB_ARENA_ZONES.find(zd => zd.id === z.id);
      if (!def) return null;
      return { ...z, ...def };
    }).filter(Boolean) as (OwnedZone & ArenaZoneDef)[];
  }, [state.zones]);

  const enrichedStructures = useMemo(() => {
    return state.structures.map(s => {
      const def = PB_STRUCTURES.find(sd => sd.id === s.id);
      if (!def) return null;
      const upgradeCost = s.level >= def.maxLevel ? 0 : calculateUpgradeCost(def, s.level);
      return { ...s, ...def, upgradeCost, canUpgrade: s.level < def.maxLevel };
    }).filter(Boolean) as (StructureRecord & ArenaStructureDef & { upgradeCost: number; canUpgrade: boolean })[];
  }, [state.structures]);

  const enrichedAbilities = useMemo(() => {
    return state.abilities.map(a => {
      const def = PB_ABILITIES.find(ad => ad.id === a.id);
      if (!def) return null;
      return { ...a, ...def, isReady: a.currentCooldown === 0 };
    }).filter(Boolean) as (AbilityRecord & SpectrumAbilityDef & { isReady: boolean })[];
  }, [state.abilities]);

  const enrichedAchievements = useMemo(() => {
    return state.achievements.map(ach => {
      const def = PB_ACHIEVEMENTS.find(a => a.id === ach.id);
      if (!def) return null;
      return { ...ach, ...def };
    }).filter(Boolean) as (AchievementRecord & AchievementDef)[];
  }, [state.achievements]);

  const enrichedTournaments = useMemo(() => {
    return state.tournaments.map(t => {
      const zoneDef = PB_ARENA_ZONES.find(z => z.id === t.arenaZoneId);
      const championDef = PB_CHAMPIONS.find(c => c.id === t.championId);
      return {
        ...t,
        zoneName: zoneDef?.name ?? 'Unknown',
        zoneColor: zoneDef?.color ?? '#999',
        championName: championDef?.name ?? 'Unknown',
        championColor: championDef?.color ?? '#999',
      };
    });
  }, [state.tournaments]);

  const currentZoneDef = useMemo(() => {
    return PB_ARENA_ZONES.find(z => z.id === state.currentZoneId) ?? PB_ARENA_ZONES[0];
  }, [state.currentZoneId]);

  const currentTitleDef = useMemo(() => {
    return PB_TITLES[state.titleIndex] ?? PB_TITLES[0];
  }, [state.titleIndex]);

  const gemsByRarity = useMemo(() => {
    const result: Record<string, number> = {};
    for (const rarity of [PB_RARITY_COMMON, PB_RARITY_UNUSUAL, PB_RARITY_RARE, PB_RARITY_EPIC, PB_RARITY_LEGENDARY]) {
      result[rarity] = state.gems.filter(g => {
        const def = PB_GEMS.find(gd => gd.id === g.id);
        return def && def.rarity === rarity;
      }).length;
    }
    return result;
  }, [state.gems]);

  const gemsBySpectrum = useMemo(() => {
    const result: Record<string, number> = {};
    for (const spec of PB_ALL_SPECTRUMS) {
      result[spec] = state.gems.filter(g => {
        const def = PB_GEMS.find(gd => gd.id === g.id);
        return def && def.spectrumType === spec;
      }).length;
    }
    return result;
  }, [state.gems]);

  const championsByRarity = useMemo(() => {
    const result: Record<string, number> = {};
    for (const rarity of [PB_RARITY_COMMON, PB_RARITY_UNUSUAL, PB_RARITY_RARE, PB_RARITY_EPIC, PB_RARITY_LEGENDARY]) {
      result[rarity] = state.champions.filter(c => {
        const def = PB_CHAMPIONS.find(cd => cd.id === c.id);
        return def && def.rarity === rarity;
      }).length;
    }
    return result;
  }, [state.champions]);

  const totalLightPower = useMemo(() => {
    return state.champions.reduce((sum, c) => {
      const def = PB_CHAMPIONS.find(cd => cd.id === c.id);
      if (!def) return sum;
      return sum + def.lightPower + c.level * 5;
    }, 0);
  }, [state.champions]);

  const totalAgility = useMemo(() => {
    return state.champions.reduce((sum, c) => {
      const def = PB_CHAMPIONS.find(cd => cd.id === c.id);
      if (!def) return sum;
      return sum + def.agility + c.level * 2;
    }, 0);
  }, [state.champions]);

  const structureRenownPerTurn = useMemo(() => {
    return state.structures.reduce((sum, s) => {
      const def = PB_STRUCTURES.find(sd => sd.id === s.id);
      return sum + (def ? def.renownPerLevel * s.level : 0);
    }, 0);
  }, [state.structures]);

  const zonesUnlocked = useMemo(() => {
    return state.zones.filter(z => z.unlocked).length;
  }, [state.zones]);

  const totalStructureLevels = useMemo(() => {
    return state.structures.reduce((sum, s) => sum + s.level, 0);
  }, [state.structures]);

  const maxStructureLevel = useMemo(() => {
    return Math.max(...state.structures.map(s => s.level));
  }, [state.structures]);

  const spectrumsMastered = useMemo(() => {
    return state.spectrumMastery.filter(s => s.mastered).length;
  }, [state.spectrumMastery]);

  const battleReadiness = useMemo((): BattleReadiness => {
    const totalPower = totalLightPower + totalAgility;
    const zoneBonus = currentZoneDef.battleBonus;
    const titleBonus = currentTitleDef.bonusPower;
    const current = totalPower + zoneBonus + titleBonus;
    const recommended = 150 + state.turnCount * 2;
    const ratio = current / Math.max(1, recommended);
    if (ratio >= 2) return { level: 'overwhelming', label: 'Overwhelming Light', color: PB_COLOR_GOLD_GLOW, recommendedPower: recommended, currentPower: current };
    if (ratio >= 1.2) return { level: 'strong', label: 'Strong Radiance', color: PB_COLOR_EMERALD, recommendedPower: recommended, currentPower: current };
    if (ratio >= 0.8) return { level: 'adequate', label: 'Balanced Glow', color: PB_COLOR_AMBER, recommendedPower: recommended, currentPower: current };
    if (ratio >= 0.4) return { level: 'weak', label: 'Dim Light', color: PB_COLOR_SAPPHIRE, recommendedPower: recommended, currentPower: current };
    return { level: 'critical', label: 'Fading Spark', color: PB_COLOR_RUBY, recommendedPower: recommended, currentPower: current };
  }, [totalLightPower, totalAgility, currentZoneDef, currentTitleDef, state.turnCount]);

  const renownHealth = useMemo((): RenownHealth => {
    const income = structureRenownPerTurn + 10;
    const upkeep = state.champions.length * 5 + state.structures.filter(s => s.level > 0).length * 3;
    const surplus = state.totalRenown - upkeep * 5;
    if (surplus > 500) return { level: 'thriving', label: 'Radiant Wealth', color: PB_COLOR_GOLD_GLOW, surplus };
    if (surplus > 100) return { level: 'stable', label: 'Stable Light', color: PB_COLOR_EMERALD, surplus };
    if (surplus > 0) return { level: 'modest', label: 'Modest Glow', color: PB_COLOR_AMBER, surplus };
    return { level: 'deficit', label: 'Diminishing Light', color: PB_COLOR_RUBY, surplus };
  }, [state.totalRenown, state.champions, state.structures, structureRenownPerTurn]);

  const recentTournaments = useMemo(() => {
    return [...enrichedTournaments].reverse().slice(0, 10);
  }, [enrichedTournaments]);

  const recentEventLog = useMemo(() => {
    return state.eventLog.slice(-20).reverse();
  }, [state.eventLog]);

  const recentAchievements = useMemo(() => {
    return enrichedAchievements
      .filter(a => a.unlocked && a.unlockedAt !== null)
      .sort((a, b) => (b.unlockedAt ?? 0) - (a.unlockedAt ?? 0))
      .slice(0, 5);
  }, [enrichedAchievements]);

  const availableGemsByRarity = useMemo(() => {
    const collectedIds = new Set(state.gems.map(g => g.id));
    const result: Record<string, number> = {};
    for (const rarity of [PB_RARITY_COMMON, PB_RARITY_UNUSUAL, PB_RARITY_RARE, PB_RARITY_EPIC, PB_RARITY_LEGENDARY]) {
      result[rarity] = PB_GEMS.filter(g => g.rarity === rarity && !collectedIds.has(g.id)).length;
    }
    return result;
  }, [state.gems]);

  const activeDailyQuests = useMemo(() => {
    const now = Date.now();
    return state.dailyQuests.filter(q => q.expiresAt > now && !q.claimed).map(q => {
      const progress = q.targetValue > 0 ? Math.min(1, q.currentValue / q.targetValue) : 0;
      return { ...q, progress, isExpired: now > q.expiresAt && !q.completed };
    });
  }, [state.dailyQuests]);

  const stats = useMemo((): PrismColosseumStats => {
    return {
      totalGems: state.gems.length,
      gemsByRarity,
      gemsBySpectrum,
      totalChampions: state.champions.length,
      zonesUnlocked,
      totalStructureLevels,
      maxStructureLevel,
      tournamentsWon: state.tournamentsWon,
      tournamentsPlayed: state.tournaments.length,
      totalRenown: state.totalRenown,
      totalRenownEarned: state.totalRenownEarned,
      currentTitle: currentTitleDef.name,
      titleIcon: currentTitleDef.icon,
      weaponsForged: state.weaponsForged,
      abilitiesUsed: state.abilitiesUsed,
      achievementsUnlocked: enrichedAchievements.filter(a => a.unlocked).length,
      achievementsTotal: PB_ACHIEVEMENTS.length,
      spectrumsMastered,
      turnCount: state.turnCount,
    };
  }, [state, gemsByRarity, gemsBySpectrum, zonesUnlocked, totalStructureLevels, maxStructureLevel, currentTitleDef, enrichedAchievements, spectrumsMastered]);

  const progress = useMemo((): PrismColosseumProgress => {
    const nextTitleDef = PB_TITLES[state.titleIndex + 1];
    const nextTitle = nextTitleDef
      ? { name: nextTitleDef.name, icon: nextTitleDef.icon, progress: state.totalRenown - PB_TITLES[state.titleIndex].requiredRenown, required: nextTitleDef.requiredRenown - PB_TITLES[state.titleIndex].requiredRenown }
      : { name: currentTitleDef.name, icon: currentTitleDef.icon, progress: 1, required: 1 };
    return {
      nextTitle,
      gemCompletion: state.gems.length / PB_GEMS.length,
      zoneCompletion: zonesUnlocked / PB_ARENA_ZONES.length,
      structureCompletion: state.structures.filter(s => s.level > 0).length / PB_STRUCTURES.length,
      championCompletion: state.champions.length / PB_CHAMPIONS.length,
      achievementCompletion: enrichedAchievements.filter(a => a.unlocked).length / PB_ACHIEVEMENTS.length,
      spectrumCompletion: spectrumsMastered / (PB_ALL_SPECTRUMS.length - 2),
      overallCompletion: (
        state.gems.length / PB_GEMS.length +
        zonesUnlocked / PB_ARENA_ZONES.length +
        state.structures.filter(s => s.level > 0).length / PB_STRUCTURES.length +
        state.champions.length / PB_CHAMPIONS.length +
        enrichedAchievements.filter(a => a.unlocked).length / PB_ACHIEVEMENTS.length +
        spectrumsMastered / (PB_ALL_SPECTRUMS.length - 2)
      ) / 6,
    };
  }, [state, gemsByRarity, zonesUnlocked, totalStructureLevels, enrichedAchievements, spectrumsMastered, currentTitleDef]);

  const structuresByCategory = useMemo(() => {
    const cats: Record<string, typeof enrichedStructures> = {};
    for (const s of enrichedStructures) {
      const cat = s.category || 'other';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(s);
    }
    return cats;
  }, [enrichedStructures]);

  const abilitiesByCategory = useMemo(() => {
    const cats: Record<string, typeof enrichedAbilities> = {};
    for (const a of enrichedAbilities) {
      const cat = a.category || 'other';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(a);
    }
    return cats;
  }, [enrichedAbilities]);

  const gemPowerTotal = useMemo(() => {
    return state.gems.reduce((sum, g) => {
      const def = PB_GEMS.find(gd => gd.id === g.id);
      return sum + (def ? def.lightPower : 0);
    }, 0);
  }, [state.gems]);

  const strongestChampion = useMemo(() => {
    if (enrichedChampions.length === 0) return null;
    return [...enrichedChampions].sort((a, b) => (b.lightPower + b.level * 5) - (a.lightPower + a.level * 5))[0];
  }, [enrichedChampions]);

  const topChampions = useMemo(() => {
    return [...enrichedChampions].sort((a, b) => (b.lightPower + b.level * 5) - (a.lightPower + a.level * 5)).slice(0, 5);
  }, [enrichedChampions]);

  const winRate = useMemo(() => {
    if (state.tournaments.length === 0) return 0;
    return state.tournaments.filter(t => t.result === 'victory').length / state.tournaments.length;
  }, [state.tournaments]);

  const winStreak = useMemo(() => {
    let streak = 0;
    for (let i = state.tournaments.length - 1; i >= 0; i--) {
      if (state.tournaments[i].result === 'victory') {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [state.tournaments]);

  const bestStreak = useMemo(() => {
    let best = 0;
    let current = 0;
    for (const t of state.tournaments) {
      if (t.result === 'victory') {
        current++;
        if (current > best) best = current;
      } else {
        current = 0;
      }
    }
    return best;
  }, [state.tournaments]);

  const richestGem = useMemo(() => {
    if (enrichedGems.length === 0) return null;
    return [...enrichedGems].sort((a, b) => b.sellPrice - a.sellPrice)[0];
  }, [enrichedGems]);

  const totalTournamentRenown = useMemo(() => {
    return state.tournaments.reduce((sum, t) => sum + t.renownReward, 0);
  }, [state.tournaments]);

  const ownedLegendaryChampions = useMemo(() => {
    return enrichedChampions.filter(c => c.rarity === PB_RARITY_LEGENDARY);
  }, [enrichedChampions]);

  const ownedLegendaryGems = useMemo(() => {
    return enrichedGems.filter(g => g.rarity === PB_RARITY_LEGENDARY);
  }, [enrichedGems]);

  const masteredSpectrums = useMemo(() => {
    return state.spectrumMastery.filter(s => s.mastered);
  }, [state.spectrumMastery]);

  const unmasteredSpectrums = useMemo(() => {
    return state.spectrumMastery.filter(s => !s.mastered);
  }, [state.spectrumMastery]);

  const totalGemSellValue = useMemo(() => {
    return calculateTotalGemValue(state.gems);
  }, [state.gems]);

  const averageChampionLevel = useMemo(() => {
    return calculateAverageChampionLevel(state.champions);
  }, [state.champions]);

  const championPowerRanking = useMemo(() => {
    return calculateChampionPowerRanking(enrichedChampions);
  }, [enrichedChampions]);

  const tournamentSummary = useMemo(() => {
    return generateTournamentSummary(state.tournaments);
  }, [state.tournaments]);

  const battleRecommendation = useMemo(() => {
    return generateBattleRecommendation(
      totalLightPower,
      totalAgility,
      currentZoneDef.battleBonus,
      currentTitleDef.bonusPower,
    );
  }, [totalLightPower, totalAgility, currentZoneDef, currentTitleDef]);

  const spectrumDominance = useMemo((): { spectrum: string; count: number; color: string } | null => {
    if (state.champions.length === 0) return null;
    const counts: Record<string, number> = {};
    for (const c of state.champions) {
      const def = PB_CHAMPIONS.find(cd => cd.id === c.id);
      if (def) {
        counts[def.spectrumType] = (counts[def.spectrumType] ?? 0) + 1;
      }
    }
    let best: string = '';
    let bestCount = 0;
    for (const [spec, count] of Object.entries(counts)) {
      if (count > bestCount) {
        bestCount = count;
        best = spec;
      }
    }
    if (!best) return null;
    return { spectrum: best, count: bestCount, color: PB_SPECTRUM_COLORS[best] ?? '#999' };
  }, [state.champions]);

  const highestStructure = useMemo(() => {
    if (enrichedStructures.length === 0) return null;
    return [...enrichedStructures].sort((a, b) => b.level - a.level)[0];
  }, [enrichedStructures]);

  const recentDefeats = useMemo(() => {
    return enrichedTournaments.filter(t => t.result === 'defeat').slice(-5);
  }, [enrichedTournaments]);

  const gemCollectRate = useMemo(() => {
    if (state.turnCount === 0) return 0;
    return state.gems.length / state.turnCount;
  }, [state.gems, state.turnCount]);

  const activeAbilitiesCount = useMemo(() => {
    return enrichedAbilities.filter(a => a.isReady).length;
  }, [enrichedAbilities]);

  const lockedZones = useMemo(() => {
    const unlockedIds = new Set(state.zones.filter(z => z.unlocked).map(z => z.id));
    return PB_ARENA_ZONES.filter(z => !unlockedIds.has(z.id));
  }, [state.zones]);

  const nextUnlockableZone = useMemo(() => {
    const unlockedIds = new Set(state.zones.filter(z => z.unlocked).map(z => z.id));
    return PB_ARENA_ZONES.find(z => !unlockedIds.has(z.id)) ?? null;
  }, [state.zones]);

  // ─── Cost helpers (use stateRef) ───────────────────────────────────────
  const canAfford = useCallback((amount: number): boolean => {
    return stateRef.current.totalRenown >= amount;
  }, []);

  const getStructureUpgradeCost = useCallback((structureId: string): number => {
    const record = stateRef.current.structures.find(s => s.id === structureId);
    const def = PB_STRUCTURES.find(s => s.id === structureId);
    if (!record || !def || record.level >= def.maxLevel) return 0;
    return calculateUpgradeCost(def, record.level);
  }, []);

  const getZoneUnlockCost = useCallback((zoneId: string): number => {
    const def = PB_ARENA_ZONES.find(z => z.id === zoneId);
    return def?.unlockCost ?? 0;
  }, []);

  const getRecruitCost = useCallback((rarity: string): number => {
    return Math.floor((PB_RARITY_MULTIPLIER[rarity] ?? 1) * 20);
  }, []);

  // ─── Sell Gem ───────────────────────────────────────────────────────
  const sellGem = useCallback((gemId: string) => {
    setState(prev => {
      const gemDef = PB_GEMS.find(g => g.id === gemId);
      if (!gemDef) return prev;
      const owned = prev.gems.some(g => g.id === gemId);
      if (!owned) return prev;

      return {
        ...prev,
        totalRenown: prev.totalRenown + gemDef.sellPrice,
        totalRenownEarned: prev.totalRenownEarned + gemDef.sellPrice,
        gems: prev.gems.filter(g => g.id !== gemId),
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            type: 'gem' as const,
            message: `Sold ${gemDef.name} for ${gemDef.sellPrice} renown`,
            renownChange: gemDef.sellPrice,
            gemChange: -1,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, []);

  // ─── Synthesize Gems ──────────────────────────────────────────────────
  const synthesizeGems = useCallback((gemIds: string[]) => {
    setState(prev => {
      if (gemIds.length < 3) return prev;
      const ownedSet = new Set(prev.gems.map(g => g.id));
      for (const gid of gemIds) {
        if (!ownedSet.has(gid)) return prev;
      }

      const firstGem = PB_GEMS.find(g => g.id === gemIds[0]);
      if (!firstGem) return prev;
      const resultRarity = calculateGemSynthesisResult(firstGem.rarity);
      if (!resultRarity) return prev;

      const candidates = PB_GEMS.filter(g => g.rarity === resultRarity && !ownedSet.has(g.id));
      if (candidates.length === 0) return prev;
      const result = candidates[Math.floor(Math.random() * candidates.length)];

      const synthCost = Math.floor(firstGem.sellPrice * 2);
      if (prev.totalRenown < synthCost) return prev;

      const remainingGems = prev.gems.filter(g => !gemIds.includes(g.id));
      return {
        ...prev,
        totalRenown: prev.totalRenown - synthCost,
        gems: [...remainingGems, { id: result.id, collectedAt: Date.now() }],
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            type: 'gem' as const,
            message: `Synthesized ${gemIds.length} gems into ${result.name} (${resultRarity})`,
            renownChange: -synthCost,
            gemChange: 1 - gemIds.length,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, []);

  // ─── Dismiss Champion ─────────────────────────────────────────────────
  const dismissChampion = useCallback((championId: string) => {
    setState(prev => {
      const champion = prev.champions.find(c => c.id === championId);
      if (!champion) return prev;
      const championDef = PB_CHAMPIONS.find(c => c.id === championId);
      const refund = championDef ? Math.floor((PB_RARITY_MULTIPLIER[championDef.rarity] ?? 1) * 5) : 5;
      return {
        ...prev,
        totalRenown: prev.totalRenown + refund,
        champions: prev.champions.filter(c => c.id !== championId),
      };
    });
  }, []);

  // ─── Quick Collect (bonus gem for arena bonus) ────────────────────────
  const quickCollect = useCallback(() => {
    setState(prev => {
      const zoneDef = PB_ARENA_ZONES.find(z => z.id === prev.currentZoneId);
      const gemBonus = zoneDef?.gemBonus ?? 0;
      const alreadyCollected = new Set(prev.gems.map(g => g.id));

      const candidates = PB_GEMS.filter(g => !alreadyCollected.has(g.id));
      if (candidates.length === 0) return prev;

      const weights: Record<string, number> = { [PB_RARITY_COMMON]: 40, [PB_RARITY_UNUSUAL]: 30, [PB_RARITY_RARE]: 15, [PB_RARITY_EPIC]: 10, [PB_RARITY_LEGENDARY]: 5 };
      const roll = Math.random() * 100;
      let cumulative = 0;
      let selectedRarity = PB_RARITY_COMMON;
      for (const [rarity, weight] of Object.entries(weights)) {
        cumulative += weight;
        if (roll < cumulative) { selectedRarity = rarity; break; }
      }

      const filtered = candidates.filter(g => g.rarity === selectedRarity);
      const pool = filtered.length > 0 ? filtered : candidates;
      const chosen = pool[Math.floor(Math.random() * pool.length)];

      const gemRenown = Math.floor(chosen.lightPower * 0.5);
      const bonusRenown = gemBonus * 5;

      const recalc = recalcAndCheck({
        ...prev,
        totalRenown: prev.totalRenown + gemRenown + bonusRenown,
        totalRenownEarned: prev.totalRenownEarned + gemRenown + bonusRenown,
        totalGemsCollected: prev.totalGemsCollected + 1,
      });

      return {
        ...prev,
        ...recalc,
        totalRenown: prev.totalRenown + gemRenown + bonusRenown,
        totalRenownEarned: prev.totalRenownEarned + gemRenown + bonusRenown,
        totalGemsCollected: prev.totalGemsCollected + 1,
        gems: [...prev.gems, { id: chosen.id, collectedAt: Date.now() }],
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            type: 'gem' as const,
            message: `Quick collected ${chosen.name} in ${zoneDef?.name ?? 'arena'} (+${gemRenown + bonusRenown} renown)`,
            renownChange: gemRenown + bonusRenown,
            gemChange: 1,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcAndCheck]);

  // ─── Tips ─────────────────────────────────────────────────────────────
  const getTips = useCallback((): string[] => {
    const tips: string[] = [];
    if (state.gems.length < 5) tips.push('Collect more gems to forge powerful prism weapons.');
    if (state.champions.length < 3) tips.push('Recruit more champions to increase your battle power.');
    if (zonesUnlocked < 3) tips.push('Unlock new arena zones for better battle bonuses.');
    if (totalStructureLevels < 10) tips.push('Upgrade structures to passively earn more renown.');
    if (state.abilitiesUsed < 10) tips.push('Use spectrum abilities to gain mastery XP.');
    if (state.tournaments.length < 5) tips.push('Enter tournament battles to earn renown and practice.');
    if (spectrumsMastered < 2) tips.push('Focus on mastering spectrum types for powerful bonuses.');
    if (state.weaponsForged < 2) tips.push('Forge prism weapons by combining three or more gems.');
    if (tips.length === 0) tips.push('You are progressing well, Prism Warrior!');
    return tips;
  }, [state, zonesUnlocked, totalStructureLevels, spectrumsMastered]);

  // ─── Reset State ──────────────────────────────────────────────────────
  const resetState = useCallback(() => {
    setState(createInitialState());
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // RETURN API
  // ═══════════════════════════════════════════════════════════════════════════
  return {
    // ── State ──
    state,

    // ── Actions ──
    collectGem,
    recruitChampion,
    trainChampion,
    forgePrism,
    enterTournament,
    unlockZone,
    upgradeStructure,
    activateAbility,
    advanceDailyQuest,
    claimDailyQuest,
    switchZone,
    advanceTurn,
    resetState,
    sellGem,
    synthesizeGems,
    dismissChampion,
    quickCollect,

    // ── Computed: Enriched Data ──
    enrichedGems,
    enrichedChampions,
    enrichedZones,
    enrichedStructures,
    enrichedAbilities,
    enrichedAchievements,
    enrichedTournaments,
    activeDailyQuests,
    recentTournaments,
    recentAchievements,
    recentEventLog,

    // ── Computed: Zone & Title ──
    currentZoneDef,
    currentTitleDef,

    // ── Computed: Stats & Progress ──
    stats,
    progress,
    battleReadiness,
    renownHealth,

    // ── Computed: Analytics ──
    gemsByRarity,
    gemsBySpectrum,
    championsByRarity,
    totalLightPower,
    totalAgility,
    structureRenownPerTurn,
    gemPowerTotal,
    totalTournamentRenown,
    strongestChampion,
    topChampions,
    richestGem,
    winRate,
    winStreak,
    bestStreak,
    ownedLegendaryChampions,
    ownedLegendaryGems,
    masteredSpectrums,
    unmasteredSpectrums,
    availableGemsByRarity,
    totalGemSellValue,
    averageChampionLevel,
    championPowerRanking,
    tournamentSummary,
    battleRecommendation,
    spectrumDominance,
    highestStructure,
    recentDefeats,
    gemCollectRate,
    activeAbilitiesCount,
    lockedZones,
    nextUnlockableZone,

    // ── Computed: Grouped Data ──
    structuresByCategory,
    abilitiesByCategory,

    // ── Helpers ──
    canAfford,
    getStructureUpgradeCost,
    getZoneUnlockCost,
    getRecruitCost,
    getTips,

    // ── Constants (for UI rendering) ──
    PB_CHAMPIONS,
    PB_GEMS,
    PB_ARENA_ZONES,
    PB_STRUCTURES,
    PB_ABILITIES,
    PB_ACHIEVEMENTS,
    PB_TITLES,
    PB_ALL_SPECTRUMS,
    PB_SPECTRUM_COLORS,
    PB_RARITY_COLORS,
    PB_RARITY_MULTIPLIER,
    PB_COLOR_RUBY,
    PB_COLOR_SAPPHIRE,
    PB_COLOR_EMERALD,
    PB_COLOR_AMBER,
    PB_COLOR_PRISM,
    PB_COLOR_AMETHYST,
    PB_COLOR_OBSIDIAN,
    PB_COLOR_GOLD_GLOW,
  };
}
