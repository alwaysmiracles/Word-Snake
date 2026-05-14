// ============================================================================
// Jade Emperor's Celestial Court Wire — Imperial Court Management Module
// ============================================================================
// SSR-safe: no localStorage, no window/document, no setInterval.
// All exported functions use `je` prefix, all constants use `JE_` prefix.
// ============================================================================

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';

// ============================================================================
// SECTION 1: TYPES & INTERFACES
// ============================================================================

export type JERarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export type JECourtRole =
  | 'minister'
  | 'warrior'
  | 'scribe'
  | 'astrologer'
  | 'healer'
  | 'guard'
  | 'adviser'
  | 'general';

export type JEBeastType =
  | 'dragon'
  | 'phoenix'
  | 'qilin'
  | 'xiezhi'
  | 'tortoise'
  | 'tiger'
  | 'crane'
  | 'carp'
  | 'peng'
  | 'baize';

export type JEDepartment =
  | 'treasury'
  | 'war'
  | 'justice'
  | 'rites'
  | 'works'
  | 'personnel'
  | 'astronomy'
  | 'medicine';

export type JEArtifactType = 'seal' | 'scroll' | 'pendant' | 'weapon' | 'armor' | 'instrument';

export type JEEdictCategory =
  | 'taxation'
  | 'military'
  | 'justice'
  | 'culture'
  | 'infrastructure'
  | 'diplomacy';

export type JEIntrigueType = 'plot' | 'alliance' | 'betrayal' | 'scandal' | 'rebellion' | 'conspiracy';

export interface JECelestialBeing {
  readonly id: string;
  readonly name: string;
  readonly title: string;
  readonly department: JEDepartment;
  readonly role: JECourtRole;
  readonly rarity: JERarity;
  readonly wisdom: number;
  readonly loyalty: number;
  readonly influence: number;
  readonly combat: number;
  readonly description: string;
  readonly emoji: string;
  readonly appointCost: number;
  readonly salary: number;
}

export interface JECourtChamber {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly emoji: string;
  readonly unlockLevel: number;
  readonly unlockCost: number;
  readonly capacity: number;
  readonly bonusType: string;
  readonly bonusValue: number;
}

export interface JEArtifact {
  readonly id: string;
  readonly name: string;
  readonly type: JEArtifactType;
  readonly rarity: JERarity;
  readonly description: string;
  readonly emoji: string;
  readonly power: number;
  readonly cost: number;
  readonly lore: string;
}

export interface JEImperialEdict {
  readonly id: string;
  readonly name: string;
  readonly category: JEEdictCategory;
  readonly description: string;
  readonly emoji: string;
  readonly effectType: string;
  readonly effectValue: number;
  readonly duration: number;
  readonly requiredLevel: number;
  readonly cost: number;
}

export interface JEHeavenlyBeast {
  readonly id: string;
  readonly name: string;
  readonly beastType: JEBeastType;
  readonly rarity: JERarity;
  readonly power: number;
  readonly speed: number;
  readonly description: string;
  readonly emoji: string;
  readonly tamingCost: number;
  readonly upkeepCost: number;
  readonly ability: string;
}

export interface JEAchievement {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly condition: string;
  readonly rewardXP: number;
  readonly rewardCoins: number;
  readonly emoji: string;
}

export interface JETitleThreshold {
  readonly level: number;
  readonly title: string;
  readonly emoji: string;
}

export interface JEIntrigueEvent {
  readonly id: string;
  readonly name: string;
  readonly type: JEIntrigueType;
  readonly description: string;
  readonly emoji: string;
  readonly effectType: string;
  readonly effectValue: number;
  readonly minLevel: number;
  readonly probability: number;
}

export interface JEMinisterInstance {
  readonly id: string;
  beingId: string;
  appointedAt: number;
  chamberId: string | null;
  morale: number;
  skill: number;
  dismissed: boolean;
}

export interface JEDailyAudience {
  readonly id: string;
  date: number;
  petitionsHandled: number;
  petitionsResolved: number;
  coinsEarned: number;
  xpEarned: number;
  events: string[];
  completed: boolean;
}

export interface JECourtState {
  level: number;
  xp: number;
  coins: number;
  ministers: JEMinisterInstance[];
  artifacts: string[];
  appraisedArtifacts: string[];
  tamedBeasts: string[];
  activeBeastId: string | null;
  edicts: JEActiveEdict[];
  achievements: string[];
  dailyAudience: JEDailyAudience | null;
  dailyTasks: JEDailyTaskProgress[];
  activeCeremonies: JECeremonyState[];
  currentChamber: string;
  courtReputation: number;
  totalAppointments: number;
  totalDismissals: number;
  totalEdictsIssued: number;
  totalArtifactsCollected: number;
  totalBeastsTamed: number;
  totalIntriguesSurvived: number;
  totalAudiencesHeld: number;
  totalCeremoniesPerformed: number;
  totalGiftsGiven: number;
  totalPetitionsResolved: number;
  daySeed: number;
}

export interface JEActiveEdict {
  edictId: string;
  issuedAt: number;
  remainingDays: number;
}

// ============================================================================
// SECTION 2: CONSTANTS — CELESTIAL BEINGS (35 officials across 5 tiers)
// ============================================================================

export const JE_MAX_LEVEL: number = 50;

export const JE_CELESTIAL_BEINGS: readonly JECelestialBeing[] = [
  // === Common (8) ===
  { id: 'je_cloud_scribe', name: 'Wei Scribecloud', title: 'Junior Scribe', department: 'personnel', role: 'scribe', rarity: 'Common', wisdom: 10, loyalty: 60, influence: 5, combat: 3, description: 'A diligent scribe who copies imperial decrees with meticulous care.', emoji: '📜', appointCost: 50, salary: 5 },
  { id: 'je_gate_guard', name: 'Bao Ironwall', title: 'Gate Guard Captain', department: 'works', role: 'guard', rarity: 'Common', wisdom: 5, loyalty: 80, influence: 3, combat: 15, description: 'Steadfast guardian of the celestial palace gates.', emoji: '🛡️', appointCost: 60, salary: 6 },
  { id: 'je_herb_boy', name: 'Lin Greenpalm', title: 'Herbal Apprentice', department: 'medicine', role: 'healer', rarity: 'Common', wisdom: 12, loyalty: 55, influence: 2, combat: 2, description: 'Young apprentice learning the arts of celestial herbalism.', emoji: '🌿', appointCost: 40, salary: 4 },
  { id: 'je_star_gazer', name: 'Chen Nightsky', title: 'Junior Astrologer', department: 'astronomy', role: 'astrologer', rarity: 'Common', wisdom: 15, loyalty: 50, influence: 5, combat: 2, description: 'An aspiring astrologer who charts the movements of heavenly bodies.', emoji: '⭐', appointCost: 55, salary: 5 },
  { id: 'je_tax_clerk', name: 'Zhao Ledgersong', title: 'Taxation Clerk', department: 'treasury', role: 'adviser', rarity: 'Common', wisdom: 10, loyalty: 65, influence: 4, combat: 2, description: 'Meticulous keeper of the celestial treasury records.', emoji: '📋', appointCost: 45, salary: 5 },
  { id: 'je_banner_soldier', name: 'Li Steelfist', title: 'Banner Soldier', department: 'war', role: 'warrior', rarity: 'Common', wisdom: 4, loyalty: 75, influence: 3, combat: 18, description: 'A loyal foot soldier who defends the heavenly realm.', emoji: '⚔️', appointCost: 50, salary: 6 },
  { id: 'je_law_reader', name: 'Sun Justtone', title: 'Law Reader', department: 'justice', role: 'scribe', rarity: 'Common', wisdom: 14, loyalty: 60, influence: 5, combat: 3, description: 'Reads aloud the ancient laws during court proceedings.', emoji: '📖', appointCost: 45, salary: 5 },
  { id: 'je_incense_keeper', name: 'Wu Fragrantwind', title: 'Incense Keeper', department: 'rites', role: 'guard', rarity: 'Common', wisdom: 8, loyalty: 70, influence: 3, combat: 5, description: 'Tends the sacred incense in the Hall of Supreme Harmony.', emoji: '🪔', appointCost: 35, salary: 4 },
  // === Uncommon (9) ===
  { id: 'je_golden_advisor', name: 'Lord Huang Ambition', title: 'Golden Adviser', department: 'personnel', role: 'adviser', rarity: 'Uncommon', wisdom: 22, loyalty: 60, influence: 15, combat: 8, description: 'A cunning political strategist with golden-tongued eloquence.', emoji: '🦊', appointCost: 150, salary: 15 },
  { id: 'je_thunder_general', name: 'General Lei Roar', title: 'Thunder General', department: 'war', role: 'general', rarity: 'Uncommon', wisdom: 15, loyalty: 65, influence: 12, combat: 35, description: 'Commands celestial legions with the fury of rolling thunder.', emoji: '🌩️', appointCost: 200, salary: 20 },
  { id: 'je_silver_scales', name: 'Judge Bai Fairwind', title: 'Silver Scales Magistrate', department: 'justice', role: 'minister', rarity: 'Uncommon', wisdom: 25, loyalty: 70, influence: 18, combat: 10, description: 'Known for unwavering fairness in all celestial judgments.', emoji: '⚖️', appointCost: 180, salary: 18 },
  { id: 'je_jade_physician', title: 'Jade Physician', name: 'Dr. Yu Healheart', department: 'medicine', role: 'healer', rarity: 'Uncommon', wisdom: 28, loyalty: 65, influence: 10, combat: 5, description: 'Master healer who can cure ailments with jade-infused remedies.', emoji: '💚', appointCost: 160, salary: 16 },
  { id: 'je_comet_tracker', name: 'Master Feng Stardust', title: 'Comet Tracker', department: 'astronomy', role: 'astrologer', rarity: 'Uncommon', wisdom: 30, loyalty: 55, influence: 14, combat: 5, description: 'Reads prophecies in the tails of passing celestial comets.', emoji: '☄️', appointCost: 170, salary: 17 },
  { id: 'je_vault_keeper', name: 'Treasurer Jin Coinwise', title: 'Vault Keeper', department: 'treasury', role: 'minister', rarity: 'Uncommon', wisdom: 20, loyalty: 60, influence: 16, combat: 8, description: 'Guards the imperial jade vaults with unmatched vigilance.', emoji: '🏦', appointCost: 175, salary: 17 },
  { id: 'je_river_scholar', name: 'Scholar Dao Rivermind', title: 'River Scholar', department: 'rites', role: 'scribe', rarity: 'Uncommon', wisdom: 26, loyalty: 58, influence: 12, combat: 4, description: 'Contemplates the flow of celestial rivers for wisdom.', emoji: '🌊', appointCost: 140, salary: 14 },
  { id: 'je_jade_warrior', name: 'Captain Yù Swordgleam', title: 'Jade Warrior Captain', department: 'war', role: 'warrior', rarity: 'Uncommon', wisdom: 10, loyalty: 72, influence: 10, combat: 38, description: 'Leads the elite Jade Warrior guard with gleaming jade blade.', emoji: '🗡️', appointCost: 190, salary: 19 },
  { id: 'je_cloud_architect', name: 'Architect Meng Skyreach', title: 'Cloud Architect', department: 'works', role: 'adviser', rarity: 'Uncommon', wisdom: 24, loyalty: 55, influence: 14, combat: 6, description: 'Designs magnificent celestial palaces from cloud and jade.', emoji: '🏯', appointCost: 155, salary: 15 },
  // === Rare (9) ===
  { id: 'je_dragon_minister', name: 'Minister Long Skyfire', title: 'Dragon Minister of State', department: 'personnel', role: 'minister', rarity: 'Rare', wisdom: 35, loyalty: 70, influence: 25, combat: 25, description: 'Descended from celestial dragons, commands respect across all departments.', emoji: '🐉', appointCost: 500, salary: 40 },
  { id: 'je_phoenix_strategist', name: 'Lady Feng Flamesage', title: 'Phoenix War Strategist', department: 'war', role: 'general', rarity: 'Rare', wisdom: 32, loyalty: 65, influence: 28, combat: 45, description: 'Rises from defeat like a phoenix, each strategy more brilliant.', emoji: '🔥', appointCost: 550, salary: 45 },
  { id: 'je_iron_judge', name: 'Chief Justice Gang Unbreakable', title: 'Iron Judge of the Heavens', department: 'justice', role: 'minister', rarity: 'Rare', wisdom: 38, loyalty: 80, influence: 30, combat: 20, description: 'His judgments echo through the nine heavens, unyielding as iron.', emoji: '🔨', appointCost: 480, salary: 42 },
  { id: 'je_elixir_master', name: 'Grand Alchemist Pan Immortalbrew', title: 'Elixir Grandmaster', department: 'medicine', role: 'healer', rarity: 'Rare', wisdom: 40, loyalty: 60, influence: 22, combat: 10, description: 'Brews elixirs that can extend celestial lifespans by centuries.', emoji: '⚗️', appointCost: 520, salary: 44 },
  { id: 'je_constellation_sage', name: 'Sage Xing Destinyweaver', title: 'Constellation High Sage', department: 'astronomy', role: 'astrologer', rarity: 'Rare', wisdom: 45, loyalty: 55, influence: 28, combat: 8, description: 'Can read the fate of empires in star alignment patterns.', emoji: '🌌', appointCost: 490, salary: 43 },
  { id: 'je_pearl_treasurer', name: 'Lady Mu Pearlcount', title: 'Pearl Treasurer of the Three Realms', department: 'treasury', role: 'minister', rarity: 'Rare', wisdom: 30, loyalty: 65, influence: 30, combat: 12, description: 'Controls the flow of celestial jade pearls across all realms.', emoji: '💎', appointCost: 510, salary: 44 },
  { id: 'je_ritual_master', name: 'Master Ceremonies Zhou Harmony', title: 'Grand Master of Rites', department: 'rites', role: 'minister', rarity: 'Rare', wisdom: 36, loyalty: 72, influence: 26, combat: 15, description: 'Orchestrates ceremonies that maintain cosmic balance.', emoji: '🎭', appointCost: 470, salary: 41 },
  { id: 'je_celestial_forger', name: 'Artisan Tai Hammerfall', title: 'Celestial Divine Forger', department: 'works', role: 'adviser', rarity: 'Rare', wisdom: 28, loyalty: 68, influence: 24, combat: 30, description: 'Forges weapons and artifacts from starlight and jade ore.', emoji: '⚒️', appointCost: 500, salary: 42 },
  { id: 'je_tiger_general', name: 'General Hu Bravefang', title: 'White Tiger Commander', department: 'war', role: 'general', rarity: 'Rare', wisdom: 18, loyalty: 85, influence: 22, combat: 55, description: 'Commands the western celestial army with tiger-like ferocity.', emoji: '🐯', appointCost: 530, salary: 45 },
  // === Epic (5) ===
  { id: 'je_star_lord', name: 'Starlord Tian Cosmos', title: 'Lord of the Northern Stars', department: 'astronomy', role: 'minister', rarity: 'Epic', wisdom: 52, loyalty: 70, influence: 40, combat: 35, description: 'One of the Nine Star Lords who govern celestial navigation.', emoji: '🌟', appointCost: 1500, salary: 100 },
  { id: 'je_vermillion_bird', name: 'General Zhu Skysoar', title: 'Vermillion Bird Marshal', department: 'war', role: 'general', rarity: 'Epic', wisdom: 30, loyalty: 75, influence: 35, combat: 70, description: 'Embodiment of the southern Vermillion Bird, peerless in battle.', emoji: '🐦', appointCost: 1800, salary: 120 },
  { id: 'je_black_tortoise', name: 'Lord Xuan Eternalguard', title: 'Black Tortoise of the North', department: 'works', role: 'general', rarity: 'Epic', wisdom: 45, loyalty: 90, influence: 38, combat: 60, description: 'Immovable defender whose shell shields the celestial palace.', emoji: '🐢', appointCost: 1600, salary: 110 },
  { id: 'je_jade_empress', name: 'Empress Xi Wangmu', title: 'Queen Mother of the West', department: 'rites', role: 'minister', rarity: 'Epic', wisdom: 55, loyalty: 78, influence: 45, combat: 40, description: 'Keeper of the Peaches of Immortality and royal court protocol.', emoji: '👸', appointCost: 2000, salary: 130 },
  { id: 'je_sky_king', name: 'King Haota Desolaten', title: 'Sky King of the Eastern Heavens', department: 'personnel', role: 'minister', rarity: 'Epic', wisdom: 48, loyalty: 72, influence: 42, combat: 50, description: 'Rules the eastern celestial domain with benevolent wisdom.', emoji: '👑', appointCost: 1900, salary: 125 },
  // === Legendary (4) ===
  { id: 'je_guanyin', name: 'Guanyin Bodhisattva', title: 'Goddess of Mercy', department: 'medicine', role: 'minister', rarity: 'Legendary', wisdom: 65, loyalty: 95, influence: 60, combat: 55, description: 'All-compassionate savior who alleviates suffering across all realms.', emoji: '🙏', appointCost: 5000, salary: 300 },
  { id: 'je_erlang', name: 'Erlang Shen', title: 'Illustrious Sage and Truth-Seeing Eye', department: 'war', role: 'general', rarity: 'Legendary', wisdom: 50, loyalty: 92, influence: 55, combat: 80, description: 'Warrior sage with a third truth-seeing eye and celestial hound.', emoji: '👁️', appointCost: 5500, salary: 350 },
  { id: 'je_nezha', name: 'Nezha the Third Prince', title: 'Lotus Prince of the Celestial Palace', department: 'war', role: 'warrior', rarity: 'Legendary', wisdom: 40, loyalty: 88, influence: 50, combat: 85, description: 'Reborn from lotus flowers, wields the universe ring and fire-tipped spear.', emoji: '🪷', appointCost: 5000, salary: 320 },
  { id: 'je_taibai', name: 'Taibai Jinxing', title: 'Great White Planet of Venus', department: 'astronomy', role: 'adviser', rarity: 'Legendary', wisdom: 70, loyalty: 90, influence: 65, combat: 30, description: 'Chief celestial advisor and envoy of the Jade Emperor himself.', emoji: '🪐', appointCost: 6000, salary: 400 },
];

