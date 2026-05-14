import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================
// Iron Bay (铁湾) — Industrial Harbor Forging & Trade Module
// ============================================================

// ─── Color Constants ────────────────────────────────────────────────────────────
export const IB_COLOR_IRON = '#48494B';
export const IB_COLOR_STEEL = '#71797E';
export const IB_COLOR_STEAM = '#E8E8E8';
export const IB_COLOR_COAL = '#2C3539';
export const IB_COLOR_COPPER = '#B87333';
export const IB_COLOR_FORGE = '#FF4500';
export const IB_COLOR_RUST = '#B7410E';
export const IB_COLOR_TITAN = '#878681';

// ─── Rarity Tiers ───────────────────────────────────────────────────────────────
type IBRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

const IB_RARITY_LABELS: Record<IBRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

const IB_RARITY_COLORS: Record<IBRarity, string> = {
  common: IB_COLOR_IRON,
  uncommon: IB_COLOR_COPPER,
  rare: IB_COLOR_STEEL,
  epic: IB_COLOR_FORGE,
  legendary: IB_COLOR_TITAN,
};

const IB_RARITY_MULTIPLIERS: Record<IBRarity, number> = {
  common: 1,
  uncommon: 1.5,
  rare: 2.2,
  epic: 3.5,
  legendary: 6,
};

// ─── Weapon Types ───────────────────────────────────────────────────────────────
type IBWeaponType = 'sword' | 'shield' | 'armor' | 'hammer' | 'tool';

const IB_WEAPON_TYPE_INFO: Record<IBWeaponType, { label: string; icon: string; color: string }> = {
  sword: { label: 'Sword', icon: '⚔️', color: IB_COLOR_FORGE },
  shield: { label: 'Shield', icon: '🛡️', color: IB_COLOR_STEEL },
  armor: { label: 'Armor', icon: '🛡️', color: IB_COLOR_IRON },
  hammer: { label: 'Hammer', icon: '🔨', color: IB_COLOR_RUST },
  tool: { label: 'Tool', icon: '🔧', color: IB_COLOR_COAL },
};

// ─── Ship Types ─────────────────────────────────────────────────────────────────
type IBShipType = 'trading' | 'warship' | 'explorer' | 'transport' | 'patrol' | 'flagship';

// ─── Interfaces ─────────────────────────────────────────────────────────────────

export interface IBDockDef {
  id: string;
  name: string;
  description: string;
  capacity: number;
  unlockLevel: number;
}

export interface IBWeaponDef {
  id: string;
  name: string;
  rarity: IBRarity;
  type: IBWeaponType;
  power: number;
  durability: number;
  description: string;
}

export interface IBShipDef {
  id: string;
  name: string;
  rarity: IBRarity;
  type: IBShipType;
  capacity: number;
  speed: number;
  durability: number;
  description: string;
}

export interface IBMaterialDef {
  id: string;
  name: string;
  rarity: IBRarity;
  source: string;
  description: string;
}

export interface IBStructureDef {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  type: 'forge' | 'warehouse' | 'drydock' | 'workshop' | 'tower' | 'lighthouse';
}

export interface IBBlueprintDef {
  id: string;
  name: string;
  description: string;
  requiredMaterials: { materialId: string; amount: number }[];
  result: string;
  rarity: IBRarity;
}

export interface IBAbilityDef {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  power: number;
}

export interface IBAchievementDef {
  id: string;
  name: string;
  description: string;
}

export interface IBTitleDef {
  id: string;
  name: string;
  requirement: number;
  description: string;
}

export interface IBTradeRouteDef {
  id: string;
  name: string;
  description: string;
  distance: number;
  rewards: string[];
  risks: string[];
}

// ─── Instance Types ─────────────────────────────────────────────────────────────

interface IBWeaponInstance {
  instanceId: string;
  weaponDefId: string;
  name: string;
  rarity: IBRarity;
  type: IBWeaponType;
  power: number;
  durability: number;
  maxDurability: number;
  level: number;
  forgedAt: number;
}

interface IBShipInstance {
  instanceId: string;
  shipDefId: string;
  name: string;
  rarity: IBRarity;
  type: IBShipType;
  capacity: number;
  speed: number;
  durability: number;
  maxDurability: number;
  dockedAt: string | null;
  builtAt: number;
}

interface IBStructureInstance {
  instanceId: string;
  structureDefId: string;
  level: number;
  builtAt: number;
}

interface IBTradeRouteInstance {
  instanceId: string;
  routeDefId: string;
  launchedAt: number;
  shipInstanceId: string | null;
  completed: boolean;
}

// ─── State Interface ────────────────────────────────────────────────────────────

interface IBState {
  ownedWeapons: IBWeaponInstance[];
  dockedShips: IBShipInstance[];
  materials: Record<string, number>;
  structures: IBStructureInstance[];
  blueprints: string[];
  tradeRoutes: IBTradeRouteInstance[];
  achievements: string[];
  currentTitle: string;
  bayLevel: number;
  bayExp: number;
  gold: number;
  ironEnergy: number;
  steamPressure: number;
  totalForged: number;
  totalShipsBuilt: number;
  totalTrades: number;
  totalUpgrades: number;
  activeDockId: string | null;
  activeTradeId: string | null;
}

// ─── IB_DOCKS: 8 Iron Bay Docks ────────────────────────────────────────────────

export const IB_DOCKS: IBDockDef[] = [
  {
    id: 'dock_anvil',
    name: 'Anvil Dock',
    description: 'The oldest dock in Iron Bay, where the first iron ships were hammered into shape over open fires. Its anvil-shaped stone breakwater deflects waves and inspires generations of smiths.',
    capacity: 4,
    unlockLevel: 1,
  },
  {
    id: 'dock_steam',
    name: 'Steam Pier',
    description: 'A bustling pier perpetually wreathed in white steam from the adjacent engine houses. Steam-powered cranes and winches move cargo with mechanical precision at all hours.',
    capacity: 5,
    unlockLevel: 3,
  },
  {
    id: 'dock_foundry',
    name: 'Foundry Wharf',
    description: 'Adjacent to the great foundry, this wharf receives raw ore shipments and ships out finished iron goods. The air here smells of molten metal and sea salt.',
    capacity: 5,
    unlockLevel: 6,
  },
  {
    id: 'dock_rust',
    name: 'Rust Harbor',
    description: 'A sheltered natural harbor where aged vessels rest. The rust-red cliffs give it its name, and the calm waters make it ideal for repairs and refitting.',
    capacity: 6,
    unlockLevel: 10,
  },
  {
    id: 'dock_copper',
    name: 'Copper Bay',
    description: 'A gleaming bay whose waters shimmer with copper-ore deposits beneath the surface. Divers harvest the ore while ships of polished brass anchor in the shallows.',
    capacity: 6,
    unlockLevel: 14,
  },
  {
    id: 'dock_steel',
    name: 'Steel Pier',
    description: 'The most modern pier in Iron Bay, constructed entirely from reinforced steel. It can accommodate the heaviest warships and withstand the fiercest storms.',
    capacity: 7,
    unlockLevel: 20,
  },
  {
    id: 'dock_forge',
    name: 'Iron Forge Dock',
    description: 'A massive dock built around a volcanic vent, using geothermal heat to power onboard forges. Warships are armed and armored here without ever leaving the water.',
    capacity: 8,
    unlockLevel: 28,
  },
  {
    id: 'dock_titan',
    name: 'Titan Drydock',
    description: 'The crown jewel of Iron Bay — an enormous drydock carved from solid bedrock, capable of housing and constructing the largest vessels ever conceived. Only the most skilled engineers may enter.',
    capacity: 10,
    unlockLevel: 38,
  },
];

// ─── IB_WEAPONS: 35 Iron/Steel Weapons & Armor ─────────────────────────────────

