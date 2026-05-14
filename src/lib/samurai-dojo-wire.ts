import { useState, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Seeded PRNG — mulberry32
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Constants — SD_ prefixed
// ---------------------------------------------------------------------------

export const SD_STYLES = [
  { id: 'kenjutsu', name: 'Kenjutsu', desc: 'Art of the sword', bonusStat: 'attack', bonusVal: 5 },
  { id: 'iaijutsu', name: 'Iaijutsu', desc: 'Quick-draw strike', bonusStat: 'speed', bonusVal: 6 },
  { id: 'kyujutsu', name: 'Kyujutsu', desc: 'Way of the bow', bonusStat: 'accuracy', bonusVal: 7 },
  { id: 'naginatajutsu', name: 'Naginatajutsu', desc: 'Polearm mastery', bonusStat: 'defense', bonusVal: 5 },
  { id: 'bojutsu', name: 'Bojutsu', desc: 'Staff fighting', bonusStat: 'stamina', bonusVal: 6 },
  { id: 'shurikenjutsu', name: 'Shurikenjutsu', desc: 'Concealed blades', bonusStat: 'critical', bonusVal: 4 },
  { id: 'ninjutsu', name: 'Ninjutsu', desc: 'Shadow arts', bonusStat: 'stealth', bonusVal: 8 },
  { id: 'sojutsu', name: 'Sojutsu', desc: 'Spear techniques', bonusStat: 'reach', bonusVal: 5 },
] as const;

export const SD_ROOMS = [
  { id: 'sword_hall', name: 'Sword Hall', desc: 'Primary blade training', stat: 'attack', xpMult: 1.2 },
  { id: 'archery_range', name: 'Archery Range', desc: 'Precision bow practice', stat: 'accuracy', xpMult: 1.1 },
  { id: 'meditation_garden', name: 'Meditation Garden', desc: 'Inner peace cultivation', stat: 'focus', xpMult: 1.3 },
  { id: 'sparring_arena', name: 'Sparring Arena', desc: 'Combat practice', stat: 'defense', xpMult: 1.15 },
  { id: 'weapon_forge', name: 'Weapon Forge', desc: 'Craft and upgrade gear', stat: 'crafting', xpMult: 1.0 },
  { id: 'scroll_library', name: 'Scroll Library', desc: 'Study ancient texts', stat: 'wisdom', xpMult: 1.25 },
  { id: 'tea_ceremony', name: 'Tea Ceremony Room', desc: 'Honor and discipline', stat: 'spirit', xpMult: 1.1 },
  { id: 'war_chamber', name: 'War Strategy Chamber', desc: 'Tactical planning', stat: 'strategy', xpMult: 1.2 },
] as const;

export const SD_TECHNIQUES = [
  { id: 'mortal_strike', name: 'Mortal Strike', damage: 45, staminaCost: 20, style: 'kenjutsu', levelReq: 1, desc: 'A devastating overhead slash' },
  { id: 'shadow_slash', name: 'Shadow Slash', damage: 35, staminaCost: 15, style: 'ninjutsu', levelReq: 3, desc: 'Strike from the shadows' },
  { id: 'dragons_fury', name: "Dragon's Fury", damage: 60, staminaCost: 35, style: 'kenjutsu', levelReq: 8, desc: 'Channel the dragon spirit' },
  { id: 'cherry_blossom_cut', name: 'Cherry Blossom Cut', damage: 25, staminaCost: 10, style: 'iaijutsu', levelReq: 2, desc: 'Swift elegant draw' },
  { id: 'thunder_storm', name: 'Thunder Storm', damage: 50, staminaCost: 30, style: 'sojutsu', levelReq: 10, desc: 'Rapid spear thrusts' },
  { id: 'phoenix_wing', name: 'Phoenix Wing', damage: 40, staminaCost: 25, style: 'naginatajutsu', levelReq: 6, desc: 'Sweeping arc attack' },
  { id: 'silent_wind', name: 'Silent Wind', damage: 30, staminaCost: 12, style: 'shurikenjutsu', levelReq: 4, desc: 'Undetectable throw' },
  { id: 'iron_mountain', name: 'Iron Mountain', damage: 20, staminaCost: 40, style: 'bojutsu', levelReq: 5, desc: 'Immovable defense' },
  { id: 'eagle_eye', name: 'Eagle Eye', damage: 55, staminaCost: 28, style: 'kyujutsu', levelReq: 7, desc: 'Perfect long-range shot' },
  { id: 'serpent_coil', name: 'Serpent Coil', damage: 38, staminaCost: 22, style: 'ninjutsu', levelReq: 9, desc: 'Constricting grapple' },
  { id: 'tide_crasher', name: 'Tide Crusher', damage: 48, staminaCost: 32, style: 'sojutsu', levelReq: 12, desc: 'Ocean-like force' },
  { id: 'lotus_bloom', name: 'Lotus Bloom', damage: 15, staminaCost: 8, style: 'iaijutsu', levelReq: 1, desc: 'Healing counter-attack' },
  { id: 'falling_moon', name: 'Falling Moon', damage: 65, staminaCost: 40, style: 'kenjutsu', levelReq: 15, desc: 'Moonlit downward strike' },
  { id: 'phantom_step', name: 'Phantom Step', damage: 28, staminaCost: 14, style: 'ninjutsu', levelReq: 6, desc: 'Teleport behind foe' },
  { id: 'titan_breaker', name: 'Titan Breaker', damage: 70, staminaCost: 45, style: 'bojutsu', levelReq: 18, desc: 'Earth-shattering blow' },
  { id: 'swift_bolt', name: 'Swift Bolt', damage: 33, staminaCost: 16, style: 'iaijutsu', levelReq: 5, desc: 'Lightning-fast slash' },
  { id: 'storm_arrow', name: 'Storm Arrow', damage: 52, staminaCost: 26, style: 'kyujutsu', levelReq: 11, desc: 'Three arrows at once' },
  { id: 'viper_strike', name: 'Viper Strike', damage: 42, staminaCost: 24, style: 'shurikenjutsu', levelReq: 8, desc: 'Poisoned blade throw' },
  { id: 'crane_dance', name: 'Crane Dance', damage: 30, staminaCost: 18, style: 'naginatajutsu', levelReq: 7, desc: 'Elegant sweeping combo' },
  { id: 'hell_gate', name: 'Hell Gate', damage: 80, staminaCost: 50, style: 'kenjutsu', levelReq: 20, desc: 'Ultimate blade technique' },
  { id: 'mist_veil', name: 'Mist Veil', damage: 22, staminaCost: 10, style: 'ninjutsu', levelReq: 3, desc: 'Vanish into mist' },
  { id: 'dragon_lance', name: 'Dragon Lance', damage: 58, staminaCost: 34, style: 'sojutsu', levelReq: 14, desc: 'Piercing dragon charge' },
  { id: 'bamboo_whirlwind', name: 'Bamboo Whirlwind', damage: 36, staminaCost: 20, style: 'bojutsu', levelReq: 9, desc: 'Spinning staff assault' },
  { id: 'moonlight_nocturne', name: 'Moonlight Nocturne', damage: 44, staminaCost: 22, style: 'iaijutsu', levelReq: 10, desc: 'Blade glows in darkness' },
  { id: 'thousand_needles', name: 'Thousand Needles', damage: 47, staminaCost: 30, style: 'shurikenjutsu', levelReq: 13, desc: 'Rain of razor blades' },
  { id: 'heaven_piercer', name: 'Heaven Piercer', damage: 75, staminaCost: 48, style: 'sojutsu', levelReq: 16, desc: 'Spear reaches the sky' },
  { id: 'soul_reaver', name: 'Soul Reaver', damage: 68, staminaCost: 42, style: 'kenjutsu', levelReq: 18, desc: 'Drains life force' },
  { id: 'gentle_breeze', name: 'Gentle Breeze', damage: 18, staminaCost: 6, style: 'bojutsu', levelReq: 2, desc: 'Calming staff kata' },
  { id: 'fire_storm', name: 'Fire Storm', damage: 62, staminaCost: 38, style: 'naginatajutsu', levelReq: 15, desc: 'Blazing polearm spin' },
  { id: 'void_strike', name: 'Void Strike', damage: 90, staminaCost: 55, style: 'ninjutsu', levelReq: 25, desc: 'Strike from nothingness' },
  { id: 'zen_arrow', name: 'Zen Arrow', damage: 40, staminaCost: 20, style: 'kyujutsu', levelReq: 9, desc: 'Perfectly centered shot' },
  { id: 'wrath_of_kami', name: 'Wrath of Kami', damage: 95, staminaCost: 60, style: 'kenjutsu', levelReq: 30, desc: 'Divine judgment slash' },
  { id: 'mirror_blade', name: 'Mirror Blade', damage: 50, staminaCost: 28, style: 'iaijutsu', levelReq: 12, desc: 'Reflects opponent power' },
] as const;

export const SD_WEAPONS = [
  { id: 'rusty_katana', name: 'Rusty Katana', type: 'katana', attack: 5, speed: 3, levelReq: 1, rarity: 'common' },
  { id: 'iron_katana', name: 'Iron Katana', type: 'katana', attack: 10, speed: 4, levelReq: 3, rarity: 'common' },
  { id: 'steel_naginata', name: 'Steel Naginata', type: 'naginata', attack: 12, speed: 3, levelReq: 5, rarity: 'common' },
  { id: 'yumi_longbow', name: 'Yumi Longbow', type: 'yumi', attack: 8, speed: 5, levelReq: 2, rarity: 'common' },
  { id: 'oak_bo_staff', name: 'Oak Bo Staff', type: 'bo', attack: 7, speed: 4, levelReq: 1, rarity: 'common' },
  { id: 'tanto_dagger', name: 'Tanto Dagger', type: 'tanto', attack: 4, speed: 7, levelReq: 1, rarity: 'common' },
  { id: 'wakizashi', name: 'Wakizashi', type: 'wakizashi', attack: 8, speed: 6, levelReq: 4, rarity: 'uncommon' },
  { id: 'fine_katana', name: 'Fine Katana', type: 'katana', attack: 18, speed: 5, levelReq: 8, rarity: 'uncommon' },
  { id: 'war_spear', name: 'War Spear', type: 'spear', attack: 16, speed: 3, levelReq: 7, rarity: 'uncommon' },
  { id: 'shuriken_set', name: 'Shuriken Set', type: 'shuriken', attack: 6, speed: 8, levelReq: 3, rarity: 'uncommon' },
  { id: 'masterwork_bow', name: 'Masterwork Bow', type: 'yumi', attack: 20, speed: 5, levelReq: 10, rarity: 'uncommon' },
  { id: 'ancient_naginata', name: 'Ancient Naginata', type: 'naginata', attack: 22, speed: 4, levelReq: 12, rarity: 'rare' },
  { id: 'moonlight_blade', name: 'Moonlight Blade', type: 'katana', attack: 30, speed: 6, levelReq: 15, rarity: 'rare' },
  { id: 'dragon_fang', name: 'Dragon Fang', type: 'tanto', attack: 14, speed: 9, levelReq: 10, rarity: 'rare' },
  { id: 'iron_bamboo', name: 'Iron Bamboo', type: 'bo', attack: 20, speed: 5, levelReq: 11, rarity: 'rare' },
  { id: 'shadow_wakizashi', name: 'Shadow Wakizashi', type: 'wakizashi', attack: 18, speed: 8, levelReq: 14, rarity: 'rare' },
  { id: 'storm_spear', name: 'Storm Spear', type: 'spear', attack: 28, speed: 4, levelReq: 16, rarity: 'rare' },
  { id: 'phantom_shuriken', name: 'Phantom Shuriken', type: 'shuriken', attack: 22, speed: 10, levelReq: 18, rarity: 'rare' },
  { id: 'sky Piercer_bow', name: 'Sky Piercer Bow', type: 'yumi', attack: 35, speed: 6, levelReq: 20, rarity: 'epic' },
  { id: 'masamune', name: 'Masamune', type: 'katana', attack: 45, speed: 7, levelReq: 25, rarity: 'epic' },
  { id: 'muramasa', name: 'Muramasa', type: 'katana', attack: 50, speed: 6, levelReq: 28, rarity: 'epic' },
  { id: 'heavenly_naginata', name: 'Heavenly Naginata', type: 'naginata', attack: 42, speed: 5, levelReq: 24, rarity: 'epic' },
  { id: 'divine_spear', name: 'Divine Spear', type: 'spear', attack: 48, speed: 5, levelReq: 27, rarity: 'epic' },
  { id: 'crimson_bo', name: 'Crimson Bo', type: 'bo', attack: 35, speed: 6, levelReq: 22, rarity: 'epic' },
  { id: 'kusarigama', name: 'Kusarigama', type: 'kama', attack: 32, speed: 7, levelReq: 20, rarity: 'epic' },
  { id: 'grasscutter', name: 'Grasscutter', type: 'katana', attack: 60, speed: 8, levelReq: 35, rarity: 'legendary' },
  { id: 'amaterasu_blade', name: 'Amaterasu Blade', type: 'katana', attack: 70, speed: 9, levelReq: 40, rarity: 'legendary' },
] as const;

export const SD_ARMOR = [
  { id: 'bamboo_armor', name: 'Bamboo Armor', slot: 'body', defense: 3, levelReq: 1, rarity: 'common' },
  { id: 'leather_kabuto', name: 'Leather Kabuto', slot: 'head', defense: 2, levelReq: 1, rarity: 'common' },
  { id: 'cloth_menpo', name: 'Cloth Menpo', slot: 'face', defense: 1, levelReq: 1, rarity: 'common' },
  { id: 'wooden_do', name: 'Wooden Do', slot: 'body', defense: 5, levelReq: 3, rarity: 'common' },
  { id: 'leather_kote', name: 'Leather Kote', slot: 'arms', defense: 3, levelReq: 2, rarity: 'common' },
  { id: 'straw_suneate', name: 'Straw Suneate', slot: 'legs', defense: 2, levelReq: 1, rarity: 'common' },
  { id: 'iron_kabuto', name: 'Iron Kabuto', slot: 'head', defense: 6, levelReq: 6, rarity: 'uncommon' },
  { id: 'chain_do', name: 'Chain Do', slot: 'body', defense: 8, levelReq: 8, rarity: 'uncommon' },
  { id: 'steel_kote', name: 'Steel Kote', slot: 'arms', defense: 5, levelReq: 7, rarity: 'uncommon' },
  { id: 'iron_suneate', name: 'Iron Suneate', slot: 'legs', defense: 6, levelReq: 5, rarity: 'uncommon' },
  { id: 'battle_menpo', name: 'Battle Menpo', slot: 'face', defense: 4, levelReq: 6, rarity: 'uncommon' },
  { id: 'o-yoroi', name: 'O-Yoroi', slot: 'body', defense: 15, levelReq: 12, rarity: 'rare' },
  { id: 'war_kabuto', name: 'War Kabuto', slot: 'head', defense: 12, levelReq: 10, rarity: 'rare' },
  { id: 'dragon_kote', name: 'Dragon Kote', slot: 'arms', defense: 10, levelReq: 11, rarity: 'rare' },
  { id: 'samurai_suneate', name: 'Samurai Suneate', slot: 'legs', defense: 9, levelReq: 9, rarity: 'rare' },
  { id: 'oni_menpo', name: 'Oni Menpo', slot: 'face', defense: 8, levelReq: 10, rarity: 'rare' },
  { id: 'phoenix_do', name: 'Phoenix Do', slot: 'body', defense: 22, levelReq: 18, rarity: 'epic' },
  { id: 'kaiser_kabuto', name: 'Kaiser Kabuto', slot: 'head', defense: 18, levelReq: 20, rarity: 'epic' },
  { id: 'void_kote', name: 'Void Kote', slot: 'arms', defense: 16, levelReq: 17, rarity: 'epic' },
  { id: 'storm_suneate', name: 'Storm Suneate', slot: 'legs', defense: 14, levelReq: 16, rarity: 'epic' },
  { id: 'shogun_do', name: 'Shogun Do', slot: 'body', defense: 30, levelReq: 25, rarity: 'legendary' },
  { id: 'divine_kabuto', name: 'Divine Kabuto', slot: 'head', defense: 25, levelReq: 28, rarity: 'legendary' },
  { id: 'kami_menpo', name: 'Kami Menpo', slot: 'face', defense: 15, levelReq: 30, rarity: 'legendary' },
] as const;

export const SD_CLANS = [
  { id: 'dragon', name: 'Dragon Clan', color: '#ff4444', bonus: 'attack', bonusVal: 3, desc: 'Born of fire' },
  { id: 'tiger', name: 'Tiger Clan', color: '#ff8800', bonus: 'defense', bonusVal: 3, desc: 'Unyielding strength' },
  { id: 'crane', name: 'Crane Clan', color: '#ffffff', bonus: 'speed', bonusVal: 3, desc: 'Grace and precision' },
  { id: 'phoenix', name: 'Phoenix Clan', color: '#ffdd00', bonus: 'spirit', bonusVal: 3, desc: 'Rebirth and honor' },
  { id: 'serpent', name: 'Serpent Clan', color: '#44ff44', bonus: 'stealth', bonusVal: 3, desc: 'Silent death' },
  { id: 'wolf', name: 'Wolf Clan', color: '#8888ff', bonus: 'stamina', bonusVal: 3, desc: 'Pack loyalty' },
  { id: 'bear', name: 'Bear Clan', color: '#8B4513', bonus: 'hp', bonusVal: 3, desc: 'Mountain resilience' },
  { id: 'falcon', name: 'Falcon Clan', color: '#00cccc', bonus: 'accuracy', bonusVal: 3, desc: 'Keen perception' },
] as const;

export const SD_STANCES = [
  { id: 'stance_aggressive', name: 'Aggressive Stance', attackMod: 1.3, defenseMod: 0.7, desc: 'All-out offense' },
  { id: 'stance_defensive', name: 'Defensive Stance', attackMod: 0.7, defenseMod: 1.3, desc: 'Impenetrable guard' },
  { id: 'stance_balanced', name: 'Balanced Stance', attackMod: 1.0, defenseMod: 1.0, desc: 'Steady approach' },
  { id: 'stance_counter', name: 'Counter Stance', attackMod: 0.8, defenseMod: 1.1, counterBonus: 1.5, desc: 'Wait and retaliate' },
  { id: 'stance_berserk', name: 'Berserk Stance', attackMod: 1.5, defenseMod: 0.5, desc: 'Reckless fury' },
  { id: 'stance_flowing', name: 'Flowing Stance', attackMod: 1.1, defenseMod: 1.1, desc: 'Like water' },
] as const;

export const SD_QUESTS = [
  { id: 'q_first_blood', name: 'First Blood', desc: 'Win your first duel', type: 'duel_wins', target: 1, reward: { xp: 50, honor: 10, coins: 20 } },
  { id: 'q_ten_duels', name: 'Seasoned Duelist', desc: 'Win 10 duels', type: 'duel_wins', target: 10, reward: { xp: 200, honor: 50, coins: 100 } },
  { id: 'q_style_master', name: 'Style Master', desc: 'Master 3 fighting styles', type: 'styles_mastered', target: 3, reward: { xp: 300, honor: 80, coins: 150 } },
  { id: 'q_weapon_collector', name: 'Weapon Collector', desc: 'Own 10 weapons', type: 'weapons_owned', target: 10, reward: { xp: 250, honor: 60, coins: 200 } },
  { id: 'q_technique_adept', name: 'Technique Adept', desc: 'Learn 10 techniques', type: 'techniques_learned', target: 10, reward: { xp: 200, honor: 70, coins: 120 } },
  { id: 'q_level_10', name: 'Rising Warrior', desc: 'Reach level 10', type: 'level', target: 10, reward: { xp: 500, honor: 100, coins: 300 } },
  { id: 'q_level_25', name: 'Veteran Samurai', desc: 'Reach level 25', type: 'level', target: 25, reward: { xp: 1000, honor: 200, coins: 500 } },
  { id: 'q_daily_streak', name: 'Devoted Disciple', desc: 'Complete 5 daily trainings', type: 'daily_streak', target: 5, reward: { xp: 300, honor: 90, coins: 180 } },
  { id: 'q_armor_set', name: 'Full Armor', desc: 'Equip armor in all slots', type: 'armor_slots_filled', target: 4, reward: { xp: 350, honor: 75, coins: 250 } },
  { id: 'q_honorable', name: 'Path of Honor', desc: 'Reach 500 honor', type: 'honor', target: 500, reward: { xp: 800, honor: 0, coins: 600 } },
] as const;

export const SD_NPCS = [
  { id: 'sensei_takeshi', name: 'Sensei Takeshi', role: 'Sensei', greeting: 'Focus your mind, student.', teaches: ['kenjutsu', 'iaijutsu'] },
  { id: 'hiroshi_smith', name: 'Hiroshi the Smith', role: 'Blacksmith', greeting: 'My forge burns bright today.', sells: ['weapons', 'armor'] },
  { id: 'yuki_herbalist', name: 'Yuki the Herbalist', role: 'Herbalist', greeting: 'Nature provides all healing.', sells: ['potions'] },
  { id: 'kenji_strategist', name: 'Kenji the Strategist', role: 'Strategist', greeting: 'Victory begins in the mind.', teaches: ['strategy', 'stances'] },
  { id: 'ryo_monk', name: 'Ryo the Monk', role: 'Monk', greeting: 'Find stillness within.', teaches: ['meditation', 'spirit'] },
  { id: 'lord_shogun', name: 'Lord Shogun', role: 'Shogun', greeting: 'Serve with honor.', offers: ['quests', 'duels'] },
] as const;

export const SD_ACHIEVEMENTS = [
  { id: 'ach_initiate', name: 'Initiate', desc: 'Begin your samurai path', condition: 'level >= 1', icon: '⛩️' },
  { id: 'ach_first_duel_win', name: 'First Victory', desc: 'Win a duel', condition: 'duel_wins >= 1', icon: '⚔️' },
  { id: 'ach_10_kills', name: 'Duelist', desc: 'Win 10 duels', condition: 'duel_wins >= 10', icon: '🗡️' },
  { id: 'ach_50_kills', name: 'Arena Champion', desc: 'Win 50 duels', condition: 'duel_wins >= 50', icon: '🏆' },
  { id: 'ach_style_master', name: 'Polyglot Warrior', desc: 'Master all 8 styles', condition: 'styles_mastered >= 8', icon: '🎨' },
  { id: 'ach_weapon_master', name: 'Arsenal King', desc: 'Own 20 weapons', condition: 'weapons_owned >= 20', icon: '🗡️' },
  { id: 'ach_armor_king', name: 'Iron Fortress', desc: 'Own 15 armor pieces', condition: 'armor_owned >= 15', icon: '🛡️' },
  { id: 'ach_level_25', name: 'Veteran', desc: 'Reach level 25', condition: 'level >= 25', icon: '⭐' },
  { id: 'ach_level_50', name: 'Supreme Shogun', desc: 'Reach max level', condition: 'level >= 50', icon: '👑' },
  { id: 'ach_technique_master', name: 'Technique Sage', desc: 'Learn all techniques', condition: 'techniques_learned >= 33', icon: '📜' },
  { id: 'ach_rich_samurai', name: 'Wealthy Samurai', desc: 'Accumulate 5000 coins', condition: 'coins >= 5000', icon: '💰' },
  { id: 'ach_honorable', name: 'Honor Bound', desc: 'Reach 1000 honor', condition: 'honor >= 1000', icon: '🎌' },
  { id: 'ach_daily_devotee', name: 'Daily Devotee', desc: '7-day training streak', condition: 'daily_streak >= 7', icon: '📅' },
  { id: 'ach_perfect_duel', name: 'Flawless Victory', desc: 'Win duel without damage', condition: 'perfect_duels >= 1', icon: '✨' },
  { id: 'ach_quest_complete', name: 'Quest Champion', desc: 'Complete all quests', condition: 'quests_completed >= 10', icon: '🗺️' },
] as const;

export const SD_TITLES = [
  { id: 'title_initiate', name: 'Initiate', levelReq: 1, honorReq: 0, desc: 'A new student' },
  { id: 'title_disciple', name: 'Disciple', levelReq: 5, honorReq: 50, desc: 'Dedicated learner' },
  { id: 'title_warrior', name: 'Warrior', levelReq: 10, honorReq: 150, desc: 'Proven in battle' },
  { id: 'title_elder', name: 'Elder Warrior', levelReq: 20, honorReq: 400, desc: 'Respected veteran' },
  { id: 'title_master', name: 'Master Samurai', levelReq: 30, honorReq: 700, desc: 'Mastery achieved' },
  { id: 'title_champion', name: 'Grand Champion', levelReq: 38, honorReq: 1000, desc: 'Unmatched skill' },
  { id: 'title_legend', name: 'Living Legend', levelReq: 45, honorReq: 1500, desc: 'Feared and revered' },
  { id: 'title_shogun', name: 'Supreme Shogun', levelReq: 50, honorReq: 2000, desc: 'Ultimate ruler' },
] as const;

export const SD_MAX_LEVEL = 50;
export const SD_XP_PER_LEVEL_BASE = 100;
export const SD_XP_PER_LEVEL_GROWTH = 80;
export const SD_MAX_HP_BASE = 100;
export const SD_MAX_STAMINA_BASE = 50;
export const SD_MAX_HONOR = 9999;
export const SD_MAX_COINS = 99999;
export const SD_MAX_DAILY_STREAK = 30;
export const SD_DUEL_ROUNDS = 5;
export const SD_STYLE_MASTERY_MAX = 100;
export const SD_TECHNIQUE_MASTERY_MAX = 100;
export const SD_STAT_POINTS_PER_LEVEL = 3;
export const SD_FORGE_BASE_COST = 50;
export const SD_FORGE_COST_GROWTH = 20;
export const SD_POTION_COST = 10;
export const SD_ARMOR_FORGE_COST = 80;
export const SD_DUEL_HONOR_BASE = 20;
export const SD_DUEL_COIN_BASE = 30;
export const SD_HONOR_PER_LEVEL = 2;
export const SD_COINS_PER_LEVEL = 3;
export const SD_CLAN_HONOR_MULT = 1.15;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SdStyleProgress {
  styleId: string;
  xp: number;
  mastery: number;
}

interface SdEquippedGear {
  weapon: string | null;
  head: string | null;
  body: string | null;
  arms: string | null;
  legs: string | null;
  face: string | null;
}

interface SdTechniqueProgress {
  techniqueId: string;
  learned: boolean;
  uses: number;
  mastery: number;
}

interface SdQuestProgress {
  questId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

interface SdDuelRecord {
  id: string;
  opponent: string;
  clan: string;
  won: boolean;
  rounds: number;
  techniqueUsed: string | null;
  perfect: boolean;
}

interface SdDailyState {
  daySeed: number;
  trainingCompleted: boolean;
  trainingResult: string | null;
  honorDuelCompleted: boolean;
  honorDuelResult: string | null;
  streak: number;
  lastDay: number;
}

interface SdAchievementRecord {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number;
}

interface SdNPCRelation {
  npcId: string;
  favor: number;
  questsGiven: number;
  met: boolean;
}

interface SdSamuraiDojoState {
  seed: number;
  level: number;
  xp: number;
  totalXp: number;
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  attack: number;
  defense: number;
  speed: number;
  accuracy: number;
  critical: number;
  stealth: number;
  spirit: number;
  staminaStat: number;
  focus: number;
  wisdom: number;
  strategy: number;
  crafting: number;
  reach: number;
  honor: number;
  coins: number;
  clanId: string | null;
  styleId: string | null;
  stanceId: string;
  titleId: string;
  styleProgress: SdStyleProgress[];
  equipped: SdEquippedGear;
  inventoryWeapons: string[];
  inventoryArmor: string[];
  techniques: SdTechniqueProgress[];
  quests: SdQuestProgress[];
  duelHistory: SdDuelRecord[];
  duelWins: number;
  duelLosses: number;
  perfectDuels: number;
  daily: SdDailyState;
  achievements: SdAchievementRecord[];
  npcRelations: SdNPCRelation[];
  currentRoom: string;
  trainingCount: number;
  forgeCount: number;
  scrollsRead: number;
  potionsUsed: number;
  totalDamageDealt: number;
  totalDamageReceived: number;
  totalTechniquesUsed: number;
  unallocatedStatPoints: number;
  statAllocations: { attack: number; defense: number; speed: number; accuracy: number; critical: number; stealth: number; spirit: number; staminaStat: number; };
  karma: number;
  reputation: number;
  dojoFavor: number;
  specialItems: string[];
  clanWarContributions: number;
  totalTrainingMinutes: number;
  totalCoinsEarned: number;
  totalHonorEarned: number;
  masteryTokens: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function xpForLevel(level: number): number {
  return SD_XP_PER_LEVEL_BASE + (level - 1) * SD_XP_PER_LEVEL_GROWTH;
}

function createEmptyDaily(seed: number): SdDailyState {
  return {
    daySeed: seed,
    trainingCompleted: false,
    trainingResult: null,
    honorDuelCompleted: false,
    honorDuelResult: null,
    streak: 0,
    lastDay: 0,
  };
}

function createInitialState(seed?: number): SdSamuraiDojoState {
  const s = seed ?? 42;
  const rng = mulberry32(s);
  return {
    seed: s,
    level: 1,
    xp: 0,
    totalXp: 0,
    hp: SD_MAX_HP_BASE,
    maxHp: SD_MAX_HP_BASE,
    stamina: SD_MAX_STAMINA_BASE,
    maxStamina: SD_MAX_STAMINA_BASE,
    attack: 5,
    defense: 5,
    speed: 5,
    accuracy: 5,
    critical: 3,
    stealth: 3,
    spirit: 3,
    staminaStat: 5,
    focus: 3,
    wisdom: 3,
    strategy: 3,
    crafting: 2,
    reach: 3,
    honor: 0,
    coins: 100,
    clanId: null,
    styleId: null,
    stanceId: 'stance_balanced',
    titleId: 'title_initiate',
    styleProgress: SD_STYLES.map((st) => ({
      styleId: st.id,
      xp: 0,
      mastery: 0,
    })),
    equipped: { weapon: 'rusty_katana', head: null, body: null, arms: null, legs: null, face: null },
    inventoryWeapons: ['rusty_katana', 'tanto_dagger', 'oak_bo_staff'],
    inventoryArmor: ['bamboo_armor', 'leather_kabuto'],
    techniques: [],
    quests: SD_QUESTS.map((q) => ({
      questId: q.id,
      progress: 0,
      completed: false,
      claimed: false,
    })),
    duelHistory: [],
    duelWins: 0,
    duelLosses: 0,
    perfectDuels: 0,
    daily: createEmptyDaily(s),
    achievements: SD_ACHIEVEMENTS.map((a) => ({
      achievementId: a.id,
      unlocked: false,
      unlockedAt: 0,
    })),
    npcRelations: SD_NPCS.map((n) => ({
      npcId: n.id,
      favor: 0,
      questsGiven: 0,
      met: false,
    })),
    currentRoom: 'sword_hall',
    trainingCount: 0,
    forgeCount: 0,
    scrollsRead: 0,
    potionsUsed: 0,
    totalDamageDealt: 0,
    totalDamageReceived: 0,
    totalTechniquesUsed: 0,
    unallocatedStatPoints: 0,
    statAllocations: { attack: 0, defense: 0, speed: 0, accuracy: 0, critical: 0, stealth: 0, spirit: 0, staminaStat: 0 },
    karma: 0,
    reputation: 0,
    dojoFavor: 0,
    specialItems: [],
    clanWarContributions: 0,
    totalTrainingMinutes: 0,
    totalCoinsEarned: 100,
    totalHonorEarned: 0,
    masteryTokens: 0,
  };
}

function seededChoice<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export default function useSamuraiDojo(initialSeed?: number) {
  const [state, setState] = useState<SdSamuraiDojoState>(() => createInitialState(initialSeed));

  /* ------------------------------------------------------------------ */
  /*  State accessors                                                    */
  /* ------------------------------------------------------------------ */

  const sdGetState = useCallback(() => state, [state]);

  const sdGetLevel = useCallback(() => state.level, [state]);

  const sdGetXp = useCallback(() => state.xp, [state]);

  const sdGetXpToNext = useCallback(() => xpForLevel(state.level), [state]);

  const sdGetTotalXp = useCallback(() => state.totalXp, [state]);

  const sdGetHp = useCallback(() => state.hp, [state]);

  const sdGetMaxHp = useCallback(() => state.maxHp, [state]);

  const sdGetStamina = useCallback(() => state.stamina, [state]);

  const sdGetMaxStamina = useCallback(() => state.maxStamina, [state]);

  const sdGetHonor = useCallback(() => state.honor, [state]);

  const sdGetCoins = useCallback(() => state.coins, [state]);

  const sdGetClan = useCallback(() => SD_CLANS.find((c) => c.id === state.clanId) ?? null, [state]);

  const sdGetStyle = useCallback(() => SD_STYLES.find((s) => s.id === state.styleId) ?? null, [state]);

  const sdGetStance = useCallback(() => SD_STANCES.find((s) => s.id === state.stanceId) ?? null, [state]);

  const sdGetTitle = useCallback(() => SD_TITLES.find((t) => t.id === state.titleId) ?? null, [state]);

  const sdGetCurrentRoom = useCallback(() => SD_ROOMS.find((r) => r.id === state.currentRoom) ?? null, [state]);

  const sdGetEquippedWeapon = useCallback(
    () => SD_WEAPONS.find((w) => w.id === state.equipped.weapon) ?? null,
    [state],
  );

  const sdGetEquippedArmor = useCallback(
    () => {
      const result: (typeof SD_ARMOR)[number][] = [];
      const slots = ['head', 'body', 'arms', 'legs', 'face'] as const;
      for (const slot of slots) {
        const id = state.equipped[slot];
        if (id) {
          const piece = SD_ARMOR.find((a) => a.id === id);
          if (piece) result.push(piece);
        }
      }
      return result;
    },
    [state],
  );

  const sdGetStats = useCallback(
    () => ({
      attack: state.attack,
      defense: state.defense,
      speed: state.speed,
      accuracy: state.accuracy,
      critical: state.critical,
      stealth: state.stealth,
      spirit: state.spirit,
      staminaStat: state.staminaStat,
      focus: state.focus,
      wisdom: state.wisdom,
      strategy: state.strategy,
      crafting: state.crafting,
      reach: state.reach,
    }),
    [state],
  );

  const sdGetCombatPower = useCallback(() => {
    const weapon = SD_WEAPONS.find((w) => w.id === state.equipped.weapon);
    const weaponAtk = weapon ? weapon.attack : 0;
    const armorDef = ['head', 'body', 'arms', 'legs', 'face']
      .map((slot) => state.equipped[slot as keyof typeof state.equipped])
      .filter(Boolean)
      .reduce((sum, id) => {
        const piece = SD_ARMOR.find((a) => a.id === id);
        return sum + (piece ? piece.defense : 0);
      }, 0);
    return state.attack + weaponAtk + state.defense + armorDef + state.speed + state.spirit + Math.floor(state.level / 2);
  }, [state]);

  /* ------------------------------------------------------------------ */
  /*  Style                                                              */
  /* ------------------------------------------------------------------ */

  const sdAdoptStyle = useCallback(
    (styleId: string) => {
      const exists = SD_STYLES.some((s) => s.id === styleId);
      if (!exists) return state;
      return setState((prev) => ({ ...prev, styleId }));
      void state;
    },
    [state],
  );

  const sdGetStyleProgress = useCallback(
    (styleId: string) => state.styleProgress.find((s) => s.styleId === styleId) ?? null,
    [state],
  );

  const sdGetStyleMastery = useCallback(
    (styleId: string) => {
      const p = state.styleProgress.find((s) => s.styleId === styleId);
      return p ? p.mastery : 0;
    },
    [state],
  );

  const sdGetAllStyleProgress = useCallback(() => state.styleProgress, [state]);

  const sdTrainStyle = useCallback(
    (styleId: string, amount?: number) => {
      const xpGain = amount ?? 25;
      return setState((prev) => ({
        ...prev,
        styleProgress: prev.styleProgress.map((sp) => {
          if (sp.styleId !== styleId) return sp;
          const newXp = sp.xp + xpGain;
          const newMastery = clamp(Math.floor(newXp / 10), 0, SD_STYLE_MASTERY_MAX);
          return { ...sp, xp: newXp, mastery: newMastery };
        }),
        totalXp: prev.totalXp + xpGain,
      }));
    },
    [state],
  );

  const sdGetStylesMastered = useCallback(
    () => state.styleProgress.filter((s) => s.mastery >= SD_STYLE_MASTERY_MAX).length,
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Techniques                                                         */
  /* ------------------------------------------------------------------ */

  const sdLearnTechnique = useCallback(
    (techniqueId: string) => {
      const tech = SD_TECHNIQUES.find((t) => t.id === techniqueId);
      if (!tech) return state;
      if (state.level < tech.levelReq) return state;
      if (state.techniques.some((t) => t.techniqueId === techniqueId)) return state;
      return setState((prev) => ({
        ...prev,
        techniques: [...prev.techniques, { techniqueId, learned: true, uses: 0, mastery: 0 }],
      }));
    },
    [state],
  );

  const sdGetTechniques = useCallback(() => state.techniques, [state]);

  const sdGetAvailableTechniques = useCallback(
    () => SD_TECHNIQUES.filter((t) => t.levelReq <= state.level && !state.techniques.some((lt) => lt.techniqueId === t.id)),
    [state],
  );

  const sdGetTechniqueProgress = useCallback(
    (techniqueId: string) => state.techniques.find((t) => t.techniqueId === techniqueId) ?? null,
    [state],
  );

  const sdUseTechnique = useCallback(
    (techniqueId: string) => {
      setState((prev) => ({
        ...prev,
        techniques: prev.techniques.map((t) => {
          if (t.techniqueId !== techniqueId) return t;
          const newUses = t.uses + 1;
          const newMastery = clamp(Math.floor(newUses / 3), 0, SD_TECHNIQUE_MASTERY_MAX);
          return { ...t, uses: newUses, mastery: newMastery };
        }),
        totalTechniquesUsed: prev.totalTechniquesUsed + 1,
      }));
    },
    [state],
  );

  const sdGetTechniquesLearnedCount = useCallback(() => state.techniques.length, [state]);

  /* ------------------------------------------------------------------ */
  /*  Weapons & Armor                                                    */
  /* ------------------------------------------------------------------ */

  const sdGetInventoryWeapons = useCallback(
    () => state.inventoryWeapons.map((id) => SD_WEAPONS.find((w) => w.id === id)).filter(Boolean) as (typeof SD_WEAPONS)[number][],
    [state],
  );

  const sdGetInventoryArmor = useCallback(
    () => state.inventoryArmor.map((id) => SD_ARMOR.find((a) => a.id === id)).filter(Boolean) as (typeof SD_ARMOR)[number][],
    [state],
  );

  const sdEquipWeapon = useCallback(
    (weaponId: string) => {
      if (!state.inventoryWeapons.includes(weaponId)) return state;
      const weapon = SD_WEAPONS.find((w) => w.id === weaponId);
      if (weapon && state.level < weapon.levelReq) return state;
      return setState((prev) => ({ ...prev, equipped: { ...prev.equipped, weapon: weaponId } }));
    },
    [state],
  );

  const sdEquipArmor = useCallback(
    (armorId: string, slot: string) => {
      if (!state.inventoryArmor.includes(armorId)) return state;
      const piece = SD_ARMOR.find((a) => a.id === armorId);
      if (!piece) return state;
      return setState((prev) => ({
        ...prev,
        equipped: { ...prev.equipped, [slot]: armorId },
      }));
    },
    [state],
  );

  const sdAddWeapon = useCallback(
    (weaponId: string) => {
      if (state.inventoryWeapons.includes(weaponId)) return state;
      return setState((prev) => ({
        ...prev,
        inventoryWeapons: [...prev.inventoryWeapons, weaponId],
      }));
    },
    [state],
  );

  const sdAddArmor = useCallback(
    (armorId: string) => {
      if (state.inventoryArmor.includes(armorId)) return state;
      return setState((prev) => ({
        ...prev,
        inventoryArmor: [...prev.inventoryArmor, armorId],
      }));
    },
    [state],
  );

  const sdRemoveWeapon = useCallback(
    (weaponId: string) => {
      if (state.equipped.weapon === weaponId) {
        setState((prev) => ({ ...prev, equipped: { ...prev.equipped, weapon: 'rusty_katana' } }));
      }
      return setState((prev) => ({
        ...prev,
        inventoryWeapons: prev.inventoryWeapons.filter((id) => id !== weaponId),
      }));
    },
    [state],
  );

  const sdRemoveArmor = useCallback(
    (armorId: string) => {
      return setState((prev) => {
        const newEquipped = { ...prev.equipped };
        for (const slot of ['head', 'body', 'arms', 'legs', 'face'] as const) {
          if (newEquipped[slot] === armorId) newEquipped[slot] = null;
        }
        return {
          ...prev,
          equipped: newEquipped,
          inventoryArmor: prev.inventoryArmor.filter((id) => id !== armorId),
        };
      });
    },
    [state],
  );

  const sdGetWeaponsOwnedCount = useCallback(() => state.inventoryWeapons.length, [state]);

  const sdGetArmorOwnedCount = useCallback(() => state.inventoryArmor.length, [state]);

  const sdGetArmorSlotsFilled = useCallback(() => {
    const slots = ['head', 'body', 'arms', 'legs', 'face'] as const;
    return slots.filter((s) => state.equipped[s] !== null).length;
  }, [state]);

  /* ------------------------------------------------------------------ */
  /*  Clan                                                               */
  /* ------------------------------------------------------------------ */

  const sdJoinClan = useCallback(
    (clanId: string) => {
      const exists = SD_CLANS.some((c) => c.id === clanId);
      if (!exists) return state;
      return setState((prev) => ({ ...prev, clanId }));
    },
    [state],
  );

  const sdLeaveClan = useCallback(
    () => {
      return setState((prev) => ({ ...prev, clanId: null }));
    },
    [state],
  );

  const sdGetClanBonus = useCallback(
    () => {
      const clan = SD_CLANS.find((c) => c.id === state.clanId);
      return clan ? { stat: clan.bonus, value: clan.bonusVal } : { stat: 'none', value: 0 };
    },
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Stance                                                             */
  /* ------------------------------------------------------------------ */

  const sdSetStance = useCallback(
    (stanceId: string) => {
      const exists = SD_STANCES.some((s) => s.id === stanceId);
      if (!exists) return state;
      return setState((prev) => ({ ...prev, stanceId }));
    },
    [state],
  );

  const sdGetStanceModifiers = useCallback(
    () => {
      const stance = SD_STANCES.find((s) => s.id === state.stanceId);
      return stance
        ? { attackMod: stance.attackMod, defenseMod: stance.defenseMod, counterBonus: (stance as any).counterBonus ?? 1.0 }
        : { attackMod: 1.0, defenseMod: 1.0, counterBonus: 1.0 };
    },
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Rooms                                                              */
  /* ------------------------------------------------------------------ */

  const sdEnterRoom = useCallback(
    (roomId: string) => {
      const exists = SD_ROOMS.some((r) => r.id === roomId);
      if (!exists) return state;
      return setState((prev) => ({ ...prev, currentRoom: roomId }));
    },
    [state],
  );

  const sdGetRoom = useCallback(
    (roomId: string) => SD_ROOMS.find((r) => r.id === roomId) ?? null,
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Training                                                           */
  /* ------------------------------------------------------------------ */

  const sdTrainSamurai = useCallback(
    (minutes?: number) => {
      const duration = minutes ?? 30;
      const room = SD_ROOMS.find((r) => r.id === state.currentRoom);
      const roomMult = room ? room.xpMult : 1.0;
      const style = state.styleId ? SD_STYLES.find((s) => s.id === state.styleId) : null;
      const styleBonus = style ? style.bonusVal * 0.1 : 0;
      const baseXp = Math.floor(duration * 1.5 * roomMult * (1 + styleBonus));
      const staminaCost = Math.floor(duration * 0.5);
      if (state.stamina < staminaCost) return state;
      return setState((prev) => {
        let newXp = prev.xp + baseXp;
        let newLevel = prev.level;
        let newTotalXp = prev.totalXp + baseXp;
        let newMaxHp = prev.maxHp;
        let newMaxStamina = prev.maxStamina;
        let newAttack = prev.attack;
        let newDefense = prev.defense;
        let newSpeed = prev.speed;
        let unallocatedPoints = 0;
        while (newXp >= xpForLevel(newLevel) && newLevel < SD_MAX_LEVEL) {
          newXp -= xpForLevel(newLevel);
          newLevel += 1;
          newMaxHp += 8;
          newMaxStamina += 4;
          newAttack += 1;
          newDefense += 1;
          newSpeed += 1;
          if (newLevel % 3 === 0) prev.accuracy += 1;
          if (newLevel % 5 === 0) prev.critical += 1;
          if (newLevel % 4 === 0) prev.spirit += 1;
          unallocatedPoints += SD_STAT_POINTS_PER_LEVEL;
        }
        const updatedStyleProgress = prev.styleId
          ? prev.styleProgress.map((sp) =>
              sp.styleId === prev.styleId
                ? { ...sp, xp: sp.xp + baseXp, mastery: clamp(Math.floor((sp.xp + baseXp) / 10), 0, SD_STYLE_MASTERY_MAX) }
                : sp,
            )
          : prev.styleProgress;
        return {
          ...prev,
          xp: newXp,
          level: clamp(newLevel, 1, SD_MAX_LEVEL),
          totalXp: newTotalXp,
          hp: newMaxHp,
          maxHp: newMaxHp,
          stamina: clamp(prev.stamina - staminaCost, 0, newMaxStamina),
          maxStamina: newMaxStamina,
          attack: newAttack,
          defense: newDefense,
          speed: newSpeed,
          styleProgress: updatedStyleProgress,
          trainingCount: prev.trainingCount + 1,
          unallocatedStatPoints: prev.unallocatedStatPoints + unallocatedPoints,
          totalTrainingMinutes: prev.totalTrainingMinutes + duration,
          dojoFavor: prev.dojoFavor + 1,
        };
      });
    },
    [state],
  );

  const sdRestSamurai = useCallback(
    () => {
      return setState((prev) => ({
        ...prev,
        hp: prev.maxHp,
        stamina: prev.maxStamina,
      }));
    },
    [state],
  );

  const sdMeditate = useCallback(
    (minutes?: number) => {
      const duration = minutes ?? 15;
      const spiritGain = Math.floor(duration * 0.3);
      const focusGain = Math.floor(duration * 0.2);
      const staminaRecover = Math.floor(duration * 0.8);
      return setState((prev) => ({
        ...prev,
        spirit: prev.spirit + spiritGain,
        focus: prev.focus + focusGain,
        wisdom: prev.wisdom + Math.floor(duration * 0.15),
        stamina: clamp(prev.stamina + staminaRecover, 0, prev.maxStamina),
        hp: clamp(prev.hp + Math.floor(duration * 0.4), 0, prev.maxHp),
      }));
    },
    [state],
  );

  const sdReadScroll = useCallback(
    () => {
      return setState((prev) => ({
        ...prev,
        wisdom: prev.wisdom + 2,
        strategy: prev.strategy + 1,
        scrollsRead: prev.scrollsRead + 1,
        totalXp: prev.totalXp + 15,
      }));
    },
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Forge                                                              */
  /* ------------------------------------------------------------------ */

  const sdForgeUpgrade = useCallback(
    (weaponId: string) => {
      const hasWeapon = state.inventoryWeapons.includes(weaponId);
      if (!hasWeapon) return state;
      const cost = 50 + state.forgeCount * 20;
      if (state.coins < cost) return state;
      return setState((prev) => ({
        ...prev,
        coins: prev.coins - cost,
        crafting: prev.crafting + 2,
        forgeCount: prev.forgeCount + 1,
      }));
    },
    [state],
  );

  const sdForgeArmor = useCallback(
    () => {
      const cost = 80;
      if (state.coins < cost) return state;
      const rng = mulberry32(state.seed + state.forgeCount + 999);
      const pool = SD_ARMOR.filter((a) => a.levelReq <= state.level);
      if (pool.length === 0) return state;
      const chosen = seededChoice(pool, rng);
      if (state.inventoryArmor.includes(chosen.id)) return state;
      return setState((prev) => ({
        ...prev,
        coins: prev.coins - cost,
        inventoryArmor: [...prev.inventoryArmor, chosen.id],
        crafting: prev.crafting + 3,
        forgeCount: prev.forgeCount + 1,
      }));
    },
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Duel System                                                        */
  /* ------------------------------------------------------------------ */

  const sdInitiateDuel = useCallback(
    (opponentName: string, opponentClan: string) => {
      const duel: SdDuelRecord = {
        id: `duel_${state.seed}_${state.duelHistory.length}`,
        opponent: opponentName,
        clan: opponentClan,
        won: false,
        rounds: 0,
        techniqueUsed: null,
        perfect: false,
      };
      return setState((prev) => ({
        ...prev,
        duelHistory: [...prev.duelHistory, duel],
        hp: prev.maxHp,
        stamina: clamp(prev.maxStamina, 0, prev.maxStamina),
      }));
    },
    [state],
  );

  const sdExecuteDuelRound = useCallback(
    (duelId: string, techniqueId: string | null) => {
      const duelIdx = state.duelHistory.findIndex((d) => d.id === duelId);
      if (duelIdx < 0) return state;
      const stance = SD_STANCES.find((s) => s.id === state.stanceId);
      const atkMod = stance ? stance.attackMod : 1.0;
      const defMod = stance ? stance.defenseMod : 1.0;
      const weapon = SD_WEAPONS.find((w) => w.id === state.equipped.weapon);
      const weaponAtk = weapon ? weapon.attack : 0;
      let baseDamage = Math.floor((state.attack + weaponAtk) * atkMod);
      if (techniqueId) {
        const tech = SD_TECHNIQUES.find((t) => t.id === techniqueId);
        if (tech && state.stamina >= tech.staminaCost) {
          baseDamage += tech.damage;
        }
      }
      const rng = mulberry32(state.seed + duelIdx * 137 + state.duelHistory[duelIdx].rounds * 53);
      const critRoll = rng();
      const isCrit = critRoll < state.critical / 100;
      if (isCrit) baseDamage = Math.floor(baseDamage * 1.8);
      const dodgeRoll = rng();
      const dodged = dodgeRoll < 0.15;
      const finalDamage = dodged ? 0 : baseDamage;
      const rng2 = mulberry32(state.seed + duelIdx * 239 + state.duelHistory[duelIdx].rounds * 97 + 7);
      const oppDamage = Math.floor(10 + state.level * 1.5 + rng2() * 15);
      const oppDodge = rng2() < 0.1;
      const oppFinalDamage = oppDodge ? 0 : Math.floor(oppDamage * defMod);
      return setState((prev) => {
        const updatedDuels = [...prev.duelHistory];
        const duel = { ...updatedDuels[duelIdx] };
        duel.rounds = duel.rounds + 1;
        if (techniqueId) duel.techniqueUsed = techniqueId;
        const newHp = clamp(prev.hp - oppFinalDamage, 0, prev.maxHp);
        const totalDmgDealt = prev.totalDamageDealt + finalDamage;
        const totalDmgReceived = prev.totalDamageReceived + oppFinalDamage;
        updatedDuels[duelIdx] = duel;
        return {
          ...prev,
          duelHistory: updatedDuels,
          hp: newHp,
          totalDamageDealt: totalDmgDealt,
          totalDamageReceived: totalDmgReceived,
        };
      });
    },
    [state],
  );

  const sdResolveDuel = useCallback(
    (duelId: string, won: boolean) => {
      const duelIdx = state.duelHistory.findIndex((d) => d.id === duelId);
      if (duelIdx < 0) return state;
      const duel = state.duelHistory[duelIdx];
      if (duel.rounds < SD_DUEL_ROUNDS) return state;
      const isPerfect = won && state.hp === state.maxHp;
      const honorGain = won ? 20 + state.level * 2 : 5;
      const coinGain = won ? 30 + state.level * 3 : 5;
      const xpGain = won ? 50 + state.level * 5 : 10;
      return setState((prev) => {
        const updatedDuels = [...prev.duelHistory];
        const updatedDuel = { ...updatedDuels[duelIdx], won, perfect: isPerfect };
        updatedDuels[duelIdx] = updatedDuel;
        let newXp = prev.xp + xpGain;
        let newLevel = prev.level;
        let newMaxHp = prev.maxHp;
        let newMaxStamina = prev.maxStamina;
        while (newXp >= xpForLevel(newLevel) && newLevel < SD_MAX_LEVEL) {
          newXp -= xpForLevel(newLevel);
          newLevel += 1;
          newMaxHp += 8;
          newMaxStamina += 4;
        }
        const updatedQuests = prev.quests.map((q) => {
          if (q.completed) return q;
          const questDef = SD_QUESTS.find((qd) => qd.id === q.questId);
          if (!questDef) return q;
          let newProgress = q.progress;
          if (questDef.type === 'duel_wins' && won) newProgress += 1;
          if (questDef.type === 'level') newProgress = newLevel;
          if (questDef.type === 'honor') newProgress = prev.honor + honorGain;
          const completed = newProgress >= questDef.target;
          return { ...q, progress: newProgress, completed };
        });
        const updatedAchievements = prev.achievements.map((a) => {
          if (a.unlocked) return a;
          const achDef = SD_ACHIEVEMENTS.find((ad) => ad.id === a.achievementId);
          if (!achDef) return a;
          let shouldUnlock = false;
          if (achDef.condition === 'duel_wins >= 1' && prev.duelWins + (won ? 1 : 0) >= 1) shouldUnlock = true;
          if (achDef.condition === 'duel_wins >= 10' && prev.duelWins + (won ? 1 : 0) >= 10) shouldUnlock = true;
          if (achDef.condition === 'duel_wins >= 50' && prev.duelWins + (won ? 1 : 0) >= 50) shouldUnlock = true;
          if (achDef.condition === 'level >= 25' && newLevel >= 25) shouldUnlock = true;
          if (achDef.condition === 'level >= 50' && newLevel >= 50) shouldUnlock = true;
          if (achDef.condition === 'perfect_duels >= 1' && isPerfect) shouldUnlock = true;
          if (achDef.condition === 'styles_mastered >= 8' && prev.styleProgress.filter((s) => s.mastery >= SD_STYLE_MASTERY_MAX).length >= 8) shouldUnlock = true;
          if (achDef.condition === 'weapons_owned >= 20' && prev.inventoryWeapons.length >= 20) shouldUnlock = true;
          if (achDef.condition === 'armor_owned >= 15' && prev.inventoryArmor.length >= 15) shouldUnlock = true;
          if (achDef.condition === 'honor >= 1000' && prev.honor + honorGain >= 1000) shouldUnlock = true;
          if (achDef.condition === 'techniques_learned >= 33' && prev.techniques.length >= 33) shouldUnlock = true;
          if (achDef.condition === 'coins >= 5000' && prev.coins + coinGain >= 5000) shouldUnlock = true;
          if (achDef.condition === 'daily_streak >= 7' && prev.daily.streak >= 7) shouldUnlock = true;
          if (achDef.condition === 'quests_completed >= 10' && updatedQuests.filter((q) => q.completed).length >= 10) shouldUnlock = true;
          return shouldUnlock ? { ...a, unlocked: true, unlockedAt: Date.now() } : a;
        });
        return {
          ...prev,
          duelHistory: updatedDuels,
          duelWins: prev.duelWins + (won ? 1 : 0),
          duelLosses: prev.duelLosses + (won ? 0 : 1),
          perfectDuels: prev.perfectDuels + (isPerfect ? 1 : 0),
          honor: clamp(prev.honor + honorGain, 0, SD_MAX_HONOR),
          coins: clamp(prev.coins + coinGain, 0, SD_MAX_COINS),
          xp: newXp,
          level: clamp(newLevel, 1, SD_MAX_LEVEL),
          maxHp: newMaxHp,
          maxStamina: newMaxStamina,
          totalXp: prev.totalXp + xpGain,
          quests: updatedQuests,
          achievements: updatedAchievements,
        };
      });
    },
    [state],
  );

  const sdGetDuelHistory = useCallback(() => state.duelHistory, [state]);

  const sdGetDuelRecord = useCallback(
    (duelId: string) => state.duelHistory.find((d) => d.id === duelId) ?? null,
    [state],
  );

  const sdGetDuelWinRate = useCallback(
    () => {
      const total = state.duelWins + state.duelLosses;
      return total === 0 ? 0 : Math.round((state.duelWins / total) * 100);
    },
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Quests                                                             */
  /* ------------------------------------------------------------------ */

  const sdGetQuests = useCallback(() => state.quests, [state]);

  const sdGetQuest = useCallback(
    (questId: string) => state.quests.find((q) => q.questId === questId) ?? null,
    [state],
  );

  const sdClaimQuestReward = useCallback(
    (questId: string) => {
      const quest = state.quests.find((q) => q.questId === questId);
      if (!quest || !quest.completed || quest.claimed) return state;
      const questDef = SD_QUESTS.find((q) => q.id === questId);
      if (!questDef) return state;
      return setState((prev) => ({
        ...prev,
        quests: prev.quests.map((q) => (q.questId === questId ? { ...q, claimed: true } : q)),
        xp: prev.xp + questDef.reward.xp,
        honor: clamp(prev.honor + questDef.reward.honor, 0, SD_MAX_HONOR),
        coins: clamp(prev.coins + questDef.reward.coins, 0, SD_MAX_COINS),
        totalXp: prev.totalXp + questDef.reward.xp,
      }));
    },
    [state],
  );

  const sdGetActiveQuests = useCallback(() => state.quests.filter((q) => !q.completed), [state]);

  const sdGetCompletedQuests = useCallback(() => state.quests.filter((q) => q.completed), [state]);

  const sdGetClaimableQuests = useCallback(() => state.quests.filter((q) => q.completed && !q.claimed), [state]);

  const sdGetQuestsCompletedCount = useCallback(() => state.quests.filter((q) => q.completed).length, [state]);

  /* ------------------------------------------------------------------ */
  /*  Achievements                                                       */
  /* ------------------------------------------------------------------ */

  const sdGetAchievements = useCallback(() => state.achievements, [state]);

  const sdGetAchievement = useCallback(
    (achievementId: string) => state.achievements.find((a) => a.achievementId === achievementId) ?? null,
    [state],
  );

  const sdIsAchievementUnlocked = useCallback(
    (achievementId: string) => {
      const a = state.achievements.find((ac) => ac.achievementId === achievementId);
      return a ? a.unlocked : false;
    },
    [state],
  );

  const sdGetUnlockedAchievements = useCallback(() => state.achievements.filter((a) => a.unlocked), [state]);

  const sdGetLockedAchievements = useCallback(() => state.achievements.filter((a) => !a.unlocked), [state]);

  const sdGetAchievementsCount = useCallback(() => state.achievements.filter((a) => a.unlocked).length, [state]);

  /* ------------------------------------------------------------------ */
  /*  NPCs                                                               */
  /* ------------------------------------------------------------------ */

  const sdMeetNpc = useCallback(
    (npcId: string) => {
      const exists = SD_NPCS.some((n) => n.id === npcId);
      if (!exists) return state;
      return setState((prev) => ({
        ...prev,
        npcRelations: prev.npcRelations.map((nr) =>
          nr.npcId === npcId && !nr.met ? { ...nr, met: true, favor: nr.favor + 5 } : nr,
        ),
      }));
    },
    [state],
  );

  const sdGetNpcRelation = useCallback(
    (npcId: string) => state.npcRelations.find((nr) => nr.npcId === npcId) ?? null,
    [state],
  );

  const sdGetAllNpcRelations = useCallback(() => state.npcRelations, [state]);

  const sdInteractNpc = useCallback(
    (npcId: string) => {
      return setState((prev) => ({
        ...prev,
        npcRelations: prev.npcRelations.map((nr) =>
          nr.npcId === npcId && nr.met ? { ...nr, favor: clamp(nr.favor + 2, 0, 100) } : nr,
        ),
      }));
    },
    [state],
  );

  const sdGetNpc = useCallback(
    (npcId: string) => SD_NPCS.find((n) => n.id === npcId) ?? null,
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Daily System                                                       */
  /* ------------------------------------------------------------------ */

  const sdGenerateDailySeed = useCallback(
    (day: number) => {
      const rng = mulberry32(state.seed + day * 31);
      return Math.floor(rng() * 100000);
    },
    [state],
  );

  const sdGetDailyTrainingChallenge = useCallback(
    () => {
      const rng = mulberry32(state.daily.daySeed);
      const room = seededChoice(SD_ROOMS, rng);
      const style = seededChoice(SD_STYLES, rng);
      const technique = seededChoice(SD_TECHNIQUES.filter((t) => t.levelReq <= state.level), rng);
      const duration = [15, 30, 45, 60][Math.floor(rng() * 4)];
      return { room: room.name, style: style.name, technique: technique ? technique.name : 'Free Training', duration };
    },
    [state],
  );

  const sdGetDailyHonorDuel = useCallback(
    () => {
      const rng = mulberry32(state.daily.daySeed + 777);
      const clan = seededChoice(SD_CLANS, rng);
      const levelRange = Math.max(1, state.level - 3) + Math.floor(rng() * 6);
      const names = ['Takeda', 'Honda', 'Ishida', 'Uesugi', 'Oda', 'Mori', 'Chosokabe', 'Shimazu', 'Tokugawa', 'Date'];
      const name = seededChoice(names, rng);
      return { opponent: `Ronin ${name}`, clan: clan.name, estimatedLevel: levelRange };
    },
    [state],
  );

  const sdCompleteDailyTraining = () => {
      const challenge = sdGetDailyTrainingChallenge();
      const xpReward = challenge.duration * 2;
      const staminaCost = Math.floor(challenge.duration * 0.3);
      if (state.stamina < staminaCost) return state;
      return setState((prev) => ({
        ...prev,
        daily: { ...prev.daily, trainingCompleted: true, trainingResult: challenge.room },
        stamina: clamp(prev.stamina - staminaCost, 0, prev.maxStamina),
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
        trainingCount: prev.trainingCount + 1,
        coins: clamp(prev.coins + 15, 0, SD_MAX_COINS),
      }));
    };

  const sdCompleteDailyHonorDuel = (won: boolean) => {
      const duelInfo = sdGetDailyHonorDuel();
      const honorGain = won ? 30 : 5;
      const coinGain = won ? 50 : 10;
      return setState((prev) => ({
        ...prev,
        daily: { ...prev.daily, honorDuelCompleted: true, honorDuelResult: won ? 'victory' : 'defeat' },
        honor: clamp(prev.honor + honorGain, 0, SD_MAX_HONOR),
        coins: clamp(prev.coins + coinGain, 0, SD_MAX_COINS),
        duelWins: prev.duelWins + (won ? 1 : 0),
        duelLosses: prev.duelLosses + (won ? 0 : 1),
      }));
    };

  const sdAdvanceDaily = (day: number) => {
      const prevCompleted = state.daily.trainingCompleted && state.daily.honorDuelCompleted;
      return setState((prev) => ({
        ...prev,
        daily: {
          daySeed: sdGenerateDailySeed(day),
          trainingCompleted: false,
          trainingResult: null,
          honorDuelCompleted: false,
          honorDuelResult: null,
          streak: prevCompleted ? prev.daily.streak + 1 : 0,
          lastDay: day,
        },
      }));
    };

  const sdGetDailyStreak = useCallback(() => state.daily.streak, [state]);

  const sdIsDailyComplete = useCallback(
    () => state.daily.trainingCompleted && state.daily.honorDuelCompleted,
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Titles                                                             */
  /* ------------------------------------------------------------------ */

  const sdGetAvailableTitles = useCallback(
    () => SD_TITLES.filter((t) => state.level >= t.levelReq && state.honor >= t.honorReq),
    [state],
  );

  const sdSetTitle = useCallback(
    (titleId: string) => {
      const title = SD_TITLES.find((t) => t.id === titleId);
      if (!title) return state;
      if (state.level < title.levelReq || state.honor < title.honorReq) return state;
      return setState((prev) => ({ ...prev, titleId }));
    },
    [state],
  );

  const sdGetBestAvailableTitle = useCallback(
    () => {
      const available = SD_TITLES.filter((t) => state.level >= t.levelReq && state.honor >= t.honorReq);
      return available.length > 0 ? available[available.length - 1] : SD_TITLES[0];
    },
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Economy                                                            */
  /* ------------------------------------------------------------------ */

  const sdSpendCoins = useCallback(
    (amount: number) => {
      if (state.coins < amount) return state;
      return setState((prev) => ({ ...prev, coins: clamp(prev.coins - amount, 0, SD_MAX_COINS) }));
    },
    [state],
  );

  const sdEarnCoins = useCallback(
    (amount: number) => {
      return setState((prev) => ({ ...prev, coins: clamp(prev.coins + amount, 0, SD_MAX_COINS) }));
    },
    [state],
  );

  const sdAddHonor = useCallback(
    (amount: number) => {
      return setState((prev) => ({ ...prev, honor: clamp(prev.honor + amount, 0, SD_MAX_HONOR) }));
    },
    [state],
  );

  const sdAddXp = useCallback(
    (amount: number) => {
      return setState((prev) => {
        let newXp = prev.xp + amount;
        let newLevel = prev.level;
        let newMaxHp = prev.maxHp;
        let newMaxStamina = prev.maxStamina;
        while (newXp >= xpForLevel(newLevel) && newLevel < SD_MAX_LEVEL) {
          newXp -= xpForLevel(newLevel);
          newLevel += 1;
          newMaxHp += 8;
          newMaxStamina += 4;
        }
        return {
          ...prev,
          xp: newXp,
          level: clamp(newLevel, 1, SD_MAX_LEVEL),
          maxHp: newMaxHp,
          maxStamina: newMaxStamina,
          totalXp: prev.totalXp + amount,
        };
      });
    },
    [state],
  );

  const sdUsePotion = useCallback(
    () => {
      if (state.coins < 10) return state;
      return setState((prev) => ({
        ...prev,
        coins: prev.coins - 10,
        hp: clamp(prev.hp + Math.floor(prev.maxHp * 0.4), 0, prev.maxHp),
        stamina: clamp(prev.stamina + Math.floor(prev.maxStamina * 0.5), 0, prev.maxStamina),
        potionsUsed: prev.potionsUsed + 1,
      }));
    },
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Misc                                                               */
  /* ------------------------------------------------------------------ */

  const sdGetDuelWinStreak = useCallback(() => {
    let streak = 0;
    for (let i = state.duelHistory.length - 1; i >= 0; i--) {
      if (state.duelHistory[i].won) streak++;
      else break;
    }
    return streak;
  }, [state]);

  const sdGetTotalDuels = useCallback(() => state.duelWins + state.duelLosses, [state]);

  const sdGetTrainingCount = useCallback(() => state.trainingCount, [state]);

  const sdGetForgeCount = useCallback(() => state.forgeCount, [state]);

  const sdGetScrollsRead = useCallback(() => state.scrollsRead, [state]);

  const sdGetTotalDamageDealt = useCallback(() => state.totalDamageDealt, [state]);

  const sdGetTotalDamageReceived = useCallback(() => state.totalDamageReceived, [state]);

  const sdGetTotalTechniquesUsed = useCallback(() => state.totalTechniquesUsed, [state]);

  const sdGetSummary = () => ({
      level: state.level,
      title: SD_TITLES.find((t) => t.id === state.titleId)?.name ?? 'Unknown',
      clan: SD_CLANS.find((c) => c.id === state.clanId)?.name ?? 'Ronin',
      style: SD_STYLES.find((s) => s.id === state.styleId)?.name ?? 'None',
      stance: SD_STANCES.find((s) => s.id === state.stanceId)?.name ?? 'Balanced',
      honor: state.honor,
      coins: state.coins,
      duelWins: state.duelWins,
      duelLosses: state.duelLosses,
      combatPower: sdGetCombatPower(),
      room: SD_ROOMS.find((r) => r.id === state.currentRoom)?.name ?? 'Unknown',
      techniques: state.techniques.length,
      achievements: state.achievements.filter((a) => a.unlocked).length,
      dailyStreak: state.daily.streak,
      trainingCount: state.trainingCount,
    });

  const sdIsMaxLevel = useCallback(() => state.level >= SD_MAX_LEVEL, [state]);

  const sdGetXpProgress = useCallback(
    () => ({
      current: state.xp,
      required: xpForLevel(state.level),
      percentage: state.level >= SD_MAX_LEVEL ? 100 : Math.floor((state.xp / xpForLevel(state.level)) * 100),
    }),
    [state],
  );

  const sdCanLearnTechnique = useCallback(
    (techniqueId: string) => {
      const tech = SD_TECHNIQUES.find((t) => t.id === techniqueId);
      if (!tech) return false;
      if (state.level < tech.levelReq) return false;
      if (state.techniques.some((t) => t.techniqueId === techniqueId)) return false;
      return true;
    },
    [state],
  );

  const sdCanEquipWeapon = useCallback(
    (weaponId: string) => {
      if (!state.inventoryWeapons.includes(weaponId)) return false;
      const weapon = SD_WEAPONS.find((w) => w.id === weaponId);
      if (weapon && state.level < weapon.levelReq) return false;
      return true;
    },
    [state],
  );

  const sdCanEquipArmor = useCallback(
    (armorId: string) => {
      if (!state.inventoryArmor.includes(armorId)) return false;
      return true;
    },
    [state],
  );

  const sdHasWeapon = useCallback(
    (weaponId: string) => state.inventoryWeapons.includes(weaponId),
    [state],
  );

  const sdHasArmor = useCallback(
    (armorId: string) => state.inventoryArmor.includes(armorId),
    [state],
  );

  const sdReset = useCallback(
    () => {
      setState(createInitialState(state.seed));
    },
    [state],
  );

  const sdSetSeed = useCallback(
    (newSeed: number) => {
      setState(createInitialState(newSeed));
    },
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Stat Allocation                                                    */
  /* ------------------------------------------------------------------ */

  const sdGetUnallocatedPoints = useCallback(() => state.unallocatedStatPoints, [state]);

  const sdGetStatAllocations = useCallback(() => state.statAllocations, [state]);

  const sdAllocateStat = useCallback(
    (stat: string) => {
      if (state.unallocatedStatPoints <= 0) return state;
      const validStats = ['attack', 'defense', 'speed', 'accuracy', 'critical', 'stealth', 'spirit', 'staminaStat'] as const;
      if (!validStats.includes(stat as any)) return state;
      return setState((prev) => {
        const newAllocations = { ...prev.statAllocations };
        const key = stat as keyof typeof newAllocations;
        newAllocations[key] = (newAllocations[key] ?? 0) + 1;
        const statBoosts: Record<string, Partial<typeof prev>> = {
          attack: { attack: prev.attack + 1 },
          defense: { defense: prev.defense + 1 },
          speed: { speed: prev.speed + 1 },
          accuracy: { accuracy: prev.accuracy + 1 },
          critical: { critical: prev.critical + 1 },
          stealth: { stealth: prev.stealth + 1 },
          spirit: { spirit: prev.spirit + 1 },
          staminaStat: { staminaStat: prev.staminaStat + 1, maxStamina: prev.maxStamina + 2 },
        };
        return {
          ...prev,
          ...statBoosts[stat],
          unallocatedStatPoints: prev.unallocatedStatPoints - 1,
          statAllocations: newAllocations,
        };
      });
    },
    [state],
  );

  const sdResetStatAllocations = useCallback(
    () => {
      if (state.unallocatedStatPoints === 0) return state;
      return setState((prev) => {
        const totalPoints = Object.values(prev.statAllocations).reduce((a, b) => a + b, 0);
        return {
          ...prev,
          unallocatedStatPoints: prev.unallocatedStatPoints + totalPoints,
          statAllocations: { attack: 0, defense: 0, speed: 0, accuracy: 0, critical: 0, stealth: 0, spirit: 0, staminaStat: 0 },
        };
      });
    },
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Karma & Reputation                                                  */
  /* ------------------------------------------------------------------ */

  const sdGetKarma = useCallback(() => state.karma, [state]);

  const sdGetReputation = useCallback(() => state.reputation, [state]);

  const sdGetDojoFavor = useCallback(() => state.dojoFavor, [state]);

  const sdAdjustKarma = useCallback(
    (amount: number) => {
      return setState((prev) => ({
        ...prev,
        karma: clamp(prev.karma + amount, -100, 100),
        reputation: clamp(prev.reputation + Math.abs(amount), 0, 9999),
      }));
    },
    [state],
  );

  const sdAddDojoFavor = useCallback(
    (amount: number) => {
      return setState((prev) => ({
        ...prev,
        dojoFavor: clamp(prev.dojoFavor + amount, 0, 9999),
      }));
    },
    [state],
  );

  const sdGetKarmaRank = useCallback(
    () => {
      if (state.karma >= 80) return 'Saintly';
      if (state.karma >= 50) return 'Honorable';
      if (state.karma >= 20) return 'Righteous';
      if (state.karma >= -20) return 'Neutral';
      if (state.karma >= -50) return 'Ruthless';
      if (state.karma >= -80) return 'Dishonorable';
      return 'Dark';
    },
    [state],
  );

  const sdGetReputationRank = useCallback(
    () => {
      if (state.reputation >= 5000) return 'Legendary';
      if (state.reputation >= 2000) return 'Renowned';
      if (state.reputation >= 800) return 'Respected';
      if (state.reputation >= 300) return 'Known';
      if (state.reputation >= 100) return 'Apprentice';
      return 'Unknown';
    },
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Special Items & Tokens                                             */
  /* ------------------------------------------------------------------ */

  const sdGetSpecialItems = useCallback(() => state.specialItems, [state]);

  const sdHasSpecialItem = useCallback(
    (itemId: string) => state.specialItems.includes(itemId),
    [state],
  );

  const sdAddSpecialItem = useCallback(
    (itemId: string) => {
      if (state.specialItems.includes(itemId)) return state;
      return setState((prev) => ({
        ...prev,
        specialItems: [...prev.specialItems, itemId],
      }));
    },
    [state],
  );

  const sdRemoveSpecialItem = useCallback(
    (itemId: string) => {
      return setState((prev) => ({
        ...prev,
        specialItems: prev.specialItems.filter((id) => id !== itemId),
      }));
    },
    [state],
  );

  const sdGetMasteryTokens = useCallback(() => state.masteryTokens, [state]);

  const sdSpendMasteryToken = useCallback(
    () => {
      if (state.masteryTokens <= 0) return state;
      return setState((prev) => ({
        ...prev,
        masteryTokens: prev.masteryTokens - 1,
        xp: prev.xp + 200,
        totalXp: prev.totalXp + 200,
      }));
    },
    [state],
  );

  const sdAddMasteryToken = useCallback(
    (count?: number) => {
      return setState((prev) => ({
        ...prev,
        masteryTokens: prev.masteryTokens + (count ?? 1),
      }));
    },
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Clan War                                                           */
  /* ------------------------------------------------------------------ */

  const sdGetClanWarContributions = useCallback(() => state.clanWarContributions, [state]);

  const sdContributeToClanWar = useCallback(
    (honorCost: number) => {
      if (state.honor < honorCost || !state.clanId) return state;
      return setState((prev) => ({
        ...prev,
        honor: prev.honor - honorCost,
        clanWarContributions: prev.clanWarContributions + 1,
        reputation: prev.reputation + 10,
      }));
    },
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Totals & Statistics                                                */
  /* ------------------------------------------------------------------ */

  const sdGetTotalTrainingMinutes = useCallback(() => state.totalTrainingMinutes, [state]);

  const sdGetTotalCoinsEarned = useCallback(() => state.totalCoinsEarned, [state]);

  const sdGetTotalHonorEarned = useCallback(() => state.totalHonorEarned, [state]);

  const sdGetPlaytimeHours = useCallback(
    () => Math.floor(state.totalTrainingMinutes / 60 * 10) / 10,
    [state],
  );

  const sdGetDuelAverageDamage = useCallback(
    () => {
      if (state.duelHistory.length === 0) return 0;
      return Math.floor(state.totalDamageDealt / Math.max(state.duelHistory.length, 1));
    },
    [state],
  );

  const sdGetTechniqueMostUsed = useCallback(
    () => {
      if (state.techniques.length === 0) return null;
      const sorted = [...state.techniques].sort((a, b) => b.uses - a.uses);
      if (sorted[0].uses === 0) return null;
      return SD_TECHNIQUES.find((t) => t.id === sorted[0].techniqueId) ?? null;
    },
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Weapon & Armor Filtering                                          */
  /* ------------------------------------------------------------------ */

  const sdGetWeaponsByRarity = useCallback(
    (rarity: string) => SD_WEAPONS.filter((w) => w.rarity === rarity),
    [state],
  );

  const sdGetWeaponsByType = useCallback(
    (type: string) => SD_WEAPONS.filter((w) => w.type === type),
    [state],
  );

  const sdGetWeaponsByLevel = useCallback(
    (maxLevel: number) => SD_WEAPONS.filter((w) => w.levelReq <= maxLevel),
    [state],
  );

  const sdGetArmorBySlot = useCallback(
    (slot: string) => SD_ARMOR.filter((a) => a.slot === slot),
    [state],
  );

  const sdGetArmorByRarity = useCallback(
    (rarity: string) => SD_ARMOR.filter((a) => a.rarity === rarity),
    [state],
  );

  const sdGetTechniquesByStyle = useCallback(
    (styleId: string) => SD_TECHNIQUES.filter((t) => t.style === styleId),
    [state],
  );

  const sdGetTechniquesByLevel = useCallback(
    (maxLevel: number) => SD_TECHNIQUES.filter((t) => t.levelReq <= maxLevel),
    [state],
  );

  const sdGetNpcsByRole = useCallback(
    (role: string) => SD_NPCS.filter((n) => n.role === role),
    [state],
  );

  const sdGetBestWeaponForLevel = useCallback(
    (maxLevel: number) => {
      const available = SD_WEAPONS.filter((w) => w.levelReq <= maxLevel);
      return available.reduce((best, w) => (w.attack > (best?.attack ?? -1) ? w : best), null as (typeof SD_WEAPONS)[number] | null);
    },
    [state],
  );

  const sdGetBestArmorForSlot = useCallback(
    (slot: string, maxLevel: number) => {
      const available = SD_ARMOR.filter((a) => a.slot === slot && a.levelReq <= maxLevel);
      return available.reduce((best, a) => (a.defense > (best?.defense ?? -1) ? a : best), null as (typeof SD_ARMOR)[number] | null);
    },
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Return                                                             */
  /* ------------------------------------------------------------------ */

  return {
    sdGetState,
    sdGetLevel,
    sdGetXp,
    sdGetXpToNext,
    sdGetTotalXp,
    sdGetHp,
    sdGetMaxHp,
    sdGetStamina,
    sdGetMaxStamina,
    sdGetHonor,
    sdGetCoins,
    sdGetClan,
    sdGetStyle,
    sdGetStance,
    sdGetTitle,
    sdGetCurrentRoom,
    sdGetEquippedWeapon,
    sdGetEquippedArmor,
    sdGetStats,
    sdGetCombatPower,
    sdAdoptStyle,
    sdGetStyleProgress,
    sdGetStyleMastery,
    sdGetAllStyleProgress,
    sdTrainStyle,
    sdGetStylesMastered,
    sdLearnTechnique,
    sdGetTechniques,
    sdGetAvailableTechniques,
    sdGetTechniqueProgress,
    sdUseTechnique,
    sdGetTechniquesLearnedCount,
    sdGetInventoryWeapons,
    sdGetInventoryArmor,
    sdEquipWeapon,
    sdEquipArmor,
    sdAddWeapon,
    sdAddArmor,
    sdRemoveWeapon,
    sdRemoveArmor,
    sdGetWeaponsOwnedCount,
    sdGetArmorOwnedCount,
    sdGetArmorSlotsFilled,
    sdJoinClan,
    sdLeaveClan,
    sdGetClanBonus,
    sdSetStance,
    sdGetStanceModifiers,
    sdEnterRoom,
    sdGetRoom,
    sdTrainSamurai,
    sdRestSamurai,
    sdMeditate,
    sdReadScroll,
    sdForgeUpgrade,
    sdForgeArmor,
    sdInitiateDuel,
    sdExecuteDuelRound,
    sdResolveDuel,
    sdGetDuelHistory,
    sdGetDuelRecord,
    sdGetDuelWinRate,
    sdGetQuests,
    sdGetQuest,
    sdClaimQuestReward,
    sdGetActiveQuests,
    sdGetCompletedQuests,
    sdGetClaimableQuests,
    sdGetQuestsCompletedCount,
    sdGetAchievements,
    sdGetAchievement,
    sdIsAchievementUnlocked,
    sdGetUnlockedAchievements,
    sdGetLockedAchievements,
    sdGetAchievementsCount,
    sdMeetNpc,
    sdGetNpcRelation,
    sdGetAllNpcRelations,
    sdInteractNpc,
    sdGetNpc,
    sdGenerateDailySeed,
    sdGetDailyTrainingChallenge,
    sdGetDailyHonorDuel,
    sdCompleteDailyTraining,
    sdCompleteDailyHonorDuel,
    sdAdvanceDaily,
    sdGetDailyStreak,
    sdIsDailyComplete,
    sdGetAvailableTitles,
    sdSetTitle,
    sdGetBestAvailableTitle,
    sdSpendCoins,
    sdEarnCoins,
    sdAddHonor,
    sdAddXp,
    sdUsePotion,
    sdGetDuelWinStreak,
    sdGetTotalDuels,
    sdGetTrainingCount,
    sdGetForgeCount,
    sdGetScrollsRead,
    sdGetTotalDamageDealt,
    sdGetTotalDamageReceived,
    sdGetTotalTechniquesUsed,
    sdGetSummary,
    sdIsMaxLevel,
    sdGetXpProgress,
    sdCanLearnTechnique,
    sdCanEquipWeapon,
    sdCanEquipArmor,
    sdHasWeapon,
    sdHasArmor,
    sdReset,
    sdSetSeed,
    sdGetUnallocatedPoints,
    sdGetStatAllocations,
    sdAllocateStat,
    sdResetStatAllocations,
    sdGetKarma,
    sdGetReputation,
    sdGetDojoFavor,
    sdAdjustKarma,
    sdAddDojoFavor,
    sdGetKarmaRank,
    sdGetReputationRank,
    sdGetSpecialItems,
    sdHasSpecialItem,
    sdAddSpecialItem,
    sdRemoveSpecialItem,
    sdGetMasteryTokens,
    sdSpendMasteryToken,
    sdAddMasteryToken,
    sdGetClanWarContributions,
    sdContributeToClanWar,
    sdGetTotalTrainingMinutes,
    sdGetTotalCoinsEarned,
    sdGetTotalHonorEarned,
    sdGetPlaytimeHours,
    sdGetDuelAverageDamage,
    sdGetTechniqueMostUsed,
    sdGetWeaponsByRarity,
    sdGetWeaponsByType,
    sdGetWeaponsByLevel,
    sdGetArmorBySlot,
    sdGetArmorByRarity,
    sdGetTechniquesByStyle,
    sdGetTechniquesByLevel,
    sdGetNpcsByRole,
    sdGetBestWeaponForLevel,
    sdGetBestArmorForSlot,
  };
}
