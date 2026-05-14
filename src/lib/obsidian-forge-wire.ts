import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ─── Color Theme Constants ────────────────────────────────────────────────────
const OB_OBSIDIAN = '#1A1A2E';
const OB_VOLCANIC_ORANGE = '#FF6B35';
const OB_MOLTEN_GOLD = '#FFD700';
const OB_CRYSTAL_BLUE = '#00B4D8';
const OB_EMBER_RED = '#D62828';
const OB_LAVA_FLOW = '#FF4500';
const OB_SMOKE_GRAY = '#6C757D';
const OB_STONE_GRAY = '#495057';
const OB_ASH_WHITE = '#F8F9FA';
const OB_MAGMA_CORE = '#FF0044';
const OB_DEEP_CRIMSON = '#8B0000';
const OB_BRIMSTONE = '#FFAA00';
const OB_PYROCLAST = '#FF7043';
const OB_BASALT = '#2C2C3E';
const OB_PUMICE = '#B0A090';
const OB_GLAZE = '#E8D5B7';
const OB_FROST_OBSIDIAN = '#3A3A5C';

// ─── Rarity Tiers ─────────────────────────────────────────────────────────────
const OB_RARITY_COMMON = 0;
const OB_RARITY_UNUSUAL = 1;
const OB_RARITY_RARE = 2;
const OB_RARITY_EPIC = 3;
const OB_RARITY_LEGENDARY = 4;

const OB_RARITY_NAMES: Record<number, string> = {
  [OB_RARITY_COMMON]: 'Common',
  [OB_RARITY_UNUSUAL]: 'Unusual',
  [OB_RARITY_RARE]: 'Rare',
  [OB_RARITY_EPIC]: 'Epic',
  [OB_RARITY_LEGENDARY]: 'Legendary',
};

const OB_RARITY_COLORS: Record<number, string> = {
  [OB_RARITY_COMMON]: OB_SMOKE_GRAY,
  [OB_RARITY_UNUSUAL]: OB_CRYSTAL_BLUE,
  [OB_RARITY_RARE]: OB_VOLCANIC_ORANGE,
  [OB_RARITY_EPIC]: OB_MOLTEN_GOLD,
  [OB_RARITY_LEGENDARY]: OB_MAGMA_CORE,
};

// ─── Artifact Types ───────────────────────────────────────────────────────────
const OB_TYPE_WEAPON = 'weapon';
const OB_TYPE_ARMOR = 'armor';
const OB_TYPE_SHIELD = 'shield';
const OB_TYPE_ACCESSORY = 'accessory';
const OB_TYPE_TOOL = 'tool';
const OB_TYPE_RELIC = 'relic';

const OB_TYPE_INFO: Record<string, { label: string; icon: string; color: string; desc: string }> = {
  [OB_TYPE_WEAPON]: { label: 'Weapon', icon: '⚔️', color: OB_VOLCANIC_ORANGE, desc: 'Deadly obsidian blades and warhammers forged in volcanic fury.' },
  [OB_TYPE_ARMOR]: { label: 'Armor', icon: '🛡️', color: OB_STONE_GRAY, desc: 'Protective gear of layered volcanic glass and molten steel.' },
  [OB_TYPE_SHIELD]: { label: 'Shield', icon: '🔰', color: OB_CRYSTAL_BLUE, desc: 'Defensive barriers that absorb and deflect devastating blows.' },
  [OB_TYPE_ACCESSORY]: { label: 'Accessory', icon: '💍', color: OB_MOLTEN_GOLD, desc: 'Enchanted rings, amulets, and trinkets imbued with volcanic power.' },
  [OB_TYPE_TOOL]: { label: 'Tool', icon: '🔨', color: OB_SMOKE_GRAY, desc: 'Utility implements for mining, smelting, and crafting.' },
  [OB_TYPE_RELIC]: { label: 'Relic', icon: '✨', color: OB_MAGMA_CORE, desc: 'Ancient artifacts of immense power from the deep forge.' },
};

// ─── Forge Synergy Bonuses ────────────────────────────────────────────────────
const OB_SYNERGY_PAIRS: Array<{ a: string; b: string; bonus: string; value: number }> = [
  { a: 'struct_obsidian_crucible', b: 'struct_magma_anvil', bonus: 'forging_speed', value: 0.15 },
  { a: 'struct_crystal_kiln', b: 'struct_glass_blower', bonus: 'crystal_quality', value: 0.2 },
  { a: 'struct_ore_crusher', b: 'struct_magma_anvil', bonus: 'smelting_yield', value: 0.18 },
  { a: 'struct_volcano_core', b: 'struct_lava_channel', bonus: 'magma_power', value: 0.25 },
  { a: 'struct_fire_pit', b: 'struct_vent_shaft', bonus: 'forge_heat', value: 0.15 },
  { a: 'struct_quenching_tank', b: 'struct_tempering_forge', bonus: 'durability_bonus', value: 0.2 },
  { a: 'struct_gem_cutter', b: 'struct_enchantment_altar', bonus: 'enchant_power', value: 0.22 },
  { a: 'struct_armory_vault', b: 'struct_shield_forge', bonus: 'armor_strength', value: 0.18 },
  { a: 'struct_obsidian_mine', b: 'struct_ore_crusher', bonus: 'ore_gathering', value: 0.2 },
  { a: 'struct_lava_fountain', b: 'struct_fire_pit', bonus: 'heat_retention', value: 0.15 },
];

// ─── Daily Quest Templates ───────────────────────────────────────────────────
const OB_DAILY_QUEST_TEMPLATES: Array<{ description: string; type: OBDailyQuest['type']; reward: number; magmaBonus: number }> = [
  { description: 'Smelt 5 raw obsidian shards into workable ingots.', type: 'smelt', reward: 15, magmaBonus: 5 },
  { description: 'Forge a new weapon using the Magma Anvil.', type: 'forge', reward: 25, magmaBonus: 10 },
  { description: 'Temper a piece of armor in the Quenching Tank.', type: 'temper', reward: 20, magmaBonus: 8 },
  { description: 'Mine volcanic glass from the Obsidian Mines.', type: 'mine', reward: 18, magmaBonus: 7 },
  { description: 'Cut a crystal gem in the Crystal Kiln.', type: 'cut', reward: 22, magmaBonus: 9 },
  { description: 'Repair a damaged artifact in the Tempering Forge.', type: 'temper', reward: 28, magmaBonus: 11 },
  { description: 'Collect rare ores from the deep lava tunnels.', type: 'mine', reward: 30, magmaBonus: 12 },
  { description: 'Enchant an accessory at the Enchantment Altar.', type: 'enchant', reward: 35, magmaBonus: 14 },
  { description: 'Quench 3 molten steel bars in the Quenching Tank.', type: 'smelt', reward: 20, magmaBonus: 8 },
  { description: 'Reinforce a shield with volcanic glass layers.', type: 'forge', reward: 32, magmaBonus: 13 },
  { description: 'Mine basalt chunks from the outer caldera walls.', type: 'mine', reward: 16, magmaBonus: 6 },
  { description: 'Forge a legendary-quality tool for the workshop.', type: 'forge', reward: 40, magmaBonus: 16 },
  { description: 'Temper a blade using magma-infused water.', type: 'temper', reward: 24, magmaBonus: 10 },
  { description: 'Smelt brimstone ore into molten sulfur.', type: 'smelt', reward: 26, magmaBonus: 10 },
  { description: 'Cut a flawless gemstone at the Gem Cutter.', type: 'cut', reward: 38, magmaBonus: 15 },
];

// ─── Volcanic Eruption Events ─────────────────────────────────────────────────
const OB_ERUPTION_EVENTS: Array<{ name: string; severity: number; desc: string; damage: number }> = [
  { name: 'Minor Tremor', severity: 1, desc: 'A slight tremor rattles the forge, dislodging some loose materials.', damage: 2 },
  { name: 'Ash Cloud', severity: 1, desc: 'A billowing cloud of volcanic ash drifts through the chambers.', damage: 3 },
  { name: 'Lava Seep', severity: 2, desc: 'Molten lava seeps through a crack in the forge floor.', damage: 5 },
  { name: 'Gas Vent', severity: 2, desc: 'Toxic volcanic gases vent unexpectedly from fissures.', damage: 6 },
  { name: 'Pyroclastic Surge', severity: 3, desc: 'A wave of superheated gas and rock fragments sweeps through.', damage: 10 },
  { name: 'Magma Flood', severity: 3, desc: 'Magma overflows from the Volcano Core chamber.', damage: 12 },
  { name: 'Caldera Collapse', severity: 4, desc: 'Part of the caldera rim crumbles, damaging multiple chambers.', damage: 18 },
  { name: 'Volcanic Eruption', severity: 5, desc: 'A major eruption rocks the mountain, threatening all forge operations.', damage: 30 },
];

// ─── Forge Lore Entries ───────────────────────────────────────────────────────
const OB_LORE_ENTRIES: Array<{ id: string; title: string; text: string; chamber: string }> = [
  { id: 'ob_lore_001', title: 'The First Ember', text: 'Before the forge, there was a single ember, cast from the heart of the world. Its glow attracted the first stone-shapers, who built their anvils around it and named it Ignis Prima.', chamber: 'chamber_obsidian_crucible' },
  { id: 'ob_lore_002', title: 'The Obsidian Pact', text: 'The mountain spirits demanded a pact: every blade forged must carry a drop of the maker\'s blood. In return, the forge would never cool, and the mountain would never fall silent.', chamber: 'chamber_magma_anvil' },
  { id: 'ob_lore_003', title: 'The Great Tempering', text: 'When the first legendary armor cracked under dragon fire, the smith drowned it in magma for seven days and seven nights. It emerged unbreakable, and its maker earned the title "Obsidian Heart."', chamber: 'chamber_crystal_kiln' },
  { id: 'ob_lore_004', title: 'Song of the Lava', text: 'Deep beneath the forge, the magma hums a constant melody. Those who listen carefully can hear the rhythm of the earth\'s heartbeat, and from it, divine the perfect temperature for any alloy.', chamber: 'chamber_volcano_core' },
  { id: 'ob_lore_005', title: 'The Crystal Bloom', text: 'In the Crystal Kiln, volcanic minerals crystallize into impossible geometries. The rarest formation, the Infinity Crystal, grows in the shape of a blooming lotus that never opens.', chamber: 'chamber_crystal_kiln' },
  { id: 'ob_lore_006', title: 'Tears of the Mountain', text: 'When the volcano weeps, its tears harden into pure obsidian. The master miners descend into the lava channels to harvest these "tears" before they cool, for cooled obsidian is brittle.', chamber: 'chamber_lava_channel' },
  { id: 'ob_lore_007', title: 'The Enchantment Secret', text: 'The Enchantment Altar does not truly enchant. It removes impurities from the soul of the metal, allowing its true nature to express itself. The "magic" was always within the ore.', chamber: 'chamber_enchantment_altar' },
  { id: 'ob_lore_008', title: 'The Vault of Fallen Gods', text: 'Beneath the Armory Vault lie artifacts forged by gods who died in the first eruption. Their weapons still radiate divine heat, and some say their spirits linger in the steel.', chamber: 'chamber_armory_vault' },
];