export const IB_WEAPONS: IBWeaponDef[] = [
  // === Common (7) ===
  {
    id: 'wep_iron_dagger',
    name: 'Iron Dagger',
    rarity: 'common',
    type: 'sword',
    power: 8,
    durability: 40,
    description: 'A simple double-edged dagger forged from scrap iron at the Anvil Dock. Trusty and cheap.',
  },
  {
    id: 'wep_rivet_shield',
    name: 'Rivet Shield',
    rarity: 'common',
    type: 'shield',
    power: 10,
    durability: 60,
    description: 'A round shield held together by iron rivets, standard issue for dock guards and deckhands.',
  },
  {
    id: 'wep_chain_vest',
    name: 'Chain Vest',
    rarity: 'common',
    type: 'armor',
    power: 7,
    durability: 55,
    description: 'Interlocking iron rings forming a flexible protective vest, favored by dock workers.',
  },
  {
    id: 'wep_smith_hammer',
    name: 'Smith Hammer',
    rarity: 'common',
    type: 'hammer',
    power: 12,
    durability: 50,
    description: 'A heavy iron hammer used by bay smiths, equally effective at forging and fighting.',
  },
  {
    id: 'wep_bolt_tongs',
    name: 'Bolt Tongs',
    rarity: 'common',
    type: 'tool',
    power: 5,
    durability: 70,
    description: 'Long-handled tongs for gripping hot bolts and rivets during ship repair.',
  },
  {
    id: 'wep_iron_cutlass',
    name: 'Iron Cutlass',
    rarity: 'common',
    type: 'sword',
    power: 11,
    durability: 45,
    description: 'A curved iron blade popular among Iron Bay sailors, effective in close-quarters combat.',
  },
  {
    id: 'wep_scrap_plate',
    name: 'Scrap Plate',
    rarity: 'common',
    type: 'armor',
    power: 9,
    durability: 65,
    description: 'Body armor cobbled together from salvaged iron plates, offering decent protection.',
  },
  // === Uncommon (7) ===
  {
    id: 'wep_steel_saber',
    name: 'Steel Saber',
    rarity: 'uncommon',
    type: 'sword',
    power: 24,
    durability: 80,
    description: 'A finely balanced saber forged from carbon steel at the Foundry Wharf. Its edge gleams like moonlight on water.',
  },
  {
    id: 'wep_buckler_of_tides',
    name: 'Buckler of Tides',
    rarity: 'uncommon',
    type: 'shield',
    power: 20,
    durability: 100,
    description: 'A small steel buckler etched with wave patterns. Legend says it deflects attacks like the tide turns.',
  },
  {
    id: 'wep_copper_scale_mail',
    name: 'Copper Scale Mail',
    rarity: 'uncommon',
    type: 'armor',
    power: 18,
    durability: 110,
    description: 'Overlapping copper scales provide flexible yet sturdy protection, resistant to corrosion from sea air.',
  },
  {
    id: 'wep_foundry_maul',
    name: 'Foundry Maul',
    rarity: 'uncommon',
    type: 'hammer',
    power: 26,
    durability: 85,
    description: 'A massive hammer originally used to shape ship hulls. When swung in anger, few things stand in its way.',
  },
  {
    id: 'wep_steam_wrench',
    name: 'Steam Wrench',
    rarity: 'uncommon',
    type: 'tool',
    power: 15,
    durability: 130,
    description: 'A pneumatic wrench powered by compressed steam, able to tighten or loosen any bolt in seconds.',
  },
  {
    id: 'wep_rapier_of_dawn',
    name: 'Rapier of Dawn',
    rarity: 'uncommon',
    type: 'sword',
    power: 22,
    durability: 75,
    description: 'A slender steel rapier with a golden basket hilt, favored by duelists at the Copper Bay courts.',
  },
  {
    id: 'wep_boiler_plate',
    name: 'Boiler Plate Armor',
    rarity: 'uncommon',
    type: 'armor',
    power: 21,
    durability: 120,
    description: 'Armor repurposed from disused steam boiler plates, heavy but nearly impenetrable.',
  },
  // === Rare (7) ===
  {
    id: 'wep_crimson_broadsword',
    name: 'Crimson Broadsword',
    rarity: 'rare',
    type: 'sword',
    power: 52,
    durability: 150,
    description: 'A broadsword with a blade that shifts from iron-gray to deep crimson when heated by battle rage.',
  },
  {
    id: 'wep_bastion_aegis',
    name: 'Bastion Aegis',
    rarity: 'rare',
    type: 'shield',
    power: 48,
    durability: 200,
    description: 'A towering shield forged from layered steel and volcanic glass, capable of withstanding cannon fire.',
  },
  {
    id: 'wep_golem_cuirass',
    name: 'Golem Cuirass',
    rarity: 'rare',
    type: 'armor',
    power: 45,
    durability: 220,
    description: 'Breastplate armor modeled after the legendary iron golems of Iron Bay folklore, incredibly resilient.',
  },
  {
    id: 'wep_earthshaker',
    name: 'Earthshaker',
    rarity: 'rare',
    type: 'hammer',
    power: 55,
    durability: 160,
    description: 'A warhammer of immense weight that creates shockwaves with every strike, cracking stone and bone alike.',
  },
  {
    id: 'wep_omni_forge_tongs',
    name: 'Omni-Forge Tongs',
    rarity: 'rare',
    type: 'tool',
    power: 35,
    durability: 250,
    description: 'Adaptive tongs that adjust their grip to any material, from delicate crystal to molten titanium.',
  },
  {
    id: 'wep_storm_blade',
    name: 'Storm Blade',
    rarity: 'rare',
    type: 'sword',
    power: 50,
    durability: 140,
    description: 'A sword forged during a thunderstorm, its steel carries a faint electric charge that arcs in combat.',
  },
  {
    id: 'wep_deep_hull_armor',
    name: 'Deep Hull Armor',
    rarity: 'rare',
    type: 'armor',
    power: 46,
    durability: 240,
    description: 'Armor designed for deep-sea divers, built from pressure-resistant steel with bronze reinforcements.',
  },
  // === Epic (7) ===
  {
    id: 'wep_inferno_greatsword',
    name: 'Inferno Greatsword',
    rarity: 'epic',
    type: 'sword',
    power: 110,
    durability: 350,
    description: 'A massive two-handed blade that glows white-hot, forged in the volcanic vents beneath the Iron Forge Dock. Each swing leaves a trail of molten steel.',
  },
  {
    id: 'wep_adamantine_bulwark',
    name: 'Adamantine Bulwark',
    rarity: 'epic',
    type: 'shield',
    power: 105,
    durability: 450,
    description: 'A shield of near-indestructible adamantine alloy, its surface reflects light like a mirror and absorbs all but the most powerful blows.',
  },
  {
    id: 'wep_titan_full_plate',
    name: 'Titan Full Plate',
    rarity: 'epic',
    type: 'armor',
    power: 100,
    durability: 500,
    description: 'Full-body armor forged from titan-class steel, each plate individually hammered by master smiths over the course of a year.',
  },
  {
    id: 'wep_volcanic_sledge',
    name: 'Volcanic Sledge',
    rarity: 'epic',
    type: 'hammer',
    power: 115,
    durability: 300,
    description: 'A colossal hammer with a head of cooled magma core wrapped in steel. When it strikes, the ground itself fractures.',
  },
  {
    id: 'wep_architect_compass',
    name: 'Architect Compass',
    rarity: 'epic',
    type: 'tool',
    power: 70,
    durability: 600,
    description: 'A精密 compass of brass and titanium that points toward the nearest valuable ore deposit. Builders and miners swear by its accuracy.',
  },
  {
    id: 'wep_twinsteel_serpent',
    name: 'Twinsteel Serpent',
    rarity: 'epic',
    type: 'sword',
    power: 108,
    durability: 320,
    description: 'A twin-bladed sword connected by a flexible steel chain, capable of striking from unexpected angles like a serpent.',
  },
  {
    id: 'wep_steam_knight_harness',
    name: 'Steam Knight Harness',
    rarity: 'epic',
    type: 'armor',
    power: 95,
    durability: 480,
    description: 'Powered armor harness with built-in steam pistons that enhance the wearer strength and mobility threefold.',
  },
  // === Legendary (7) ===
  {
    id: 'wep_sovereign_blade',
    name: 'Sovereign Blade',
    rarity: 'legendary',
    type: 'sword',
    power: 260,
    durability: 900,
    description: 'The legendary sword of Iron Bay first sovereign, forged from a fallen star and quenched in the bay itself. It never dulls and cuts through anything.',
  },
  {
    id: 'wep_eternal_wall',
    name: 'Eternal Wall',
    rarity: 'legendary',
    type: 'shield',
    power: 250,
    durability: 1200,
    description: 'A shield said to have been carved from a single piece of the mythical World-Iron. It creates an impenetrable barrier that absorbs all kinetic energy.',
  },
  {
    id: 'wep_iron_god_mail',
    name: 'Iron God Mail',
    rarity: 'legendary',
    type: 'armor',
    power: 240,
    durability: 1000,
    description: 'Armor of such supernatural quality that its wearer becomes one with iron itself — immune to rust, heat, and all mundane weapons.',
  },
  {
    id: 'wep_colossus_hammer',
    name: 'Colossus Hammer',
    rarity: 'legendary',
    type: 'hammer',
    power: 270,
    durability: 800,
    description: 'A hammer so enormous it requires steam-powered exoskeleton assistance to wield. A single strike can level a fortress.',
  },
  {
    id: 'wep_creators_calipers',
    name: 'Creators Calipers',
    rarity: 'legendary',
    type: 'tool',
    power: 180,
    durability: 2000,
    description: 'The original measuring tool used to lay out Iron Bay foundations. Anything measured by these calipers can be perfectly replicated.',
  },
  {
    id: 'wep_baybreaker',
    name: 'Baybreaker',
    rarity: 'legendary',
    type: 'sword',
    power: 275,
    durability: 850,
    description: 'A massive greatsword that was used to carve Iron Bay harbor from solid cliff. Its edge can slice through mountainsides.',
  },
  {
    id: 'wep_immortal_forgeplate',
    name: 'Immortal Forgeplate',
    rarity: 'legendary',
    type: 'armor',
    power: 255,
    durability: 1100,
    description: 'Self-repairing armor that draws iron particles from the air to mend any damage. The wearer is essentially indestructible.',
  },
];

// ─── IB_SHIPS: 30 Bay Vessels ──────────────────────────────────────────────────

export const IB_SHIPS: IBShipDef[] = [
  // === Common Trading & Transport (6) ===
  {
    id: 'ship_iron_sloop',
    name: 'Iron Sloop',
    rarity: 'common',
    type: 'trading',
    capacity: 20,
    speed: 3,
    durability: 80,
    description: 'A small, sturdy sloop with an iron-reinforced hull, ideal for short coastal trading runs.',
  },
  {
    id: 'ship_coal_barge',
    name: 'Coal Barge',
    rarity: 'common',
    type: 'transport',
    capacity: 50,
    speed: 1,
    durability: 60,
    description: 'A flat-bottomed barge built to haul coal from the mines to the Iron Bay foundries.',
  },
  {
    id: 'ship_rust_skiff',
    name: 'Rust Skiff',
    rarity: 'common',
    type: 'patrol',
    capacity: 8,
    speed: 4,
    durability: 50,
    description: 'A lightweight patrol boat that dashes between docks on lookout duty, painted in rust-red.',
  },
  {
    id: 'ship_copper_trader',
    name: 'Copper Trader',
    rarity: 'common',
    type: 'trading',
    capacity: 30,
    speed: 2,
    durability: 70,
    description: 'A merchant vessel with copper-plated railings, carrying goods between Copper Bay and distant markets.',
  },
  {
    id: 'ship_tug_ironheart',
    name: 'Ironheart Tug',
    rarity: 'common',
    type: 'transport',
    capacity: 15,
    speed: 2,
    durability: 90,
    description: 'A powerful little tugboat with an oversized steam engine, used to guide larger ships into dock.',
  },
  {
    id: 'ship_scout_ferry',
    name: 'Scout Ferry',
    rarity: 'common',
    type: 'explorer',
    capacity: 10,
    speed: 5,
    durability: 45,
    description: 'A fast ferry that scouts ahead of trade convoys, reporting weather and hazards by signal flags.',
  },
  // === Uncommon (6) ===
  {
    id: 'ship_steel_cutter',
    name: 'Steel Cutter',
    rarity: 'uncommon',
    type: 'trading',
    capacity: 40,
    speed: 4,
    durability: 120,
    description: 'A sleek steel-hulled cutter that combines speed with cargo capacity for profitable trading.',
  },
  {
    id: 'ship_bronze_corvette',
    name: 'Bronze Corvette',
    rarity: 'uncommon',
    type: 'warship',
    capacity: 15,
    speed: 3,
    durability: 150,
    description: 'A light warship with bronze cannon housings, patrolling the approaches to Iron Bay.',
  },
  {
    id: 'ship_steam_freighter',
    name: 'Steam Freighter',
    rarity: 'uncommon',
    type: 'transport',
    capacity: 80,
    speed: 2,
    durability: 130,
    description: 'A steam-powered cargo ship that hauls bulk materials between Iron Bay and outlying iron mines.',
  },
  {
    id: 'ship_explorer_mist',
    name: 'Mist Explorer',
    rarity: 'uncommon',
    type: 'explorer',
    capacity: 20,
    speed: 5,
    durability: 100,
    description: 'A vessel designed for exploring fog-shrouded coastlines, equipped with a steam whistle and searchlight.',
  },
  {
    id: 'ship_anvil_guard',
    name: 'Anvil Guard',
    rarity: 'uncommon',
    type: 'patrol',
    capacity: 12,
    speed: 4,
    durability: 140,
    description: 'A patrol ship stationed at the Anvil Dock, built like its namesake — solid, dependable, unyielding.',
  },
  {
    id: 'ship_foundry_supply',
    name: 'Foundry Supply Vessel',
    rarity: 'uncommon',
    type: 'transport',
    capacity: 60,
    speed: 2,
    durability: 110,
    description: 'A dedicated supply ship that keeps the Foundry Wharf stocked with raw materials from distant quarries.',
  },
  // === Rare (6) ===
  {
    id: 'ship_war_ironclad',
    name: 'Ironclad Warship',
    rarity: 'rare',
    type: 'warship',
    capacity: 30,
    speed: 2,
    durability: 300,
    description: 'A fearsome ironclad warship sheathed in overlapping iron plates, virtually immune to conventional cannon fire.',
  },
  {
    id: 'ship_trade_galleon',
    name: 'Trade Galleon',
    rarity: 'rare',
    type: 'trading',
    capacity: 120,
    speed: 3,
    durability: 250,
    description: 'A massive galleon combining Iron Bay steel construction with traditional sailing design for maximum cargo.',
  },
  {
    id: 'ship_deep_diver',
    name: 'Deep Diver',
    rarity: 'rare',
    type: 'explorer',
    capacity: 25,
    speed: 3,
    durability: 200,
    description: 'A reinforced submersible-capable vessel that can dive to harvest deep-sea minerals and explore underwater caves.',
  },
  {
    id: 'ship_storm_patrol',
    name: 'Storm Patrol',
    rarity: 'rare',
    type: 'patrol',
    capacity: 18,
    speed: 5,
    durability: 180,
    description: 'A patrol vessel engineered to maintain station in the worst storms, protecting shipping lanes.',
  },
  {
    id: 'ship_armored_hauler',
    name: 'Armored Hauler',
    rarity: 'rare',
    type: 'transport',
    capacity: 100,
    speed: 2,
    durability: 280,
    description: 'A heavily armored transport ship for carrying valuable cargo through dangerous waters.',
  },
  {
    id: 'ship_caravel_adventure',
    name: 'Caravel of Adventure',
    rarity: 'rare',
    type: 'explorer',
    capacity: 35,
    speed: 4,
    durability: 170,
    description: 'A fast exploration caravel that charts new trade routes and discovers uncharted islands.',
  },
  // === Epic (6) ===
  {
    id: 'ship_dreadnought_vulcan',
    name: 'Dreadnought Vulcan',
    rarity: 'epic',
    type: 'warship',
    capacity: 50,
    speed: 2,
    durability: 600,
    description: 'A colossal dreadnought armed with steam-powered cannons and a steel ram. The pride of the Iron Bay fleet.',
  },
  {
    id: 'ship_merchant_sovereign',
    name: 'Merchant Sovereign',
    rarity: 'epic',
    type: 'trading',
    capacity: 200,
    speed: 4,
    durability: 450,
    description: 'The largest trading vessel in Iron Bay, capable of circumnavigating the world with a hold full of iron goods.',
  },
  {
    id: 'ship_abyss_explorer',
    name: 'Abyss Explorer',
    rarity: 'epic',
    type: 'explorer',
    capacity: 40,
    speed: 3,
    durability: 400,
    description: 'A deep-sea exploration vessel with titanium hull plating, capable of reaching the darkest ocean trenches.',
  },
  {
    id: 'ship_iron_phalanx',
    name: 'Iron Phalanx',
    rarity: 'epic',
    type: 'patrol',
    capacity: 30,
    speed: 4,
    durability: 500,
    description: 'A patrol fleet flagship that coordinates defense of the entire bay, supported by a flotilla of smaller vessels.',
  },
  {
    id: 'ship_leviathan_haul',
    name: 'Leviathan Hauler',
    rarity: 'epic',
    type: 'transport',
    capacity: 300,
    speed: 1,
    durability: 550,
    description: 'An enormous transport ship that can carry an entire iron foundry worth of materials in a single voyage.',
  },
  {
    id: 'ship_flagship_resolute',
    name: 'Flagship Resolute',
    rarity: 'epic',
    type: 'flagship',
    capacity: 60,
    speed: 3,
    durability: 650,
    description: 'The current flagship of the Iron Bay armada, adorned with golden figureheads and the finest steel plating.',
  },
  // === Legendary (6) ===
  {
    id: 'ship_titan_apex',
    name: 'Titan Apex',
    rarity: 'legendary',
    type: 'warship',
    capacity: 80,
    speed: 4,
    durability: 1200,
    description: 'The ultimate warship, forged in the Titan Drydock from an alloy ofadamantine and world-iron. It has never been defeated in battle.',
  },
  {
    id: 'ship_world_trader',
    name: 'World Trader',
    rarity: 'legendary',
    type: 'trading',
    capacity: 500,
    speed: 5,
    durability: 800,
    description: 'A legendary merchant vessel that supposedly visits every port in the world in a single voyage, carrying goods beyond imagination.',
  },
  {
    id: 'ship_cosmic_voyager',
    name: 'Cosmic Voyager',
    rarity: 'legendary',
    type: 'explorer',
    capacity: 50,
    speed: 6,
    durability: 900,
    description: 'A ship said to be built from a fallen meteorite, capable of navigating not just seas but the stars themselves.',
  },
  {
    id: 'ship_eternal_sentinel',
    name: 'Eternal Sentinel',
    rarity: 'legendary',
    type: 'patrol',
    capacity: 40,
    speed: 5,
    durability: 1100,
    description: 'A ghostly patrol ship that never sleeps, crewed by the spirits of Iron Bay greatest defenders. It appears when danger threatens.',
  },
  {
    id: 'ship_colossus_transport',
    name: 'Colossus Transport',
    rarity: 'legendary',
    type: 'transport',
    capacity: 1000,
    speed: 3,
    durability: 1500,
    description: 'A floating city of a ship, large enough to carry entire armies, foundries, and populations across oceans.',
  },
  {
    id: 'ship_bay_sovereign_prime',
    name: 'Bay Sovereign Prime',
    rarity: 'legendary',
    type: 'flagship',
    capacity: 100,
    speed: 5,
    durability: 1400,
    description: 'The original flagship of Iron Bay first ruler, restored and enhanced with every alloy and technology ever developed. It is Iron Bay itself, made manifest.',
  },
];

