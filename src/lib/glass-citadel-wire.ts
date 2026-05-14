// ============================================================================
// Glass Citadel Wire — 玻璃城堡 · Glass Crafting & Citadel Building Module
// ============================================================================
// Feature module for the Word Snake game (单词贪吃蛇).
// Prefix: `gl` for functions, `GL_` for constants.
// No recursive functions. No `&&` short-circuit side effects.
// SSR-safe: no direct localStorage/window access outside of Zustand persist.
// ============================================================================

import { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════════════
// Types & Interfaces
// ═══════════════════════════════════════════════════════════════════════════

export type GlRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'
export type GlGlassElement = 'Clear' | 'Fire' | 'Ice' | 'Earth' | 'Shadow' | 'Light' | 'Astral' | 'Void'
export type GlStructureCategory = 'furnace' | 'workshop' | 'gallery' | 'storage' | 'utility' | 'garden' | 'observatory'

export interface GlGlassTypeDef {
  id: string
  name: string
  color: string
  transparency: number
  durability: number
  element: GlGlassElement
  description: string
}

export interface GlArtifactDef {
  id: string
  name: string
  rarity: GlRarity
  glassType: string
  description: string
  power: number
  abilities: string[]
}

export interface GlTowerDef {
  id: string
  name: string
  description: string
  height: number
  unlockLevel: number
  color: string
}

export interface GlMaterialDef {
  id: string
  name: string
  rarity: GlRarity
  source: string
  description: string
}

export interface GlStructureDef {
  id: string
  name: string
  category: GlStructureCategory
  maxLevel: number
  baseCost: number
  upgradeMultiplier: number
  description: string
  effectPerLevel: string
}

export interface GlAbilityDef {
  id: string
  name: string
  description: string
  cooldown: number
  power: number
  element: GlGlassElement
  rarity: GlRarity
}

export interface GlAchievementDef {
  id: string
  name: string
  description: string
  icon: string
  reward: { gold: number; xp: number }
}

export interface GlTitleDef {
  id: string
  name: string
  levelReq: number
  icon: string
  description: string
}

export interface GlBlueprintDef {
  id: string
  name: string
  description: string
  requiredMaterials: { materialId: string; count: number }[]
  rarity: GlRarity
  artifactId: string
}

export interface GlLensDef {
  id: string
  name: string
  description: string
  magnification: number
  element: GlGlassElement
  color: string
}

export interface GlMosaicDef {
  id: string
  name: string
  description: string
  beautyScore: number
  glassRequirements: { glassTypeId: string; count: number }[]
}

// ── Instance types (player-owned state) ──────────────────────────────────

export interface GlArtifactInstance {
  instanceId: string
  defId: string
  level: number
  exhibited: boolean
  craftedAt: number
}

export interface GlTowerInstance {
  defId: string
  level: number
  lightEnergy: number
  builtAt: number
}

export interface GlStructureInstance {
  defId: string
  level: number
  builtAt: number
}

export interface GlMosaicInstance {
  instanceId: string
  defId: string
  installed: boolean
  createdAt: number
}

// ── Full store state ────────────────────────────────────────────────────

export interface GlassCitadelState {
  artifacts: GlArtifactInstance[]
  towers: GlTowerInstance[]
  materials: Record<string, number>
  structures: GlStructureInstance[]
  blueprints: string[]
  lenses: string[]
  mosaics: GlMosaicInstance[]
  citadelLevel: number
  glassExp: number
  gold: number
  furnaceTemperature: number
  lightEnergy: number
  achievements: string[]
  currentTitle: string
  totalCrafts: number
  totalTowersBuilt: number
  totalMasterpieces: number
  activeTowerId: string | null
}

// ═══════════════════════════════════════════════════════════════════════════
// Color Constants (8)
// ═══════════════════════════════════════════════════════════════════════════

export const GL_COLOR_CLEAR = '#F0F8FF'
export const GL_COLOR_STAINED = '#DC143C'
export const GL_COLOR_EMERALD = '#50C878'
export const GL_COLOR_AMBER = '#FFBF00'
export const GL_COLOR_FROSTED = '#B0E0E6'
export const GL_COLOR_CRYSTAL = '#E0FFFF'
export const GL_COLOR_PRISMATIC = '#FF69B4'
export const GL_COLOR_PHANTOM = '#DDA0DD'

// ═══════════════════════════════════════════════════════════════════════════
// GL_GLASS_TYPES (12)
// ═══════════════════════════════════════════════════════════════════════════

export const GL_GLASS_TYPES: GlGlassTypeDef[] = [
  { id: 'clear', name: 'Clear Glass', color: GL_COLOR_CLEAR, transparency: 0.95, durability: 30, element: 'Light', description: 'Pure transparent glass, the foundation of all glasscraft. Pristine and unadulterated.' },
  { id: 'stained_red', name: 'Stained Red', color: GL_COLOR_STAINED, transparency: 0.6, durability: 40, element: 'Fire', description: 'Deep crimson glass infused with iron oxide. Glows like embers when light passes through.' },
  { id: 'stained_blue', name: 'Stained Blue', color: '#4169E1', transparency: 0.55, durability: 45, element: 'Ice', description: 'Royal blue glass colored with cobalt compounds. Cool to the touch and shimmering.' },
  { id: 'emerald', name: 'Emerald Glass', color: GL_COLOR_EMERALD, transparency: 0.65, durability: 55, element: 'Earth', description: 'Vibrant green glass with chromium impurities. Said to bring clarity of vision.' },
  { id: 'amber', name: 'Amber Glass', color: GL_COLOR_AMBER, transparency: 0.7, durability: 50, element: 'Fire', description: 'Warm amber glass that captures sunlight. Resonates with ancient warmth and healing.' },
  { id: 'frosted', name: 'Frosted Glass', color: GL_COLOR_FROSTED, transparency: 0.35, durability: 65, element: 'Ice', description: 'Etched with microscopic ice crystals. Diffuses light into soft, dreamy patterns.' },
  { id: 'obsidian', name: 'Obsidian Glass', color: '#1C1C2E', transparency: 0.1, durability: 95, element: 'Shadow', description: 'Near-opaque volcanic glass. Unbreakable resolve forged in the heart of darkness.' },
  { id: 'crystal', name: 'Crystal Glass', color: GL_COLOR_CRYSTAL, transparency: 0.99, durability: 70, element: 'Light', description: 'Flawless optical crystal. Light bends to its will with absolute precision.' },
  { id: 'prismatic', name: 'Prismatic Glass', color: GL_COLOR_PRISMATIC, transparency: 0.8, durability: 60, element: 'Astral', description: 'Shimmers with every color of the spectrum. Each viewing reveals new patterns.' },
  { id: 'mirrored', name: 'Mirrored Glass', color: '#C0C0C0', transparency: 0.05, durability: 75, element: 'Light', description: 'Silvered glass that reflects perfectly. Can create illusions and duplicate light.' },
  { id: 'opalescent', name: 'Opalescent Glass', color: '#FFD6E8', transparency: 0.75, durability: 80, element: 'Astral', description: 'Shifting iridescent glass like the inside of an opal. No two pieces are alike.' },
  { id: 'phantom', name: 'Phantom Glass', color: GL_COLOR_PHANTOM, transparency: 0.5, durability: 85, element: 'Void', description: 'Semi-transparent glass that flickers between visibility. Touches the boundary of realms.' },
]

// ═══════════════════════════════════════════════════════════════════════════
// GL_ARTIFACTS (35, 5 rarity tiers)
// ═══════════════════════════════════════════════════════════════════════════

export const GL_ARTIFACTS: GlArtifactDef[] = [
  // Common (10)
  { id: 'glass_vial', name: 'Glass Vial of Clarity', rarity: 'Common', glassType: 'clear', description: 'A simple vial that makes murky liquids perfectly clear. Essential for any apprentice glassworker.', power: 5, abilities: ['Purify', 'Inspect'] },
  { id: 'frost_bead', name: 'Frost Bead', rarity: 'Common', glassType: 'frosted', description: 'A small bead that stays cold to the touch regardless of ambient temperature.', power: 6, abilities: ['Cool', 'Preserve'] },
  { id: 'amber_charm', name: 'Amber Sun Charm', rarity: 'Common', glassType: 'amber', description: 'Captures a ray of sunlight inside amber glass. Emits warmth on command.', power: 7, abilities: ['Warm', 'Illuminate'] },
  { id: 'red_shard', name: 'Crimson Shard', rarity: 'Common', glassType: 'stained_red', description: 'A sharp shard of red glass that glows faintly in the dark.', power: 5, abilities: ['Glow', 'Cut'] },
  { id: 'blue_lens_disc', name: 'Blue Lens Disc', rarity: 'Common', glassType: 'stained_blue', description: 'A flat disc of cobalt blue glass used for basic optical experiments.', power: 6, abilities: ['Magnify', 'Focus'] },
  { id: 'emerald_chip', name: 'Emerald Chip', rarity: 'Common', glassType: 'emerald', description: 'A chip of emerald glass that briefly reveals hidden writings when pressed to parchment.', power: 7, abilities: ['Reveal', 'Detect'] },
  { id: 'clear_prism_small', name: 'Small Clear Prism', rarity: 'Common', glassType: 'clear', description: 'A pocket-sized prism that splits light into faint rainbow bands.', power: 4, abilities: ['Refract', 'Analyze'] },
  { id: 'mirrored_dagger', name: 'Mirrored Glass Dagger', rarity: 'Common', glassType: 'mirrored', description: 'A ceremonial dagger made of mirrored glass. Reflects faces in perfect detail.', power: 8, abilities: ['Reflect', 'Distract'] },
  { id: 'opalescent_marble', name: 'Opalescent Marble', rarity: 'Common', glassType: 'opalescent', description: 'A swirling marble that changes color based on the mood of whoever holds it.', power: 5, abilities: ['Sense', 'Comfort'] },
  { id: 'phantom_whistle', name: 'Phantom Whistle', rarity: 'Common', glassType: 'phantom', description: 'A whistle made of phantom glass. Produces a sound only spirits can hear.', power: 6, abilities: ['Commune', 'Alert'] },

  // Uncommon (10)
  { id: 'crystal_orb', name: 'Crystal Orb of Foresight', rarity: 'Uncommon', glassType: 'crystal', description: 'A flawless crystal sphere that shows blurred images of possible futures when heated.', power: 15, abilities: ['Predict', 'Scry'] },
  { id: 'prismatic_kaleidoscope', name: 'Prismatic Kaleidoscope', rarity: 'Uncommon', glassType: 'prismatic', description: 'An ever-shifting kaleidoscope that creates infinite geometric patterns from ambient light.', power: 14, abilities: ['Create', 'Distract'] },
  { id: 'obsidian_shield', name: 'Obsidian Glass Shield', rarity: 'Uncommon', glassType: 'obsidian', description: 'A thick slab of obsidian glass that absorbs impacts. The surface ripples when struck.', power: 18, abilities: ['Protect', 'Absorb'] },
  { id: 'emerald_monocle', name: 'Emerald Monocle', rarity: 'Uncommon', glassType: 'emerald', description: 'A monocle that reveals the true nature of any material it focuses on.', power: 16, abilities: ['Identify', 'Analyze'] },
  { id: 'amber_cage', name: 'Amber Light Cage', rarity: 'Uncommon', glassType: 'amber', description: 'A hollow amber sphere that can trap light inside and release it as a directed beam.', power: 17, abilities: ['Trap', 'Release'] },
  { id: 'frost_mirror', name: 'Frost Mirror', rarity: 'Uncommon', glassType: 'frosted', description: 'A mirror that shows reflections from other places and times, though the images are hazy.', power: 15, abilities: ['Reflect', 'Glimpse'] },
  { id: 'phantom_hourglass', name: 'Phantom Hourglass', rarity: 'Uncommon', glassType: 'phantom', description: 'Sand flows upward in this hourglass. Time reverses briefly when flipped.', power: 20, abilities: ['Reverse', 'Delay'] },
  { id: 'red_lantern', name: 'Crimson Signal Lantern', rarity: 'Uncommon', glassType: 'stained_red', description: 'Projects red symbols onto distant surfaces. Used by glass citadel sentinels.', power: 13, abilities: ['Signal', 'Warn'] },
  { id: 'blue_crown', name: 'Azure Insight Crown', rarity: 'Uncommon', glassType: 'stained_blue', description: 'A circlet of blue glass shards that enhances the wearer\'s perception of magic.', power: 16, abilities: ['Enhance', 'Perceive'] },
  { id: 'mirrored_cloak', name: 'Mirrored Cloak of Disguise', rarity: 'Uncommon', glassType: 'mirrored', description: 'Thousands of mirrored scales create a cloak that renders the wearer nearly invisible.', power: 19, abilities: ['Conceal', 'Reflect'] },

  // Rare (8)
  { id: 'crystal_staff', name: 'Crystal Staff of Refraction', rarity: 'Rare', glassType: 'crystal', description: 'A staff topped with a perfect crystal. Can bend any light beam to follow complex paths.', power: 35, abilities: ['Refract', 'Redirect', 'Amplify'] },
  { id: 'obsidian_golem_core', name: 'Obsidian Golem Core', rarity: 'Rare', glassType: 'obsidian', description: 'The heart of a glass golem, pulsing with dark energy. Grants immense physical power.', power: 40, abilities: ['Empower', 'Fortify', 'Animate'] },
  { id: 'prismatic_chalice', name: 'Prismatic Chalice of Elements', rarity: 'Rare', glassType: 'prismatic', description: 'A chalice that can transform any liquid into its elemental counterpart.', power: 38, abilities: ['Transform', 'Purify', 'Elemental'] },
  { id: 'opalescent_tome', name: 'Opalescent Tome of Knowledge', rarity: 'Rare', glassType: 'opalescent', description: 'Pages made of thin opalescent glass that display different texts depending on the reader.', power: 32, abilities: ['Translate', 'Record', 'Adapt'] },
  { id: 'phantom_key', name: 'Phantom Skeleton Key', rarity: 'Rare', glassType: 'phantom', description: 'A key made of phantom glass that can unlock any physical or magical lock.', power: 42, abilities: ['Unlock', 'Phase', 'Access'] },
  { id: 'emerald_garden_orb', name: 'Emerald Garden Orb', rarity: 'Rare', glassType: 'emerald', description: 'Contains a miniature living garden inside. Plants grow at accelerated speed within its radius.', power: 30, abilities: ['Grow', 'Heal', 'Sustain'] },
  { id: 'amber_sundial', name: 'Amber Sundial of Ages', rarity: 'Rare', glassType: 'amber', description: 'An ancient sundial that can slow or accelerate the passage of time in a small area.', power: 36, abilities: ['Time Control', 'Age', 'Restore'] },
  { id: 'frost_heart', name: 'Frost Heart of Winter', rarity: 'Rare', glassType: 'frosted', description: 'A frozen glass heart that radiates perpetual cold. Can freeze entire rooms.', power: 34, abilities: ['Freeze', 'Contain', 'Preserve'] },

  // Epic (5)
  { id: 'crystal_throne', name: 'Crystal Throne of the Architect', rarity: 'Epic', glassType: 'crystal', description: 'A throne carved from a single massive crystal. Sitting upon it grants mastery over all glass.', power: 75, abilities: ['Command', 'Create', 'Control', 'Transcend'] },
  { id: 'obsidian_leviathan', name: 'Obsidian Leviathan Scale', rarity: 'Epic', glassType: 'obsidian', description: 'A scale from the legendary glass leviathan. Absorbs all forms of damage and converts it to energy.', power: 80, abilities: ['Absorb', 'Convert', 'Shield', 'Unbreakable'] },
  { id: 'phantom_phoenix', name: 'Phantom Phoenix Figurine', rarity: 'Epic', glassType: 'phantom', description: 'A figurine that periodically releases a spectral phoenix. The phoenix heals allies and burns enemies.', power: 70, abilities: ['Summon', 'Heal', 'Burn', 'Rebirth'] },
  { id: 'prismatic_eye', name: 'Prismatic All-Seeing Eye', rarity: 'Epic', glassType: 'prismatic', description: 'An eye that sees through all illusions and reveals the true form of everything it gazes upon.', power: 72, abilities: ['True Sight', 'Reveal', 'Nullify', 'Perceive'] },
  { id: 'mirrored_infinity', name: 'Mirrored Infinity Loop', rarity: 'Epic', glassType: 'mirrored', description: 'A Möbius strip of mirrored glass that creates infinite reflections, each containing a pocket dimension.', power: 68, abilities: ['Dimensional', 'Clone', 'Store', 'Multiply'] },

  // Legendary (2)
  { id: 'genesis_prism', name: 'Genesis Prism of Creation', rarity: 'Legendary', glassType: 'crystal', description: 'The first prism ever created, said to have refracted the light that created the world. Can create glass from nothing.', power: 150, abilities: ['Create', 'Genesis', 'Reality Warp', 'Omniscience', 'Transcend'] },
  { id: 'void_glass_heart', name: 'Void Glass Heart of Eternity', rarity: 'Legendary', glassType: 'phantom', description: 'The crystallized heart of the void itself. Grants eternal life and the power to walk between all realities.', power: 200, abilities: ['Eternal', 'Void Walk', 'Reality Shift', 'Omnipresence', 'Transcend'] },
]

// ═══════════════════════════════════════════════════════════════════════════
// GL_TOWERS (8)
// ═══════════════════════════════════════════════════════════════════════════

export const GL_TOWERS: GlTowerDef[] = [
  { id: 'clock_tower', name: 'Clock Tower', description: 'A grand clock tower with stained glass faces showing celestial time. Its gears are made of hardened crystal that never wear.', height: 120, unlockLevel: 1, color: GL_COLOR_AMBER },
  { id: 'prism_tower', name: 'Prism Tower', description: 'A spiraling tower of prismatic glass that casts rainbow light across the entire citadel at dawn and dusk.', height: 150, unlockLevel: 5, color: GL_COLOR_PRISMATIC },
  { id: 'mirror_tower', name: 'Mirror Tower', description: 'A tower of perfectly aligned mirrors that can reflect sunlight into any corner of the citadel.', height: 100, unlockLevel: 10, color: '#C0C0C0' },
  { id: 'crystal_spire', name: 'Crystal Spire', description: 'The tallest point of the citadel. A single enormous crystal focuses starlight into concentrated beams of power.', height: 200, unlockLevel: 15, color: GL_COLOR_CRYSTAL },
  { id: 'lantern_tower', name: 'Lantern Tower', description: 'A warm tower filled with glowing amber lanterns. Each lantern contains a trapped sunset that never fades.', height: 90, unlockLevel: 20, color: GL_COLOR_AMBER },
  { id: 'kaleidoscope_tower', name: 'Kaleidoscope Tower', description: 'A tower whose walls are kaleidoscopic glass. Walking through it is a different experience every time.', height: 130, unlockLevel: 28, color: GL_COLOR_PRISMATIC },
  { id: 'stargazer_tower', name: 'Stargazer Tower', description: 'An observatory tower with a ceiling of phantom glass that phases between transparent and opaque to reveal the cosmos.', height: 170, unlockLevel: 35, color: GL_COLOR_PHANTOM },
  { id: 'shadow_tower', name: 'Shadow Tower', description: 'A tower of obsidian glass that absorbs all light. Inside, shadows come alive and serve the citadel architect.', height: 140, unlockLevel: 42, color: '#1C1C2E' },
]

// ═══════════════════════════════════════════════════════════════════════════
// GL_MATERIALS (30)
// ═══════════════════════════════════════════════════════════════════════════

export const GL_MATERIALS: GlMaterialDef[] = [
  // Common (10)
  { id: 'silica_sand', name: 'Silica Sand', rarity: 'Common', source: 'Riverbanks and deserts', description: 'Fine quartz sand, the raw foundation of all glass. Endlessly abundant but essential.' },
  { id: 'soda_ash', name: 'Soda Ash', rarity: 'Common', source: 'Alkali lakes', description: 'Sodium carbonate that lowers the melting point of silica. Without it, glass cannot be shaped.' },
  { id: 'limestone', name: 'Limestone', rarity: 'Common', source: 'Quarries and cliffs', description: 'Calcium carbonate that stabilizes glass and prevents it from dissolving in water.' },
  { id: 'wood_ash', name: 'Wood Ash', rarity: 'Common', source: 'Burned timber', description: 'Potassium-rich ash from hardwood fires. Creates a subtle green tint in glass.' },
  { id: 'salt_peter', name: 'Salt Peter', rarity: 'Common', source: 'Cave deposits', description: 'Potassium nitrate used to clarify molten glass and remove bubbles.' },
  { id: 'iron_oxide', name: 'Iron Oxide', rarity: 'Common', source: 'Iron mines', description: 'Red-brown powder that colors glass amber, green, or black depending on concentration.' },
  { id: 'copper_shavings', name: 'Copper Shavings', rarity: 'Common', source: 'Copper workshops', description: 'Fine copper filings that produce brilliant turquoise and blue hues in glass.' },
  { id: 'quartz_crystal', name: 'Quartz Crystal', rarity: 'Common', source: 'Crystal caves', description: 'Raw quartz crystals that add optical clarity and brilliance to glass mixtures.' },
  { id: 'charcoal_powder', name: 'Charcoal Powder', rarity: 'Common', source: 'Charcoal kilns', description: 'Carbon powder used to remove impurities from molten glass during smelting.' },
  { id: 'sea_salt', name: 'Sea Salt', rarity: 'Common', source: 'Coastal evaporation', description: 'Mineral-rich salt that adds a subtle sparkle to finished glass surfaces.' },

  // Uncommon (8)
  { id: 'cobalt_ore', name: 'Cobalt Ore', rarity: 'Uncommon', source: 'Deep mines', description: 'Deep blue ore that produces the most vibrant blue glass in existence.' },
  { id: 'manganese_dioxide', name: 'Manganese Dioxide', rarity: 'Uncommon', source: 'Mineral veins', description: 'A purple-black powder that decolorizes glass or, in excess, creates amethyst hues.' },
  { id: 'chromium_oxide', name: 'Chromium Oxide', rarity: 'Uncommon', source: 'Volcanic deposits', description: 'Bright green pigment that creates the signature color of emerald glass.' },
  { id: 'gold_leaf', name: 'Gold Leaf', rarity: 'Uncommon', source: 'Alchemist suppliers', description: 'Impossibly thin sheets of gold. Suspended in glass, they create a rich ruby red.' },
  { id: 'silver_nitrate', name: 'Silver Nitrate', rarity: 'Uncommon', source: 'Silver mines', description: 'A key ingredient in creating mirrored glass surfaces with perfect reflectivity.' },
  { id: 'tin_oxide', name: 'Tin Oxide', rarity: 'Uncommon', source: 'Tin deposits', description: 'A white powder used to polish glass to a mirror finish after grinding.' },
  { id: 'borax', name: 'Borax', rarity: 'Uncommon', source: 'Dry lakebeds', description: 'Sodium borate that dramatically increases the thermal shock resistance of glass.' },
  { id: 'zinc_powder', name: 'Zinc Powder', rarity: 'Uncommon', source: 'Metal refineries', description: 'Added to glass mixtures to create brilliant white opaque glass.' },

  // Rare (7)
  { id: 'neodymium_oxide', name: 'Neodymium Oxide', rarity: 'Rare', source: 'Rare earth mines', description: 'Creates glass that shifts color between lavender and blue under different lighting.' },
  { id: 'erbium_oxide', name: 'Erbium Oxide', rarity: 'Rare', source: 'Monazite sands', description: 'Produces delicate pink glass that glows under ultraviolet light.' },
  { id: 'uranium_glass_powder', name: 'Uranium Glass Powder', rarity: 'Rare', source: 'Radioactive deposits', description: 'Creates Vaseline glass with an eerie green glow visible under blacklight.' },
  { id: 'sapphire_dust', name: 'Sapphire Dust', rarity: 'Rare', source: 'Sapphire mines', description: 'Crushed sapphire corundum that makes glass nearly as hard as diamond.' },
  { id: 'moonstone_shards', name: 'Moonstone Shards', rarity: 'Rare', source: 'Lunar meteorites', description: 'Opalescent fragments that give glass an otherworldly, shifting sheen.' },
  { id: 'phosphorescent_powder', name: 'Phosphorescent Powder', rarity: 'Rare', source: 'Deep sea creatures', description: 'Bioluminescent compound that makes glass glow in absolute darkness for hours.' },
  { id: 'volcanic_obsidian', name: 'Volcanic Obsidian', rarity: 'Rare', source: 'Active volcanoes', description: 'Natural volcanic glass of exceptional purity and strength. The basis of obsidian glass.' },

  // Epic (3)
  { id: 'void_essence', name: 'Void Essence', rarity: 'Epic', source: 'Dimensional rifts', description: 'Extracted from the spaces between dimensions. Gives phantom glass its reality-bending properties.' },
  { id: 'star_crystal_fragment', name: 'Star Crystal Fragment', rarity: 'Epic', source: 'Fallen stars', description: 'A fragment of crystallized stellar matter. The key ingredient in crafting crystal glass.' },
  { id: 'prism_moth_dust', name: 'Prism Moth Dust', rarity: 'Epic', source: 'Prismatic gardens', description: 'Iridescent scales from the legendary prism moth. Essential for creating prismatic glass.' },

  // Legendary (2)
  { id: 'genesis_spark', name: 'Genesis Spark', rarity: 'Legendary', source: 'The origin of glass', description: 'A spark of the original fire that created the first glass. Can transform any material into glass.' },
  { id: 'eternal_flame_salt', name: 'Eternal Flame Salt', rarity: 'Legendary', source: 'The world\'s core', description: 'Salt from the eternal fire at the center of the world. Makes glass that can never be broken or melted.' },
]

// ═══════════════════════════════════════════════════════════════════════════
// GL_STRUCTURES (25)
// ═══════════════════════════════════════════════════════════════════════════

export const GL_STRUCTURES: GlStructureDef[] = [
  // Furnaces (4)
  { id: 'basic_furnace', name: 'Basic Glass Furnace', category: 'furnace', maxLevel: 10, baseCost: 50, upgradeMultiplier: 1.4, description: 'A simple brick furnace for smelting silica sand into raw glass.', effectPerLevel: '+5% smelting speed per level' },
  { id: 'crucible_forge', name: 'Crucible Forge', category: 'furnace', maxLevel: 10, baseCost: 150, upgradeMultiplier: 1.5, description: 'A reinforced forge with a platinum crucible for mixing rare materials.', effectPerLevel: '+8% material efficiency per level' },
  { id: 'arcane_kiln', name: 'Arcane Kiln', category: 'furnace', maxLevel: 10, baseCost: 500, upgradeMultiplier: 1.6, description: 'A magical kiln fueled by light energy. Can smelt materials impossible to melt by normal means.', effectPerLevel: '+10% quality bonus per level' },
  { id: 'starfire_oven', name: 'Starfire Oven', category: 'furnace', maxLevel: 10, baseCost: 2000, upgradeMultiplier: 1.7, description: 'An oven that burns with captured starlight. Produces glass of unmatched purity.', effectPerLevel: '+12% chance of rare glass per level' },

  // Workshops (4)
  { id: 'grinding_bench', name: 'Grinding Bench', category: 'workshop', maxLevel: 10, baseCost: 80, upgradeMultiplier: 1.3, description: 'A bench with grinding wheels for shaping and polishing raw glass into useful forms.', effectPerLevel: '+5% grinding precision per level' },
  { id: 'lens_workshop', name: 'Lens Workshop', category: 'workshop', maxLevel: 10, baseCost: 200, upgradeMultiplier: 1.4, description: 'A precision workshop for grinding optical lenses with sub-millimeter accuracy.', effectPerLevel: '+8% lens quality per level' },
  { id: 'artifact_forge', name: 'Artifact Forge', category: 'workshop', maxLevel: 10, baseCost: 800, upgradeMultiplier: 1.5, description: 'A specialized forge for combining glass with magical materials to create artifacts.', effectPerLevel: '+10% artifact power per level' },
  { id: 'mosaic_studio', name: 'Mosaic Studio', category: 'workshop', maxLevel: 10, baseCost: 300, upgradeMultiplier: 1.4, description: 'A spacious studio with cutting tools for assembling intricate glass mosaics.', effectPerLevel: '+7% beauty bonus per level' },

  // Galleries (4)
  { id: 'glass_gallery', name: 'Glass Gallery', category: 'gallery', maxLevel: 10, baseCost: 120, upgradeMultiplier: 1.3, description: 'A display hall for exhibiting crafted glass artifacts. Increases citadel prestige.', effectPerLevel: '+5 gold per exhibited artifact per level' },
  { id: 'prism_hall', name: 'Prism Hall', category: 'gallery', maxLevel: 10, baseCost: 400, upgradeMultiplier: 1.4, description: 'A hall lined with prisms that creates mesmerizing light shows. Generates light energy.', effectPerLevel: '+10 light energy per hour per level' },
  { id: 'mirror_chamber', name: 'Mirror Chamber', category: 'gallery', maxLevel: 10, baseCost: 600, upgradeMultiplier: 1.5, description: 'A room of infinite reflections that amplifies the power of all exhibited artifacts.', effectPerLevel: '+6% artifact power boost per level' },
  { id: 'phantom_vault', name: 'Phantom Vault', category: 'gallery', maxLevel: 10, baseCost: 1500, upgradeMultiplier: 1.6, description: 'A vault of phantom glass that can store artifacts safely between dimensions.', effectPerLevel: '+2 extra artifact storage per level' },

  // Storage (4)
  { id: 'sand_silo', name: 'Sand Silo', category: 'storage', maxLevel: 10, baseCost: 60, upgradeMultiplier: 1.3, description: 'Stores raw materials safely. Protects silica sand from moisture and contamination.', effectPerLevel: '+50 material storage per level' },
  { id: 'glass_warehouse', name: 'Glass Warehouse', category: 'storage', maxLevel: 10, baseCost: 200, upgradeMultiplier: 1.4, description: 'Temperature-controlled storage for finished glass products.', effectPerLevel: '+20 artifact storage per level' },
  { id: 'blueprint_archive', name: 'Blueprint Archive', category: 'storage', maxLevel: 10, baseCost: 350, upgradeMultiplier: 1.5, description: 'Preserves ancient blueprints and crafting diagrams on glass tablets.', effectPerLevel: '+1 blueprint research slot per level' },
  { id: 'rare_vault', name: 'Rare Material Vault', category: 'storage', maxLevel: 10, baseCost: 1000, upgradeMultiplier: 1.6, description: 'A secure vault for storing epic and legendary materials. Prevents degradation.', effectPerLevel: '+10% material preservation per level' },

  // Utility (5)
  { id: 'light_collector', name: 'Light Collector', category: 'utility', maxLevel: 10, baseCost: 100, upgradeMultiplier: 1.4, description: 'Gathers ambient light and converts it to usable light energy for the citadel.', effectPerLevel: '+15 light energy per hour per level' },
  { id: 'gold_mint', name: 'Gold Mint', category: 'utility', maxLevel: 10, baseCost: 250, upgradeMultiplier: 1.5, description: 'Mints gold coins from smelted glass shards traded with passing merchants.', effectPerLevel: '+20 gold per hour per level' },
  { id: 'exp_accelerator', name: 'Experience Accelerator', category: 'utility', maxLevel: 10, baseCost: 400, upgradeMultiplier: 1.5, description: 'A structure of crystal lenses that focuses wisdom, accelerating glass experience gain.', effectPerLevel: '+8% XP gain per level' },
  { id: 'repair_station', name: 'Repair Station', category: 'utility', maxLevel: 10, baseCost: 180, upgradeMultiplier: 1.3, description: 'Repairs damaged artifacts and structures using molten glass as bonding agent.', effectPerLevel: '+5% repair efficiency per level' },
  { id: 'teleport_crystal', name: 'Teleport Crystal Array', category: 'utility', maxLevel: 10, baseCost: 800, upgradeMultiplier: 1.6, description: 'An array of crystal links allowing instant transport between unlocked towers.', effectPerLevel: 'Reduces travel cooldown by 10% per level' },

  // Garden (2)
  { id: 'crystal_garden', name: 'Crystal Garden', category: 'garden', maxLevel: 10, baseCost: 300, upgradeMultiplier: 1.4, description: 'A garden where glass flowers bloom. Attracts prism moths that shed valuable dust.', effectPerLevel: '+1 prism moth per hour per level' },
  { id: 'prism_greenhouse', name: 'Prism Greenhouse', category: 'garden', maxLevel: 10, baseCost: 500, upgradeMultiplier: 1.5, description: 'A greenhouse with prismatic glass walls that accelerates all material growth.', effectPerLevel: '+10% material yield per level' },

  // Observatory (2)
  { id: 'sky_observatory', name: 'Sky Observatory', category: 'observatory', maxLevel: 10, baseCost: 600, upgradeMultiplier: 1.5, description: 'An observation deck with powerful glass lenses for studying celestial phenomena.', effectPerLevel: '+5% star crystal discovery rate per level' },
  { id: 'void_scanner', name: 'Void Scanner', category: 'observatory', maxLevel: 10, baseCost: 1200, upgradeMultiplier: 1.6, description: 'A phantom glass device that detects void essence in the surrounding area.', effectPerLevel: '+8% void essence find rate per level' },
]

// ═══════════════════════════════════════════════════════════════════════════
// GL_ABILITIES (22)
// ═══════════════════════════════════════════════════════════════════════════

export const GL_ABILITIES: GlAbilityDef[] = [
  // Common (6)
  { id: 'glass_shard_throw', name: 'Glass Shard Throw', description: 'Hurl a razor-sharp glass shard at a target, dealing light damage.', cooldown: 2, power: 8, element: 'Clear', rarity: 'Common' },
  { id: 'frost_breath', name: 'Frost Breath', description: 'Exhale a cone of freezing air through a frosted glass conduit.', cooldown: 3, power: 12, element: 'Ice', rarity: 'Common' },
  { id: 'amber_glow', name: 'Amber Glow', description: 'Create a warm amber light that heals minor wounds and boosts morale.', cooldown: 4, power: 10, element: 'Fire', rarity: 'Common' },
  { id: 'crystal_shield', name: 'Crystal Shield', description: 'Summon a barrier of crystal glass that absorbs incoming damage.', cooldown: 5, power: 15, element: 'Light', rarity: 'Common' },
  { id: 'emerald_sense', name: 'Emerald Sense', description: ' momentarily see through illusions using an emerald glass lens.', cooldown: 6, power: 8, element: 'Earth', rarity: 'Common' },
  { id: 'mirror_flash', name: 'Mirror Flash', description: 'Reflect sunlight off mirrored glass to blind nearby enemies.', cooldown: 3, power: 10, element: 'Light', rarity: 'Common' },

  // Uncommon (6)
  { id: 'prismatic_burst', name: 'Prismatic Burst', description: 'Shatter a prismatic glass orb, releasing a rainbow explosion that damages and confuses.', cooldown: 8, power: 25, element: 'Astral', rarity: 'Uncommon' },
  { id: 'obsidian_wall', name: 'Obsidian Wall', description: 'Raise a wall of obsidian glass that absorbs all projectiles and energy.', cooldown: 10, power: 30, element: 'Shadow', rarity: 'Uncommon' },
  { id: 'phantom_step', name: 'Phantom Step', description: 'Phase through a solid object using phantom glass to briefly enter the void.', cooldown: 12, power: 20, element: 'Void', rarity: 'Uncommon' },
  { id: 'crystal_beam', name: 'Crystal Beam', description: 'Fire a concentrated beam of focused light through a crystal lens array.', cooldown: 7, power: 28, element: 'Light', rarity: 'Uncommon' },
  { id: 'stained_explosion', name: 'Stained Explosion', description: 'Detonate a stained glass bomb that sprays colored shards in all directions.', cooldown: 8, power: 22, element: 'Fire', rarity: 'Uncommon' },
  { id: 'frost_blizzard', name: 'Frost Blizzard', description: 'Summon a blizzard through amplified frosted glass channels.', cooldown: 15, power: 35, element: 'Ice', rarity: 'Uncommon' },

  // Rare (5)
  { id: 'genesis_craft', name: 'Genesis Craft', description: 'Create a temporary glass construct from raw light energy. The construct fights alongside you.', cooldown: 20, power: 50, element: 'Light', rarity: 'Rare' },
  { id: 'void_prison', name: 'Void Prison', description: 'Trap a target in a cage of phantom glass that exists between dimensions.', cooldown: 25, power: 55, element: 'Void', rarity: 'Rare' },
  { id: 'prismatic_storm', name: 'Prismatic Storm', description: 'Unleash a swirling storm of prismatic glass shards that rain elemental damage.', cooldown: 22, power: 48, element: 'Astral', rarity: 'Rare' },
  { id: 'obsidian_golem', name: 'Obsidian Golem', description: 'Animate an obsidian glass golem from the ground. Nearly indestructible and immensely powerful.', cooldown: 30, power: 60, element: 'Shadow', rarity: 'Rare' },
  { id: 'amber_phoenix', name: 'Amber Phoenix', description: 'Release a phoenix made of amber glass that heals all allies and incinerates enemies.', cooldown: 25, power: 52, element: 'Fire', rarity: 'Rare' },

  // Epic (3)
  { id: 'crystal_palace', name: 'Crystal Palace', description: 'Summon an entire crystal palace that provides shelter, healing, and damage immunity for all allies inside.', cooldown: 60, power: 100, element: 'Light', rarity: 'Epic' },
  { id: 'phantom_eclipse', name: 'Phantom Eclipse', description: 'Plunge the area into total darkness using phantom glass. Only you and allies can see. Enemies are paralyzed.', cooldown: 45, power: 90, element: 'Void', rarity: 'Epic' },
  { id: 'prismatic_nova', name: 'Prismatic Nova', description: 'Detonate a prismatic nova that deals massive damage of all elements simultaneously.', cooldown: 50, power: 95, element: 'Astral', rarity: 'Epic' },

  // Legendary (2)
  { id: 'genesis_creation', name: 'Genesis Creation', description: 'The original glass creation ability. Temporarily reshape reality itself through glass.', cooldown: 120, power: 200, element: 'Light', rarity: 'Legendary' },
  { id: 'void_transcendence', name: 'Void Transcendence', description: 'Step completely into the void, becoming invulnerable and omnipresent for a brief time.', cooldown: 120, power: 250, element: 'Void', rarity: 'Legendary' },
]

// ═══════════════════════════════════════════════════════════════════════════
// GL_ACHIEVEMENTS (18)
// ═══════════════════════════════════════════════════════════════════════════

export const GL_ACHIEVEMENTS: GlAchievementDef[] = [
  { id: 'first_smelt', name: 'First Light', description: 'Smelt your first piece of glass in the citadel furnace.', icon: '🔥', reward: { gold: 50, xp: 25 } },
  { id: 'ten_smelts', name: 'Glass Apprentice', description: 'Smelt 10 pieces of glass of any type.', icon: '🔨', reward: { gold: 200, xp: 100 } },
  { id: 'fifty_smelts', name: 'Master Smelter', description: 'Smelt 50 pieces of glass. The furnace sings your name.', icon: '🏭', reward: { gold: 500, xp: 300 } },
  { id: 'first_artifact', name: 'First Creation', description: 'Craft your first glass artifact from a blueprint.', icon: '💎', reward: { gold: 100, xp: 50 } },
  { id: 'ten_artifacts', name: 'Artisan of Glass', description: 'Craft 10 glass artifacts of any rarity.', icon: '🎨', reward: { gold: 400, xp: 200 } },
  { id: 'epic_artifact', name: 'Epic Craftsman', description: 'Craft an artifact of Epic or higher rarity.', icon: '⚡', reward: { gold: 1000, xp: 500 } },
  { id: 'first_tower', name: 'Tower Raiser', description: 'Build your first citadel tower.', icon: '🏰', reward: { gold: 150, xp: 75 } },
  { id: 'all_towers', name: 'Citadel Architect', description: 'Build all 8 citadel towers.', icon: '🏙️', reward: { gold: 3000, xp: 1500 } },
  { id: 'first_mosaic', name: 'First Mosaic', description: 'Create your first glass mosaic masterpiece.', icon: '🖼️', reward: { gold: 100, xp: 50 } },
  { id: 'five_mosaics', name: 'Mosaic Master', description: 'Create 5 glass mosaics and install them in the citadel.', icon: '🎭', reward: { gold: 600, xp: 300 } },
  { id: 'first_lens', name: 'Lens Grinder', description: 'Grind your first optical lens.', icon: '🔭', reward: { gold: 75, xp: 40 } },
  { id: 'lens_combo', name: 'Optical Engineer', description: 'Combine two lenses into a superior compound lens.', icon: '🔍', reward: { gold: 500, xp: 250 } },
  { id: 'ten_lenses', name: 'Master Optician', description: 'Collect 10 different optical lenses.', icon: '👁️', reward: { gold: 800, xp: 400 } },
  { id: 'max_furnace', name: 'Inferno Master', description: 'Raise the furnace temperature to its maximum of 3000 degrees.', icon: '🌡️', reward: { gold: 1000, xp: 500 } },
  { id: 'exhibit_five', name: 'Gallery Curator', description: 'Exhibit 5 artifacts simultaneously in the gallery.', icon: '🏛️', reward: { gold: 700, xp: 350 } },
  { id: 'light_focus', name: 'Light Bender', description: 'Focus light through a tower to generate 1000 light energy total.', icon: '💡', reward: { gold: 600, xp: 300 } },
  { id: 'legendary_blueprint', name: 'Legendary Vision', description: 'Learn a Legendary rarity blueprint.', icon: '🌟', reward: { gold: 2000, xp: 1000 } },
  { id: 'level_fifty', name: 'Glass Immortal', description: 'Reach citadel level 50.', icon: '👑', reward: { gold: 10000, xp: 5000 } },
]

// ═══════════════════════════════════════════════════════════════════════════
// LN_TITLES (8)
// ═══════════════════════════════════════════════════════════════════════════

export const LN_TITLES: GlTitleDef[] = [
  { id: 'glass_apprentice', name: 'Glass Apprentice', levelReq: 1, icon: '🪟', description: 'A beginner who has just started learning the art of glass crafting.' },
  { id: 'journeyman_glazier', name: 'Journeyman Glazier', levelReq: 5, icon: '🔨', description: 'A competent glassworker who can shape and color glass with confidence.' },
  { id: 'glass_stainer', name: 'Glass Stainer', levelReq: 10, icon: '🎨', description: 'An artist who brings color to glass, creating beautiful stained glass windows.' },
  { id: 'master_smelter', name: 'Master Smelter', levelReq: 18, icon: '🔥', description: 'One who commands the furnace with perfect precision, smelting the finest glass.' },
  { id: 'crystal_artificer', name: 'Crystal Artificer', levelReq: 26, icon: '💎', description: 'A master of crystal glass who can craft artifacts of remarkable power.' },
  { id: 'prism_lord', name: 'Prism Lord', levelReq: 34, icon: '🌈', description: 'A ruler of light and color who bends the spectrum to their will.' },
  { id: 'phantom_architect', name: 'Phantom Architect', levelReq: 42, icon: '👻', description: 'One who builds with phantom glass, creating structures between dimensions.' },
  { id: 'citadel_architect', name: 'Citadel Architect', levelReq: 50, icon: '👑', description: 'The supreme master of the Glass Citadel. All glass bows to your command.' },
]

// ═══════════════════════════════════════════════════════════════════════════
// GL_BLUEPRINTS (15)
// ═══════════════════════════════════════════════════════════════════════════

export const GL_BLUEPRINTS: GlBlueprintDef[] = [
  // Common (4)
  { id: 'bp_glass_vial', name: 'Glass Vial Blueprint', description: 'A simple vial that purifies liquids. The most fundamental artifact of glasscraft.', requiredMaterials: [{ materialId: 'silica_sand', count: 5 }, { materialId: 'soda_ash', count: 3 }, { materialId: 'quartz_crystal', count: 1 }], rarity: 'Common', artifactId: 'glass_vial' },
  { id: 'bp_frost_bead', name: 'Frost Bead Blueprint', description: 'A small bead of frosted glass that stays perpetually cold.', requiredMaterials: [{ materialId: 'silica_sand', count: 5 }, { materialId: 'soda_ash', count: 3 }, { materialId: 'manganese_dioxide', count: 2 }], rarity: 'Common', artifactId: 'frost_bead' },
  { id: 'bp_amber_charm', name: 'Amber Charm Blueprint', description: 'A warm charm that captures sunlight and radiates it on demand.', requiredMaterials: [{ materialId: 'silica_sand', count: 5 }, { materialId: 'iron_oxide', count: 3 }, { materialId: 'charcoal_powder', count: 2 }], rarity: 'Common', artifactId: 'amber_charm' },
  { id: 'bp_red_shard', name: 'Crimson Shard Blueprint', description: 'A sharp shard of red glass that glows in darkness.', requiredMaterials: [{ materialId: 'silica_sand', count: 5 }, { materialId: 'copper_shavings', count: 4 }, { materialId: 'salt_peter', count: 2 }], rarity: 'Common', artifactId: 'red_shard' },

  // Uncommon (4)
  { id: 'bp_crystal_orb', name: 'Crystal Orb Blueprint', description: 'A flawless crystal sphere that shows glimpses of possible futures.', requiredMaterials: [{ materialId: 'quartz_crystal', count: 5 }, { materialId: 'borax', count: 3 }, { materialId: 'cobalt_ore', count: 2 }], rarity: 'Uncommon', artifactId: 'crystal_orb' },
  { id: 'bp_prismatic_kaleidoscope', name: 'Kaleidoscope Blueprint', description: 'An ever-shifting kaleidoscope creating infinite patterns from light.', requiredMaterials: [{ materialId: 'chromium_oxide', count: 3 }, { materialId: 'borax', count: 4 }, { materialId: 'gold_leaf', count: 2 }], rarity: 'Uncommon', artifactId: 'prismatic_kaleidoscope' },
  { id: 'bp_obsidian_shield', name: 'Obsidian Shield Blueprint', description: 'A thick slab of obsidian glass that absorbs impacts.', requiredMaterials: [{ materialId: 'volcanic_obsidian', count: 4 }, { materialId: 'charcoal_powder', count: 5 }, { materialId: 'limestone', count: 3 }], rarity: 'Uncommon', artifactId: 'obsidian_shield' },
  { id: 'bp_frost_mirror', name: 'Frost Mirror Blueprint', description: 'A mirror showing reflections from distant places and times.', requiredMaterials: [{ materialId: 'silver_nitrate', count: 3 }, { materialId: 'manganese_dioxide', count: 3 }, { materialId: 'tin_oxide', count: 2 }], rarity: 'Uncommon', artifactId: 'frost_mirror' },

  // Rare (4)
  { id: 'bp_crystal_staff', name: 'Crystal Staff Blueprint', description: 'A staff that bends light beams along complex paths.', requiredMaterials: [{ materialId: 'sapphire_dust', count: 5 }, { materialId: 'cobalt_ore', count: 4 }, { materialId: 'star_crystal_fragment', count: 1 }], rarity: 'Rare', artifactId: 'crystal_staff' },
  { id: 'bp_opalescent_tome', name: 'Opalescent Tome Blueprint', description: 'Pages of opalescent glass that adapt their text to the reader.', requiredMaterials: [{ materialId: 'moonstone_shards', count: 4 }, { materialId: 'erbium_oxide', count: 3 }, { materialId: 'borax', count: 5 }], rarity: 'Rare', artifactId: 'opalescent_tome' },
  { id: 'bp_phantom_key', name: 'Phantom Key Blueprint', description: 'A key of phantom glass that opens any lock.', requiredMaterials: [{ materialId: 'void_essence', count: 2 }, { materialId: 'moonstone_shards', count: 3 }, { materialId: 'phosphorescent_powder', count: 2 }], rarity: 'Rare', artifactId: 'phantom_key' },
  { id: 'bp_frost_heart', name: 'Frost Heart Blueprint', description: 'A frozen glass heart that radiates eternal cold.', requiredMaterials: [{ materialId: 'uranium_glass_powder', count: 2 }, { materialId: 'manganese_dioxide', count: 5 }, { materialId: 'erbium_oxide', count: 3 }], rarity: 'Rare', artifactId: 'frost_heart' },

  // Epic (2)
  { id: 'bp_crystal_throne', name: 'Crystal Throne Blueprint', description: 'A throne granting mastery over all forms of glass.', requiredMaterials: [{ materialId: 'star_crystal_fragment', count: 3 }, { materialId: 'sapphire_dust', count: 5 }, { materialId: 'neodymium_oxide', count: 2 }], rarity: 'Epic', artifactId: 'crystal_throne' },
  { id: 'bp_mirrored_infinity', name: 'Mirrored Infinity Blueprint', description: 'A Mobius strip of mirrors containing pocket dimensions.', requiredMaterials: [{ materialId: 'silver_nitrate', count: 5 }, { materialId: 'star_crystal_fragment', count: 2 }, { materialId: 'tin_oxide', count: 4 }], rarity: 'Epic', artifactId: 'mirrored_infinity' },

  // Legendary (1)
  { id: 'bp_genesis_prism', name: 'Genesis Prism Blueprint', description: 'The first prism ever created, with the power to create glass from nothing.', requiredMaterials: [{ materialId: 'genesis_spark', count: 1 }, { materialId: 'star_crystal_fragment', count: 5 }, { materialId: 'eternal_flame_salt', count: 1 }], rarity: 'Legendary', artifactId: 'genesis_prism' },
]

// ═══════════════════════════════════════════════════════════════════════════
// GL_LENSES (20)
// ═══════════════════════════════════════════════════════════════════════════

export const GL_LENSES: GlLensDef[] = [
  // Common (5)
  { id: 'clear_reading_lens', name: 'Clear Reading Lens', description: 'A simple magnifying lens for reading fine print on glass tablets.', magnification: 2, element: 'Clear', color: GL_COLOR_CLEAR },
  { id: 'amber_warming_lens', name: 'Amber Warming Lens', description: 'An amber lens that focuses sunlight into warming rays.', magnification: 1.5, element: 'Fire', color: GL_COLOR_AMBER },
  { id: 'blue_inspection_lens', name: 'Blue Inspection Lens', description: 'A cobalt blue lens that reveals hidden magical residues.', magnification: 3, element: 'Ice', color: '#4169E1' },
  { id: 'emerald_focusing_lens', name: 'Emerald Focusing Lens', description: 'An emerald lens that sharpens and concentrates energy beams.', magnification: 2.5, element: 'Earth', color: GL_COLOR_EMERALD },
  { id: 'frosted_diffusion_lens', name: 'Frosted Diffusion Lens', description: 'A frosted lens that softens harsh light into gentle, even illumination.', magnification: 1, element: 'Ice', color: GL_COLOR_FROSTED },

  // Uncommon (5)
  { id: 'crystal_precision_lens', name: 'Crystal Precision Lens', description: 'A flawless crystal lens for the finest optical work. No distortion at any magnification.', magnification: 5, element: 'Light', color: GL_COLOR_CRYSTAL },
  { id: 'obsidian_void_lens', name: 'Obsidian Void Lens', description: 'A dark lens that allows viewing into shadow dimensions.', magnification: 4, element: 'Shadow', color: '#1C1C2E' },
  { id: 'prismatic_analysis_lens', name: 'Prismatic Analysis Lens', description: 'Splits any beam into its spectral components for magical analysis.', magnification: 3, element: 'Astral', color: GL_COLOR_PRISMATIC },
  { id: 'mirrored_reflection_lens', name: 'Mirrored Reflection Lens', description: 'A concave mirrored lens that redirects light with perfect fidelity.', magnification: 6, element: 'Light', color: '#C0C0C0' },
  { id: 'opalescent_diagnostic_lens', name: 'Opalescent Diagnostic Lens', description: 'An opalescent lens that shifts color to indicate material purity.', magnification: 4, element: 'Astral', color: '#FFD6E8' },

  // Rare (5)
  { id: 'sapphire_microscope_lens', name: 'Sapphire Microscope Lens', description: 'An extremely powerful sapphire lens that reveals structures invisible to the naked eye.', magnification: 10, element: 'Earth', color: '#0F52BA' },
  { id: 'moonstone_astral_lens', name: 'Moonstone Astral Lens', description: 'A moonstone lens that shows the astral plane overlapping with reality.', magnification: 8, element: 'Astral', color: '#E8E0D0' },
  { id: 'uranium_detection_lens', name: 'Uranium Detection Lens', description: 'A uranium glass lens that glows green in the presence of hidden magical traps.', magnification: 5, element: 'Earth', color: '#50C878' },
  { id: 'neodymium_spectro_lens', name: 'Neodymium Spectro Lens', description: 'A neodymium lens that shifts between colors to analyze any elemental energy.', magnification: 7, element: 'Light', color: '#9B59B6' },
  { id: 'phantom_phase_lens', name: 'Phantom Phase Lens', description: 'A phantom glass lens that allows seeing through solid matter briefly.', magnification: 6, element: 'Void', color: GL_COLOR_PHANTOM },

  // Epic (3)
  { id: 'star_crystal_telescope', name: 'Star Crystal Telescope Lens', description: 'A massive lens made from a star crystal fragment. Can see details on distant planets.', magnification: 50, element: 'Light', color: '#FFD700' },
  { id: 'void_rift_lens', name: 'Void Rift Lens', description: 'A lens containing void essence that opens tiny dimensional windows.', magnification: 20, element: 'Void', color: '#2C003E' },
  { id: 'prism_moth_lens', name: 'Prism Moth Compound Lens', description: 'A compound lens array made from prism moth wings. Sees in every spectrum simultaneously.', magnification: 30, element: 'Astral', color: '#FF1493' },

  // Legendary (2)
  { id: 'genesis_eye_lens', name: 'Genesis Eye Lens', description: 'A lens crafted from the Genesis Spark itself. Reveals the fundamental structure of reality.', magnification: 100, element: 'Light', color: '#FFFFFF' },
  { id: 'eternal_observation_lens', name: 'Eternal Observation Lens', description: 'A lens made from eternal flame salt. Can observe any point in time and space.', magnification: 200, element: 'Void', color: '#0A0A1A' },
]

// ═══════════════════════════════════════════════════════════════════════════
// GL_MOSAICS (12)
// ═══════════════════════════════════════════════════════════════════════════

export const GL_MOSAICS: GlMosaicDef[] = [
  { id: 'mosaic_dawn', name: 'Dawn of Glass', description: 'A mosaic depicting the first sunrise through the Glass Citadel. Warm amber and clear pieces blend seamlessly.', beautyScore: 10, glassRequirements: [{ glassTypeId: 'clear', count: 5 }, { glassTypeId: 'amber', count: 3 }, { glassTypeId: 'frosted', count: 2 }] },
  { id: 'mosaic_ocean', name: 'The Endless Ocean', description: 'Waves of blue and frosted glass crash against shores of clear crystal. Motion seems captured in frozen glass.', beautyScore: 15, glassRequirements: [{ glassTypeId: 'stained_blue', count: 6 }, { glassTypeId: 'frosted', count: 4 }, { glassTypeId: 'clear', count: 3 }] },
  { id: 'mosaic_forest', name: 'Emerald Canopy', description: 'Towering trees of emerald and clear glass form a dense forest canopy. Frosted pieces create morning mist.', beautyScore: 18, glassRequirements: [{ glassTypeId: 'emerald', count: 7 }, { glassTypeId: 'clear', count: 4 }, { glassTypeId: 'frosted', count: 3 }] },
  { id: 'mosaic_volcano', name: 'Volcanic Eruption', description: 'Red and obsidian glass pieces form a dramatic erupting volcano. Amber pieces flow as lava rivers.', beautyScore: 20, glassRequirements: [{ glassTypeId: 'stained_red', count: 5 }, { glassTypeId: 'obsidian', count: 4 }, { glassTypeId: 'amber', count: 5 }] },
  { id: 'mosaic_galaxy', name: 'The Cosmic Spiral', description: 'A spiral galaxy rendered in crystal, prismatic, and phantom glass. Starlike clear pieces dot the void.', beautyScore: 30, glassRequirements: [{ glassTypeId: 'crystal', count: 8 }, { glassTypeId: 'prismatic', count: 5 }, { glassTypeId: 'phantom', count: 3 }] },
  { id: 'mosaic_garden', name: 'The Crystal Garden', description: 'Flowers of every glass type bloom in an eternal garden. Opalescent butterflies rest on emerald leaves.', beautyScore: 22, glassRequirements: [{ glassTypeId: 'emerald', count: 5 }, { glassTypeId: 'opalescent', count: 4 }, { glassTypeId: 'amber', count: 3 }] },
  { id: 'mosaic_storm', name: 'The Tempest', description: 'A violent storm captured in glass. Blue and mirrored pieces create lightning. Phantom glass forms the clouds.', beautyScore: 25, glassRequirements: [{ glassTypeId: 'stained_blue', count: 6 }, { glassTypeId: 'mirrored', count: 4 }, { glassTypeId: 'phantom', count: 4 }] },
  { id: 'mosaic_palace', name: 'The Glass Palace', description: 'An intricate depiction of the entire Glass Citadel. Every tower is rendered in its signature glass type.', beautyScore: 35, glassRequirements: [{ glassTypeId: 'crystal', count: 5 }, { glassTypeId: 'mirrored', count: 3 }, { glassTypeId: 'prismatic', count: 4 }] },
  { id: 'mosaic_dragons', name: 'Dragon Flight', description: 'Dragons made of obsidian and red glass soar through a sky of crystal and amber clouds.', beautyScore: 28, glassRequirements: [{ glassTypeId: 'obsidian', count: 6 }, { glassTypeId: 'stained_red', count: 5 }, { glassTypeId: 'crystal', count: 3 }] },
  { id: 'mosaic_aurora', name: 'Northern Aurora', description: 'Dancing aurora lights rendered in prismatic and phantom glass against a frosted night sky.', beautyScore: 32, glassRequirements: [{ glassTypeId: 'prismatic', count: 7 }, { glassTypeId: 'phantom', count: 5 }, { glassTypeId: 'frosted', count: 4 }] },
  { id: 'mosaic_void', name: 'The Void Between', description: 'An abstract mosaic of phantom and obsidian glass depicting the space between dimensions.', beautyScore: 40, glassRequirements: [{ glassTypeId: 'phantom', count: 8 }, { glassTypeId: 'obsidian', count: 6 }, { glassTypeId: 'mirrored', count: 3 }] },
  { id: 'mosaic_genesis', name: 'The Genesis of Glass', description: 'The origin story of glass rendered in every type. Crystal forms the central creation spark.', beautyScore: 50, glassRequirements: [{ glassTypeId: 'crystal', count: 10 }, { glassTypeId: 'phantom', count: 5 }, { glassTypeId: 'opalescent', count: 5 }] },
]

// ═══════════════════════════════════════════════════════════════════════════
// Additional Data Tables
// ═══════════════════════════════════════════════════════════════════════════

export const GL_RARITY_DATA = [
  { name: 'Common' as GlRarity, color: '#9CA3AF', weight: 50, xpMult: 1, icon: '🪟' },
  { name: 'Uncommon' as GlRarity, color: '#22C55E', weight: 30, xpMult: 1.5, icon: '🔧' },
  { name: 'Rare' as GlRarity, color: '#3B82F6', weight: 14, xpMult: 2.5, icon: '💎' },
  { name: 'Epic' as GlRarity, color: '#A855F7', weight: 5, xpMult: 4, icon: '⚡' },
  { name: 'Legendary' as GlRarity, color: '#F59E0B', weight: 1, xpMult: 8, icon: '👑' },
]

export const GL_ELEMENTS: GlGlassElement[] = [
  'Clear', 'Fire', 'Ice', 'Earth', 'Shadow', 'Light', 'Astral', 'Void',
]

export const GL_ELEMENT_COLORS: Record<GlGlassElement, string> = {
  Clear: GL_COLOR_CLEAR,
  Fire: '#FF6B35',
  Ice: '#87CEEB',
  Earth: GL_COLOR_EMERALD,
  Shadow: '#2C2C3E',
  Light: '#FFFACD',
  Astral: '#DA70D6',
  Void: '#0A0A2E',
}

export const GL_FURNACE_ZONES = [
  { id: 'warm_zone', name: 'Warm Zone', minTemp: 400, maxTemp: 800, color: '#FFA07A', description: 'Basic warming for pre-heating raw materials. Sand begins to soften but won\'t melt.' },
  { id: 'softening_zone', name: 'Softening Zone', minTemp: 800, maxTemp: 1200, color: '#FF8C00', description: 'Glass begins to soften and become malleable. Suitable for simple bending and shaping.' },
  { id: 'working_zone', name: 'Working Zone', minTemp: 1200, maxTemp: 1800, color: '#FF4500', description: 'Optimal temperature for most glassworking. Glass flows freely and can be blown or molded.' },
  { id: 'refining_zone', name: 'Refining Zone', minTemp: 1800, maxTemp: 2500, color: '#DC143C', description: 'High temperatures that remove impurities and create exceptionally clear, strong glass.' },
  { id: 'genesis_zone', name: 'Genesis Zone', minTemp: 2500, maxTemp: 3000, color: '#8B0000', description: 'The hottest achievable temperature. Only at this extreme can legendary glass be forged.' },
]

export const GL_SHOP_ITEMS = [
  { id: 'shop_sand_bundle', name: 'Sand Bundle', description: 'A bundle of 20 silica sand, enough for several glass batches.', cost: 30, itemType: 'material' as const, materialId: 'silica_sand', count: 20, icon: '🏖️' },
  { id: 'shop_soda_bundle', name: 'Soda Ash Pack', description: 'A pack of 10 soda ash for glass melting.', cost: 25, itemType: 'material' as const, materialId: 'soda_ash', count: 10, icon: '🧂' },
  { id: 'shop_limestone_bundle', name: 'Limestone Block', description: 'A block of 10 limestone for glass stabilization.', cost: 20, itemType: 'material' as const, materialId: 'limestone', count: 10, icon: '🪨' },
  { id: 'shop_quartz_bundle', name: 'Quartz Crystal Set', description: '5 quartz crystals for clear glass crafting.', cost: 60, itemType: 'material' as const, materialId: 'quartz_crystal', count: 5, icon: '💎' },
  { id: 'shop_cobalt_sample', name: 'Cobalt Ore Sample', description: '3 pieces of cobalt ore for blue glass.', cost: 80, itemType: 'material' as const, materialId: 'cobalt_ore', count: 3, icon: '🔵' },
  { id: 'shop_borax_pack', name: 'Borax Pack', description: '5 borax for heat-resistant glass crafting.', cost: 100, itemType: 'material' as const, materialId: 'borax', count: 5, icon: '🧪' },
  { id: 'shop_gold_leaf', name: 'Gold Leaf Sheet', description: 'A sheet of gold leaf for red glass coloring.', cost: 120, itemType: 'material' as const, materialId: 'gold_leaf', count: 2, icon: '🥇' },
  { id: 'shop_silver_nitrate', name: 'Silver Nitrate Vial', description: 'A vial of silver nitrate for mirrored glass.', cost: 150, itemType: 'material' as const, materialId: 'silver_nitrate', count: 2, icon: '🪞' },
  { id: 'shop_bp_crystal_orb', name: 'Crystal Orb Blueprint', description: 'Learn the blueprint for the Crystal Orb of Foresight.', cost: 500, itemType: 'blueprint' as const, blueprintId: 'bp_crystal_orb', icon: '📋' },
  { id: 'shop_bp_prismatic_kaleidoscope', name: 'Kaleidoscope Blueprint', description: 'Learn the blueprint for the Prismatic Kaleidoscope.', cost: 500, itemType: 'blueprint' as const, blueprintId: 'bp_prismatic_kaleidoscope', icon: '📋' },
  { id: 'shop_bp_obsidian_shield', name: 'Obsidian Shield Blueprint', description: 'Learn the blueprint for the Obsidian Glass Shield.', cost: 600, itemType: 'blueprint' as const, blueprintId: 'bp_obsidian_shield', icon: '📋' },
  { id: 'shop_bp_mirrored_cloak', name: 'Mirrored Cloak Blueprint', description: 'Learn the blueprint for the Mirrored Cloak of Disguise.', cost: 750, itemType: 'blueprint' as const, blueprintId: 'bp_mirrored_cloak', icon: '📋' },
]

export const GL_CITADEL_EVENTS = [
  { id: 'event_rainbow_surge', name: 'Rainbow Surge', description: 'A prismatic wave of light sweeps through the citadel, boosting all light energy generation for a time.', type: 'buff' as const, icon: '🌈', goldReward: 0, xpReward: 30, lightReward: 100 },
  { id: 'event_sandstorm', name: 'Sandstorm', description: 'A massive sandstorm deposits raw silica sand across the citadel. Free materials!', type: 'resource' as const, icon: '🌪️', goldReward: 0, xpReward: 10, lightReward: 0 },
  { id: 'event_merchant_visit', name: 'Traveling Merchant', description: 'A mysterious merchant arrives with rare materials for sale at discounted prices.', type: 'shop' as const, icon: '🧳', goldReward: 0, xpReward: 0, lightReward: 0 },
  { id: 'event_crystal_formation', name: 'Crystal Formation', description: 'Spontaneous crystal growth occurs in the citadel vaults. Rare quartz crystals appear.', type: 'resource' as const, icon: '💎', goldReward: 0, xpReward: 15, lightReward: 0 },
  { id: 'event_ghost_glazier', name: 'Ghost Glazier', description: 'A spectral master glazier appears and offers to teach you a secret technique.', type: 'knowledge' as const, icon: '👻', goldReward: 0, xpReward: 100, lightReward: 0 },
  { id: 'event_prism_moth_swarm', name: 'Prism Moth Swarm', description: 'A swarm of prism moths descends on the crystal garden, shedding valuable dust.', type: 'resource' as const, icon: '🦋', goldReward: 0, xpReward: 20, lightReward: 50 },
  { id: 'event_furnace_breakdown', name: 'Furnace Breakdown', description: 'The main furnace cracks! Emergency repairs are needed before smelting can continue.', type: 'danger' as const, icon: '🔥', goldReward: -100, xpReward: 0, lightReward: 0 },
  { id: 'event_solar_alignment', name: 'Solar Alignment', description: 'All citadel towers align perfectly with the sun, generating massive light energy.', type: 'buff' as const, icon: '☀️', goldReward: 50, xpReward: 50, lightReward: 200 },
  { id: 'event_void_crack', name: 'Void Crack', description: 'A crack in reality opens near the citadel. Phantom glass fragments fall through.', type: 'resource' as const, icon: '🕳️', goldReward: 0, xpReward: 25, lightReward: 0 },
  { id: 'event_artifact_discovery', name: 'Artifact Discovery', description: 'Construction workers uncover an ancient glass artifact buried beneath the citadel foundations.', type: 'discovery' as const, icon: '🏺', goldReward: 200, xpReward: 75, lightReward: 0 },
]

export const GL_FRIENDSHIP_LEVELS = [
  { level: 1, name: 'Stranger', color: '#9CA3AF', bonusMultiplier: 1.0 },
  { level: 2, name: 'Acquaintance', color: '#22C55E', bonusMultiplier: 1.1 },
  { level: 3, name: 'Companion', color: '#3B82F6', bonusMultiplier: 1.25 },
  { level: 4, name: 'Partner', color: '#A855F7', bonusMultiplier: 1.5 },
  { level: 5, name: 'Master Ally', color: '#F59E0B', bonusMultiplier: 2.0 },
]

// ═══════════════════════════════════════════════════════════════════════════
// Citadel Lore Entries
// ═══════════════════════════════════════════════════════════════════════════

export const GL_LORE_ENTRIES = [
  { id: 'lore_founding', name: 'The First Flame', description: 'Before the Glass Citadel existed, a single flame burned in the desert. Its heat was so pure that the sand beneath it transformed into the first sheet of glass — perfectly clear, impossibly thin. The first Architect saw this and knew: from this flame, a city of light would rise.', icon: '🔥', requiredLevel: 1 },
  { id: 'lore_clock_tower', name: 'The Clock That Measures Light', description: 'The Clock Tower was the first structure built, not to measure time, but to measure the quality of light. Each of its four faces is made of a different glass type, and the shadow it casts changes color depending on the season. The Architect said: "Time is just light that has finished traveling."', icon: '🕐', requiredLevel: 3 },
  { id: 'lore_prism_tower', name: 'The Endless Spectrum', description: 'When the Prism Tower was completed, it cast a rainbow so brilliant that it was visible from every corner of the world. Travelers came from distant lands seeking the source of the colors. Many stayed to learn glasscraft, and the citadel grew from a tower into a city.', icon: '🌈', requiredLevel: 5 },
  { id: 'lore_mirror_tower', name: 'Reflections of Other Worlds', description: 'The Mirror Tower was built not by the Architect, but by a journeyman glazier who discovered that certain mirror angles reflected views of places that did not exist — or perhaps existed in other times, or other dimensions. Some who gaze into its mirrors report seeing themselves as they could have been.', icon: '🪞', requiredLevel: 10 },
  { id: 'lore_crystal_spire', name: 'The Crystal That Speaks', description: 'The Crystal Spire contains a single flaw — a microscopic inclusion that pulses with an inner light. When the citadel is in danger, the flaw glows brighter, and the crystal emits a sound like a bell struck underwater. The Architect called it the Heart of Glass.', icon: '💎', requiredLevel: 15 },
  { id: 'lore_phantom_glass', name: 'Between Here and Gone', description: 'Phantom glass was discovered by accident when a glazier left a piece of opalescent glass too long in the Arcane Kiln. The glass did not melt — instead, it began to phase between visibility and invisibility. The glazier reached out to touch it and their hand passed through. They reported feeling "the space between heartbeats."', icon: '👻', requiredLevel: 20 },
  { id: 'lore_shadow_tower', name: 'The Tower That Drinks Light', description: 'The Shadow Tower was the last tower built, and the most controversial. It absorbs all light that touches it, creating a zone of absolute darkness. Some say shadows move within. Others say the shadows are alive, and they remember everything they have ever darkened.', icon: '🌑', requiredLevel: 28 },
  { id: 'lore_stargazer', name: 'Eyes Made of Phantom Glass', description: 'The Stargazer Tower\'s ceiling is made entirely of phantom glass. When it becomes transparent, it reveals a view of the cosmos that no telescope can match. Astronomers who work there report seeing stars that do not exist in any catalog — stars that may be dreams, or may be futures not yet born.', icon: '🔭', requiredLevel: 35 },
  { id: 'lore_genesis_prism', name: 'The First Prism', description: 'Legend says that when light first entered the void, it had no color — only brightness. The Genesis Prism was there before the universe, waiting. When light touched it, the spectrum was born. Every color that has ever existed or will ever exist was created in that single moment of refraction.', icon: '✨', requiredLevel: 42 },
  { id: 'lore_void_heart', name: 'The Glass That Was Never Made', description: 'The Void Glass Heart was not crafted by any hand. It appeared one morning in the center of the Crystal Spire, pulsing with a slow rhythm. The Architect examined it for forty years and concluded it was the crystallized concept of eternity itself. To hold it is to understand that glass is not fragile — it is patient.', icon: '💜', requiredLevel: 48 },
]

// ═══════════════════════════════════════════════════════════════════════════
// Internal Helpers
// ═══════════════════════════════════════════════════════════════════════════

const GL_MAX_LEVEL = 50
const GL_MAX_FURNACE_TEMP = 3000
const GL_XP_TABLE: number[] = Array.from({ length: GL_MAX_LEVEL }, (_, i) => {
  const level = i + 1
  return Math.floor(50 * level * (1 + level * 0.15))
})

function glGetXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= GL_MAX_LEVEL) return GL_XP_TABLE[GL_XP_TABLE.length - 1]
  return GL_XP_TABLE[level - 1] || 0
}