// ─── 35 Obsidian Artifacts (5 Rarity Tiers) ───────────────────────────────────
const OB_ARTIFACT_DEFS = [
  // Common (7)
  { id: 'art_obsidian_dagger', name: 'Obsidian Dagger', rarity: OB_RARITY_COMMON, type: OB_TYPE_WEAPON, power: 10, durability: 50, desc: 'A crude but sharp dagger chipped from volcanic glass.' },
  { id: 'art_stone_bracers', name: 'Stone Bracers', rarity: OB_RARITY_COMMON, type: OB_TYPE_ARMOR, power: 8, durability: 60, desc: 'Simple stone wrist guards providing basic protection.' },
  { id: 'art_basalt_round_shield', name: 'Basalt Round Shield', rarity: OB_RARITY_COMMON, type: OB_TYPE_SHIELD, power: 9, durability: 70, desc: 'A small shield carved from dense basalt.' },
  { id: 'art_lava_rock_amulet', name: 'Lava Rock Amulet', rarity: OB_RARITY_COMMON, type: OB_TYPE_ACCESSORY, power: 7, durability: 80, desc: 'A warm amulet holding a chunk of porous lava rock.' },
  { id: 'art_mining_pick', name: 'Mining Pick', rarity: OB_RARITY_COMMON, type: OB_TYPE_TOOL, power: 11, durability: 55, desc: 'A sturdy pick for extracting ores from volcanic rock.' },
  { id: 'art_charm_of_embers', name: 'Charm of Embers', rarity: OB_RARITY_COMMON, type: OB_TYPE_ACCESSORY, power: 6, durability: 90, desc: 'A small charm that glows faintly with trapped embers.' },
  { id: 'art_scorched_blade', name: 'Scorched Blade', rarity: OB_RARITY_COMMON, type: OB_TYPE_WEAPON, power: 12, durability: 45, desc: 'A short blade blackened by fire, still serviceable.' },
  // Unusual (7)
  { id: 'art_volcanic_greatsword', name: 'Volcanic Greatsword', rarity: OB_RARITY_UNUSUAL, type: OB_TYPE_WEAPON, power: 28, durability: 90, desc: 'A massive sword forged from magma-infused steel.' },
  { id: 'art_magma_plate_helm', name: 'Magma Plate Helm', rarity: OB_RARITY_UNUSUAL, type: OB_TYPE_ARMOR, power: 25, durability: 110, desc: 'A helmet with magma veins running through its surface.' },
  { id: 'art_crystal_buckler', name: 'Crystal Buckler', rarity: OB_RARITY_UNUSUAL, type: OB_TYPE_SHIELD, power: 22, durability: 85, desc: 'A small shield reinforced with crystallized lava.' },
  { id: 'art_ring_of_fallign_fire', name: 'Ring of Falling Fire', rarity: OB_RARITY_UNUSUAL, type: OB_TYPE_ACCESSORY, power: 20, durability: 120, desc: 'A ring that causes sparks to rain when struck.' },
  { id: 'art_smithing_hammer', name: 'Smithing Hammer', rarity: OB_RARITY_UNUSUAL, type: OB_TYPE_TOOL, power: 26, durability: 95, desc: 'A well-balanced hammer for precise forging work.' },
  { id: 'art_pumice_armor_set', name: 'Pumice Armor Set', rarity: OB_RARITY_UNUSUAL, type: OB_TYPE_ARMOR, power: 24, durability: 100, desc: 'Lightweight armor made from hardened volcanic pumice.' },
  { id: 'art_firebrand_spear', name: 'Firebrand Spear', rarity: OB_RARITY_UNUSUAL, type: OB_TYPE_WEAPON, power: 27, durability: 80, desc: 'A spear whose tip burns with persistent flame.' },
  // Rare (7)
  { id: 'art_inferno_warblade', name: 'Inferno Warblade', rarity: OB_RARITY_RARE, type: OB_TYPE_WEAPON, power: 58, durability: 150, desc: 'A blade that burns white-hot in combat, melting through armor.' },
  { id: 'art_dragon_breastplate', name: 'Dragon Breastplate', rarity: OB_RARITY_RARE, type: OB_TYPE_ARMOR, power: 55, durability: 200, desc: 'Armor scales harvested from a volcanic dragon\'s hide.' },
  { id: 'art_glass_tower_shield', name: 'Glass Tower Shield', rarity: OB_RARITY_RARE, type: OB_TYPE_SHIELD, power: 52, durability: 180, desc: 'A tower shield of layered volcanic glass, nearly transparent.' },
  { id: 'art_magma_crown', name: 'Magma Crown', rarity: OB_RARITY_RARE, type: OB_TYPE_ACCESSORY, power: 48, durability: 250, desc: 'A crown with rivers of molten metal flowing between its points.' },
  { id: 'art_obsidian_golem_core', name: 'Obsidian Golem Core', rarity: OB_RARITY_RARE, type: OB_TYPE_RELIC, power: 60, durability: 300, desc: 'The power source of an ancient obsidian construct.' },
  { id: 'art_volcano_tongs', name: 'Volcano Tongs', rarity: OB_RARITY_RARE, type: OB_TYPE_TOOL, power: 50, durability: 170, desc: 'Tongs that can grip molten metal without being damaged.' },
  { id: 'art_crystalline_warbow', name: 'Crystalline Warbow', rarity: OB_RARITY_RARE, type: OB_TYPE_WEAPON, power: 54, durability: 130, desc: 'A bow made from a single piece of flexible volcanic crystal.' },
  // Epic (7)
  { id: 'art_heart_of_the_mountain', name: 'Heart of the Mountain', rarity: OB_RARITY_EPIC, type: OB_TYPE_RELIC, power: 120, durability: 500, desc: 'A crystallized fragment of the volcano\'s living core, pulsing with geothermal energy.' },
  { id: 'art_infernal_plate', name: 'Infernal Plate Armor', rarity: OB_RARITY_EPIC, type: OB_TYPE_ARMOR, power: 115, durability: 400, desc: 'Full plate armor that radiates heat, burning all who touch it unbidden.' },
  { id: 'art_avalanche_greatshield', name: 'Avalanche Greatshield', rarity: OB_RARITY_EPIC, type: OB_TYPE_SHIELD, power: 110, durability: 450, desc: 'A shield so heavy it creates shockwaves when slammed into the ground.' },
  { id: 'art_phoenix_talon', name: 'Phoenix Talon', rarity: OB_RARITY_EPIC, type: OB_TYPE_WEAPON, power: 125, durability: 200, desc: 'A dagger carved from a phoenix beak, eternally wreathed in sacred flame.' },
  { id: 'art_earthblood_necklace', name: 'Earthblood Necklace', rarity: OB_RARITY_EPIC, type: OB_TYPE_ACCESSORY, power: 100, durability: 600, desc: 'Contains a vial of liquid magma drawn from the planet\'s mantle.' },
  { id: 'art_titan_crusher', name: 'Titan Crusher Hammer', rarity: OB_RARITY_EPIC, type: OB_TYPE_TOOL, power: 118, durability: 350, desc: 'A hammer that can shatter mountains with a single strike.' },
  { id: 'art_ashen_specter_blade', name: 'Ashen Specter Blade', rarity: OB_RARITY_EPIC, type: OB_TYPE_WEAPON, power: 112, durability: 250, desc: 'A blade that exists partially in the spirit realm, striking through defenses.' },
  // Legendary (7)
  { id: 'art_calamity_edge', name: 'Calamity Edge', rarity: OB_RARITY_LEGENDARY, type: OB_TYPE_WEAPON, power: 280, durability: 800, desc: 'A sword that was once the fang of the primordial volcano beast, capable of cleaving continents.' },
  { id: 'art_worldforge_armor', name: 'Worldforge Armor', rarity: OB_RARITY_LEGENDARY, type: OB_TYPE_ARMOR, power: 260, durability: 1000, desc: 'Armor forged in the core of the world itself, impervious to all damage.' },
  { id: 'art_eternal_bastion', name: 'Eternal Bastion', rarity: OB_RARITY_LEGENDARY, type: OB_TYPE_SHIELD, power: 270, durability: 1200, desc: 'A shield that creates a pocket dimension of absolute protection around its wielder.' },
  { id: 'art_eye_of_the_volcano', name: 'Eye of the Volcano', rarity: OB_RARITY_LEGENDARY, type: OB_TYPE_RELIC, power: 300, durability: 2000, desc: 'The sentient core of the original volcano, granting omniscience over all geothermal activity.' },
  { id: 'art_crown_of_magma_lords', name: 'Crown of the Magma Lords', rarity: OB_RARITY_LEGENDARY, type: OB_TYPE_ACCESSORY, power: 250, durability: 1500, desc: 'Worn by the ancient rulers of the deep forge, it commands absolute obedience from all fire.' },
  { id: 'art_starfall_anvil', name: 'Starfall Anvil', rarity: OB_RARITY_LEGENDARY, type: OB_TYPE_TOOL, power: 240, durability: 900, desc: 'An anvil forged from a meteorite that struck the volcano, capable of shaping star-metal.' },
  { id: 'art_infinity_forge_blade', name: 'Infinity Forge Blade', rarity: OB_RARITY_LEGENDARY, type: OB_TYPE_WEAPON, power: 290, durability: 700, desc: 'A blade that grows sharper with every strike, with no theoretical limit to its edge.' },
];

// ─── 8 Forge Chambers ─────────────────────────────────────────────────────────
const OB_CHAMBER_DEFS = [
  { id: 'chamber_obsidian_crucible', name: 'Obsidian Crucible', desc: 'The primary smelting chamber where raw ores are melted down into workable ingots.', icon: '🌋', unlockPower: 0, heatRequired: 0 },
  { id: 'chamber_magma_anvil', name: 'Magma Anvil', desc: 'A colossal anvil built atop a magma vent, ideal for forging heavy weapons and armor.', icon: '🔨', unlockPower: 50, heatRequired: 5 },
  { id: 'chamber_crystal_kiln', name: 'Crystal Kiln', desc: 'A specialized kiln for growing and cutting volcanic crystals and gemstones.', icon: '💎', unlockPower: 150, heatRequired: 10 },
  { id: 'chamber_quenching_tank', name: 'Quenching Tank', desc: 'Magma-heated tanks of enchanted water for rapid cooling and tempering.', icon: '💧', unlockPower: 300, heatRequired: 15 },
  { id: 'chamber_volcano_core', name: 'Volcano Core', desc: 'The deepest chamber, tapping directly into the planet\'s molten heart for raw power.', icon: '🔥', unlockPower: 500, heatRequired: 20 },
  { id: 'chamber_lava_channel', name: 'Lava Channel', desc: 'Redirected lava flows that power the forge\'s machinery and transport systems.', icon: '🌊', unlockPower: 750, heatRequired: 25 },
  { id: 'chamber_enchantment_altar', name: 'Enchantment Altar', desc: 'An ancient altar where artifacts are imbued with elemental properties.', icon: '✨', unlockPower: 1000, heatRequired: 30 },
  { id: 'chamber_armory_vault', name: 'Armory Vault', desc: 'A massive underground vault storing the most powerful artifacts ever forged.', icon: '🏛️', unlockPower: 2000, heatRequired: 50 },
];

// ─── 30 Forge Materials/Ores ──────────────────────────────────────────────────
const OB_MATERIAL_DEFS = [
  // Common (6)
  { id: 'mat_obsidian_shard', name: 'Obsidian Shard', rarity: OB_RARITY_COMMON, value: 5, desc: 'A sharp fragment of volcanic glass.' },
  { id: 'mat_basalt_chunk', name: 'Basalt Chunk', rarity: OB_RARITY_COMMON, value: 4, desc: 'A dense block of volcanic rock.' },
  { id: 'mat_coal_ember', name: 'Coal Ember', rarity: OB_RARITY_COMMON, value: 3, desc: 'A glowing piece of volcanic coal.' },
  { id: 'mat_pumice_stone', name: 'Pumice Stone', rarity: OB_RARITY_COMMON, value: 3, desc: 'A lightweight porous volcanic stone.' },
  { id: 'mat_scorched_iron', name: 'Scorched Iron', rarity: OB_RARITY_COMMON, value: 6, desc: 'Iron ore exposed to volcanic heat.' },
  { id: 'mat_ash_dust', name: 'Ash Dust', rarity: OB_RARITY_COMMON, value: 2, desc: 'Fine volcanic ash used as flux in smelting.' },
  // Unusual (6)
  { id: 'mat_magma_crystal', name: 'Magma Crystal', rarity: OB_RARITY_UNUSUAL, value: 15, desc: 'A partially molten crystal with inner fire.' },
  { id: 'mat_fire_opal', name: 'Fire Opal', rarity: OB_RARITY_UNUSUAL, value: 18, desc: 'An opal that glows with internal flame.' },
  { id: 'mat_volcanic_sulfur', name: 'Volcanic Sulfur', rarity: OB_RARITY_UNUSUAL, value: 12, desc: 'Bright yellow sulfur deposits near vents.' },
  { id: 'mat_molten_copper', name: 'Molten Copper', rarity: OB_RARITY_UNUSUAL, value: 14, desc: 'Copper kept in a perpetual liquid state.' },
  { id: 'mat_lava_glass', name: 'Lava Glass', rarity: OB_RARITY_UNUSUAL, value: 16, desc: 'Transparent glass formed from cooled lava flows.' },
  { id: 'mat_heat_treated_steel', name: 'Heat-Treated Steel', rarity: OB_RARITY_UNUSUAL, value: 20, desc: 'Steel tempered in volcanic flames for extra hardness.' },
  // Rare (6)
  { id: 'mat_infinity_obsidian', name: 'Infinity Obsidian', rarity: OB_RARITY_RARE, value: 50, desc: 'Obsidian with self-repairing molecular structure.' },
  { id: 'mat_dragon_scale', name: 'Dragon Scale', rarity: OB_RARITY_RARE, value: 55, desc: 'A scale shed by a volcanic dragon.' },
  { id: 'mat_earthcore_gem', name: 'Earthcore Gem', rarity: OB_RARITY_RARE, value: 60, desc: 'A gemstone pulled from deep within the planet\'s crust.' },
  { id: 'mat_plasma_ingot', name: 'Plasma Ingot', rarity: OB_RARITY_RARE, value: 48, desc: 'A solid ingot of contained plasma.' },
  { id: 'mat_volcanic_titanium', name: 'Volcanic Titanium', rarity: OB_RARITY_RARE, value: 52, desc: 'Titanium alloyed with volcanic minerals.' },
  { id: 'mat_magma_essence', name: 'Magma Essence', rarity: OB_RARITY_RARE, value: 58, desc: 'Pure distilled essence of volcanic magma.' },
  // Epic (6)
  { id: 'mat_primordial_heat', name: 'Primordial Heat', rarity: OB_RARITY_EPIC, value: 160, desc: 'Bottled heat from the world\'s creation, never cooling.' },
  { id: 'mat_phoenix_feather_steel', name: 'Phoenix Feather Steel', rarity: OB_RARITY_EPIC, value: 170, desc: 'Steel alloyed with phoenix feather ash.' },
  { id: 'mat_mantle_core_fragment', name: 'Mantle Core Fragment', rarity: OB_RARITY_EPIC, value: 180, desc: 'A piece of the mantle core, radiating immense geothermal energy.' },
  { id: 'mat_starfire_obsidian', name: 'Starfire Obsidian', rarity: OB_RARITY_EPIC, value: 155, desc: 'Obsidian infused with radiation from a dying star.' },
  { id: 'mat_godsblood_alloy', name: 'Godsblood Alloy', rarity: OB_RARITY_EPIC, value: 175, desc: 'An alloy containing trace amounts of divine essence.' },
  { id: 'mat_abyssal_glass', name: 'Abyssal Glass', rarity: OB_RARITY_EPIC, value: 165, desc: 'Glass forged in the abyss between tectonic plates.' },
  // Legendary (6)
  { id: 'mat_worldheart_obsidian', name: 'Worldheart Obsidian', rarity: OB_RARITY_LEGENDARY, value: 500, desc: 'Obsidian from the very heart of the world, pulsing with planetary energy.' },
  { id: 'mat_eternal_magma', name: 'Eternal Magma', rarity: OB_RARITY_LEGENDARY, value: 550, desc: 'Magma that will never cool, maintaining perfect forging temperature forever.' },
  { id: 'mat_cosmic_forge_slag', name: 'Cosmic Forge Slag', rarity: OB_RARITY_LEGENDARY, value: 520, desc: 'Slag from the cosmic forge that created the solar system.' },
  { id: 'mat_infinity_crystal', name: 'Infinity Crystal', rarity: OB_RARITY_LEGENDARY, value: 600, desc: 'A crystal that contains an infinite reflection of itself.' },
  { id: 'mat_void_obsidian', name: 'Void Obsidian', rarity: OB_RARITY_LEGENDARY, value: 580, desc: 'Obsidian from a pocket dimension of pure heat.' },
  { id: 'mat_divine_anvil_fragment', name: 'Divine Anvil Fragment', rarity: OB_RARITY_LEGENDARY, value: 650, desc: 'A shard of the anvil upon which gods forged the world.' },
];