// ============================================================================
// SECTION 3: CONSTANTS — COURT CHAMBERS (8)
// ============================================================================

export const JE_COURT_CHAMBERS: readonly JECourtChamber[] = [
  { id: 'hall_supreme', name: 'Hall of Supreme Harmony', description: 'The grand throne room where imperial decrees are proclaimed and audiences held.', emoji: '🏛️', unlockLevel: 1, unlockCost: 0, capacity: 6, bonusType: 'influence', bonusValue: 10 },
  { id: 'celestial_garden', name: 'Celestial Garden', description: 'A paradise garden with peaches of immortality and flowing jade streams.', emoji: '🌳', unlockLevel: 3, unlockCost: 200, capacity: 4, bonusType: 'loyalty', bonusValue: 8 },
  { id: 'dragon_throne', name: 'Dragon Throne Room', description: 'Chamber adorned with dragon motifs where the most powerful decisions are made.', emoji: '🐲', unlockLevel: 8, unlockCost: 800, capacity: 5, bonusType: 'combat', bonusValue: 12 },
  { id: 'phoenix_pavilion', name: 'Phoenix Pavilion', description: 'Elegant pavilion for cultural ceremonies and artistic performances.', emoji: '🦚', unlockLevel: 12, unlockCost: 1500, capacity: 4, bonusType: 'wisdom', bonusValue: 10 },
  { id: 'moon_palace', name: 'Moon Palace', description: 'Serene lunar palace where astronomers study the cosmos and healers brew elixirs.', emoji: '🌙', unlockLevel: 18, unlockCost: 3000, capacity: 4, bonusType: 'wisdom', bonusValue: 15 },
  { id: 'star_observatory', name: 'Star Observatory', description: 'Tower reaching the heavens, equipped with celestial instruments for star mapping.', emoji: '🔭', unlockLevel: 25, unlockCost: 5000, capacity: 3, bonusType: 'influence', bonusValue: 20 },
  { id: 'heavenly_kitchen', name: 'Heavenly Kitchen', description: 'Divine kitchen where immortal chefs prepare celestial banquets and elixirs.', emoji: '🍲', unlockLevel: 32, unlockCost: 8000, capacity: 5, bonusType: 'loyalty', bonusValue: 15 },
  { id: 'jade_treasury', name: 'Jade Treasury', description: 'Impenetrable vault safeguarding the realm\'s most precious artifacts and wealth.', emoji: '🏛️', unlockLevel: 40, unlockCost: 15000, capacity: 3, bonusType: 'coins', bonusValue: 25 },
];

// ============================================================================
// SECTION 4: CONSTANTS — JADE ARTIFACTS (30)
// ============================================================================

export const JE_ARTIFACTS: readonly JEArtifact[] = [
  // Seals (5)
  { id: 'art_jade_seal_basic', name: 'Jade Seal of Office', type: 'seal', rarity: 'Common', description: 'A basic jade seal granting authority over minor affairs.', emoji: '🔸', power: 5, cost: 80, lore: 'Every minister begins their journey with this humble seal.' },
  { id: 'art_dragon_seal', name: 'Dragon Seal of Authority', type: 'seal', rarity: 'Uncommon', description: 'Seal carved with coiling dragons, amplifies edict power.', emoji: '🔷', power: 12, cost: 250, lore: 'Said to contain the spirit of an ancient dragon courtier.' },
  { id: 'art_phoenix_seal', name: 'Phoenix Seal of Renewal', type: 'seal', rarity: 'Rare', description: 'A seal that glows with phoenix fire, renews minister morale.', emoji: '🔶', power: 25, cost: 600, lore: 'Forged in the ashes of a dying phoenix, it symbolizes eternal renewal.' },
  { id: 'art_cosmic_seal', name: 'Cosmic Seal of the Heavens', type: 'seal', rarity: 'Epic', description: 'Contains the essence of celestial constellations within.', emoji: '💠', power: 45, cost: 2000, lore: 'The seal used by the Jade Emperor to authenticate universal laws.' },
  { id: 'art_supreme_seal', name: 'Supreme Seal of the Jade Emperor', type: 'seal', rarity: 'Legendary', description: 'The ultimate seal that commands all celestial beings.', emoji: '👑', power: 80, cost: 8000, lore: 'Legend says this seal can rewrite the fabric of reality itself.' },
  // Scrolls (5)
  { id: 'art_bamboo_scroll', name: 'Bamboo Scroll of Wisdom', type: 'scroll', rarity: 'Common', description: 'Ancient bamboo strips inscribed with fundamental wisdom.', emoji: '📜', power: 6, cost: 60, lore: 'Contains the collected sayings of the first celestial sages.' },
  { id: 'art_silk_scroll', name: 'Silk Scroll of Strategy', type: 'scroll', rarity: 'Uncommon', description: 'Battle strategies painted on immortal silk that never fades.', emoji: '🧶', power: 14, cost: 280, lore: 'Penned by a legendary general during the War of the Heavenly Realms.' },
  { id: 'art_gold_scroll', name: 'Golden Scroll of Edicts', type: 'scroll', rarity: 'Rare', description: 'Imperial edicts written in liquid gold on dragon-skin parchment.', emoji: '📜', power: 28, cost: 650, lore: 'Each character radiates with the authority of a thousand edicts.' },
  { id: 'art_star_scroll', name: 'Starlight Scroll of Prophecy', type: 'scroll', rarity: 'Epic', description: 'Scroll that reveals glimpses of future celestial events.', emoji: '🌠', power: 48, cost: 2200, lore: 'Only the greatest astrologers can decipher its cryptic star-maps.' },
  { id: 'art_void_scroll', name: 'Scroll of the Primordial Void', type: 'scroll', rarity: 'Legendary', description: 'Contains knowledge from before creation itself.', emoji: '🌑', power: 85, cost: 9000, lore: 'Said to have been written by the creator god Pangu with his own blood.' },
  // Pendants (5)
  { id: 'art_jade_pendant', name: 'Cloud-pattern Jade Pendant', type: 'pendant', rarity: 'Common', description: 'A simple jade pendant with swirling cloud patterns.', emoji: '🪬', power: 4, cost: 50, lore: 'Worn by junior officials as a mark of their station.' },
  { id: 'art_tiger_pendant', name: 'White Tiger Pendant', type: 'pendant', rarity: 'Uncommon', description: 'Pendant imbued with the protective spirit of the White Tiger.', emoji: '🐯', power: 11, cost: 220, lore: 'Grants the wearer courage and heightened combat awareness.' },
  { id: 'art_tortoise_pendant', name: 'Black Tortoise Pendant', type: 'pendant', rarity: 'Rare', description: 'Ancient tortoise shell pendant offering supreme protection.', emoji: '🐢', power: 22, cost: 550, lore: 'Carved from the actual shell of the celestial Black Tortoise.' },
  { id: 'art_qilin_pendant', name: 'Qilin Blessing Pendant', type: 'pendant', rarity: 'Epic', description: 'Pendant radiating the benevolent qi of a celestial qilin.', emoji: '🦄', power: 40, cost: 1800, lore: 'The qilin only appears in times of great virtue and prosperity.' },
  { id: 'art_dragon_pearl_pendant', name: 'Dragon Pearl Pendant', type: 'pendant', rarity: 'Legendary', description: 'Contains an actual dragon pearl of immense spiritual power.', emoji: '🔮', power: 75, cost: 7500, lore: 'A dragon pearl forms over ten thousand years of cultivation.' },
  // Weapons (5)
  { id: 'art_bronze_sword', name: 'Bronze Straight Sword', type: 'weapon', rarity: 'Common', description: 'Standard-issue bronze sword for celestial guards.', emoji: '🗡️', power: 8, cost: 100, lore: 'Though humble, it has served countless celestial campaigns.' },
  { id: 'art_iron_halberd', name: 'Iron-tipped Jade Halberd', type: 'weapon', rarity: 'Uncommon', description: 'A halberd with an iron head set in a jade shaft.', emoji: '⚔️', power: 18, cost: 300, lore: 'Favored weapon of the Thunder Division commanders.' },
  { id: 'art_star_blade', name: 'Starfall Blade', type: 'weapon', rarity: 'Rare', description: 'Sword forged from a fallen star, cuts through any defense.', emoji: '✨', power: 32, cost: 700, lore: 'The blade hums with the echoes of its stellar birth.' },
  { id: 'art_fire_spear', name: 'Fire-tipped Celestial Spear', type: 'weapon', rarity: 'Epic', description: 'A spear that ignites with celestial fire upon command.', emoji: '🔥', power: 52, cost: 2500, lore: 'Wielded by Nezha during the Great Celestial Rebellion.' },
  { id: 'art_universe_ring', name: 'Universe Ring', type: 'weapon', rarity: 'Legendary', description: 'Cosmic ring that can shrink or grow to any size.', emoji: '💍', power: 90, cost: 10000, lore: 'One of the five divine treasures gifted to Nezha by Taiyi Zhenren.' },
  // Armor (5)
  { id: 'art_leather_armor', name: 'Dragon-leather Armor', type: 'armor', rarity: 'Common', description: 'Armor crafted from shed dragon scales.', emoji: '🛡️', power: 7, cost: 90, lore: 'Light yet surprisingly resilient.' },
  { id: 'art_chain_mail', name: 'Cloud-woven Chain Mail', type: 'armor', rarity: 'Uncommon', description: 'Chain mail woven from cloud threads and silver wire.', emoji: '🔗', power: 16, cost: 270, lore: 'Weighs nothing yet turns aside mortal steel.' },
  { id: 'art_jade_plate', name: 'Jade Plate Armor of Mountains', type: 'armor', rarity: 'Rare', description: 'Full plate armor carved from a single jade mountain.', emoji: '🏯', power: 30, cost: 680, lore: 'As immovable as the mountains from which it was carved.' },
  { id: 'art_phoenix_mantle', name: 'Phoenix Flame Mantle', type: 'armor', rarity: 'Epic', description: 'A cloak of living phoenix fire that heals the wearer.', emoji: '🦅', power: 46, cost: 2100, lore: 'The phoenix willingly shed these feathers to protect a worthy champion.' },
  { id: 'art_lotus_armor', name: 'Lotus Armor of Purity', type: 'armor', rarity: 'Legendary', description: 'Armor grown from lotus flowers, impervious to all corruption.', emoji: '🪷', power: 82, cost: 8500, lore: 'Blooming from divine mud, it represents ultimate spiritual purity.' },
  // Instruments (5)
  { id: 'art_jade_flute', name: 'Jade Flute of Calm', type: 'instrument', rarity: 'Common', description: 'A simple flute carved from green jade.', emoji: '🎵', power: 3, cost: 70, lore: 'Its melody soothes troubled minister spirits.' },
  { id: 'art_dragon_bell', name: 'Dragon Bell of Warning', type: 'instrument', rarity: 'Uncommon', description: 'Bell that tolls when court intrigue is afoot.', emoji: '🔔', power: 10, cost: 240, lore: 'Cannot be silenced by any mortal or divine trickery.' },
  { id: 'art_heaven_drum', name: 'Heavenly War Drum', type: 'instrument', rarity: 'Rare', description: 'Drum whose beat strengthens all allied warriors.', emoji: '🥁', power: 24, cost: 580, lore: 'Its rhythm mirrors the heartbeat of the celestial palace itself.' },
  { id: 'art_cosmic_lute', name: 'Cosmic Lute of Harmony', type: 'instrument', rarity: 'Epic', description: 'Lute that can calm disputes and resolve conflicts.', emoji: '🎸', power: 42, cost: 1900, lore: 'When played during court, even bitter enemies find common ground.' },
  { id: 'art_void_chime', name: 'Chime of the Primordial Void', type: 'instrument', rarity: 'Legendary', description: 'A wind chime that produces sounds from beyond creation.', emoji: '🎐', power: 78, cost: 8200, lore: 'Its ethereal tones grant visions of the true nature of reality.' },
];

