/**
 * Goblin Warren Wire — 哥布林洞穴 (Goblin Warren) feature module for Word Snake
 *
 * An underground warren management mini-game: dig 8 warren tunnels,
 * recruit 35 goblins, build 30 trap mechanisms, manage 25 warren workshops,
 * wield 22 goblin abilities, invent 15 contraptions, and launch 12 raid events
 * on surface villages — backed by a Zustand store with persist middleware.
 *
 * Storage key: goblin-warren-wire
 * Prefix: gw / GW_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type GWRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type GWGoblinRole =
  | 'Scout'
  | 'Shaman'
  | 'Warrior'
  | 'Trapper'
  | 'Miner'
  | 'Engineer'
  | 'Chief'
export type GWTrapType = 'mechanical' | 'pit' | 'poison' | 'explosive' | 'net' | 'illusion'
export type GWContraptionType = 'transport' | 'weapon' | 'defense' | 'utility' | 'surveillance'
export type GWRaidTarget = 'village' | 'farm' | 'caravan' | 'castle' | 'mine' | 'temple' | 'port' | 'fortress'

export interface GWGoblinDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly role: GWGoblinRole
  readonly rarity: GWRarity
  readonly basePower: number
  readonly ability: string
}

export interface GWGoblinInstance {
  readonly id: string
  readonly goblinDefId: string
  readonly name: string
  readonly level: number
  readonly trainedCount: number
  readonly acquiredAt: number
}

export interface GWTunnelDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly depth: number
  readonly minLevel: number
  readonly resources: string[]
}

export interface GWTrapDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly trapType: GWTrapType
  readonly rarity: GWRarity
  readonly power: number
  readonly baseCost: number
}

export interface GWWorkshopDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly costMultiplier: number
}

export interface GWWorkshopInstance {
  readonly id: string
  readonly workshopDefId: string
  readonly level: number
  readonly built: boolean
}

export interface GWAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly element: string
}

export interface GWAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface GWTitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredTunnels: number
}

export interface GWContraptionDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly contraptionType: GWContraptionType
  readonly rarity: GWRarity
  readonly baseCost: number
  readonly power: number
}

export interface GWContraptionInstance {
  readonly id: string
  readonly contraptionDefId: string
  readonly built: boolean
  readonly active: boolean
  readonly durability: number
  readonly maxDurability: number
}

export interface GWRaidDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly target: GWRaidTarget
  readonly difficulty: number
  readonly rewards: string[]
  readonly minGoblins: number
}

export interface GWTrapInstance {
  readonly id: string
  readonly trapDefId: string
  readonly armed: boolean
  readonly level: number
  readonly deployedAt: number
}

export interface GWStoreState {
  goblins: GWGoblinInstance[]
  tunnels: Record<string, { dug: boolean; depth: number }>
  traps: GWTrapInstance[]
  workshops: GWWorkshopInstance[]
  contraptions: GWContraptionInstance[]
  achievements: string[]
  currentTitle: string
  warrenLevel: number
  warrenExp: number
  gold: number
  loot: number
  trapIron: number
  mushroomSpores: number
  totalDug: number
  totalTrained: number
  totalTrapsBuilt: number
  totalContraptions: number
  totalRaids: number
  totalLootStolen: number
  activeTunnelId: string | null
  activeRaidId: string | null
  raidTimer: number
  fortificationLevel: number
  sabotageCharges: number
}

export interface GWStoreActions {
  digTunnel: (tunnelId: string) => boolean
  buildTrap: (trapDefId: string) => boolean
  trainGoblin: (instanceId: string) => boolean
  useAbility: (abilityId: string) => boolean
  launchRaid: (raidId: string) => boolean
  inventContraption: (contraptionDefId: string) => boolean
  fortifyWarren: () => boolean
  tradeLoot: (lootAmount: number, resourceType: string) => boolean
  recruitChief: (chiefDefId: string) => boolean
  ambushParty: (targetType: string) => boolean
  gwClaimAchievement: (achievementId: string) => boolean
  gwUnlockTitle: (titleId: string) => boolean
}

export type GWFullStore = GWStoreState & GWStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const GW_COLOR_GOBLIN_GREEN: string = '#4CAF50'
export const GW_COLOR_TUNNEL_BROWN: string = '#8D6E63'
export const GW_COLOR_TRAP_IRON: string = '#78909C'
export const GW_COLOR_MUSHROOM_PURPLE: string = '#9C27B0'
export const GW_COLOR_GEMSTONE_RED: string = '#E53935'
export const GW_COLOR_CAVE_MOSS: string = '#2E7D32'
export const GW_COLOR_TORCH_ORANGE: string = '#FF9800'
export const GW_COLOR_GOLD_HOARD: string = '#FFD700'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: XP & LEVEL HELPERS
// ═══════════════════════════════════════════════════════════════════

const GW_MAX_LEVEL = 50

function gwXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= GW_MAX_LEVEL) return Infinity
  return Math.floor(90 * Math.pow(1.18, level) + level * 18)
}

function gwLevelFromXp(totalXp: number): number {
  let level = 1
  let xpRemaining = totalXp
  while (level < GW_MAX_LEVEL) {
    const needed = gwXpForLevel(level)
    if (xpRemaining < needed) break
    xpRemaining -= needed
    level++
  }
  return level
}

function gwGenerateId(): string {
  return `gw_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function gwRarityPower(rarity: GWRarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.4
    case 'rare': return 2.0
    case 'epic': return 3.2
    case 'legendary': return 5.5
  }
}

function gwGetRarityColor(rarity: GWRarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#22D3EE'
    case 'rare': return '#A78BFA'
    case 'epic': return '#F472B6'
    case 'legendary': return '#FBBF24'
  }
}

function gwGetRoleColor(role: GWGoblinRole): string {
  switch (role) {
    case 'Scout': return GW_COLOR_GOBLIN_GREEN
    case 'Shaman': return GW_COLOR_MUSHROOM_PURPLE
    case 'Warrior': return GW_COLOR_GEMSTONE_RED
    case 'Trapper': return GW_COLOR_TRAP_IRON
    case 'Miner': return GW_COLOR_TUNNEL_BROWN
    case 'Engineer': return GW_COLOR_TORCH_ORANGE
    case 'Chief': return GW_COLOR_GOLD_HOARD
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: GW_ROLE_BONUSES — Role-specific bonuses and stats
// ═══════════════════════════════════════════════════════════════════

export const GW_ROLE_BONUSES: Record<
  GWGoblinRole,
  { digBonus: number; trapBonus: number; raidBonus: number; inventBonus: number; trainCostMod: number }
> = {
  Scout: { digBonus: 0.2, trapBonus: 0.0, raidBonus: 0.15, inventBonus: 0.0, trainCostMod: 0.9 },
  Shaman: { digBonus: 0.0, trapBonus: 0.1, raidBonus: 0.1, inventBonus: 0.15, trainCostMod: 1.1 },
  Warrior: { digBonus: 0.0, trapBonus: 0.05, raidBonus: 0.25, inventBonus: 0.0, trainCostMod: 1.0 },
  Trapper: { digBonus: 0.05, trapBonus: 0.3, raidBonus: 0.0, inventBonus: 0.1, trainCostMod: 0.95 },
  Miner: { digBonus: 0.3, trapBonus: 0.0, raidBonus: 0.0, inventBonus: 0.05, trainCostMod: 0.85 },
  Engineer: { digBonus: 0.05, trapBonus: 0.1, raidBonus: 0.05, inventBonus: 0.25, trainCostMod: 1.05 },
  Chief: { digBonus: 0.1, trapBonus: 0.05, raidBonus: 0.15, inventBonus: 0.05, trainCostMod: 1.2 },
}

export function gwGetRoleDigSpeed(role: GWGoblinRole): number {
  return 1 + GW_ROLE_BONUSES[role].digBonus
}

export function gwGetRoleTrapEfficiency(role: GWGoblinRole): number {
  return 1 + GW_ROLE_BONUSES[role].trapBonus
}

export function gwGetRoleRaidPower(role: GWGoblinRole): number {
  return 1 + GW_ROLE_BONUSES[role].raidBonus
}

export function gwGetRoleInventSpeed(role: GWGoblinRole): number {
  return 1 + GW_ROLE_BONUSES[role].inventBonus
}

export function gwGetTrainCostMod(role: GWGoblinRole): number {
  return GW_ROLE_BONUSES[role].trainCostMod
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: GW_RESOURCES — Underground Resource Definitions
// ═══════════════════════════════════════════════════════════════════

export interface GWResourceDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: GWRarity
  readonly source: string
  readonly goldValue: number
}

export const GW_RESOURCES: readonly GWResourceDef[] = [
  // Root Cellar Resources (4)
  { id: 'mud_clay', name: 'Mud Clay', description: 'Sticky clay extracted from the shallow root cellar tunnels, useful for basic construction and pottery.', rarity: 'common', source: 'root_cellar', goldValue: 3 },
  { id: 'root_fiber', name: 'Root Fiber', description: 'Strong fibers harvested from cave tree roots, woven into rope, nets, and basic clothing for goblins.', rarity: 'common', source: 'root_cellar', goldValue: 4 },
  { id: 'worm_bait', name: 'Worm Bait', description: 'Cave worms collected in damp soil, used as bait for trapping creatures and fishing in underground pools.', rarity: 'common', source: 'root_cellar', goldValue: 2 },
  { id: 'dirt_gravel', name: 'Dirt Gravel', description: 'Coarse gravel sifted from tunnel excavations, used as a base material for concrete-like goblin construction.', rarity: 'common', source: 'root_cellar', goldValue: 1 },

  // Mudslide Passage Resources (4)
  { id: 'clay_brick', name: 'Clay Brick', description: 'Sun-baked clay bricks formed from mudslide clay, the primary building material for early warren construction.', rarity: 'common', source: 'mudslide_passage', goldValue: 8 },
  { id: 'mud_gem', name: 'Mud Gem', description: 'A semi-precious stone found embedded in clay deposits. Uncut and rough, but valuable to surface jewelers.', rarity: 'uncommon', source: 'mudslide_passage', goldValue: 25 },
  { id: 'slime_resin', name: 'Slime Resin', description: 'A sticky substance harvested from cave slimes that live in the mud tunnels. Used as glue and waterproof sealant.', rarity: 'common', source: 'mudslide_passage', goldValue: 6 },
  { id: 'earthworm_silk', name: 'Earthworm Silk', description: 'Incredibly fine threads produced by giant underground earthworms, stronger than steel wire of the same thickness.', rarity: 'uncommon', source: 'mudslide_passage', goldValue: 30 },

  // Crystal Crawl Resources (4)
  { id: 'cave_crystal', name: 'Cave Crystal', description: 'Raw crystal formations harvested from the crystal crawl tunnels, used in trap mechanisms and contraption lenses.', rarity: 'uncommon', source: 'crystal_crawl', goldValue: 35 },
  { id: 'quartz_shard', name: 'Quartz Shard', description: 'Sharp quartz fragments from the crystal tunnels, used as cutting tools and weapon components.', rarity: 'common', source: 'crystal_crawl', goldValue: 12 },
  { id: 'glow_gem', name: 'Glow Gem', description: 'A crystal that emits a steady soft light, used to illuminate tunnel sections without torches or fire.', rarity: 'uncommon', source: 'crystal_crawl', goldValue: 40 },
  { id: 'crystal_dust', name: 'Crystal Dust', description: 'Fine powder ground from crystal fragments, used in shaman potions and as an abrasive for polishing gems.', rarity: 'common', source: 'crystal_crawl', goldValue: 10 },

  // Mushroom Grotto Resources (4)
  { id: 'glow_cap', name: 'Glow Cap', description: 'The cap of a bioluminescent mushroom that produces a bright blue-green light, harvested for lighting and shamanic rituals.', rarity: 'uncommon', source: 'mushroom_grotto', goldValue: 28 },
  { id: 'spore_powder', name: 'Spore Powder', description: 'Dried mushroom spores with various magical properties depending on the source fungus. Essential for shamanic crafting.', rarity: 'uncommon', source: 'mushroom_grotto', goldValue: 32 },
  { id: 'fungus_leather', name: 'Fungus Leather', description: 'Tough but flexible material harvested from giant bracket mushrooms, used to make armor and containers.', rarity: 'uncommon', source: 'mushroom_grotto', goldValue: 22 },
  { id: 'mycelium_thread', name: 'Mycelium Thread', description: 'Thread spun from fungal root networks, lightweight and nearly unbreakable. The finest rope in the underground.', rarity: 'rare', source: 'mushroom_grotto', goldValue: 65 },

  // Iron Vein Shaft Resources (4)
  { id: 'iron_ore', name: 'Iron Ore', description: 'Raw iron ore extracted from the deep iron veins, smelted into bars for trap mechanisms and contraption frames.', rarity: 'uncommon', source: 'iron_vein_shaft', goldValue: 30 },
  { id: 'steel_scrap', name: 'Steel Scrap', description: 'Salvaged pieces of worked steel found in abandoned mine shafts, reusable after melting in the warren forge.', rarity: 'uncommon', source: 'iron_vein_shaft', goldValue: 35 },
  { id: 'magnetite', name: 'Magnetite', description: 'Magnetic iron ore used in compasses, trap triggers, and the goblin engineers\' various magnetic devices.', rarity: 'rare', source: 'iron_vein_shaft', goldValue: 80 },
  { id: 'rust_powder', name: 'Rust Powder', description: 'Iron oxide powder harvested from corroded mine equipment, used in alchemical reactions and poison crafting.', rarity: 'common', source: 'iron_vein_shaft', goldValue: 8 },

  // Lava Crack Resources (4)
  { id: 'obsidian_glass', name: 'Obsidian Glass', description: 'Volcanic glass formed where lava meets underground water, sharper than any metal blade when properly knapped.', rarity: 'rare', source: 'lava_crack', goldValue: 90 },
  { id: 'fire_opal', name: 'Fire Opal', description: 'A gemstone formed in volcanic rock that glows with inner fire, highly prized by surface jewelers and goblin shamans alike.', rarity: 'rare', source: 'lava_crack', goldValue: 150 },
  { id: 'magma_slag', name: 'Magma Slag', description: 'Cooled volcanic residue that still radiates warmth. Used to heat workshops and power steam contraptions.', rarity: 'uncommon', source: 'lava_crack', goldValue: 20 },
  { id: 'heat_crystal', name: 'Heat Crystal', description: 'A crystal that stores thermal energy, releasing it gradually over time. Powers goblin heating systems for months.', rarity: 'rare', source: 'lava_crack', goldValue: 110 },

  // Gemstone Hollow Resources (4)
  { id: 'ruby_fragment', name: 'Ruby Fragment', description: 'A shard of deep red ruby, the most valuable gemstone in the warren. Surface merchants pay fortunes for these.', rarity: 'epic', source: 'gemstone_hollow', goldValue: 300 },
  { id: 'emerald_shard', name: 'Emerald Shard', description: 'A brilliant green emerald chip from the gemstone hollow. Shamans use them for focusing magical energy.', rarity: 'epic', source: 'gemstone_hollow', goldValue: 280 },
  { id: 'sapphire_dust', name: 'Sapphire Dust', description: 'Ground sapphire powder that shimmers with an inner blue light. Used in high-value trap mechanisms and enchantments.', rarity: 'rare', source: 'gemstone_hollow', goldValue: 120 },
  { id: 'diamond_rough', name: 'Rough Diamond', description: 'An uncut diamond of exceptional quality. The ultimate treasure of the underground, worth more than a goblin kingdom.', rarity: 'legendary', source: 'gemstone_hollow', goldValue: 1000 },

  // Deep Heart Resources (4)
  { id: 'heart_crystal', name: 'Heart Crystal', description: 'A crystal pulsing with the living energy of the mountain itself. Shamans say it is the literal heart of the earth.', rarity: 'legendary', source: 'deep_heart', goldValue: 2000 },
  { id: 'primordial_ore', name: 'Primordial Ore', description: 'Metallic ore from the deepest strata, containing traces of every element known to goblin science and some unknown ones.', rarity: 'legendary', source: 'deep_heart', goldValue: 1500 },
  { id: 'world_stone', name: 'World Stone', description: 'A stone fragment from the foundations of the world, impossibly dense and heavy. Holding it makes you feel grounded.', rarity: 'legendary', source: 'deep_heart', goldValue: 2500 },
  { id: 'void_gem', name: 'Void Gem', description: 'A gemstone that absorbs all light, containing a tiny pocket of absolute void within its crystalline structure.', rarity: 'legendary', source: 'deep_heart', goldValue: 3000 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: GW_GOBLINS — 35 Goblin Types (7 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const GW_GOBLINS: readonly GWGoblinDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'mud_toe_scout',
    name: 'Mud-Toe Scout',
    description:
      'A wiry goblin with perpetually muddy feet. Mud-Toe can traverse any terrain without leaving a trace, making him the perfect advance spy for tunnel expansions.',
    role: 'Scout',
    rarity: 'common',
    basePower: 15,
    ability: 'Silent Step — Move through enemy territory without triggering alarms.',
  },
  {
    id: 'rat_bite_shaman',
    name: 'Rat-Bite Shaman',
    description:
      'A gaunt shaman who channels the spirits of cave rats. Rat-Bite brews foul-smelling poultices that can cure goblin ailments or poison intruders with equal efficiency.',
    role: 'Shaman',
    rarity: 'common',
    basePower: 18,
    ability: 'Rat Swarm Summons — Calls a swarm of spectral rats to overwhelm foes.',
  },
  {
    id: 'scab_claw_warrior',
    name: 'Scab-Claw Warrior',
    description:
      'A battle-scarred goblin warrior whose claws have been hardened with iron filings. Scab-Claw fights with a ferocity that belies his small stature, scratching and biting anything that enters his territory.',
    role: 'Warrior',
    rarity: 'common',
    basePower: 22,
    ability: 'Iron Scratch — Reinforced claws deal bonus damage to armored targets.',
  },
  {
    id: 'snare_lip_trapper',
    name: 'Snare-Lip Trapper',
    description:
      'A cunning goblin with an unusually wide mouth, always grinning. Snare-Lip constructs simple but effective tripwires and snares from tunnel roots and stolen wire.',
    role: 'Trapper',
    rarity: 'common',
    basePower: 16,
    ability: 'Root Snare — Plants an invisible snare that entangles intruders for several seconds.',
  },
  {
    id: 'coal_nose_miner',
    name: 'Coal-Nose Miner',
    description:
      'A stocky goblin whose nose is perpetually blackened with coal dust. Coal-Nose can sniff out valuable minerals and gems through solid rock, guiding mining operations deep underground.',
    role: 'Miner',
    rarity: 'common',
    basePower: 14,
    ability: 'Mineral Sense — Detects nearby mineral deposits and hidden treasures.',
  },
  {
    id: 'bolt_nut_engineer',
    name: 'Bolt-Nut Engineer',
    description:
      'A grease-stained goblin tinkerer who carries a pouch full of salvaged bolts and nuts. Bolt-Nut can assemble basic contraptions from scrap metal and whatever else he can scavenge.',
    role: 'Engineer',
    rarity: 'common',
    basePower: 17,
    ability: 'Scrap Assemble — Quickly builds a crude but functional device from available parts.',
  },
  {
    id: 'grubbel_chief',
    name: 'Grubbel the Meek',
    description:
      'A surprisingly un-goblin-like chief who leads through quiet persuasion rather than intimidation. Grubbel has an uncanny ability to resolve disputes and keep the warren running smoothly.',
    role: 'Chief',
    rarity: 'common',
    basePower: 20,
    ability: 'Muster — Rallies nearby goblins, boosting their morale and work speed.',
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'shadow_fang_scout',
    name: 'Shadow-Fang Scout',
    description:
      'A goblin who has spent so long in darkness that his skin has turned charcoal black. Shadow-Fang can blend into any shadow, making him nearly invisible in the dim tunnel light.',
    role: 'Scout',
    rarity: 'uncommon',
    basePower: 32,
    ability: 'Shadowmeld — Becomes invisible in dark areas, perfect for ambush reconnaissance.',
  },
  {
    id: 'spore_eye_shaman',
    name: 'Spore-Eye Shaman',
    description:
      'A shaman with milky white eyes caused by prolonged exposure to cave mushroom spores. Spore-Eye can see through illusions and detect invisible threats using his fungal sixth sense.',
    role: 'Shaman',
    rarity: 'uncommon',
    basePower: 35,
    ability: 'Fungal Vision — Reveals hidden enemies and traps within a large radius.',
  },
  {
    id: 'iron_jaw_warrior',
    name: 'Iron-Jaw Warrior',
    description:
      'A warrior who replaced his shattered jaw with an iron prosthetic crafted by the warren engineers. Iron-Jaw bites through armor, chains, and even sword blades with his metal mouth.',
    role: 'Warrior',
    rarity: 'uncommon',
    basePower: 40,
    ability: 'Crushing Bite — Teeth of iron can break through shields and armor plating.',
  },
  {
    id: 'vine_bind_trapper',
    name: 'Vine-Bind Trapper',
    description:
      'A trapper who cultivates living underground vines to create animated snares. Vine-Bind traps grow stronger over time, wrapping tighter around anything caught in their grip.',
    role: 'Trapper',
    rarity: 'uncommon',
    basePower: 30,
    ability: 'Living Snare — Deploys living vines that constrict and slowly drain trapped foes.',
  },
  {
    id: 'gem_tooth_miner',
    name: 'Gem-Tooth Miner',
    description:
      'A miner who swallowed a gemstone as a child, giving his teeth an unnatural hardness and sparkle. Gem-Tooth can chew through the hardest rock, mining at speeds no other goblin can match.',
    role: 'Miner',
    rarity: 'uncommon',
    basePower: 28,
    ability: 'Crystal Bite — Chews through rock and ore at triple normal mining speed.',
  },
  {
    id: 'gear_spin_engineer',
    name: 'Gear-Spin Engineer',
    description:
      'An engineer who implanted a spinning gear mechanism into his own skull. Gear-Spin thinks in mechanical terms, designing complex trap mechanisms that no ordinary goblin could conceive.',
    role: 'Engineer',
    rarity: 'uncommon',
    basePower: 34,
    ability: 'Mechanical Genius — Designs and builds advanced trap mechanisms with reduced cost.',
  },
  {
    id: 'skrit_chief',
    name: 'Skrit the Clever',
    description:
      'A chief known for her elaborate escape plans and heist coordination. Skrit once led a raid that stole a king\'s crown without anyone noticing until the next morning.',
    role: 'Chief',
    rarity: 'uncommon',
    basePower: 36,
    ability: 'Heist Plan — Organizes a coordinated heist, doubling loot from the next raid.',
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'ghost_step_scout',
    name: 'Ghost-Step Scout',
    description:
      'A scout who learned to phase through thin walls by vibrating at a specific frequency. Ghost-Step can pass through any barrier less than a foot thick, making her the ultimate infiltration expert.',
    role: 'Scout',
    rarity: 'rare',
    basePower: 58,
    ability: 'Phase Walk — Pass through solid walls and barriers, leaving no trace behind.',
  },
  {
    id: 'mushroom_lord_shaman',
    name: 'Mushroom Lord Shaman',
    description:
      'A shaman who has merged with a massive underground fungal network. The Mushroom Lord can command armies of fungus creatures and heal allies with restorative spore clouds.',
    role: 'Shaman',
    rarity: 'rare',
    basePower: 62,
    ability: 'Spore Cloud — Releases a cloud that heals allies and poisons enemies simultaneously.',
  },
  {
    id: 'cave_titan_warrior',
    name: 'Cave Titan Warrior',
    description:
      'An abnormally large goblin warrior, standing nearly four feet tall. The Cave Titan wields a club carved from a stalactite and wears armor made from the shells of giant cave beetles.',
    role: 'Warrior',
    rarity: 'rare',
    basePower: 70,
    ability: 'Titanic Slam — A devastating ground slam that creates a shockwave in a large area.',
  },
  {
    id: 'death_knot_trapper',
    name: 'Death-Knot Trapper',
    description:
      'A trapper whose rope-work is so intricate that captured victims can never escape. Death-Knot weaves complex net systems that auto-repair themselves when damaged.',
    role: 'Trapper',
    rarity: 'rare',
    basePower: 55,
    ability: 'Inescapable Net — Deploys a self-repairing net that tightens with any struggle.',
  },
  {
    id: 'deep_vein_miner',
    name: 'Deep-Vein Miner',
    description:
      'A miner who can follow mineral veins through solid rock by sensing the magnetic fields they emit. Deep-Vein has discovered more hidden chambers and treasure rooms than any goblin in history.',
    role: 'Miner',
    rarity: 'rare',
    basePower: 52,
    ability: 'Vein Tracker — Follows underground ore veins to discover hidden treasure chambers.',
  },
  {
    id: 'clockwork_engineer',
    name: 'Clockwork Engineer',
    description:
      'A brilliant engineer who builds tiny clockwork assistants to help with construction and sabotage. Each clockwork companion is a marvel of miniaturization, capable of complex tasks.',
    role: 'Engineer',
    rarity: 'rare',
    basePower: 60,
    ability: 'Clockwork Army — Deploys a swarm of tiny clockwork assistants that build and repair autonomously.',
  },
  {
    id: 'mudfang_chief',
    name: 'Mudfang the Ruthless',
    description:
      'A feared chief who rules through cunning and calculated cruelty. Mudfang has expanded his warren to three times its original size through strategic conquest and ruthless trap deployment.',
    role: 'Chief',
    rarity: 'rare',
    basePower: 65,
    ability: 'War Council — Calls a war council that boosts all goblins\' combat power for a duration.',
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'void_crawler_scout',
    name: 'Void Crawler Scout',
    description:
      'A scout who ventured too deep and found the void beneath the deepest caves. The Void Crawler can teleport between any two dark spaces within the warren, moving instantaneously.',
    role: 'Scout',
    rarity: 'epic',
    basePower: 95,
    ability: 'Dark Teleport — Instantly teleport between any two unlit areas in the warren.',
  },
  {
    id: 'bone_whisperer_shaman',
    name: 'Bone-Whisperer Shaman',
    description:
      'A shaman who communes with the ancient skeletal remains of creatures that died in the caves millennia ago. The Bone-Whisperer can summon spectral guardians from these ancient bones.',
    role: 'Shaman',
    rarity: 'epic',
    basePower: 100,
    ability: 'Skeletal Army — Raises ancient cave bones into an army of spectral guardians.',
  },
  {
    id: 'obsidian_rage_warrior',
    name: 'Obsidian Rage Warrior',
    description:
      'A warrior encased in a suit of natural obsidian armor found in the deepest volcanic vents of the warren. The Obsidian Rage channels volcanic fury through the armor, making him nearly indestructible.',
    role: 'Warrior',
    rarity: 'epic',
    basePower: 110,
    ability: 'Volcanic Fury — Engulfs self in volcanic fire, dealing massive damage and becoming immune to physical attacks.',
  },
  {
    id: 'abyss_trap_master',
    name: 'Abyss Trap Master',
    description:
      'The undisputed master of all trap mechanisms, the Abyss Trap Master designs Rube Goldberg-esque trap networks spanning entire tunnel systems. One wrong step can trigger a chain reaction of fifty traps.',
    role: 'Trapper',
    rarity: 'epic',
    basePower: 90,
    ability: 'Trap Cascade — Triggers a chain reaction of all traps in the current tunnel system.',
  },
  {
    id: 'gemheart_miner',
    name: 'Gemheart Miner',
    description:
      'A miner who discovered a living gemstone embedded in his chest. The Gemheart pulses with geothermal energy, allowing him to reshape rock with a touch and sense every gem in the surrounding mile.',
    role: 'Miner',
    rarity: 'epic',
    basePower: 85,
    ability: 'Earth Reshape — Temporarily reshapes rock and earth, creating new passages or sealing tunnels.',
  },
  {
    id: 'scrap_mage_engineer',
    name: 'Scrap-Mage Engineer',
    description:
      'An engineer who has transcended mere mechanics and dabbles in scrap-magic, enchanting machines to run on pure goblin ingenuity. The Scrap-Mage can make broken things work and working things work impossibly well.',
    role: 'Engineer',
    rarity: 'epic',
    basePower: 105,
    ability: 'Scrap Enchantment — Temporarily enchants all contraptions, doubling their power and efficiency.',
  },
  {
    id: 'ironjaw_warlord_chief',
    name: 'Ironjaw Warlord',
    description:
      'The supreme warlord of the goblin underground, Ironjaw has conquered seven rival warrens and united them under his banner. His tactical genius is matched only by his brutality in battle.',
    role: 'Chief',
    rarity: 'epic',
    basePower: 115,
    ability: 'Warren Domination — Temporarily seizes control of enemy traps and turns them against their owners.',
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'nightmare_scout',
    name: 'Nightmare Scout',
    description:
      'A scout who became one with the darkness itself. The Nightmare Scout exists as a sentient shadow, able to infiltrate the dreams of surface-dwellers and extract secrets from their sleeping minds.',
    role: 'Scout',
    rarity: 'legendary',
    basePower: 140,
    ability: 'Dream Walk — Enter the dreams of sleeping targets to extract secrets or plant suggestions.',
  },
  {
    id: 'elder_spore_shaman',
    name: 'Elder Spore Shaman',
    description:
      'The oldest living goblin shaman, bonded with the primordial fungal network that spans all underground spaces. The Elder Spore can communicate through mushrooms anywhere in the world and reshape cave ecosystems.',
    role: 'Shaman',
    rarity: 'legendary',
    basePower: 135,
    ability: 'Mycelium Network — Creates a global fungal communication network spanning all warrens.',
  },
  {
    id: 'warren_titan',
    name: 'Warren Titan',
    description:
      'A goblin of mythic proportions, ten feet tall and clad in fused rock and iron. The Warren Titan is said to have been born from the mountain itself, a living embodiment of the underground\'s raw power.',
    role: 'Warrior',
    rarity: 'legendary',
    basePower: 150,
    ability: 'Mountain Rage — Becomes one with the mountain, gaining earthquake powers and near-invulnerability.',
  },
  {
    id: 'web_of_dooms_trapper',
    name: 'Web of Dooms Trapper',
    description:
      'A trapper so skilled that entire armies have been captured in a single one of her trap networks. The Web of Dooms weaves interconnected trap systems that are each a work of malicious genius.',
    role: 'Trapper',
    rarity: 'legendary',
    basePower: 130,
    ability: 'Infinite Labyrinth — Transforms the warren into a shifting labyrinth that traps all intruders forever.',
  },
  {
    id: 'world_root_miner',
    name: 'World-Root Miner',
    description:
      'A miner who found the roots of the World Tree buried deep beneath the earth. The World-Root Miner can tap into the primordial life force of the planet, reshaping underground landscapes at will.',
    role: 'Miner',
    rarity: 'legendary',
    basePower: 128,
    ability: 'World Shaping — Permanently reshapes underground terrain, creating new chambers, tunnels, and resource veins.',
  },
  {
    id: 'mad_genius_engineer',
    name: 'Mad Genius Engineer',
    description:
      'The most brilliant and insane goblin engineer to ever live. The Mad Genius has built a mechanical dragon, a self-replicating clockwork army, and once accidentally created a device that nearly cracked the moon.',
    role: 'Engineer',
    rarity: 'legendary',
    basePower: 145,
    ability: 'Impossible Invention — Builds any contraption instantly with no resource cost, regardless of complexity.',
  },
  {
    id: 'goblin_king',
    name: 'Goblin King',
    description:
      'The legendary ruler of all goblin-kind, whose throne sits atop the greatest treasure hoard in the underworld. The Goblin King commands absolute loyalty from every goblin and can raise armies from the earth itself.',
    role: 'Chief',
    rarity: 'legendary',
    basePower: 150,
    ability: 'Royal Decree — All goblins in the warren gain maximum power, and all traps become indestructible for a time.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: GW_TUNNELS — 8 Warren Tunnel Networks
// ═══════════════════════════════════════════════════════════════════

export const GW_TUNNELS: readonly GWTunnelDef[] = [
  {
    id: 'root_cellar',
    name: 'Root Cellar',
    description:
      'A shallow network of tunnels beneath an old oak tree, just deep enough to avoid detection. Roots poke through the ceiling, and the air smells of damp earth and decaying leaves. Perfect for beginners.',
    depth: 15,
    minLevel: 1,
    resources: ['mud_clay', 'root_fiber', 'worm_bait', 'dirt_gravel'],
  },
  {
    id: 'mudslide_passage',
    name: 'Mudslide Passage',
    description:
      'Winding tunnels carved through soft clay deposits, prone to sudden mudslides that can reshape passages overnight. Goblin engineers have installed crude drainage channels to keep the worst floods at bay.',
    depth: 40,
    minLevel: 3,
    resources: ['clay_brick', 'mud_gem', 'slime_resin', 'earthworm_silk'],
  },
  {
    id: 'crystal_crawl',
    name: 'Crystal Crawl',
    description:
      'A glittering tunnel system threading through a natural crystal formation. The crystals provide natural illumination but create treacherous footing with their sharp edges and unstable formations.',
    depth: 80,
    minLevel: 7,
    resources: ['cave_crystal', 'quartz_shard', 'glow_gem', 'crystal_dust'],
  },
  {
    id: 'mushroom_grotto',
    name: 'Mushroom Grotto',
    description:
      'A vast underground cavern filled with bioluminescent mushrooms of every size and color. The goblin shamans cultivate the rarest fungi here, using their spores for medicine, poison, and communication.',
    depth: 120,
    minLevel: 12,
    resources: ['glow_cap', 'spore_powder', 'fungus_leather', 'mycelium_thread'],
  },
  {
    id: 'iron_vein_shaft',
    name: 'Iron Vein Shaft',
    description:
      'A deep vertical shaft following a rich iron ore deposit straight into the mountain\'s heart. The walls glitter with metallic veins, and the constant clang of goblin mining picks echoes through the darkness.',
    depth: 200,
    minLevel: 18,
    resources: ['iron_ore', 'steel_scrap', 'magnetite', 'rust_powder'],
  },
  {
    id: 'lava_crack',
    name: 'Lava Crack',
    description:
      'Tunnels carved along the edge of an underground lava flow. The heat is unbearable for most creatures, but goblin engineers have rigged cooling systems using imported ice from the surface. Rich in rare minerals.',
    depth: 300,
    minLevel: 25,
    resources: ['obsidian_glass', 'fire_opal', 'magma_slag', 'heat_crystal'],
  },
  {
    id: 'gemstone_hollow',
    name: 'Gemstone Hollow',
    description:
      'The legendary gem-bearing strata of the mountain, where veins of rubies, emeralds, and sapphires crisscross through pure white marble. Goblin miners guard this location with deadly trap networks.',
    depth: 450,
    minLevel: 33,
    resources: ['ruby_fragment', 'emerald_shard', 'sapphire_dust', 'diamond_rough'],
  },
  {
    id: 'deep_heart',
    name: 'Deep Heart',
    description:
      'The deepest chamber of the warren, where the mountain\'s living core pulses with geothermal energy. Ancient goblin legends say this is where the first goblin dug the first tunnel, and where the last goblin will dig the last.',
    depth: 600,
    minLevel: 42,
    resources: ['heart_crystal', 'primordial_ore', 'world_stone', 'void_gem'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: GW_TRAPS — 30 Trap Mechanisms
// ═══════════════════════════════════════════════════════════════════

export const GW_TRAPS: readonly GWTrapDef[] = [
  // Mechanical (5)
  { id: 'tripwire_snapper', name: 'Tripwire Snapper', description: 'A simple wire stretched across a tunnel that triggers a snapping jaw mechanism when disturbed.', trapType: 'mechanical', rarity: 'common', power: 8, baseCost: 10 },
  { id: 'gear_grinder', name: 'Gear Grinder', description: 'Rotating gears embedded in the floor that activate when pressure plates are stepped on.', trapType: 'mechanical', rarity: 'uncommon', power: 18, baseCost: 35 },
  { id: 'crushing_ceiling', name: 'Crushing Ceiling', description: 'A heavy stone slab suspended above the tunnel, released by a clever lever mechanism.', trapType: 'mechanical', rarity: 'rare', power: 40, baseCost: 120 },
  { id: 'steel_spring_net', name: 'Steel Spring Net', description: 'A high-tension net launcher powered by coiled steel springs, trapping targets against the walls.', trapType: 'mechanical', rarity: 'epic', power: 75, baseCost: 350 },
  { id: 'clockwork_swarm', name: 'Clockwork Swarm', description: 'Releases a swarm of tiny clockwork beetles that chase and harass intruders relentlessly.', trapType: 'mechanical', rarity: 'legendary', power: 120, baseCost: 900 },

  // Pit (5)
  { id: 'dirt_pit', name: 'Dirt Pit', description: 'A simple pit dug in the tunnel floor and covered with leaves. Classic but effective.', trapType: 'pit', rarity: 'common', power: 6, baseCost: 8 },
  { id: 'spike_pit', name: 'Spike Pit', description: 'A deeper pit lined with sharpened stakes at the bottom, coated in cave slime for infection.', trapType: 'pit', rarity: 'uncommon', power: 20, baseCost: 30 },
  { id: 'quicksand_sinkhole', name: 'Quicksand Sinkhole', description: 'A pit filled with magically thickened mud that slowly sucks victims downward.', trapType: 'pit', rarity: 'rare', power: 35, baseCost: 100 },
  { id: 'void_pit', name: 'Void Pit', description: 'A seemingly bottomless pit with anti-gravity properties that prevent any escape attempt.', trapType: 'pit', rarity: 'epic', power: 80, baseCost: 400 },
  { id: 'dimensional_maw', name: 'Dimensional Maw', description: 'A pit that opens into a pocket dimension, trapping intruders in an infinite void space.', trapType: 'pit', rarity: 'legendary', power: 130, baseCost: 1000 },

  // Poison (5)
  { id: 'spore_puff', name: 'Spore Puff', description: 'A mushroom that releases a cloud of irritating spores when touched, causing sneezing fits.', trapType: 'poison', rarity: 'common', power: 7, baseCost: 12 },
  { id: 'cave_toad_venom', name: 'Cave Toad Venom', description: 'Darts coated in cave toad venom that fire from wall slots when a tripwire is triggered.', trapType: 'poison', rarity: 'uncommon', power: 22, baseCost: 40 },
  { id: 'shadow_brew_drip', name: 'Shadow Brew Drip', description: 'A slow-drip system dispensing concentrated goblin shaman poison from the ceiling.', trapType: 'poison', rarity: 'rare', power: 38, baseCost: 110 },
  { id: 'paralysis_gas', name: 'Paralysis Gas', description: 'Releases an invisible gas that paralyzes all breathing creatures within a large radius.', trapType: 'poison', rarity: 'epic', power: 70, baseCost: 320 },
  { id: 'nightmare_toxin', name: 'Nightmare Toxin', description: 'The ultimate goblin poison that induces terrifying hallucinations and makes victims attack their allies.', trapType: 'poison', rarity: 'legendary', power: 125, baseCost: 950 },

  // Explosive (5)
  { id: 'dust_bomb', name: 'Dust Bomb', description: 'A bag of highly combustible cave dust that ignites when exposed to a spark from flint strikers.', trapType: 'explosive', rarity: 'common', power: 12, baseCost: 15 },
  { id: 'gravel_grenade', name: 'Gravel Grenade', description: 'A clay pot filled with gravel and gunpowder that shatters in all directions when triggered.', trapType: 'explosive', rarity: 'uncommon', power: 25, baseCost: 45 },
  { id: 'crystal_shrapnel', name: 'Crystal Shrapnel', description: 'Explosive charges surrounded by razor-sharp crystal fragments that spray outward on detonation.', trapType: 'explosive', rarity: 'rare', power: 45, baseCost: 130 },
  { id: 'magma_bomb', name: 'Magma Bomb', description: 'A pressurized container of captured lava that erupts in a stream of molten rock when ruptured.', trapType: 'explosive', rarity: 'epic', power: 85, baseCost: 380 },
  { id: 'warren_cracker', name: 'Warren Cracker', description: 'A massive explosive device that can collapse an entire tunnel section, sealing intruders in rubble.', trapType: 'explosive', rarity: 'legendary', power: 140, baseCost: 1100 },

  // Net (5)
  { id: 'root_tangle', name: 'Root Tangle', description: 'Living cave roots that snake across the floor and entangle anything that steps on them.', trapType: 'net', rarity: 'common', power: 9, baseCost: 11 },
  { id: 'iron_mesh', name: 'Iron Mesh', description: 'A heavy iron net that drops from the ceiling, weighted to pin victims to the ground.', trapType: 'net', rarity: 'uncommon', power: 19, baseCost: 38 },
  { id: 'chain_cocoon', name: 'Chain Cocoon', description: 'Mechanical arms that emerge from the walls and wrap a target in heavy iron chains.', trapType: 'net', rarity: 'rare', power: 42, baseCost: 115 },
  { id: 'energy_web', name: 'Energy Web', description: 'A net woven from captured lightning that stuns and shocks anything caught within it.', trapType: 'net', rarity: 'epic', power: 78, baseCost: 360 },
  { id: 'nullification_field', name: 'Nullification Field', description: 'A trap that generates a field negating all magic and abilities of anyone caught inside.', trapType: 'net', rarity: 'legendary', power: 135, baseCost: 1050 },

  // Illusion (5)
  { id: 'false_floor', name: 'False Floor', description: 'An illusionary floor that makes a pit look like solid ground. Goblins can see through it.', trapType: 'illusion', rarity: 'common', power: 5, baseCost: 20 },
  { id: 'echo_maze', name: 'Echo Maze', description: 'Creates auditory illusions that make tunnels sound like they lead one way when they go another.', trapType: 'illusion', rarity: 'uncommon', power: 16, baseCost: 50 },
  { id: 'mirror_hall', name: 'Mirror Hall', description: 'Lines a tunnel with enchanted mirrors that create infinite reflections, disorienting intruders.', trapType: 'illusion', rarity: 'rare', power: 30, baseCost: 140 },
  { id: 'phantom_wall', name: 'Phantom Wall', description: 'Creates an illusionary wall that appears completely solid, hiding passages and treasure rooms.', trapType: 'illusion', rarity: 'epic', power: 65, baseCost: 340 },
  { id: 'mind_palace', name: 'Mind Palace', description: 'An illusion so complete it creates an entire fake warren in the intruder\'s mind, trapping them forever.', trapType: 'illusion', rarity: 'legendary', power: 115, baseCost: 980 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: GW_WORKSHOPS — 25 Warren Workshops (Level 1-10)
// ═══════════════════════════════════════════════════════════════════

export const GW_WORKSHOPS: readonly GWWorkshopDef[] = [
  // Mining (5)
  { id: 'pickaxe_bench', name: 'Pickaxe Sharpening Bench', description: 'A sturdy workbench where goblin miners sharpen their picks and sort extracted ores. Essential for any expanding warren.', baseCost: 80, costMultiplier: 1.4 },
  { id: 'ore_crusher', name: 'Ore Crusher', description: 'A heavy stone-and-iron contraption that crushes raw ore into manageable chunks for smelting and crafting.', baseCost: 300, costMultiplier: 1.5 },
  { id: 'gem_cutting_table', name: 'Gem Cutting Table', description: 'A precision workbench equipped with tiny chisels and magnifying lenses for cutting and polishing gems.', baseCost: 800, costMultiplier: 1.6 },
  { id: 'deep_drill_station', name: 'Deep Drill Station', description: 'A mechanical drill rig that bores through the hardest rock, reaching depths no goblin miner could dig alone.', baseCost: 2000, costMultiplier: 1.7 },
  { id: 'world_core_forge', name: 'World Core Forge', description: 'The ultimate mining workshop, powered by geothermal energy from the planet\'s core itself. Mines at supernatural speed.', baseCost: 6000, costMultiplier: 2.0 },

  // Trap Crafting (5)
  { id: 'snare_weaving_loom', name: 'Snare Weaving Loom', description: 'A loom for weaving rope and net traps from root fibers and stolen cloth. The foundation of any trap workshop.', baseCost: 100, costMultiplier: 1.4 },
  { id: 'iron_trap_forge', name: 'Iron Trap Forge', description: 'A small forge dedicated to crafting metal trap components: jaws, springs, hinges, and spikes.', baseCost: 400, costMultiplier: 1.5 },
  { id: 'poison_brewery', name: 'Poison Brewery', description: 'A foul-smelling workshop where shaman-brewers concoct poisons and toxins for trap mechanisms.', baseCost: 1000, costMultiplier: 1.6 },
  { id: 'clockwork_assembly', name: 'Clockwork Assembly Line', description: 'An automated assembly line for mass-producing mechanical trap components from blueprints.', baseCost: 2500, costMultiplier: 1.7 },
  { id: 'grand_trap_foundry', name: 'Grand Trap Foundry', description: 'The pinnacle of trap manufacturing, capable of producing legendary-quality traps with exotic materials.', baseCost: 7000, costMultiplier: 2.0 },

  // Engineering (5)
  { id: 'scrap_pile', name: 'Scrap Pile', description: 'An organized collection of scavenged materials sorted by type and quality. The starting point for any goblin invention.', baseCost: 60, costMultiplier: 1.3 },
  { id: 'tinker_bench', name: 'Tinker\'s Workbench', description: 'A cluttered bench covered in half-finished gadgets, tools, and blueprints scribbled on bark.', baseCost: 250, costMultiplier: 1.5 },
  { id: 'mechanical_lab', name: 'Mechanical Laboratory', description: 'A proper laboratory with measuring tools, test chambers, and safety protocols written in goblin runes.', baseCost: 900, costMultiplier: 1.6 },
  { id: 'steam_power_plant', name: 'Steam Power Plant', description: 'Generates steam power from underground hot springs, powering all warren machinery and workshops.', baseCost: 3000, costMultiplier: 1.7 },
  { id: 'impossible_workshop', name: 'Impossible Workshop', description: 'A workshop that defies physics, where goblin engineers build things that shouldn\'t work but somehow do.', baseCost: 8000, costMultiplier: 2.0 },

  // Shenanigans (5)
  { id: 'disguise_studio', name: 'Disguise Studio', description: 'A cramped room full of wigs, masks, and prosthetics for infiltrating surface-dweller communities.', baseCost: 120, costMultiplier: 1.4 },
  { id: 'raiding_planning_room', name: 'Raid Planning Room', description: 'A sand-table war room where goblin chiefs plan raids on surface villages using stolen maps.', baseCost: 500, costMultiplier: 1.5 },
  { id: 'loot_sorting_hall', name: 'Loot Sorting Hall', description: 'A long hall with bins and scales for cataloging, sorting, and appraising stolen goods.', baseCost: 1500, costMultiplier: 1.6 },
  { id: 'tunnel_network_hub', name: 'Tunnel Network Hub', description: 'A central command post for coordinating all tunnel diggers and monitoring warren expansion.', baseCost: 3500, costMultiplier: 1.7 },
  { id: 'grand_heist_vault', name: 'Grand Heist Vault', description: 'An impenetrable vault for storing the warren\'s most valuable treasures, protected by the finest traps.', baseCost: 9000, costMultiplier: 2.0 },

  // Living Quarters (5)
  { id: 'dirt_burrow', name: 'Dirt Burrow', description: 'A simple sleeping burrow dug into the tunnel walls, lined with dry leaves and mushroom padding.', baseCost: 50, costMultiplier: 1.3 },
  { id: 'mushroom_hut', name: 'Mushroom Hut', description: 'A living structure grown from giant hollow mushrooms, providing warmth and shelter naturally.', baseCost: 200, costMultiplier: 1.4 },
  { id: 'crystal_bunker', name: 'Crystal Bunker', description: 'A reinforced chamber built from crystal blocks that regulates temperature and provides clean water.', baseCost: 700, costMultiplier: 1.5 },
  { id: 'obsidian_apartment', name: 'Obsidian Apartment', description: 'A luxurious multi-room underground dwelling with obsidian furniture and geothermal heating.', baseCost: 2500, costMultiplier: 1.7 },
  { id: 'royal_throne_room', name: 'Royal Throne Room', description: 'The ultimate goblin living space, featuring a throne made of gold and gems from a hundred heists.', baseCost: 10000, costMultiplier: 2.0 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: GW_ABILITIES — 22 Goblin Abilities
// ═══════════════════════════════════════════════════════════════════

export const GW_ABILITIES: readonly GWAbilityDef[] = [
  // Cunning (5)
  { id: 'sneak_attack', name: 'Sneak Attack', description: 'Strike from the shadows with devastating precision, dealing triple damage to unaware targets.', cooldown: 20, power: 25, element: 'cunning' },
  { id: 'distracting_clatter', name: 'Distracting Clatter', description: 'Throw a handful of metal scraps to create a loud distraction, drawing enemies away from your position.', cooldown: 15, power: 10, element: 'cunning' },
  { id: 'mimic_voice', name: 'Mimic Voice', description: 'Perfectly imitate the voice of any creature you have heard, tricking enemies into opening doors or revealing secrets.', cooldown: 30, power: 15, element: 'cunning' },
  { id: 'shadow_bluff', name: 'Shadow Bluff', description: 'Create illusory duplicates of yourself that confuse enemies and draw their attacks away from the real you.', cooldown: 25, power: 20, element: 'cunning' },
  { id: 'master_plan', name: 'Master Plan', description: 'Reveal the optimal path through any challenge, temporarily boosting all goblins\' intelligence and coordination.', cooldown: 60, power: 40, element: 'cunning' },

  // Trap (5)
  { id: 'quick_snare', name: 'Quick Snare', description: 'Instantly deploy a basic snare trap at your feet to slow pursuing enemies.', cooldown: 10, power: 12, element: 'trap' },
  { id: 'trap_insight', name: 'Trap Insight', description: 'Reveal all hidden traps and mechanisms within a large radius, including enemy traps.', cooldown: 20, power: 18, element: 'trap' },
  { id: 'chain_reaction', name: 'Chain Reaction', description: 'Trigger all traps in the current tunnel system simultaneously for devastating area damage.', cooldown: 45, power: 50, element: 'trap' },
  { id: 'trap_rewire', name: 'Trap Rewire', description: 'Take control of an enemy trap, converting it to work for your warren instead.', cooldown: 30, power: 35, element: 'trap' },
  { id: 'fortress_mode', name: 'Fortress Mode', description: 'Activate all defensive traps and seal all entrances, turning the warren into an impenetrable fortress.', cooldown: 90, power: 60, element: 'trap' },

  // Invention (5)
  { id: 'jury_rig', name: 'Jury Rig', description: 'Rapidly assemble a temporary device from nearby scrap, creating a random useful contraption.', cooldown: 15, power: 14, element: 'invention' },
  { id: 'overcharge', name: 'Overcharge', description: 'Pump excess power into any contraption or machine, temporarily doubling its output at the risk of breakdown.', cooldown: 25, power: 30, element: 'invention' },
  { id: 'self_repair', name: 'Self Repair', description: 'Activate automatic repair systems on all contraptions in the warren, restoring their durability.', cooldown: 40, power: 25, element: 'invention' },
  { id: 'emergency_teleporter', name: 'Emergency Teleporter', description: 'Activate a pre-placed teleporter beacon to instantly return to the warren from any location.', cooldown: 60, power: 20, element: 'invention' },
  { id: 'warren_ai', name: 'Warren AI', description: 'Activate an artificial intelligence system that manages the entire warren autonomously for a period.', cooldown: 120, power: 80, element: 'invention' },

  // Combat (4)
  { id: 'goblin_rush', name: 'Goblin Rush', description: 'A frenzied charge attack where all goblins swarm the target simultaneously with overwhelming numbers.', cooldown: 20, power: 30, element: 'combat' },
  { id: 'dirty_fighting', name: 'Dirty Fighting', description: 'Kick dust, throw sand, bite, and claw — a chaotic combination of underhanded combat techniques.', cooldown: 12, power: 22, element: 'combat' },
  { id: 'war_cry', name: 'War Cry', description: 'Let out a terrifying goblin war cry that demoralizes enemies and emboldens allies simultaneously.', cooldown: 35, power: 35, element: 'combat' },
  { id: 'berserk_frenzy', name: 'Berserk Frenzy', description: 'Enter a berserk state that triples attack power but reduces defense. The ultimate goblin combat ability.', cooldown: 70, power: 55, element: 'combat' },

  // Utility (3)
  { id: 'darkvision', name: 'Darkvision', description: 'Enhance all goblins\' night vision to see perfectly in complete darkness for an extended duration.', cooldown: 30, power: 10, element: 'utility' },
  { id: 'tunnel_sense', name: 'Tunnel Sense', description: 'Feel vibrations through the rock to detect the size, distance, and movement of anything in the tunnels.', cooldown: 20, power: 15, element: 'utility' },
  { id: 'escape_hatch', name: 'Escape Hatch', description: 'Instantly create a small escape tunnel to a safe location, leaving a collapsing tunnel behind you.', cooldown: 50, power: 25, element: 'utility' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: GW_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const GW_ACHIEVEMENTS: readonly GWAchievementDef[] = [
  { id: 'gw_ach_first_dig', name: 'First Dig', description: 'Dig your very first tunnel in the warren.', condition: 'totalDug >= 1', reward: '50 gold, 10 loot' },
  { id: 'gw_ach_tunnel_rat', name: 'Tunnel Rat', description: 'Dig all 8 warren tunnels.', condition: 'totalDug >= 8', reward: '500 gold, 100 loot' },
  { id: 'gw_ach_first_goblin', name: 'First Recruit', description: 'Recruit your first goblin to the warren.', condition: 'goblins.length >= 1', reward: '30 gold' },
  { id: 'gw_ach_goblin_army', name: 'Goblin Army', description: 'Have 20 goblins in your warren.', condition: 'goblins.length >= 20', reward: '300 gold, 50 loot' },
  { id: 'gw_ach_full_horde', name: 'Full Horde', description: 'Have 35 goblins in your warren.', condition: 'goblins.length >= 35', reward: '2000 gold, 200 loot' },
  { id: 'gw_ach_trap_setter', name: 'Trap Setter', description: 'Build your first trap mechanism.', condition: 'totalTrapsBuilt >= 1', reward: '40 gold' },
  { id: 'gw_ach_trap_master_30', name: 'Trap Master', description: 'Build all 30 types of trap mechanisms.', condition: 'totalTrapsBuilt >= 30', reward: '800 gold, 150 loot' },
  { id: 'gw_ach_first_raid', name: 'First Raid', description: 'Launch your first raid on a surface target.', condition: 'totalRaids >= 1', reward: '60 gold, 20 loot' },
  { id: 'gw_ach_raid_looter', name: 'Raid Looter', description: 'Accumulate 500 total loot from raids.', condition: 'totalLootStolen >= 500', reward: '400 gold' },
  { id: 'gw_ach_plunder_king', name: 'Plunder King', description: 'Accumulate 5000 total loot from raids.', condition: 'totalLootStolen >= 5000', reward: '3000 gold' },
  { id: 'gw_ach_workshop_5', name: 'Apprentice Builder', description: 'Build 5 different workshops.', condition: 'workshops.length >= 5', reward: '200 gold' },
  { id: 'gw_ach_workshop_15', name: 'Master Builder', description: 'Build 15 different workshops.', condition: 'workshops.length >= 15', reward: '1000 gold' },
  { id: 'gw_ach_workshop_25', name: 'Warren Architect', description: 'Build all 25 workshops.', condition: 'workshops.length >= 25', reward: '5000 gold, 300 loot' },
  { id: 'gw_ach_first_contraption', name: 'First Invention', description: 'Build your first contraption.', condition: 'totalContraptions >= 1', reward: '50 gold' },
  { id: 'gw_ach_contraption_10', name: 'Tinkerer', description: 'Build 10 different contraptions.', condition: 'totalContraptions >= 10', reward: '600 gold' },
  { id: 'gw_ach_legendary_goblin', name: 'Legendary recruit', description: 'Recruit a legendary goblin.', condition: 'hasLegendary >= 1', reward: '1500 gold, 100 loot' },
  { id: 'gw_ach_warren_level_25', name: 'Warren Elder', description: 'Reach warren level 25.', condition: 'warrenLevel >= 25', reward: '800 gold' },
  { id: 'gw_ach_warren_level_50', name: 'Underground Emperor', description: 'Reach maximum warren level 50.', condition: 'warrenLevel >= 50', reward: '5000 gold, 500 loot' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: GW_TITLES — 8 Warren Titles
// ═══════════════════════════════════════════════════════════════════

export const GW_TITLES: readonly GWTitleDef[] = [
  { id: 'gw_title_tunnel_rat', name: 'Tunnel Rat', description: 'A lowly goblin who has just begun their journey through the underground. Every legend starts in the mud.', requiredLevel: 1, requiredTunnels: 0 },
  { id: 'gw_title_tunnel_digger', name: 'Tunnel Digger', description: 'A reliable goblin who has proven their worth by expanding the warren\'s tunnel network. The warren grows because of you.', requiredLevel: 5, requiredTunnels: 2 },
  { id: 'gw_title_trap Setter', name: 'Trap Setter', description: 'A cunning goblin who has mastered the art of trap deployment. No intruder enters your tunnels unchallenged.', requiredLevel: 10, requiredTunnels: 3 },
  { id: 'gw_title_raid_leader', name: 'Raid Leader', description: 'A bold goblin who has led successful raids on the surface world. The villagers above whisper your name with fear.', requiredLevel: 15, requiredTunnels: 4 },
  { id: 'gw_title_warren_overseer', name: 'Warren Overseer', description: 'A respected goblin who manages the entire warren\'s operations. From mining to traps, nothing escapes your attention.', requiredLevel: 22, requiredTunnels: 5 },
  { id: 'gw_title_chief_engineer', name: 'Chief Engineer', description: 'The mastermind behind the warren\'s mechanical marvels. Your contraptions are the envy of every goblin engineer.', requiredLevel: 30, requiredTunnels: 6 },
  { id: 'gw_title_warlord', name: 'Goblin Warlord', description: 'A fearsome goblin commander whose raids have become legendary. Entire kingdoms tremble at the mention of your warren.', requiredLevel: 40, requiredTunnels: 7 },
  { id: 'gw_title_royalty', name: 'Goblin King/Queen', description: 'The supreme ruler of the entire goblin underground. Your warren stretches beneath mountains and kingdoms alike.', requiredLevel: 50, requiredTunnels: 8 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: GW_CONTRAPTIONS — 15 Mechanical Goblin Inventions
// ═══════════════════════════════════════════════════════════════════

export const GW_CONTRAPTIONS: readonly GWContraptionDef[] = [
  // Transport (3)
  { id: 'mine_cart_express', name: 'Mine Cart Express', description: 'A gravity-powered rail cart system for rapid transit between tunnel sections. Seats up to six goblins.', contraptionType: 'transport', rarity: 'common', baseCost: 120, power: 15 },
  { id: 'drill_submarine', name: 'Drill Submarine', description: 'A burrowing vehicle that tunnels through solid rock, allowing exploration of new areas without manual digging.', contraptionType: 'transport', rarity: 'rare', baseCost: 800, power: 45 },
  { id: 'magma_boat', name: 'Magma Boat', description: 'A boat that sails on underground lava flows, granting access to volcanic tunnel systems previously unreachable.', contraptionType: 'transport', rarity: 'legendary', baseCost: 3000, power: 100 },

  // Weapon (3)
  { id: 'spear_launcher', name: 'Spear Launcher', description: 'A spring-loaded mechanism that fires sharpened iron spears at high velocity. Effective against armored targets.', contraptionType: 'weapon', rarity: 'common', baseCost: 150, power: 20 },
  { id: 'rocketchain_gun', name: 'Rocket Chain Gun', description: 'A multi-barreled device that launches chains of linked projectiles, creating a devastating sweeping attack.', contraptionType: 'weapon', rarity: 'epic', baseCost: 1500, power: 70 },
  { id: 'doomsday_cannon', name: 'Doomsday Cannon', description: 'The most powerful goblin weapon ever built. A massive cannon that fires explosive shells capable of breaching castle walls.', contraptionType: 'weapon', rarity: 'legendary', baseCost: 5000, power: 120 },

  // Defense (3)
  { id: 'portcullis_gate', name: 'Portcullis Gate', description: 'A heavy iron gate that drops automatically when enemies are detected, sealing off tunnel sections.', contraptionType: 'defense', rarity: 'common', baseCost: 100, power: 18 },
  { id: 'auto_turret', name: 'Auto Turret', description: 'A self-aiming crossbow turret mounted on the tunnel ceiling that fires at any non-goblin creature that approaches.', contraptionType: 'defense', rarity: 'rare', baseCost: 600, power: 40 },
  { id: 'warren_shield', name: 'Warren Shield Generator', description: 'Generates a protective energy field around the entire warren, repelling intruders and deflecting projectiles.', contraptionType: 'defense', rarity: 'epic', baseCost: 2000, power: 85 },

  // Utility (3)
  { id: 'torch_beacon', name: 'Torch Beacon', description: 'A refillable torch system that provides light to dark tunnel sections. Simple but essential for warren operations.', contraptionType: 'utility', rarity: 'common', baseCost: 40, power: 5 },
  { id: 'ore_sifter', name: 'Ore Sifter', description: 'An automated sifting machine that separates valuable minerals from worthless rock, increasing mining efficiency.', contraptionType: 'utility', rarity: 'uncommon', baseCost: 250, power: 25 },
  { id: 'loot_conveyor', name: 'Loot Conveyor Belt', description: 'A network of conveyor belts that automatically transports loot from raid sites to the sorting hall.', contraptionType: 'utility', rarity: 'rare', baseCost: 700, power: 35 },

  // Surveillance (3)
  { id: 'listening_ear', name: 'Listening Ear', description: 'A large conical device mounted on tunnel walls that amplifies distant sounds, acting as an early warning system.', contraptionType: 'surveillance', rarity: 'uncommon', baseCost: 180, power: 15 },
  { id: 'periscope_nest', name: 'Periscope Nest', description: 'A network of mirrors and lenses that allow goblins to observe surface activities from deep underground.', contraptionType: 'surveillance', rarity: 'rare', baseCost: 500, power: 30 },
  { id: 'spy_crystal_ball', name: 'Spy Crystal Ball', description: 'An enchanted crystal that shows real-time images of any location the user has previously visited.', contraptionType: 'surveillance', rarity: 'epic', baseCost: 1800, power: 60 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: GW_RAIDS — 12 Raid Events
// ═══════════════════════════════════════════════════════════════════

export const GW_RAIDS: readonly GWRaidDef[] = [
  { id: 'raid_chicken_coop', name: 'Chicken Coop Raid', description: 'A nighttime raid on a farmer\'s chicken coop. Simple and low-risk, perfect for training new raiders.', target: 'farm', difficulty: 1, rewards: ['raw_chicken', 'feathers', 'eggs'], minGoblins: 2 },
  { id: 'raid_vegetable_patch', name: 'Vegetable Patch Raid', description: 'Sneak into a village garden at night and steal as many vegetables as possible before dawn.', target: 'farm', difficulty: 1, rewards: ['potatoes', 'carrots', 'cabbage'], minGoblins: 2 },
  { id: 'raid_bakery_heist', name: 'Bakery Heist', description: 'Break into the village bakery and steal fresh bread and pastries. The smells make this the most popular raid.', target: 'village', difficulty: 2, rewards: ['fresh_bread', 'pastries', 'sugar'], minGoblins: 3 },
  { id: 'raid_wine_cellar', name: 'Wine Cellar Heist', description: 'A daring raid into a nobleman\'s wine cellar. The challenge is getting in quietly without waking the guards.', target: 'village', difficulty: 3, rewards: ['wine_barrels', 'cheese', 'silver_cups'], minGoblins: 4 },
  { id: 'raid_merchant_caravan', name: 'Merchant Caravan Ambush', description: 'Ambush a traveling merchant caravan on a forest road. Rich pickings but well-guarded cargo.', target: 'caravan', difficulty: 4, rewards: ['silk', 'spices', 'gold_coins'], minGoblins: 6 },
  { id: 'raid_blacksmith_shop', name: 'Blacksmith Shop Heist', description: 'Break into the village blacksmith and steal tools, weapons, and raw metals. Heavy but valuable loot.', target: 'village', difficulty: 3, rewards: ['iron_tools', 'swords', 'steel_ingots'], minGoblins: 5 },
  { id: 'raid_mining_outpost', name: 'Mining Outpost Raid', description: 'Attack a dwarven mining outpost and steal their excavated gems and ore. Dwarves are fierce defenders.', target: 'mine', difficulty: 5, rewards: ['gemstones', 'mithril', 'dwarven_tools'], minGoblins: 8 },
  { id: 'raid_temple_treasury', name: 'Temple Treasury Heist', description: 'Infiltrate a temple treasury and steal religious artifacts and gold offerings. Cursed items may be among the loot.', target: 'temple', difficulty: 6, rewards: ['golden_idol', 'sacred_scroll', 'blessed_water'], minGoblins: 10 },
  { id: 'raid_fishing_village', name: 'Fishing Village Raid', description: 'A coastal raid on a small fishing village. The goblins must work quickly before the town guard arrives.', target: 'port', difficulty: 4, rewards: ['salted_fish', 'pearls', 'netting'], minGoblins: 6 },
  { id: 'raid_knight_castle', name: 'Castle Raid', description: 'The boldest of all raids — infiltrate a knight\'s castle and steal from the armory and treasury.', target: 'castle', difficulty: 8, rewards: ['plate_armor', 'castle_keys', 'crown_jewels'], minGoblins: 15 },
  { id: 'raid_wizard_tower', name: 'Wizard Tower Heist', description: 'Sneak into a wizard\'s tower and steal magical components. The magic wards make this extremely dangerous.', target: 'temple', difficulty: 7, rewards: ['spell_components', 'magic_scroll', 'enchanted_ring'], minGoblins: 12 },
  { id: 'raid_imperial_fortress', name: 'Imperial Fortress Assault', description: 'The ultimate raid — assault the imperial fortress itself. Requires maximum goblin forces and flawless coordination.', target: 'fortress', difficulty: 10, rewards: ['imperial_standard', 'emperor_chalice', 'war_chest'], minGoblins: 20 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: ZUSTAND STORE WITH PERSIST MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════

const GW_MAX_ENERGY = 200
const GW_INITIAL_GOLD = 100
const GW_INITIAL_LOOT = 0
const GW_INITIAL_TRAP_IRON = 10
const GW_INITIAL_MUSHROOM_SPORES = 5

const useGWStore = create<GWFullStore>()(
  persist(
    (set, get) => ({
      // ── State ─────────────────────────────────────────────────
      goblins: [],
      tunnels: {},
      traps: [],
      workshops: [],
      contraptions: [],
      achievements: [],
      currentTitle: 'gw_title_tunnel_rat',
      warrenLevel: 1,
      warrenExp: 0,
      gold: GW_INITIAL_GOLD,
      loot: GW_INITIAL_LOOT,
      trapIron: GW_INITIAL_TRAP_IRON,
      mushroomSpores: GW_INITIAL_MUSHROOM_SPORES,
      totalDug: 0,
      totalTrained: 0,
      totalTrapsBuilt: 0,
      totalContraptions: 0,
      totalRaids: 0,
      totalLootStolen: 0,
      activeTunnelId: null,
      activeRaidId: null,
      raidTimer: 0,
      fortificationLevel: 0,
      sabotageCharges: 0,

      // ── digTunnel ──────────────────────────────────────────────
      digTunnel: (tunnelId: string): boolean => {
        const state = get()
        const tunnel = GW_TUNNELS.find((t) => t.id === tunnelId)
        if (!tunnel) return false
        if (state.warrenLevel < tunnel.minLevel) return false
        if (state.tunnels[tunnelId]?.dug) return false

        const digCost = Math.floor(tunnel.depth * 2)
        if (state.gold < digCost) return false

        set((prev) => ({
          tunnels: {
            ...prev.tunnels,
            [tunnelId]: { dug: true, depth: tunnel.depth },
          },
          gold: prev.gold - digCost,
          warrenExp: prev.warrenExp + Math.floor(tunnel.depth * 1.5),
          totalDug: prev.totalDug + 1,
          warrenLevel: gwLevelFromXp(prev.warrenExp + Math.floor(tunnel.depth * 1.5)),
        }))
        return true
      },

      // ── buildTrap ──────────────────────────────────────────────
      buildTrap: (trapDefId: string): boolean => {
        const state = get()
        const trapDef = GW_TRAPS.find((t) => t.id === trapDefId)
        if (!trapDef) return false
        if (state.gold < trapDef.baseCost) return false
        if (state.trapIron < Math.floor(trapDef.baseCost / 10)) return false

        set((prev) => ({
          traps: [
            ...prev.traps,
            {
              id: gwGenerateId(),
              trapDefId: trapDef.id,
              armed: true,
              level: 1,
              deployedAt: Date.now(),
            },
          ],
          gold: prev.gold - trapDef.baseCost,
          trapIron: prev.trapIron - Math.floor(trapDef.baseCost / 10),
          warrenExp: prev.warrenExp + Math.floor(trapDef.baseCost * 0.5),
          totalTrapsBuilt: prev.totalTrapsBuilt + 1,
          warrenLevel: gwLevelFromXp(prev.warrenExp + Math.floor(trapDef.baseCost * 0.5)),
        }))
        return true
      },

      // ── trainGoblin ────────────────────────────────────────────
      trainGoblin: (instanceId: string): boolean => {
        const state = get()
        const goblin = state.goblins.find((g) => g.id === instanceId)
        if (!goblin) return false
        if (goblin.level >= 10) return false

        const trainCost = Math.floor(20 * Math.pow(1.3, goblin.level))
        if (state.gold < trainCost) return false

        set((prev) => ({
          goblins: prev.goblins.map((g) =>
            g.id === instanceId
              ? { ...g, level: g.level + 1, trainedCount: g.trainedCount + 1 }
              : g
          ),
          gold: prev.gold - trainCost,
          warrenExp: prev.warrenExp + Math.floor(trainCost * 0.3),
          totalTrained: prev.totalTrained + 1,
          warrenLevel: gwLevelFromXp(prev.warrenExp + Math.floor(trainCost * 0.3)),
        }))
        return true
      },

      // ── useAbility ─────────────────────────────────────────────
      useAbility: (abilityId: string): boolean => {
        const state = get()
        const ability = GW_ABILITIES.find((a) => a.id === abilityId)
        if (!ability) return false
        if (state.gold < Math.floor(ability.power * 0.5)) return false

        set((prev) => ({
          gold: prev.gold - Math.floor(ability.power * 0.5),
          warrenExp: prev.warrenExp + ability.power,
          warrenLevel: gwLevelFromXp(prev.warrenExp + ability.power),
        }))
        return true
      },

      // ── launchRaid ─────────────────────────────────────────────
      launchRaid: (raidId: string): boolean => {
        const state = get()
        const raid = GW_RAIDS.find((r) => r.id === raidId)
        if (!raid) return false
        if (state.goblins.length < raid.minGoblins) return false
        if (state.activeRaidId !== null) return false
        if (state.fortificationLevel < 1 && raid.difficulty >= 5) return false

        const raidCost = Math.floor(raid.difficulty * 30)
        if (state.gold < raidCost) return false

        const lootGain = Math.floor(raid.difficulty * 15 * (1 + state.goblins.length * 0.05))

        set((prev) => ({
          activeRaidId: raidId,
          raidTimer: Math.floor(raid.difficulty * 10),
          gold: prev.gold - raidCost,
          loot: prev.loot + lootGain,
          totalRaids: prev.totalRaids + 1,
          totalLootStolen: prev.totalLootStolen + lootGain,
          warrenExp: prev.warrenExp + Math.floor(raid.difficulty * 20),
          warrenLevel: gwLevelFromXp(prev.warrenExp + Math.floor(raid.difficulty * 20)),
        }))
        return true
      },

      // ── inventContraption ──────────────────────────────────────
      inventContraption: (contraptionDefId: string): boolean => {
        const state = get()
        const def = GW_CONTRAPTIONS.find((c) => c.id === contraptionDefId)
        if (!def) return false
        if (state.gold < def.baseCost) return false
        if (state.trapIron < Math.floor(def.baseCost / 5)) return false
        if (state.contraptions.some((c) => c.contraptionDefId === contraptionDefId && c.built)) return false

        set((prev) => ({
          contraptions: [
            ...prev.contraptions,
            {
              id: gwGenerateId(),
              contraptionDefId: def.id,
              built: true,
              active: true,
              durability: 100,
              maxDurability: 100,
            },
          ],
          gold: prev.gold - def.baseCost,
          trapIron: prev.trapIron - Math.floor(def.baseCost / 5),
          totalContraptions: prev.totalContraptions + 1,
          warrenExp: prev.warrenExp + Math.floor(def.baseCost * 0.4),
          warrenLevel: gwLevelFromXp(prev.warrenExp + Math.floor(def.baseCost * 0.4)),
        }))
        return true
      },

      // ── fortifyWarren ──────────────────────────────────────────
      fortifyWarren: (): boolean => {
        const state = get()
        const cost = Math.floor(100 * Math.pow(1.8, state.fortificationLevel))
        if (state.gold < cost) return false
        if (state.trapIron < Math.floor(cost / 3)) return false

        set((prev) => ({
          fortificationLevel: prev.fortificationLevel + 1,
          gold: prev.gold - cost,
          trapIron: prev.trapIron - Math.floor(cost / 3),
          warrenExp: prev.warrenExp + Math.floor(cost * 0.3),
          warrenLevel: gwLevelFromXp(prev.warrenExp + Math.floor(cost * 0.3)),
        }))
        return true
      },

      // ── tradeLoot ──────────────────────────────────────────────
      tradeLoot: (lootAmount: number, resourceType: string): boolean => {
        const state = get()
        if (lootAmount <= 0) return false
        if (state.loot < lootAmount) return false

        const conversionRate = 5
        const goldGain = lootAmount * conversionRate

        set((prev) => {
          if (resourceType === 'trapIron') {
            return {
              loot: prev.loot - lootAmount,
              trapIron: prev.trapIron + Math.floor(lootAmount / 2),
            }
          }
          if (resourceType === 'mushroomSpores') {
            return {
              loot: prev.loot - lootAmount,
              mushroomSpores: prev.mushroomSpores + Math.floor(lootAmount / 3),
            }
          }
          return {
            loot: prev.loot - lootAmount,
            gold: prev.gold + goldGain,
          }
        })
        return true
      },

      // ── recruitChief ───────────────────────────────────────────
      recruitChief: (chiefDefId: string): boolean => {
        const state = get()
        const def = GW_GOBLINS.find((g) => g.id === chiefDefId)
        if (!def) return false
        if (def.role !== 'Chief') return false
        if (state.warrenLevel < 10) return false
        if (state.gold < 500) return false

        set((prev) => ({
          goblins: [
            ...prev.goblins,
            {
              id: gwGenerateId(),
              goblinDefId: def.id,
              name: def.name,
              level: 1,
              trainedCount: 0,
              acquiredAt: Date.now(),
            },
          ],
          gold: prev.gold - 500,
          warrenExp: prev.warrenExp + 200,
          warrenLevel: gwLevelFromXp(prev.warrenExp + 200),
        }))
        return true
      },

      // ── ambushParty ────────────────────────────────────────────
      ambushParty: (targetType: string): boolean => {
        const state = get()
        if (state.goblins.length < 3) return false
        if (state.sabotageCharges < 1) return false

        const ambushLoot = Math.floor(20 + state.goblins.length * 5)
        const expGain = Math.floor(30 + state.goblins.length * 3)

        set((prev) => ({
          sabotageCharges: prev.sabotageCharges - 1,
          loot: prev.loot + ambushLoot,
          totalLootStolen: prev.totalLootStolen + ambushLoot,
          warrenExp: prev.warrenExp + expGain,
          warrenLevel: gwLevelFromXp(prev.warrenExp + expGain),
        }))
        return true
      },

      // ── gwClaimAchievement ─────────────────────────────────────
      gwClaimAchievement: (achievementId: string): boolean => {
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        const ach = GW_ACHIEVEMENTS.find((a) => a.id === achievementId)
        if (!ach) return false
        if (!gwCheckAchievementCondition(state, achievementId)) return false

        set((prev) => ({
          achievements: [...prev.achievements, achievementId],
          gold: prev.gold + 100,
          loot: prev.loot + 25,
        }))
        return true
      },

      // ── gwUnlockTitle ──────────────────────────────────────────
      gwUnlockTitle: (titleId: string): boolean => {
        const state = get()
        const title = GW_TITLES.find((t) => t.id === titleId)
        if (!title) return false
        if (state.warrenLevel < title.requiredLevel) return false
        if (state.totalDug < title.requiredTunnels) return false

        set((prev) => ({
          currentTitle: titleId,
        }))
        return true
      },
    }),
    {
      name: 'goblin-warren-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: INTERNAL HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function gwCheckAchievementCondition(state: GWStoreState, achievementId: string): boolean {
  switch (achievementId) {
    case 'gw_ach_first_dig':
      return state.totalDug >= 1
    case 'gw_ach_tunnel_rat':
      return state.totalDug >= 8
    case 'gw_ach_first_goblin':
      return state.goblins.length >= 1
    case 'gw_ach_goblin_army':
      return state.goblins.length >= 20
    case 'gw_ach_full_horde':
      return state.goblins.length >= 35
    case 'gw_ach_trap_setter':
      return state.totalTrapsBuilt >= 1
    case 'gw_ach_trap_master_30':
      return state.totalTrapsBuilt >= 30
    case 'gw_ach_first_raid':
      return state.totalRaids >= 1
    case 'gw_ach_raid_looter':
      return state.totalLootStolen >= 500
    case 'gw_ach_plunder_king':
      return state.totalLootStolen >= 5000
    case 'gw_ach_workshop_5':
      return state.workshops.length >= 5
    case 'gw_ach_workshop_15':
      return state.workshops.length >= 15
    case 'gw_ach_workshop_25':
      return state.workshops.length >= 25
    case 'gw_ach_first_contraption':
      return state.totalContraptions >= 1
    case 'gw_ach_contraption_10':
      return state.totalContraptions >= 10
    case 'gw_ach_legendary_goblin':
      return state.goblins.some((g) => {
        const def = GW_GOBLINS.find((d) => d.id === g.goblinDefId)
        return def !== undefined && def.rarity === 'legendary'
      })
    case 'gw_ach_warren_level_25':
      return state.warrenLevel >= 25
    case 'gw_ach_warren_level_50':
      return state.warrenLevel >= 50
    default:
      return false
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: GW_WARREN_EVENTS — Random Warren Encounters
// ═══════════════════════════════════════════════════════════════════

export interface GWWarrenEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly severity: number
  readonly effects: string[]
  readonly rewards: string[]
}

export const GW_WARREN_EVENTS: readonly GWWarrenEventDef[] = [
  {
    id: 'gw_evt_cave_in',
    name: 'Cave-In',
    description: 'A section of tunnel has collapsed, blocking passage and potentially trapping goblins inside.',
    severity: 3,
    effects: ['Blocks a random tunnel for 60 seconds', 'Reduces fortification by 1'],
    rewards: ['Exposes new ore deposits in the rubble'],
  },
  {
    id: 'gw_evt_underground_river',
    name: 'Underground River Discovery',
    description: 'Miners have broken through into an underground river system, revealing new areas and water resources.',
    severity: 1,
    effects: ['Unlocks water-based resources', 'Increases mushroom growth speed'],
    rewards: ['Access to river fish and water gems'],
  },
  {
    id: 'gw_evt_surface_explorer',
    name: 'Surface Explorer Intrusion',
    description: 'An explorer from the surface has stumbled upon a warren entrance. They must be dealt with before they report back.',
    severity: 4,
    effects: ['Timer before they escape', 'Alerts nearby village'],
    rewards: ['Confiscated explorer equipment and gold'],
  },
  {
    id: 'gw_evt_mushroom_bloom',
    name: 'Mushroom Bloom',
    description: 'A rare mushroom bloom event causes explosive fungal growth throughout the warren, providing abundant resources.',
    severity: 1,
    effects: ['Doubles mushroom resources for 5 minutes', 'Fills warren with healing spores'],
    rewards: ['Massive harvest of rare mushroom types'],
  },
  {
    id: 'gw_evt_goblin_civil_war',
    name: 'Goblin Civil War',
    description: 'Two rival goblin factions within the warren have broken into open conflict. Order must be restored quickly.',
    severity: 7,
    effects: ['Halves goblin work speed', 'Random traps may trigger on own goblins'],
    rewards: ['United goblins fight harder than before', 'Bonus morale'],
  },
  {
    id: 'gw_evt_ancient_artifact',
    name: 'Ancient Artifact Unearthed',
    description: 'Miners have unearthed an artifact from a long-dead underground civilization. Its power is unknown but immense.',
    severity: 2,
    effects: ['Grants a random ability to all goblins temporarily', 'May have side effects'],
    rewards: ['Permanent stat boost to all goblins', 'New contraption blueprint'],
  },
  {
    id: 'gw_evt_rat_swarm',
    name: 'Cave Rat Swarm',
    description: 'An enormous swarm of cave rats has invaded the warren from a collapsed side tunnel, eating food stores and damaging traps.',
    severity: 3,
    effects: ['Consumes loot reserves', 'Damages 2-3 random traps'],
    rewards: ['Rat pelts and meat for trading'],
  },
  {
    id: 'gw_evt_magma_leak',
    name: 'Magma Leak',
    description: 'A crack in the deep tunnels has allowed lava to begin seeping into the warren. The engineers must seal it before it spreads.',
    severity: 5,
    effects: ['Destroys workshops near the leak', 'Forces evacuation of lower tunnels'],
    rewards: ['Exposed fire opals and heat crystals in the cooled lava'],
  },
  {
    id: 'gw_evt_merchant_caravan',
    name: 'Underground Merchant Caravan',
    description: 'A caravan of underground-dwelling merchants has passed through the warren, offering rare goods at suspicious prices.',
    severity: 1,
    effects: ['Special shop available for 3 minutes', 'Prices are 50% higher than normal'],
    rewards: ['Access to rare materials and blueprints not found elsewhere'],
  },
  {
    id: 'gw_evt_dwarven_excavation',
    name: 'Dwarven Excavation',
    description: 'Dwarven miners are excavating nearby, getting dangerously close to the warren. Their tunnels may intersect with yours.',
    severity: 6,
    effects: ['Reveals map of nearby tunnels', 'Dwarves may discover warren entrance'],
    rewards: ['Stolen dwarven mining tools and blueprints'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: GW_TRAP_TYPE_COLORS — Trap Type Visual Theme
// ═══════════════════════════════════════════════════════════════════

export const GW_TRAP_TYPE_COLORS: Record<GWTrapType, string> = {
  mechanical: GW_COLOR_TRAP_IRON,
  pit: GW_COLOR_TUNNEL_BROWN,
  poison: GW_COLOR_MUSHROOM_PURPLE,
  explosive: GW_COLOR_GEMSTONE_RED,
  net: GW_COLOR_GOBLIN_GREEN,
  illusion: '#CE93D8',
}

export const GW_CONTRAPTION_TYPE_COLORS: Record<GWContraptionType, string> = {
  transport: GW_COLOR_TUNNEL_BROWN,
  weapon: GW_COLOR_GEMSTONE_RED,
  defense: GW_COLOR_TRAP_IRON,
  utility: GW_COLOR_TORCH_ORANGE,
  surveillance: GW_COLOR_MUSHROOM_PURPLE,
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: DEFAULT EXPORT HOOK
// ═══════════════════════════════════════════════════════════════════

export default function useGoblinWarren() {
  const store = useGWStore()

  // ── Getter: Tunnel Details (merged useMemo with [store]) ──────
  const { gwGetTunnelDetails, gwGetWarrenProgress } = useMemo(() => {
    const tunnelDetails = GW_TUNNELS.map((tunnel) => ({
      ...tunnel,
      dug: !!store.tunnels[tunnel.id]?.dug,
      unlocked: store.warrenLevel >= tunnel.minLevel,
      availableResources: tunnel.resources,
    }))
    const totalTunnels = GW_TUNNELS.length
    const dugTunnels = Object.values(store.tunnels).filter((t) => t.dug).length
    const warrenProgress = {
      totalTunnels,
      dugTunnels,
      percent: Math.floor((dugTunnels / totalTunnels) * 100),
      allDug: dugTunnels >= totalTunnels,
    }
    return { gwGetTunnelDetails: tunnelDetails, gwGetWarrenProgress: warrenProgress }
  }, [store])

  // ── Getter: Goblin Roster ────────────────────────────────────
  const gwGetGoblinRoster = useMemo(() => {
    return store.goblins.map((g) => {
      const def = GW_GOBLINS.find((d) => d.id === g.goblinDefId)
      const basePow = def ? def.basePower : 10
      const levelPow = Math.floor(basePow * (1 + g.level * 0.15))
      return {
        ...g,
        def,
        currentPower: levelPow,
        roleColor: def ? gwGetRoleColor(def.role) : GW_COLOR_TUNNEL_BROWN,
        rarityColor: def ? gwGetRarityColor(def.rarity) : '#9CA3AF',
      }
    })
  }, [store])

  // ── Getter: Trap Inventory ────────────────────────────────────
  const gwGetTrapInventory = useMemo(() => {
    return store.traps.map((t) => {
      const def = GW_TRAPS.find((d) => d.id === t.trapDefId)
      return {
        ...t,
        def,
        rarityColor: def ? gwGetRarityColor(def.rarity) : '#9CA3AF',
        currentPower: def ? Math.floor(def.power * (1 + t.level * 0.2)) : 0,
      }
    })
  }, [store])

  // ── Getter: Workshop List ─────────────────────────────────────
  const gwGetWorkshopList = useMemo(() => {
    return store.workshops.map((w) => {
      const def = GW_WORKSHOPS.find((d) => d.id === w.workshopDefId)
      return {
        ...w,
        def,
        upgradeCost: def
          ? Math.floor(def.baseCost * Math.pow(def.costMultiplier, w.level))
          : 0,
        maxed: w.level >= 10,
      }
    })
  }, [store])

  // ── Getter: Contraption Fleet ────────────────────────────────
  const gwGetContraptionFleet = useMemo(() => {
    return store.contraptions.map((c) => {
      const def = GW_CONTRAPTIONS.find((d) => d.id === c.contraptionDefId)
      return {
        ...c,
        def,
        healthPercent: Math.floor((c.durability / c.maxDurability) * 100),
        needsRepair: c.durability < c.maxDurability * 0.5,
        rarityColor: def ? gwGetRarityColor(def.rarity) : '#9CA3AF',
      }
    })
  }, [store])

  // ── Getter: Total Power ──────────────────────────────────────
  const gwGetTotalPower = useMemo(() => {
    let goblinPower = 0
    for (const g of store.goblins) {
      const def = GW_GOBLINS.find((d) => d.id === g.goblinDefId)
      if (!def) continue
      const rarityMult = gwRarityPower(def.rarity)
      goblinPower += Math.floor(def.basePower * rarityMult * (1 + g.level * 0.15))
    }
    const trapPower = store.traps.reduce(
      (sum, t) => {
        const def = GW_TRAPS.find((d) => d.id === t.trapDefId)
        return sum + (def ? def.power : 0)
      },
      0
    )
    const contraptionPower = store.contraptions.reduce(
      (sum, c) => {
        const def = GW_CONTRAPTIONS.find((d) => d.id === c.contraptionDefId)
        return sum + (def ? def.power : 0)
      },
      0
    )
    const total = goblinPower + trapPower + contraptionPower
    return { goblinPower, trapPower, contraptionPower, total }
  }, [store])

  // ── Getter: Raid Status ───────────────────────────────────────
  const gwGetRaidStatus = useMemo(() => {
    if (!store.activeRaidId) return { active: false, raid: null, timer: 0 }
    const raid = GW_RAIDS.find((r) => r.id === store.activeRaidId)
    return {
      active: true,
      raid: raid || null,
      timer: store.raidTimer,
      difficulty: raid ? raid.difficulty : 0,
    }
  }, [store.activeRaidId, store.raidTimer])

  // ── Getter: Active Raid ───────────────────────────────────────
  const gwGetActiveRaid = useMemo(() => {
    if (!store.activeRaidId) return null
    return GW_RAIDS.find((r) => r.id === store.activeRaidId) || null
  }, [store.activeRaidId])

  // ── Getter: Next Title ────────────────────────────────────────
  const gwGetNextTitle = useMemo(() => {
    const currentTitle = GW_TITLES.find((t) => t.id === store.currentTitle)
    const currentIndex = currentTitle ? GW_TITLES.indexOf(currentTitle) : -1
    if (currentIndex >= GW_TITLES.length - 1) return null
    return GW_TITLES[currentIndex + 1]
  }, [store.currentTitle])

  // ── Getter: Rarity Summary ────────────────────────────────────
  const gwGetRaritySummary = useMemo(() => {
    const summary: Record<GWRarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }
    for (const g of store.goblins) {
      const def = GW_GOBLINS.find((d) => d.id === g.goblinDefId)
      if (def) {
        summary[def.rarity] += 1
      }
    }
    return summary
  }, [store])

  // ── Getter: Unlocked Achievements ─────────────────────────────
  const gwGetUnlockedAchievements = useMemo(() => {
    const unlocked: GWAchievementDef[] = []
    const claimable: GWAchievementDef[] = []

    for (const ach of GW_ACHIEVEMENTS) {
      if (store.achievements.includes(ach.id)) {
        unlocked.push(ach)
      } else if (gwCheckAchievementCondition(store, ach.id)) {
        claimable.push(ach)
      }
    }

    return { unlocked, claimable, total: GW_ACHIEVEMENTS.length, progress: unlocked.length }
  }, [store])

  // ── Getter: Title Progress ────────────────────────────────────
  const gwGetTitleProgress = useMemo(() => {
    return GW_TITLES.map((title) => ({
      ...title,
      unlocked: store.warrenLevel >= title.requiredLevel && store.totalDug >= title.requiredTunnels,
      active: store.currentTitle === title.id,
      levelMet: store.warrenLevel >= title.requiredLevel,
      tunnelMet: store.totalDug >= title.requiredTunnels,
    }))
  }, [store.currentTitle, store.warrenLevel, store.totalDug])

  // ── Level Progress ────────────────────────────────────────────
  const gwLevelProgress = useMemo(() => {
    const current = gwXpForLevel(store.warrenLevel)
    return {
      level: store.warrenLevel,
      currentXp: store.warrenExp,
      xpToNext: current,
      maxLevel: store.warrenLevel >= GW_MAX_LEVEL,
      progressPercent:
        current > 0 ? Math.min(100, Math.floor((store.warrenExp / current) * 100)) : 0,
    }
  }, [store.warrenLevel, store.warrenExp])

  // ── Getter: Fortification Info ────────────────────────────────
  const gwGetFortificationInfo = useMemo(() => {
    const nextCost = Math.floor(100 * Math.pow(1.8, store.fortificationLevel))
    return {
      level: store.fortificationLevel,
      nextCost,
      ironCost: Math.floor(nextCost / 3),
      defenseBonus: store.fortificationLevel * 10,
      maxLevel: store.fortificationLevel >= 20,
    }
  }, [store.fortificationLevel])

  // ── Getter: Resource Summary ──────────────────────────────────
  const gwGetResourceSummary = useMemo(() => {
    return {
      gold: store.gold,
      loot: store.loot,
      trapIron: store.trapIron,
      mushroomSpores: store.mushroomSpores,
      sabotageCharges: store.sabotageCharges,
      totalLootStolen: store.totalLootStolen,
    }
  }, [store.gold, store.loot, store.trapIron, store.mushroomSpores, store.sabotageCharges, store.totalLootStolen])

  // ── Getter: Trap Type Summary ─────────────────────────────────
  const gwGetTrapTypeSummary = useMemo(() => {
    const summary: Record<GWTrapType, number> = {
      mechanical: 0,
      pit: 0,
      poison: 0,
      explosive: 0,
      net: 0,
      illusion: 0,
    }
    for (const t of store.traps) {
      const def = GW_TRAPS.find((d) => d.id === t.trapDefId)
      if (def) {
        summary[def.trapType] += 1
      }
    }
    return summary
  }, [store])

  // ── Getter: Available Raids ───────────────────────────────────
  const gwGetAvailableRaids = useMemo(() => {
    return GW_RAIDS.map((raid) => ({
      ...raid,
      canLaunch:
        store.goblins.length >= raid.minGoblins &&
        store.activeRaidId === null &&
        store.gold >= Math.floor(raid.difficulty * 30),
      goblinCount: store.goblins.length,
    }))
  }, [store])

  // ── Assemble gwAPI (Pattern A: direct constants) ──────────────
  const gwAPI = {
    // Constants
    GW_GOBLINS,
    GW_TUNNELS,
    GW_TRAPS,
    GW_WORKSHOPS,
    GW_ABILITIES,
    GW_ACHIEVEMENTS,
    GW_TITLES,
    GW_CONTRAPTIONS,
    GW_RAIDS,
    GW_WARREN_EVENTS,
    GW_RESOURCES,
    GW_ROLE_BONUSES,
    GW_TRAP_TYPE_COLORS,
    GW_CONTRAPTION_TYPE_COLORS,
    GW_COLOR_GOBLIN_GREEN,
    GW_COLOR_TUNNEL_BROWN,
    GW_COLOR_TRAP_IRON,
    GW_COLOR_MUSHROOM_PURPLE,
    GW_COLOR_GEMSTONE_RED,
    GW_COLOR_CAVE_MOSS,
    GW_COLOR_TORCH_ORANGE,
    GW_COLOR_GOLD_HOARD,

    // State
    goblins: store.goblins,
    tunnels: store.tunnels,
    traps: store.traps,
    workshops: store.workshops,
    contraptions: store.contraptions,
    achievements: store.achievements,
    currentTitle: store.currentTitle,
    warrenLevel: store.warrenLevel,
    warrenExp: store.warrenExp,
    gold: store.gold,
    loot: store.loot,
    trapIron: store.trapIron,
    mushroomSpores: store.mushroomSpores,
    totalDug: store.totalDug,
    totalTrained: store.totalTrained,
    totalTrapsBuilt: store.totalTrapsBuilt,
    totalContraptions: store.totalContraptions,
    totalRaids: store.totalRaids,
    totalLootStolen: store.totalLootStolen,
    activeTunnelId: store.activeTunnelId,
    activeRaidId: store.activeRaidId,
    raidTimer: store.raidTimer,
    fortificationLevel: store.fortificationLevel,
    sabotageCharges: store.sabotageCharges,

    // Actions
    digTunnel: store.digTunnel,
    buildTrap: store.buildTrap,
    trainGoblin: store.trainGoblin,
    useAbility: store.useAbility,
    launchRaid: store.launchRaid,
    inventContraption: store.inventContraption,
    fortifyWarren: store.fortifyWarren,
    tradeLoot: store.tradeLoot,
    recruitChief: store.recruitChief,
    ambushParty: store.ambushParty,
    gwClaimAchievement: store.gwClaimAchievement,
    gwUnlockTitle: store.gwUnlockTitle,

    // Getters
    gwGetTunnelDetails,
    gwGetWarrenProgress,
    gwGetGoblinRoster,
    gwGetTrapInventory,
    gwGetWorkshopList,
    gwGetContraptionFleet,
    gwGetTotalPower,
    gwGetRaidStatus,
    gwGetActiveRaid,
    gwGetNextTitle,
    gwGetRaritySummary,
    gwGetUnlockedAchievements,
    gwGetTitleProgress,
    gwLevelProgress,
    gwGetFortificationInfo,
    gwGetResourceSummary,
    gwGetTrapTypeSummary,
    gwGetAvailableRaids,
    gwGetRoleDigSpeed,
    gwGetRoleTrapEfficiency,
    gwGetRoleRaidPower,
    gwGetRoleInventSpeed,
    gwGetTrainCostMod,
  }

  return gwAPI
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 18: ADDITIONAL EXPORTED CONSTANTS & STATISTICS
// ═══════════════════════════════════════════════════════════════════

/** Total number of goblin types across all rarity tiers */
export const GW_TOTAL_GOBLIN_TYPES: number = GW_GOBLINS.length