// ─── IB_MATERIALS: 30 Forging Materials ─────────────────────────────────────────

export const IB_MATERIALS: IBMaterialDef[] = [
  // === Common (6) ===
  {
    id: 'mat_iron_ore',
    name: 'Iron Ore',
    rarity: 'common',
    source: 'Mining',
    description: 'Raw iron ore extracted from the cliffs surrounding Iron Bay, the foundation of all bay industry.',
  },
  {
    id: 'mat_coal',
    name: 'Coal',
    rarity: 'common',
    source: 'Mining',
    description: 'Black lumps of carbon-rich coal, the primary fuel for Iron Bay forges and steam engines.',
  },
  {
    id: 'mat_scrap_iron',
    name: 'Scrap Iron',
    rarity: 'common',
    source: 'Salvage',
    description: 'Salvaged iron pieces from decommissioned ships and structures, still useful for basic forging.',
  },
  {
    id: 'mat_sea_salt',
    name: 'Sea Salt',
    rarity: 'common',
    source: 'Harvesting',
    description: 'Salt harvested from evaporated bay water, used in quenching and metal treatment processes.',
  },
  {
    id: 'mat_limestone',
    name: 'Limestone',
    rarity: 'common',
    source: 'Quarrying',
    description: 'Abundant limestone used as flux in smelting to remove impurities from iron ore.',
  },
  {
    id: 'mat_rust_dust',
    name: 'Rust Dust',
    rarity: 'common',
    source: 'Processing',
    description: 'Iron oxide powder collected during ship repair and refurbishment, used in chemical processes.',
  },
  // === Uncommon (6) ===
  {
    id: 'mat_copper_ingot',
    name: 'Copper Ingot',
    rarity: 'uncommon',
    source: 'Smelting',
    description: 'Refined copper formed into standardized ingots, essential for electrical systems and decorative work.',
  },
  {
    id: 'mat_brass_sheet',
    name: 'Brass Sheet',
    rarity: 'uncommon',
    source: 'Alloying',
    description: 'Alloy of copper and zinc rolled into thin sheets for plating, instruments, and decorative fittings.',
  },
  {
    id: 'mat_steel_bar',
    name: 'Steel Bar',
    rarity: 'uncommon',
    source: 'Smelting',
    description: 'Carbon steel bars produced in the Foundry Wharf furnaces, the workhorse material of Iron Bay.',
  },
  {
    id: 'mat_tin_ore',
    name: 'Tin Ore',
    rarity: 'uncommon',
    source: 'Mining',
    description: 'Tin-bearing ore used to alloy with copper to create bronze and with iron for corrosion resistance.',
  },
  {
    id: 'mat_quicksilver',
    name: 'Quicksilver',
    rarity: 'uncommon',
    source: 'Trading',
    description: 'Liquid mercury obtained through trade, used in extracting gold and silver from ore deposits.',
  },
  {
    id: 'mat_charcoal_brick',
    name: 'Charcoal Brick',
    rarity: 'uncommon',
    source: 'Processing',
    description: 'Compressed charcoal bricks that burn hotter and cleaner than raw coal, used for high-grade forging.',
  },
  // === Rare (6) ===
  {
    id: 'mat_titanium_shard',
    name: 'Titanium Shard',
    rarity: 'rare',
    source: 'Deep Mining',
    description: 'Fragments of titanium ore from deep mines beneath the Iron Forge Dock, exceptionally strong and lightweight.',
  },
  {
    id: 'mat_tungsten_core',
    name: 'Tungsten Core',
    rarity: 'rare',
    source: 'Deep Mining',
    description: 'A dense tungsten core used in armor-piercing weapons and extreme-temperature furnace components.',
  },
  {
    id: 'mat_manganese_nugget',
    name: 'Manganese Nugget',
    rarity: 'rare',
    source: 'Deep Mining',
    description: 'Manganese ore nuggets that, when added to steel, dramatically increase hardness and durability.',
  },
  {
    id: 'mat_nickel_plate',
    name: 'Nickel Plate',
    rarity: 'rare',
    source: 'Processing',
    description: 'Corrosion-resistant nickel plating material, essential for ships that sail through acidic volcanic waters.',
  },
  {
    id: 'mat_chromium_ore',
    name: 'Chromium Ore',
    rarity: 'rare',
    source: 'Deep Mining',
    description: 'Ore containing chromium, used to create stainless steel that never rusts — invaluable in a harbor.',
  },
  {
    id: 'mat_cobalt_ingot',
    name: 'Cobalt Ingot',
    rarity: 'rare',
    source: 'Smelting',
    description: 'Blue-tinted cobalt metal that adds magnetic properties and vivid coloring to alloys.',
  },
  // === Epic (6) ===
  {
    id: 'mat_mithril_thread',
    name: 'Mithril Thread',
    rarity: 'epic',
    source: 'Discovery',
    description: 'Gossamer threads of legendary mithril metal, lighter than silk and stronger than steel. Found in only the deepest mines.',
  },
  {
    id: 'mat_volcanic_glass',
    name: 'Volcanic Glass',
    rarity: 'epic',
    source: 'Discovery',
    description: 'Obsidian-like glass formed in volcanic vents beneath the bay, used to create blades of impossible sharpness.',
  },
  {
    id: 'mat_adamantine_scrap',
    name: 'Adamantine Scrap',
    rarity: 'epic',
    source: 'Trading',
    description: 'Rare fragments of adamantine metal obtained through legendary trade routes, the strongest material known.',
  },
  {
    id: 'mat_star_iron',
    name: 'Star Iron',
    rarity: 'epic',
    source: 'Discovery',
    description: 'Meteorite iron that fell into the bay centuries ago, possessing otherworldly properties of self-repair.',
  },
  {
    id: 'mat_deep_crystal',
    name: 'Deep Crystal',
    rarity: 'epic',
    source: 'Discovery',
    description: 'Crystals harvested from ocean trenches that focus and amplify energy, used in advanced forging techniques.',
  },
  {
    id: 'mat_plasma_slag',
    name: 'Plasma Slag',
    rarity: 'epic',
    source: 'Processing',
    description: 'A byproduct of the most extreme forging processes, containing trace amounts of pure elemental metal.',
  },
  // === Legendary (6) ===
  {
    id: 'mat_world_iron',
    name: 'World Iron',
    rarity: 'legendary',
    source: 'Mythic Discovery',
    description: 'Metal drawn from the planetary core itself, said to be the iron that makes up the world skeleton. Indestructible and alive.',
  },
  {
    id: 'mat_eternal_forge_fuel',
    name: 'Eternal Forge Fuel',
    rarity: 'legendary',
    source: 'Mythic Discovery',
    description: 'A crystallized ember from the first fire ever lit by humans. When burned, it heats a forge to infinite temperature.',
  },
  {
    id: 'mat_sovereign_alloy',
    name: 'Sovereign Alloy',
    rarity: 'legendary',
    source: 'Mythic Crafting',
    description: 'The secret alloy of Iron Bay sovereigns, combining world-iron, star-iron, and deep crystal into a metal beyond comprehension.',
  },
  {
    id: 'mat_void_ore',
    name: 'Void Ore',
    rarity: 'legendary',
    source: 'Mythic Discovery',
    description: 'Ore that exists partially in another dimension, giving it impossible properties — lighter than air but harder than diamond.',
  },
  {
    id: 'mat_aetherium_ingot',
    name: 'Aetherium Ingot',
    rarity: 'legendary',
    source: 'Mythic Discovery',
    description: 'A silvery ingot that pulses with raw aetheric energy, capable of powering entire fleets of ships indefinitely.',
  },
  {
    id: 'mat_time_tempered_steel',
    name: 'Time-Tempered Steel',
    rarity: 'legendary',
    source: 'Mythic Crafting',
    description: 'Steel that has been tempered not in water but in the flow of time itself. It never degrades and grows stronger with age.',
  },
];

// ─── IB_STRUCTURES: 25 Upgradeable Bay Structures ───────────────────────────────