// ============================================================================
// SECTION 5: CONSTANTS — IMPERIAL EDICTS (25)
// ============================================================================

export const JE_EDICTS: readonly JEImperialEdict[] = [
  // Taxation (5)
  { id: 'ed_tax_relief', name: 'Celestial Tax Relief', category: 'taxation', description: 'Reduces minister salaries temporarily to boost the treasury.', emoji: '💰', effectType: 'coins', effectValue: 200, duration: 5, requiredLevel: 2, cost: 30 },
  { id: 'ed_jade_tariff', name: 'Jade Import Tariff', category: 'taxation', description: 'Imposes tariffs on celestial trade routes.', emoji: '📦', effectType: 'coins', effectValue: 500, duration: 7, requiredLevel: 8, cost: 100 },
  { id: 'ed_wealth_redistribution', name: 'Mandate of Shared Wealth', category: 'taxation', description: 'Redistributes treasury funds to boost minister loyalty.', emoji: '🤝', effectType: 'loyalty', effectValue: 20, duration: 5, requiredLevel: 12, cost: 400 },
  { id: 'ed_merchant_tax', name: 'Merchant Levy', category: 'taxation', description: 'Special tax on celestial merchants for infrastructure.', emoji: '🏪', effectType: 'coins', effectValue: 800, duration: 10, requiredLevel: 20, cost: 300 },
  { id: 'ed_treasure_expedition', name: 'Expedition for Lost Treasure', category: 'taxation', description: 'Funds expeditions to recover ancient celestial wealth.', emoji: '🗺️', effectType: 'coins', effectValue: 1500, duration: 15, requiredLevel: 30, cost: 1000 },
  // Military (5)
  { id: 'ed_martial_law', name: 'Heavenly Martial Law', category: 'military', description: 'Martial law that boosts all minister combat prowess.', emoji: '⚔️', effectType: 'combat', effectValue: 15, duration: 5, requiredLevel: 3, cost: 50 },
  { id: 'ed_conscription', name: 'Celestial Conscription', category: 'military', description: 'Conscripts additional jade warriors for the court guard.', emoji: '🎖️', effectType: 'combat', effectValue: 25, duration: 7, requiredLevel: 10, cost: 150 },
  { id: 'ed_war_training', name: 'Mandate of War Preparation', category: 'military', description: 'Orders intensive combat training for all military ministers.', emoji: '🏋️', effectType: 'combat', effectValue: 35, duration: 10, requiredLevel: 18, cost: 500 },
  { id: 'ed_dragon_mobilization', name: 'Dragon Mobilization Order', category: 'military', description: 'Calls upon celestial dragons to bolster court defenses.', emoji: '🐲', effectType: 'combat', effectValue: 50, duration: 12, requiredLevel: 28, cost: 1500 },
  { id: 'ed_heavenly_fortress', name: 'Fortress of Heaven Decree', category: 'military', description: 'Transforms the palace into an impenetrable fortress.', emoji: '🏰', effectType: 'combat', effectValue: 80, duration: 15, requiredLevel: 38, cost: 4000 },
  // Justice (5)
  { id: 'ed_fair_trial', name: 'Edict of Fair Trial', category: 'justice', description: 'Ensures all court proceedings follow righteous principles.', emoji: '⚖️', effectType: 'wisdom', effectValue: 10, duration: 5, requiredLevel: 2, cost: 40 },
  { id: 'ed_anti_corruption', name: 'Anti-Corruption Mandate', category: 'justice', description: 'Roots out corruption, boosting wisdom and loyalty.', emoji: '🔍', effectType: 'wisdom', effectValue: 15, duration: 7, requiredLevel: 10, cost: 200 },
  { id: 'ed_retribution', name: 'Celestial Retribution Edict', category: 'justice', description: 'Severe punishments for those who plot against the court.', emoji: '⚡', effectType: 'influence', effectValue: 20, duration: 5, requiredLevel: 15, cost: 350 },
  { id: 'ed_harmony_law', name: 'Great Harmony Law', category: 'justice', description: 'Promotes harmony across all departments, boosting all stats.', emoji: '☮️', effectType: 'loyalty', effectValue: 15, duration: 10, requiredLevel: 22, cost: 600 },
  { id: 'ed_cosmic_justice', name: 'Edict of Cosmic Justice', category: 'justice', description: 'Channels the power of cosmic law itself.', emoji: '🌌', effectType: 'influence', effectValue: 40, duration: 15, requiredLevel: 35, cost: 2500 },
  // Culture (4)
  { id: 'ed_scholarship', name: 'Scholarship Promotion Edict', category: 'culture', description: 'Funds academies and promotes learning among ministers.', emoji: '📚', effectType: 'wisdom', effectValue: 12, duration: 7, requiredLevel: 5, cost: 80 },
  { id: 'ed_arts_festival', name: 'Heavenly Arts Festival', category: 'culture', description: 'Hosts a grand festival boosting influence and morale.', emoji: '🎭', effectType: 'influence', effectValue: 18, duration: 5, requiredLevel: 12, cost: 250 },
  { id: 'ed_ritual_reform', name: 'Sacred Ritual Reform', category: 'culture', description: 'Modernizes court rituals to boost efficiency and wisdom.', emoji: '🪔', effectType: 'wisdom', effectValue: 25, duration: 10, requiredLevel: 22, cost: 800 },
  { id: 'ed_immortal_library', name: 'Grand Immortal Library', category: 'culture', description: 'Establishes the greatest library in the celestial realm.', emoji: '📖', effectType: 'wisdom', effectValue: 45, duration: 20, requiredLevel: 35, cost: 3000 },
  // Infrastructure (3)
  { id: 'ed_road_building', name: 'Cloud Road Construction', category: 'infrastructure', description: 'Builds cloud roads connecting celestial chambers faster.', emoji: '🛤️', effectType: 'coins', effectValue: 150, duration: 10, requiredLevel: 6, cost: 120 },
  { id: 'ed_palace_expansion', name: 'Palace Expansion Decree', category: 'infrastructure', description: 'Expands the palace, increasing chamber capacity.', emoji: '🏗️', effectType: 'loyalty', effectValue: 18, duration: 10, requiredLevel: 16, cost: 600 },
  { id: 'ed_heavenly_bridge', name: 'Rainbow Bridge Project', category: 'infrastructure', description: 'Constructs bridges to connect all heavenly realms.', emoji: '🌈', effectType: 'influence', effectValue: 30, duration: 15, requiredLevel: 30, cost: 2000 },
  // Diplomacy (3)
  { id: 'ed_peace_embassy', name: 'Peace Embassy Mandate', category: 'diplomacy', description: 'Sends peace envoys to strengthen court reputation.', emoji: '🕊️', effectType: 'loyalty', effectValue: 12, duration: 7, requiredLevel: 4, cost: 60 },
  { id: 'ed_alliance_treaty', name: 'Celestial Alliance Treaty', category: 'diplomacy', description: 'Forms alliances with neighboring celestial courts.', emoji: '🤝', effectType: 'influence', effectValue: 22, duration: 12, requiredLevel: 20, cost: 700 },
  { id: 'ed_cosmic_accord', name: 'Cosmic Accord of Eternity', category: 'diplomacy', description: 'Establishes eternal peace across all heavenly realms.', emoji: '🌐', effectType: 'loyalty', effectValue: 35, duration: 20, requiredLevel: 40, cost: 5000 },
];

// ============================================================================
// SECTION 6: CONSTANTS — HEAVENLY BEASTS (22)
// ============================================================================

export const JE_HEAVENLY_BEASTS: readonly JEHeavenlyBeast[] = [
  // Dragons (4)
  { id: 'beast_cloud_dragon', name: 'Cloud Dragon', beastType: 'dragon', rarity: 'Common', power: 20, speed: 30, description: 'A serene dragon that rides the celestial cloud currents.', emoji: '🐲', tamingCost: 100, upkeepCost: 10, ability: 'Cloud Veil — obscures allies in protective mist' },
  { id: 'beast_jade_dragon', name: 'Jade Serpent Dragon', beastType: 'dragon', rarity: 'Rare', power: 45, speed: 25, description: 'Ancient dragon carved from living jade stone.', emoji: '🐉', tamingCost: 500, upkeepCost: 40, ability: 'Jade Shield — creates impenetrable jade barriers' },
  { id: 'beast_golden_dragon', name: 'Golden Celestial Dragon', beastType: 'dragon', rarity: 'Epic', power: 70, speed: 35, description: 'Supreme dragon of the golden celestial palace.', emoji: '✨', tamingCost: 2000, upkeepCost: 120, ability: 'Golden Rain — showers the court with celestial wealth' },
  { id: 'beast_azure_dragon', name: 'Azure Dragon of the East', beastType: 'dragon', rarity: 'Legendary', power: 95, speed: 50, description: 'One of the Four Celestial Guardians, embodiment of spring and renewal.', emoji: '🌊', tamingCost: 8000, upkeepCost: 400, ability: 'Eastern Tempest — commands storms and rainfall across realms' },
  // Phoenixes (3)
  { id: 'beast_fire_phoenix', name: 'Fire Phoenix Chick', beastType: 'phoenix', rarity: 'Common', power: 15, speed: 35, description: 'A young phoenix learning to control its inner flame.', emoji: '🐦', tamingCost: 80, upkeepCost: 8, ability: 'Warmth — slightly heals nearby allies' },
  { id: 'beast_crimson_phoenix', name: 'Crimson Phoenix', beastType: 'phoenix', rarity: 'Epic', power: 65, speed: 45, description: 'A phoenix of devastating beauty and power.', emoji: '🔥', tamingCost: 1800, upkeepCost: 100, ability: 'Crimson Rebirth — revives a fallen minister with renewed vigor' },
  { id: 'beast_pure_phoenix', name: 'Phoenix of Pure Light', beastType: 'phoenix', rarity: 'Legendary', power: 90, speed: 55, description: 'The original phoenix from which all others descend.', emoji: '🌅', tamingCost: 7500, upkeepCost: 380, ability: 'Purification Flame — cleanses all corruption from the court' },
  // Qilin (2)
  { id: 'beast_jade_qilin', name: 'Jade Qilin', beastType: 'qilin', rarity: 'Rare', power: 40, speed: 28, description: 'A benevolent qilin that appears during prosperous times.', emoji: '🦄', tamingCost: 600, upkeepCost: 45, ability: 'Auspicious Qi — boosts all minister stats temporarily' },
  { id: 'beast_golden_qilin', name: 'Golden Qilin Sage', beastType: 'qilin', rarity: 'Legendary', power: 85, speed: 40, description: 'The wisest of all qilin, said to speak all languages.', emoji: '🌟', tamingCost: 9000, upkeepCost: 450, ability: 'Universal Harmony — resolves all disputes instantly' },
  // Xiezhi (2)
  { id: 'beast_bronze_xiezhi', name: 'Bronze Xiezhi', beastType: 'xiezhi', rarity: 'Uncommon', power: 25, speed: 20, description: 'A justice beast that can detect lies and corruption.', emoji: '⚖️', tamingCost: 200, upkeepCost: 18, ability: 'Truth Gaze — reveals hidden intrigue plots' },
  { id: 'beast_jade_xiezhi', name: 'Jade Xiezhi of Justice', beastType: 'xiezhi', rarity: 'Epic', power: 55, speed: 22, description: 'The supreme symbol of celestial justice and fairness.', emoji: '💎', tamingCost: 1500, upkeepCost: 90, ability: 'Divine Judgment — automatically resolves court intrigue events' },
  // Tortoises (2)
  { id: 'beast_stone_tortoise', name: 'Stone-back Tortoise', beastType: 'tortoise', rarity: 'Common', power: 25, speed: 8, description: 'A slow but incredibly durable celestial tortoise.', emoji: '🐢', tamingCost: 70, upkeepCost: 7, ability: 'Stone Shell — provides defensive aura to court chamber' },
  { id: 'beast_black_tortoise', name: 'Black Tortoise of the North', beastType: 'tortoise', rarity: 'Epic', power: 75, speed: 15, description: 'One of the Four Celestial Guardians, master of defense.', emoji: '🛡️', tamingCost: 2200, upkeepCost: 130, ability: 'Northern Shield — makes the entire court immune to intrigue' },
  // Tigers (2)
  { id: 'beast_cloud_tiger', name: 'Cloud Tiger', beastType: 'tiger', rarity: 'Uncommon', power: 30, speed: 35, description: 'A swift tiger that hunts among the clouds.', emoji: '🐯', tamingCost: 180, upkeepCost: 16, ability: 'Cloud Pounce — boosts court combat readiness' },
  { id: 'beast_white_tiger', name: 'White Tiger of the West', beastType: 'tiger', rarity: 'Epic', power: 72, speed: 42, description: 'One of the Four Celestial Guardians, embodiment of autumn and metal.', emoji: '🐅', tamingCost: 1900, upkeepCost: 110, ability: 'Western Roar — inspires all ministers to peak combat form' },
  // Cranes (2)
  { id: 'beast_silver_crane', name: 'Silver Crane', beastType: 'crane', rarity: 'Uncommon', power: 10, speed: 40, description: 'An elegant crane that delivers messages between chambers.', emoji: '🦢', tamingCost: 120, upkeepCost: 12, ability: 'Swift Flight — doubles audience petition speed' },
  { id: 'beast_immortal_crane', name: 'Immortal Crane of Longevity', beastType: 'crane', rarity: 'Rare', power: 15, speed: 45, description: 'A crane said to live ten thousand years, symbol of immortality.', emoji: '🕊️', tamingCost: 450, upkeepCost: 35, ability: 'Longevity Blessing — extends active edict durations' },
  // Carp (1)
  { id: 'beast_dragon_gate_carp', name: 'Dragon Gate Carp', beastType: 'carp', rarity: 'Rare', power: 35, speed: 30, description: 'A carp that leapt the Dragon Gate and gained wisdom.', emoji: '🐟', tamingCost: 400, upkeepCost: 30, ability: 'Dragon Leap — provides massive XP bonus once per day' },
  // Peng (1)
  { id: 'beast_great_peng', name: 'Great Peng Bird', beastType: 'peng', rarity: 'Legendary', power: 88, speed: 60, description: 'A colossal bird that can fly 90,000 li in a single wingbeat.', emoji: '🦅', tamingCost: 8500, upkeepCost: 420, ability: 'Cosmic Flight — transports the court instantly anywhere' },
  // Baize (1)
  { id: 'beast_baize', name: 'Baize the All-Knowing', beastType: 'baize', rarity: 'Legendary', power: 60, speed: 25, description: 'Mythical white beast that knows all things in the world.', emoji: '🐑', tamingCost: 7000, upkeepCost: 350, ability: 'Omniscience — reveals all hidden information about ministers' },
  // Additional (2)
  { id: 'beast_earth_hound', name: 'Celestial Hound of Erlang', beastType: 'tiger', rarity: 'Rare', power: 50, speed: 38, description: 'The divine hunting hound of Erlang Shen.', emoji: '🐕', tamingCost: 550, upkeepCost: 42, ability: 'Divine Tracking — reveals the source of any intrigue' },
  { id: 'beast_ice_phoenix', name: 'Ice Phoenix', beastType: 'phoenix', rarity: 'Rare', power: 42, speed: 32, description: 'A rare phoenix born from frozen starlight.', emoji: '❄️', tamingCost: 480, upkeepCost: 38, ability: 'Frozen Rebirth — revives and boosts a minister with ice power' },
];