/** Total number of trap mechanism types across all categories */
export const GW_TOTAL_TRAP_TYPES: number = GW_TRAPS.length

/** Total number of warren workshops */
export const GW_TOTAL_WORKSHOPS: number = GW_WORKSHOPS.length

/** Total number of goblin abilities */
export const GW_TOTAL_ABILITIES: number = GW_ABILITIES.length

/** Total number of warren tunnel networks */
export const GW_TOTAL_TUNNELS: number = GW_TUNNELS.length

/** Total number of achievements */
export const GW_TOTAL_ACHIEVEMENTS: number = GW_ACHIEVEMENTS.length

/** Total number of available titles */
export const GW_TOTAL_TITLES: number = GW_TITLES.length

/** Total number of contraption types */
export const GW_TOTAL_CONTRAPTIONS: number = GW_CONTRAPTIONS.length

/** Total number of raid event types */
export const GW_TOTAL_RAIDS: number = GW_RAIDS.length

/** Total number of underground resources */
export const GW_TOTAL_RESOURCES: number = GW_RESOURCES.length

/** Total number of warren event types */
export const GW_TOTAL_WARREN_EVENTS: number = GW_WARREN_EVENTS.length

/** Goblin roles available for recruitment */
export const GW_ROLES: readonly GWGoblinRole[] = [
  'Scout',
  'Shaman',
  'Warrior',
  'Trapper',
  'Miner',
  'Engineer',
  'Chief',
]