export const IB_STRUCTURES: IBStructureDef[] = [
  {
    id: 'struct_forge_prime',
    name: 'Prime Forge',
    description: 'The main forging station of Iron Bay where weapons and armor are hammered into shape over roaring fires.',
    maxLevel: 10,
    baseCost: 50,
    type: 'forge',
  },
  {
    id: 'struct_foundry_great',
    name: 'Great Foundry',
    description: 'A massive foundry capable of smelting tons of ore per day, producing the raw iron that fuels all bay industry.',
    maxLevel: 10,
    baseCost: 80,
    type: 'forge',
  },
  {
    id: 'struct_warehouse_main',
    name: 'Main Warehouse',
    description: 'The central storage facility where all materials, weapons, and trade goods are organized and secured.',
    maxLevel: 10,
    baseCost: 40,
    type: 'warehouse',
  },
  {
    id: 'struct_warehouse_cold',
    name: 'Cold Storage Vault',
    description: 'A temperature-controlled vault for storing sensitive materials that degrade in heat or humidity.',
    maxLevel: 10,
    baseCost: 60,
    type: 'warehouse',
  },
  {
    id: 'struct_drydock_small',
    name: 'Small Drydock',
    description: 'A modest drydock for building and repairing small vessels like sloops, barges, and skiffs.',
    maxLevel: 10,
    baseCost: 70,
    type: 'drydock',
  },
  {
    id: 'struct_drydock_grand',
    name: 'Grand Drydock',
    description: 'An enormous drydock capable of constructing and servicing the largest warships and trading galleons.',
    maxLevel: 10,
    baseCost: 150,
    type: 'drydock',
  },
  {
    id: 'struct_workshop_armorer',
    name: 'Armorer Workshop',
    description: 'A specialized workshop where master armorers craft protective gear from the finest bay steel.',
    maxLevel: 10,
    baseCost: 55,
    type: 'workshop',
  },
  {
    id: 'struct_workshop_weaponsmith',
    name: 'Weaponsmith Workshop',
    description: 'Where blades are sharpened, hilts wrapped, and weapons of war are given their deadly edge.',
    maxLevel: 10,
    baseCost: 55,
    type: 'workshop',
  },
  {
    id: 'struct_workshop_alchemist',
    name: 'Alchemist Workshop',
    description: 'A laboratory for mixing alloys, creating treatments, and discovering new material properties.',
    maxLevel: 10,
    baseCost: 65,
    type: 'workshop',
  },
  {
    id: 'struct_tower_watch',
    name: 'Watch Tower',
    description: 'A tall observation tower overlooking the bay entrance, providing early warning of approaching ships and storms.',
    maxLevel: 10,
    baseCost: 45,
    type: 'tower',
  },
  {
    id: 'struct_tower_signal',
    name: 'Signal Tower',
    description: 'An array of mirrors, flags, and steam whistles for communicating with ships at sea and neighboring ports.',
    maxLevel: 10,
    baseCost: 50,
    type: 'tower',
  },
  {
    id: 'struct_lighthouse_iron',
    name: 'Iron Lighthouse',
    description: 'A lighthouse constructed entirely from iron, its beam visible for miles, guiding ships safely through fog and dark.',
    maxLevel: 10,
    baseCost: 90,
    type: 'lighthouse',
  },
  {
    id: 'struct_lighthouse_storm',
    name: 'Storm Beacon',
    description: 'A secondary lighthouse designed to operate in the worst weather, with reinforced glass and backup steam lamps.',
    maxLevel: 10,
    baseCost: 100,
    type: 'lighthouse',
  },
  {
    id: 'struct_forge_steam',
    name: 'Steam Hammer Forge',
    description: 'A forge powered by a massive steam hammer that can shape titanium and tungsten with ease.',
    maxLevel: 10,
    baseCost: 120,
    type: 'forge',
  },
  {
    id: 'struct_warehouse_armor',
    name: 'Armory Vault',
    description: 'A heavily fortified underground vault storing the most valuable weapons and armor ever forged.',
    maxLevel: 10,
    baseCost: 110,
    type: 'warehouse',
  },
  {
    id: 'struct_drydock_submarine',
    name: 'Submersible Dock',
    description: 'A specialized dock with waterproof doors for constructing and maintaining submersible exploration vessels.',
    maxLevel: 10,
    baseCost: 130,
    type: 'drydock',
  },
  {
    id: 'struct_workshop_engineer',
    name: 'Engineer Guildhall',
    description: 'The headquarters of Iron Bay engineering guild, where the most brilliant minds design ships and structures.',
    maxLevel: 10,
    baseCost: 100,
    type: 'workshop',
  },
  {
    id: 'struct_tower_command',
    name: 'Command Tower',
    description: 'The central command post for coordinating bay defense, trade operations, and fleet movements.',
    maxLevel: 10,
    baseCost: 140,
    type: 'tower',
  },
  {
    id: 'struct_forge_vulcan',
    name: 'Vulcan Deep Forge',
    description: 'A forge built directly over a magma vent, using geothermal energy to achieve temperatures impossible with coal.',
    maxLevel: 10,
    baseCost: 200,
    type: 'forge',
  },
  {
    id: 'struct_warehouse_trade',
    name: 'Trade Exchange',
    description: 'A grand hall where merchants from across the seas gather to negotiate deals and exchange exotic materials.',
    maxLevel: 10,
    baseCost: 160,
    type: 'warehouse',
  },
  {
    id: 'struct_drydock_titan',
    name: 'Titan Drydock Facility',
    description: 'The largest construction dock in existence, carved from bedrock, where legendary vessels are born.',
    maxLevel: 10,
    baseCost: 250,
    type: 'drydock',
  },
  {
    id: 'struct_workshop_arcane',
    name: 'Arcane Smithy',
    description: 'A workshop where traditional smithing meets mysterious forces, producing items with supernatural properties.',
    maxLevel: 10,
    baseCost: 180,
    type: 'workshop',
  },
  {
    id: 'struct_lighthouse_aurora',
    name: 'Aurora Lighthouse',
    description: 'A lighthouse that projects multi-colored light through crystalline prisms, visible even through magical fog.',
    maxLevel: 10,
    baseCost: 200,
    type: 'lighthouse',
  },
  {
    id: 'struct_tower_sovereign',
    name: 'Sovereign Spire',
    description: 'The tallest structure in Iron Bay, a spire from which the ruler surveys their entire domain and beyond.',
    maxLevel: 10,
    baseCost: 300,
    type: 'tower',
  },
  {
    id: 'struct_forge_eternal',
    name: 'Eternal Forge',
    description: 'The mythical final forge, said to burn with fire from the world core. Only the most legendary items can be created here.',
    maxLevel: 10,
    baseCost: 500,
    type: 'forge',
  },
];

// ─── IB_BLUEPRINTS: 15 Crafting Blueprints ─────────────────────────────────────

export const IB_BLUEPRINTS: IBBlueprintDef[] = [
  {
    id: 'bp_iron_blade',
    name: 'Iron Blade Blueprint',
    description: 'Instructions for forging a basic but reliable iron blade, the first weapon every apprentice learns to craft.',
    requiredMaterials: [
      { materialId: 'mat_iron_ore', amount: 3 },
      { materialId: 'mat_coal', amount: 2 },
    ],
    result: 'wep_iron_dagger',
    rarity: 'common',
  },
  {
    id: 'bp_chain_armor',
    name: 'Chain Armor Blueprint',
    description: 'A detailed guide to weaving iron rings into protective chain mail, a staple of bay defense.',
    requiredMaterials: [
      { materialId: 'mat_scrap_iron', amount: 5 },
      { materialId: 'mat_iron_ore', amount: 2 },
    ],
    result: 'wep_chain_vest',
    rarity: 'common',
  },
  {
    id: 'bp_steel_saber',
    name: 'Steel Saber Blueprint',
    description: 'Advanced techniques for folding and tempering steel into a razor-sharp saber blade.',
    requiredMaterials: [
      { materialId: 'mat_steel_bar', amount: 3 },
      { materialId: 'mat_charcoal_brick', amount: 2 },
    ],
    result: 'wep_steel_saber',
    rarity: 'uncommon',
  },
  {
    id: 'bp_copper_scale',
    name: 'Copper Scale Mail Blueprint',
    description: 'Methods for hammering copper into overlapping scales and linking them into flexible armor.',
    requiredMaterials: [
      { materialId: 'mat_copper_ingot', amount: 4 },
      { materialId: 'mat_brass_sheet', amount: 2 },
    ],
    result: 'wep_copper_scale_mail',
    rarity: 'uncommon',
  },
  {
    id: 'bp_crimson_broad',
    name: 'Crimson Broadsword Blueprint',
    description: 'A closely guarded recipe for a sword that changes color in battle, using secret heat-treating techniques.',
    requiredMaterials: [
      { materialId: 'mat_steel_bar', amount: 5 },
      { materialId: 'mat_rust_dust', amount: 3 },
      { materialId: 'mat_charcoal_brick', amount: 4 },
    ],
    result: 'wep_crimson_broadsword',
    rarity: 'rare',
  },
  {
    id: 'bp_golem_cuirass',
    name: 'Golem Cuirass Blueprint',
    description: 'Plans for creating armor inspired by the legendary iron golems, requiring exceptional forging skill.',
    requiredMaterials: [
      { materialId: 'mat_steel_bar', amount: 6 },
      { materialId: 'mat_limestone', amount: 3 },
      { materialId: 'mat_nickel_plate', amount: 2 },
    ],
    result: 'wep_golem_cuirass',
    rarity: 'rare',
  },
  {
    id: 'bp_inferno_greatsword',
    name: 'Inferno Greatsword Blueprint',
    description: 'The most complex weapon blueprint in Iron Bay, requiring volcanic heat and master-level smithing to complete.',
    requiredMaterials: [
      { materialId: 'mat_titanium_shard', amount: 3 },
      { materialId: 'mat_volcanic_glass', amount: 2 },
      { materialId: 'mat_steel_bar', amount: 8 },
    ],
    result: 'wep_inferno_greatsword',
    rarity: 'epic',
  },
  {
    id: 'bp_titan_full_plate',
    name: 'Titan Full Plate Blueprint',
    description: 'Blueprints for the ultimate armor, requiring rare materials and years of combined master craftsmanship.',
    requiredMaterials: [
      { materialId: 'mat_titanium_shard', amount: 5 },
      { materialId: 'mat_chromium_ore', amount: 3 },
      { materialId: 'mat_manganese_nugget', amount: 2 },
    ],
    result: 'wep_titan_full_plate',
    rarity: 'epic',
  },
  {
    id: 'bp_sovereign_blade',
    name: 'Sovereign Blade Blueprint',
    description: 'The most legendary blueprint in existence, said to have been dictated by Iron Bay first ruler in a fever dream.',
    requiredMaterials: [
      { materialId: 'mat_world_iron', amount: 2 },
      { materialId: 'mat_star_iron', amount: 3 },
      { materialId: 'mat_eternal_forge_fuel', amount: 1 },
    ],
    result: 'wep_sovereign_blade',
    rarity: 'legendary',
  },
  {
    id: 'bp_iron_sloop',
    name: 'Iron Sloop Blueprint',
    description: 'Plans for building a sturdy iron-reinforced sloop, the workhorse of coastal trade routes.',
    requiredMaterials: [
      { materialId: 'mat_iron_ore', amount: 8 },
      { materialId: 'mat_steel_bar', amount: 3 },
      { materialId: 'mat_limestone', amount: 2 },
    ],
    result: 'ship_iron_sloop',
    rarity: 'common',
  },
  {
    id: 'bp_ironclad',
    name: 'Ironclad Warship Blueprint',
    description: 'Blueprints for a formidable ironclad warship, featuring overlapping iron plate armor and steam propulsion.',
    requiredMaterials: [
      { materialId: 'mat_steel_bar', amount: 10 },
      { materialId: 'mat_coal', amount: 15 },
      { materialId: 'mat_charcoal_brick', amount: 5 },
    ],
    result: 'ship_war_ironclad',
    rarity: 'rare',
  },
  {
    id: 'bp_dreadnought',
    name: 'Dreadnought Vulcan Blueprint',
    description: 'The most ambitious warship design ever conceived in Iron Bay, requiring vast resources and engineering genius.',
    requiredMaterials: [
      { materialId: 'mat_titanium_shard', amount: 8 },
      { materialId: 'mat_tungsten_core', amount: 3 },
      { materialId: 'mat_volcanic_glass', amount: 4 },
    ],
    result: 'ship_dreadnought_vulcan',
    rarity: 'epic',
  },
  {
    id: 'bp_titan_apex',
    name: 'Titan Apex Blueprint',
    description: 'The blueprint for the ultimate warship, using materials and techniques that push the boundaries of what is possible.',
    requiredMaterials: [
      { materialId: 'mat_world_iron', amount: 3 },
      { materialId: 'mat_sovereign_alloy', amount: 2 },
      { materialId: 'mat_aetherium_ingot', amount: 1 },
    ],
    result: 'ship_titan_apex',
    rarity: 'legendary',
  },
  {
    id: 'bp_adamantine_bulwark',
    name: 'Adamantine Bulwark Blueprint',
    description: 'Designs for a shield of near-indestructible material, requiring the rarest metals and perfect craftsmanship.',
    requiredMaterials: [
      { materialId: 'mat_adamantine_scrap', amount: 4 },
      { materialId: 'mat_deep_crystal', amount: 2 },
      { materialId: 'mat_star_iron', amount: 2 },
    ],
    result: 'wep_adamantine_bulwark',
    rarity: 'epic',
  },
  {
    id: 'bp_iron_god_mail',
    name: 'Iron God Mail Blueprint',
    description: 'The holiest blueprint in Iron Bay, said to have been given by the iron god itself. Creating it is a once-in-a-lifetime achievement.',
    requiredMaterials: [
      { materialId: 'mat_world_iron', amount: 3 },
      { materialId: 'mat_time_tempered_steel', amount: 2 },
      { materialId: 'mat_sovereign_alloy', amount: 2 },
    ],
    result: 'wep_iron_god_mail',
    rarity: 'legendary',
  },
];

// ─── IB_ABILITIES: 22 Forging/Combat Abilities ─────────────────────────────────