// ============================================================================
// SECTION 7: CONSTANTS — INTRIGUE EVENTS (15)
// ============================================================================

export const JE_INTRIGUE_EVENTS: readonly JEIntrigueEvent[] = [
  { id: 'intrigue_whispering', name: 'The Whispering Campaign', type: 'plot', description: 'Someone spreads rumors undermining a minister\'s reputation.', emoji: '🗣️', effectType: 'loyalty', effectValue: -15, minLevel: 3, probability: 0.15 },
  { id: 'intrigue_embezzlement', name: 'The Jade Vault Heist', type: 'plot', description: 'A hidden plot to siphon funds from the celestial treasury.', emoji: '💎', effectType: 'coins', effectValue: -300, minLevel: 5, probability: 0.10 },
  { id: 'intrigue_secret_alliance', name: 'The Midnight Alliance', type: 'alliance', description: 'Two ministers form a secret pact to increase their influence.', emoji: '🤝', effectType: 'influence', effectValue: 20, minLevel: 8, probability: 0.12 },
  { id: 'intrigue_betrayal', name: 'The Treacherous General', type: 'betrayal', description: 'A trusted general reveals allegiance to a rival court.', emoji: '🗡️', effectType: 'combat', effectValue: -20, minLevel: 10, probability: 0.08 },
  { id: 'intrigue_scandal', name: 'The Imperial Scandal', type: 'scandal', description: 'A scandal involving a high-ranking minister threatens court stability.', emoji: '📰', effectType: 'influence', effectValue: -25, minLevel: 6, probability: 0.10 },
  { id: 'intrigue_rebellion', name: 'The Celestial Rebellion', type: 'rebellion', description: 'A group of ministers plots to overthrow the court leadership.', emoji: '⚡', effectType: 'loyalty', effectValue: -30, minLevel: 15, probability: 0.06 },
  { id: 'intrigue_assassination', name: 'The Poisoned Chalice', type: 'conspiracy', description: 'An assassination attempt via poisoned tea during court session.', emoji: '☕', effectType: 'combat', effectValue: -10, minLevel: 12, probability: 0.07 },
  { id: 'intrigue_smuggling', name: 'The Artifact Smuggling Ring', type: 'plot', description: 'Ministers are secretly smuggling jade artifacts out of the treasury.', emoji: '📦', effectType: 'coins', effectValue: -500, minLevel: 14, probability: 0.09 },
  { id: 'intrigue_faction_war', name: 'The Faction Civil War', type: 'rebellion', description: 'Two powerful factions within the court clash openly.', emoji: '⚔️', effectType: 'influence', effectValue: -30, minLevel: 18, probability: 0.06 },
  { id: 'intrigue_prophecy', name: 'The Dark Prophecy', type: 'conspiracy', description: 'An astrologer reveals a disturbing prophecy about the court\'s future.', emoji: '🌑', effectType: 'loyalty', effectValue: -20, minLevel: 10, probability: 0.08 },
  { id: 'intrigue_infiltration', name: 'The Demon Infiltration', type: 'conspiracy', description: 'A celestial minister is discovered to be a demon in disguise.', emoji: '👹', effectType: 'combat', effectValue: -25, minLevel: 20, probability: 0.05 },
  { id: 'intrigue_trade_war', name: 'The Trade Embargo', type: 'betrayal', description: 'A rival celestial court imposes a trade embargo on your realm.', emoji: '🚫', effectType: 'coins', effectValue: -400, minLevel: 16, probability: 0.07 },
  { id: 'intrigue_spiritual_crisis', name: 'The Spiritual Crisis', type: 'scandal', description: 'A failure in court rituals causes a decline in cosmic harmony.', emoji: '😵', effectType: 'wisdom', effectValue: -20, minLevel: 22, probability: 0.05 },
  { id: 'intrigue_heavenly_bet', name: 'The Heavenly Gambler\'s Debt', type: 'scandal', description: 'A minister has accumulated dangerous gambling debts.', emoji: '🎲', effectType: 'coins', effectValue: -200, minLevel: 8, probability: 0.10 },
  { id: 'intrigue_ancient_curse', name: 'The Ancient Curse', type: 'conspiracy', description: 'An ancient curse awakens, affecting minister loyalty and morale.', emoji: '💀', effectType: 'loyalty', effectValue: -25, minLevel: 25, probability: 0.04 },
];

// ============================================================================
// SECTION 8: CONSTANTS — ACHIEVEMENTS (18)
// ============================================================================

export const JE_ACHIEVEMENTS: readonly JEAchievement[] = [
  { id: 'ach_first_appointment', name: 'First Appointment', description: 'Appoint your first minister to the court.', condition: 'totalAppointments >= 1', rewardXP: 50, rewardCoins: 100, emoji: '🏆' },
  { id: 'ach_court_established', name: 'Court Established', description: 'Have 5 ministers serving simultaneously.', condition: 'ministers >= 5', rewardXP: 150, rewardCoins: 300, emoji: '🏛️' },
  { id: 'ach_first_edict', name: 'First Decree', description: 'Issue your first imperial edict.', condition: 'totalEdictsIssued >= 1', rewardXP: 80, rewardCoins: 150, emoji: '📜' },
  { id: 'ach_artifact_collector', name: 'Artifact Collector', description: 'Collect 10 jade artifacts.', condition: 'artifacts >= 10', rewardXP: 200, rewardCoins: 500, emoji: '💎' },
  { id: 'ach_beast_master', name: 'Beast Master', description: 'Tame 5 heavenly beasts.', condition: 'beasts >= 5', rewardXP: 250, rewardCoins: 600, emoji: '🐲' },
  { id: 'ach_loyal_court', name: 'Loyal Court', description: 'All ministers have loyalty above 80.', condition: 'allMinistersLoyal', rewardXP: 300, rewardCoins: 400, emoji: '❤️' },
  { id: 'ach_first_audience', name: 'First Audience', description: 'Hold your first celestial court audience.', condition: 'totalAudiencesHeld >= 1', rewardXP: 60, rewardCoins: 120, emoji: '👑' },
  { id: 'ach_ten_audiences', name: 'Diligent Ruler', description: 'Hold 10 celestial court audiences.', condition: 'totalAudiencesHeld >= 10', rewardXP: 300, rewardCoins: 700, emoji: '📅' },
  { id: 'ach_all_chambers', name: 'Palace Complete', description: 'Unlock all 8 court chambers.', condition: 'allChambersUnlocked', rewardXP: 500, rewardCoins: 2000, emoji: '🏯' },
  { id: 'ach_wealthy_emperor', name: 'Wealthy Emperor', description: 'Accumulate 10,000 celestial coins.', condition: 'coins >= 10000', rewardXP: 400, rewardCoins: 500, emoji: '💰' },
  { id: 'ach_legendary_minister', name: 'Legendary Minister', description: 'Appoint a Legendary-rarity minister.', condition: 'hasLegendaryMinister', rewardXP: 500, rewardCoins: 800, emoji: '🌟' },
  { id: 'ach_all_departments', name: 'All Departments', description: 'Have at least one minister from each department.', condition: 'allDepartments', rewardXP: 350, rewardCoins: 600, emoji: '📋' },
  { id: 'ach_intrigue_survivor', name: 'Intrigue Survivor', description: 'Survive 10 court intrigue events.', condition: 'intrigues >= 10', rewardXP: 400, rewardCoins: 800, emoji: '🛡️' },
  { id: 'ach_max_level', name: 'Supreme Emperor', description: 'Reach the maximum court level of 50.', condition: 'level >= 50', rewardXP: 2000, rewardCoins: 5000, emoji: '👑' },
  { id: 'ach_all_beast_types', name: 'Bestiary Complete', description: 'Tame beasts of 5 different types.', condition: 'beastTypes >= 5', rewardXP: 600, rewardCoins: 1000, emoji: '📚' },
  { id: 'ach_artifact_appraiser', name: 'Master Appraiser', description: 'Appraise 15 artifacts.', condition: 'appraised >= 15', rewardXP: 350, rewardCoins: 700, emoji: '🔍' },
  { id: 'ach_hundred_edicts', name: 'Edict Emperor', description: 'Issue 50 imperial edicts total.', condition: 'edicts >= 50', rewardXP: 800, rewardCoins: 2000, emoji: '📝' },
  { id: 'ach_reputation_max', name: 'Revered Emperor', description: 'Reach maximum court reputation.', condition: 'reputation >= 100', rewardXP: 1000, rewardCoins: 3000, emoji: '🌟' },
];

// ============================================================================
// SECTION 9: CONSTANTS — TITLE THRESHOLDS (8)
// ============================================================================

export const JE_TITLE_THRESHOLDS: readonly JETitleThreshold[] = [
  { level: 1, title: 'Mortal Servant', emoji: '🎭' },
  { level: 5, title: 'Celestial Page', emoji: '📜' },
  { level: 10, title: 'Jade Scribe', emoji: '🖋️' },
  { level: 18, title: 'Heavenly Minister', emoji: '🏛️' },
  { level: 25, title: 'Celestial General', emoji: '⚔️' },
  { level: 33, title: 'Imperial Chancellor', emoji: '🎭' },
  { level: 42, title: 'Divine Sovereign', emoji: '👑' },
  { level: 50, title: 'Jade Emperor', emoji: '🐉' },
];

// ============================================================================
// SECTION 10: CONSTANTS — DAILY TASKS TEMPLATES (10)
// ============================================================================

export interface JEDailyTask {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: 'minister' | 'edict' | 'artifact' | 'beast' | 'audience' | 'intrigue';
  readonly target: number;
  readonly xpReward: number;
  readonly coinReward: number;
  readonly emoji: string;
}

export const JE_DAILY_TASKS: readonly JEDailyTask[] = [
  { id: 'dt_appoint_one', name: 'New Blood', description: 'Appoint 1 new minister to the court.', category: 'minister', target: 1, xpReward: 40, coinReward: 50, emoji: '📜' },
  { id: 'dt_train_minister', name: 'Skill Drill', description: 'Train a minister 2 times.', category: 'minister', target: 2, xpReward: 60, coinReward: 80, emoji: '🏋️' },
  { id: 'dt_boost_morale', name: 'Morale Boost', description: 'Boost minister morale 3 times.', category: 'minister', target: 3, xpReward: 50, coinReward: 60, emoji: '❤️' },
  { id: 'dt_issue_edict', name: 'Decree Day', description: 'Issue 1 imperial edict.', category: 'edict', target: 1, xpReward: 45, coinReward: 70, emoji: '📜' },
  { id: 'dt_collect_artifact', name: 'Treasure Hunt', description: 'Collect 1 jade artifact.', category: 'artifact', target: 1, xpReward: 55, coinReward: 40, emoji: '💎' },
  { id: 'dt_appraise_artifact', name: 'Appraisal Duty', description: 'Appraise 2 artifacts.', category: 'artifact', target: 2, xpReward: 70, coinReward: 50, emoji: '🔍' },
  { id: 'dt_tame_beast', name: 'Beast Whisperer', description: 'Tame 1 heavenly beast.', category: 'beast', target: 1, xpReward: 80, coinReward: 60, emoji: '🐲' },
  { id: 'dt_ride_beast', name: 'Celestial Ride', description: 'Ride your active beast 2 times.', category: 'beast', target: 2, xpReward: 50, coinReward: 90, emoji: '🦅' },
  { id: 'dt_hold_audience', name: 'Court Session', description: 'Hold 1 celestial court audience.', category: 'audience', target: 1, xpReward: 50, coinReward: 80, emoji: '🏛️' },
  { id: 'dt_handle_petitions', name: 'Petition Master', description: 'Handle 5 petitions during audience.', category: 'audience', target: 5, xpReward: 80, coinReward: 100, emoji: '📋' },
];