/** Trap type categories */
export const GW_TRAP_TYPES: readonly GWTrapType[] = [
  'mechanical',
  'pit',
  'poison',
  'explosive',
  'net',
  'illusion',
]

/** Contraption type categories */
export const GW_CONTRAPTION_TYPES: readonly GWContraptionType[] = [
  'transport',
  'weapon',
  'defense',
  'utility',
  'surveillance',
]

/** Raid target categories */
export const GW_RAID_TARGETS: readonly GWRaidTarget[] = [
  'village',
  'farm',
  'caravan',
  'castle',
  'mine',
  'temple',
  'port',
  'fortress',
]

/** Maximum workshop level */
export const GW_MAX_WORKSHOP_LEVEL: number = 10

/** Maximum fortification level */
export const GW_MAX_FORTIFICATION_LEVEL: number = 20

/** Maximum goblin level */
export const GW_MAX_GOBLIN_LEVEL: number = 10

/** Ability elements available */
export const GW_ABILITY_ELEMENTS: readonly string[] = [
  'cunning',
  'trap',
  'invention',
  'combat',
  'utility',
]

/** Summary statistics for the Goblin Warren module */
export const GW_MODULE_STATS = {
  goblinTypes: GW_GOBLINS.length,
  tunnelNetworks: GW_TUNNELS.length,
  trapMechanisms: GW_TRAPS.length,
  workshops: GW_WORKSHOPS.length,
  abilities: GW_ABILITIES.length,
  achievements: GW_ACHIEVEMENTS.length,
  titles: GW_TITLES.length,
  contraptions: GW_CONTRAPTIONS.length,
  raids: GW_RAIDS.length,
  resources: GW_RESOURCES.length,
  events: GW_WARREN_EVENTS.length,
  roles: GW_ROLES.length,
  trapTypes: GW_TRAP_TYPES.length,
  contraptionTypes: GW_CONTRAPTION_TYPES.length,
  raidTargets: GW_RAID_TARGETS.length,
} as const