export const IB_ABILITIES: IBAbilityDef[] = [
  {
    id: 'abil_steam_burst',
    name: 'Steam Burst',
    description: 'Releases a burst of superheated steam that blinds and burns nearby enemies, dealing moderate fire damage in a 10-foot radius.',
    cooldown: 30,
    power: 20,
  },
  {
    id: 'abil_iron_skin',
    name: 'Iron Skin',
    description: 'Temporarily hardens the skin to iron-like toughness, reducing all incoming physical damage by 50% for 15 seconds.',
    cooldown: 60,
    power: 35,
  },
  {
    id: 'abil_forge_strike',
    name: 'Forge Strike',
    description: 'Channels the heat of the forge into a single devastating melee attack that leaves the weapon glowing white-hot.',
    cooldown: 20,
    power: 45,
  },
  {
    id: 'abil_anvil_drop',
    name: 'Anvil Drop',
    description: 'Summons a spectral anvil from above to crush a target, dealing massive blunt damage and stunning for 3 seconds.',
    cooldown: 45,
    power: 60,
  },
  {
    id: 'abil_coal_armor',
    name: 'Coal Armor',
    description: 'Encases the user in a shell of compressed coal that absorbs damage and slowly regenerates health.',
    cooldown: 90,
    power: 25,
  },
  {
    id: 'abil_rust_curse',
    name: 'Rust Curse',
    description: 'Accelerates corrosion on enemy weapons and armor, reducing their effectiveness by 30% for 20 seconds.',
    cooldown: 50,
    power: 30,
  },
  {
    id: 'abil_steam_dash',
    name: 'Steam Dash',
    description: 'Propels the user forward on a jet of steam, covering 30 feet instantly and dealing collision damage.',
    cooldown: 15,
    power: 15,
  },
  {
    id: 'abil_bay_cannon',
    name: 'Bay Cannon',
    description: 'Fires a projectile from Iron Bay coastal defenses, dealing heavy damage at long range.',
    cooldown: 120,
    power: 80,
  },
  {
    id: 'abil_magnetic_field',
    name: 'Magnetic Field',
    description: 'Generates a magnetic field that deflects metallic projectiles and attracts nearby iron ore deposits.',
    cooldown: 75,
    power: 40,
  },
  {
    id: 'abil_overpressurize',
    name: 'Overpressurize',
    description: 'Pushes the steam system beyond safe limits, granting 100% increased attack speed for 10 seconds but causing self-damage.',
    cooldown: 100,
    power: 55,
  },
  {
    id: 'abil_quench_blade',
    name: 'Quench Blade',
    description: 'Rapidly cools a weapon in sea water, making it brittle-sharp and doubling its next attack damage.',
    cooldown: 40,
    power: 50,
  },
  {
    id: 'abil_foundry_rain',
    name: 'Foundry Rain',
    description: 'Causes molten metal droplets to rain from above over a large area, dealing continuous fire damage for 8 seconds.',
    cooldown: 150,
    power: 90,
  },
  {
    id: 'abil_dock_chain',
    name: 'Dock Chain',
    description: 'Launches a massive iron chain that snares a target, immobilizing them for 5 seconds and pulling them closer.',
    cooldown: 55,
    power: 35,
  },
  {
    id: 'abil_titanic_blows',
    name: 'Titanic Blows',
    description: 'Enlarges the user fists to titanic proportions, making all melee attacks deal triple damage for 12 seconds.',
    cooldown: 110,
    power: 70,
  },
  {
    id: 'abil_copper_resonance',
    name: 'Copper Resonance',
    description: 'Strikes copper bells that create a harmonic resonance, healing allies and boosting their iron energy regeneration.',
    cooldown: 80,
    power: 45,
  },
  {
    id: 'abil_ship_ram',
    name: 'Ship Ram',
    description: 'Calls upon a docked ship to perform a devastating ram attack against enemies near the waterfront.',
    cooldown: 180,
    power: 100,
  },
  {
    id: 'abil_geothermal_eruption',
    name: 'Geothermal Eruption',
    description: 'Taps into the volcanic vent beneath Iron Bay, causing a controlled eruption that devastates all enemies in the bay area.',
    cooldown: 300,
    power: 150,
  },
  {
    id: 'abil_iron_golem_summon',
    name: 'Iron Golem Summon',
    description: 'Constructs a temporary iron golem from available scrap materials that fights alongside the user for 30 seconds.',
    cooldown: 200,
    power: 120,
  },
  {
    id: 'abil_fleet_barrage',
    name: 'Fleet Barrage',
    description: 'Signals all docked ships to fire their cannons simultaneously in a devastating coordinated bombardment.',
    cooldown: 250,
    power: 140,
  },
  {
    id: 'abil_iron_sovereign',
    name: 'Iron Sovereign',
    description: 'Transforms into an avatar of iron, gaining massive damage reduction and attack power for 20 seconds.',
    cooldown: 350,
    power: 160,
  },
  {
    id: 'abil_abyssal_iron',
    name: 'Abyssal Iron',
    description: 'Draws iron ore from the ocean floor itself, creating a tidal wave of iron shards that sweeps across the battlefield.',
    cooldown: 400,
    power: 180,
  },
  {
    id: 'abil_bay_eternal',
    name: 'Eternal Bay',
    description: 'The ultimate ability — channels the collective power of all Iron Bay forges, docks, and structures into a single world-shaking attack.',
    cooldown: 600,
    power: 250,
  },
];

// ─── IB_ACHIEVEMENTS: 18 Achievements ──────────────────────────────────────────

export const IB_ACHIEVEMENTS: IBAchievementDef[] = [
  {
    id: 'ach_first_spark',
    name: 'First Spark',
    description: 'Forge your very first weapon at Iron Bay, igniting the flame of your forging career.',
  },
  {
    id: 'ach_dock_hands',
    name: 'Dock Hands',
    description: 'Build your first ship at any Iron Bay drydock and set sail on your maiden voyage.',
  },
  {
    id: 'ach_material_hoarder',
    name: 'Material Hoarder',
    description: 'Accumulate a total of 500 units of forging materials across all types in your warehouses.',
  },
  {
    id: 'ach_iron_energy_100',
    name: 'Energy Surplus',
    description: 'Reach 100 iron energy, demonstrating mastery over the bay power grid.',
  },
  {
    id: 'ach_steam_master',
    name: 'Steam Master',
    description: 'Achieve 200 steam pressure, pushing the bay systems to their maximum safe operating limits.',
  },
  {
    id: 'ach_arsenal_10',
    name: 'Growing Arsenal',
    description: 'Forge 10 weapons, building a respectable armory for yourself and your fleet.',
  },
  {
    id: 'ach_fleet_commander',
    name: 'Fleet Commander',
    description: 'Own 5 docked ships simultaneously, establishing yourself as a commander of the bay waters.',
  },
  {
    id: 'ach_master_smith',
    name: 'Master Smith',
    description: 'Forge 25 weapons, earning recognition as one of Iron Bay master craftsmen.',
  },
  {
    id: 'ach_structure_empire',
    name: 'Structure Empire',
    description: 'Build all 25 bay structures at least to level 1, creating a fully operational iron empire.',
  },
  {
    id: 'ach_trade_baron',
    name: 'Trade Baron',
    description: 'Complete 20 trade routes, amassing wealth and connections across the seas.',
  },
  {
    id: 'ach_rare_forge',
    name: 'Rare Forge',
    description: 'Successfully forge a Rare-tier weapon, proving your skill exceeds common craftsmanship.',
  },
  {
    id: 'ach_epic_creation',
    name: 'Epic Creation',
    description: 'Forge an Epic-tier weapon or armor, joining the ranks of legendary bay artisans.',
  },
  {
    id: 'ach_legendary_smith',
    name: 'Legendary Smith',
    description: 'Forge a Legendary-tier item, an achievement only a handful of smiths in history have accomplished.',
  },
  {
    id: 'ach_blueprint_scholar',
    name: 'Blueprint Scholar',
    description: 'Learn all 15 crafting blueprints, mastering every known recipe in Iron Bay archives.',
  },
  {
    id: 'ach_all_docks',
    name: 'Harbor Master',
    description: 'Unlock all 8 docks of Iron Bay, gaining access to every corner of the harbor.',
  },
  {
    id: 'ach_title_sovereign',
    name: 'Iron Sovereign',
    description: 'Earn the title of Iron Sovereign, the highest rank in Iron Bay hierarchy.',
  },
  {
    id: 'ach_bay_level_50',
    name: 'Bay Mastery',
    description: 'Reach bay level 50, demonstrating absolute mastery over every aspect of Iron Bay operations.',
  },
  {
    id: 'ach_total_forges_100',
    name: 'Century of Forges',
    description: 'Forge a total of 100 weapons, leaving an iron legacy that will endure for generations.',
  },
];

// ─── IB_TITLES: 8 Titles ───────────────────────────────────────────────────────

export const IB_TITLES: IBTitleDef[] = [
  {
    id: 'title_apprentice',
    name: 'Iron Apprentice',
    requirement: 0,
    description: 'A newcomer to Iron Bay who has just begun their journey in the art of iron forging and harbor management.',
  },
  {
    id: 'title_journeyman',
    name: 'Iron Journeyman',
    requirement: 500,
    description: 'A skilled worker who has completed their apprenticeship and can independently operate bay facilities.',
  },
  {
    id: 'title_smith',
    name: 'Iron Smith',
    requirement: 1500,
    description: 'A recognized smith of Iron Bay, capable of forging quality weapons and commanding respect in the harbor.',
  },
  {
    id: 'title_artificer',
    name: 'Iron Artificer',
    requirement: 3500,
    description: 'A master artificer who creates ingenious devices and weapons of remarkable quality and design.',
  },
  {
    id: 'title_commander',
    name: 'Iron Commander',
    requirement: 6000,
    description: 'A commander of Iron Bay forces, overseeing both the forge and the fleet with strategic brilliance.',
  },
  {
    id: 'title_champion',
    name: 'Iron Champion',
    requirement: 10000,
    description: 'A champion of Iron Bay who has proven their worth in battle, trade, and crafting beyond all doubt.',
  },
  {
    id: 'title_lord',
    name: 'Iron Lord',
    requirement: 18000,
    description: 'A lord of Iron Bay, ruling over the harbor and its people with wisdom, strength, and an iron will.',
  },
  {
    id: 'title_sovereign',
    name: 'Iron Sovereign',
    requirement: 30000,
    description: 'The supreme ruler of Iron Bay — master of forge, commander of fleets, and sovereign of all iron. Legends speak of your deeds in every port.',
  },
];

// ─── IB_TRADE_ROUTES: 12 Trade Routes ──────────────────────────────────────────