export interface JEDailyTaskProgress {
  taskId: string;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
}

// ============================================================================
// SECTION 11: CONSTANTS — COURT CEREMONIES (8)
// ============================================================================

export interface JECeremony {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly emoji: string;
  readonly cost: number;
  readonly requiredLevel: number;
  readonly requiredMinisters: number;
  readonly effectType: string;
  readonly effectValue: number;
  readonly durationDays: number;
}

export const JE_CEREMONIES: readonly JECeremony[] = [
  { id: 'cer_dawn_prayer', name: 'Dawn Prayer Ceremony', description: 'A solemn prayer at dawn to bless the court with wisdom.', emoji: '🌅', cost: 50, requiredLevel: 1, requiredMinisters: 1, effectType: 'wisdom', effectValue: 10, durationDays: 1 },
  { id: 'cer_dragon_festival', name: 'Dragon Boat Festival', description: 'A joyous festival honoring celestial dragons with races and feasts.', emoji: '🐲', cost: 300, requiredLevel: 8, requiredMinisters: 3, effectType: 'loyalty', effectValue: 20, durationDays: 3 },
  { id: 'cer_moon_worship', name: 'Moon Worship Ritual', description: 'Venerate the moon goddess Chang\'e for celestial blessings.', emoji: '🌕', cost: 200, requiredLevel: 12, requiredMinisters: 2, effectType: 'wisdom', effectValue: 25, durationDays: 2 },
  { id: 'cer_ancestral_honor', name: 'Ancestral Honor Ceremony', description: 'Pay respects to celestial ancestors for their guidance.', emoji: '🕯️', cost: 400, requiredLevel: 15, requiredMinisters: 4, effectType: 'influence', effectValue: 20, durationDays: 3 },
  { id: 'cer_qilin_blessing', name: 'Qilin Blessing Ceremony', description: 'Summon the qilin for its benevolent blessing upon the court.', emoji: '🦄', cost: 800, requiredLevel: 22, requiredMinisters: 5, effectType: 'loyalty', effectValue: 30, durationDays: 5 },
  { id: 'cer_imperial_coronation', name: 'Imperial Coronation', description: 'A grand coronation ceremony reaffirming your divine mandate.', emoji: '👑', cost: 2000, requiredLevel: 30, requiredMinisters: 6, effectType: 'influence', effectValue: 50, durationDays: 7 },
  { id: 'cer_cosmic_alignment', name: 'Cosmic Alignment Ritual', description: 'Align the court with cosmic forces during a rare celestial event.', emoji: '🌌', cost: 5000, requiredLevel: 40, requiredMinisters: 8, effectType: 'wisdom', effectValue: 60, durationDays: 10 },
  { id: 'cer_jade_emperor_ascension', name: 'Jade Emperor Ascension', description: 'The ultimate ceremony to ascend to full Jade Emperor status.', emoji: '🐉', cost: 10000, requiredLevel: 48, requiredMinisters: 10, effectType: 'influence', effectValue: 100, durationDays: 30 },
];

export interface JECeremonyState {
  ceremonyId: string;
  performedAt: number;
  remainingDays: number;
}

// ============================================================================
// SECTION 12: CONSTANTS — CELESTIAL GIFTS (10)
// ============================================================================

export interface JECelestialGift {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly emoji: string;
  readonly cost: number;
  readonly effectType: string;
  readonly effectValue: number;
  readonly targetType: 'minister' | 'beast' | 'self';
}

export const JE_CELESTIAL_GIFTS: readonly JECelestialGift[] = [
  { id: 'gift_jade_tea', name: 'Premium Jade Tea', description: 'Rare tea from the celestial mountains that calms the mind.', emoji: '🍵', cost: 30, effectType: 'morale', effectValue: 15, targetType: 'minister' },
  { id: 'gift_silk_robe', name: 'Immortal Silk Robe', description: 'A luxurious silk robe that enhances minister prestige.', emoji: '👘', cost: 100, effectType: 'influence', effectValue: 10, targetType: 'minister' },
  { id: 'gift_star_fragment', name: 'Star Fragment', description: 'A shard of a fallen star pulsing with cosmic energy.', emoji: '⭐', cost: 200, effectType: 'wisdom', effectValue: 12, targetType: 'minister' },
  { id: 'gift_dragons_breath_wine', name: "Dragon's Breath Wine", description: 'Potent wine brewed with dragon fire, boosts morale immensely.', emoji: '🍷', cost: 150, effectType: 'morale', effectValue: 30, targetType: 'minister' },
  { id: 'gift_pearl_necklace', name: 'Pearl of the Eastern Sea', description: 'A luminous pearl from the deepest celestial ocean.', emoji: '📿', cost: 500, effectType: 'influence', effectValue: 20, targetType: 'minister' },
  { id: 'gift_spirit_fruit', name: 'Spirit Fruit of Longevity', description: 'A celestial fruit that enhances all abilities temporarily.', emoji: '🍑', cost: 300, effectType: 'skill', effectValue: 15, targetType: 'minister' },
  { id: 'gift_celestial_brush', name: 'Celestial Calligraphy Brush', description: 'A brush that writes edicts of extraordinary power.', emoji: '🖌️', cost: 250, effectType: 'wisdom', effectValue: 20, targetType: 'self' },
  { id: 'gift_jade_carrot', name: 'Jade Spirit Carrot', description: 'A mystical carrot loved by all heavenly beasts.', emoji: '🥕', cost: 50, effectType: 'morale', effectValue: 20, targetType: 'beast' },
  { id: 'gift_phoenix_feather', name: 'Phoenix Tail Feather', description: 'A shimmering feather that radiates warmth and vitality.', emoji: '🪶', cost: 400, effectType: 'morale', effectValue: 25, targetType: 'beast' },
  { id: 'gift_cosmic_incense', name: 'Cosmic Incense Bundle', description: 'Incense from the edge of the universe, calms the entire court.', emoji: '🪔', cost: 350, effectType: 'morale', effectValue: 8, targetType: 'self' },
];

// ============================================================================
// SECTION 13: HELPERS (outside hook)
// ============================================================================

function jeXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.6));
}

let JE_idCounter = 0;
function jeGenerateId(): string {
  JE_idCounter += 1;
  return `je_${JE_idCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`;
}

function jeRarityMultiplier(rarity: JERarity): number {
  switch (rarity) {
    case 'Common': return 1.0;
    case 'Uncommon': return 1.3;
    case 'Rare': return 1.6;
    case 'Epic': return 2.0;
    case 'Legendary': return 2.5;
  }
}

function jeRarityCoinBonus(rarity: JERarity): number {
  switch (rarity) {
    case 'Common': return 10;
    case 'Uncommon': return 25;
    case 'Rare': return 60;
    case 'Epic': return 150;
    case 'Legendary': return 400;
  }
}

function jeCreateInitialCourtState(): JECourtState {
  return {
    level: 1,
    xp: 0,
    coins: 500,
    ministers: [],
    artifacts: [],
    appraisedArtifacts: [],
    tamedBeasts: [],
    activeBeastId: null,
    edicts: [],
    achievements: [],
    dailyAudience: null,
    dailyTasks: jeCreateInitialDailyTasks(Date.now() % 100000),
    activeCeremonies: [],
    currentChamber: 'hall_supreme',
    courtReputation: 10,
    totalAppointments: 0,
    totalDismissals: 0,
    totalEdictsIssued: 0,
    totalArtifactsCollected: 0,
    totalBeastsTamed: 0,
    totalIntriguesSurvived: 0,
    totalAudiencesHeld: 0,
    totalCeremoniesPerformed: 0,
    totalGiftsGiven: 0,
    totalPetitionsResolved: 0,
    daySeed: Date.now() % 100000,
  };
}

function jeCreateInitialDailyTasks(seed: number): JEDailyTaskProgress[] {
  const shuffled = [...JE_DAILY_TASKS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4).map(task => ({
    taskId: task.id,
    progress: 0,
    target: task.target,
    completed: false,
    claimed: false,
  }));
}

function jeCreateDailyAudience(seed: number): JEDailyAudience {
  return {
    id: jeGenerateId(),
    date: Date.now(),
    petitionsHandled: 0,
    petitionsResolved: 0,
    coinsEarned: 0,
    xpEarned: 0,
    events: [],
    completed: false,
  };
}

// ============================================================================
// SECTION 11: MAIN HOOK
// ============================================================================