// ─── 25 Forge Structures (Upgradeable to Lv10) ────────────────────────────────
const OB_STRUCTURE_DEFS = [
  { id: 'struct_obsidian_crucible', name: 'Obsidian Crucible', desc: 'Primary smelting vessel for melting raw ores into ingots.', maxLevel: 10, baseCost: 10 },
  { id: 'struct_magma_anvil', name: 'Magma Anvil', desc: 'A massive anvil positioned over a magma vent for heavy forging.', maxLevel: 10, baseCost: 15 },
  { id: 'struct_crystal_kiln', name: 'Crystal Kiln', desc: 'Specialized kiln for growing and shaping volcanic crystals.', maxLevel: 10, baseCost: 12 },
  { id: 'struct_glass_blower', name: 'Glass Blower', desc: 'Shapes molten lava glass into useful containers and lenses.', maxLevel: 10, baseCost: 8 },
  { id: 'struct_ore_crusher', name: 'Ore Crusher', desc: 'Crushes raw volcanic rock to extract embedded ores.', maxLevel: 10, baseCost: 20 },
  { id: 'struct_fire_pit', name: 'Fire Pit', desc: 'An open hearth for basic forging and tool maintenance.', maxLevel: 10, baseCost: 10 },
  { id: 'struct_quenching_tank', name: 'Quenching Tank', desc: 'Rapid cooling tanks for tempering forged metal.', maxLevel: 10, baseCost: 18 },
  { id: 'struct_tempering_forge', name: 'Tempering Forge', desc: 'A controlled-heat forge for precise metal tempering.', maxLevel: 10, baseCost: 22 },
  { id: 'struct_vent_shaft', name: 'Vent Shaft', desc: 'Channels volcanic gases upward to power forge bellows.', maxLevel: 10, baseCost: 14 },
  { id: 'struct_gem_cutter', name: 'Gem Cutter', desc: 'Precision tools for cutting and polishing volcanic gems.', maxLevel: 10, baseCost: 25 },
  { id: 'struct_enchantment_altar', name: 'Enchantment Altar', desc: 'An ancient altar where magical properties are imbued into items.', maxLevel: 10, baseCost: 35 },
  { id: 'struct_shield_forge', name: 'Shield Forge', desc: 'A wide-anvil forge specifically designed for shield crafting.', maxLevel: 10, baseCost: 28 },
  { id: 'struct_lava_channel', name: 'Lava Channel', desc: 'Redirected lava flows that transport materials between chambers.', maxLevel: 10, baseCost: 30 },
  { id: 'struct_volcano_core', name: 'Volcano Core Tap', desc: 'A borehole tapping the volcano\'s magma chamber for raw power.', maxLevel: 10, baseCost: 40 },
  { id: 'struct_lava_fountain', name: 'Lava Fountain', desc: 'A decorative fountain that circulates and cools lava for display.', maxLevel: 10, baseCost: 16 },
  { id: 'struct_obsidian_mine', name: 'Obsidian Mine', desc: 'Deep mining shafts for extracting raw obsidian and ores.', maxLevel: 10, baseCost: 45 },
  { id: 'struct_armory_vault', name: 'Armory Vault', desc: 'Secure storage for finished artifacts and rare materials.', maxLevel: 10, baseCost: 50 },
  { id: 'struct_fire_bellows', name: 'Fire Bellows', desc: 'Massive bellows powered by volcanic gas for superheating forges.', maxLevel: 10, baseCost: 20 },
  { id: 'struct_slag_heap', name: 'Slag Heap', desc: 'A managed waste pile where forge slag is sorted for useful remnants.', maxLevel: 10, baseCost: 8 },
  { id: 'struct_lava_bridge', name: 'Lava Bridge', desc: 'A bridge of hardened lava connecting forge chambers.', maxLevel: 10, baseCost: 32 },
  { id: 'struct_cooling_rack', name: 'Cooling Rack', desc: 'Massive racks where newly forged items cool evenly.', maxLevel: 10, baseCost: 12 },
  { id: 'struct_magma_pump', name: 'Magma Pump', desc: 'Pumps molten metal from the core tap to individual forges.', maxLevel: 10, baseCost: 38 },
  { id: 'struct_inferno_gate', name: 'Inferno Gate', desc: 'The main entrance gate reinforced with obsidian plating.', maxLevel: 10, baseCost: 55 },
  { id: 'struct_world_forge', name: 'World Forge', desc: 'The legendary central forge where the greatest artifacts are born.', maxLevel: 10, baseCost: 70 },
  { id: 'struct_magma_reservoir', name: 'Magma Reservoir', desc: 'A vast underground tank storing magma for extended forging sessions.', maxLevel: 10, baseCost: 60 },
];

// ─── 22 Forging Abilities ─────────────────────────────────────────────────────
const OB_ABILITY_DEFS = [
  { id: 'ability_magma_flow', name: 'Magma Flow', desc: 'Doubles forging speed for 30 seconds.', cooldown: 120, heatCost: 20, type: 'buff' },
  { id: 'ability_volcanic_armor', name: 'Volcanic Armor', desc: 'Grants temporary fire resistance to all artifacts.', cooldown: 180, heatCost: 25, type: 'defense' },
  { id: 'ability_obsidian_edge', name: 'Obsidian Edge', desc: 'Increases weapon sharpness by 300% briefly.', cooldown: 90, heatCost: 15, type: 'buff' },
  { id: 'ability_lava_blast', name: 'Lava Blast', desc: 'Unleashes a torrent of lava at enemies.', cooldown: 60, heatCost: 10, type: 'attack' },
  { id: 'ability_eruption_freeze', name: 'Eruption Freeze', desc: 'Freezes all volcanic activity for 20 seconds.', cooldown: 300, heatCost: 40, type: 'defense' },
  { id: 'ability_rapid_forge', name: 'Rapid Forge', desc: 'Instantly completes one forging project.', cooldown: 240, heatCost: 30, type: 'production' },
  { id: 'ability_magma_wave', name: 'Magma Wave', desc: 'Sends a wave of magma that knocks back threats.', cooldown: 75, heatCost: 12, type: 'attack' },
  { id: 'ability_heat_treat', name: 'Heat Treat', desc: 'Applies supreme heat treatment to all items in range.', cooldown: 200, heatCost: 20, type: 'buff' },
  { id: 'ability_reverse_flow', name: 'Reverse Flow', desc: 'Reverses lava direction, confusing hazards.', cooldown: 150, heatCost: 18, type: 'debuff' },
  { id: 'ability_magnetic_pull', name: 'Magnetic Pull', desc: 'Attracts all metal ores within a large radius.', cooldown: 100, heatCost: 14, type: 'collection' },
  { id: 'ability_inferno_beam', name: 'Inferno Beam', desc: 'Channels raw volcanic fury into a devastating beam.', cooldown: 360, heatCost: 50, type: 'attack' },
  { id: 'ability_fortify_walls', name: 'Fortify Walls', desc: 'Doubles structure integrity for 45 seconds.', cooldown: 180, heatCost: 22, type: 'defense' },
  { id: 'ability_slag_extract', name: 'Slag Extract', desc: 'Extracts useful ore from forge slag piles.', cooldown: 120, heatCost: 16, type: 'resource' },
  { id: 'ability_forge_rally', name: 'Forge Rally', desc: 'All artifacts gain a power boost for 30 seconds.', cooldown: 200, heatCost: 28, type: 'buff' },
  { id: 'ability_heat_trap', name: 'Heat Trap', desc: 'Deploys superheated floor traps that burn intruders.', cooldown: 90, heatCost: 10, type: 'defense' },
  { id: 'ability_emergency_repair', name: 'Emergency Repair', desc: 'Instantly repairs one structure to full integrity.', cooldown: 150, heatCost: 20, type: 'repair' },
  { id: 'ability_survey_scan', name: 'Survey Scan', desc: 'Scans for nearby ore deposits and hidden chambers.', cooldown: 120, heatCost: 12, type: 'scout' },
  { id: 'ability_magma_bolt', name: 'Magma Bolt', desc: 'Fires a bolt of concentrated magma at a target.', cooldown: 180, heatCost: 30, type: 'attack' },
  { id: 'ability_crystal_resonance', name: 'Crystal Resonance', desc: 'Synchronizes all crystals for maximum energy output.', cooldown: 240, heatCost: 35, type: 'buff' },
  { id: 'ability_vent_erupt', name: 'Vent Erupt', desc: 'Opens all vents simultaneously, releasing stored pressure.', cooldown: 300, heatCost: 45, type: 'attack' },
  { id: 'ability_volcano_awakening', name: 'Volcano Awakening', desc: 'Temporarily imbues one artifact with legendary-tier power.', cooldown: 600, heatCost: 80, type: 'ultimate' },
  { id: 'ability_worldforge_blessing', name: 'Worldforge Blessing', desc: 'Channels the power of the World Forge, restoring all heat and magma.', cooldown: 900, heatCost: 100, type: 'ultimate' },
];

// ─── 18 Achievements ──────────────────────────────────────────────────────────
const OB_ACHIEVEMENT_DEFS = [
  { id: 'ach_first_spark', name: 'First Spark', desc: 'Forge your first artifact.', condition: (s: OBState) => s.artifacts.length >= 1 },
  { id: 'ach_magma_rising', name: 'Magma Rising', desc: 'Reach 50 forge heat.', condition: (s: OBState) => s.forgeHeat >= 50 },
  { id: 'ach_ore_collector', name: 'Ore Collector', desc: 'Collect 10 different forge materials.', condition: (s: OBState) => s.materials.filter(p => p.count > 0).length >= 10 },
  { id: 'ach_chamber_explorer', name: 'Chamber Explorer', desc: 'Visit 3 different forge chambers.', condition: (s: OBState) => s.chambersVisited >= 3 },
  { id: 'ach_structure_builder', name: 'Structure Builder', desc: 'Build 5 forge structures.', condition: (s: OBState) => s.structures.filter(st => st.level > 0).length >= 5 },
  { id: 'ach_eruption_survivor', name: 'Eruption Survivor', desc: 'Survive 10 volcanic events.', condition: (s: OBState) => s.totalEruptionsSurvived >= 10 },
  { id: 'ach_apprentice_smith', name: 'Apprentice Smith', desc: 'Forge 10 artifacts total.', condition: (s: OBState) => s.totalForged >= 10 },
  { id: 'ach_heat_master', name: 'Heat Master', desc: 'Reach 200 forge heat.', condition: (s: OBState) => s.forgeHeat >= 200 },
  { id: 'ach_rare_creation', name: 'Rare Creation', desc: 'Forge a Rare or higher tier artifact.', condition: (s: OBState) => s.artifacts.some(a => a.rarity >= OB_RARITY_RARE) },
  { id: 'ach_daily_dedication', name: 'Daily Dedication', desc: 'Complete 5 daily quests.', condition: (s: OBState) => s.dailyQuestsCompleted >= 5 },
  { id: 'ach_epic_forge', name: 'Epic Forge', desc: 'Upgrade any structure to level 7.', condition: (s: OBState) => s.structures.some(st => st.level >= 7) },
  { id: 'ach_ability_master', name: 'Ability Master', desc: 'Activate 50 forging abilities total.', condition: (s: OBState) => s.totalAbilitiesUsed >= 50 },
  { id: 'ach_forge_power_500', name: 'Rising Power', desc: 'Reach 500 forge power.', condition: (s: OBState) => s.forgePower >= 500 },
  { id: 'ach_all_chambers', name: 'Cartographer', desc: 'Unlock all 8 forge chambers.', condition: (s: OBState) => s.chambersUnlocked >= 8 },
  { id: 'ach_legendary_forged', name: 'Legendary Forged', desc: 'Forge a Legendary artifact.', condition: (s: OBState) => s.artifacts.some(a => a.rarity === OB_RARITY_LEGENDARY) },
  { id: 'ach_max_structure', name: 'Maxed Out', desc: 'Upgrade any structure to level 10.', condition: (s: OBState) => s.structures.some(st => st.level >= 10) },
  { id: 'ach_heat_efficiency', name: 'Heat Efficiency', desc: 'Reach 95% forge efficiency.', condition: (s: OBState) => s.forgeEfficiency >= 95 },
  { id: 'ach_obsidian_god', name: 'Obsidian God', desc: 'Earn the Obsidian God title.', condition: (s: OBState) => s.titleIndex >= 7 },
];