export const IB_TRADE_ROUTES: IBTradeRouteDef[] = [
  {
    id: 'route_coastal_run',
    name: 'Coastal Run',
    description: 'A short route hugging the coastline to the nearest fishing villages, trading iron tools for fresh provisions.',
    distance: 50,
    rewards: ['50 gold', '20 food supplies'],
    risks: ['Minor storms', 'Pirates'],
  },
  {
    id: 'route_copper_bay_exchange',
    name: 'Copper Bay Exchange',
    description: 'Trade with the artisans of Copper Bay, exchanging steel tools for their fine copper instruments and ornaments.',
    distance: 120,
    rewards: ['150 gold', 'Copper ingots', 'Brass instruments'],
    risks: ['Rough seas', 'Competitive traders'],
  },
  {
    id: 'route_coal_mine_supply',
    name: 'Coal Mine Supply Line',
    description: 'A vital supply route to the inland coal mines, bringing back the fuel that keeps every forge burning.',
    distance: 80,
    rewards: ['100 coal', '30 iron ore'],
    risks: ['Landslides', 'Bandits on land'],
  },
  {
    id: 'route_steel_island_trade',
    name: 'Steel Island Trade',
    description: 'Journey to the legendary Steel Island where independent smiths produce unique alloys unavailable elsewhere.',
    distance: 200,
    rewards: ['300 gold', 'Rare alloys', 'Blueprint fragments'],
    risks: ['Sea monsters', 'Treacherous currents', 'Fog'],
  },
  {
    id: 'route_north_titan_route',
    name: 'Northern Titan Route',
    description: 'A perilous northern route to reach titanium deposits in frozen mountains, passing through ice-filled waters.',
    distance: 350,
    rewards: ['Titanium shards', '200 gold', 'Arctic furs'],
    risks: ['Icebergs', 'Freezing temperatures', 'Whiteout storms'],
  },
  {
    id: 'route_southern_spice_ship',
    name: 'Southern Spice Ship',
    description: 'A long voyage south to trade iron weapons and tools for exotic spices and rare herbs.',
    distance: 500,
    rewards: ['500 gold', 'Rare herbs', 'Spices', 'Tropical wood'],
    risks: ['Tropical storms', 'Coral reefs', 'Scurvy'],
  },
  {
    id: 'route_eastern_empires',
    name: 'Eastern Empires Route',
    description: 'Cross the eastern sea to reach wealthy empires that pay premium prices for Iron Bay legendary steel.',
    distance: 600,
    rewards: ['1000 gold', 'Silk', 'Jade', 'Ancient scrolls'],
    risks: ['War fleets', 'Typhoons', 'Sea serpents'],
  },
  {
    id: 'route_volcanic_archipelago',
    name: 'Volcanic Archipelago',
    description: 'Navigate between volcanic islands to harvest rare minerals and trade with reclusive fire-smiths.',
    distance: 250,
    rewards: ['Volcanic glass', 'Deep crystals', '400 gold'],
    risks: ['Volcanic eruptions', 'Lava flows', 'Toxic gases'],
  },
  {
    id: 'route_abyssal_expedition',
    name: 'Abyssal Expedition',
    description: 'A deep-sea trade and exploration route to recover materials from the ocean floor and trade with merfolk settlements.',
    distance: 400,
    rewards: ['Abyssal materials', 'Deep crystals', '600 gold'],
    risks: ['Extreme depth pressure', 'Kraken', 'Hull breach'],
  },
  {
    id: 'route_sky_metal_route',
    name: 'Sky Metal Route',
    description: 'Follow ancient navigation charts to a floating island where meteorite metal can be harvested.',
    distance: 700,
    rewards: ['Star iron', 'Meteorite fragments', '1200 gold'],
    risks: ['Dimensional storms', 'Gravity anomalies', 'Air pirates'],
  },
  {
    id: 'route_world_circumnavigation',
    name: 'World Circumnavigation',
    description: 'The grandest trade route — circumnavigate the entire world, trading at every major port along the way.',
    distance: 2000,
    rewards: ['3000 gold', 'World maps', 'Rare materials from every port', 'Legendary reputation'],
    risks: ['Every known hazard', 'Months at sea', 'Crew mutiny', 'Unknown territories'],
  },
  {
    id: 'route_mythic_core_trade',
    name: 'Mythic Core Trade',
    description: 'The most dangerous and rewarding route — travel to the planetary core entrance to obtain world-iron and eternal forge fuel.',
    distance: 1500,
    rewards: ['World iron', 'Eternal forge fuel', '5000 gold', 'Mythic blueprints'],
    risks: ['Core heat', 'Magma beings', 'Dimensional rifts', 'Equipment failure'],
  },
];

// ─── Helper Functions ──────────────────────────────────────────────────────────

let ibInstanceCounter = 0;

function ibGenerateInstanceId(prefix: string): string {
  ibInstanceCounter++;
  return `${prefix}_${Date.now()}_${ibInstanceCounter}`;
}

function ibXpForBayLevel(level: number): number {
  if (level <= 0) return 0;
  if (level >= 50) return Infinity;
  return Math.floor(100 * level * (1 + level * 0.12));
}

function ibGetRarityMultiplier(rarity: IBRarity): number {
  return IB_RARITY_MULTIPLIERS[rarity] ?? 1;
}

function ibGetRarityLabel(rarity: IBRarity): string {
  return IB_RARITY_LABELS[rarity] ?? 'Unknown';
}

function ibGetRarityColor(rarity: IBRarity): string {
  return IB_RARITY_COLORS[rarity] ?? IB_COLOR_IRON;
}

function ibGetNextBayLevel(currentLevel: number, currentExp: number): { level: number; exp: number; leveledUp: boolean } {
  let level = currentLevel;
  let exp = currentExp;
  let leveledUp = false;
  const needed = ibXpForBayLevel(level + 1);
  if (needed !== Infinity && exp >= needed) {
    level = Math.min(level + 1, 50);
    exp = exp - ibXpForBayLevel(level);
    leveledUp = true;
  }
  return { level, exp, leveledUp };
}

function ibCreateInitialMaterials(): Record<string, number> {
  const initial: Record<string, number> = {};
  for (const mat of IB_MATERIALS) {
    initial[mat.id] = 0;
  }
  // Starting materials
  initial['mat_iron_ore'] = 10;
  initial['mat_coal'] = 8;
  initial['mat_scrap_iron'] = 5;
  return initial;
}

function ibCreateInitialStructures(): IBStructureInstance[] {
  return IB_STRUCTURES.map(s => ({
    instanceId: ibGenerateInstanceId('struct'),
    structureDefId: s.id,
    level: 0,
    builtAt: 0,
  }));
}

// ─── Main Hook ─────────────────────────────────────────────────────────────────