export default function useJadeEmperor() {
  const [state, setState] = useState<JECourtState>(() => jeCreateInitialCourtState());

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // ---- LEVEL & XP HELPERS (useMemo) ----

  const jeXpToNextLevel = useMemo((): number => {
    if (state.level >= JE_MAX_LEVEL) return 0;
    return jeXpForLevel(state.level + 1) - state.xp;
  }, [state]);

  const jeLevelProgress = useMemo((): number => {
    if (state.level >= JE_MAX_LEVEL) return 100;
    const currentLevelXP = jeXpForLevel(state.level);
    const nextLevelXP = jeXpForLevel(state.level + 1);
    const progress = ((state.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.max(0, Math.min(100, progress));
  }, [state]);

  const jeCurrentTitle = useMemo((): JETitleThreshold => {
    let title = JE_TITLE_THRESHOLDS[0];
    for (const t of JE_TITLE_THRESHOLDS) {
      if (state.level >= t.level) {
        title = t;
      }
    }
    return title;
  }, [state]);

  // ---- EFFECT: Auto-generate daily audience ----

  useEffect(() => {
    if (!stateRef.current.dailyAudience || stateRef.current.dailyAudience.completed) {
      const newAudience = jeCreateDailyAudience(stateRef.current.daySeed);
      setState(prev => ({ ...prev, dailyAudience: newAudience }));
    }
  }, [state]);

  // ---- STATE ACCESSORS ----

  const jeGetState = useCallback((): JECourtState => {
    return stateRef.current;
  }, []);

  const jeResetState = useCallback((): void => {
    setState(jeCreateInitialCourtState());
  }, []);

  const jeGetLevel = useCallback((): number => {
    return stateRef.current.level;
  }, []);

  const jeGetXp = useCallback((): number => {
    return stateRef.current.xp;
  }, []);

  const jeGetCoins = useCallback((): number => {
    return stateRef.current.coins;
  }, []);

  const jeGetReputation = useCallback((): number => {
    return stateRef.current.courtReputation;
  }, []);

  const jeGetTitle = useCallback((): string => {
    let title = JE_TITLE_THRESHOLDS[0].title;
    for (const t of JE_TITLE_THRESHOLDS) {
      if (stateRef.current.level >= t.level) {
        title = t.title;
      }
    }
    return title;
  }, []);

  const jeGetTitleForLevel = useCallback((level: number): JETitleThreshold => {
    let result = JE_TITLE_THRESHOLDS[0];
    for (const t of JE_TITLE_THRESHOLDS) {
      if (level >= t.level) {
        result = t;
      }
    }
    return result;
  }, []);

  // ---- ECONOMY ----

  const jeAddXP = useCallback((amount: number): { leveledUp: boolean; newLevel: number } => {
    let leveledUp = false;
    let newLevel = stateRef.current.level;

    setState(prev => {
      let newXp = prev.xp + amount;
      let lvl = prev.level;
      while (lvl < JE_MAX_LEVEL && newXp >= jeXpForLevel(lvl + 1)) {
        newXp -= (jeXpForLevel(lvl + 1) - jeXpForLevel(lvl));
        lvl++;
        leveledUp = true;
        newLevel = lvl;
      }
      return { ...prev, xp: newXp, level: lvl };
    });

    return { leveledUp, newLevel };
  }, []);

  const jeAddCoins = useCallback((amount: number): number => {
    setState(prev => ({ ...prev, coins: prev.coins + amount }));
    return stateRef.current.coins + amount;
  }, []);

  const jeSpendCoins = useCallback((amount: number): boolean => {
    if (stateRef.current.coins < amount) return false;
    setState(prev => ({ ...prev, coins: prev.coins - amount }));
    return true;
  }, []);

  const jeAddReputation = useCallback((amount: number): void => {
    setState(prev => ({
      ...prev,
      courtReputation: Math.max(0, Math.min(100, prev.courtReputation + amount)),
    }));
  }, []);

  // ---- MINISTER MANAGEMENT ----

  const jeGetMinisters = useCallback((): JEMinisterInstance[] => {
    return stateRef.current.ministers.filter(m => !m.dismissed);
  }, []);

  const jeGetAllMinisters = useCallback((): JEMinisterInstance[] => {
    return stateRef.current.ministers;
  }, []);

  const jeGetMinisterCount = useCallback((): number => {
    return stateRef.current.ministers.filter(m => !m.dismissed).length;
  }, []);

  const jeGetBeingDef = useCallback((beingId: string): JECelestialBeing | null => {
    return JE_CELESTIAL_BEINGS.find(b => b.id === beingId) ?? null;
  }, []);

  const jeGetBeingsByRarity = useCallback((rarity: JERarity): JECelestialBeing[] => {
    return JE_CELESTIAL_BEINGS.filter(b => b.rarity === rarity);
  }, []);

  const jeGetBeingsByDepartment = useCallback((dept: JEDepartment): JECelestialBeing[] => {
    return JE_CELESTIAL_BEINGS.filter(b => b.department === dept);
  }, []);

  const jeAppointMinister = useCallback((beingId: string): JEMinisterInstance | null => {
    const being = JE_CELESTIAL_BEINGS.find(b => b.id === beingId);
    if (!being) return null;
    if (stateRef.current.coins < being.appointCost) return null;

    const activeCount = stateRef.current.ministers.filter(m => !m.dismissed).length;
    if (activeCount >= 12) return null;

    const instance: JEMinisterInstance = {
      id: jeGenerateId(),
      beingId: being.id,
      appointedAt: Date.now(),
      chamberId: null,
      morale: 80 + Math.floor(Math.random() * 20),
      skill: Math.floor(being.wisdom * (0.8 + Math.random() * 0.4)),
      dismissed: false,
    };

    setState(prev => ({
      ...prev,
      coins: prev.coins - being.appointCost,
      ministers: [...prev.ministers, instance],
      totalAppointments: prev.totalAppointments + 1,
    }));

    return instance;
  }, []);

  const jeDismissMinister = useCallback((ministerId: string): boolean => {
    const minister = stateRef.current.ministers.find(m => m.id === ministerId);
    if (!minister || minister.dismissed) return false;

    setState(prev => ({
      ...prev,
      ministers: prev.ministers.map(m =>
        m.id === ministerId ? { ...m, dismissed: true, chamberId: null } : m
      ),
      totalDismissals: prev.totalDismissals + 1,
    }));

    return true;
  }, []);

  const jeAssignChamber = useCallback((ministerId: string, chamberId: string): boolean => {
    const minister = stateRef.current.ministers.find(m => m.id === ministerId);
    if (!minister || minister.dismissed) return false;

    const chamber = JE_COURT_CHAMBERS.find(c => c.id === chamberId);
    if (!chamber) return false;

    if (stateRef.current.level < chamber.unlockLevel) return false;

    const occupants = stateRef.current.ministers.filter(
      m => !m.dismissed && m.chamberId === chamberId
    );
    if (occupants.length >= chamber.capacity) return false;

    setState(prev => ({
      ...prev,
      ministers: prev.ministers.map(m =>
        m.id === ministerId ? { ...m, chamberId } : m
      ),
    }));

    return true;
  }, []);

  const jeRemoveFromChamber = useCallback((ministerId: string): boolean => {
    const minister = stateRef.current.ministers.find(m => m.id === ministerId);
    if (!minister) return false;

    setState(prev => ({
      ...prev,
      ministers: prev.ministers.map(m =>
        m.id === ministerId ? { ...m, chamberId: null } : m
      ),
    }));

    return true;
  }, []);

  const jeBoostMinisterMorale = useCallback((ministerId: string, amount: number): boolean => {
    const minister = stateRef.current.ministers.find(m => m.id === ministerId);
    if (!minister || minister.dismissed) return false;

    setState(prev => ({
      ...prev,
      ministers: prev.ministers.map(m => {
        if (m.id !== ministerId) return m;
        return { ...m, morale: Math.min(100, m.morale + amount) };
      }),
    }));

    return true;
  }, []);

  const jeTrainMinister = useCallback((ministerId: string): boolean => {
    const minister = stateRef.current.ministers.find(m => m.id === ministerId);
    if (!minister || minister.dismissed) return false;
    if (stateRef.current.coins < 30) return false;

    setState(prev => ({
      ...prev,
      coins: prev.coins - 30,
      ministers: prev.ministers.map(m => {
        if (m.id !== ministerId) return m;
        return {
          ...m,
          skill: m.skill + Math.floor(2 + Math.random() * 5),
          morale: Math.max(0, m.morale - 5),
        };
      }),
    }));

    return true;
  }, []);

  const jeGetMinisterDetails = useCallback((ministerId: string): { minister: JEMinisterInstance; being: JECelestialBeing } | null => {
    const minister = stateRef.current.ministers.find(m => m.id === ministerId);
    if (!minister) return null;
    const being = JE_CELESTIAL_BEINGS.find(b => b.id === minister.beingId);
    if (!being) return null;
    return { minister, being };
  }, []);

  const jeGetChamberOccupants = useCallback((chamberId: string): JEMinisterInstance[] => {
    return stateRef.current.ministers.filter(
      m => !m.dismissed && m.chamberId === chamberId
    );
  }, []);

  // ---- COURT CHAMBERS ----

  const jeGetChambers = useCallback((): readonly JECourtChamber[] => {
    return JE_COURT_CHAMBERS;
  }, []);

  const jeGetChamberDef = useCallback((chamberId: string): JECourtChamber | null => {
    return JE_COURT_CHAMBERS.find(c => c.id === chamberId) ?? null;
  }, []);

  const jeIsChamberUnlocked = useCallback((chamberId: string): boolean => {
    const chamber = JE_COURT_CHAMBERS.find(c => c.id === chamberId);
    if (!chamber) return false;
    return stateRef.current.level >= chamber.unlockLevel;
  }, []);

  const jeUnlockChamber = useCallback((chamberId: string): boolean => {
    const chamber = JE_COURT_CHAMBERS.find(c => c.id === chamberId);
    if (!chamber) return false;
    if (stateRef.current.level < chamber.unlockLevel) return false;
    if (stateRef.current.coins < chamber.unlockCost) return false;

    setState(prev => ({ ...prev, coins: prev.coins - chamber.unlockCost }));
    return true;
  }, []);

  const jeSetCurrentChamber = useCallback((chamberId: string): boolean => {
    if (!JE_COURT_CHAMBERS.find(c => c.id === chamberId)) return false;
    setState(prev => ({ ...prev, currentChamber: chamberId }));
    return true;
  }, []);

  const jeGetCurrentChamber = useCallback((): string => {
    return stateRef.current.currentChamber;
  }, []);

  // ---- IMPERIAL EDICTS ----

  const jeGetEdicts = useCallback((): readonly JEImperialEdict[] => {
    return JE_EDICTS;
  }, []);

  const jeGetAvailableEdicts = useCallback((): JEImperialEdict[] => {
    return JE_EDICTS.filter(
      e => stateRef.current.level >= e.requiredLevel && stateRef.current.coins >= e.cost
    );
  }, [state]);

  const jeGetActiveEdicts = useCallback((): JEActiveEdict[] => {
    return stateRef.current.edicts;
  }, []);

  const jeIssueEdict = useCallback((edictId: string): boolean => {
    const edict = JE_EDICTS.find(e => e.id === edictId);
    if (!edict) return false;
    if (stateRef.current.level < edict.requiredLevel) return false;
    if (stateRef.current.coins < edict.cost) return false;

    const active: JEActiveEdict = {
      edictId: edict.id,
      issuedAt: Date.now(),
      remainingDays: edict.duration,
    };

    setState(prev => ({
      ...prev,
      coins: prev.coins - edict.cost,
      edicts: [...prev.edicts, active],
      totalEdictsIssued: prev.totalEdictsIssued + 1,
    }));

    return true;
  }, []);

  const jeRevokeEdict = useCallback((edictId: string): boolean => {
    const active = stateRef.current.edicts.find(e => e.edictId === edictId);
    if (!active) return false;

    setState(prev => ({
      ...prev,
      edicts: prev.edicts.filter(e => e.edictId !== edictId),
    }));

    return true;
  }, []);

  const jeAdvanceEdicts = useCallback((): void => {
    setState(prev => ({
      ...prev,
      edicts: prev.edicts
        .map(e => ({ ...e, remainingDays: e.remainingDays - 1 }))
        .filter(e => e.remainingDays > 0),
    }));
  }, []);

  const jeGetEdictEffects = useCallback((): Record<string, number> => {
    const effects: Record<string, number> = {};
    for (const active of stateRef.current.edicts) {
      const edict = JE_EDICTS.find(e => e.id === active.edictId);
      if (edict) {
        effects[edict.effectType] = (effects[edict.effectType] ?? 0) + edict.effectValue;
      }
    }
    return effects;
  }, [state]);

  // ---- JADE ARTIFACTS ----

  const jeGetArtifacts = useCallback((): readonly JEArtifact[] => {
    return JE_ARTIFACTS;
  }, []);

  const jeGetCollectedArtifacts = useCallback((): JEArtifact[] => {
    return stateRef.current.artifacts
      .map(id => JE_ARTIFACTS.find(a => a.id === id))
      .filter((a): a is JEArtifact => a !== undefined);
  }, []);

  const jeCollectArtifact = useCallback((artifactId: string): boolean => {
    const artifact = JE_ARTIFACTS.find(a => a.id === artifactId);
    if (!artifact) return false;
    if (stateRef.current.artifacts.includes(artifactId)) return false;
    if (stateRef.current.coins < artifact.cost) return false;

    setState(prev => ({
      ...prev,
      coins: prev.coins - artifact.cost,
      artifacts: [...prev.artifacts, artifactId],
      totalArtifactsCollected: prev.totalArtifactsCollected + 1,
      xp: prev.xp + Math.floor(artifact.power * 2),
    }));

    return true;
  }, []);

  const jeAppraiseArtifact = useCallback((artifactId: string): { power: number; appraisal: string } | null => {
    const artifact = JE_ARTIFACTS.find(a => a.id === artifactId);
    if (!artifact) return null;
    if (!stateRef.current.artifacts.includes(artifactId)) return null;
    if (stateRef.current.appraisedArtifacts.includes(artifactId)) {
      return {
        power: artifact.power * jeRarityMultiplier(artifact.rarity),
        appraisal: 'Already appraised.',
      };
    }

    const appraisals: Record<JERarity, string> = {
      'Common': 'A modest piece with some historical value.',
      'Uncommon': 'A fine artifact of notable craftsmanship.',
      'Rare': 'An exquisite treasure sought by many collectors!',
      'Epic': 'A legendary relic of immense celestial power!',
      'Legendary': 'An artifact of mythic proportions — priceless!',
    };

    setState(prev => ({
      ...prev,
      appraisedArtifacts: [...prev.appraisedArtifacts, artifactId],
      xp: prev.xp + Math.floor(artifact.power * 3),
    }));

    return {
      power: Math.floor(artifact.power * jeRarityMultiplier(artifact.rarity)),
      appraisal: appraisals[artifact.rarity],
    };
  }, []);

  const jeGetArtifactsByType = useCallback((type: JEArtifactType): JEArtifact[] => {
    return JE_ARTIFACTS.filter(a => a.type === type);
  }, []);

  const jeGetArtifactsByRarity = useCallback((rarity: JERarity): JEArtifact[] => {
    return JE_ARTIFACTS.filter(a => a.rarity === rarity);
  }, []);

  // ---- HEAVENLY BEASTS ----

  const jeGetBeasts = useCallback((): readonly JEHeavenlyBeast[] => {
    return JE_HEAVENLY_BEASTS;
  }, []);

  const jeGetTamedBeasts = useCallback((): JEHeavenlyBeast[] => {
    return stateRef.current.tamedBeasts
      .map(id => JE_HEAVENLY_BEASTS.find(b => b.id === id))
      .filter((b): b is JEHeavenlyBeast => b !== undefined);
  }, []);

  const jeGetBeastsByType = useCallback((beastType: JEBeastType): JEHeavenlyBeast[] => {
    return JE_HEAVENLY_BEASTS.filter(b => b.beastType === beastType);
  }, []);

  const jeGetBeastsByRarity = useCallback((rarity: JERarity): JEHeavenlyBeast[] => {
    return JE_HEAVENLY_BEASTS.filter(b => b.rarity === rarity);
  }, []);

  const jeTameBeast = useCallback((beastId: string): boolean => {
    const beast = JE_HEAVENLY_BEASTS.find(b => b.id === beastId);
    if (!beast) return false;
    if (stateRef.current.tamedBeasts.includes(beastId)) return false;
    if (stateRef.current.coins < beast.tamingCost) return false;

    setState(prev => ({
      ...prev,
      coins: prev.coins - beast.tamingCost,
      tamedBeasts: [...prev.tamedBeasts, beastId],
      activeBeastId: prev.activeBeastId ?? beastId,
      totalBeastsTamed: prev.totalBeastsTamed + 1,
      xp: prev.xp + Math.floor(beast.power * 3),
    }));

    return true;
  }, []);

  const jeSetActiveBeast = useCallback((beastId: string): boolean => {
    if (!stateRef.current.tamedBeasts.includes(beastId)) return false;
    setState(prev => ({ ...prev, activeBeastId: beastId }));
    return true;
  }, []);

  const jeGetActiveBeast = useCallback((): JEHeavenlyBeast | null => {
    const s = stateRef.current;
    if (!s.activeBeastId) return null;
    return JE_HEAVENLY_BEASTS.find(b => b.id === s.activeBeastId) ?? null;
  }, []);

  const jeRideBeast = useCallback((beastId: string): { success: boolean; coinsEarned: number; xpEarned: number } => {
    const beast = JE_HEAVENLY_BEASTS.find(b => b.id === beastId);
    if (!beast) return { success: false, coinsEarned: 0, xpEarned: 0 };
    if (!stateRef.current.tamedBeasts.includes(beastId)) return { success: false, coinsEarned: 0, xpEarned: 0 };

    const coinsEarned = Math.floor(beast.power * jeRarityCoinBonus(beast.rarity) * 0.1);
    const xpEarned = Math.floor(beast.power * 2);

    setState(prev => ({
      ...prev,
      coins: prev.coins + coinsEarned,
      xp: prev.xp + xpEarned,
    }));

    return { success: true, coinsEarned, xpEarned };
  }, []);

  const jeFeedBeasts = useCallback((): { totalCost: number; loyaltyBoost: number } => {
    const beastCount = stateRef.current.tamedBeasts.length;
    if (beastCount === 0) return { totalCost: 0, loyaltyBoost: 0 };

    const totalCost = beastCount * 15;
    if (stateRef.current.coins < totalCost) return { totalCost: 0, loyaltyBoost: 0 };

    const loyaltyBoost = Math.min(10, beastCount * 2);

    setState(prev => ({
      ...prev,
      coins: prev.coins - totalCost,
      ministers: prev.ministers.map(m => {
        if (m.dismissed) return m;
        return { ...m, morale: Math.min(100, m.morale + loyaltyBoost) };
      }),
    }));

    return { totalCost, loyaltyBoost };
  }, []);

  // ---- COURT INTRIGUE ----

  const jeGetIntrigueEvents = useCallback((): readonly JEIntrigueEvent[] => {
    return JE_INTRIGUE_EVENTS;
  }, []);

  const jeRollIntrigue = useCallback((): JEIntrigueEvent | null => {
    const eligible = JE_INTRIGUE_EVENTS.filter(
      e => stateRef.current.level >= e.minLevel
    );
    if (eligible.length === 0) return null;

    const roll = Math.random();
    let cumulative = 0;
    for (const event of eligible) {
      cumulative += event.probability;
      if (roll < cumulative) return event;
    }
    return null;
  }, [state]);

  const jeResolveIntrigue = useCallback((eventId: string): { survived: boolean; rewardCoins: number; rewardXP: number } => {
    const event = JE_INTRIGUE_EVENTS.find(e => e.id === eventId);
    if (!event) return { survived: false, rewardCoins: 0, rewardXP: 0 };

    const ministerPower = stateRef.current.ministers
      .filter(m => !m.dismissed)
      .reduce((sum, m) => {
        const being = JE_CELESTIAL_BEINGS.find(b => b.id === m.beingId);
        return sum + (being ? being.wisdom + being.influence + m.morale : 0);
      }, 0);

    const beastBonus = stateRef.current.tamedBeasts.reduce((sum, id) => {
      const beast = JE_HEAVENLY_BEASTS.find(b => b.id === id);
      return sum + (beast ? beast.power : 0);
    }, 0);

    const totalPower = ministerPower + beastBonus;
    const threshold = event.minLevel * 50;
    const survived = totalPower > threshold;

    const rewardCoins = survived ? Math.floor(event.minLevel * 30 + Math.random() * 100) : 0;
    const rewardXP = survived ? Math.floor(event.minLevel * 20) : 0;

    setState(prev => {
      const newMinisters = survived
        ? prev.ministers
        : prev.ministers.map(m => ({
            ...m,
            morale: Math.max(0, m.morale + Math.floor(event.effectValue * 0.5)),
          }));

      return {
        ...prev,
        ministers: newMinisters,
        coins: prev.coins + rewardCoins,
        xp: prev.xp + rewardXP,
        totalIntriguesSurvived: prev.totalIntriguesSurvived + (survived ? 1 : 0),
        courtReputation: survived
          ? Math.min(100, prev.courtReputation + 2)
          : Math.max(0, prev.courtReputation - 3),
      };
    });

    return { survived, rewardCoins, rewardXP };
  }, []);

  // ---- DAILY COURT AUDIENCE ----

  const jeHoldCourt = useCallback((): { petitionsHandled: number; coinsEarned: number; xpEarned: number; events: string[] } => {
    const ministerCount = stateRef.current.ministers.filter(m => !m.dismissed).length;
    const beastCount = stateRef.current.tamedBeasts.length;
    const basePetitions = 3 + Math.floor(ministerCount / 2) + Math.floor(beastCount / 3);
    const petitionsHandled = Math.min(basePetitions, 10);

    const coinsPerPetition = 20 + stateRef.current.level * 5;
    const coinsEarned = petitionsHandled * coinsPerPetition;
    const xpEarned = petitionsHandled * (15 + stateRef.current.level * 3);

    const events: string[] = [];

    if (ministerCount >= 3) {
      events.push('✅ Ministers collaborated on a complex petition successfully.');
    }
    if (beastCount >= 1) {
      events.push('🐲 A heavenly beast inspired awe during the audience.');
    }
    if (stateRef.current.activeBeastId) {
      events.push('🐉 Your active beast commanded respect from petitioners.');
    }
    if (stateRef.current.edicts.length >= 2) {
      events.push('📜 Multiple active edicts increased petitioner satisfaction.');
    }
    if (ministerCount === 0) {
      events.push('⚠️ No ministers attended the audience — inefficiency noted.');
    }

    setState(prev => ({
      ...prev,
      coins: prev.coins + coinsEarned,
      xp: prev.xp + xpEarned,
      totalAudiencesHeld: prev.totalAudiencesHeld + 1,
      courtReputation: Math.min(100, prev.courtReputation + 1),
      dailyAudience: {
        id: prev.dailyAudience?.id ?? jeGenerateId(),
        date: Date.now(),
        petitionsHandled,
        petitionsResolved: petitionsHandled,
        coinsEarned,
        xpEarned,
        events,
        completed: true,
      },
    }));

    return { petitionsHandled, coinsEarned, xpEarned, events };
  }, []);

  const jeGetDailyAudience = useCallback((): JEDailyAudience | null => {
    return stateRef.current.dailyAudience;
  }, []);

  const jeHandlePetition = useCallback((): { success: boolean; reward: number; message: string } => {
    const ministerCount = stateRef.current.ministers.filter(m => !m.dismissed).length;
    if (ministerCount === 0) {
      return { success: false, reward: 0, message: 'No ministers available to handle petitions!' };
    }

    const avgMorale = stateRef.current.ministers
      .filter(m => !m.dismissed)
      .reduce((sum, m) => sum + m.morale, 0) / ministerCount;

    const success = avgMorale > 40 && Math.random() < 0.7 + (avgMorale / 100) * 0.3;
    const reward = success
      ? Math.floor(30 + stateRef.current.level * 8 + Math.random() * 50)
      : 0;
    const message = success
      ? 'Petition resolved successfully! The people are pleased.'
      : 'The petition could not be resolved. Minister morale may be low.';

    if (success) {
      setState(prev => ({ ...prev, coins: prev.coins + reward, xp: prev.xp + 20 }));
    }

    return { success, reward, message };
  }, [state]);

  // ---- ACHIEVEMENTS ----

  const jeGetAchievements = useCallback((): readonly JEAchievement[] => {
    return JE_ACHIEVEMENTS;
  }, []);

  const jeGetUnlockedAchievements = useCallback((): JEAchievement[] => {
    return JE_ACHIEVEMENTS.filter(a => stateRef.current.achievements.includes(a.id));
  }, []);

  const jeGetLockedAchievements = useCallback((): JEAchievement[] => {
    return JE_ACHIEVEMENTS.filter(a => !stateRef.current.achievements.includes(a.id));
  }, []);

  const jeCheckAchievements = useCallback((): JEAchievement[] => {
    const s = stateRef.current;
    const newAch: JEAchievement[] = [];

    const conditions: Record<string, boolean> = {
      'totalAppointments >= 1': s.totalAppointments >= 1,
      'ministers >= 5': s.ministers.filter(m => !m.dismissed).length >= 5,
      'totalEdictsIssued >= 1': s.totalEdictsIssued >= 1,
      'artifacts >= 10': s.artifacts.length >= 10,
      'beasts >= 5': s.tamedBeasts.length >= 5,
      'allMinistersLoyal': s.ministers.filter(m => !m.dismissed).length > 0 &&
        s.ministers.filter(m => !m.dismissed).every(m => m.morale >= 80),
      'totalAudiencesHeld >= 1': s.totalAudiencesHeld >= 1,
      'totalAudiencesHeld >= 10': s.totalAudiencesHeld >= 10,
      'allChambersUnlocked': JE_COURT_CHAMBERS.every(c => s.level >= c.unlockLevel),
      'coins >= 10000': s.coins >= 10000,
      'hasLegendaryMinister': s.ministers.some(m => {
        if (m.dismissed) return false;
        const being = JE_CELESTIAL_BEINGS.find(b => b.id === m.beingId);
        return being?.rarity === 'Legendary';
      }),
      'allDepartments': (() => {
        const depts = new Set<JEDepartment>();
        for (const m of s.ministers) {
          if (m.dismissed) continue;
          const being = JE_CELESTIAL_BEINGS.find(b => b.id === m.beingId);
          if (being) depts.add(being.department);
        }
        return depts.size >= 8;
      })(),
      'intrigues >= 10': s.totalIntriguesSurvived >= 10,
      'level >= 50': s.level >= JE_MAX_LEVEL,
      'beastTypes >= 5': (() => {
        const types = new Set(s.tamedBeasts.map(id => JE_HEAVENLY_BEASTS.find(b => b.id === id)?.beastType).filter(Boolean));
        return types.size >= 5;
      })(),
      'appraised >= 15': s.appraisedArtifacts.length >= 15,
      'edicts >= 50': s.totalEdictsIssued >= 50,
      'reputation >= 100': s.courtReputation >= 100,
    };

    for (const ach of JE_ACHIEVEMENTS) {
      if (!s.achievements.includes(ach.id) && conditions[ach.condition]) {
        newAch.push(ach);
        setState(prev => ({
          ...prev,
          achievements: [...prev.achievements, ach.id],
          xp: prev.xp + ach.rewardXP,
          coins: prev.coins + ach.rewardCoins,
        }));
      }
    }

    return newAch;
  }, [state]);

  // ---- SUMMARY & INFO ----

  const jeGetSummary = useCallback((): {
    level: number;
    title: string;
    coins: number;
    reputation: number;
    ministerCount: number;
    artifactCount: number;
    beastCount: number;
    activeEdicts: number;
    achievements: number;
    audiencesHeld: number;
  } => {
    const s = stateRef.current;
    let title = JE_TITLE_THRESHOLDS[0].title;
    for (const t of JE_TITLE_THRESHOLDS) {
      if (s.level >= t.level) title = t.title;
    }
    return {
      level: s.level,
      title,
      coins: s.coins,
      reputation: s.courtReputation,
      ministerCount: s.ministers.filter(m => !m.dismissed).length,
      artifactCount: s.artifacts.length,
      beastCount: s.tamedBeasts.length,
      activeEdicts: s.edicts.length,
      achievements: s.achievements.length,
      audiencesHeld: s.totalAudiencesHeld,
    };
  }, [state]);

  const jeGetCourtPower = useCallback((): number => {
    let power = 0;
    for (const m of stateRef.current.ministers) {
      if (m.dismissed) continue;
      const being = JE_CELESTIAL_BEINGS.find(b => b.id === m.beingId);
      if (being) {
        power += being.wisdom + being.influence + being.combat + m.morale + m.skill;
      }
    }
    for (const id of stateRef.current.tamedBeasts) {
      const beast = JE_HEAVENLY_BEASTS.find(b => b.id === id);
      if (beast) power += beast.power;
    }
    for (const id of stateRef.current.artifacts) {
      const art = JE_ARTIFACTS.find(a => a.id === id);
      if (art) power += Math.floor(art.power * 0.5);
    }
    return power;
  }, [state]);

  const jeGetDepartmentSummary = useCallback((): Record<JEDepartment, { count: number; avgMorale: number; totalSkill: number }> => {
    const summary: Record<JEDepartment, { count: number; avgMorale: number; totalSkill: number }> = {
      treasury: { count: 0, avgMorale: 0, totalSkill: 0 },
      war: { count: 0, avgMorale: 0, totalSkill: 0 },
      justice: { count: 0, avgMorale: 0, totalSkill: 0 },
      rites: { count: 0, avgMorale: 0, totalSkill: 0 },
      works: { count: 0, avgMorale: 0, totalSkill: 0 },
      personnel: { count: 0, avgMorale: 0, totalSkill: 0 },
      astronomy: { count: 0, avgMorale: 0, totalSkill: 0 },
      medicine: { count: 0, avgMorale: 0, totalSkill: 0 },
    };

    for (const m of stateRef.current.ministers) {
      if (m.dismissed) continue;
      const being = JE_CELESTIAL_BEINGS.find(b => b.id === m.beingId);
      if (being) {
        const dept = summary[being.department];
        dept.count += 1;
        dept.avgMorale += m.morale;
        dept.totalSkill += m.skill;
      }
    }

    for (const dept of Object.values(summary)) {
      if (dept.count > 0) {
        dept.avgMorale = Math.floor(dept.avgMorale / dept.count);
      }
    }

    return summary;
  }, [state]);

  const jeGetLevelUpRewards = useCallback((level: number): { coins: number; unlockDescription: string } => {
    const isMilestone = level % 5 === 0;
    if (isMilestone) {
      return {
        coins: level * 50,
        unlockDescription: level >= JE_MAX_LEVEL
          ? 'Maximum level reached! You have ascended to Jade Emperor!'
          : `Level ${level} milestone! New chambers, beings, and edicts unlocked.`,
      };
    }
    return { coins: level * 10, unlockDescription: `You reached level ${level}! Continue governing wisely.` };
  }, []);

  const jeGetSalaryBreakdown = useCallback((): { totalSalary: number; ministers: { name: string; salary: number }[] } => {
    const ministers: { name: string; salary: number }[] = [];
    let totalSalary = 0;

    for (const m of stateRef.current.ministers) {
      if (m.dismissed) continue;
      const being = JE_CELESTIAL_BEINGS.find(b => b.id === m.beingId);
      if (being) {
        totalSalary += being.salary;
        ministers.push({ name: being.name, salary: being.salary });
      }
    }

    return { totalSalary, ministers };
  }, [state]);

  const jePaySalaries = useCallback((): boolean => {
    const breakdown = jeGetSalaryBreakdown();
    if (stateRef.current.coins < breakdown.totalSalary) return false;

    setState(prev => ({
      ...prev,
      coins: prev.coins - breakdown.totalSalary,
      ministers: prev.ministers.map(m => {
        if (m.dismissed) return m;
        return { ...m, morale: Math.min(100, m.morale + 5) };
      }),
    }));

    return true;
  }, [jeGetSalaryBreakdown]);

  const jeGetAvailableBeings = useCallback((): JECelestialBeing[] => {
    const appointedIds = new Set(stateRef.current.ministers.map(m => m.beingId));
    return JE_CELESTIAL_BEINGS.filter(
      b => !appointedIds.has(b.id) && stateRef.current.coins >= b.appointCost
    );
  }, [state]);

  const jeGetPetitionCount = useCallback((): number => {
    const ministerCount = stateRef.current.ministers.filter(m => !m.dismissed).length;
    const beastCount = stateRef.current.tamedBeasts.length;
    return Math.min(3 + Math.floor(ministerCount / 2) + Math.floor(beastCount / 3), 10);
  }, [state]);

  // ---- DAILY TASKS ----

  const jeGetDailyTasks = useCallback((): JEDailyTaskProgress[] => {
    return stateRef.current.dailyTasks;
  }, []);

  const jeGetDailyTaskDef = useCallback((taskId: string): JEDailyTask | null => {
    return JE_DAILY_TASKS.find(t => t.id === taskId) ?? null;
  }, []);

  const jeUpdateDailyTaskProgress = useCallback((taskId: string, increment: number): boolean => {
    setState(prev => ({
      ...prev,
      dailyTasks: prev.dailyTasks.map(t => {
        if (t.taskId !== taskId || t.completed) return t;
        const newProgress = Math.min(t.target, t.progress + increment);
        return { ...t, progress: newProgress, completed: newProgress >= t.target };
      }),
    }));
    return true;
  }, []);

  const jeClaimDailyTaskReward = useCallback((taskId: string): { xpGained: number; coinsGained: number } => {
    const task = stateRef.current.dailyTasks.find(t => t.taskId === taskId);
    if (!task || !task.completed || task.claimed) {
      return { xpGained: 0, coinsGained: 0 };
    }

    const def = JE_DAILY_TASKS.find(d => d.id === taskId);
    if (!def) return { xpGained: 0, coinsGained: 0 };

    setState(prev => ({
      ...prev,
      xp: prev.xp + def.xpReward,
      coins: prev.coins + def.coinReward,
      dailyTasks: prev.dailyTasks.map(t =>
        t.taskId === taskId ? { ...t, claimed: true } : t
      ),
    }));

    return { xpGained: def.xpReward, coinsGained: def.coinReward };
  }, []);

  const jeRefreshDailyTasks = useCallback((): void => {
    setState(prev => ({
      ...prev,
      dailyTasks: jeCreateInitialDailyTasks(Date.now() % 100000),
    }));
  }, []);

  const jeGetCompletedDailyTasks = useCallback((): JEDailyTaskProgress[] => {
    return stateRef.current.dailyTasks.filter(t => t.completed);
  }, []);

  const jeGetClaimableDailyTasks = useCallback((): JEDailyTaskProgress[] => {
    return stateRef.current.dailyTasks.filter(t => t.completed && !t.claimed);
  }, []);

  // ---- CEREMONIES ----

  const jeGetCeremonies = useCallback((): readonly JECeremony[] => {
    return JE_CEREMONIES;
  }, []);

  const jeGetActiveCeremonies = useCallback((): JECeremonyState[] => {
    return stateRef.current.activeCeremonies;
  }, []);

  const jeGetCeremonyEffects = useCallback((): Record<string, number> => {
    const effects: Record<string, number> = {};
    for (const ac of stateRef.current.activeCeremonies) {
      const ceremony = JE_CEREMONIES.find(c => c.id === ac.ceremonyId);
      if (ceremony) {
        effects[ceremony.effectType] = (effects[ceremony.effectType] ?? 0) + ceremony.effectValue;
      }
    }
    return effects;
  }, [state]);

  const jePerformCeremony = useCallback((ceremonyId: string): { success: boolean; reason?: string } => {
    const ceremony = JE_CEREMONIES.find(c => c.id === ceremonyId);
    if (!ceremony) return { success: false, reason: 'Ceremony not found.' };

    if (stateRef.current.level < ceremony.requiredLevel) {
      return { success: false, reason: 'Court level too low for this ceremony.' };
    }

    if (stateRef.current.coins < ceremony.cost) {
      return { success: false, reason: 'Not enough celestial coins.' };
    }

    const activeMinisters = stateRef.current.ministers.filter(m => !m.dismissed).length;
    if (activeMinisters < ceremony.requiredMinisters) {
      return { success: false, reason: `Requires ${ceremony.requiredMinisters} ministers, only ${activeMinisters} available.` };
    }

    const newCeremonyState: JECeremonyState = {
      ceremonyId: ceremony.id,
      performedAt: Date.now(),
      remainingDays: ceremony.durationDays,
    };

    setState(prev => ({
      ...prev,
      coins: prev.coins - ceremony.cost,
      activeCeremonies: [...prev.activeCeremonies, newCeremonyState],
      totalCeremoniesPerformed: prev.totalCeremoniesPerformed + 1,
      xp: prev.xp + Math.floor(ceremony.effectValue * 5),
      courtReputation: Math.min(100, prev.courtReputation + Math.floor(ceremony.effectValue / 2)),
    }));

    return { success: true };
  }, []);

  const jeAdvanceCeremonies = useCallback((): void => {
    setState(prev => ({
      ...prev,
      activeCeremonies: prev.activeCeremonies
        .map(c => ({ ...c, remainingDays: c.remainingDays - 1 }))
        .filter(c => c.remainingDays > 0),
    }));
  }, []);

  // ---- CELESTIAL GIFTS ----

  const jeGetGifts = useCallback((): readonly JECelestialGift[] => {
    return JE_CELESTIAL_GIFTS;
  }, []);

  const jeGetGiftsByTarget = useCallback((targetType: 'minister' | 'beast' | 'self'): JECelestialGift[] => {
    return JE_CELESTIAL_GIFTS.filter(g => g.targetType === targetType);
  }, []);

  const jeGiveGiftToMinister = useCallback((ministerId: string, giftId: string): { success: boolean; reason?: string } => {
    const gift = JE_CELESTIAL_GIFTS.find(g => g.id === giftId);
    if (!gift) return { success: false, reason: 'Gift not found.' };
    if (gift.targetType !== 'minister') return { success: false, reason: 'This gift is not for ministers.' };
    if (stateRef.current.coins < gift.cost) return { success: false, reason: 'Not enough coins.' };

    const minister = stateRef.current.ministers.find(m => m.id === ministerId);
    if (!minister || minister.dismissed) return { success: false, reason: 'Minister not found.' };

    setState(prev => ({
      ...prev,
      coins: prev.coins - gift.cost,
      ministers: prev.ministers.map(m => {
        if (m.id !== ministerId) return m;
        const updated = { ...m };
        if (gift.effectType === 'morale') {
          updated.morale = Math.min(100, m.morale + gift.effectValue);
        } else if (gift.effectType === 'influence') {
          updated.skill = m.skill + gift.effectValue;
        } else if (gift.effectType === 'wisdom') {
          updated.skill = m.skill + gift.effectValue;
        } else if (gift.effectType === 'skill') {
          updated.skill = m.skill + gift.effectValue;
        }
        return updated;
      }),
      totalGiftsGiven: prev.totalGiftsGiven + 1,
    }));

    return { success: true };
  }, []);

  const jeGiveGiftToBeast = useCallback((beastId: string, giftId: string): { success: boolean; reason?: string } => {
    const gift = JE_CELESTIAL_GIFTS.find(g => g.id === giftId);
    if (!gift) return { success: false, reason: 'Gift not found.' };
    if (gift.targetType !== 'beast') return { success: false, reason: 'This gift is not for beasts.' };
    if (stateRef.current.coins < gift.cost) return { success: false, reason: 'Not enough coins.' };
    if (!stateRef.current.tamedBeasts.includes(beastId)) {
      return { success: false, reason: 'Beast not tamed.' };
    }

    setState(prev => ({
      ...prev,
      coins: prev.coins - gift.cost,
      totalGiftsGiven: prev.totalGiftsGiven + 1,
      xp: prev.xp + 30,
    }));

    return { success: true };
  }, []);

  const jeGiveGiftToSelf = useCallback((giftId: string): { success: boolean; reason?: string } => {
    const gift = JE_CELESTIAL_GIFTS.find(g => g.id === giftId);
    if (!gift) return { success: false, reason: 'Gift not found.' };
    if (gift.targetType !== 'self') return { success: false, reason: 'This gift is not a self-use item.' };
    if (stateRef.current.coins < gift.cost) return { success: false, reason: 'Not enough coins.' };

    setState(prev => {
      const updated = { ...prev, coins: prev.coins - gift.cost, totalGiftsGiven: prev.totalGiftsGiven + 1 };
      if (gift.effectType === 'morale') {
        updated.ministers = prev.ministers.map(m => {
          if (m.dismissed) return m;
          return { ...m, morale: Math.min(100, m.morale + gift.effectValue) };
        });
      } else if (gift.effectType === 'wisdom') {
        updated.ministers = prev.ministers.map(m => {
          if (m.dismissed) return m;
          return { ...m, skill: m.skill + Math.floor(gift.effectValue * 0.5) };
        });
      }
      return updated;
    });

    return { success: true };
  }, []);

  // ---- STATISTICS ----

  const jeGetStats = useCallback((): {
    totalAppointments: number;
    totalDismissals: number;
    totalEdictsIssued: number;
    totalArtifactsCollected: number;
    totalBeastsTamed: number;
    totalIntriguesSurvived: number;
    totalAudiencesHeld: number;
    totalCeremoniesPerformed: number;
    totalGiftsGiven: number;
    totalPetitionsResolved: number;
  } => {
    const s = stateRef.current;
    return {
      totalAppointments: s.totalAppointments,
      totalDismissals: s.totalDismissals,
      totalEdictsIssued: s.totalEdictsIssued,
      totalArtifactsCollected: s.totalArtifactsCollected,
      totalBeastsTamed: s.totalBeastsTamed,
      totalIntriguesSurvived: s.totalIntriguesSurvived,
      totalAudiencesHeld: s.totalAudiencesHeld,
      totalCeremoniesPerformed: s.totalCeremoniesPerformed,
      totalGiftsGiven: s.totalGiftsGiven,
      totalPetitionsResolved: s.totalPetitionsResolved,
    };
  }, [state]);

  // ---- END OF DAY ----

  const jeAdvanceDay = useCallback((): { coinsEarned: number; events: string[] } => {
    const events: string[] = [];
    let coinsEarned = 0;

    // Daily income from chambers
    const occupiedChambers = new Set(
      stateRef.current.ministers
        .filter(m => !m.dismissed && m.chamberId)
        .map(m => m.chamberId)
    );

    for (const chamberId of Array.from(occupiedChambers)) {
      const chamber = JE_COURT_CHAMBERS.find(c => c.id === chamberId);
      if (chamber && chamber.bonusType === 'coins') {
        const earned = chamber.bonusValue;
        coinsEarned += earned;
      }
    }

    if (coinsEarned > 0) {
      events.push(`💰 Earned ${coinsEarned} coins from chamber bonuses.`);
    }

    // Natural reputation decay
    const reputationDecay = stateRef.current.ministers.length > 0 ? -1 : -2;

    // Minister morale decay
    events.push('📉 Some ministers\' morale slightly declined.');

    setState(prev => ({
      ...prev,
      coins: prev.coins + coinsEarned,
      courtReputation: Math.max(0, Math.min(100, prev.courtReputation + reputationDecay)),
      ministers: prev.ministers.map(m => {
        if (m.dismissed) return m;
        return { ...m, morale: Math.max(0, m.morale - 2) };
      }),
      daySeed: prev.daySeed + 1,
    }));

    return { coinsEarned, events };
  }, [state]);

  // ---- RETURN ----

  return {
    // Computed state
    jeXpToNextLevel,
    jeLevelProgress,
    jeCurrentTitle,
    // State access
    jeGetState,
    jeResetState,
    jeGetLevel,
    jeGetXp,
    jeGetCoins,
    jeGetReputation,
    jeGetTitle,
    jeGetTitleForLevel,
    // Economy
    jeAddXP,
    jeAddCoins,
    jeSpendCoins,
    jeAddReputation,
    // Minister management
    jeGetMinisters,
    jeGetAllMinisters,
    jeGetMinisterCount,
    jeGetBeingDef,
    jeGetBeingsByRarity,
    jeGetBeingsByDepartment,
    jeAppointMinister,
    jeDismissMinister,
    jeAssignChamber,
    jeRemoveFromChamber,
    jeBoostMinisterMorale,
    jeTrainMinister,
    jeGetMinisterDetails,
    jeGetChamberOccupants,
    jeGetAvailableBeings,
    // Court chambers
    jeGetChambers,
    jeGetChamberDef,
    jeIsChamberUnlocked,
    jeUnlockChamber,
    jeSetCurrentChamber,
    jeGetCurrentChamber,
    // Imperial edicts
    jeGetEdicts,
    jeGetAvailableEdicts,
    jeGetActiveEdicts,
    jeIssueEdict,
    jeRevokeEdict,
    jeAdvanceEdicts,
    jeGetEdictEffects,
    // Jade artifacts
    jeGetArtifacts,
    jeGetCollectedArtifacts,
    jeCollectArtifact,
    jeAppraiseArtifact,
    jeGetArtifactsByType,
    jeGetArtifactsByRarity,
    // Heavenly beasts
    jeGetBeasts,
    jeGetTamedBeasts,
    jeGetBeastsByType,
    jeGetBeastsByRarity,
    jeTameBeast,
    jeSetActiveBeast,
    jeGetActiveBeast,
    jeRideBeast,
    jeFeedBeasts,
    // Court intrigue
    jeGetIntrigueEvents,
    jeRollIntrigue,
    jeResolveIntrigue,
    // Daily audience
    jeHoldCourt,
    jeGetDailyAudience,
    jeHandlePetition,
    jeGetPetitionCount,
    // Achievements
    jeGetAchievements,
    jeGetUnlockedAchievements,
    jeGetLockedAchievements,
    jeCheckAchievements,
    // Summary & info
    jeGetSummary,
    jeGetCourtPower,
    jeGetDepartmentSummary,
    jeGetLevelUpRewards,
    jeGetSalaryBreakdown,
    jePaySalaries,
    // Daily tasks
    jeGetDailyTasks,
    jeGetDailyTaskDef,
    jeUpdateDailyTaskProgress,
    jeClaimDailyTaskReward,
    jeRefreshDailyTasks,
    jeGetCompletedDailyTasks,
    jeGetClaimableDailyTasks,
    // Ceremonies
    jeGetCeremonies,
    jeGetActiveCeremonies,
    jeGetCeremonyEffects,
    jePerformCeremony,
    jeAdvanceCeremonies,
    // Celestial gifts
    jeGetGifts,
    jeGetGiftsByTarget,
    jeGiveGiftToMinister,
    jeGiveGiftToBeast,
    jeGiveGiftToSelf,
    // Statistics
    jeGetStats,
    // End of day
    jeAdvanceDay,
  };
}