// ─── 8 Titles ─────────────────────────────────────────────────────────────────
const OB_TITLE_DEFS = [
  { name: 'Stone Apprentice', requirement: 0, desc: 'A beginner who has just begun chipping stones.' },
  { name: 'Ember Tender', requirement: 100, desc: 'Can tend the forge fires and maintain heat.' },
  { name: 'Magma Smith', requirement: 300, desc: 'Masters the art of shaping molten metal.' },
  { name: 'Obsidian Artificer', requirement: 600, desc: 'Crafts fine obsidian artifacts with volcanic skill.' },
  { name: 'Volcano Warden', requirement: 1000, desc: 'Guards the forge against eruptions and intruders.' },
  { name: 'Crystal Sage', requirement: 1800, desc: 'Understands the mysteries of volcanic crystals.' },
  { name: 'Forge Sovereign', requirement: 3000, desc: 'Rules over the volcanic workshop with fiery authority.' },
  { name: 'Obsidian God', requirement: 5000, desc: 'The supreme being of all volcanic creation.' },
];

// ─── Internal Types ───────────────────────────────────────────────────────────
interface OBArtifact {
  instanceId: string;
  defId: string;
  name: string;
  rarity: number;
  type: string;
  power: number;
  durability: number;
  maxDurability: number;
  level: number;
  forgedAt: number;
}

interface OBStructure {
  defId: string;
  level: number;
  integrity: number;
  maxIntegrity: number;
}

interface OBMaterial {
  defId: string;
  count: number;
}

interface OBAbility {
  defId: string;
  lastUsed: number;
  timesUsed: number;
  unlocked: boolean;
}

interface OBAchievement {
  defId: string;
  unlocked: boolean;
  unlockedAt: number;
}

interface OBDailyQuest {
  id: string;
  description: string;
  completed: boolean;
  reward: number;
  type: 'smelt' | 'forge' | 'temper' | 'mine' | 'cut' | 'enchant';
}

interface OBChamber {
  defId: string;
  unlocked: boolean;
  heatLevel: number;
  efficiency: number;
}

interface OBEventLog {
  id: string;
  timestamp: number;
  type: 'forge' | 'upgrade' | 'ability' | 'repair' | 'smelt' | 'mine' | 'temper' | 'chamber' | 'achievement' | 'eruption' | 'title' | 'daily' | 'enchant' | 'disassemble' | 'quench';
  message: string;
  chamber?: string;
  metadata?: Record<string, number | string | boolean>;
}