function glGetRarityColor(rarity: GlRarity): string {
  const map: Record<GlRarity, string> = {
    Common: '#9CA3AF',
    Uncommon: '#22C55E',
    Rare: '#3B82F6',
    Epic: '#A855F7',
    Legendary: '#F59E0B',
  }
  return map[rarity]
}

function glGetRarityIndex(rarity: GlRarity): number {
  const order: GlRarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']
  return order.indexOf(rarity)
}

function glGetRarityXpMultiplier(rarity: GlRarity): number {
 const data = GL_RARITY_DATA.find(r => r.name === rarity)
 if (!data) return 1
 return data.xpMult
}

function glMakeInstance(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function glClampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function glCalculateStructureBonus(category: GlStructureCategory, level: number): number {
  const baseBonuses: Record<GlStructureCategory, number> = {
    furnace: 5,
    workshop: 8,
    gallery: 10,
    storage: 50,
    utility: 15,
    garden: 12,
    observatory: 20,
  }
  return baseBonuses[category] * level
}

function glCalculateStructureCost(structDef: GlStructureDef, targetLevel: number): number {
  return Math.floor(structDef.baseCost * Math.pow(structDef.upgradeMultiplier, targetLevel - 1))
}

function glCalculateArtifactSellValue(rarity: GlRarity, level: number): number {
  const baseValues: Record<GlRarity, number> = {
    Common: 20, Uncommon: 60, Rare: 200, Epic: 600, Legendary: 2000,
  }
  return baseValues[rarity] * level
}

function glCalculateLensGrindCost(lens: GlLensDef): number {
  return Math.floor(30 * lens.magnification)
}

function glGetFurnaceZoneForTemp(temp: number) {
  return GL_FURNACE_ZONES.find(z => temp >= z.minTemp && temp <= z.maxTemp) || GL_FURNACE_ZONES[0]
}

// ═══════════════════════════════════════════════════════════════════════════
// Zustand Store
// ═══════════════════════════════════════════════════════════════════════════

interface GlassCitadelStore extends GlassCitadelState {
  glCraftArtifact: (blueprintId: string) => boolean
  glUpgradeArtifact: (artifactId: string) => boolean
  glBuildTower: (towerId: string) => boolean
  glExpandTower: (towerId: string) => boolean
  glSmeltGlass: (glassTypeId: string) => boolean
  glAdjustFurnace: (temperature: number) => void
  glBuildStructure: (structDefId: string) => boolean
  glUpgradeStructure: (structId: string) => boolean
  glGrindLens: (lensId: string) => boolean
  glCombineLens: (lensA: string, lensB: string) => boolean
  glCreateMosaic: (patternId: string) => boolean
  glInstallMosaic: (mosaicId: string) => boolean
  glCollectMaterial: (materialId: string, count: number) => void
  glTradeMaterial: (materialA: string, materialB: string) => boolean
  glRefractLight: (artifactId: string) => number
  glFocusLight: (towerId: string) => number
  glUnlockTitle: (titleId: string) => boolean
  glClaimAchievement: (achievementId: string) => boolean
  glExhibitArtifact: (artifactId: string) => boolean
  glSellArtifact: (artifactId: string) => number
  glAddXp: (amount: number) => void
  glAddGold: (amount: number) => void
  glSpendGold: (amount: number) => boolean
  glAddLightEnergy: (amount: number) => void
  glSetFurnaceTemperature: (temp: number) => void
  glAddMaterial: (materialId: string, count: number) => void
  glRemoveMaterial: (materialId: string, count: number) => boolean
  glCheckLevelUp: () => void
  glCheckAchievements: () => string[]
  glPurchaseShopItem: (shopItemId: string) => boolean
  glLearnBlueprint: (blueprintId: string) => boolean
  glSetActiveTower: (towerId: string) => boolean
  glResetState: () => void
  glTriggerCitadelEvent: (eventId: string) => { success: boolean; goldDelta: number; xpDelta: number; lightDelta: number }
}

function glCreateDefaultState(): GlassCitadelState {
  return {
    artifacts: [],
    towers: [],
    materials: { silica_sand: 20, soda_ash: 10, limestone: 10 },
    structures: [],
    blueprints: ['bp_glass_vial', 'bp_frost_bead'],
    lenses: [],
    mosaics: [],
    citadelLevel: 1,
    glassExp: 0,
    gold: 100,
    furnaceTemperature: 800,
    lightEnergy: 50,
    achievements: [],
    currentTitle: 'Glass Apprentice',
    totalCrafts: 0,
    totalTowersBuilt: 0,
    totalMasterpieces: 0,
    activeTowerId: null,
  }
}

export const useGlassCitadelStore = create<GlassCitadelStore>()(
  persist(
    (set, get) => ({
      ...glCreateDefaultState(),

      // ── Artifact Actions ────────────────────────────────────────
      glCraftArtifact(blueprintId: string): boolean {
        const bp = GL_BLUEPRINTS.find(b => b.id === blueprintId)
        if (!bp) return false
        const state = get()
        if (!state.blueprints.includes(blueprintId)) return false

        // Check materials
        for (const req of bp.requiredMaterials) {
          if ((state.materials[req.materialId] || 0) < req.count) return false
        }
        // Spend materials
        const newMaterials = { ...state.materials }
        for (const req of bp.requiredMaterials) {
          newMaterials[req.materialId] = (newMaterials[req.materialId] || 0) - req.count
        }

        const rarityXp: Record<GlRarity, number> = {
          Common: 15, Uncommon: 40, Rare: 100, Epic: 250, Legendary: 600,
        }

        const artifact: GlArtifactInstance = {
          instanceId: glMakeInstance('art'),
          defId: bp.artifactId,
          level: 1,
          exhibited: false,
          craftedAt: Date.now(),
        }

        set({
          materials: newMaterials,
          artifacts: [...state.artifacts, artifact],
          totalCrafts: state.totalCrafts + 1,
        })

        get().glAddXp(rarityXp[bp.rarity])
        get().glCheckAchievements()
        return true
      },

      glUpgradeArtifact(artifactId: string): boolean {
        const state = get()
        const idx = state.artifacts.findIndex(a => a.instanceId === artifactId)
        if (idx === -1) return false
        const artifact = state.artifacts[idx]
        if (artifact.level >= 10) return false

        const cost = 50 * artifact.level * artifact.level
        if (state.gold < cost) return false

        const newArtifacts = [...state.artifacts]
        newArtifacts[idx] = { ...artifact, level: artifact.level + 1 }

        set({
          artifacts: newArtifacts,
          gold: state.gold - cost,
        })
        get().glAddXp(20 * artifact.level)
        return true
      },

      // ── Tower Actions ───────────────────────────────────────────
      glBuildTower(towerId: string): boolean {
        const towerDef = GL_TOWERS.find(t => t.id === towerId)
        if (!towerDef) return false
        const state = get()
        if (state.towers.find(t => t.defId === towerId)) return false
        if (state.citadelLevel < towerDef.unlockLevel) return false

        const cost = 200 * towerDef.unlockLevel
        if (state.gold < cost) return false

        const tower: GlTowerInstance = {
          defId: towerId,
          level: 1,
          lightEnergy: 0,
          builtAt: Date.now(),
        }

        set({
          towers: [...state.towers, tower],
          gold: state.gold - cost,
          totalTowersBuilt: state.totalTowersBuilt + 1,
          activeTowerId: state.activeTowerId ?? towerId,
        })

        get().glAddXp(towerDef.unlockLevel * 20)
        get().glCheckAchievements()
        return true
      },

      glExpandTower(towerId: string): boolean {
        const state = get()
        const idx = state.towers.findIndex(t => t.defId === towerId)
        if (idx === -1) return false
        const tower = state.towers[idx]
        if (tower.level >= 10) return false

        const towerDef = GL_TOWERS.find(t => t.id === towerId)
        if (!towerDef) return false

        const cost = 100 * towerDef.unlockLevel * tower.level
        if (state.gold < cost) return false

        const newTowers = [...state.towers]
        newTowers[idx] = { ...tower, level: tower.level + 1 }

        set({
          towers: newTowers,
          gold: state.gold - cost,
        })
        get().glAddXp(30 * tower.level)
        return true
      },

      // ── Furnace Actions ─────────────────────────────────────────
      glSmeltGlass(glassTypeId: string): boolean {
        const glassType = GL_GLASS_TYPES.find(g => g.id === glassTypeId)
        if (!glassType) return false
        const state = get()
        if (state.furnaceTemperature < 1200) return false
        if ((state.materials['silica_sand'] || 0) < 2) return false
        if ((state.materials['soda_ash'] || 0) < 1) return false

        const efficiencyBonus = state.furnaceTemperature >= 2500 ? 2 : 1
        const rarityRoll = Math.random()
        let xpGain = 10

        if (rarityRoll < 0.05 && state.furnaceTemperature >= 2500) {
          xpGain = 50
        } else if (rarityRoll < 0.15 && state.furnaceTemperature >= 2000) {
          xpGain = 30
        }

        const newMaterials = {
          ...state.materials,
          silica_sand: state.materials.silica_sand - 2,
          soda_ash: state.materials.soda_ash - 1,
        }

        set({ materials: newMaterials })
        get().glAddXp(xpGain * efficiencyBonus)
        get().glCheckAchievements()
        return true
      },

      glAdjustFurnace(temperature: number): void {
        const clamped = glClampNumber(temperature, 0, GL_MAX_FURNACE_TEMP)
        set({ furnaceTemperature: clamped })
      },

      // ── Structure Actions ───────────────────────────────────────
      glBuildStructure(structDefId: string): boolean {
        const structDef = GL_STRUCTURES.find(s => s.id === structDefId)
        if (!structDef) return false
        const state = get()
        if (state.structures.find(s => s.defId === structDefId)) return false
        if (state.gold < structDef.baseCost) return false

        const structure: GlStructureInstance = {
          defId: structDefId,
          level: 1,
          builtAt: Date.now(),
        }

        set({
          structures: [...state.structures, structure],
          gold: state.gold - structDef.baseCost,
        })
        get().glAddXp(20)
        return true
      },

      glUpgradeStructure(structId: string): boolean {
        const state = get()
        const idx = state.structures.findIndex(s => s.defId === structId)
        if (idx === -1) return false
        const structure = state.structures[idx]
        const structDef = GL_STRUCTURES.find(s => s.id === structId)
        if (!structDef) return false
        if (structure.level >= structDef.maxLevel) return false

        const cost = Math.floor(structDef.baseCost * Math.pow(structDef.upgradeMultiplier, structure.level))
        if (state.gold < cost) return false

        const newStructures = [...state.structures]
        newStructures[idx] = { ...structure, level: structure.level + 1 }

        set({
          structures: newStructures,
          gold: state.gold - cost,
        })
        get().glAddXp(15 * structure.level)
        return true
      },

      // ── Lens Actions ────────────────────────────────────────────
      glGrindLens(lensId: string): boolean {
        const lensDef = GL_LENSES.find(l => l.id === lensId)
        if (!lensDef) return false
        const state = get()
        if (state.lenses.includes(lensId)) return false
        if (state.gold < 30 * lensDef.magnification) return false

        set({
          lenses: [...state.lenses, lensId],
          gold: state.gold - Math.floor(30 * lensDef.magnification),
        })
        get().glAddXp(Math.floor(lensDef.magnification * 5))
        get().glCheckAchievements()
        return true
      },

      glCombineLens(lensA: string, lensB: string): boolean {
        const state = get()
        if (!state.lenses.includes(lensA)) return false
        if (!state.lenses.includes(lensB)) return false
        if (lensA === lensB) return false

        const defA = GL_LENSES.find(l => l.id === lensA)
        const defB = GL_LENSES.find(l => l.id === lensB)
        if (!defA || !defB) return false
        if (getGlRarityIndexForLens(defA) !== getGlRarityIndexForLens(defB)) return false

        if (state.gold < 200) return false

        // Find a lens of higher rarity
        const nextRarityLenses = GL_LENSES.filter(l => {
          return getGlRarityIndexForLens(l) > getGlRarityIndexForLens(defA)
        })

        if (nextRarityLenses.length > 0) {
          const chosen = nextRarityLenses[Math.floor(Math.random() * nextRarityLenses.length)]
          set({
            lenses: [...state.lenses.filter(id => id !== lensA && id !== lensB), chosen.id],
            gold: state.gold - 200,
          })
        } else {
          set({
            lenses: state.lenses.filter(id => id !== lensA && id !== lensB),
            gold: state.gold - 200,
          })
        }

        get().glAddXp(50)
        get().glCheckAchievements()
        return true
      },

      // ── Mosaic Actions ──────────────────────────────────────────
      glCreateMosaic(patternId: string): boolean {
        const mosaicDef = GL_MOSAICS.find(m => m.id === patternId)
        if (!mosaicDef) return false
        const state = get()

        // Check glass inventory (simplified: use material counts as proxy)
        const totalGlassNeeded = mosaicDef.glassRequirements.reduce((sum, r) => sum + r.count, 0)
        const totalGlassAvailable = Object.values(state.materials).reduce((sum, v) => sum + v, 0)
        if (totalGlassAvailable < totalGlassNeeded) return false
        if (state.gold < mosaicDef.beautyScore * 10) return false

        const mosaic: GlMosaicInstance = {
          instanceId: glMakeInstance('mos'),
          defId: patternId,
          installed: false,
          createdAt: Date.now(),
        }

        // Deduct some materials
        const newMaterials = { ...state.materials }
        for (const req of mosaicDef.glassRequirements) {
          newMaterials[req.glassTypeId] = Math.max(0, (newMaterials[req.glassTypeId] || 0) - req.count)
        }

        set({
          mosaics: [...state.mosaics, mosaic],
          materials: newMaterials,
          gold: state.gold - mosaicDef.beautyScore * 10,
          totalMasterpieces: state.totalMasterpieces + 1,
        })
        get().glAddXp(mosaicDef.beautyScore * 3)
        get().glCheckAchievements()
        return true
      },

      glInstallMosaic(mosaicId: string): boolean {
        const state = get()
        const idx = state.mosaics.findIndex(m => m.instanceId === mosaicId)
        if (idx === -1) return false
        if (state.mosaics[idx].installed) return false

        const newMosaics = [...state.mosaics]
        newMosaics[idx] = { ...state.mosaics[idx], installed: true }

        set({ mosaics: newMosaics })
        get().glAddXp(30)
        get().glCheckAchievements()
        return true
      },

      // ── Material Actions ────────────────────────────────────────
      glCollectMaterial(materialId: string, count: number): void {
        if (count <= 0) return
        const matDef = GL_MATERIALS.find(m => m.id === materialId)
        if (!matDef) return
        get().glAddMaterial(materialId, count)
        get().glAddXp(2 * count)
      },

      glTradeMaterial(materialA: string, materialB: string): boolean {
        const state = get()
        if ((state.materials[materialA] || 0) < 3) return false
        const matA = GL_MATERIALS.find(m => m.id === materialA)
        const matB = GL_MATERIALS.find(m => m.id === materialB)
        if (!matA || !matB) return false

        const diff = glGetRarityIndex(matB.rarity) - glGetRarityIndex(matA.rarity)
        if (diff > 1) return false

        const newMaterials = {
          ...state.materials,
          [materialA]: state.materials[materialA] - 3,
          [materialB]: (state.materials[materialB] || 0) + 1,
        }

        set({ materials: newMaterials })
        return true
      },

      // ── Light Actions ───────────────────────────────────────────
      glRefractLight(artifactId: string): number {
        const state = get()
        const artifact = state.artifacts.find(a => a.instanceId === artifactId)
        if (!artifact) return 0

        const artifactDef = GL_ARTIFACTS.find(a => a.id === artifact.defId)
        if (!artifactDef) return 0

        const lightGain = Math.floor(artifactDef.power * artifact.level * 0.5)
        if (lightGain > 0) {
          get().glAddLightEnergy(lightGain)
          get().glAddXp(5)
        }
        return lightGain
      },

      glFocusLight(towerId: string): number {
        const state = get()
        const tower = state.towers.find(t => t.defId === towerId)
        if (!tower) return 0

        const towerDef = GL_TOWERS.find(t => t.id === towerId)
        if (!towerDef) return 0

        const focusedLight = Math.floor(state.lightEnergy * 0.1 * tower.level)
        if (focusedLight > 0) {
          const goldGain = Math.floor(focusedLight * 0.3)
          const newXp = focusedLight
          const newTowers = state.towers.map(t =>
            t.defId === towerId ? { ...t, lightEnergy: t.lightEnergy + focusedLight } : t
          )

          set({
            lightEnergy: Math.max(0, state.lightEnergy - focusedLight),
            gold: state.gold + goldGain,
            towers: newTowers,
          })
          get().glAddXp(newXp)
          get().glCheckAchievements()
        }
        return focusedLight
      },

      // ── Title & Achievement Actions ─────────────────────────────
      glUnlockTitle(titleId: string): boolean {
        const titleDef = LN_TITLES.find(t => t.id === titleId)
        if (!titleDef) return false
        const state = get()
        if (state.citadelLevel < titleDef.levelReq) return false
        if (state.currentTitle === titleDef.name) return false

        set({ currentTitle: titleDef.name })
        return true
      },

      glClaimAchievement(achievementId: string): boolean {
        const achDef = GL_ACHIEVEMENTS.find(a => a.id === achievementId)
        if (!achDef) return false
        const state = get()
        if (state.achievements.includes(achievementId)) return false

        set({
          achievements: [...state.achievements, achievementId],
          gold: state.gold + achDef.reward.gold,
        })
        get().glAddXp(achDef.reward.xp)
        get().glCheckAchievements()
        return true
      },

      // ── Exhibit & Sell ──────────────────────────────────────────
      glExhibitArtifact(artifactId: string): boolean {
        const state = get()
        const idx = state.artifacts.findIndex(a => a.instanceId === artifactId)
        if (idx === -1) return false
        if (state.artifacts[idx].exhibited) return false

        const newArtifacts = [...state.artifacts]
        newArtifacts[idx] = { ...state.artifacts[idx], exhibited: true }

        set({ artifacts: newArtifacts })
        get().glCheckAchievements()
        return true
      },

      glSellArtifact(artifactId: string): number {
        const state = get()
        const artifact = state.artifacts.find(a => a.instanceId === artifactId)
        if (!artifact) return 0

        const artifactDef = GL_ARTIFACTS.find(a => a.id === artifact.defId)
        if (!artifactDef) return 0

        const rarityValues: Record<GlRarity, number> = {
          Common: 20, Uncommon: 60, Rare: 200, Epic: 600, Legendary: 2000,
        }
        const value = rarityValues[artifactDef.rarity] * artifact.level

        set({
          artifacts: state.artifacts.filter(a => a.instanceId !== artifactId),
          gold: state.gold + value,
        })
        return value
      },

      // ── Internal Utility Actions ────────────────────────────────
      glAddXp(amount: number): void {
        const state = get()
        let newXp = state.glassExp + amount
        let newLevel = state.citadelLevel

        while (newLevel < GL_MAX_LEVEL && newXp >= glGetXpForLevel(newLevel + 1)) {
          newLevel += 1
        }

        set({
          glassExp: newLevel >= GL_MAX_LEVEL ? 0 : newXp,
          citadelLevel: newLevel,
        })
      },

      glAddGold(amount: number): void {
        set(s => ({ gold: Math.min(9999999, s.gold + amount) }))
      },

      glSpendGold(amount: number): boolean {
        const state = get()
        if (state.gold < amount) return false
        set({ gold: state.gold - amount })
        return true
      },

      glAddLightEnergy(amount: number): void {
        set(s => ({ lightEnergy: s.lightEnergy + amount }))
      },

      glSetFurnaceTemperature(temp: number): void {
        set({ furnaceTemperature: glClampNumber(temp, 0, GL_MAX_FURNACE_TEMP) })
      },

      glAddMaterial(materialId: string, count: number): void {
        set(s => ({
          materials: { ...s.materials, [materialId]: (s.materials[materialId] || 0) + count },
        }))
      },

      glRemoveMaterial(materialId: string, count: number): boolean {
        const state = get()
        if ((state.materials[materialId] || 0) < count) return false
        set(s => ({
          materials: { ...s.materials, [materialId]: s.materials[materialId] - count },
        }))
        return true
      },

      glCheckLevelUp(): void {
        const state = get()
        let newXp = state.glassExp
        let newLevel = state.citadelLevel

        while (newLevel < GL_MAX_LEVEL && newXp >= glGetXpForLevel(newLevel + 1)) {
          newLevel += 1
        }

        set({
          glassExp: newLevel >= GL_MAX_LEVEL ? 0 : newXp,
          citadelLevel: newLevel,
        })
      },

      glCheckAchievements(): string[] {
        const state = get()
        const newlyUnlocked: string[] = []

        const check = (id: string, condition: boolean) => {
          if (condition && !state.achievements.includes(id)) {
            newlyUnlocked.push(id)
          }
        }

        check('first_smelt', state.totalCrafts >= 1)
        check('ten_smelts', state.totalCrafts >= 10)
        check('fifty_smelts', state.totalCrafts >= 50)
        check('first_artifact', state.totalCrafts >= 1)
        check('ten_artifacts', state.totalCrafts >= 10)
        check('epic_artifact', state.artifacts.some(a => {
          const def = GL_ARTIFACTS.find(ad => ad.id === a.defId)
          return def && (def.rarity === 'Epic' || def.rarity === 'Legendary')
        }))
        check('first_tower', state.totalTowersBuilt >= 1)
        check('all_towers', state.towers.length >= 8)
        check('first_mosaic', state.mosaics.length >= 1)
        check('five_mosaics', state.mosaics.filter(m => m.installed).length >= 5)
        check('first_lens', state.lenses.length >= 1)
        check('ten_lenses', state.lenses.length >= 10)
        check('max_furnace', state.furnaceTemperature >= GL_MAX_FURNACE_TEMP)
        check('exhibit_five', state.artifacts.filter(a => a.exhibited).length >= 5)
        check('light_focus', state.lightEnergy >= 1000)
        check('legendary_blueprint', state.blueprints.some(bid => {
          const bp = GL_BLUEPRINTS.find(b => b.id === bid)
          return bp && bp.rarity === 'Legendary'
        }))
        check('level_fifty', state.citadelLevel >= 50)

        if (newlyUnlocked.length > 0) {
          let totalGold = 0
          let totalXp = 0
          for (const achId of newlyUnlocked) {
            const achDef = GL_ACHIEVEMENTS.find(a => a.id === achId)
            if (achDef) {
              totalGold += achDef.reward.gold
              totalXp += achDef.reward.xp
            }
          }
          set({
            achievements: [...state.achievements, ...newlyUnlocked],
            gold: state.gold + totalGold,
          })
          get().glAddXp(totalXp)
        }

        return newlyUnlocked
      },

      // ── Shop Actions ────────────────────────────────────────────
      glPurchaseShopItem(shopItemId: string): boolean {
        const item = GL_SHOP_ITEMS.find(s => s.id === shopItemId)
        if (!item) return false
        const state = get()
        if (state.gold < item.cost) return false

        if (item.itemType === 'material' && item.materialId) {
          get().glAddMaterial(item.materialId, item.count || 1)
          set({ gold: state.gold - item.cost })
          get().glAddXp(5)
          return true
        }

        if (item.itemType === 'blueprint' && item.blueprintId) {
          if (state.blueprints.includes(item.blueprintId)) return false
          set({
            blueprints: [...state.blueprints, item.blueprintId],
            gold: state.gold - item.cost,
          })
          get().glAddXp(30)
          get().glCheckAchievements()
          return true
        }

        return false
      },

      // ── Blueprint Learning ──────────────────────────────────────
      glLearnBlueprint(blueprintId: string): boolean {
        const bp = GL_BLUEPRINTS.find(b => b.id === blueprintId)
        if (!bp) return false
        const state = get()
        if (state.blueprints.includes(blueprintId)) return false

        const rarityCosts: Record<GlRarity, number> = {
          Common: 100, Uncommon: 300, Rare: 800, Epic: 2000, Legendary: 5000,
        }
        const cost = rarityCosts[bp.rarity]
        if (state.gold < cost) return false

        set({
          blueprints: [...state.blueprints, blueprintId],
          gold: state.gold - cost,
        })
        get().glAddXp(Math.floor(cost * 0.5))
        get().glCheckAchievements()
        return true
      },

      // ── Tower Management ────────────────────────────────────────
      glSetActiveTower(towerId: string): boolean {
        const state = get()
        if (!state.towers.find(t => t.defId === towerId)) return false
        set({ activeTowerId: towerId })
        return true
      },

      // ── State Management ────────────────────────────────────────
      glResetState(): void {
        const defaults = glCreateDefaultState()
        set({
          artifacts: defaults.artifacts,
          towers: defaults.towers,
          materials: defaults.materials,
          structures: defaults.structures,
          blueprints: defaults.blueprints,
          lenses: defaults.lenses,
          mosaics: defaults.mosaics,
          citadelLevel: defaults.citadelLevel,
          glassExp: defaults.glassExp,
          gold: defaults.gold,
          furnaceTemperature: defaults.furnaceTemperature,
          lightEnergy: defaults.lightEnergy,
          achievements: defaults.achievements,
          currentTitle: defaults.currentTitle,
          totalCrafts: defaults.totalCrafts,
          totalTowersBuilt: defaults.totalTowersBuilt,
          totalMasterpieces: defaults.totalMasterpieces,
          activeTowerId: defaults.activeTowerId,
        })
      },

      // ── Citadel Events ──────────────────────────────────────────
      glTriggerCitadelEvent(eventId: string): { success: boolean; goldDelta: number; xpDelta: number; lightDelta: number } {
        const event = GL_CITADEL_EVENTS.find(e => e.id === eventId)
        if (!event) return { success: false, goldDelta: 0, xpDelta: 0, lightDelta: 0 }

        const state = get()
        let goldDelta = event.goldReward
        let xpDelta = event.xpReward
        let lightDelta = event.lightReward

        if (event.type === 'resource') {
          if (eventId === 'event_sandstorm') {
            get().glAddMaterial('silica_sand', 30)
            get().glAddMaterial('soda_ash', 10)
          } else if (eventId === 'event_crystal_formation') {
            get().glAddMaterial('quartz_crystal', 5)
          } else if (eventId === 'event_prism_moth_swarm') {
            get().glAddMaterial('prism_moth_dust', 1)
          } else if (eventId === 'event_void_crack') {
            get().glAddMaterial('void_essence', 1)
          }
        }

        if (event.type === 'discovery') {
          xpDelta += 100
        }

        if (event.type === 'danger') {
          if (state.gold < Math.abs(goldDelta)) return { success: false, goldDelta: 0, xpDelta: 0, lightDelta: 0 }
          set({ gold: state.gold + goldDelta })
          return { success: true, goldDelta, xpDelta: 0, lightDelta: 0 }
        }

        if (goldDelta !== 0) set(s => ({ gold: Math.max(0, s.gold + goldDelta) }))
        if (lightDelta > 0) set(s => ({ lightEnergy: s.lightEnergy + lightDelta }))
        if (xpDelta > 0) get().glAddXp(xpDelta)

        get().glCheckAchievements()
        return { success: true, goldDelta, xpDelta, lightDelta }
      },
    }),
    {
      name: 'glass-citadel-save',
      version: 1,
    }
  )
)

// ── Helper for lens rarity ────────────────────────────────────────────────

function getGlRarityIndexForLens(lens: GlLensDef): number {
  const baseRarity = Math.min(4, Math.max(0, Math.floor((lens.magnification - 1) / 10)))
  return baseRarity
}

// ═══════════════════════════════════════════════════════════════════════════
// THE HOOK — useGlassCitadel
// ═══════════════════════════════════════════════════════════════════════════

export default function useGlassCitadel() {
  const store = useGlassCitadelStore()
  const stateRef = useRef(store)
  useEffect(() => {
    stateRef.current = store
  })

  // ── Simple State Getters ──────────────────────────────────────

  const glGetCitadelLevel = useCallback(() => store.citadelLevel, [store.citadelLevel])
  const glGetGlassExp = useCallback(() => store.glassExp, [store.glassExp])
  const glGetGold = useCallback(() => store.gold, [store.gold])
  const glGetFurnaceTemperature = useCallback(() => store.furnaceTemperature, [store.furnaceTemperature])
  const glGetLightEnergy = useCallback(() => store.lightEnergy, [store.lightEnergy])
  const glGetCurrentTitle = useCallback(() => store.currentTitle, [store.currentTitle])
  const glGetActiveTowerId = useCallback(() => store.activeTowerId, [store.activeTowerId])
  const glGetTotalCrafts = useCallback(() => store.totalCrafts, [store.totalCrafts])
  const glGetTotalTowersBuilt = useCallback(() => store.totalTowersBuilt, [store.totalTowersBuilt])
  const glGetTotalMasterpieces = useCallback(() => store.totalMasterpieces, [store.totalMasterpieces])

  // ── useMemo Getters ───────────────────────────────────────────

  const glGetOwnedArtifacts = useMemo(() => {
    return store.artifacts.map(art => {
      const def = GL_ARTIFACTS.find(a => a.id === art.defId)
      return { ...art, def }
    })
  }, [store.artifacts])

  const glGetTowerHeight = useMemo(() => {
    let totalHeight = 0
    for (const tower of store.towers) {
      const def = GL_TOWERS.find(t => t.id === tower.defId)
      if (def) {
        totalHeight += Math.floor(def.height * (1 + (tower.level - 1) * 0.15))
      }
    }
    return totalHeight
  }, [store.towers])

  const glGetFurnaceEfficiency = useMemo(() => {
    const temp = store.furnaceTemperature
    if (temp < 800) return 0
    if (temp < 1200) return 0.3
    if (temp < 1800) return 0.6
    if (temp < 2500) return 0.85
    return 1.0
  }, [store.furnaceTemperature])

  const glGetAvailableBlueprints = useMemo(() => {
    return GL_BLUEPRINTS.filter(bp => store.blueprints.includes(bp.id))
  }, [store.blueprints])

  const glGetCraftableArtifacts = useMemo(() => {
    return GL_BLUEPRINTS.filter(bp => {
      if (!store.blueprints.includes(bp.id)) return false
      for (const req of bp.requiredMaterials) {
        if ((store.materials[req.materialId] || 0) < req.count) return false
      }
      return true
    })
  }, [store.blueprints, store.materials])

  const glGetTotalBeauty = useMemo(() => {
    let totalBeauty = 0
    for (const mosaic of store.mosaics) {
      if (mosaic.installed) {
        const def = GL_MOSAICS.find(m => m.id === mosaic.defId)
        if (def) totalBeauty += def.beautyScore
      }
    }
    return totalBeauty
  }, [store.mosaics])

  const glGetLightOutput = useMemo(() => {
    let baseOutput = 10
    for (const struct of store.structures) {
      const def = GL_STRUCTURES.find(s => s.id === struct.defId)
      if (def) {
        if (def.category === 'utility') baseOutput += struct.level * 5
        if (def.category === 'gallery') baseOutput += struct.level * 3
      }
    }
    return Math.floor(baseOutput * (1 + store.citadelLevel * 0.02))
  }, [store.structures, store.citadelLevel])

  const glGetCitadelPower = useMemo(() => {
    let power = store.citadelLevel * 10
    for (const art of store.artifacts) {
      const def = GL_ARTIFACTS.find(a => a.id === art.defId)
      if (def) power += def.power * art.level
    }
    for (const tower of store.towers) {
      power += tower.level * 25
    }
    return power
  }, [store.artifacts, store.towers, store.citadelLevel])

  const glGetNextTitle = useMemo(() => {
    const currentDef = LN_TITLES.find(t => t.name === store.currentTitle)
    const currentIdx = currentDef ? LN_TITLES.indexOf(currentDef) : -1
    if (currentIdx < LN_TITLES.length - 1) {
      return LN_TITLES[currentIdx + 1]
    }
    return null
  }, [store.currentTitle])

  const glGetRaritySummary = useMemo(() => {
    const summary: Record<GlRarity, number> = {
      Common: 0, Uncommon: 0, Rare: 0, Epic: 0, Legendary: 0,
    }
    for (const art of store.artifacts) {
      const def = GL_ARTIFACTS.find(a => a.id === art.defId)
      if (def) summary[def.rarity] += 1
    }
    return summary
  }, [store.artifacts])

  const glGetUnlockedAchievements = useMemo(() => {
    return store.achievements.map(id => GL_ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean) as GlAchievementDef[]
  }, [store.achievements])

  const glGetTitleProgress = useMemo(() => {
    const titles = LN_TITLES.filter(t => store.citadelLevel >= t.levelReq)
    return titles
  }, [store.citadelLevel])

  const glGetMosaicCollection = useMemo(() => {
    return store.mosaics.map(m => {
      const def = GL_MOSAICS.find(md => md.id === m.defId)
      return { ...m, def }
    })
  }, [store.mosaics])

  const glGetLensCollection = useMemo(() => {
    return store.lenses.map(id => GL_LENSES.find(l => l.id === id)).filter(Boolean) as GlLensDef[]
  }, [store.lenses])

  const glGetMaterialCounts = useMemo(() => {
    return { ...store.materials }
  }, [store.materials])

  const glGetGlassInventory = useMemo(() => {
    return GL_GLASS_TYPES.map(gt => ({
      ...gt,
      count: store.materials[gt.id] || 0,
    }))
  }, [store.materials])

  // ── Log tracking ──────────────────────────────────────────────
  const [glLog, setGlLog] = useState<string[]>([])

  const glLogAction = useCallback((message: string) => {
    setGlLog(prev => [message, ...prev].slice(0, 100))
  }, [])

  // ── XP Progress ───────────────────────────────────────────────
  const glGetXpProgress = useMemo(() => {
    if (store.citadelLevel >= GL_MAX_LEVEL) return 1
    const currentLevelXp = glGetXpForLevel(store.citadelLevel)
    const nextLevelXp = glGetXpForLevel(store.citadelLevel + 1)
    const progress = (store.glassExp - currentLevelXp) / (nextLevelXp - currentLevelXp)
    return glClampNumber(progress, 0, 1)
  }, [store.citadelLevel, store.glassExp])

  // ── Additional Computed Getters ─────────────────────────────

  const glGetAvailableTowers = useMemo(() => {
    return GL_TOWERS.filter(t => {
      if (store.citadelLevel < t.unlockLevel) return false
      if (store.towers.find(st => st.defId === t.id)) return false
      return true
    })
  }, [store.towers, store.citadelLevel])

  const glGetAvailableStructures = useMemo(() => {
    return GL_STRUCTURES.filter(s => {
      return !store.structures.find(st => st.defId === s.id)
    })
  }, [store.structures])

  const glGetStructureBonus = useMemo(() => {
    const bonuses: Record<GlStructureCategory, number> = {
      furnace: 0, workshop: 0, gallery: 0, storage: 0, utility: 0, garden: 0, observatory: 0,
    }
    for (const struct of store.structures) {
 const def = GL_STRUCTURES.find(s => s.id === struct.defId)
      if (def) bonuses[def.category] += glCalculateStructureBonus(def.category, struct.level)
    }
    return bonuses
  }, [store.structures])

  const glGetTowerPower = useMemo(() => {
    const powers: Record<string, number> = {}
    for (const tower of store.towers) {
      const def = GL_TOWERS.find(t => t.id === tower.defId)
      if (def) {
        powers[tower.defId] = Math.floor(def.height * tower.level * 0.5 + tower.lightEnergy * 0.1)
      }
    }
    return powers
  }, [store.towers])

  const glGetFurnaceZone = useMemo(() => {
    return glGetFurnaceZoneForTemp(store.furnaceTemperature)
  }, [store.furnaceTemperature])

  const glGetExhibitedCount = useMemo(() => {
    return store.artifacts.filter(a => a.exhibited).length
  }, [store.artifacts])

  const glGetInstalledMosaicCount = useMemo(() => {
    return store.mosaics.filter(m => m.installed).length
  }, [store.mosaics])

  const glGetArtifactCountByRarity = useMemo(() => {
    const counts: Record<GlRarity, number> = {
      Common: 0, Uncommon: 0, Rare: 0, Epic: 0, Legendary: 0,
    }
    for (const art of store.artifacts) {
      const def = GL_ARTIFACTS.find(a => a.id === art.defId)
      if (def) counts[def.rarity] += 1
    }
    return counts
  }, [store.artifacts])

  const glGetMaterialValue = useMemo(() => {
    let total = 0
    for (const [id, count] of Object.entries(store.materials)) {
      if (count <= 0) continue
      const matDef = GL_MATERIALS.find(m => m.id === id)
      if (!matDef) continue
      const rarityValues: Record<GlRarity, number> = {
        Common: 1, Uncommon: 5, Rare: 20, Epic: 80, Legendary: 300,
      }
      total += rarityValues[matDef.rarity] * count
    }
    return total
  }, [store.materials])

  const glGetTotalCitadelWorth = useMemo(() => {
    let worth = store.gold
    worth += glGetMaterialValue
    for (const art of store.artifacts) {
      const def = GL_ARTIFACTS.find(a => a.id === art.defId)
      if (def) worth += glCalculateArtifactSellValue(def.rarity, art.level)
    }
    for (const tower of store.towers) {
      const def = GL_TOWERS.find(t => t.id === tower.defId)
      if (def) worth += 200 * def.unlockLevel * tower.level
    }
    return worth
  }, [store.gold, store.artifacts, store.towers, glGetMaterialValue])

  const glGetShopItems = useMemo(() => {
    return GL_SHOP_ITEMS
  }, [])

  const glGetCitadelEvents = useMemo(() => {
    return GL_CITADEL_EVENTS
  }, [])

  const glGetMissingAchievements = useMemo(() => {
    return GL_ACHIEVEMENTS.filter(a => !store.achievements.includes(a.id))
  }, [store.achievements])

  const glGetMissingBlueprints = useMemo(() => {
    return GL_BLUEPRINTS.filter(bp => !store.blueprints.includes(bp.id))
  }, [store.blueprints])

  const glGetAvailableLore = useMemo(() => {
    return GL_LORE_ENTRIES.filter(l => store.citadelLevel >= l.requiredLevel)
  }, [store.citadelLevel])

  const glGetLockedLore = useMemo(() => {
    return GL_LORE_ENTRIES.filter(l => store.citadelLevel < l.requiredLevel)
  }, [store.citadelLevel])

  const glGetHighestArtifact = useMemo(() => {
    let highest: GlArtifactInstance | null = null
    let highestPower = 0
    for (const art of store.artifacts) {
      const def = GL_ARTIFACTS.find(a => a.id === art.defId)
      if (!def) continue
      const power = def.power * art.level
      if (power > highestPower) {
        highestPower = power
        highest = art
      }
    }
    return highest
  }, [store.artifacts])

  const glGetBlueprintCountByRarity = useMemo(() => {
    const counts: Record<GlRarity, number> = {
      Common: 0, Uncommon: 0, Rare: 0, Epic: 0, Legendary: 0,
    }
    for (const bpId of store.blueprints) {
      const bp = GL_BLUEPRINTS.find(b => b.id === bpId)
      if (bp) counts[bp.rarity] += 1
    }
    return counts
  }, [store.blueprints])

  const glGetGlassTypeDefById = useCallback((id: string): GlGlassTypeDef | undefined => {
    return GL_GLASS_TYPES.find(g => g.id === id)
  }, [])

  const glGetArtifactDefById = useCallback((id: string): GlArtifactDef | undefined => {
    return GL_ARTIFACTS.find(a => a.id === id)
  }, [])

  const glGetTowerDefById = useCallback((id: string): GlTowerDef | undefined => {
    return GL_TOWERS.find(t => t.id === id)
  }, [])

  const glGetMaterialDefById = useCallback((id: string): GlMaterialDef | undefined => {
    return GL_MATERIALS.find(m => m.id === id)
  }, [])

  const glGetStructureDefById = useCallback((id: string): GlStructureDef | undefined => {
    return GL_STRUCTURES.find(s => s.id === id)
  }, [])

  const glGetMosaicDefById = useCallback((id: string): GlMosaicDef | undefined => {
    return GL_MOSAICS.find(m => m.id === id)
  }, [])

  const glGetLensDefById = useCallback((id: string): GlLensDef | undefined => {
    return GL_LENSES.find(l => l.id === id)
  }, [])

  const glGetTitleDefByName = useCallback((name: string): GlTitleDef | undefined => {
    return LN_TITLES.find(t => t.name === name)
  }, [])

  // ══════════════════════════════════════════════════════════════
  // Return the glAPI object
  // ══════════════════════════════════════════════════════════════

  return {
    // ── Constants ──────────────────────────────────────────────
    GL_COLOR_CLEAR,
    GL_COLOR_STAINED,
    GL_COLOR_EMERALD,
    GL_COLOR_AMBER,
    GL_COLOR_FROSTED,
    GL_COLOR_CRYSTAL,
    GL_COLOR_PRISMATIC,
    GL_COLOR_PHANTOM,
    GL_GLASS_TYPES,
    GL_ARTIFACTS,
    GL_TOWERS,
    GL_MATERIALS,
    GL_STRUCTURES,
    GL_ABILITIES,
    GL_ACHIEVEMENTS,
    LN_TITLES,
    GL_BLUEPRINTS,
    GL_LENSES,
    GL_MOSAICS,
    GL_MAX_LEVEL,
    GL_MAX_FURNACE_TEMP,
    GL_RARITY_DATA,
    GL_ELEMENTS,
    GL_ELEMENT_COLORS,
    GL_FURNACE_ZONES,
    GL_SHOP_ITEMS,
    GL_CITADEL_EVENTS,
    GL_FRIENDSHIP_LEVELS,
    GL_LORE_ENTRIES,

    // ── State ─────────────────────────────────────────────────
    state: store,

    // ── Simple Getters ────────────────────────────────────────
    glGetCitadelLevel,
    glGetGlassExp,
    glGetGold,
    glGetFurnaceTemperature,
    glGetLightEnergy,
    glGetCurrentTitle,
    glGetActiveTowerId,
    glGetTotalCrafts,
    glGetTotalTowersBuilt,
    glGetTotalMasterpieces,
    glGetXpProgress,
    glGetRarityColor,

    // ── Computed Getters (useMemo) ───────────────────────────
    glGetOwnedArtifacts,
    glGetTowerHeight,
    glGetFurnaceEfficiency,
    glGetAvailableBlueprints,
    glGetCraftableArtifacts,
    glGetTotalBeauty,
    glGetLightOutput,
    glGetCitadelPower,
    glGetNextTitle,
    glGetRaritySummary,
    glGetUnlockedAchievements,
    glGetTitleProgress,
    glGetMosaicCollection,
    glGetLensCollection,
    glGetMaterialCounts,
    glGetGlassInventory,
    glGetAvailableTowers,
    glGetAvailableStructures,
    glGetStructureBonus,
    glGetTowerPower,
    glGetFurnaceZone,
    glGetExhibitedCount,
    glGetInstalledMosaicCount,
    glGetArtifactCountByRarity,
    glGetMaterialValue,
    glGetTotalCitadelWorth,
    glGetShopItems,
    glGetCitadelEvents,
    glGetMissingAchievements,
    glGetMissingBlueprints,
    glGetAvailableLore,
    glGetLockedLore,
    glGetHighestArtifact,
    glGetBlueprintCountByRarity,
    glGetGlassTypeDefById,
    glGetArtifactDefById,
    glGetTowerDefById,
    glGetMaterialDefById,
    glGetStructureDefById,
    glGetMosaicDefById,
    glGetLensDefById,
    glGetTitleDefByName,

    // ── Actions (from store) ──────────────────────────────────
    glCraftArtifact: store.glCraftArtifact,
    glUpgradeArtifact: store.glUpgradeArtifact,
    glBuildTower: store.glBuildTower,
    glExpandTower: store.glExpandTower,
    glSmeltGlass: store.glSmeltGlass,
    glAdjustFurnace: store.glAdjustFurnace,
    glBuildStructure: store.glBuildStructure,
    glUpgradeStructure: store.glUpgradeStructure,
    glGrindLens: store.glGrindLens,
    glCombineLens: store.glCombineLens,
    glCreateMosaic: store.glCreateMosaic,
    glInstallMosaic: store.glInstallMosaic,
    glCollectMaterial: store.glCollectMaterial,
    glTradeMaterial: store.glTradeMaterial,
    glRefractLight: store.glRefractLight,
    glFocusLight: store.glFocusLight,
    glUnlockTitle: store.glUnlockTitle,
    glClaimAchievement: store.glClaimAchievement,
    glExhibitArtifact: store.glExhibitArtifact,
    glSellArtifact: store.glSellArtifact,

    // ── Shop & Extra Actions ──────────────────────────────────
    glPurchaseShopItem: store.glPurchaseShopItem,
    glLearnBlueprint: store.glLearnBlueprint,
    glSetActiveTower: store.glSetActiveTower,
    glTriggerCitadelEvent: store.glTriggerCitadelEvent,

    // ── Internal Actions ──────────────────────────────────────
    glAddXp: store.glAddXp,
    glAddGold: store.glAddGold,
    glSpendGold: store.glSpendGold,
    glAddLightEnergy: store.glAddLightEnergy,
    glSetFurnaceTemperature: store.glSetFurnaceTemperature,
    glAddMaterial: store.glAddMaterial,
    glRemoveMaterial: store.glRemoveMaterial,
    glCheckLevelUp: store.glCheckLevelUp,
    glCheckAchievements: store.glCheckAchievements,
    glResetState: store.glResetState,

    // ── Logging ──────────────────────────────────────────────
    glLog,
    glLogAction,
  }
}