export default function useIronBay() {
  const stateRef = useRef<IBState | null>(null);

  const [state, setState] = useState<IBState>(() => ({
    ownedWeapons: [],
    dockedShips: [],
    materials: ibCreateInitialMaterials(),
    structures: ibCreateInitialStructures(),
    blueprints: ['bp_iron_blade'],
    tradeRoutes: [],
    achievements: [],
    currentTitle: 'title_apprentice',
    bayLevel: 1,
    bayExp: 0,
    gold: 100,
    ironEnergy: 50,
    steamPressure: 30,
    totalForged: 0,
    totalShipsBuilt: 0,
    totalTrades: 0,
    totalUpgrades: 0,
    activeDockId: 'dock_anvil',
    activeTradeId: null,
  }));

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const ibForgeWeapon = useCallback((blueprintId: string) => {
    setState(prev => {
      const blueprint = IB_BLUEPRINTS.find(b => b.id === blueprintId);
      if (!blueprint) return prev;
      if (!prev.blueprints.includes(blueprintId)) return prev;

      // Check materials
      const updatedMaterials = { ...prev.materials };
      for (const req of blueprint.requiredMaterials) {
        if ((updatedMaterials[req.materialId] ?? 0) < req.amount) {
          return prev;
        }
      }

      // Deduct materials
      for (const req of blueprint.requiredMaterials) {
        updatedMaterials[req.materialId] = (updatedMaterials[req.materialId] ?? 0) - req.amount;
      }

      // Find weapon def or ship def
      const weaponDef = IB_WEAPONS.find(w => w.id === blueprint.result);
      const shipDef = IB_SHIPS.find(s => s.id === blueprint.result);

      let newWeapons = [...prev.ownedWeapons];
      let newShips = [...prev.dockedShips];
      let totalForged = prev.totalForged;
      let totalShipsBuilt = prev.totalShipsBuilt;
      let bayExp = prev.bayExp;
      let gold = prev.gold;

      if (weaponDef) {
        const rarityMult = ibGetRarityMultiplier(weaponDef.rarity);
        const instance: IBWeaponInstance = {
          instanceId: ibGenerateInstanceId('wep'),
          weaponDefId: weaponDef.id,
          name: weaponDef.name,
          rarity: weaponDef.rarity,
          type: weaponDef.type,
          power: weaponDef.power,
          durability: weaponDef.durability,
          maxDurability: weaponDef.durability,
          level: 1,
          forgedAt: Date.now(),
        };
        newWeapons.push(instance);
        totalForged += 1;
        bayExp += Math.floor(20 * rarityMult);
      } else if (shipDef) {
        const rarityMult = ibGetRarityMultiplier(shipDef.rarity);
        const instance: IBShipInstance = {
          instanceId: ibGenerateInstanceId('ship'),
          shipDefId: shipDef.id,
          name: shipDef.name,
          rarity: shipDef.rarity,
          type: shipDef.type,
          capacity: shipDef.capacity,
          speed: shipDef.speed,
          durability: shipDef.durability,
          maxDurability: shipDef.durability,
          dockedAt: prev.activeDockId,
          builtAt: Date.now(),
        };
        newShips.push(instance);
        totalShipsBuilt += 1;
        bayExp += Math.floor(30 * rarityMult);
        gold += Math.floor(50 * rarityMult);
      }

      // Check for level up
      const levelResult = ibGetNextBayLevel(prev.bayLevel, bayExp);

      return {
        ...prev,
        ownedWeapons: newWeapons,
        dockedShips: newShips,
        materials: updatedMaterials,
        totalForged,
        totalShipsBuilt,
        bayExp: levelResult.exp,
        bayLevel: levelResult.level,
        gold,
      };
    });
  }, []);

  const ibUpgradeWeapon = useCallback((weaponInstanceId: string) => {
    setState(prev => {
      const weapon = prev.ownedWeapons.find(w => w.instanceId === weaponInstanceId);
      if (!weapon) return prev;
      if (weapon.level >= 10) return prev;

      const upgradeCost = Math.floor(50 * weapon.level * ibGetRarityMultiplier(weapon.rarity));
      if (prev.gold < upgradeCost) return prev;

      const newWeapons = prev.ownedWeapons.map(w => {
        if (w.instanceId !== weaponInstanceId) return w;
        const newLevel = w.level + 1;
        return {
          ...w,
          level: newLevel,
          power: Math.floor(w.power * 1.15),
          maxDurability: Math.floor(w.maxDurability * 1.1),
          durability: Math.floor(w.maxDurability * 1.1),
        };
      });

      return {
        ...prev,
        ownedWeapons: newWeapons,
        gold: prev.gold - upgradeCost,
        bayExp: prev.bayExp + 15,
        totalUpgrades: prev.totalUpgrades + 1,
      };
    });
  }, []);

  const ibBuildShip = useCallback((shipDefId: string) => {
    setState(prev => {
      const shipDef = IB_SHIPS.find(s => s.id === shipDefId);
      if (!shipDef) return prev;

      const buildCost = Math.floor(100 * ibGetRarityMultiplier(shipDef.rarity));
      if (prev.gold < buildCost) return prev;
      if (prev.ironEnergy < 20) return prev;

      const instance: IBShipInstance = {
        instanceId: ibGenerateInstanceId('ship'),
        shipDefId: shipDef.id,
        name: shipDef.name,
        rarity: shipDef.rarity,
        type: shipDef.type,
        capacity: shipDef.capacity,
        speed: shipDef.speed,
        durability: shipDef.durability,
        maxDurability: shipDef.durability,
        dockedAt: prev.activeDockId,
        builtAt: Date.now(),
      };

      const rarityMult = ibGetRarityMultiplier(shipDef.rarity);
      const levelResult = ibGetNextBayLevel(prev.bayLevel, prev.bayExp + Math.floor(30 * rarityMult));

      return {
        ...prev,
        dockedShips: [...prev.dockedShips, instance],
        gold: prev.gold - buildCost,
        ironEnergy: prev.ironEnergy - 20,
        totalShipsBuilt: prev.totalShipsBuilt + 1,
        bayExp: levelResult.exp,
        bayLevel: levelResult.level,
      };
    });
  }, []);

  const ibRepairShip = useCallback((shipInstanceId: string) => {
    setState(prev => {
      const ship = prev.dockedShips.find(s => s.instanceId === shipInstanceId);
      if (!ship) return prev;
      if (ship.durability >= ship.maxDurability) return prev;

      const repairCost = Math.floor((ship.maxDurability - ship.durability) * 0.5);
      if (prev.gold < repairCost) return prev;

      const newShips = prev.dockedShips.map(s => {
        if (s.instanceId !== shipInstanceId) return s;
        return { ...s, durability: s.maxDurability };
      });

      return {
        ...prev,
        dockedShips: newShips,
        gold: prev.gold - repairCost,
        bayExp: prev.bayExp + 5,
      };
    });
  }, []);

  const ibSmeltIron = useCallback((materialId: string) => {
    setState(prev => {
      const material = IB_MATERIALS.find(m => m.id === materialId);
      if (!material) return prev;
      if ((prev.materials[materialId] ?? 0) < 3) return prev;
      if (prev.steamPressure < 10) return prev;

      const updatedMaterials = { ...prev.materials };
      updatedMaterials[materialId] = (updatedMaterials[materialId] ?? 0) - 3;

      // Smelting produces iron ore or steel bar depending on source
      if (material.rarity === 'common' || material.rarity === 'uncommon') {
        updatedMaterials['mat_steel_bar'] = (updatedMaterials['mat_steel_bar'] ?? 0) + 1;
      } else {
        updatedMaterials['mat_steel_bar'] = (updatedMaterials['mat_steel_bar'] ?? 0) + 2;
      }

      return {
        ...prev,
        materials: updatedMaterials,
        steamPressure: prev.steamPressure - 10,
        bayExp: prev.bayExp + 8,
      };
    });
  }, []);

  const ibAlloyMaterials = useCallback((materialA: string, materialB: string) => {
    setState(prev => {
      if ((prev.materials[materialA] ?? 0) < 2) return prev;
      if ((prev.materials[materialB] ?? 0) < 2) return prev;
      if (prev.steamPressure < 15) return prev;

      const updatedMaterials = { ...prev.materials };
      updatedMaterials[materialA] = (updatedMaterials[materialA] ?? 0) - 2;
      updatedMaterials[materialB] = (updatedMaterials[materialB] ?? 0) - 2;

      // Determine what alloy is produced based on input materials
      const matADef = IB_MATERIALS.find(m => m.id === materialA);
      const matBDef = IB_MATERIALS.find(m => m.id === materialB);

      if ((matADef?.name.includes('Copper') || matBDef?.name.includes('Copper')) &&
          (matADef?.name.includes('Tin') || matBDef?.name.includes('Tin'))) {
        updatedMaterials['mat_brass_sheet'] = (updatedMaterials['mat_brass_sheet'] ?? 0) + 2;
      } else {
        updatedMaterials['mat_steel_bar'] = (updatedMaterials['mat_steel_bar'] ?? 0) + 1;
      }

      return {
        ...prev,
        materials: updatedMaterials,
        steamPressure: prev.steamPressure - 15,
        bayExp: prev.bayExp + 12,
      };
    });
  }, []);

  const ibBuildStructure = useCallback((structDefId: string) => {
    setState(prev => {
      const structDef = IB_STRUCTURES.find(s => s.id === structDefId);
      if (!structDef) return prev;

      const existing = prev.structures.find(s => s.structureDefId === structDefId);
      if (existing && existing.level > 0) return prev;

      if (prev.gold < structDef.baseCost) return prev;
      if (prev.ironEnergy < 30) return prev;

      const newStructures = prev.structures.map(s => {
        if (s.structureDefId !== structDefId) return s;
        return {
          ...s,
          level: 1,
          builtAt: Date.now(),
        };
      });

      return {
        ...prev,
        structures: newStructures,
        gold: prev.gold - structDef.baseCost,
        ironEnergy: prev.ironEnergy - 30,
        bayExp: prev.bayExp + 25,
        totalUpgrades: prev.totalUpgrades + 1,
      };
    });
  }, []);

  const ibUpgradeStructure = useCallback((structDefId: string) => {
    setState(prev => {
      const structDef = IB_STRUCTURES.find(s => s.id === structDefId);
      if (!structDef) return prev;

      const existing = prev.structures.find(s => s.structureDefId === structDefId);
      if (!existing || existing.level === 0) return prev;
      if (existing.level >= structDef.maxLevel) return prev;

      const upgradeCost = Math.floor(structDef.baseCost * (existing.level + 1) * 1.5);
      if (prev.gold < upgradeCost) return prev;
      if (prev.ironEnergy < 15) return prev;

      const newStructures = prev.structures.map(s => {
        if (s.structureDefId !== structDefId) return s;
        return { ...s, level: s.level + 1 };
      });

      return {
        ...prev,
        structures: newStructures,
        gold: prev.gold - upgradeCost,
        ironEnergy: prev.ironEnergy - 15,
        bayExp: prev.bayExp + 20,
        totalUpgrades: prev.totalUpgrades + 1,
      };
    });
  }, []);

  const ibSetDock = useCallback((dockId: string) => {
    setState(prev => {
      const dock = IB_DOCKS.find(d => d.id === dockId);
      if (!dock) return prev;
      if (prev.bayLevel < dock.unlockLevel) return prev;

      return {
        ...prev,
        activeDockId: dockId,
      };
    });
  }, []);

  const ibExpandDock = useCallback((dockId: string) => {
    setState(prev => {
      const dock = IB_DOCKS.find(d => d.id === dockId);
      if (!dock) return prev;

      const expansionCost = Math.floor(200 * (dock.unlockLevel * 0.5 + 1));
      if (prev.gold < expansionCost) return prev;
      if (prev.ironEnergy < 40) return prev;

      return {
        ...prev,
        gold: prev.gold - expansionCost,
        ironEnergy: prev.ironEnergy - 40,
        bayExp: prev.bayExp + 30,
        totalUpgrades: prev.totalUpgrades + 1,
      };
    });
  }, []);

  const ibLaunchTrade = useCallback((routeId: string) => {
    setState(prev => {
      const route = IB_TRADE_ROUTES.find(r => r.id === routeId);
      if (!route) return prev;
      if (prev.steamPressure < 20) return prev;
      if (prev.activeTradeId !== null) return prev;

      const tradeCost = Math.floor(route.distance * 0.5);
      if (prev.gold < tradeCost) return prev;

      const instance: IBTradeRouteInstance = {
        instanceId: ibGenerateInstanceId('trade'),
        routeDefId: routeId,
        launchedAt: Date.now(),
        shipInstanceId: null,
        completed: false,
      };

      return {
        ...prev,
        tradeRoutes: [...prev.tradeRoutes, instance],
        gold: prev.gold - tradeCost,
        steamPressure: prev.steamPressure - 20,
        activeTradeId: instance.instanceId,
        bayExp: prev.bayExp + Math.floor(route.distance * 0.1),
      };
    });
  }, []);

  const ibCompleteTrade = useCallback((tradeInstanceId: string) => {
    setState(prev => {
      const trade = prev.tradeRoutes.find(t => t.instanceId === tradeInstanceId);
      if (!trade) return prev;
      if (trade.completed) return prev;

      const route = IB_TRADE_ROUTES.find(r => r.id === trade.routeDefId);
      if (!route) return prev;

      const rewardGold = Math.floor(route.distance * 2 + 50);
      const newMaterials = { ...prev.materials };

      // Award random materials based on distance
      const commonMats = IB_MATERIALS.filter(m => m.rarity === 'common');
      const uncommonMats = IB_MATERIALS.filter(m => m.rarity === 'uncommon');
      const rareMats = IB_MATERIALS.filter(m => m.rarity === 'rare');

      if (route.distance > 1000) {
        const rareMat = rareMats[Math.floor(route.distance) % rareMats.length];
        newMaterials[rareMat.id] = (newMaterials[rareMat.id] ?? 0) + 1;
      }
      if (route.distance > 400) {
        const uncommonMat = uncommonMats[Math.floor(route.distance) % uncommonMats.length];
        newMaterials[uncommonMat.id] = (newMaterials[uncommonMat.id] ?? 0) + 2;
      }
      const commonMat = commonMats[Math.floor(route.distance) % commonMats.length];
      newMaterials[commonMat.id] = (newMaterials[commonMat.id] ?? 0) + 3;

      const newTrades = prev.tradeRoutes.map(t => {
        if (t.instanceId !== tradeInstanceId) return t;
        return { ...t, completed: true };
      });

      const totalTrades = prev.totalTrades + 1;
      const bayExp = prev.bayExp + Math.floor(route.distance * 0.15);
      const levelResult = ibGetNextBayLevel(prev.bayLevel, bayExp);

      return {
        ...prev,
        tradeRoutes: newTrades,
        materials: newMaterials,
        gold: prev.gold + rewardGold,
        totalTrades,
        activeTradeId: null,
        bayExp: levelResult.exp,
        bayLevel: levelResult.level,
      };
    });
  }, []);

  const ibCollectMaterial = useCallback((materialId: string) => {
    setState(prev => {
      const material = IB_MATERIALS.find(m => m.id === materialId);
      if (!material) return prev;
      if (prev.ironEnergy < 5) return prev;

      const amount = material.rarity === 'common' ? 3 : material.rarity === 'uncommon' ? 2 : 1;
      const updatedMaterials = { ...prev.materials };
      updatedMaterials[materialId] = (updatedMaterials[materialId] ?? 0) + amount;

      return {
        ...prev,
        materials: updatedMaterials,
        ironEnergy: prev.ironEnergy - 5,
        bayExp: prev.bayExp + Math.floor(5 * ibGetRarityMultiplier(material.rarity)),
      };
    });
  }, []);

  const ibTradeMaterial = useCallback((matA: string, matB: string, count: number) => {
    setState(prev => {
      if ((prev.materials[matA] ?? 0) < count) return prev;
      if ((prev.materials[matB] ?? 0) < count) return prev;
      if (prev.gold < Math.floor(count * 5)) return prev;

      const updatedMaterials = { ...prev.materials };
      updatedMaterials[matA] = (updatedMaterials[matA] ?? 0) - count;
      updatedMaterials[matB] = (updatedMaterials[matB] ?? 0) - count;

      // Give back a different material of higher rarity if possible
      const matADef = IB_MATERIALS.find(m => m.id === matA);
      if (matADef) {
        const higherMats = IB_MATERIALS.filter(m => {
          const rarityOrder: IBRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
          const currentIdx = rarityOrder.indexOf(matADef.rarity);
          const nextIdx = currentIdx + 1;
          if (nextIdx >= rarityOrder.length) return false;
          return m.rarity === rarityOrder[nextIdx];
        });
        if (higherMats.length > 0) {
          const rewardMat = higherMats[Math.floor(count) % higherMats.length];
          updatedMaterials[rewardMat.id] = (updatedMaterials[rewardMat.id] ?? 0) + 1;
        }
      }

      return {
        ...prev,
        materials: updatedMaterials,
        gold: prev.gold - Math.floor(count * 5),
        bayExp: prev.bayExp + 3,
      };
    });
  }, []);

  const ibUnlockTitle = useCallback((titleId: string) => {
    setState(prev => {
      const title = IB_TITLES.find(t => t.id === titleId);
      if (!title) return prev;
      if (prev.bayLevel < 10) return prev;

      const totalExp = prev.bayExp + prev.bayLevel * 100;
      if (totalExp < title.requirement) return prev;

      return {
        ...prev,
        currentTitle: titleId,
        bayExp: prev.bayExp + 50,
      };
    });
  }, []);

  const ibClaimAchievement = useCallback((achievementId: string) => {
    setState(prev => {
      const achievement = IB_ACHIEVEMENTS.find(a => a.id === achievementId);
      if (!achievement) return prev;
      if (prev.achievements.includes(achievementId)) return prev;

      // Check conditions
      let canClaim = false;
      if (achievementId === 'ach_first_spark' && prev.totalForged >= 1) canClaim = true;
      if (achievementId === 'ach_dock_hands' && prev.totalShipsBuilt >= 1) canClaim = true;
      if (achievementId === 'ach_material_hoarder') {
        const totalMats = Object.values(prev.materials).reduce((a, b) => a + b, 0);
        if (totalMats >= 500) canClaim = true;
      }
      if (achievementId === 'ach_iron_energy_100' && prev.ironEnergy >= 100) canClaim = true;
      if (achievementId === 'ach_steam_master' && prev.steamPressure >= 200) canClaim = true;
      if (achievementId === 'ach_arsenal_10' && prev.ownedWeapons.length >= 10) canClaim = true;
      if (achievementId === 'ach_fleet_commander' && prev.dockedShips.length >= 5) canClaim = true;
      if (achievementId === 'ach_master_smith' && prev.totalForged >= 25) canClaim = true;
      if (achievementId === 'ach_structure_empire') {
        const builtStructures = prev.structures.filter(s => s.level > 0).length;
        if (builtStructures >= 25) canClaim = true;
      }
      if (achievementId === 'ach_trade_baron' && prev.totalTrades >= 20) canClaim = true;
      if (achievementId === 'ach_rare_forge') {
        if (prev.ownedWeapons.some(w => w.rarity === 'rare')) canClaim = true;
      }
      if (achievementId === 'ach_epic_creation') {
        if (prev.ownedWeapons.some(w => w.rarity === 'epic')) canClaim = true;
      }
      if (achievementId === 'ach_legendary_smith') {
        if (prev.ownedWeapons.some(w => w.rarity === 'legendary')) canClaim = true;
      }
      if (achievementId === 'ach_blueprint_scholar' && prev.blueprints.length >= 15) canClaim = true;
      if (achievementId === 'ach_all_docks') {
        const unlockedDocks = IB_DOCKS.filter(d => prev.bayLevel >= d.unlockLevel).length;
        if (unlockedDocks >= 8) canClaim = true;
      }
      if (achievementId === 'ach_title_sovereign' && prev.currentTitle === 'title_sovereign') canClaim = true;
      if (achievementId === 'ach_bay_level_50' && prev.bayLevel >= 50) canClaim = true;
      if (achievementId === 'ach_total_forges_100' && prev.totalForged >= 100) canClaim = true;

      if (!canClaim) return prev;

      return {
        ...prev,
        achievements: [...prev.achievements, achievementId],
        gold: prev.gold + 100,
        bayExp: prev.bayExp + 50,
      };
    });
  }, []);

  const ibAdjustSteam = useCallback((pressure: number) => {
    setState(prev => {
      const newPressure = Math.max(0, Math.min(300, prev.steamPressure + pressure));
      return {
        ...prev,
        steamPressure: newPressure,
      };
    });
  }, []);

  const ibSellWeapon = useCallback((weaponInstanceId: string) => {
    setState(prev => {
      const weapon = prev.ownedWeapons.find(w => w.instanceId === weaponInstanceId);
      if (!weapon) return prev;

      const sellPrice = Math.floor(weapon.power * 0.3 * ibGetRarityMultiplier(weapon.rarity) * weapon.level);

      return {
        ...prev,
        ownedWeapons: prev.ownedWeapons.filter(w => w.instanceId !== weaponInstanceId),
        gold: prev.gold + sellPrice,
        bayExp: prev.bayExp + 5,
      };
    });
  }, []);

  const ibLearnBlueprint = useCallback((blueprintId: string) => {
    setState(prev => {
      const blueprint = IB_BLUEPRINTS.find(b => b.id === blueprintId);
      if (!blueprint) return prev;
      if (prev.blueprints.includes(blueprintId)) return prev;

      const learnCost = Math.floor(50 * ibGetRarityMultiplier(blueprint.rarity));
      if (prev.gold < learnCost) return prev;

      return {
        ...prev,
        blueprints: [...prev.blueprints, blueprintId],
        gold: prev.gold - learnCost,
        bayExp: prev.bayExp + 15,
      };
    });
  }, []);

  const ibExploreBay = useCallback(() => {
    setState(prev => {
      if (prev.ironEnergy < 10) return prev;

      const updatedMaterials = { ...prev.materials };
      // Find random materials based on bay level
      const availableMats = IB_MATERIALS.filter(m => {
        const rarityOrder: IBRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        const matIdx = rarityOrder.indexOf(m.rarity);
        const maxRarityIdx = Math.min(Math.floor(prev.bayLevel / 12), 4);
        return matIdx <= maxRarityIdx;
      });

      if (availableMats.length > 0) {
        const foundMat = availableMats[(prev.bayLevel + prev.totalForged) % availableMats.length];
        const amount = foundMat.rarity === 'common' ? 5 : foundMat.rarity === 'uncommon' ? 3 : 1;
        updatedMaterials[foundMat.id] = (updatedMaterials[foundMat.id] ?? 0) + amount;
      }

      const goldFound = Math.floor(10 + prev.bayLevel * 3);
      const expGained = Math.floor(10 + prev.bayLevel * 2);

      return {
        ...prev,
        materials: updatedMaterials,
        gold: prev.gold + goldFound,
        ironEnergy: prev.ironEnergy - 10,
        bayExp: prev.bayExp + expGained,
      };
    });
  }, []);

  // ─── Natural resource regeneration ───────────────────────────────────────────

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const ironRegen = 2 + Math.floor(prev.bayLevel * 0.3);
        const steamRegen = 1 + Math.floor(prev.bayLevel * 0.2);
        const newIron = Math.min(prev.ironEnergy + ironRegen, 300);
        const newSteam = Math.min(prev.steamPressure + steamRegen, 300);
        return {
          ...prev,
          ironEnergy: newIron,
          steamPressure: newSteam,
        };
      });
    }, 5000);
    return () => { clearInterval(interval); };
  }, []);

  // ─── Getters (useMemo) ───────────────────────────────────────────────────────

  const ibGetOwnedWeapons = useMemo(() => {
    return state.ownedWeapons.map(w => {
      const def = IB_WEAPONS.find(d => d.id === w.weaponDefId);
      return {
        ...w,
        description: def?.description ?? '',
        typeName: def?.type ?? w.type,
      };
    });
  }, [state]);

  const ibGetDockedShips = useMemo(() => {
    return state.dockedShips.map(s => {
      const def = IB_SHIPS.find(d => d.id === s.shipDefId);
      return {
        ...s,
        description: def?.description ?? '',
      };
    });
  }, [state]);

  const ibGetMaterialInventory = useMemo(() => {
    return IB_MATERIALS.map(m => ({
      ...m,
      count: state.materials[m.id] ?? 0,
    })).filter(m => m.count > 0);
  }, [state]);

  const ibGetAvailableBlueprints = useMemo(() => {
    return IB_BLUEPRINTS.filter(bp => state.blueprints.includes(bp.id));
  }, [state]);

  const ibGetStructureList = useMemo(() => {
    return state.structures.map(s => {
      const def = IB_STRUCTURES.find(d => d.id === s.structureDefId);
      return {
        ...s,
        name: def?.name ?? 'Unknown',
        description: def?.description ?? '',
        type: def?.type ?? 'forge',
        maxLevel: def?.maxLevel ?? 10,
        baseCost: def?.baseCost ?? 0,
      };
    });
  }, [state]);

  const ibGetTradeRoutes = useMemo(() => {
    return state.tradeRoutes.map(tr => {
      const def = IB_TRADE_ROUTES.find(d => d.id === tr.routeDefId);
      return {
        ...tr,
        name: def?.name ?? 'Unknown Route',
        description: def?.description ?? '',
        distance: def?.distance ?? 0,
        rewards: def?.rewards ?? [],
        risks: def?.risks ?? [],
      };
    });
  }, [state]);

  const ibGetTotalArmory = useMemo(() => {
    return state.ownedWeapons.reduce((total, w) => total + w.power, 0);
  }, [state]);

  const ibGetBayCapacity = useMemo(() => {
    const activeDock = IB_DOCKS.find(d => d.id === state.activeDockId);
    const dockCapacity = activeDock?.capacity ?? 0;
    const shipsAtDock = state.dockedShips.filter(s => s.dockedAt === state.activeDockId).length;
    return {
      used: shipsAtDock,
      max: dockCapacity,
      remaining: dockCapacity - shipsAtDock,
    };
  }, [state]);

  const ibGetSteamEfficiency = useMemo(() => {
    if (state.steamPressure === 0) return 0;
    const baseEfficiency = 50;
    const pressureBonus = Math.min(state.steamPressure, 200) * 0.25;
    const structureBonus = state.structures
      .filter(s => s.level > 0)
      .reduce((bonus, s) => {
        const def = IB_STRUCTURES.find(d => d.id === s.structureDefId);
        if (def?.type === 'forge' || def?.type === 'workshop') {
          return bonus + s.level * 2;
        }
        return bonus;
      }, 0);
    const total = Math.min(baseEfficiency + pressureBonus + structureBonus, 100);
    return Math.floor(total);
  }, [state]);

  const ibGetNextTitle = useMemo(() => {
    const currentTitleIdx = IB_TITLES.findIndex(t => t.id === state.currentTitle);
    if (currentTitleIdx < 0 || currentTitleIdx >= IB_TITLES.length - 1) return null;
    return IB_TITLES[currentTitleIdx + 1];
  }, [state]);

  const ibGetRaritySummary = useMemo(() => {
    const summary: Record<IBRarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    };
    for (const weapon of state.ownedWeapons) {
      summary[weapon.rarity] += 1;
    }
    for (const ship of state.dockedShips) {
      summary[ship.rarity] += 1;
    }
    return summary;
  }, [state]);

  const ibGetDockSummary = useMemo(() => {
    return IB_DOCKS.map(dock => {
      const unlocked = state.bayLevel >= dock.unlockLevel;
      const shipsHere = unlocked
        ? state.dockedShips.filter(s => s.dockedAt === dock.id).length
        : 0;
      return {
        ...dock,
        unlocked,
        shipCount: shipsHere,
        available: dock.capacity - shipsHere,
      };
    });
  }, [state]);

  const ibGetUnlockedAchievements = useMemo(() => {
    return IB_ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: state.achievements.includes(a.id),
    }));
  }, [state]);

  const ibGetTitleProgress = useMemo(() => {
    const totalExp = state.bayExp + state.bayLevel * 100;
    const currentTitleIdx = IB_TITLES.findIndex(t => t.id === state.currentTitle);
    const currentTitle = IB_TITLES[currentTitleIdx] ?? IB_TITLES[0];
    const nextTitle = currentTitleIdx < IB_TITLES.length - 1
      ? IB_TITLES[currentTitleIdx + 1]
      : null;

    return {
      currentTitle,
      nextTitle,
      totalExp,
      progressToNext: nextTitle
        ? Math.min(100, Math.floor((totalExp / nextTitle.requirement) * 100))
        : 100,
      requirementMet: nextTitle ? totalExp >= nextTitle.requirement : true,
    };
  }, [state]);

  const ibGetCraftableWeapons = useMemo(() => {
    return IB_BLUEPRINTS.filter(bp => {
      if (!state.blueprints.includes(bp.id)) return false;
      for (const req of bp.requiredMaterials) {
        if ((state.materials[req.materialId] ?? 0) < req.amount) return false;
      }
      return true;
    });
  }, [state]);

  const ibGetActiveTrade = useMemo(() => {
    if (state.activeTradeId === null) return null;
    const trade = state.tradeRoutes.find(t => t.instanceId === state.activeTradeId);
    if (!trade) return null;
    const def = IB_TRADE_ROUTES.find(d => d.id === trade.routeDefId);
    return {
      ...trade,
      routeName: def?.name ?? 'Unknown',
      distance: def?.distance ?? 0,
      rewards: def?.rewards ?? [],
    };
  }, [state]);

  // ─── Computed values ─────────────────────────────────────────────────────────

  const ibXpToNextLevel = useMemo(() => {
    return ibXpForBayLevel(state.bayLevel + 1);
  }, [state.bayLevel]);

  const ibLevelProgress = useMemo(() => {
    const needed = ibXpForBayLevel(state.bayLevel + 1);
    if (needed === Infinity) return 100;
    return Math.floor((state.bayExp / needed) * 100);
  }, [state.bayExp, state.bayLevel]);

  const ibUnlockedDocks = useMemo(() => {
    return IB_DOCKS.filter(d => state.bayLevel >= d.unlockLevel);
  }, [state.bayLevel]);

  const ibLearnableBlueprints = useMemo(() => {
    return IB_BLUEPRINTS.filter(bp => !state.blueprints.includes(bp.id));
  }, [state.blueprints]);

  // ─── Returned API ────────────────────────────────────────────────────────────

  const ibAPI = {
    // State
    ...state,

    // Actions
    ibForgeWeapon,
    ibUpgradeWeapon,
    ibBuildShip,
    ibRepairShip,
    ibSmeltIron,
    ibAlloyMaterials,
    ibBuildStructure,
    ibUpgradeStructure,
    ibSetDock,
    ibExpandDock,
    ibLaunchTrade,
    ibCompleteTrade,
    ibCollectMaterial,
    ibTradeMaterial,
    ibUnlockTitle,
    ibClaimAchievement,
    ibAdjustSteam,
    ibSellWeapon,
    ibLearnBlueprint,
    ibExploreBay,

    // Getters
    ibGetOwnedWeapons,
    ibGetDockedShips,
    ibGetMaterialInventory,
    ibGetAvailableBlueprints,
    ibGetStructureList,
    ibGetTradeRoutes,
    ibGetTotalArmory,
    ibGetBayCapacity,
    ibGetSteamEfficiency,
    ibGetNextTitle,
    ibGetRaritySummary,
    ibGetDockSummary,
    ibGetUnlockedAchievements,
    ibGetTitleProgress,
    ibGetCraftableWeapons,
    ibGetActiveTrade,
    ibXpToNextLevel,
    ibLevelProgress,
    ibUnlockedDocks,
    ibLearnableBlueprints,

    // Constants
    IB_DOCKS,
    IB_WEAPONS,
    IB_SHIPS,
    IB_MATERIALS,
    IB_STRUCTURES,
    IB_BLUEPRINTS,
    IB_ABILITIES,
    IB_ACHIEVEMENTS,
    IB_TITLES,
    IB_TRADE_ROUTES,
    IB_COLOR_IRON,
    IB_COLOR_STEEL,
    IB_COLOR_STEAM,
    IB_COLOR_COAL,
    IB_COLOR_COPPER,
    IB_COLOR_FORGE,
    IB_COLOR_RUST,
    IB_COLOR_TITAN,
  };

  return ibAPI;
}