interface OBState {
  artifacts: OBArtifact[];
  chambers: OBChamber[];
  materials: OBMaterial[];
  structures: OBStructure[];
  abilities: OBAbility[];
  achievements: OBAchievement[];
  currentChamber: string;
  forgeHeat: number;
  magmaFlow: number;
  totalForged: number;
  eruptionDanger: number;
  titleIndex: number;
  forgePower: number;
  forgeEfficiency: number;
  dailyQuest: OBDailyQuest | null;
  // Tracking counters
  chambersVisited: number;
  totalEruptionsSurvived: number;
  totalAbilitiesUsed: number;
  dailyQuestsCompleted: number;
  totalOresSmelted: number;
  totalRepairs: number;
  totalMaterialsMined: number;
  // Cooldowns
  activeBuffs: { abilityId: string; expiresAt: number }[];
  lastDailyReset: number;
  // Event log
  eventLog: OBEventLog[];
  // Advanced metrics
  defenseRating: number;
  productionRate: number;
  researchProgress: number;
  chambersUnlocked: number;
  totalDisassembled: number;
  totalQuenched: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
let obInstanceCounter = 0;
function generateOBInstanceId(prefix: string): string {
  obInstanceCounter++;
  return `${prefix}_${Date.now()}_${obInstanceCounter}`;
}

function formatOBCooldown(seconds: number): string {
  if (seconds <= 0) return 'Ready';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function getOBRarityLabel(rarity: number): string {
  return OB_RARITY_NAMES[rarity] ?? 'Unknown';
}

function getOBRarityColor(rarity: number): string {
  return OB_RARITY_COLORS[rarity] ?? OB_SMOKE_GRAY;
}

function getOBTypeInfo(type: string) {
  return OB_TYPE_INFO[type] ?? { label: 'Unknown', icon: '❓', color: OB_SMOKE_GRAY, desc: 'No type information available.' };
}

function calculateSynergyBonus(state: OBState): Record<string, number> {
  const bonuses: Record<string, number> = {};
  for (const pair of OB_SYNERGY_PAIRS) {
    const a = state.structures.find(s => s.defId === pair.a);
    const b = state.structures.find(s => s.defId === pair.b);
    if (a && b && a.level > 0 && b.level > 0) {
      bonuses[pair.bonus] = (bonuses[pair.bonus] ?? 0) + pair.value * Math.min(a.level, b.level);
    }
  }
  return bonuses;
}

function rollEruptionEvent(): typeof OB_ERUPTION_EVENTS[0] | null {
  const roll = Math.random() * 100;
  if (roll > 15) return null;
  const severityRoll = Math.random() * 100;
  if (severityRoll < 40) return OB_ERUPTION_EVENTS[0];
  if (severityRoll < 70) return OB_ERUPTION_EVENTS[Math.floor(Math.random() * 3) + 1];
  if (severityRoll < 90) return OB_ERUPTION_EVENTS[Math.floor(Math.random() * 2) + 4];
  return OB_ERUPTION_EVENTS[Math.floor(Math.random() * 2) + 6];
}

function computeDefenseRating(state: OBState): number {
  let defense = 10;
  const infernoLevel = state.structures.find(s => s.defId === 'struct_inferno_gate')?.level || 0;
  const worldForgeLevel = state.structures.find(s => s.defId === 'struct_world_forge')?.level || 0;
  const armoryLevel = state.structures.find(s => s.defId === 'struct_armory_vault')?.level || 0;
  defense += infernoLevel * 8;
  defense += worldForgeLevel * 12;
  defense += armoryLevel * 5;
  for (const art of state.artifacts) {
    if (art.type === OB_TYPE_SHIELD || art.type === OB_TYPE_ARMOR) {
      defense += Math.floor(art.power * 0.08 * (art.durability / art.maxDurability));
    }
  }
  const synergies = calculateSynergyBonus(state);
  defense *= (1 + (synergies['armor_strength'] ?? 0));
  return Math.floor(defense);
}

function computeProductionRate(state: OBState): number {
  let production = 1;
  const crusherLevel = state.structures.find(s => s.defId === 'struct_ore_crusher')?.level || 0;
  const mineLevel = state.structures.find(s => s.defId === 'struct_obsidian_mine')?.level || 0;
  const ventLevel = state.structures.find(s => s.defId === 'struct_vent_shaft')?.level || 0;
  production += crusherLevel * 0.8;
  production += mineLevel * 1.0;
  production += ventLevel * 0.4;
  for (const art of state.artifacts) {
    if (art.type === OB_TYPE_TOOL) {
      production += Math.floor(art.power * 0.04);
    }
  }
  production *= (state.forgeEfficiency / 100);
  return Math.floor(production * 10) / 10;
}

function computeResearchProgress(state: OBState): number {
  const altarLevel = state.structures.find(s => s.defId === 'struct_enchantment_altar')?.level || 0;
  const worldForgeLevel = state.structures.find(s => s.defId === 'struct_world_forge')?.level || 0;
  let progress = altarLevel * 10 + worldForgeLevel * 15;
  for (const art of state.artifacts) {
    if (art.type === OB_TYPE_RELIC) {
      progress += Math.floor(art.power * 0.06);
    }
  }
  const synergies = calculateSynergyBonus(state);
  progress *= (1 + (synergies['enchant_power'] ?? 0));
  return Math.floor(progress);
}

function computeForgePower(state: OBState): number {
  let power = 0;
  for (const art of state.artifacts) {
    power += art.power * (1 + art.level * 0.15);
  }
  for (const struct of state.structures) {
    power += struct.level * 5;
  }
  for (const ch of state.chambers) {
    if (ch.unlocked) {
      power += Math.floor(ch.efficiency * 0.5);
    }
  }
  const matsCollected = state.materials.filter(p => p.count > 0).length;
  power += matsCollected * 3;
  const achsUnlocked = state.achievements.filter(a => a.unlocked).length;
  power += achsUnlocked * 10;
  power = Math.floor(power * (state.forgeEfficiency / 100));
  return power;
}

function computeForgeEfficiency(state: OBState): number {
  let eff = 100;
  eff -= Math.floor(state.eruptionDanger * 0.3);
  const structuresBuilt = state.structures.filter(s => s.level > 0);
  for (const struct of structuresBuilt) {
    const def = OB_STRUCTURE_DEFS.find(d => d.id === struct.defId);
    if (def && def.name === 'Quenching Tank') {
      eff += struct.level * 0.5;
    }
    if (def && def.name === 'Cooling Rack') {
      eff += struct.level * 0.3;
    }
  }
  if (state.artifacts.length > 0) {
    const avgDur = state.artifacts.reduce((sum, a) => sum + a.durability / a.maxDurability, 0) / state.artifacts.length;
    eff *= (0.5 + avgDur * 0.5);
  }
  for (const buff of state.activeBuffs) {
    if (buff.abilityId === 'ability_heat_treat') {
      eff += 10;
    }
  }
  return Math.max(0, Math.min(100, Math.floor(eff)));
}

function computeEruptionDanger(state: OBState): number {
  let baseDanger = 0;
  for (const ch of state.chambers) {
    if (ch.unlocked) {
      baseDanger += ch.heatLevel * 0.3;
    }
  }
  if (state.artifacts.length > 0) {
    const avgDur = state.artifacts.reduce((sum, a) => sum + a.durability / a.maxDurability, 0) / state.artifacts.length;
    baseDanger *= (1.1 - avgDur * 0.2);
  }
  const ventLevel = state.structures.find(s => s.defId === 'struct_vent_shaft')?.level || 0;
  baseDanger *= Math.max(0.2, 1 - ventLevel * 0.05);
  return Math.max(0, Math.min(100, Math.floor(baseDanger)));
}

function createInitialMaterials(): OBMaterial[] {
  return OB_MATERIAL_DEFS.map(m => ({ defId: m.id, count: 0 }));
}

function createInitialStructures(): OBStructure[] {
  return OB_STRUCTURE_DEFS.map(s => ({
    defId: s.id,
    level: 0,
    integrity: 0,
    maxIntegrity: 100,
  }));
}

function createInitialAbilities(): OBAbility[] {
  return OB_ABILITY_DEFS.slice(0, 8).map(a => ({
    defId: a.id,
    lastUsed: 0,
    timesUsed: 0,
    unlocked: true,
  })).concat(
    OB_ABILITY_DEFS.slice(8).map(a => ({
      defId: a.id,
      lastUsed: 0,
      timesUsed: 0,
      unlocked: false,
    }))
  );
}

function createInitialAchievements(): OBAchievement[] {
  return OB_ACHIEVEMENT_DEFS.map(a => ({
    defId: a.id,
    unlocked: false,
    unlockedAt: 0,
  }));
}

function createInitialChambers(): OBChamber[] {
  return OB_CHAMBER_DEFS.map((c, i) => ({
    defId: c.id,
    unlocked: i === 0,
    heatLevel: i === 0 ? 30 : 0,
    efficiency: i === 0 ? 100 : 0,
  }));
}

function generateDailyQuest(): OBDailyQuest {
  const templates = OB_DAILY_QUEST_TEMPLATES;
  const template = templates[Math.floor(Math.random() * templates.length)];
  return {
    id: generateOBInstanceId('quest'),
    description: template.description,
    completed: false,
    reward: template.reward,
    type: template.type,
  };
}

function computeUpgradeCost(baseCost: number, currentLevel: number): number {
  return Math.floor(baseCost * Math.pow(1.5, currentLevel));
}

function computeForgeCost(artifactDefId: string, state: OBState): number {
  const def = OB_ARTIFACT_DEFS.find(a => a.id === artifactDefId);
  if (!def) return 999999;
  const rarityMultiplier = [1, 2, 5, 12, 30][def.rarity] || 1;
  return Math.floor(def.power * rarityMultiplier * 0.5);
}

// ─── Main Hook ────────────────────────────────────────────────────────────────
export default function useObsidianForge() {
  const stateRef = useRef<OBState | null>(null);

  const [state, setState] = useState<OBState>(() => ({
    artifacts: [],
    chambers: createInitialChambers(),
    materials: createInitialMaterials(),
    structures: createInitialStructures(),
    abilities: createInitialAbilities(),
    achievements: createInitialAchievements(),
    currentChamber: 'chamber_obsidian_crucible',
    forgeHeat: 50,
    magmaFlow: 30,
    totalForged: 0,
    eruptionDanger: 0,
    titleIndex: 0,
    forgePower: 0,
    forgeEfficiency: 100,
    dailyQuest: generateDailyQuest(),
    chambersVisited: 1,
    totalEruptionsSurvived: 0,
    totalAbilitiesUsed: 0,
    dailyQuestsCompleted: 0,
    totalOresSmelted: 0,
    totalRepairs: 0,
    totalMaterialsMined: 0,
    activeBuffs: [],
    lastDailyReset: Date.now(),
    eventLog: [],
    defenseRating: 10,
    productionRate: 1,
    researchProgress: 0,
    chambersUnlocked: 1,
    totalDisassembled: 0,
    totalQuenched: 0,
  }));

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Daily reset logic
  useEffect(() => {
    const checkDailyReset = () => {
      setState(prev => {
        const now = Date.now();
        const lastReset = prev.lastDailyReset;
        const oneDay = 24 * 60 * 60 * 1000;
        if (now - lastReset >= oneDay) {
          return {
            ...prev,
            dailyQuest: generateDailyQuest(),
            dailyQuestsCompleted: 0,
            lastDailyReset: now,
            forgeHeat: Math.min(prev.forgeHeat + 25, 200),
            magmaFlow: Math.min(prev.magmaFlow + 15, 150),
          };
        }
        return prev;
      });
    };
    checkDailyReset();
    const interval = setInterval(checkDailyReset, 60000);
    return () => { clearInterval(interval); };
  }, []);

  // Natural eruption danger and eruption events
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const newDanger = computeEruptionDanger(prev);
        const newEff = computeForgeEfficiency(prev);
        const newPower = computeForgePower(prev);
        const newDefense = computeDefenseRating(prev);
        const newProduction = computeProductionRate(prev);
        const newResearch = computeResearchProgress(prev);
        const updatedChambers = prev.chambers.map(c => {
          if (!c.unlocked) return c;
          const heatGrowth = 0.05 * (1 - c.efficiency / 100);
          return { ...c, heatLevel: Math.min(100, c.heatLevel + heatGrowth) };
        });
        const eruptionEvent = rollEruptionEvent();
        let finalChambers = updatedChambers;
        let eventLog = [...prev.eventLog];
        let forgeHeat = prev.forgeHeat;
        if (eruptionEvent) {
          const targetCh = finalChambers.find(c => c.unlocked && c.heatLevel < 90);
          if (targetCh) {
            const actualDamage = Math.max(1, eruptionEvent.damage - Math.floor(newDefense * 0.1));
            finalChambers = finalChambers.map(c =>
              c.defId === targetCh.defId
                ? { ...c, heatLevel: Math.min(100, c.heatLevel + actualDamage) }
                : c
            );
            forgeHeat = Math.max(0, forgeHeat - Math.floor(actualDamage * 0.2));
            eventLog.unshift({
              id: generateOBInstanceId('event'),
              timestamp: Date.now(),
              type: 'eruption',
              message: `${eruptionEvent.name}: ${eruptionEvent.desc} (${actualDamage} damage)`,
              chamber: targetCh.defId,
              metadata: { severity: eruptionEvent.severity, damage: actualDamage },
            });
          }
        }
        if (eventLog.length > 100) {
          eventLog = eventLog.slice(0, 100);
        }
        return {
          ...prev,
          eruptionDanger: newDanger,
          forgeEfficiency: newEff,
          forgePower: newPower,
          chambers: finalChambers,
          eventLog,
          forgeHeat,
          defenseRating: newDefense,
          productionRate: newProduction,
          researchProgress: newResearch,
        };
      });
    }, 5000);
    return () => { clearInterval(interval); };
  }, []);

  // Buff expiration
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const now = Date.now();
        const activeBuffs = prev.activeBuffs.filter(b => b.expiresAt > now);
        if (activeBuffs.length === prev.activeBuffs.length) return prev;
        return { ...prev, activeBuffs };
      });
    }, 1000);
    return () => { clearInterval(interval); };
  }, []);

  // Title computation
  const computedTitleIndex = useMemo(() => {
    for (let i = OB_TITLE_DEFS.length - 1; i >= 0; i--) {
      if (state.forgePower >= OB_TITLE_DEFS[i].requirement) {
        return i;
      }
    }
    return 0;
  }, [state.forgePower]);

  // ─── Recompute derived values ───────────────────────────────────────────────
  const derivedState = useMemo(() => {
    const eruptionDanger = computeEruptionDanger(state);
    const forgeEfficiency = computeForgeEfficiency(state);
    const forgePower = computeForgePower(state);
    const titleIndex = computedTitleIndex;
    return { eruptionDanger, forgeEfficiency, forgePower, titleIndex };
  }, [state, computedTitleIndex]);

  // Update derived values when they change
  useEffect(() => {
    setState(prev => {
      const d = computeEruptionDanger(prev);
      const e = computeForgeEfficiency(prev);
      const p = computeForgePower(prev);
      if (d === prev.eruptionDanger && e === prev.forgeEfficiency && p === prev.forgePower) {
        return prev;
      }
      return {
        ...prev,
        eruptionDanger: d,
        forgeEfficiency: e,
        forgePower: p,
        titleIndex: computedTitleIndex,
      };
    });
  }, [derivedState.eruptionDanger, derivedState.forgeEfficiency, derivedState.forgePower, computedTitleIndex]);

  // ─── Forge Artifact ─────────────────────────────────────────────────────────
  const forgeArtifact = useCallback((artifactDefId: string) => {
    setState(prev => {
      const def = OB_ARTIFACT_DEFS.find(a => a.id === artifactDefId);
      if (!def) return prev;
      const cost = computeForgeCost(artifactDefId, prev);
      if (prev.forgeHeat < cost) return prev;
      const newArtifact: OBArtifact = {
        instanceId: generateOBInstanceId('art'),
        defId: def.id,
        name: def.name,
        rarity: def.rarity,
        type: def.type,
        power: def.power,
        durability: def.durability,
        maxDurability: def.durability,
        level: 1,
        forgedAt: Date.now(),
      };
      const newStructures = prev.structures.map(s => {
        const sDef = OB_STRUCTURE_DEFS.find(d => d.id === s.defId);
        if (sDef && sDef.name === 'Magma Anvil' && s.level > 0) {
          return { ...s, integrity: Math.max(0, s.integrity - 2) };
        }
        return s;
      });
      const eventLog: OBEventLog[] = [
        {
          id: generateOBInstanceId('event'),
          timestamp: Date.now(),
          type: 'forge' as const,
          message: `Forged ${def.name} (Power: ${def.power}, Rarity: ${OB_RARITY_NAMES[def.rarity]})`,
          chamber: prev.currentChamber,
          metadata: { artifactId: newArtifact.instanceId, rarity: def.rarity, cost },
        },
        ...prev.eventLog,
      ].slice(0, 100);
      return {
        ...prev,
        artifacts: [...prev.artifacts, newArtifact],
        forgeHeat: prev.forgeHeat - cost,
        totalForged: prev.totalForged + 1,
        structures: newStructures,
        eventLog,
      };
    });
  }, []);

  // ─── Upgrade Structure ──────────────────────────────────────────────────────
  const upgradeStructure = useCallback((structureDefId: string) => {
    setState(prev => {
      const def = OB_STRUCTURE_DEFS.find(s => s.id === structureDefId);
      if (!def) return prev;
      const structIndex = prev.structures.findIndex(s => s.defId === structureDefId);
      if (structIndex === -1) return prev;
      const current = prev.structures[structIndex];
      if (current.level >= def.maxLevel) return prev;
      const cost = computeUpgradeCost(def.baseCost, current.level);
      if (prev.forgeHeat < cost) return prev;
      const newLevel = current.level + 1;
      const newMaxIntegrity = 100 + newLevel * 20;
      const newIntegrity = Math.min(newMaxIntegrity, current.integrity + 50);
      const newStructures = [...prev.structures];
      newStructures[structIndex] = { ...current, level: newLevel, integrity: newIntegrity, maxIntegrity: newMaxIntegrity };
      const altarLevel = newStructures.find(s => s.defId === 'struct_enchantment_altar')?.level || 0;
      const newAbilities = [...prev.abilities];
      if (altarLevel >= 3) {
        const abilityToUnlock = OB_ABILITY_DEFS.find(a => {
          const existing = newAbilities.find(ab => ab.defId === a.id);
          return existing && !existing.unlocked;
        });
        if (abilityToUnlock) {
          const abIndex = newAbilities.findIndex(ab => ab.defId === abilityToUnlock.id);
          if (abIndex !== -1) {
            newAbilities[abIndex] = { ...newAbilities[abIndex], unlocked: true };
          }
        }
      }
      const eventLog: OBEventLog[] = [
        {
          id: generateOBInstanceId('event'),
          timestamp: Date.now(),
          type: 'upgrade' as const,
          message: `Upgraded ${def.name} to Lv${newLevel}`,
          metadata: { structureId: structureDefId, newLevel, cost },
        },
        ...prev.eventLog,
      ].slice(0, 100);
      return {
        ...prev,
        structures: newStructures,
        forgeHeat: prev.forgeHeat - cost,
        abilities: newAbilities,
        eventLog,
      };
    });
  }, []);

  // ─── Activate Ability ───────────────────────────────────────────────────────
  const activateAbility = useCallback((abilityDefId: string) => {
    setState(prev => {
      const def = OB_ABILITY_DEFS.find(a => a.id === abilityDefId);
      if (!def) return prev;
      const abilityIndex = prev.abilities.findIndex(a => a.defId === abilityDefId);
      if (abilityIndex === -1) return prev;
      const ability = prev.abilities[abilityIndex];
      if (!ability.unlocked) return prev;
      if (prev.forgeHeat < def.heatCost) return prev;
      const now = Date.now();
      if (now - ability.lastUsed < def.cooldown * 1000) return prev;
      const newAbilities = [...prev.abilities];
      newAbilities[abilityIndex] = {
        ...ability,
        lastUsed: now,
        timesUsed: ability.timesUsed + 1,
      };
      let updatedChambers = prev.chambers;
      let updatedArtifacts = prev.artifacts;
      let activeBuffs = [...prev.activeBuffs];
      switch (abilityDefId) {
        case 'ability_lava_blast':
        case 'ability_inferno_beam':
        case 'ability_vent_erupt':
        case 'ability_magma_bolt': {
          updatedChambers = prev.chambers.map(c =>
            c.defId === prev.currentChamber
              ? { ...c, heatLevel: Math.max(0, c.heatLevel - 15) }
              : c
          );
          break;
        }
        case 'ability_eruption_freeze': {
          activeBuffs.push({ abilityId: 'ability_eruption_freeze', expiresAt: now + 20000 });
          break;
        }
        case 'ability_magma_flow':
        case 'ability_obsidian_edge':
        case 'ability_heat_treat':
        case 'ability_forge_rally':
        case 'ability_crystal_resonance': {
          activeBuffs.push({ abilityId: abilityDefId, expiresAt: now + 30000 });
          break;
        }
        case 'ability_volcanic_armor': {
          activeBuffs.push({ abilityId: 'ability_volcanic_armor', expiresAt: now + 60000 });
          break;
        }
        case 'ability_fortify_walls': {
          activeBuffs.push({ abilityId: 'ability_fortify_walls', expiresAt: now + 45000 });
          break;
        }
        case 'ability_emergency_repair': {
          const lowestStruct = [...prev.structures]
            .filter(s => s.level > 0 && s.integrity < s.maxIntegrity)
            .sort((a, b) => a.integrity / a.maxIntegrity - b.integrity / b.maxIntegrity)[0];
          if (lowestStruct) {
            const si = prev.structures.findIndex(s => s.defId === lowestStruct.defId);
            const newStructures = [...prev.structures];
            newStructures[si] = { ...lowestStruct, integrity: lowestStruct.maxIntegrity };
            return {
              ...prev,
              abilities: newAbilities,
              forgeHeat: prev.forgeHeat - def.heatCost,
              totalAbilitiesUsed: prev.totalAbilitiesUsed + 1,
              structures: newStructures,
            };
          }
          break;
        }
        case 'ability_slag_extract': {
          updatedChambers = prev.chambers.map(c => {
            if (!c.unlocked) return c;
            return { ...c, heatLevel: Math.max(0, c.heatLevel - 8) };
          });
          const matIndex = prev.materials.findIndex(m => m.defId === 'mat_ash_dust');
          if (matIndex !== -1) {
            const newMaterials = [...prev.materials];
            newMaterials[matIndex] = { ...newMaterials[matIndex], count: newMaterials[matIndex].count + 5 };
            return {
              ...prev,
              abilities: newAbilities,
              forgeHeat: prev.forgeHeat - def.heatCost,
              totalAbilitiesUsed: prev.totalAbilitiesUsed + 1,
              materials: newMaterials,
              chambers: updatedChambers,
            };
          }
          break;
        }
        case 'ability_magnetic_pull': {
          const newMaterials = [...prev.materials];
          const commonMatIndices = prev.materials.reduce<number[]>((acc, m, i) => {
            const matDef = OB_MATERIAL_DEFS.find(d => d.id === m.defId);
            if (matDef && matDef.rarity <= OB_RARITY_UNUSUAL) acc.push(i);
            return acc;
          }, []);
          if (commonMatIndices.length > 0) {
            for (let i = 0; i < 3; i++) {
              const ri = commonMatIndices[Math.floor(Math.random() * commonMatIndices.length)];
              newMaterials[ri] = { ...newMaterials[ri], count: newMaterials[ri].count + 1 };
            }
          }
          return {
            ...prev,
            abilities: newAbilities,
            forgeHeat: prev.forgeHeat - def.heatCost,
            totalAbilitiesUsed: prev.totalAbilitiesUsed + 1,
            materials: newMaterials,
          };
        }
        case 'ability_volcano_awakening': {
          if (prev.artifacts.length > 0) {
            const strongestIdx = prev.artifacts.reduce((bestIdx, a, idx) =>
              a.power > prev.artifacts[bestIdx].power ? idx : bestIdx, 0);
            updatedArtifacts = [...prev.artifacts];
            updatedArtifacts[strongestIdx] = {
              ...updatedArtifacts[strongestIdx],
              power: updatedArtifacts[strongestIdx].power * 2,
            };
          }
          break;
        }
        case 'ability_worldforge_blessing': {
          return {
            ...prev,
            abilities: newAbilities,
            forgeHeat: 200,
            magmaFlow: 150,
            totalAbilitiesUsed: prev.totalAbilitiesUsed + 1,
          };
        }
        default:
          break;
      }
      return {
        ...prev,
        abilities: newAbilities,
        forgeHeat: prev.forgeHeat - def.heatCost,
        totalAbilitiesUsed: prev.totalAbilitiesUsed + 1,
        chambers: updatedChambers,
        artifacts: updatedArtifacts,
        activeBuffs,
      };
    });
  }, []);

  // ─── Repair Artifact ────────────────────────────────────────────────────────
  const repairArtifact = useCallback((artifactInstanceId: string) => {
    setState(prev => {
      const artIndex = prev.artifacts.findIndex(a => a.instanceId === artifactInstanceId);
      if (artIndex === -1) return prev;
      const artifact = prev.artifacts[artIndex];
      if (artifact.durability >= artifact.maxDurability) return prev;
      if (prev.magmaFlow < 10) return prev;
      const repairAmount = 30;
      const newArtifacts = [...prev.artifacts];
      newArtifacts[artIndex] = {
        ...artifact,
        durability: Math.min(artifact.maxDurability, artifact.durability + repairAmount),
      };
      return {
        ...prev,
        artifacts: newArtifacts,
        magmaFlow: prev.magmaFlow - 10,
        totalRepairs: prev.totalRepairs + 1,
      };
    });
  }, []);

  // ─── Stoke Forge ────────────────────────────────────────────────────────────
  const stokeForge = useCallback(() => {
    setState(prev => {
      if (prev.forgeHeat >= 200) return prev;
      const stokeAmount = 20;
      return {
        ...prev,
        forgeHeat: Math.min(200, prev.forgeHeat + stokeAmount),
        magmaFlow: Math.min(150, prev.magmaFlow + 5),
      };
    });
  }, []);

  // ─── Smelt Ore ──────────────────────────────────────────────────────────────
  const smeltOre = useCallback((materialDefId: string) => {
    setState(prev => {
      const matDef = OB_MATERIAL_DEFS.find(m => m.id === materialDefId);
      if (!matDef) return prev;
      const smeltCost = Math.ceil(matDef.value * 0.4);
      if (prev.magmaFlow < smeltCost) return prev;
      const matIndex = prev.materials.findIndex(m => m.defId === materialDefId);
      if (matIndex === -1) return prev;
      const newMaterials = [...prev.materials];
      newMaterials[matIndex] = { ...newMaterials[matIndex], count: newMaterials[matIndex].count + 1 };
      const crusherLevel = prev.structures.find(s => s.defId === 'struct_ore_crusher')?.level || 0;
      let bonusCount = 0;
      if (crusherLevel >= 3 && Math.random() < crusherLevel * 0.05) {
        bonusCount = 1;
      }
      newMaterials[matIndex] = { ...newMaterials[matIndex], count: newMaterials[matIndex].count + bonusCount };
      return {
        ...prev,
        materials: newMaterials,
        magmaFlow: prev.magmaFlow - smeltCost,
        totalOresSmelted: prev.totalOresSmelted + 1 + bonusCount,
      };
    });
  }, []);

  // ─── Mine Materials ─────────────────────────────────────────────────────────
  const mineMaterials = useCallback(() => {
    setState(prev => {
      if (prev.magmaFlow < 20) return prev;
      const commonMatIndices = prev.materials.reduce<number[]>((acc, m, i) => {
        const matDef = OB_MATERIAL_DEFS.find(d => d.id === m.defId);
        if (matDef && matDef.rarity <= OB_RARITY_UNUSUAL) acc.push(i);
        return acc;
      }, []);
      const newMaterials = [...prev.materials];
      let mined = 0;
      for (let i = 0; i < 2; i++) {
        if (commonMatIndices.length > 0) {
          const ri = commonMatIndices[Math.floor(Math.random() * commonMatIndices.length)];
          newMaterials[ri] = { ...newMaterials[ri], count: newMaterials[ri].count + 1 };
          mined++;
        }
      }
      const mineLevel = prev.structures.find(s => s.defId === 'struct_obsidian_mine')?.level || 0;
      const heatGain = 5 + mineLevel * 2;
      return {
        ...prev,
        materials: newMaterials,
        magmaFlow: prev.magmaFlow - 20,
        forgeHeat: Math.min(200, prev.forgeHeat + heatGain),
        totalMaterialsMined: prev.totalMaterialsMined + mined,
      };
    });
  }, []);

  // ─── Temper Artifact ────────────────────────────────────────────────────────
  const temperArtifact = useCallback((artifactInstanceId: string) => {
    setState(prev => {
      const artIndex = prev.artifacts.findIndex(a => a.instanceId === artifactInstanceId);
      if (artIndex === -1) return prev;
      const artifact = prev.artifacts[artIndex];
      if (artifact.level >= 10) return prev;
      if (prev.magmaFlow < 15) return prev;
      const levelCost = Math.floor(artifact.power * (artifact.level + 1) * 0.3);
      if (prev.forgeHeat < levelCost) return prev;
      const newLevel = artifact.level + 1;
      const newPower = Math.floor(artifact.power * 1.15);
      const newMaxDur = artifact.maxDurability + 20;
      const newArtifacts = [...prev.artifacts];
      newArtifacts[artIndex] = {
        ...artifact,
        level: newLevel,
        power: newPower,
        maxDurability: newMaxDur,
        durability: newMaxDur,
      };
      const eventLog: OBEventLog[] = [
        {
          id: generateOBInstanceId('event'),
          timestamp: Date.now(),
          type: 'temper' as const,
          message: `Tempered ${artifact.name} to Lv${newLevel} (Power: ${newPower})`,
          metadata: { artifactId: artifactInstanceId, newLevel, newPower, cost: levelCost },
        },
        ...prev.eventLog,
      ].slice(0, 100);
      return {
        ...prev,
        artifacts: newArtifacts,
        forgeHeat: prev.forgeHeat - levelCost,
        magmaFlow: prev.magmaFlow - 15,
        totalQuenched: prev.totalQuenched + 1,
        eventLog,
      };
    });
  }, []);

  // ─── Quench Danger ──────────────────────────────────────────────────────────
  const quenchDanger = useCallback((chamberDefId?: string) => {
    setState(prev => {
      const targetChamber = chamberDefId || prev.currentChamber;
      const chIndex = prev.chambers.findIndex(c => c.defId === targetChamber);
      if (chIndex === -1) return prev;
      const ch = prev.chambers[chIndex];
      if (ch.heatLevel <= 0) return prev;
      if (prev.magmaFlow < 15) return prev;
      const quenchAmount = 20;
      const newChambers = [...prev.chambers];
      newChambers[chIndex] = {
        ...ch,
        heatLevel: Math.max(0, ch.heatLevel - quenchAmount),
        efficiency: Math.min(100, ch.efficiency + 5),
      };
      const tankLevel = prev.structures.find(s => s.defId === 'struct_quenching_tank')?.level || 0;
      const extraQuench = tankLevel * 2;
      newChambers[chIndex] = {
        ...newChambers[chIndex],
        heatLevel: Math.max(0, newChambers[chIndex].heatLevel - extraQuench),
      };
      return {
        ...prev,
        chambers: newChambers,
        magmaFlow: prev.magmaFlow - 15,
        totalEruptionsSurvived: prev.totalEruptionsSurvived + 1,
      };
    });
  }, []);

  // ─── Overclock Volcano ──────────────────────────────────────────────────────
  const overclockVolcano = useCallback(() => {
    setState(prev => {
      if (prev.magmaFlow < 50 || prev.forgeHeat < 30) return prev;
      const newArtifacts = prev.artifacts.map(a => ({
        ...a,
        power: Math.floor(a.power * 1.25),
        durability: Math.max(1, a.durability - 10),
      }));
      const newStructures = prev.structures.map(s => {
        if (s.level > 0) {
          return { ...s, integrity: Math.max(1, s.integrity - 15) };
        }
        return s;
      });
      const activeBuffs = [...prev.activeBuffs, { abilityId: 'overclock', expiresAt: Date.now() + 15000 } as { abilityId: string; expiresAt: number }];
      const eventLog: OBEventLog[] = [
        {
          id: generateOBInstanceId('event'),
          timestamp: Date.now(),
          type: 'forge' as const,
          message: 'Overclocked the volcano — all artifacts boosted, structures damaged.',
          metadata: { forgeHeatCost: 30, magmaFlowCost: 50 },
        },
        ...prev.eventLog,
      ].slice(0, 100);
      return {
        ...prev,
        artifacts: newArtifacts,
        structures: newStructures,
        magmaFlow: prev.magmaFlow - 50,
        forgeHeat: prev.forgeHeat - 30,
        activeBuffs,
        eventLog,
      };
    });
  }, []);

  // ─── Check Achievements ────────────────────────────────────────────────────
  const checkAchievements = useCallback(() => {
    setState(prev => {
      let changed = false;
      const newAchievements = prev.achievements.map(ach => {
        if (ach.unlocked) return ach;
        const def = OB_ACHIEVEMENT_DEFS.find(d => d.id === ach.defId);
        if (!def) return ach;
        if (def.condition(prev)) {
          changed = true;
          return { ...ach, unlocked: true, unlockedAt: Date.now() };
        }
        return ach;
      });
      if (!changed) return prev;
      const newlyUnlocked = newAchievements.filter((a, i) => !prev.achievements[i].unlocked && a.unlocked);
      const bonusHeat = newlyUnlocked.length * 25;
      return {
        ...prev,
        achievements: newAchievements,
        forgeHeat: Math.min(200, prev.forgeHeat + bonusHeat),
      };
    });
  }, []);

  // ─── Get Title ──────────────────────────────────────────────────────────────
  const getTitle = useCallback((): string => {
    return OB_TITLE_DEFS[computedTitleIndex].name;
  }, [computedTitleIndex]);

  // ─── Get Progress ───────────────────────────────────────────────────────────
  const getProgress = useCallback(() => {
    const totalArtifacts = OB_ARTIFACT_DEFS.length;
    const forgedArtifacts = new Set(state.artifacts.map(a => a.defId)).size;
    const totalStructures = OB_STRUCTURE_DEFS.length;
    const builtStructures = state.structures.filter(s => s.level > 0).length;
    const totalMaterials = OB_MATERIAL_DEFS.length;
    const collectedMaterials = state.materials.filter(m => m.count > 0).length;
    const totalAchievements = OB_ACHIEVEMENT_DEFS.length;
    const unlockedAchievements = state.achievements.filter(a => a.unlocked).length;
    const totalAbilities = OB_ABILITY_DEFS.length;
    const unlockedAbilities = state.abilities.filter(a => a.unlocked).length;
    const totalChambers = OB_CHAMBER_DEFS.length;
    const unlockedChambers = state.chambers.filter(c => c.unlocked).length;
    const nextTitle = computedTitleIndex < OB_TITLE_DEFS.length - 1
      ? OB_TITLE_DEFS[computedTitleIndex + 1]
      : null;
    const titleProgress = nextTitle
      ? (state.forgePower / nextTitle.requirement) * 100
      : 100;
    const maxStructureLevel = Math.max(...state.structures.map(s => s.level));
    const totalStructureLevels = state.structures.reduce((sum, s) => sum + s.level, 0);
    return {
      artifacts: { forged: forgedArtifacts, total: totalArtifacts, percentage: (forgedArtifacts / totalArtifacts) * 100 },
      structures: { built: builtStructures, total: totalStructures, percentage: (builtStructures / totalStructures) * 100, maxLevel: maxStructureLevel, totalLevels: totalStructureLevels },
      materials: { collected: collectedMaterials, total: totalMaterials, percentage: (collectedMaterials / totalMaterials) * 100 },
      achievements: { unlocked: unlockedAchievements, total: totalAchievements, percentage: (unlockedAchievements / totalAchievements) * 100 },
      abilities: { unlocked: unlockedAbilities, total: totalAbilities, percentage: (unlockedAbilities / totalAbilities) * 100 },
      chambers: { unlocked: unlockedChambers, total: totalChambers, percentage: (unlockedChambers / totalChambers) * 100 },
      title: { current: OB_TITLE_DEFS[computedTitleIndex].name, next: nextTitle?.name ?? null, progress: Math.min(100, titleProgress) },
      totalForged: state.totalForged,
      totalEruptionsSurvived: state.totalEruptionsSurvived,
      totalOresSmelted: state.totalOresSmelted,
      totalRepairs: state.totalRepairs,
      totalMaterialsMined: state.totalMaterialsMined,
      totalAbilitiesUsed: state.totalAbilitiesUsed,
    };
  }, [state, computedTitleIndex]);

  // ─── Get Stats ──────────────────────────────────────────────────────────────
  const getStats = useCallback(() => {
    const totalArtPower = state.artifacts.reduce((sum, a) => sum + a.power, 0);
    const avgArtDur = state.artifacts.length > 0
      ? state.artifacts.reduce((sum, a) => sum + a.durability, 0) / state.artifacts.length
      : 0;
    const highestArtPower = state.artifacts.length > 0
      ? Math.max(...state.artifacts.map(a => a.power))
      : 0;
    const rarityBreakdown = [0, 0, 0, 0, 0];
    for (const a of state.artifacts) {
      rarityBreakdown[a.rarity]++;
    }
    const typeBreakdown: Record<string, number> = {};
    for (const a of state.artifacts) {
      typeBreakdown[a.type] = (typeBreakdown[a.type] || 0) + 1;
    }
    const mostCommonType = Object.entries(typeBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'none';
    const chamberStats = state.chambers.map(c => {
      const def = OB_CHAMBER_DEFS.find(cd => cd.id === c.defId);
      return {
        name: def?.name ?? c.defId,
        unlocked: c.unlocked,
        heatLevel: Math.floor(c.heatLevel),
        efficiency: Math.floor(c.efficiency),
      };
    });
    const activeBuffCount = state.activeBuffs.length;
    const activeBuffNames = state.activeBuffs.map(b => {
      const def = OB_ABILITY_DEFS.find(a => a.id === b.abilityId);
      return def?.name ?? b.abilityId;
    });
    const topStructures = state.structures
      .filter(s => s.level > 0)
      .sort((a, b) => b.level - a.level)
      .slice(0, 5)
      .map(s => {
        const def = OB_STRUCTURE_DEFS.find(d => d.id === s.defId);
        return {
          name: def?.name ?? s.defId,
          level: s.level,
          integrityPercent: Math.floor((s.integrity / s.maxIntegrity) * 100),
        };
      });
    return {
      forgePower: state.forgePower,
      forgeHeat: state.forgeHeat,
      maxForgeHeat: 200,
      magmaFlow: state.magmaFlow,
      maxMagmaFlow: 150,
      eruptionDanger: state.eruptionDanger,
      forgeEfficiency: state.forgeEfficiency,
      title: OB_TITLE_DEFS[computedTitleIndex].name,
      titleIndex: computedTitleIndex,
      artifacts: {
        count: state.artifacts.length,
        totalPower: totalArtPower,
        avgDurability: Math.floor(avgArtDur),
        highestPower: highestArtPower,
        rarityBreakdown: {
          common: rarityBreakdown[0],
          unusual: rarityBreakdown[1],
          rare: rarityBreakdown[2],
          epic: rarityBreakdown[3],
          legendary: rarityBreakdown[4],
        },
        mostCommonType,
      },
      structures: {
        totalBuilt: state.structures.filter(s => s.level > 0).length,
        topStructures,
      },
      chambers: chamberStats,
      materials: {
        totalCollected: state.materials.reduce((sum, m) => sum + m.count, 0),
        uniqueTypes: state.materials.filter(m => m.count > 0).length,
      },
      abilities: {
        unlocked: state.abilities.filter(a => a.unlocked).length,
        total: OB_ABILITY_DEFS.length,
        totalUses: state.totalAbilitiesUsed,
      },
      achievements: {
        unlocked: state.achievements.filter(a => a.unlocked).length,
        total: OB_ACHIEVEMENT_DEFS.length,
      },
      activeBuffs: {
        count: activeBuffCount,
        names: activeBuffNames,
      },
      lifetime: {
        totalForged: state.totalForged,
        eruptionsSurvived: state.totalEruptionsSurvived,
        oresSmelted: state.totalOresSmelted,
        repairs: state.totalRepairs,
        materialsMined: state.totalMaterialsMined,
        abilitiesUsed: state.totalAbilitiesUsed,
        chambersVisited: state.chambersVisited,
        dailyQuestsCompleted: state.dailyQuestsCompleted,
      },
    };
  }, [state, computedTitleIndex]);

  // ─── Change Chamber ─────────────────────────────────────────────────────────
  const changeChamber = useCallback((chamberDefId: string) => {
    setState(prev => {
      const chIndex = prev.chambers.findIndex(c => c.defId === chamberDefId);
      if (chIndex === -1) return prev;
      const ch = prev.chambers[chIndex];
      const def = OB_CHAMBER_DEFS.find(d => d.id === chamberDefId);
      if (!def) return prev;
      if (!ch.unlocked && prev.forgePower < def.unlockPower) return prev;
      const newChambers = [...prev.chambers];
      let chambersVisited = prev.chambersVisited;
      let chambersUnlocked = prev.chambers.filter(c => c.unlocked).length;
      if (!ch.unlocked) {
        newChambers[chIndex] = { ...ch, unlocked: true, heatLevel: 50, efficiency: 50 };
        chambersUnlocked += 1;
      }
      if (prev.currentChamber !== chamberDefId) {
        chambersVisited += 1;
      }
      const heatCost = def.heatRequired;
      if (prev.forgeHeat < heatCost) return prev;
      const eventLog: OBEventLog[] = [
        {
          id: generateOBInstanceId('event'),
          timestamp: Date.now(),
          type: 'chamber' as const,
          message: `Moved to ${def.name}`,
          chamber: chamberDefId,
          metadata: { heatCost },
        },
        ...prev.eventLog,
      ].slice(0, 100);
      return {
        ...prev,
        chambers: newChambers,
        currentChamber: chamberDefId,
        forgeHeat: prev.forgeHeat - heatCost,
        chambersVisited,
        chambersUnlocked,
        eventLog,
      };
    });
  }, []);

  // ─── Complete Daily Quest ───────────────────────────────────────────────────
  const completeDailyQuest = useCallback(() => {
    setState(prev => {
      if (!prev.dailyQuest || prev.dailyQuest.completed) return prev;
      return {
        ...prev,
        dailyQuest: { ...prev.dailyQuest, completed: true },
        forgeHeat: Math.min(200, prev.forgeHeat + prev.dailyQuest.reward),
        dailyQuestsCompleted: prev.dailyQuestsCompleted + 1,
      };
    });
  }, []);

  // ─── Repair Structure ───────────────────────────────────────────────────────
  const repairStructure = useCallback((structureDefId: string) => {
    setState(prev => {
      const structIndex = prev.structures.findIndex(s => s.defId === structureDefId);
      if (structIndex === -1) return prev;
      const struct = prev.structures[structIndex];
      if (struct.level === 0 || struct.integrity >= struct.maxIntegrity) return prev;
      if (prev.magmaFlow < 8) return prev;
      const newStructures = [...prev.structures];
      newStructures[structIndex] = {
        ...struct,
        integrity: Math.min(struct.maxIntegrity, struct.integrity + 25),
      };
      return {
        ...prev,
        structures: newStructures,
        magmaFlow: prev.magmaFlow - 8,
        totalRepairs: prev.totalRepairs + 1,
      };
    });
  }, []);

  // ─── Disassemble Artifact ───────────────────────────────────────────────────
  const disassembleArtifact = useCallback((instanceId: string) => {
    setState(prev => {
      const artIndex = prev.artifacts.findIndex(a => a.instanceId === instanceId);
      if (artIndex === -1) return prev;
      const art = prev.artifacts[artIndex];
      const refundAmount = [1, 2, 4, 8, 15][art.rarity] || 1;
      const heatRefund = Math.floor(art.power * 0.3);
      const newArtifacts = prev.artifacts.filter((_, i) => i !== artIndex);
      const matIndex = prev.materials.findIndex(m => m.defId === 'mat_obsidian_shard');
      const newMaterials = [...prev.materials];
      if (matIndex !== -1) {
        newMaterials[matIndex] = { ...newMaterials[matIndex], count: newMaterials[matIndex].count + refundAmount };
      }
      const eventLog: OBEventLog[] = [
        {
          id: generateOBInstanceId('event'),
          timestamp: Date.now(),
          type: 'disassemble' as const,
          message: `Disassembled ${art.name} (Refunded ${refundAmount} shards, ${heatRefund} heat)`,
          metadata: { artifactId: instanceId, rarity: art.rarity, refundAmount, heatRefund },
        },
        ...prev.eventLog,
      ].slice(0, 100);
      return {
        ...prev,
        artifacts: newArtifacts,
        forgeHeat: Math.min(200, prev.forgeHeat + heatRefund),
        materials: newMaterials,
        totalDisassembled: prev.totalDisassembled + 1,
        eventLog,
      };
    });
  }, []);

  // ─── Get Event Log ──────────────────────────────────────────────────────────
  const getEventLog = useCallback((limit?: number, filterType?: OBEventLog['type']) => {
    let log = state.eventLog;
    if (filterType) {
      log = log.filter(e => e.type === filterType);
    }
    if (limit && limit > 0) {
      log = log.slice(0, limit);
    }
    return log;
  }, [state.eventLog]);

  // ─── Clear Event Log ────────────────────────────────────────────────────────
  const clearEventLog = useCallback(() => {
    setState(prev => ({ ...prev, eventLog: [] }));
  }, []);

  // ─── Get Synergy Bonuses ────────────────────────────────────────────────────
  const getSynergyBonuses = useCallback(() => {
    return calculateSynergyBonus(state);
  }, [state]);

  // ─── Get Defense Rating ─────────────────────────────────────────────────────
  const getDefenseRating = useCallback(() => {
    return computeDefenseRating(state);
  }, [state]);

  // ─── Get Production Rate ────────────────────────────────────────────────────
  const getProductionRate = useCallback(() => {
    return computeProductionRate(state);
  }, [state]);

  // ─── Get Research Progress ──────────────────────────────────────────────────
  const getResearchProgress = useCallback(() => {
    return computeResearchProgress(state);
  }, [state]);

  // ─── Get Lore ───────────────────────────────────────────────────────────────
  const getLore = useCallback((chamberId?: string) => {
    if (chamberId) {
      return OB_LORE_ENTRIES.filter(l => l.chamber === chamberId);
    }
    return OB_LORE_ENTRIES;
  }, []);

  // ─── Get Lore by ID ─────────────────────────────────────────────────────────
  const getLoreById = useCallback((loreId: string) => {
    return OB_LORE_ENTRIES.find(l => l.id === loreId) ?? null;
  }, []);

  // ─── Get Eruption Event Info ────────────────────────────────────────────────
  const getEruptionEventInfo = useCallback(() => {
    return OB_ERUPTION_EVENTS;
  }, []);

  // ─── Can Forge Artifact Check ───────────────────────────────────────────────
  const canForgeArtifact = useCallback((artifactDefId: string): boolean => {
    const def = OB_ARTIFACT_DEFS.find(a => a.id === artifactDefId);
    if (!def) return false;
    const cost = computeForgeCost(artifactDefId, state);
    return state.forgeHeat >= cost;
  }, [state.forgeHeat]);

  // ─── Can Upgrade Structure Check ────────────────────────────────────────────
  const canUpgradeStructure = useCallback((structureDefId: string): boolean => {
    const def = OB_STRUCTURE_DEFS.find(s => s.id === structureDefId);
    if (!def) return false;
    const struct = state.structures.find(s => s.defId === structureDefId);
    if (!struct || struct.level >= def.maxLevel) return false;
    const cost = computeUpgradeCost(def.baseCost, struct.level);
    return state.forgeHeat >= cost;
  }, [state.forgeHeat, state.structures]);

  // ─── Check if buff is active ────────────────────────────────────────────────
  const isBuffActive = useCallback((abilityDefId: string): boolean => {
    return state.activeBuffs.some(b => b.abilityId === abilityDefId);
  }, [state.activeBuffs]);

  // ─── Get ability cooldown remaining ─────────────────────────────────────────
  const getAbilityCooldown = useCallback((abilityDefId: string): number => {
    const ability = state.abilities.find(a => a.defId === abilityDefId);
    if (!ability) return 0;
    const def = OB_ABILITY_DEFS.find(d => d.id === abilityDefId);
    if (!def) return 0;
    const now = Date.now();
    const elapsed = (now - ability.lastUsed) / 1000;
    return Math.max(0, Math.floor(def.cooldown - elapsed));
  }, [state.abilities]);

  // ─── Get artifact by instance ID ───────────────────────────────────────────
  const getArtifact = useCallback((instanceId: string) => {
    return state.artifacts.find(a => a.instanceId === instanceId) ?? null;
  }, [state.artifacts]);

  // ─── Filter artifacts by type ───────────────────────────────────────────────
  const getArtifactsByType = useCallback((type: string) => {
    return state.artifacts.filter(a => a.type === type);
  }, [state.artifacts]);

  // ─── Filter artifacts by rarity ────────────────────────────────────────────
  const getArtifactsByRarity = useCallback((rarity: number) => {
    return state.artifacts.filter(a => a.rarity === rarity);
  }, [state.artifacts]);

  // ─── Get chamber by ID ──────────────────────────────────────────────────────
  const getChamber = useCallback((chamberDefId: string) => {
    const chState = state.chambers.find(c => c.defId === chamberDefId);
    const chDef = OB_CHAMBER_DEFS.find(d => d.id === chamberDefId);
    if (!chState || !chDef) return null;
    return {
      ...chDef,
      heatLevel: Math.floor(chState.heatLevel),
      efficiency: Math.floor(chState.efficiency),
      unlocked: chState.unlocked,
    };
  }, [state.chambers]);

  // ─── Get random forgeable artifact ──────────────────────────────────────────
  const getRandomForgeableArtifact = useCallback(() => {
    const affordable = OB_ARTIFACT_DEFS.filter(def => {
      const cost = computeForgeCost(def.id, state);
      return state.forgeHeat >= cost;
    });
    if (affordable.length === 0) return null;
    return affordable[Math.floor(Math.random() * affordable.length)];
  }, [state.forgeHeat]);

  // ─── Get structure by ID ────────────────────────────────────────────────────
  const getStructure = useCallback((structureDefId: string) => {
    const structState = state.structures.find(s => s.defId === structureDefId);
    const structDef = OB_STRUCTURE_DEFS.find(d => d.id === structureDefId);
    if (!structState || !structDef) return null;
    return {
      ...structDef,
      ...structState,
      upgradeCost: computeUpgradeCost(structDef.baseCost, structState.level),
      canUpgrade: state.forgeHeat >= computeUpgradeCost(structDef.baseCost, structState.level) && structState.level < structDef.maxLevel,
      isMaxLevel: structState.level >= structDef.maxLevel,
      integrityPercent: structState.level > 0 ? Math.floor((structState.integrity / structState.maxIntegrity) * 100) : 0,
    };
  }, [state.structures, state.forgeHeat]);

  // ─── Get material by ID ─────────────────────────────────────────────────────
  const getMaterial = useCallback((materialDefId: string) => {
    const matState = state.materials.find(m => m.defId === materialDefId);
    const matDef = OB_MATERIAL_DEFS.find(d => d.id === materialDefId);
    if (!matState || !matDef) return null;
    return {
      ...matDef,
      count: matState.count,
      smeltCost: Math.ceil(matDef.value * 0.4),
      canSmelt: state.magmaFlow >= Math.ceil(matDef.value * 0.4),
    };
  }, [state.materials, state.magmaFlow]);

  // ─── Get ability by ID ──────────────────────────────────────────────────────
  const getAbility = useCallback((abilityDefId: string) => {
    const abilityState = state.abilities.find(a => a.defId === abilityDefId);
    const abilityDef = OB_ABILITY_DEFS.find(d => d.id === abilityDefId);
    if (!abilityState || !abilityDef) return null;
    const now = Date.now();
    const elapsed = (now - abilityState.lastUsed) / 1000;
    const cooldownRemaining = Math.max(0, abilityDef.cooldown - elapsed);
    return {
      ...abilityDef,
      ...abilityState,
      cooldownRemaining: Math.floor(cooldownRemaining),
      isOnCooldown: cooldownRemaining > 0,
      canActivate: abilityState.unlocked && cooldownRemaining <= 0 && state.forgeHeat >= abilityDef.heatCost,
    };
  }, [state.abilities, state.forgeHeat]);

  // ─── Memoized lookup maps ──────────────────────────────────────────────────
  const artifactDefMap = useMemo(() => {
    const map = new Map<string, typeof OB_ARTIFACT_DEFS[0]>();
    for (const def of OB_ARTIFACT_DEFS) {
      map.set(def.id, def);
    }
    return map;
  }, []);

  const chamberDefMap = useMemo(() => {
    const map = new Map<string, typeof OB_CHAMBER_DEFS[0]>();
    for (const def of OB_CHAMBER_DEFS) {
      map.set(def.id, def);
    }
    return map;
  }, []);

  const materialDefMap = useMemo(() => {
    const map = new Map<string, typeof OB_MATERIAL_DEFS[0]>();
    for (const def of OB_MATERIAL_DEFS) {
      map.set(def.id, def);
    }
    return map;
  }, []);

  const structureDefMap = useMemo(() => {
    const map = new Map<string, typeof OB_STRUCTURE_DEFS[0]>();
    for (const def of OB_STRUCTURE_DEFS) {
      map.set(def.id, def);
    }
    return map;
  }, []);

  const abilityDefMap = useMemo(() => {
    const map = new Map<string, typeof OB_ABILITY_DEFS[0]>();
    for (const def of OB_ABILITY_DEFS) {
      map.set(def.id, def);
    }
    return map;
  }, []);

  // ─── Current chamber info ──────────────────────────────────────────────────
  const currentChamberInfo = useMemo(() => {
    const def = OB_CHAMBER_DEFS.find(d => d.id === state.currentChamber);
    const chamberState = state.chambers.find(c => c.defId === state.currentChamber);
    if (!def || !chamberState) return null;
    return {
      ...def,
      heatLevel: Math.floor(chamberState.heatLevel),
      efficiency: Math.floor(chamberState.efficiency),
    };
  }, [state.currentChamber, state.chambers]);

  // ─── Available artifacts to forge (sorted by rarity) ───────────────────────
  const availableArtifacts = useMemo(() => {
    return OB_ARTIFACT_DEFS.map(def => ({
      ...def,
      forgeCost: computeForgeCost(def.id, state),
      canAfford: state.forgeHeat >= computeForgeCost(def.id, state),
      alreadyForged: state.artifacts.some(a => a.defId === def.id),
      rarityName: OB_RARITY_NAMES[def.rarity],
      rarityColor: OB_RARITY_COLORS[def.rarity],
    }));
  }, [state.forgeHeat, state.artifacts]);

  // ─── Enriched structures ───────────────────────────────────────────────────
  const enrichedStructures = useMemo(() => {
    return state.structures.map(s => {
      const def = OB_STRUCTURE_DEFS.find(d => d.id === s.defId);
      if (!def) return null;
      return {
        ...s,
        ...def,
        upgradeCost: computeUpgradeCost(def.baseCost, s.level),
        canUpgrade: state.forgeHeat >= computeUpgradeCost(def.baseCost, s.level) && s.level < def.maxLevel,
        isMaxLevel: s.level >= def.maxLevel,
        integrityPercent: s.level > 0 ? Math.floor((s.integrity / s.maxIntegrity) * 100) : 0,
      };
    }).filter(Boolean);
  }, [state.structures, state.forgeHeat]);

  // ─── Enriched materials ────────────────────────────────────────────────────
  const enrichedMaterials = useMemo(() => {
    return state.materials.map(m => {
      const def = OB_MATERIAL_DEFS.find(d => d.id === m.defId);
      if (!def) return null;
      return {
        ...m,
        ...def,
        smeltCost: Math.ceil(def.value * 0.4),
        canSmelt: state.magmaFlow >= Math.ceil(def.value * 0.4),
        rarityName: OB_RARITY_NAMES[def.rarity],
        rarityColor: OB_RARITY_COLORS[def.rarity],
      };
    }).filter(Boolean);
  }, [state.materials, state.magmaFlow]);

  // ─── Enriched abilities with cooldown state ─────────────────────────────────
  const enrichedAbilities = useMemo(() => {
    const now = Date.now();
    return state.abilities.map(a => {
      const def = OB_ABILITY_DEFS.find(d => d.id === a.defId);
      if (!def) return null;
      const elapsed = (now - a.lastUsed) / 1000;
      const cooldownRemaining = Math.max(0, def.cooldown - elapsed);
      const isOnCooldown = cooldownRemaining > 0;
      const isActiveBuff = state.activeBuffs.some(b => b.abilityId === a.defId);
      return {
        ...a,
        ...def,
        cooldownRemaining: Math.floor(cooldownRemaining),
        cooldownPercent: def.cooldown > 0 ? (elapsed / def.cooldown) * 100 : 100,
        isOnCooldown,
        isActiveBuff,
        canActivate: a.unlocked && !isOnCooldown && state.forgeHeat >= def.heatCost,
      };
    }).filter(Boolean);
  }, [state.abilities, state.activeBuffs, state.forgeHeat]);

  // ─── Enriched achievements ──────────────────────────────────────────────────
  const enrichedAchievements = useMemo(() => {
    return state.achievements.map(a => {
      const def = OB_ACHIEVEMENT_DEFS.find(d => d.id === a.defId);
      if (!def) return null;
      return {
        ...a,
        name: def.name,
        description: def.desc,
      };
    }).filter(Boolean);
  }, [state.achievements]);

  // ─── Artifact type distribution ─────────────────────────────────────────────
  const artifactTypeDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const art of state.artifacts) {
      dist[art.type] = (dist[art.type] || 0) + 1;
    }
    return dist;
  }, [state.artifacts]);

  // ─── Total materials count ─────────────────────────────────────────────────
  const totalMaterialsCount = useMemo(() => {
    return state.materials.reduce((sum, m) => sum + m.count, 0);
  }, [state.materials]);

  // ─── Heat regeneration rate ─────────────────────────────────────────────────
  const heatRegenRate = useMemo(() => {
    const ventLevel = state.structures.find(s => s.defId === 'struct_vent_shaft')?.level || 0;
    const coreLevel = state.structures.find(s => s.defId === 'struct_volcano_core')?.level || 0;
    const worldForgeLevel = state.structures.find(s => s.defId === 'struct_world_forge')?.level || 0;
    return 1 + ventLevel * 0.5 + coreLevel * 0.8 + worldForgeLevel * 1.2;
  }, [state.structures]);

  // ─── Magma generation rate ──────────────────────────────────────────────────
  const magmaGenRate = useMemo(() => {
    const coreLevel = state.structures.find(s => s.defId === 'struct_volcano_core')?.level || 0;
    const reservoirLevel = state.structures.find(s => s.defId === 'struct_magma_reservoir')?.level || 0;
    const channelLevel = state.structures.find(s => s.defId === 'struct_lava_channel')?.level || 0;
    return 0.5 + coreLevel * 0.3 + reservoirLevel * 0.2 + channelLevel * 0.15;
  }, [state.structures]);

  // ─── Build Return Object ───────────────────────────────────────────────────
  return {
    // State
    ...state,

    // Computed
    computedTitleIndex,
    currentChamberInfo,
    availableArtifacts,
    enrichedStructures,
    enrichedMaterials,
    enrichedAbilities,
    enrichedAchievements,
    artifactTypeDistribution,
    totalMaterialsCount,
    heatRegenRate,
    magmaGenRate,

    // Reference data
    artifactDefs: OB_ARTIFACT_DEFS,
    chamberDefs: OB_CHAMBER_DEFS,
    materialDefs: OB_MATERIAL_DEFS,
    structureDefs: OB_STRUCTURE_DEFS,
    abilityDefs: OB_ABILITY_DEFS,
    achievementDefs: OB_ACHIEVEMENT_DEFS,
    titleDefs: OB_TITLE_DEFS,
    colors: {
      obsidian: OB_OBSIDIAN,
      volcanicOrange: OB_VOLCANIC_ORANGE,
      moltenGold: OB_MOLTEN_GOLD,
      crystalBlue: OB_CRYSTAL_BLUE,
      emberRed: OB_EMBER_RED,
      lavaFlow: OB_LAVA_FLOW,
      smokeGray: OB_SMOKE_GRAY,
      stoneGray: OB_STONE_GRAY,
      ashWhite: OB_ASH_WHITE,
      magmaCore: OB_MAGMA_CORE,
      deepCrimson: OB_DEEP_CRIMSON,
      brimstone: OB_BRIMSTONE,
      pyroclast: OB_PYROCLAST,
      basalt: OB_BASALT,
      pumice: OB_PUMICE,
      glaze: OB_GLAZE,
      frostObsidian: OB_FROST_OBSIDIAN,
    },
    typeInfo: OB_TYPE_INFO,
    synergyPairs: OB_SYNERGY_PAIRS,
    eruptionEvents: OB_ERUPTION_EVENTS,
    rarityNames: OB_RARITY_NAMES,
    rarityColors: OB_RARITY_COLORS,
    dailyQuestTemplates: OB_DAILY_QUEST_TEMPLATES,

    // Lookup maps
    artifactDefMap,
    chamberDefMap,
    materialDefMap,
    structureDefMap,
    abilityDefMap,

    // Core API
    forgeArtifact,
    upgradeStructure,
    activateAbility,
    repairArtifact,
    stokeForge,
    smeltOre,
    mineMaterials,
    temperArtifact,
    quenchDanger,
    overclockVolcano,
    checkAchievements,

    // Info API
    getTitle,
    getProgress,
    getStats,

    // Utility API
    changeChamber,
    completeDailyQuest,
    repairStructure,
    disassembleArtifact,
    isBuffActive,
    getAbilityCooldown,
    getArtifact,
    getArtifactsByType,
    getArtifactsByRarity,
    getChamber,
    getRandomForgeableArtifact,
    getStructure,
    getMaterial,
    getAbility,
    canForgeArtifact,
    canUpgradeStructure,
    getEventLog,
    clearEventLog,
    getSynergyBonuses,
    getDefenseRating,
    getProductionRate,
    getResearchProgress,
    getLore,
    getLoreById,
    getEruptionEventInfo,
  };
}
