// ============================================================================
// Dinosaur Park Wire — SSR-safe dinosaur park management module for Word Snake
// All exported functions prefixed with `dp`. All exported constants prefixed
// with `DP_`. Hook-based export via `useDinosaurPark`. Uses mulberry32 seeded
// PRNG (no Math.random). No browser APIs (localStorage, window, document,
// setInterval, addEventListener). useState + useCallback only.
// ============================================================================

import { useState, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Seeded PRNG
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function dpAdvanceSeed(seed: number, steps: number): number {
  return seed + steps * 0x6D2B79F5;
}

// ---------------------------------------------------------------------------
// Rarity Tiers (must be declared before anything that references them)
// ---------------------------------------------------------------------------

export const DP_RARITY_COMMON = 0;
export const DP_RARITY_UNCOMMON = 1;
export const DP_RARITY_RARE = 2;
export const DP_RARITY_EPIC = 3;
export const DP_RARITY_LEGENDARY = 4;

export const DP_RARITY_LABELS: Record<number, string> = {
  [DP_RARITY_COMMON]: 'Common',
  [DP_RARITY_UNCOMMON]: 'Uncommon',
  [DP_RARITY_RARE]: 'Rare',
  [DP_RARITY_EPIC]: 'Epic',
  [DP_RARITY_LEGENDARY]: 'Legendary',
};

export const DP_RARITY_COLORS: Record<number, string> = {
  [DP_RARITY_COMMON]: '#8B9A6B',
  [DP_RARITY_UNCOMMON]: '#4A9E4A',
  [DP_RARITY_RARE]: '#3A7BD5',
  [DP_RARITY_EPIC]: '#9B59B6',
  [DP_RARITY_LEGENDARY]: '#F39C12',
};

export const DP_RARITY_HATCH_CHANCE: Record<number, number> = {
  [DP_RARITY_COMMON]: 0.90,
  [DP_RARITY_UNCOMMON]: 0.75,
  [DP_RARITY_RARE]: 0.55,
  [DP_RARITY_EPIC]: 0.35,
  [DP_RARITY_LEGENDARY]: 0.15,
};

export const DP_RARITY_SELL_MULTIPLIER: Record<number, number> = {
  [DP_RARITY_COMMON]: 1.0,
  [DP_RARITY_UNCOMMON]: 1.5,
  [DP_RARITY_RARE]: 2.5,
  [DP_RARITY_EPIC]: 4.0,
  [DP_RARITY_LEGENDARY]: 7.0,
};

// ---------------------------------------------------------------------------
// Diet Types (must be declared before species data)
// ---------------------------------------------------------------------------

export const DP_DIET_CARNIVORE = 'carnivore';
export const DP_DIET_HERBIVORE = 'herbivore';
export const DP_DIET_PISCIVORE = 'piscivore';
export const DP_DIET_INSECTIVORE = 'insectivore';
export const DP_DIET_OMNIVORE = 'omnivore';

// ---------------------------------------------------------------------------
// Food Types (references diet constants conceptually but no direct dep)
// ---------------------------------------------------------------------------

export const DP_FOOD_MEAT = 'carnivore_meat';
export const DP_FOOD_GREENS = 'herbivore_greens';
export const DP_FOOD_FISH = 'fish';
export const DP_FOOD_INSECTS = 'insects';
export const DP_FOOD_FRUITS = 'fruits';
export const DP_FOOD_SYNTHETIC = 'synthetic_feed';

export const DP_FOOD_IDS: string[] = [
  DP_FOOD_MEAT, DP_FOOD_GREENS, DP_FOOD_FISH, DP_FOOD_INSECTS, DP_FOOD_FRUITS, DP_FOOD_SYNTHETIC,
];

export const DP_FOOD_DATA: Record<string, { name: string; cost: number; hungerRestore: number; compatibleDiets: string[] }> = {
  [DP_FOOD_MEAT]: { name: 'Carnivore Meat', cost: 10, hungerRestore: 30, compatibleDiets: [DP_DIET_CARNIVORE, DP_DIET_OMNIVORE] },
  [DP_FOOD_GREENS]: { name: 'Herbivore Greens', cost: 5, hungerRestore: 25, compatibleDiets: [DP_DIET_HERBIVORE, DP_DIET_OMNIVORE] },
  [DP_FOOD_FISH]: { name: 'Fish', cost: 8, hungerRestore: 20, compatibleDiets: [DP_DIET_PISCIVORE, DP_DIET_CARNIVORE, DP_DIET_OMNIVORE] },
  [DP_FOOD_INSECTS]: { name: 'Insects', cost: 4, hungerRestore: 15, compatibleDiets: [DP_DIET_INSECTIVORE, DP_DIET_OMNIVORE] },
  [DP_FOOD_FRUITS]: { name: 'Fruits', cost: 6, hungerRestore: 20, compatibleDiets: [DP_DIET_OMNIVORE, DP_DIET_HERBIVORE] },
  [DP_FOOD_SYNTHETIC]: { name: 'Synthetic Feed', cost: 15, hungerRestore: 40, compatibleDiets: [DP_DIET_CARNIVORE, DP_DIET_HERBIVORE, DP_DIET_PISCIVORE, DP_DIET_INSECTIVORE, DP_DIET_OMNIVORE] },
};

// ---------------------------------------------------------------------------
// Enclosure Zones
// ---------------------------------------------------------------------------

export const DP_ZONE_JUNGLE = 'jungle_paddock';
export const DP_ZONE_DESERT = 'desert_arena';
export const DP_ZONE_WATER = 'water_lagoon';
export const DP_ZONE_ARCTIC = 'arctic_pen';
export const DP_ZONE_VOLCANIC = 'volcanic_pit';
export const DP_ZONE_SKY = 'sky_aviary';
export const DP_ZONE_SWAMP = 'swamp_marsh';
export const DP_ZONE_PRIMORDIAL = 'primordial_forest';

export const DP_ZONE_IDS: string[] = [
  DP_ZONE_JUNGLE, DP_ZONE_DESERT, DP_ZONE_WATER, DP_ZONE_ARCTIC,
  DP_ZONE_VOLCANIC, DP_ZONE_SKY, DP_ZONE_SWAMP, DP_ZONE_PRIMORDIAL,
];

export const DP_ZONE_DATA: Record<string, { name: string; capacity: number; unlockLevel: number; maintenanceCost: number }> = {
  [DP_ZONE_JUNGLE]: { name: 'Jungle Paddock', capacity: 6, unlockLevel: 1, maintenanceCost: 50 },
  [DP_ZONE_DESERT]: { name: 'Desert Arena', capacity: 5, unlockLevel: 3, maintenanceCost: 60 },
  [DP_ZONE_WATER]: { name: 'Water Lagoon', capacity: 4, unlockLevel: 5, maintenanceCost: 70 },
  [DP_ZONE_ARCTIC]: { name: 'Arctic Pen', capacity: 4, unlockLevel: 8, maintenanceCost: 80 },
  [DP_ZONE_VOLCANIC]: { name: 'Volcanic Pit', capacity: 5, unlockLevel: 12, maintenanceCost: 90 },
  [DP_ZONE_SKY]: { name: 'Sky Aviary', capacity: 6, unlockLevel: 15, maintenanceCost: 75 },
  [DP_ZONE_SWAMP]: { name: 'Swamp Marsh', capacity: 5, unlockLevel: 10, maintenanceCost: 65 },
  [DP_ZONE_PRIMORDIAL]: { name: 'Primordial Forest', capacity: 8, unlockLevel: 20, maintenanceCost: 100 },
};

// ---------------------------------------------------------------------------
// Species IDs (33 species — must come after rarity & diet constants)
// ---------------------------------------------------------------------------

export const DP_SPECIES_TREX = 'trex';
export const DP_SPECIES_RAPTOR = 'velociraptor';
export const DP_SPECIES_TRICERATOPS = 'triceratops';
export const DP_SPECIES_STEGOSAURUS = 'stegosaurus';
export const DP_SPECIES_BRACHIOSAURUS = 'brachiosaurus';
export const DP_SPECIES_PTERODACTYL = 'pterodactyl';
export const DP_SPECIES_SPINOSAURUS = 'spinosaurus';
export const DP_SPECIES_ANKYLOSAURUS = 'ankylosaurus';
export const DP_SPECIES_PARASAUROLOPHUS = 'parasaurolophus';
export const DP_SPECIES_DILOPHOSAURUS = 'dilophosaurus';
export const DP_SPECIES_COMPSONAGNATHUS = 'compsognathus';
export const DP_SPECIES_GALLIMIMUS = 'gallimimus';
export const DP_SPECIES_ALLOSAURUS = 'allosaurus';
export const DP_SPECIES_PACHYCEPHALOSAURUS = 'pachycephalosaurus';
export const DP_SPECIES_STYRACOSAURUS = 'styracosaurus';
export const DP_SPECIES_MOSASAURUS = 'mosasaurus';
export const DP_SPECIES_DIMORPHODON = 'dimorphodon';
export const DP_SPECIES_ARCHAEOPTERYX = 'archaeopteryx';
export const DP_SPECIES_CARNOTAURUS = 'carnotaurus';
export const DP_SPECIES_DIPLODOCUS = 'diplodocus';
export const DP_SPECIES_KENTROSAURUS = 'kentrosaurus';
export const DP_SPECIES_BARYONYX = 'baryonyx';
export const DP_SPECIES_MICROCERATUS = 'microceratus';
export const DP_SPECIES_PLESIOSAURUS = 'plesiosaurus';
export const DP_SPECIES_DEINONYCHUS = 'deinonychus';
export const DP_SPECIES_EDMONTOSAURUS = 'edmontosaurus';
export const DP_SPECIES_IGUANODON = 'iguanodon';
export const DP_SPECIES_MAIASAURA = 'maiasaura';
export const DP_SPECIES_THERIZINOSAURUS = 'therizinosaurus';
export const DP_SPECIES_TROODON = 'troodon';
export const DP_SPECIES_UTAHRAPTOR = 'utahraptor';
export const DP_SPECIES_ARGENTINOSAURUS = 'argentinosaurus';
export const DP_SPECIES_LIOPLEURODON = 'liopleurodon';

export const DP_ALL_SPECIES_IDS: string[] = [
  DP_SPECIES_TREX, DP_SPECIES_RAPTOR, DP_SPECIES_TRICERATOPS, DP_SPECIES_STEGOSAURUS,
  DP_SPECIES_BRACHIOSAURUS, DP_SPECIES_PTERODACTYL, DP_SPECIES_SPINOSAURUS, DP_SPECIES_ANKYLOSAURUS,
  DP_SPECIES_PARASAUROLOPHUS, DP_SPECIES_DILOPHOSAURUS, DP_SPECIES_COMPSONAGNATHUS, DP_SPECIES_GALLIMIMUS,
  DP_SPECIES_ALLOSAURUS, DP_SPECIES_PACHYCEPHALOSAURUS, DP_SPECIES_STYRACOSAURUS, DP_SPECIES_MOSASAURUS,
  DP_SPECIES_DIMORPHODON, DP_SPECIES_ARCHAEOPTERYX, DP_SPECIES_CARNOTAURUS, DP_SPECIES_DIPLODOCUS,
  DP_SPECIES_KENTROSAURUS, DP_SPECIES_BARYONYX, DP_SPECIES_MICROCERATUS, DP_SPECIES_PLESIOSAURUS,
  DP_SPECIES_DEINONYCHUS, DP_SPECIES_EDMONTOSAURUS, DP_SPECIES_IGUANODON, DP_SPECIES_MAIASAURA,
  DP_SPECIES_THERIZINOSAURUS, DP_SPECIES_TROODON, DP_SPECIES_UTAHRAPTOR, DP_SPECIES_ARGENTINOSAURUS,
  DP_SPECIES_LIOPLEURODON,
];

// ---------------------------------------------------------------------------
// Species Data (references rarity, diet, food, zone constants)
// ---------------------------------------------------------------------------

export const DP_SPECIES_DATA: Record<string, {
  name: string; rarity: number; diet: string; preferredFood: string[];
  compatibleZones: string[]; baseHealth: number; dnaCost: number; sellValue: number;
}> = {
  [DP_SPECIES_TREX]: { name: 'Tyrannosaurus Rex', rarity: DP_RARITY_LEGENDARY, diet: DP_DIET_CARNIVORE, preferredFood: [DP_FOOD_MEAT], compatibleZones: [DP_ZONE_JUNGLE, DP_ZONE_VOLCANIC], baseHealth: 120, dnaCost: 500, sellValue: 2000 },
  [DP_SPECIES_RAPTOR]: { name: 'Velociraptor', rarity: DP_RARITY_RARE, diet: DP_DIET_CARNIVORE, preferredFood: [DP_FOOD_MEAT, DP_FOOD_FISH], compatibleZones: [DP_ZONE_JUNGLE, DP_ZONE_DESERT], baseHealth: 60, dnaCost: 150, sellValue: 500 },
  [DP_SPECIES_TRICERATOPS]: { name: 'Triceratops', rarity: DP_RARITY_UNCOMMON, diet: DP_DIET_HERBIVORE, preferredFood: [DP_FOOD_GREENS], compatibleZones: [DP_ZONE_JUNGLE, DP_ZONE_PRIMORDIAL], baseHealth: 90, dnaCost: 80, sellValue: 200 },
  [DP_SPECIES_STEGOSAURUS]: { name: 'Stegosaurus', rarity: DP_RARITY_UNCOMMON, diet: DP_DIET_HERBIVORE, preferredFood: [DP_FOOD_GREENS, DP_FOOD_FRUITS], compatibleZones: [DP_ZONE_JUNGLE, DP_ZONE_PRIMORDIAL], baseHealth: 85, dnaCost: 80, sellValue: 200 },
  [DP_SPECIES_BRACHIOSAURUS]: { name: 'Brachiosaurus', rarity: DP_RARITY_RARE, diet: DP_DIET_HERBIVORE, preferredFood: [DP_FOOD_GREENS, DP_FOOD_FRUITS], compatibleZones: [DP_ZONE_JUNGLE, DP_ZONE_PRIMORDIAL], baseHealth: 110, dnaCost: 200, sellValue: 600 },
  [DP_SPECIES_PTERODACTYL]: { name: 'Pterodactyl', rarity: DP_RARITY_UNCOMMON, diet: DP_DIET_PISCIVORE, preferredFood: [DP_FOOD_FISH], compatibleZones: [DP_ZONE_SKY, DP_ZONE_WATER], baseHealth: 50, dnaCost: 100, sellValue: 250 },
  [DP_SPECIES_SPINOSAURUS]: { name: 'Spinosaurus', rarity: DP_RARITY_EPIC, diet: DP_DIET_CARNIVORE, preferredFood: [DP_FOOD_MEAT, DP_FOOD_FISH], compatibleZones: [DP_ZONE_DESERT, DP_ZONE_WATER], baseHealth: 100, dnaCost: 300, sellValue: 1000 },
  [DP_SPECIES_ANKYLOSAURUS]: { name: 'Ankylosaurus', rarity: DP_RARITY_UNCOMMON, diet: DP_DIET_HERBIVORE, preferredFood: [DP_FOOD_GREENS], compatibleZones: [DP_ZONE_DESERT, DP_ZONE_JUNGLE], baseHealth: 95, dnaCost: 90, sellValue: 220 },
  [DP_SPECIES_PARASAUROLOPHUS]: { name: 'Parasaurolophus', rarity: DP_RARITY_COMMON, diet: DP_DIET_HERBIVORE, preferredFood: [DP_FOOD_GREENS, DP_FOOD_FRUITS], compatibleZones: [DP_ZONE_JUNGLE, DP_ZONE_SWAMP], baseHealth: 70, dnaCost: 40, sellValue: 100 },
  [DP_SPECIES_DILOPHOSAURUS]: { name: 'Dilophosaurus', rarity: DP_RARITY_RARE, diet: DP_DIET_CARNIVORE, preferredFood: [DP_FOOD_MEAT, DP_FOOD_INSECTS], compatibleZones: [DP_ZONE_JUNGLE, DP_ZONE_SWAMP], baseHealth: 55, dnaCost: 120, sellValue: 400 },
  [DP_SPECIES_COMPSONAGNATHUS]: { name: 'Compsognathus', rarity: DP_RARITY_COMMON, diet: DP_DIET_INSECTIVORE, preferredFood: [DP_FOOD_INSECTS], compatibleZones: [DP_ZONE_JUNGLE, DP_ZONE_SWAMP], baseHealth: 30, dnaCost: 20, sellValue: 50 },
  [DP_SPECIES_GALLIMIMUS]: { name: 'Gallimimus', rarity: DP_RARITY_COMMON, diet: DP_DIET_OMNIVORE, preferredFood: [DP_FOOD_FRUITS, DP_FOOD_GREENS, DP_FOOD_INSECTS], compatibleZones: [DP_ZONE_DESERT, DP_ZONE_JUNGLE], baseHealth: 45, dnaCost: 30, sellValue: 80 },
  [DP_SPECIES_ALLOSAURUS]: { name: 'Allosaurus', rarity: DP_RARITY_RARE, diet: DP_DIET_CARNIVORE, preferredFood: [DP_FOOD_MEAT], compatibleZones: [DP_ZONE_JUNGLE, DP_ZONE_VOLCANIC], baseHealth: 80, dnaCost: 160, sellValue: 550 },
  [DP_SPECIES_PACHYCEPHALOSAURUS]: { name: 'Pachycephalosaurus', rarity: DP_RARITY_COMMON, diet: DP_DIET_HERBIVORE, preferredFood: [DP_FOOD_GREENS], compatibleZones: [DP_ZONE_JUNGLE, DP_ZONE_PRIMORDIAL], baseHealth: 60, dnaCost: 35, sellValue: 90 },
  [DP_SPECIES_STYRACOSAURUS]: { name: 'Styracosaurus', rarity: DP_RARITY_UNCOMMON, diet: DP_DIET_HERBIVORE, preferredFood: [DP_FOOD_GREENS], compatibleZones: [DP_ZONE_DESERT, DP_ZONE_PRIMORDIAL], baseHealth: 80, dnaCost: 75, sellValue: 190 },
  [DP_SPECIES_MOSASAURUS]: { name: 'Mosasaurus', rarity: DP_RARITY_EPIC, diet: DP_DIET_PISCIVORE, preferredFood: [DP_FOOD_FISH], compatibleZones: [DP_ZONE_WATER], baseHealth: 130, dnaCost: 350, sellValue: 1200 },
  [DP_SPECIES_DIMORPHODON]: { name: 'Dimorphodon', rarity: DP_RARITY_COMMON, diet: DP_DIET_INSECTIVORE, preferredFood: [DP_FOOD_INSECTS, DP_FOOD_FISH], compatibleZones: [DP_ZONE_SKY, DP_ZONE_SWAMP], baseHealth: 25, dnaCost: 25, sellValue: 60 },
  [DP_SPECIES_ARCHAEOPTERYX]: { name: 'Archaeopteryx', rarity: DP_RARITY_RARE, diet: DP_DIET_OMNIVORE, preferredFood: [DP_FOOD_INSECTS, DP_FOOD_FRUITS], compatibleZones: [DP_ZONE_SKY, DP_ZONE_PRIMORDIAL], baseHealth: 20, dnaCost: 130, sellValue: 450 },
  [DP_SPECIES_CARNOTAURUS]: { name: 'Carnotaurus', rarity: DP_RARITY_EPIC, diet: DP_DIET_CARNIVORE, preferredFood: [DP_FOOD_MEAT], compatibleZones: [DP_ZONE_DESERT, DP_ZONE_VOLCANIC], baseHealth: 90, dnaCost: 280, sellValue: 900 },
  [DP_SPECIES_DIPLODOCUS]: { name: 'Diplodocus', rarity: DP_RARITY_RARE, diet: DP_DIET_HERBIVORE, preferredFood: [DP_FOOD_GREENS], compatibleZones: [DP_ZONE_JUNGLE, DP_ZONE_SWAMP], baseHealth: 105, dnaCost: 180, sellValue: 550 },
  [DP_SPECIES_KENTROSAURUS]: { name: 'Kentrosaurus', rarity: DP_RARITY_UNCOMMON, diet: DP_DIET_HERBIVORE, preferredFood: [DP_FOOD_GREENS], compatibleZones: [DP_ZONE_DESERT, DP_ZONE_JUNGLE], baseHealth: 75, dnaCost: 70, sellValue: 180 },
  [DP_SPECIES_BARYONYX]: { name: 'Baryonyx', rarity: DP_RARITY_RARE, diet: DP_DIET_PISCIVORE, preferredFood: [DP_FOOD_FISH], compatibleZones: [DP_ZONE_WATER, DP_ZONE_SWAMP], baseHealth: 70, dnaCost: 140, sellValue: 480 },
  [DP_SPECIES_MICROCERATUS]: { name: 'Microceratus', rarity: DP_RARITY_COMMON, diet: DP_DIET_HERBIVORE, preferredFood: [DP_FOOD_GREENS, DP_FOOD_FRUITS], compatibleZones: [DP_ZONE_JUNGLE, DP_ZONE_PRIMORDIAL], baseHealth: 25, dnaCost: 20, sellValue: 50 },
  [DP_SPECIES_PLESIOSAURUS]: { name: 'Plesiosaurus', rarity: DP_RARITY_RARE, diet: DP_DIET_PISCIVORE, preferredFood: [DP_FOOD_FISH], compatibleZones: [DP_ZONE_WATER, DP_ZONE_ARCTIC], baseHealth: 80, dnaCost: 170, sellValue: 520 },
  [DP_SPECIES_DEINONYCHUS]: { name: 'Deinonychus', rarity: DP_RARITY_UNCOMMON, diet: DP_DIET_CARNIVORE, preferredFood: [DP_FOOD_MEAT], compatibleZones: [DP_ZONE_JUNGLE, DP_ZONE_PRIMORDIAL], baseHealth: 50, dnaCost: 95, sellValue: 260 },
  [DP_SPECIES_EDMONTOSAURUS]: { name: 'Edmontosaurus', rarity: DP_RARITY_COMMON, diet: DP_DIET_HERBIVORE, preferredFood: [DP_FOOD_GREENS], compatibleZones: [DP_ZONE_SWAMP, DP_ZONE_PRIMORDIAL], baseHealth: 65, dnaCost: 30, sellValue: 75 },
  [DP_SPECIES_IGUANODON]: { name: 'Iguanodon', rarity: DP_RARITY_COMMON, diet: DP_DIET_HERBIVORE, preferredFood: [DP_FOOD_GREENS, DP_FOOD_FRUITS], compatibleZones: [DP_ZONE_JUNGLE, DP_ZONE_PRIMORDIAL], baseHealth: 70, dnaCost: 35, sellValue: 85 },
  [DP_SPECIES_MAIASAURA]: { name: 'Maiasaura', rarity: DP_RARITY_COMMON, diet: DP_DIET_HERBIVORE, preferredFood: [DP_FOOD_GREENS], compatibleZones: [DP_ZONE_SWAMP, DP_ZONE_JUNGLE], baseHealth: 55, dnaCost: 25, sellValue: 65 },
  [DP_SPECIES_THERIZINOSAURUS]: { name: 'Therizinosaurus', rarity: DP_RARITY_EPIC, diet: DP_DIET_OMNIVORE, preferredFood: [DP_FOOD_GREENS, DP_FOOD_INSECTS], compatibleZones: [DP_ZONE_PRIMORDIAL, DP_ZONE_JUNGLE], baseHealth: 85, dnaCost: 260, sellValue: 850 },
  [DP_SPECIES_TROODON]: { name: 'Troodon', rarity: DP_RARITY_RARE, diet: DP_DIET_OMNIVORE, preferredFood: [DP_FOOD_INSECTS, DP_FOOD_MEAT], compatibleZones: [DP_ZONE_PRIMORDIAL, DP_ZONE_ARCTIC], baseHealth: 35, dnaCost: 150, sellValue: 500 },
  [DP_SPECIES_UTAHRAPTOR]: { name: 'Utahraptor', rarity: DP_RARITY_EPIC, diet: DP_DIET_CARNIVORE, preferredFood: [DP_FOOD_MEAT], compatibleZones: [DP_ZONE_DESERT, DP_ZONE_VOLCANIC], baseHealth: 75, dnaCost: 320, sellValue: 1100 },
  [DP_SPECIES_ARGENTINOSAURUS]: { name: 'Argentinosaurus', rarity: DP_RARITY_LEGENDARY, diet: DP_DIET_HERBIVORE, preferredFood: [DP_FOOD_GREENS, DP_FOOD_FRUITS], compatibleZones: [DP_ZONE_PRIMORDIAL, DP_ZONE_JUNGLE], baseHealth: 150, dnaCost: 600, sellValue: 2500 },
  [DP_SPECIES_LIOPLEURODON]: { name: 'Liopleurodon', rarity: DP_RARITY_LEGENDARY, diet: DP_DIET_PISCIVORE, preferredFood: [DP_FOOD_FISH], compatibleZones: [DP_ZONE_WATER, DP_ZONE_ARCTIC], baseHealth: 140, dnaCost: 550, sellValue: 2200 },
};

// ---------------------------------------------------------------------------
// Facility IDs (25 facilities)
// ---------------------------------------------------------------------------

export const DP_FAC_VISITOR_CENTER = 'visitor_center';
export const DP_FAC_RESEARCH_LAB = 'research_lab';
export const DP_FAC_INCUBATOR = 'incubator';
export const DP_FAC_MEDICAL_BAY = 'medical_bay';
export const DP_FAC_GIFT_SHOP = 'gift_shop';
export const DP_FAC_SECURITY_STATION = 'security_station';
export const DP_FAC_FEED_STORAGE = 'feed_storage';
export const DP_FAC_POWER_PLANT = 'power_plant';
export const DP_FAC_WATER_TREATMENT = 'water_treatment';
export const DP_FAC_FOSSIL_EXHIBIT = 'fossil_exhibit';
export const DP_FAC_AMPHITHEATER = 'amphitheater';
export const DP_FAC_HELIPAD = 'helipad';
export const DP_FAC_RESTAURANT = 'restaurant';
export const DP_FAC_HOTEL = 'hotel';
export const DP_FAC_SAFARI_STATION = 'safari_station';
export const DP_FAC_GENETICS_LAB = 'genetics_lab';
export const DP_FAC_QUARANTINE_PEN = 'quarantine_pen';
export const DP_FAC_OBSERVATION_TOWER = 'observation_tower';
export const DP_FAC_PETTING_ZOO = 'petting_zoo';
export const DP_FAC_VIP_LOUNGE = 'vip_lounge';
export const DP_FAC_EMERGENCY_BUNKER = 'emergency_bunker';
export const DP_FAC_GREENHOUSE = 'greenhouse';
export const DP_FAC_TRAINING_ARENA = 'training_arena';
export const DP_FAC_CRYPTO_CHAMBER = 'cryo_chamber';
export const DP_FAC_BREEDING_CENTER = 'breeding_center';

export const DP_FAC_IDS: string[] = [
  DP_FAC_VISITOR_CENTER, DP_FAC_RESEARCH_LAB, DP_FAC_INCUBATOR, DP_FAC_MEDICAL_BAY,
  DP_FAC_GIFT_SHOP, DP_FAC_SECURITY_STATION, DP_FAC_FEED_STORAGE, DP_FAC_POWER_PLANT,
  DP_FAC_WATER_TREATMENT, DP_FAC_FOSSIL_EXHIBIT, DP_FAC_AMPHITHEATER, DP_FAC_HELIPAD,
  DP_FAC_RESTAURANT, DP_FAC_HOTEL, DP_FAC_SAFARI_STATION, DP_FAC_GENETICS_LAB,
  DP_FAC_QUARANTINE_PEN, DP_FAC_OBSERVATION_TOWER, DP_FAC_PETTING_ZOO, DP_FAC_VIP_LOUNGE,
  DP_FAC_EMERGENCY_BUNKER, DP_FAC_GREENHOUSE, DP_FAC_TRAINING_ARENA, DP_FAC_CRYPTO_CHAMBER,
  DP_FAC_BREEDING_CENTER,
];

export const DP_FAC_DATA: Record<string, { name: string; category: string; buildCost: number; upgradeCost: number; unlockLevel: number; effect: string }> = {
  [DP_FAC_VISITOR_CENTER]: { name: 'Visitor Center', category: 'tourism', buildCost: 500, upgradeCost: 200, unlockLevel: 1, effect: 'Increases visitor capacity by 20' },
  [DP_FAC_RESEARCH_LAB]: { name: 'Research Lab', category: 'research', buildCost: 800, upgradeCost: 300, unlockLevel: 2, effect: 'Unlocks advanced research topics' },
  [DP_FAC_INCUBATOR]: { name: 'Incubator', category: 'breeding', buildCost: 600, upgradeCost: 250, unlockLevel: 3, effect: 'Hatch eggs 20% faster' },
  [DP_FAC_MEDICAL_BAY]: { name: 'Medical Bay', category: 'care', buildCost: 700, upgradeCost: 200, unlockLevel: 4, effect: 'Heal dinosaurs 15% faster' },
  [DP_FAC_GIFT_SHOP]: { name: 'Gift Shop', category: 'revenue', buildCost: 400, upgradeCost: 150, unlockLevel: 2, effect: 'Earns 10 coins per visitor' },
  [DP_FAC_SECURITY_STATION]: { name: 'Security Station', category: 'safety', buildCost: 600, upgradeCost: 250, unlockLevel: 5, effect: 'Reduces enclosure breaches by 30%' },
  [DP_FAC_FEED_STORAGE]: { name: 'Feed Storage', category: 'resource', buildCost: 300, upgradeCost: 100, unlockLevel: 1, effect: 'Increases food storage by 50' },
  [DP_FAC_POWER_PLANT]: { name: 'Power Plant', category: 'utility', buildCost: 1000, upgradeCost: 400, unlockLevel: 6, effect: 'Reduces facility maintenance by 10%' },
  [DP_FAC_WATER_TREATMENT]: { name: 'Water Treatment', category: 'utility', buildCost: 500, upgradeCost: 200, unlockLevel: 7, effect: 'Improves aquatic dinosaur health' },
  [DP_FAC_FOSSIL_EXHIBIT]: { name: 'Fossil Exhibit', category: 'tourism', buildCost: 900, upgradeCost: 350, unlockLevel: 8, effect: 'Boosts park rating by 0.3 stars' },
  [DP_FAC_AMPHITHEATER]: { name: 'Amphitheater', category: 'entertainment', buildCost: 1200, upgradeCost: 400, unlockLevel: 10, effect: 'Increases visitor satisfaction by 15%' },
  [DP_FAC_HELIPAD]: { name: 'Helipad', category: 'transport', buildCost: 1500, upgradeCost: 500, unlockLevel: 12, effect: 'Unlocks VIP helicopter tours' },
  [DP_FAC_RESTAURANT]: { name: 'Restaurant', category: 'revenue', buildCost: 800, upgradeCost: 300, unlockLevel: 6, effect: 'Earns 8 coins per visitor per meal' },
  [DP_FAC_HOTEL]: { name: 'Hotel', category: 'revenue', buildCost: 2000, upgradeCost: 600, unlockLevel: 14, effect: 'Earns 25 coins per overnight guest' },
  [DP_FAC_SAFARI_STATION]: { name: 'Safari Truck Station', category: 'entertainment', buildCost: 1000, upgradeCost: 350, unlockLevel: 9, effect: 'Unlocks safari tours for visitors' },
  [DP_FAC_GENETICS_LAB]: { name: 'Genetics Lab', category: 'research', buildCost: 1500, upgradeCost: 500, unlockLevel: 15, effect: 'DNA extraction yields 25% more' },
  [DP_FAC_QUARANTINE_PEN]: { name: 'Quarantine Pen', category: 'safety', buildCost: 800, upgradeCost: 300, unlockLevel: 11, effect: 'Isolates sick dinosaurs safely' },
  [DP_FAC_OBSERVATION_TOWER]: { name: 'Observation Tower', category: 'tourism', buildCost: 700, upgradeCost: 250, unlockLevel: 7, effect: 'Visitors gain happiness from viewing dinos' },
  [DP_FAC_PETTING_ZOO]: { name: 'Dino Petting Zoo', category: 'entertainment', buildCost: 600, upgradeCost: 200, unlockLevel: 5, effect: 'Extra revenue from friendly species' },
  [DP_FAC_VIP_LOUNGE]: { name: 'VIP Lounge', category: 'revenue', buildCost: 2500, upgradeCost: 800, unlockLevel: 18, effect: 'Earns 50 coins per VIP visitor' },
  [DP_FAC_EMERGENCY_BUNKER]: { name: 'Emergency Bunker', category: 'safety', buildCost: 2000, upgradeCost: 600, unlockLevel: 16, effect: 'Protects visitors during emergencies' },
  [DP_FAC_GREENHOUSE]: { name: 'Greenhouse', category: 'resource', buildCost: 500, upgradeCost: 200, unlockLevel: 8, effect: 'Produces free herbivore food daily' },
  [DP_FAC_TRAINING_ARENA]: { name: 'Training Arena', category: 'care', buildCost: 900, upgradeCost: 350, unlockLevel: 13, effect: 'Dinosaur happiness increases 10% faster' },
  [DP_FAC_CRYPTO_CHAMBER]: { name: 'Cryo Chamber', category: 'research', buildCost: 1800, upgradeCost: 600, unlockLevel: 20, effect: 'Preserves DNA samples indefinitely' },
  [DP_FAC_BREEDING_CENTER]: { name: 'Breeding Center', category: 'breeding', buildCost: 1200, upgradeCost: 400, unlockLevel: 10, effect: 'Unlocks advanced breeding techniques' },
};

// ---------------------------------------------------------------------------
// Research Topic IDs (30 topics)
// ---------------------------------------------------------------------------

export const DP_RES_GENETIC_ENG = 'genetic_engineering';
export const DP_RES_BEHAVIOR_STUDY = 'behavior_study';
export const DP_RES_DIET_OPTIMIZATION = 'diet_optimization';
export const DP_RES_DISEASE_RESISTANCE = 'disease_resistance';
export const DP_RES_CLIMATE_ADAPTATION = 'climate_adaptation';
export const DP_RES_SPEED_ENHANCEMENT = 'speed_enhancement';
export const DP_RES_SIZE_MODIFICATION = 'size_modification';
export const DP_RES_COLOR_MUTATION = 'color_mutation';
export const DP_RES_INTELLIGENCE_BOOST = 'intelligence_boost';
export const DP_RES_LONGEVITY = 'longevity_research';
export const DP_RES_PACK_BEHAVIOR = 'pack_behavior';
export const DP_RES_VOCALIZATION = 'vocalization_analysis';
export const DP_RES_THERMAL_REGULATION = 'thermal_regulation';
export const DP_RES_NIGHT_VISION = 'night_vision';
export const DP_RES_AQUATIC_ADAPTATION = 'aquatic_adaptation';
export const DP_RES_FLIGHT_MECHANICS = 'flight_mechanics';
export const DP_RES_ARMOR_ENHANCEMENT = 'armor_enhancement';
export const DP_RES_VENOM_RESEARCH = 'venom_research';
export const DP_RES_SOCIAL_HIERARCHY = 'social_hierarchy';
export const DP_RES_REPRODUCTIVE_HEALTH = 'reproductive_health';
export const DP_RES_EMBRYO_DEVELOPMENT = 'embryo_development';
export const DP_RES_FOSSIL_RECONSTRUCTION = 'fossil_reconstruction';
export const DP_RES_SEDIMENT_ANALYSIS = 'sediment_analysis';
export const DP_RES_CARBON_DATING = 'carbon_dating';
export const DP_RES_DNA_PRESERVATION = 'dna_preservation';
export const DP_RES_SPECIES_CLASSIFICATION = 'species_classification';
export const DP_RES_ECOSYSTEM_BALANCE = 'ecosystem_balance';
export const DP_RES_PREDATOR_PREY = 'predator_prey_dynamics';
export const DP_RES_HYBRID_VIABILITY = 'hybrid_viability';
export const DP_RES_EPIGENETIC_MARKERS = 'epigenetic_markers';

export const DP_RES_IDS: string[] = [
  DP_RES_GENETIC_ENG, DP_RES_BEHAVIOR_STUDY, DP_RES_DIET_OPTIMIZATION, DP_RES_DISEASE_RESISTANCE,
  DP_RES_CLIMATE_ADAPTATION, DP_RES_SPEED_ENHANCEMENT, DP_RES_SIZE_MODIFICATION, DP_RES_COLOR_MUTATION,
  DP_RES_INTELLIGENCE_BOOST, DP_RES_LONGEVITY, DP_RES_PACK_BEHAVIOR, DP_RES_VOCALIZATION,
  DP_RES_THERMAL_REGULATION, DP_RES_NIGHT_VISION, DP_RES_AQUATIC_ADAPTATION, DP_RES_FLIGHT_MECHANICS,
  DP_RES_ARMOR_ENHANCEMENT, DP_RES_VENOM_RESEARCH, DP_RES_SOCIAL_HIERARCHY, DP_RES_REPRODUCTIVE_HEALTH,
  DP_RES_EMBRYO_DEVELOPMENT, DP_RES_FOSSIL_RECONSTRUCTION, DP_RES_SEDIMENT_ANALYSIS, DP_RES_CARBON_DATING,
  DP_RES_DNA_PRESERVATION, DP_RES_SPECIES_CLASSIFICATION, DP_RES_ECOSYSTEM_BALANCE, DP_RES_PREDATOR_PREY,
  DP_RES_HYBRID_VIABILITY, DP_RES_EPIGENETIC_MARKERS,
];

export const DP_RES_DATA: Record<string, { name: string; category: string; unlockLevel: number; dnaCost: number; duration: number; reward: string }> = {
  [DP_RES_GENETIC_ENG]: { name: 'Genetic Engineering', category: 'genetics', unlockLevel: 5, dnaCost: 100, duration: 60, reward: 'Unlock rare species breeding' },
  [DP_RES_BEHAVIOR_STUDY]: { name: 'Behavior Study', category: 'biology', unlockLevel: 2, dnaCost: 40, duration: 30, reward: 'Dinosaur happiness boost +5%' },
  [DP_RES_DIET_OPTIMIZATION]: { name: 'Diet Optimization', category: 'biology', unlockLevel: 3, dnaCost: 50, duration: 40, reward: 'Food efficiency increased by 15%' },
  [DP_RES_DISEASE_RESISTANCE]: { name: 'Disease Resistance', category: 'medicine', unlockLevel: 8, dnaCost: 120, duration: 50, reward: 'Health decay rate reduced by 20%' },
  [DP_RES_CLIMATE_ADAPTATION]: { name: 'Climate Adaptation', category: 'genetics', unlockLevel: 10, dnaCost: 150, duration: 55, reward: 'Unlock Arctic and Volcanic enclosures' },
  [DP_RES_SPEED_ENHANCEMENT]: { name: 'Speed Enhancement', category: 'genetics', unlockLevel: 12, dnaCost: 180, duration: 45, reward: 'Visitor tour speed increased' },
  [DP_RES_SIZE_MODIFICATION]: { name: 'Size Modification', category: 'genetics', unlockLevel: 15, dnaCost: 250, duration: 70, reward: 'Enclosure capacity +2' },
  [DP_RES_COLOR_MUTATION]: { name: 'Color Mutation', category: 'genetics', unlockLevel: 7, dnaCost: 80, duration: 35, reward: 'Sell value of dinos increases by 10%' },
  [DP_RES_INTELLIGENCE_BOOST]: { name: 'Intelligence Boost', category: 'biology', unlockLevel: 9, dnaCost: 100, duration: 40, reward: 'Dinos respond to training 20% better' },
  [DP_RES_LONGEVITY]: { name: 'Longevity Research', category: 'medicine', unlockLevel: 14, dnaCost: 200, duration: 60, reward: 'Dinosaur lifespan increased by 25%' },
  [DP_RES_PACK_BEHAVIOR]: { name: 'Pack Behavior', category: 'biology', unlockLevel: 6, dnaCost: 60, duration: 35, reward: 'Multiple same-species dinos get +10 happiness' },
  [DP_RES_VOCALIZATION]: { name: 'Vocalization Analysis', category: 'biology', unlockLevel: 4, dnaCost: 45, duration: 25, reward: 'Early warning of dinosaur distress' },
  [DP_RES_THERMAL_REGULATION]: { name: 'Thermal Regulation', category: 'biology', unlockLevel: 11, dnaCost: 130, duration: 45, reward: 'Hunger decreases 10% slower' },
  [DP_RES_NIGHT_VISION]: { name: 'Night Vision', category: 'biology', unlockLevel: 13, dnaCost: 160, duration: 40, reward: 'Night tours unlock' },
  [DP_RES_AQUATIC_ADAPTATION]: { name: 'Aquatic Adaptation', category: 'genetics', unlockLevel: 8, dnaCost: 110, duration: 50, reward: 'Water species health boost' },
  [DP_RES_FLIGHT_MECHANICS]: { name: 'Flight Mechanics', category: 'biology', unlockLevel: 16, dnaCost: 220, duration: 55, reward: 'Flying species happiness +15%' },
  [DP_RES_ARMOR_ENHANCEMENT]: { name: 'Armor Enhancement', category: 'genetics', unlockLevel: 17, dnaCost: 240, duration: 60, reward: 'Health of armored species +20%' },
  [DP_RES_VENOM_RESEARCH]: { name: 'Venom Research', category: 'medicine', unlockLevel: 18, dnaCost: 260, duration: 50, reward: 'Security station effectiveness +25%' },
  [DP_RES_SOCIAL_HIERARCHY]: { name: 'Social Hierarchy', category: 'biology', unlockLevel: 9, dnaCost: 90, duration: 40, reward: 'Compatible species coexist peacefully' },
  [DP_RES_REPRODUCTIVE_HEALTH]: { name: 'Reproductive Health', category: 'medicine', unlockLevel: 11, dnaCost: 140, duration: 45, reward: 'Breeding success rate +15%' },
  [DP_RES_EMBRYO_DEVELOPMENT]: { name: 'Embryo Development', category: 'genetics', unlockLevel: 19, dnaCost: 280, duration: 65, reward: 'Egg incubation time reduced by 20%' },
  [DP_RES_FOSSIL_RECONSTRUCTION]: { name: 'Fossil Reconstruction', category: 'paleontology', unlockLevel: 3, dnaCost: 30, duration: 30, reward: 'Excavation speed +20%' },
  [DP_RES_SEDIMENT_ANALYSIS]: { name: 'Sediment Analysis', category: 'paleontology', unlockLevel: 5, dnaCost: 50, duration: 35, reward: 'Better fossil quality from excavations' },
  [DP_RES_CARBON_DATING]: { name: 'Carbon Dating', category: 'paleontology', unlockLevel: 7, dnaCost: 70, duration: 40, reward: 'Identify fossil species before extraction' },
  [DP_RES_DNA_PRESERVATION]: { name: 'DNA Preservation', category: 'genetics', unlockLevel: 20, dnaCost: 300, duration: 70, reward: 'DNA samples last twice as long' },
  [DP_RES_SPECIES_CLASSIFICATION]: { name: 'Species Classification', category: 'paleontology', unlockLevel: 4, dnaCost: 40, duration: 30, reward: 'Unlock species encyclopedia entries' },
  [DP_RES_ECOSYSTEM_BALANCE]: { name: 'Ecosystem Balance', category: 'biology', unlockLevel: 22, dnaCost: 350, duration: 75, reward: 'All dinos in balanced enclosures +5 health' },
  [DP_RES_PREDATOR_PREY]: { name: 'Predator-Prey Dynamics', category: 'biology', unlockLevel: 16, dnaCost: 200, duration: 55, reward: 'Separate predator and prey enclosures' },
  [DP_RES_HYBRID_VIABILITY]: { name: 'Hybrid Viability', category: 'genetics', unlockLevel: 25, dnaCost: 500, duration: 90, reward: 'Unlock hybrid dinosaur creation' },
  [DP_RES_EPIGENETIC_MARKERS]: { name: 'Epigenetic Markers', category: 'genetics', unlockLevel: 30, dnaCost: 600, duration: 80, reward: 'Dinosaur traits influenced by environment' },
};

// ---------------------------------------------------------------------------
// Quest IDs
// ---------------------------------------------------------------------------

export const DP_QUEST_FIRST_HATCH = 'quest_first_hatch';
export const DP_QUEST_FULL_HOUSE = 'quest_full_house';
export const DP_QUEST_RESEARCH_PIONEER = 'quest_research_pioneer';
export const DP_QUEST_TOURISM_BOOM = 'quest_tourism_boom';
export const DP_QUEST_BREEDING_EXPERT = 'quest_breeding_expert';
export const DP_QUEST_FIVE_STAR = 'quest_five_star';
export const DP_QUEST_DIVERSE_COLLECTION = 'quest_diverse_collection';
export const DP_QUEST_PALEO_EXPERT = 'quest_paleo_expert';
export const DP_QUEST_DINO_WHISPERER = 'quest_dino_whisperer';
export const DP_QUEST_PARK_OVERLORD = 'quest_park_overlord';

export const DP_QUEST_IDS: string[] = [
  DP_QUEST_FIRST_HATCH, DP_QUEST_FULL_HOUSE, DP_QUEST_RESEARCH_PIONEER,
  DP_QUEST_TOURISM_BOOM, DP_QUEST_BREEDING_EXPERT, DP_QUEST_FIVE_STAR,
  DP_QUEST_DIVERSE_COLLECTION, DP_QUEST_PALEO_EXPERT, DP_QUEST_DINO_WHISPERER,
  DP_QUEST_PARK_OVERLORD,
];

export const DP_QUEST_DATA: Record<string, { name: string; description: string; objective: number; reward: { coins: number; xp: number; dna: number }; unlockLevel: number }> = {
  [DP_QUEST_FIRST_HATCH]: { name: 'First Hatch', description: 'Hatch your very first dinosaur egg', objective: 1, reward: { coins: 200, xp: 50, dna: 20 }, unlockLevel: 1 },
  [DP_QUEST_FULL_HOUSE]: { name: 'Full House', description: 'Fill an enclosure to maximum capacity', objective: 1, reward: { coins: 500, xp: 100, dna: 50 }, unlockLevel: 3 },
  [DP_QUEST_RESEARCH_PIONEER]: { name: 'Research Pioneer', description: 'Complete 5 research topics', objective: 5, reward: { coins: 800, xp: 150, dna: 100 }, unlockLevel: 5 },
  [DP_QUEST_TOURISM_BOOM]: { name: 'Tourism Boom', description: 'Reach 1000 daily visitors', objective: 1000, reward: { coins: 1000, xp: 200, dna: 75 }, unlockLevel: 8 },
  [DP_QUEST_BREEDING_EXPERT]: { name: 'Breeding Expert', description: 'Successfully breed 3 dinosaurs', objective: 3, reward: { coins: 600, xp: 120, dna: 80 }, unlockLevel: 10 },
  [DP_QUEST_FIVE_STAR]: { name: 'Five-Star Park', description: 'Achieve a 5-star park rating', objective: 5, reward: { coins: 2000, xp: 300, dna: 150 }, unlockLevel: 15 },
  [DP_QUEST_DIVERSE_COLLECTION]: { name: 'Diverse Collection', description: 'Own dinosaurs from all 5 rarity tiers', objective: 5, reward: { coins: 1500, xp: 250, dna: 120 }, unlockLevel: 12 },
  [DP_QUEST_PALEO_EXPERT]: { name: 'Paleo Expert', description: 'Complete 20 fossil excavations', objective: 20, reward: { coins: 1200, xp: 200, dna: 200 }, unlockLevel: 10 },
  [DP_QUEST_DINO_WHISPERER]: { name: 'Dinosaur Whisperer', description: 'Reach max affinity with all 6 NPCs', objective: 6, reward: { coins: 3000, xp: 400, dna: 250 }, unlockLevel: 20 },
  [DP_QUEST_PARK_OVERLORD]: { name: 'Park Overlord', description: 'Reach level 50', objective: 50, reward: { coins: 10000, xp: 1000, dna: 500 }, unlockLevel: 1 },
};

// ---------------------------------------------------------------------------
// NPC IDs
// ---------------------------------------------------------------------------

export const DP_NPC_PALEONTOLOGIST = 'paleontologist';
export const DP_NPC_VETERINARIAN = 'veterinarian';
export const DP_NPC_PARK_MANAGER = 'park_manager';
export const DP_NPC_GENETICIST = 'geneticist';
export const DP_NPC_TOUR_GUIDE = 'tour_guide';
export const DP_NPC_SECURITY_CHIEF = 'security_chief';

export const DP_NPC_IDS: string[] = [
  DP_NPC_PALEONTOLOGIST, DP_NPC_VETERINARIAN, DP_NPC_PARK_MANAGER,
  DP_NPC_GENETICIST, DP_NPC_TOUR_GUIDE, DP_NPC_SECURITY_CHIEF,
];

export const DP_NPC_DATA: Record<string, { name: string; title: string; specialty: string; dialogues: string[] }> = {
  [DP_NPC_PALEONTOLOGIST]: { name: 'Dr. Alan', title: 'Paleontologist', specialty: 'Fossil excavation and species identification', dialogues: [
    'Fascinating! This fossil could belong to a new species.',
    'The sediment layers here tell a story millions of years old.',
    'I have spent decades studying these magnificent creatures.',
    'Every bone tells a tale of survival and extinction.',
    'The Cretaceous period holds so many secrets yet to uncover.',
  ]},
  [DP_NPC_VETERINARIAN]: { name: 'Dr. Sarah', title: 'Veterinarian', specialty: 'Dinosaur health and welfare', dialogues: [
    'This T-Rex needs a thorough checkup today.',
    'Healthy dinosaurs make for a happy park.',
    'I have developed a new vaccine for the common reptilian flu.',
    'Watch out for stress indicators in pack animals.',
    'Proper nutrition is the foundation of dinosaur care.',
  ]},
  [DP_NPC_PARK_MANAGER]: { name: 'John', title: 'Park Manager', specialty: 'Park operations and visitor experience', dialogues: [
    'The visitor satisfaction ratings are looking good this quarter.',
    'We need to focus on improving our park rating.',
    'Safety is our number one priority here.',
    'Have you seen the latest revenue reports?',
    'A well-run park is a profitable park.',
  ]},
  [DP_NPC_GENETICIST]: { name: 'Dr. Wu', title: 'Geneticist', specialty: 'DNA extraction and genetic modification', dialogues: [
    'The DNA sequence shows remarkable preservation.',
    'With enough genetic material, we could recreate anything.',
    'My latest research could revolutionize dinosaur health.',
    'Gene splicing opens up incredible possibilities.',
    'The genome map is nearly complete for this species.',
  ]},
  [DP_NPC_TOUR_GUIDE]: { name: 'Ellie', title: 'Tour Guide', specialty: 'Visitor tours and education', dialogues: [
    'Welcome, everyone! Prepare to be amazed!',
    'The T-Rex is our most popular attraction.',
    'Please keep your hands inside the vehicle at all times.',
    'Did you know Stegosaurus had a brain the size of a walnut?',
    'The kids always love the petting zoo the most.',
  ]},
  [DP_NPC_SECURITY_CHIEF]: { name: 'Robert', title: 'Security Chief', specialty: 'Park security and emergency response', dialogues: [
    'All perimeter fences are holding at full strength.',
    'We run containment drills every single morning.',
    'I do not take chances when it comes to safety.',
    'The new electric barriers should prevent any breaches.',
    'Every enclosure has backup containment protocols.',
  ]},
};

// ---------------------------------------------------------------------------
// Achievement IDs (15 achievements)
// ---------------------------------------------------------------------------

export const DP_ACH_FIRST_STEPS = 'ach_first_steps';
export const DP_ACH_COLLECTOR = 'ach_collector';
export const DP_ACH_MASTER_BREEDER = 'ach_master_breeder';
export const DP_ACH_RESEARCH_MAVEN = 'ach_research_maven';
export const DP_ACH_TOURIST_MAGNET = 'ach_tourist_magnet';
export const DP_ACH_FINANCIAL_GENIUS = 'ach_financial_genius';
export const DP_ACH_WHISPERER = 'ach_whisperer';
export const DP_ACH_FOSSIL_HUNTER = 'ach_fossil_hunter';
export const DP_ACH_PARK_LEGEND = 'ach_park_legend';
export const DP_ACH_SAFETY_FIRST = 'ach_safety_first';
export const DP_ACH_GENETIC_PIONEER = 'ach_genetic_pioneer';
export const DP_ACH_HOSPITALITY_KING = 'ach_hospitality_king';
export const DP_ACH_FULL_ROSTER = 'ach_full_roster';
export const DP_ACH_DAILY_DEVOTEE = 'ach_daily_devotee';
export const DP_ACH_OVERLORD = 'ach_overlord';

export const DP_ACH_IDS: string[] = [
  DP_ACH_FIRST_STEPS, DP_ACH_COLLECTOR, DP_ACH_MASTER_BREEDER, DP_ACH_RESEARCH_MAVEN,
  DP_ACH_TOURIST_MAGNET, DP_ACH_FINANCIAL_GENIUS, DP_ACH_WHISPERER, DP_ACH_FOSSIL_HUNTER,
  DP_ACH_PARK_LEGEND, DP_ACH_SAFETY_FIRST, DP_ACH_GENETIC_PIONEER, DP_ACH_HOSPITALITY_KING,
  DP_ACH_FULL_ROSTER, DP_ACH_DAILY_DEVOTEE, DP_ACH_OVERLORD,
];

export const DP_ACH_DATA: Record<string, { name: string; description: string; target: number; rewardCoins: number; rewardXP: number }> = {
  [DP_ACH_FIRST_STEPS]: { name: 'First Steps', description: 'Hatch your first dinosaur', target: 1, rewardCoins: 100, rewardXP: 25 },
  [DP_ACH_COLLECTOR]: { name: 'Collector', description: 'Own 10 different species', target: 10, rewardCoins: 500, rewardXP: 100 },
  [DP_ACH_MASTER_BREEDER]: { name: 'Master Breeder', description: 'Breed 10 dinosaurs', target: 10, rewardCoins: 800, rewardXP: 150 },
  [DP_ACH_RESEARCH_MAVEN]: { name: 'Research Maven', description: 'Complete 15 research topics', target: 15, rewardCoins: 1000, rewardXP: 200 },
  [DP_ACH_TOURIST_MAGNET]: { name: 'Tourist Magnet', description: 'Reach 5000 visitors in a day', target: 5000, rewardCoins: 2000, rewardXP: 300 },
  [DP_ACH_FINANCIAL_GENIUS]: { name: 'Financial Genius', description: 'Earn 100,000 total coins', target: 100000, rewardCoins: 5000, rewardXP: 400 },
  [DP_ACH_WHISPERER]: { name: 'Dino Whisperer', description: 'Have all dinos at max happiness', target: 1, rewardCoins: 1500, rewardXP: 250 },
  [DP_ACH_FOSSIL_HUNTER]: { name: 'Fossil Hunter', description: 'Complete 20 fossil excavations', target: 20, rewardCoins: 1200, rewardXP: 200 },
  [DP_ACH_PARK_LEGEND]: { name: 'Park Legend', description: 'Reach level 50', target: 50, rewardCoins: 10000, rewardXP: 1000 },
  [DP_ACH_SAFETY_FIRST]: { name: 'Safety First', description: 'Have all enclosures at max condition', target: 1, rewardCoins: 1000, rewardXP: 200 },
  [DP_ACH_GENETIC_PIONEER]: { name: 'Genetic Pioneer', description: 'Extract DNA from 50 fossils', target: 50, rewardCoins: 2000, rewardXP: 350 },
  [DP_ACH_HOSPITALITY_KING]: { name: 'Hospitality King', description: 'Build all tourism facilities', target: 5, rewardCoins: 3000, rewardXP: 400 },
  [DP_ACH_FULL_ROSTER]: { name: 'Full Roster', description: 'Own at least one of every species', target: 33, rewardCoins: 8000, rewardXP: 800 },
  [DP_ACH_DAILY_DEVOTEE]: { name: 'Daily Devotee', description: 'Complete 30 daily tasks', target: 30, rewardCoins: 2500, rewardXP: 500 },
  [DP_ACH_OVERLORD]: { name: 'Overlord', description: 'Unlock all titles', target: 8, rewardCoins: 20000, rewardXP: 2000 },
};

// ---------------------------------------------------------------------------
// Titles (must come after level thresholds conceptually)
// ---------------------------------------------------------------------------

export const DP_TITLE_INTERN = 'Intern';
export const DP_TITLE_KEEPER = 'Keeper';
export const DP_TITLE_RANGER = 'Ranger';
export const DP_TITLE_SCIENTIST = 'Scientist';
export const DP_TITLE_DIRECTOR = 'Director';
export const DP_TITLE_ARCHAEOLOGIST = 'Archaeologist';
export const DP_TITLE_WARDEN = 'Warden';
export const DP_TITLE_OVERLORD = 'Dinosaur Overlord';

export const DP_TITLES: string[] = [
  DP_TITLE_INTERN, DP_TITLE_KEEPER, DP_TITLE_RANGER, DP_TITLE_SCIENTIST,
  DP_TITLE_DIRECTOR, DP_TITLE_ARCHAEOLOGIST, DP_TITLE_WARDEN, DP_TITLE_OVERLORD,
];

export const DP_TITLE_LEVEL_MAP: Record<string, number> = {
  [DP_TITLE_INTERN]: 1,
  [DP_TITLE_KEEPER]: 5,
  [DP_TITLE_RANGER]: 10,
  [DP_TITLE_SCIENTIST]: 20,
  [DP_TITLE_DIRECTOR]: 30,
  [DP_TITLE_ARCHAEOLOGIST]: 35,
  [DP_TITLE_WARDEN]: 40,
  [DP_TITLE_OVERLORD]: 50,
};

// ---------------------------------------------------------------------------
// Level XP Thresholds (Level 1–50)
// ---------------------------------------------------------------------------

export const DP_LEVEL_XP: number[] = (() => {
  const table: number[] = [0];
  for (let lv = 1; lv <= 50; lv++) {
    table.push(Math.floor(100 * Math.pow(1.18, lv - 1)));
  }
  return table;
})();

// ---------------------------------------------------------------------------
// Tourism constants
// ---------------------------------------------------------------------------

export const DP_VISITOR_BASE = 50;
export const DP_VISITOR_RATING_MULT = 30;
export const DP_VISITOR_DINO_MULT = 8;
export const DP_VISITOR_FACILITY_MULT = 5;
export const DP_MAX_PARK_RATING = 5.0;
export const DP_RUSH_HOUR_MULT = 3;

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface DpDinosaur {
  id: string;
  speciesId: string;
  name: string;
  rarity: number;
  diet: string;
  level: number;
  xp: number;
  hunger: number;
  happiness: number;
  health: number;
  enclosureId: string | null;
  isHatchling: boolean;
  age: number;
}

export interface DpEnclosure {
  id: string;
  zoneId: string;
  name: string;
  dinosaurIds: string[];
  capacity: number;
  condition: number;
}

export interface DpFacilityState {
  facilityId: string;
  level: number;
  isBuilt: boolean;
}

export interface DpResearchState {
  researchId: string;
  progress: number;
  isComplete: boolean;
  isActive: boolean;
}

export interface DpQuestState {
  questId: string;
  status: 'available' | 'active' | 'completed' | 'failed';
  progress: number;
}

export interface DpNpcState {
  npcId: string;
  affinity: number;
  dialogueIndex: number;
  hasMet: boolean;
}

export interface DpBreedingSlot {
  id: string;
  parent1Id: string | null;
  parent2Id: string | null;
  progress: number;
  isActive: boolean;
  eggSpeciesId: string | null;
}

export interface DpFossilSite {
  id: string;
  speciesId: string;
  progress: number;
  isComplete: boolean;
}

export interface DpResources {
  coins: number;
  dna: number;
  food: Record<string, number>;
}

export interface DpDailyState {
  day: number;
  excavationDone: boolean;
  rushHourDone: boolean;
  visitorsToday: number;
  revenueToday: number;
  dailyTasksCompleted: number;
}

export interface DpDinosaurParkState {
  seed: number;
  dinosaurs: DpDinosaur[];
  enclosures: DpEnclosure[];
  facilities: DpFacilityState[];
  research: DpResearchState[];
  quests: DpQuestState[];
  npcs: DpNpcState[];
  achievements: string[];
  breedingSlots: DpBreedingSlot[];
  fossilSites: DpFossilSite[];
  resources: DpResources;
  daily: DpDailyState;
  level: number;
  xp: number;
  totalVisitors: number;
  totalRevenue: number;
  dinosaursHatched: number;
  dinosaursBred: number;
  researchCompleted: number;
  excavationsCompleted: number;
  dailyTasksTotal: number;
  parkRating: number;
}

export interface DpActionResult {
  success: boolean;
  message: string;
  rewards?: { coins?: number; xp?: number; dna?: number };
}

// ---------------------------------------------------------------------------
// Helper functions (pure, no hooks)
// ---------------------------------------------------------------------------

function dpClamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ID generation uses a counter (no Math.random).
let dpIdCounter = 0;
function dpMakeId(prefix: string): string {
  dpIdCounter += 1;
  return `${prefix}_${dpIdCounter}`;
}

function dpCalculateParkRating(s: DpDinosaurParkState): number {
  const dinoCount = s.dinosaurs.length;
  const avgHappiness = dinoCount > 0
    ? s.dinosaurs.reduce((sum, d) => sum + d.happiness, 0) / dinoCount
    : 0;
  const avgCondition = s.enclosures.length > 0
    ? s.enclosures.reduce((sum, e) => sum + e.condition, 0) / s.enclosures.length
    : 0;
  const builtFacilities = s.facilities.filter(f => f.isBuilt).length;
  const dinoScore = Math.min(dinoCount / 30, 1) * 1.5;
  const happyScore = (avgHappiness / 100) * 1.0;
  const condScore = (avgCondition / 100) * 1.0;
  const facScore = Math.min(builtFacilities / 15, 1) * 0.8;
  const researchScore = Math.min(s.researchCompleted / 15, 1) * 0.7;
  const raw = dinoScore + happyScore + condScore + facScore + researchScore;
  return dpClamp(Math.round(raw * 10) / 10, 0, DP_MAX_PARK_RATING);
}

function dpCalculateVisitorCount(s: DpDinosaurParkState): number {
  const base = DP_VISITOR_BASE;
  const ratingBonus = s.parkRating * DP_VISITOR_RATING_MULT;
  const dinoBonus = s.dinosaurs.length * DP_VISITOR_DINO_MULT;
  const facBonus = s.facilities.filter(f => f.isBuilt).length * DP_VISITOR_FACILITY_MULT;
  return Math.max(0, Math.floor(base + ratingBonus + dinoBonus + facBonus));
}

function dpCalculateDailyRevenue(s: DpDinosaurParkState): number {
  const visitors = dpCalculateVisitorCount(s);
  const hasGiftShop = s.facilities.some(f => f.facilityId === DP_FAC_GIFT_SHOP && f.isBuilt);
  const hasRestaurant = s.facilities.some(f => f.facilityId === DP_FAC_RESTAURANT && f.isBuilt);
  const hasHotel = s.facilities.some(f => f.facilityId === DP_FAC_HOTEL && f.isBuilt);
  let revenue = visitors * 2;
  if (hasGiftShop) revenue += visitors * 10;
  if (hasRestaurant) revenue += Math.floor(visitors * 0.6) * 8;
  if (hasHotel) revenue += Math.floor(visitors * 0.2) * 25;
  revenue += s.parkRating * 50;
  return Math.floor(revenue);
}

function dpGetTitleForLevel(level: number): string {
  let currentTitle = DP_TITLE_INTERN;
  for (const title of DP_TITLES) {
    if (level >= DP_TITLE_LEVEL_MAP[title]) {
      currentTitle = title;
    }
  }
  return currentTitle;
}

function dpCalculateMaintenanceCost(s: DpDinosaurParkState): number {
  let total = 0;
  for (const enc of s.enclosures) {
    const zoneData = DP_ZONE_DATA[enc.zoneId];
    if (zoneData) total += zoneData.maintenanceCost;
  }
  for (const fac of s.facilities) {
    if (!fac.isBuilt) continue;
    const facData = DP_FAC_DATA[fac.facilityId];
    if (facData) total += Math.floor(facData.buildCost * 0.02 * fac.level);
  }
  return total;
}

// ---------------------------------------------------------------------------
// createInitialState
// ---------------------------------------------------------------------------

function createInitialState(seed?: number): DpDinosaurParkState {
  const baseSeed = seed ?? 42;
  const rng = mulberry32(baseSeed);
  const initialFood: Record<string, number> = {};
  for (const foodId of DP_FOOD_IDS) {
    initialFood[foodId] = 10;
  }

  const initialEnclosures: DpEnclosure[] = [
    { id: dpMakeId('enc'), zoneId: DP_ZONE_JUNGLE, name: DP_ZONE_DATA[DP_ZONE_JUNGLE].name, dinosaurIds: [], capacity: DP_ZONE_DATA[DP_ZONE_JUNGLE].capacity, condition: 80 },
  ];

  const initialResearch: DpResearchState[] = DP_RES_IDS.map(resId => ({
    researchId: resId,
    progress: 0,
    isComplete: false,
    isActive: false,
  }));

  const initialQuests: DpQuestState[] = DP_QUEST_IDS.map(questId => ({
    questId,
    status: 'available' as const,
    progress: 0,
  }));

  const initialNpcs: DpNpcState[] = DP_NPC_IDS.map(npcId => ({
    npcId,
    affinity: 0,
    dialogueIndex: 0,
    hasMet: false,
  }));

  const fossilSpeciesPool = DP_ALL_SPECIES_IDS.filter(sid => {
    const info = DP_SPECIES_DATA[sid];
    return info && info.rarity >= DP_RARITY_UNCOMMON;
  });
  const fossilSites: DpFossilSite[] = [];
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(rng() * fossilSpeciesPool.length);
    fossilSites.push({
      id: dpMakeId('fossil'),
      speciesId: fossilSpeciesPool[idx] ?? DP_SPECIES_TRICERATOPS,
      progress: 0,
      isComplete: false,
    });
  }

  const initialFacilities: DpFacilityState[] = DP_FAC_IDS.map(facId => ({
    facilityId: facId,
    level: 1,
    isBuilt: false,
  }));

  return {
    seed: dpAdvanceSeed(baseSeed, 4),
    dinosaurs: [],
    enclosures: initialEnclosures,
    facilities: initialFacilities,
    research: initialResearch,
    quests: initialQuests,
    npcs: initialNpcs,
    achievements: [],
    breedingSlots: [
      { id: dpMakeId('breed'), parent1Id: null, parent2Id: null, progress: 0, isActive: false, eggSpeciesId: null },
    ],
    fossilSites,
    resources: { coins: 1000, dna: 100, food: initialFood },
    daily: { day: 1, excavationDone: false, rushHourDone: false, visitorsToday: 0, revenueToday: 0, dailyTasksCompleted: 0 },
    level: 1,
    xp: 0,
    totalVisitors: 0,
    totalRevenue: 0,
    dinosaursHatched: 0,
    dinosaursBred: 0,
    researchCompleted: 0,
    excavationsCompleted: 0,
    dailyTasksTotal: 0,
    parkRating: 1.0,
  };
}

// ---------------------------------------------------------------------------
// Achievement checking (pure helper)
// ---------------------------------------------------------------------------

function dpCheckAchievements(s: DpDinosaurParkState): string[] {
  const newlyUnlocked: string[] = [];
  const checks: Record<string, boolean> = {};

  checks[DP_ACH_FIRST_STEPS] = s.dinosaursHatched >= 1;
  checks[DP_ACH_COLLECTOR] = new Set(s.dinosaurs.map(d => d.speciesId)).size >= 10;
  checks[DP_ACH_MASTER_BREEDER] = s.dinosaursBred >= 10;
  checks[DP_ACH_RESEARCH_MAVEN] = s.researchCompleted >= 15;
  checks[DP_ACH_TOURIST_MAGNET] = s.daily.visitorsToday >= 5000;
  checks[DP_ACH_FINANCIAL_GENIUS] = s.totalRevenue >= 100000;
  checks[DP_ACH_WHISPERER] = s.dinosaurs.length > 0 && s.dinosaurs.every(d => d.happiness >= 95);
  checks[DP_ACH_FOSSIL_HUNTER] = s.excavationsCompleted >= 20;
  checks[DP_ACH_PARK_LEGEND] = s.level >= 50;
  checks[DP_ACH_SAFETY_FIRST] = s.enclosures.length > 0 && s.enclosures.every(e => e.condition >= 95);
  checks[DP_ACH_GENETIC_PIONEER] = s.fossilSites.filter(f => f.isComplete).length >= 50;
  checks[DP_ACH_HOSPITALITY_KING] = [DP_FAC_VISITOR_CENTER, DP_FAC_GIFT_SHOP, DP_FAC_RESTAURANT, DP_FAC_HOTEL, DP_FAC_SAFARI_STATION].every(
    fid => s.facilities.some(f => f.facilityId === fid && f.isBuilt)
  );
  checks[DP_ACH_FULL_ROSTER] = new Set(s.dinosaurs.map(d => d.speciesId)).size >= 33;
  checks[DP_ACH_DAILY_DEVOTEE] = s.dailyTasksTotal >= 30;
  checks[DP_ACH_OVERLORD] = s.level >= 50; // requires all titles which max at 50

  for (const achId of DP_ACH_IDS) {
    if (!s.achievements.includes(achId) && checks[achId]) {
      newlyUnlocked.push(achId);
    }
  }

  return newlyUnlocked;
}

// ---------------------------------------------------------------------------
// Quest progress checking (pure helper)
// ---------------------------------------------------------------------------

function dpUpdateQuestProgress(s: DpDinosaurParkState): DpQuestState[] {
  return s.quests.map(q => {
    if (q.status !== 'active') return q;
    let progress = q.progress;
    const obj = DP_QUEST_DATA[q.questId]?.objective ?? 0;

    switch (q.questId) {
      case DP_QUEST_FIRST_HATCH:
        progress = Math.min(s.dinosaursHatched, obj);
        break;
      case DP_QUEST_FULL_HOUSE:
        progress = s.enclosures.some(e => e.dinosaurIds.length >= e.capacity) ? Math.min(1, obj) : 0;
        break;
      case DP_QUEST_RESEARCH_PIONEER:
        progress = Math.min(s.researchCompleted, obj);
        break;
      case DP_QUEST_TOURISM_BOOM:
        progress = Math.min(s.daily.visitorsToday, obj);
        break;
      case DP_QUEST_BREEDING_EXPERT:
        progress = Math.min(s.dinosaursBred, obj);
        break;
      case DP_QUEST_FIVE_STAR:
        progress = Math.min(Math.floor(s.parkRating), obj);
        break;
      case DP_QUEST_DIVERSE_COLLECTION: {
        const rarities = new Set(s.dinosaurs.map(d => d.rarity));
        progress = Math.min(rarities.size, obj);
        break;
      }
      case DP_QUEST_PALEO_EXPERT:
        progress = Math.min(s.excavationsCompleted, obj);
        break;
      case DP_QUEST_DINO_WHISPERER:
        progress = Math.min(s.npcs.filter(n => n.affinity >= 100).length, obj);
        break;
      case DP_QUEST_PARK_OVERLORD:
        progress = Math.min(s.level, obj);
        break;
    }

    const isComplete = progress >= obj;
    return { ...q, progress, status: isComplete ? 'completed' as const : 'active' as const };
  });
}

// ---------------------------------------------------------------------------
// Hook: useDinosaurPark
// ---------------------------------------------------------------------------

export default function useDinosaurPark(initialSeed?: number) {
  const [state, setState] = useState<DpDinosaurParkState>(() => createInitialState(initialSeed));

  // ---- Pure getter functions (no useCallback needed) ----

  const dpGetState = useCallback((): DpDinosaurParkState => {
    return state;
  }, [state]);

  const dpGetDinosaurs = useCallback((): DpDinosaur[] => {
    return state.dinosaurs;
  }, [state]);

  const dpGetDinosaur = useCallback((dinoId: string): DpDinosaur | undefined => {
    return state.dinosaurs.find(d => d.id === dinoId);
  }, [state]);

  const dpGetEnclosures = useCallback((): DpEnclosure[] => {
    return state.enclosures;
  }, [state]);

  const dpGetResources = useCallback((): DpResources => {
    return state.resources;
  }, [state]);

  const dpGetRating = useCallback((): number => {
    return state.parkRating;
  }, [state]);

  const dpGetLevel = useCallback((): { level: number; xp: number; xpToNext: number } => {
    return { level: state.level, xp: state.xp, xpToNext: DP_LEVEL_XP[state.level] ?? 99999 };
  }, [state]);

  const dpGetTitle = useCallback((): string => {
    return dpGetTitleForLevel(state.level);
  }, [state]);

  const dpGetVisitorCount = useCallback((): number => {
    return dpCalculateVisitorCount(state);
  }, [state]);

  const dpGetDailyRevenue = useCallback((): number => {
    return dpCalculateDailyRevenue(state);
  }, [state]);

  const dpGetMaintenanceCost = useCallback((): number => {
    return dpCalculateMaintenanceCost(state);
  }, [state]);

  const dpGetFossilSites = useCallback((): DpFossilSite[] => {
    return state.fossilSites;
  }, [state]);

  const dpGetBreedingSlots = useCallback((): DpBreedingSlot[] => {
    return state.breedingSlots;
  }, [state]);

  const dpGetAchievements = useCallback((): { unlocked: string[]; all: typeof DP_ACH_DATA } => {
    return { unlocked: state.achievements, all: DP_ACH_DATA };
  }, [state]);

  const dpGetNpcList = useCallback((): DpNpcState[] => {
    return state.npcs;
  }, [state]);

  const dpGetQuests = useCallback((): DpQuestState[] => {
    return state.quests;
  }, [state]);

  const dpGetResearch = useCallback((): DpResearchState[] => {
    return state.research;
  }, [state]);

  const dpGetFacilities = useCallback((): DpFacilityState[] => {
    return state.facilities;
  }, [state]);

  const dpGetDaily = useCallback((): DpDailyState => {
    return state.daily;
  }, [state]);

  // ---- State mutation functions (useCallback) ----

  const dpAddXP = useCallback((amount: number): DpActionResult => {
    let gained = 0;
    let newLevel = state.level;
    let newXP = state.xp + amount;
    gained = amount;
    while (newLevel < 50 && newXP >= (DP_LEVEL_XP[newLevel] ?? 99999)) {
      newXP -= DP_LEVEL_XP[newLevel] ?? 99999;
      newLevel += 1;
    }
    if (newLevel > 50) { newLevel = 50; newXP = 0; }

    setState(prev => {
      const updated = { ...prev, level: newLevel, xp: newXP };
      updated.parkRating = dpCalculateParkRating(updated);
      updated.quests = dpUpdateQuestProgress(updated);
      const newAch = dpCheckAchievements(updated);
      if (newAch.length > 0) updated.achievements = [...updated.achievements, ...newAch];
      return updated;
    });

    return { success: true, message: `Gained ${gained} XP`, rewards: { xp: gained } };
  }, [state]);

  const dpHatchEgg = useCallback((speciesId: string): DpActionResult => {
    const speciesInfo = DP_SPECIES_DATA[speciesId];
    if (!speciesInfo) return { success: false, message: `Unknown species: ${speciesId}` };

    if (state.resources.dna < speciesInfo.dnaCost) {
      return { success: false, message: `Not enough DNA (need ${speciesInfo.dnaCost})` };
    }

    const rng = mulberry32(state.seed);
    const hatchChance = DP_RARITY_HATCH_CHANCE[speciesInfo.rarity] ?? 0.5;
    const roll = rng();
    const newSeed = dpAdvanceSeed(state.seed, 1);

    if (roll > hatchChance) {
      setState(prev => ({ ...prev, seed: newSeed, resources: { ...prev.resources, dna: prev.resources.dna - speciesInfo.dnaCost } }));
      return { success: false, message: `Egg failed to hatch! Lost ${speciesInfo.dnaCost} DNA.` };
    }

    const isMutation = roll < 0.05;
    const mutationName = isMutation ? `${speciesInfo.name} (Shiny)` : speciesInfo.name;

    const newDino: DpDinosaur = {
      id: dpMakeId('dino'),
      speciesId,
      name: mutationName,
      rarity: isMutation ? dpClamp(speciesInfo.rarity + 1, 0, 4) : speciesInfo.rarity,
      diet: speciesInfo.diet,
      level: 1,
      xp: 0,
      hunger: 80,
      happiness: 70,
      health: speciesInfo.baseHealth,
      enclosureId: null,
      isHatchling: true,
      age: 0,
    };

    setState(prev => {
      const updated = {
        ...prev,
        seed: newSeed,
        dinosaurs: [...prev.dinosaurs, newDino],
        resources: { ...prev.resources, dna: prev.resources.dna - speciesInfo.dnaCost },
        dinosaursHatched: prev.dinosaursHatched + 1,
      };
      updated.parkRating = dpCalculateParkRating(updated);
      updated.quests = dpUpdateQuestProgress(updated);
      const newAch = dpCheckAchievements(updated);
      if (newAch.length > 0) updated.achievements = [...updated.achievements, ...newAch];
      return updated;
    });

    return { success: true, message: `Hatched a ${mutationName}!`, rewards: { xp: 25 } };
  }, [state]);

  const dpFeedDino = useCallback((dinoId: string, foodId: string): DpActionResult => {
    const dino = state.dinosaurs.find(d => d.id === dinoId);
    if (!dino) return { success: false, message: 'Dinosaur not found' };

    const foodData = DP_FOOD_DATA[foodId];
    if (!foodData) return { success: false, message: 'Unknown food type' };

    if ((state.resources.food[foodId] ?? 0) < 1) {
      return { success: false, message: `No ${foodData.name} available` };
    }

    const isCompatible = foodData.compatibleDiets.includes(dino.diet);
    const restoreAmount = isCompatible ? foodData.hungerRestore : Math.floor(foodData.hungerRestore * 0.3);

    setState(prev => {
      const newDinos = prev.dinosaurs.map(d => {
        if (d.id !== dinoId) return d;
        const newHunger = dpClamp(d.hunger + restoreAmount, 0, 100);
        const happinessBonus = isCompatible ? 5 : -2;
        return { ...d, hunger: newHunger, happiness: dpClamp(d.happiness + happinessBonus, 0, 100) };
      });
      return {
        ...prev,
        dinosaurs: newDinos,
        resources: {
          ...prev.resources,
          food: { ...prev.resources.food, [foodId]: (prev.resources.food[foodId] ?? 0) - 1 },
        },
      };
    });

    return {
      success: true,
      message: isCompatible
        ? `Fed ${dino.name} ${foodData.name} (+${restoreAmount} hunger)`
        : `Fed ${dino.name} ${foodData.name} (incompatible, +${restoreAmount} hunger)`,
    };
  }, [state]);

  // Plain function that calls useCallback-wrapped functions
  function dpFeedAll(enclosureId: string, foodId: string): DpActionResult[] {
    const enclosure = state.enclosures.find(e => e.id === enclosureId);
    if (!enclosure) return [{ success: false, message: 'Enclosure not found' }];
    return enclosure.dinosaurIds.map(dinoId => dpFeedDino(dinoId, foodId));
  }

  const dpAssignToEnclosure = useCallback((dinoId: string, enclosureId: string): DpActionResult => {
    const dino = state.dinosaurs.find(d => d.id === dinoId);
    if (!dino) return { success: false, message: 'Dinosaur not found' };

    const enclosure = state.enclosures.find(e => e.id === enclosureId);
    if (!enclosure) return { success: false, message: 'Enclosure not found' };

    const speciesInfo = DP_SPECIES_DATA[dino.speciesId];
    if (!speciesInfo) return { success: false, message: 'Species data not found' };

    if (!speciesInfo.compatibleZones.includes(enclosure.zoneId)) {
      return { success: false, message: `${speciesInfo.name} is not compatible with ${DP_ZONE_DATA[enclosure.zoneId]?.name ?? 'this zone'}` };
    }

    if (enclosure.dinosaurIds.length >= enclosure.capacity) {
      return { success: false, message: 'Enclosure is full' };
    }

    // Remove from old enclosure
    const prevEnclosureId = dino.enclosureId;

    setState(prev => {
      const newDinos = prev.dinosaurs.map(d => d.id === dinoId ? { ...d, enclosureId } : d);
      const newEnclosures = prev.enclosures.map(enc => {
        const updated = { ...enc };
        if (enc.id === prevEnclosureId) {
          updated.dinosaurIds = enc.dinosaurIds.filter(id => id !== dinoId);
        }
        if (enc.id === enclosureId) {
          updated.dinosaurIds = [...enc.dinosaurIds, dinoId];
        }
        return updated;
      });
      return { ...prev, dinosaurs: newDinos, enclosures: newEnclosures };
    });

    return { success: true, message: `Assigned ${dino.name} to ${enclosure.name}` };
  }, [state]);

  const dpRemoveFromEnclosure = useCallback((dinoId: string): DpActionResult => {
    const dino = state.dinosaurs.find(d => d.id === dinoId);
    if (!dino || !dino.enclosureId) return { success: false, message: 'Dinosaur not in an enclosure' };

    const enclosureId = dino.enclosureId;
    setState(prev => {
      const newDinos = prev.dinosaurs.map(d => d.id === dinoId ? { ...d, enclosureId: null } : d);
      const newEnclosures = prev.enclosures.map(enc =>
        enc.id === enclosureId
          ? { ...enc, dinosaurIds: enc.dinosaurIds.filter(id => id !== dinoId) }
          : enc
      );
      return { ...prev, dinosaurs: newDinos, enclosures: newEnclosures };
    });

    return { success: true, message: `Removed ${dino.name} from enclosure` };
  }, [state]);

  const dpBuildFacility = useCallback((facilityId: string): DpActionResult => {
    const facData = DP_FAC_DATA[facilityId];
    if (!facData) return { success: false, message: 'Unknown facility' };

    if (state.level < facData.unlockLevel) {
      return { success: false, message: `Requires level ${facData.unlockLevel}` };
    }

    const existing = state.facilities.find(f => f.facilityId === facilityId);
    if (existing?.isBuilt) return { success: false, message: 'Facility already built' };

    if (state.resources.coins < facData.buildCost) {
      return { success: false, message: `Not enough coins (need ${facData.buildCost})` };
    }

    setState(prev => {
      const newFacilities = prev.facilities.map(f =>
        f.facilityId === facilityId ? { ...f, isBuilt: true } : f
      );
      const updated = {
        ...prev,
        facilities: newFacilities,
        resources: { ...prev.resources, coins: prev.resources.coins - facData.buildCost },
      };
      updated.parkRating = dpCalculateParkRating(updated);
      updated.quests = dpUpdateQuestProgress(updated);
      const newAch = dpCheckAchievements(updated);
      if (newAch.length > 0) updated.achievements = [...updated.achievements, ...newAch];
      return updated;
    });

    return { success: true, message: `Built ${facData.name}!`, rewards: { xp: 30 } };
  }, [state]);

  const dpUpgradeFacility = useCallback((facilityId: string): DpActionResult => {
    const facData = DP_FAC_DATA[facilityId];
    if (!facData) return { success: false, message: 'Unknown facility' };

    const existing = state.facilities.find(f => f.facilityId === facilityId);
    if (!existing || !existing.isBuilt) return { success: false, message: 'Facility not built yet' };

    const cost = facData.upgradeCost * existing.level;
    if (state.resources.coins < cost) {
      return { success: false, message: `Not enough coins (need ${cost})` };
    }

    setState(prev => {
      const newFacilities = prev.facilities.map(f =>
        f.facilityId === facilityId ? { ...f, level: f.level + 1 } : f
      );
      return {
        ...prev,
        facilities: newFacilities,
        resources: { ...prev.resources, coins: prev.resources.coins - cost },
      };
    });

    return { success: true, message: `Upgraded ${facData.name} to level ${existing.level + 1}` };
  }, [state]);

  const dpStartResearch = useCallback((researchId: string): DpActionResult => {
    const resData = DP_RES_DATA[researchId];
    if (!resData) return { success: false, message: 'Unknown research topic' };

    if (state.level < resData.unlockLevel) {
      return { success: false, message: `Requires level ${resData.unlockLevel}` };
    }

    if (state.resources.dna < resData.dnaCost) {
      return { success: false, message: `Not enough DNA (need ${resData.dnaCost})` };
    }

    const existing = state.research.find(r => r.researchId === researchId);
    if (existing?.isActive || existing?.isComplete) {
      return { success: false, message: 'Research already in progress or completed' };
    }

    setState(prev => {
      const newResearch = prev.research.map(r =>
        r.researchId === researchId ? { ...r, isActive: true, progress: 0 } : r
      );
      return {
        ...prev,
        research: newResearch,
        resources: { ...prev.resources, dna: prev.resources.dna - resData.dnaCost },
      };
    });

    return { success: true, message: `Started researching ${resData.name}` };
  }, [state]);

  const dpProgressResearch = useCallback((researchId: string): DpActionResult => {
    const existing = state.research.find(r => r.researchId === researchId);
    if (!existing || !existing.isActive || existing.isComplete) {
      return { success: false, message: 'Research not active' };
    }

    const resData = DP_RES_DATA[researchId];
    const increment = resData ? Math.floor(100 / resData.duration) + 1 : 5;
    const newProgress = dpClamp(existing.progress + increment, 0, 100);
    const isComplete = newProgress >= 100;

    if (isComplete) {
      setState(prev => {
        const newResearch = prev.research.map(r =>
          r.researchId === researchId ? { ...r, progress: 100, isComplete: true, isActive: false } : r
        );
        const updated = { ...prev, research: newResearch, researchCompleted: prev.researchCompleted + 1 };
        updated.quests = dpUpdateQuestProgress(updated);
        const newAch = dpCheckAchievements(updated);
        if (newAch.length > 0) updated.achievements = [...updated.achievements, ...newAch];
        return updated;
      });
      return { success: true, message: `Research complete: ${resData?.name ?? researchId}!`, rewards: { xp: 50 } };
    }

    setState(prev => ({
      ...prev,
      research: prev.research.map(r =>
        r.researchId === researchId ? { ...r, progress: newProgress } : r
      ),
    }));

    return { success: true, message: `Research progress: ${newProgress}%` };
  }, [state]);

  const dpBuyFood = useCallback((foodId: string, quantity: number): DpActionResult => {
    const foodData = DP_FOOD_DATA[foodId];
    if (!foodData) return { success: false, message: 'Unknown food type' };

    const totalCost = foodData.cost * quantity;
    if (state.resources.coins < totalCost) {
      return { success: false, message: `Not enough coins (need ${totalCost})` };
    }

    setState(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        coins: prev.resources.coins - totalCost,
        food: { ...prev.resources.food, [foodId]: (prev.resources.food[foodId] ?? 0) + quantity },
      },
    }));

    return { success: true, message: `Bought ${quantity}x ${foodData.name}` };
  }, [state]);

  const dpSellDino = useCallback((dinoId: string): DpActionResult => {
    const dino = state.dinosaurs.find(d => d.id === dinoId);
    if (!dino) return { success: false, message: 'Dinosaur not found' };

    const speciesInfo = DP_SPECIES_DATA[dino.speciesId];
    if (!speciesInfo) return { success: false, message: 'Species data not found' };

    const rarityMult = DP_RARITY_SELL_MULTIPLIER[dino.rarity] ?? 1;
    const levelMult = 1 + (dino.level - 1) * 0.1;
    const sellValue = Math.floor(speciesInfo.sellValue * rarityMult * levelMult);

    setState(prev => {
      const newDinos = prev.dinosaurs.filter(d => d.id !== dinoId);
      const newEnclosures = prev.enclosures.map(enc => ({
        ...enc,
        dinosaurIds: enc.dinosaurIds.filter(id => id !== dinoId),
      }));
      const updated = {
        ...prev,
        dinosaurs: newDinos,
        enclosures: newEnclosures,
        resources: { ...prev.resources, coins: prev.resources.coins + sellValue },
        totalRevenue: prev.totalRevenue + sellValue,
      };
      updated.parkRating = dpCalculateParkRating(updated);
      return updated;
    });

    return { success: true, message: `Sold ${dino.name} for ${sellValue} coins`, rewards: { coins: sellValue } };
  }, [state]);

  const dpHealDino = useCallback((dinoId: string): DpActionResult => {
    const dino = state.dinosaurs.find(d => d.id === dinoId);
    if (!dino) return { success: false, message: 'Dinosaur not found' };

    const hasMedicalBay = state.facilities.some(f => f.facilityId === DP_FAC_MEDICAL_BAY && f.isBuilt);
    if (!hasMedicalBay) {
      return { success: false, message: 'Build a Medical Bay first' };
    }

    if (dino.health >= 100) return { success: false, message: 'Dinosaur is already at full health' };

    const healCost = Math.floor((100 - dino.health) * 2);
    if (state.resources.coins < healCost) {
      return { success: false, message: `Not enough coins (need ${healCost})` };
    }

    setState(prev => ({
      ...prev,
      resources: { ...prev.resources, coins: prev.resources.coins - healCost },
      dinosaurs: prev.dinosaurs.map(d =>
        d.id === dinoId ? { ...d, health: 100, happiness: dpClamp(d.happiness + 5, 0, 100) } : d
      ),
    }));

    return { success: true, message: `Healed ${dino.name} for ${healCost} coins` };
  }, [state]);

  const dpBreedDinos = useCallback((parent1Id: string, parent2Id: string): DpActionResult => {
    if (parent1Id === parent2Id) return { success: false, message: 'Cannot breed a dinosaur with itself' };

    const parent1 = state.dinosaurs.find(d => d.id === parent1Id);
    const parent2 = state.dinosaurs.find(d => d.id === parent2Id);
    if (!parent1 || !parent2) return { success: false, message: 'One or both dinosaurs not found' };

    if (parent1.level < 5 || parent2.level < 5) {
      return { success: false, message: 'Both dinosaurs must be at least level 5' };
    }

    if (parent1.diet !== parent2.diet) {
      return { success: false, message: 'Dinosaurs must share the same diet to breed' };
    }

    const hasBreedingCenter = state.facilities.some(f => f.facilityId === DP_FAC_BREEDING_CENTER && f.isBuilt);
    if (!hasBreedingCenter) {
      return { success: false, message: 'Build a Breeding Center first' };
    }

    const emptySlot = state.breedingSlots.find(s => !s.isActive);
    if (!emptySlot) return { success: false, message: 'No breeding slots available' };

    const rng = mulberry32(state.seed);
    const childSpeciesId = rng() < 0.5 ? parent1.speciesId : parent2.speciesId;
    const newSeed = dpAdvanceSeed(state.seed, 1);

    setState(prev => ({
      ...prev,
      seed: newSeed,
      breedingSlots: prev.breedingSlots.map(s =>
        s.id === emptySlot.id
          ? { ...s, parent1Id, parent2Id, progress: 0, isActive: true, eggSpeciesId: childSpeciesId }
          : s
      ),
    }));

    return { success: true, message: 'Breeding started!' };
  }, [state]);

  const dpProgressBreeding = useCallback((slotId: string): DpActionResult => {
    const slot = state.breedingSlots.find(s => s.id === slotId);
    if (!slot || !slot.isActive || !slot.eggSpeciesId) {
      return { success: false, message: 'No active breeding in this slot' };
    }

    const hasIncubator = state.facilities.some(f => f.facilityId === DP_FAC_INCUBATOR && f.isBuilt);
    const increment = hasIncubator ? 12 : 10;
    const newProgress = dpClamp(slot.progress + increment, 0, 100);
    const isComplete = newProgress >= 100;

    if (isComplete) {
      const speciesInfo = DP_SPECIES_DATA[slot.eggSpeciesId];
      const childName = speciesInfo?.name ?? 'Unknown';

      const newDino: DpDinosaur = {
        id: dpMakeId('dino'),
        speciesId: slot.eggSpeciesId,
        name: childName,
        rarity: speciesInfo?.rarity ?? 0,
        diet: speciesInfo?.diet ?? DP_DIET_HERBIVORE,
        level: 1,
        xp: 0,
        hunger: 90,
        happiness: 80,
        health: speciesInfo?.baseHealth ?? 50,
        enclosureId: null,
        isHatchling: true,
        age: 0,
      };

      setState(prev => {
        const updated = {
          ...prev,
          dinosaurs: [...prev.dinosaurs, newDino],
          breedingSlots: prev.breedingSlots.map(s =>
            s.id === slotId
              ? { ...s, parent1Id: null, parent2Id: null, progress: 0, isActive: false, eggSpeciesId: null }
              : s
          ),
          dinosaursHatched: prev.dinosaursHatched + 1,
          dinosaursBred: prev.dinosaursBred + 1,
        };
        updated.parkRating = dpCalculateParkRating(updated);
        updated.quests = dpUpdateQuestProgress(updated);
        const newAch = dpCheckAchievements(updated);
        if (newAch.length > 0) updated.achievements = [...updated.achievements, ...newAch];
        return updated;
      });

      return { success: true, message: `Breeding complete! Hatched a ${childName}!`, rewards: { xp: 40 } };
    }

    setState(prev => ({
      ...prev,
      breedingSlots: prev.breedingSlots.map(s =>
        s.id === slotId ? { ...s, progress: newProgress } : s
      ),
    }));

    return { success: true, message: `Breeding progress: ${newProgress}%` };
  }, [state]);

  const dpExtractDNA = useCallback((fossilSiteId: string): DpActionResult => {
    const site = state.fossilSites.find(f => f.id === fossilSiteId);
    if (!site) return { success: false, message: 'Fossil site not found' };

    if (!site.isComplete) return { success: false, message: 'Fossil excavation not complete' };

    const speciesInfo = DP_SPECIES_DATA[site.speciesId];
    if (!speciesInfo) return { success: false, message: 'Species data not found' };

    const hasGeneticsLab = state.facilities.some(f => f.facilityId === DP_FAC_GENETICS_LAB && f.isBuilt);
    const dnaYield = hasGeneticsLab ? Math.floor(speciesInfo.dnaCost * 0.6) : Math.floor(speciesInfo.dnaCost * 0.4);

    const rng = mulberry32(state.seed);
    const bonusMult = 1 + rng() * 0.3;
    const totalDNA = Math.floor(dnaYield * bonusMult);
    const newSeed = dpAdvanceSeed(state.seed, 1);

    setState(prev => ({
      ...prev,
      seed: newSeed,
      resources: { ...prev.resources, dna: prev.resources.dna + totalDNA },
      fossilSites: prev.fossilSites.map(f =>
        f.id === fossilSiteId ? { ...f, isComplete: false, progress: 0 } : f
      ),
    }));

    return { success: true, message: `Extracted ${totalDNA} DNA from ${speciesInfo.name} fossil`, rewards: { dna: totalDNA } };
  }, [state]);

  const dpExcavateFossil = useCallback((fossilSiteId: string): DpActionResult => {
    if (state.daily.excavationDone) {
      return { success: false, message: 'Daily excavation already completed' };
    }

    const site = state.fossilSites.find(f => f.id === fossilSiteId);
    if (!site) return { success: false, message: 'Fossil site not found' };
    if (site.isComplete) return { success: false, message: 'Fossil already fully excavated' };

    const hasResearchLab = state.facilities.some(f => f.facilityId === DP_FAC_RESEARCH_LAB && f.isBuilt);
    const increment = hasResearchLab ? 30 : 20;
    const newProgress = dpClamp(site.progress + increment, 0, 100);
    const isComplete = newProgress >= 100;

    setState(prev => {
      const newFossilSites = prev.fossilSites.map(f =>
        f.id === fossilSiteId ? { ...f, progress: newProgress, isComplete } : f
      );
      const updated = {
        ...prev,
        fossilSites: newFossilSites,
        daily: { ...prev.daily, excavationDone: isComplete },
        excavationsCompleted: isComplete ? prev.excavationsCompleted + 1 : prev.excavationsCompleted,
        dailyTasksTotal: isComplete ? prev.dailyTasksTotal + 1 : prev.dailyTasksTotal,
      };
      updated.quests = dpUpdateQuestProgress(updated);
      const newAch = dpCheckAchievements(updated);
      if (newAch.length > 0) updated.achievements = [...updated.achievements, ...newAch];
      return updated;
    });

    return { success: true, message: isComplete ? 'Excavation complete!' : `Excavation progress: ${newProgress}%` };
  }, [state]);

  const dpRefreshFossilSites = useCallback((): DpActionResult => {
    const rng = mulberry32(state.seed);
    const fossilSpeciesPool = DP_ALL_SPECIES_IDS.filter(sid => {
      const info = DP_SPECIES_DATA[sid];
      return info && info.rarity >= DP_RARITY_UNCOMMON;
    });
    const newSites: DpFossilSite[] = [];
    for (let i = 0; i < 4; i++) {
      const idx = Math.floor(rng() * fossilSpeciesPool.length);
      newSites.push({
        id: dpMakeId('fossil'),
        speciesId: fossilSpeciesPool[idx] ?? DP_SPECIES_TRICERATOPS,
        progress: 0,
        isComplete: false,
      });
    }

    setState(prev => ({
      ...prev,
      seed: dpAdvanceSeed(prev.seed, 4),
      fossilSites: newSites,
      daily: { ...prev.daily, day: prev.daily.day + 1, excavationDone: false, rushHourDone: false, visitorsToday: 0, revenueToday: 0 },
    }));

    return { success: true, message: 'New day! Fossil sites refreshed.' };
  }, [state]);

  const dpTriggerRushHour = useCallback((): DpActionResult => {
    if (state.daily.rushHourDone) {
      return { success: false, message: 'Rush hour already triggered today' };
    }

    const normalVisitors = dpCalculateVisitorCount(state);
    const rushVisitors = Math.floor(normalVisitors * DP_RUSH_HOUR_MULT);
    const rushRevenue = Math.floor(rushVisitors * 3.5);

    setState(prev => {
      const updated = {
        ...prev,
        daily: {
          ...prev.daily,
          rushHourDone: true,
          visitorsToday: prev.daily.visitorsToday + rushVisitors,
          revenueToday: prev.daily.revenueToday + rushRevenue,
        },
        totalVisitors: prev.totalVisitors + rushVisitors,
        totalRevenue: prev.totalRevenue + rushRevenue,
        resources: { ...prev.resources, coins: prev.resources.coins + rushRevenue },
      };
      updated.quests = dpUpdateQuestProgress(updated);
      const newAch = dpCheckAchievements(updated);
      if (newAch.length > 0) updated.achievements = [...updated.achievements, ...newAch];
      return updated;
    });

    return { success: true, message: `Rush hour! ${rushVisitors} visitors earned ${rushRevenue} coins`, rewards: { coins: rushRevenue } };
  }, [state]);

  const dpCollectRevenue = useCallback((): DpActionResult => {
    const visitors = dpCalculateVisitorCount(state);
    const revenue = dpCalculateDailyRevenue(state);

    setState(prev => {
      const maintenance = dpCalculateMaintenanceCost(prev);
      const netRevenue = revenue - maintenance;
      const updated = {
        ...prev,
        daily: {
          ...prev.daily,
          visitorsToday: prev.daily.visitorsToday + visitors,
          revenueToday: prev.daily.revenueToday + netRevenue,
        },
        totalVisitors: prev.totalVisitors + visitors,
        totalRevenue: prev.totalRevenue + Math.max(0, netRevenue),
        resources: {
          ...prev.resources,
          coins: prev.resources.coins + Math.max(0, netRevenue),
        },
      };
      updated.quests = dpUpdateQuestProgress(updated);
      const newAch = dpCheckAchievements(updated);
      if (newAch.length > 0) updated.achievements = [...updated.achievements, ...newAch];
      return updated;
    });

    const maintenance = dpCalculateMaintenanceCost(state);
    const netRevenue = revenue - maintenance;
    return { success: true, message: `Collected ${revenue} coins (maintenance: -${maintenance}, net: ${netRevenue})`, rewards: { coins: Math.max(0, netRevenue) } };
  }, [state]);

  const dpAcceptQuest = useCallback((questId: string): DpActionResult => {
    const questData = DP_QUEST_DATA[questId];
    if (!questData) return { success: false, message: 'Unknown quest' };

    if (state.level < questData.unlockLevel) {
      return { success: false, message: `Requires level ${questData.unlockLevel}` };
    }

    const questState = state.quests.find(q => q.questId === questId);
    if (!questState) return { success: false, message: 'Quest not found' };

    if (questState.status !== 'available') {
      return { success: false, message: 'Quest is not available' };
    }

    setState(prev => ({
      ...prev,
      quests: prev.quests.map(q =>
        q.questId === questId ? { ...q, status: 'active' as const } : q
      ),
    }));

    return { success: true, message: `Accepted quest: ${questData.name}` };
  }, [state]);

  const dpClaimQuestReward = useCallback((questId: string): DpActionResult => {
    const questState = state.quests.find(q => q.questId === questId);
    if (!questState || questState.status !== 'completed') {
      return { success: false, message: 'Quest not completed yet' };
    }

    const questData = DP_QUEST_DATA[questId];
    if (!questData) return { success: false, message: 'Quest data not found' };

    setState(prev => ({
      ...prev,
      quests: prev.quests.map(q =>
        q.questId === questId ? { ...q, status: 'completed' as const } : q
      ),
      resources: {
        ...prev.resources,
        coins: prev.resources.coins + questData.reward.coins,
        dna: prev.resources.dna + questData.reward.dna,
      },
    }));

    // The XP from quest reward
    const xpReward = questData.reward.xp;
    // Use dpAddXP logic inline since we cannot call useCallback from useCallback deps
    let newLevel = state.level;
    let newXP = state.xp + xpReward;
    while (newLevel < 50 && newXP >= (DP_LEVEL_XP[newLevel] ?? 99999)) {
      newXP -= DP_LEVEL_XP[newLevel] ?? 99999;
      newLevel += 1;
    }
    if (newLevel > 50) { newLevel = 50; newXP = 0; }

    setState(prev => {
      const updated = { ...prev, level: newLevel, xp: newXP };
      updated.parkRating = dpCalculateParkRating(updated);
      return updated;
    });

    return { success: true, message: `Claimed rewards: ${questData.reward.coins} coins, ${xpReward} XP, ${questData.reward.dna} DNA`, rewards: { coins: questData.reward.coins, xp: xpReward, dna: questData.reward.dna } };
  }, [state]);

  const dpTalkToNpc = useCallback((npcId: string): { success: boolean; message: string; dialogue: string } => {
    const npcState = state.npcs.find(n => n.npcId === npcId);
    if (!npcState) return { success: false, message: 'NPC not found', dialogue: '' };

    const npcData = DP_NPC_DATA[npcId];
    if (!npcData) return { success: false, message: 'NPC data not found', dialogue: '' };

    const dialogue = npcData.dialogues[npcState.dialogueIndex % npcData.dialogues.length];
    const affinityGain = 10;
    const newAffinity = dpClamp(npcState.affinity + affinityGain, 0, 100);
    const newIndex = (npcState.dialogueIndex + 1) % npcData.dialogues.length;

    setState(prev => {
      const updated = {
        ...prev,
        npcs: prev.npcs.map(n =>
          n.npcId === npcId ? { ...n, affinity: newAffinity, dialogueIndex: newIndex, hasMet: true } : n
        ),
      };
      updated.quests = dpUpdateQuestProgress(updated);
      return updated;
    });

    return {
      success: true,
      message: `Talked to ${npcData.name} (${npcData.title}). Affinity: ${newAffinity}/100`,
      dialogue: `${npcData.name}: "${dialogue}"`,
    };
  }, [state]);

  const dpUpgradeEnclosure = useCallback((enclosureId: string): DpActionResult => {
    const enclosure = state.enclosures.find(e => e.id === enclosureId);
    if (!enclosure) return { success: false, message: 'Enclosure not found' };

    if (enclosure.condition >= 100) return { success: false, message: 'Enclosure already at max condition' };

    const repairCost = Math.floor((100 - enclosure.condition) * 5);
    if (state.resources.coins < repairCost) {
      return { success: false, message: `Not enough coins (need ${repairCost})` };
    }

    setState(prev => {
      const newEnclosures = prev.enclosures.map(e =>
        e.id === enclosureId ? { ...e, condition: 100 } : e
      );
      const updated = { ...prev, enclosures: newEnclosures, resources: { ...prev.resources, coins: prev.resources.coins - repairCost } };
      updated.parkRating = dpCalculateParkRating(updated);
      updated.quests = dpUpdateQuestProgress(updated);
      const newAch = dpCheckAchievements(updated);
      if (newAch.length > 0) updated.achievements = [...updated.achievements, ...newAch];
      return updated;
    });

    return { success: true, message: `Repaired ${enclosure.name} to full condition for ${repairCost} coins` };
  }, [state]);

  const dpAddEnclosure = useCallback((zoneId: string): DpActionResult => {
    const zoneData = DP_ZONE_DATA[zoneId];
    if (!zoneData) return { success: false, message: 'Unknown zone' };

    if (state.level < zoneData.unlockLevel) {
      return { success: false, message: `Requires level ${zoneData.unlockLevel}` };
    }

    const buildCost = zoneData.maintenanceCost * 10;
    if (state.resources.coins < buildCost) {
      return { success: false, message: `Not enough coins (need ${buildCost})` };
    }

    const existingZones = state.enclosures.map(e => e.zoneId);
    const countForZone = existingZones.filter(z => z === zoneId).length;
    if (countForZone >= 2) {
      return { success: false, message: 'Maximum 2 enclosures per zone' };
    }

    const newEnclosure: DpEnclosure = {
      id: dpMakeId('enc'),
      zoneId,
      name: `${zoneData.name} ${countForZone + 1}`,
      dinosaurIds: [],
      capacity: zoneData.capacity,
      condition: 100,
    };

    setState(prev => ({
      ...prev,
      enclosures: [...prev.enclosures, newEnclosure],
      resources: { ...prev.resources, coins: prev.resources.coins - buildCost },
    }));

    return { success: true, message: `Built new ${zoneData.name} enclosure for ${buildCost} coins` };
  }, [state]);

  const dpLevelUpDino = useCallback((dinoId: string): DpActionResult => {
    const dino = state.dinosaurs.find(d => d.id === dinoId);
    if (!dino) return { success: false, message: 'Dinosaur not found' };

    const xpNeeded = dino.level * 50;
    if (dino.xp < xpNeeded) {
      return { success: false, message: `Not enough XP (need ${xpNeeded}, have ${dino.xp})` };
    }

    const newLevel = dino.level + 1;
    const newXP = dino.xp - xpNeeded;

    setState(prev => ({
      ...prev,
      dinosaurs: prev.dinosaurs.map(d =>
        d.id === dinoId
          ? {
              ...d,
              level: newLevel,
              xp: newXP,
              health: d.health + 10,
              hunger: dpClamp(d.hunger, 0, 100),
              happiness: dpClamp(d.happiness + 3, 0, 100),
              isHatchling: newLevel >= 3 ? false : d.isHatchling,
            }
          : d
      ),
    }));

    return { success: true, message: `${dino.name} reached level ${newLevel}!` };
  }, [state]);

  const dpRenameDino = useCallback((dinoId: string, newName: string): DpActionResult => {
    const dino = state.dinosaurs.find(d => d.id === dinoId);
    if (!dino) return { success: false, message: 'Dinosaur not found' };

    if (newName.length < 1 || newName.length > 30) {
      return { success: false, message: 'Name must be 1-30 characters' };
    }

    setState(prev => ({
      ...prev,
      dinosaurs: prev.dinosaurs.map(d =>
        d.id === dinoId ? { ...d, name: newName } : d
      ),
    }));

    return { success: true, message: `Renamed dinosaur to "${newName}"` };
  }, [state]);

  const dpGiveDinoXP = useCallback((dinoId: string, amount: number): DpActionResult => {
    const dino = state.dinosaurs.find(d => d.id === dinoId);
    if (!dino) return { success: false, message: 'Dinosaur not found' };

    setState(prev => ({
      ...prev,
      dinosaurs: prev.dinosaurs.map(d =>
        d.id === dinoId ? { ...d, xp: d.xp + amount } : d
      ),
    }));

    return { success: true, message: `${dino.name} gained ${amount} XP` };
  }, [state]);

  const dpTickHunger = useCallback((): DpActionResult => {
    setState(prev => ({
      ...prev,
      dinosaurs: prev.dinosaurs.map(d => ({
        ...d,
        hunger: dpClamp(d.hunger - 3, 0, 100),
        happiness: d.hunger > 20 ? dpClamp(d.happiness - 1, 0, 100) : dpClamp(d.happiness - 5, 0, 100),
        health: d.hunger <= 0 ? dpClamp(d.health - 5, 0, (DP_SPECIES_DATA[d.speciesId]?.baseHealth ?? 100)) : d.health,
      })),
    }));

    return { success: true, message: 'Hunger ticked. Dinosaurs are getting hungrier.' };
  }, [state]);

  const dpTickAge = useCallback((): DpActionResult => {
    setState(prev => ({
      ...prev,
      dinosaurs: prev.dinosaurs.map(d => ({
        ...d,
        age: d.age + 1,
        isHatchling: d.age >= 3 ? false : d.isHatchling,
      })),
    }));

    return { success: true, message: 'Dinosaurs aged by 1 day.' };
  }, [state]);

  const dpTickEnclosureCondition = useCallback((): DpActionResult => {
    setState(prev => {
      const newEnclosures = prev.enclosures.map(e => ({
        ...e,
        condition: dpClamp(e.condition - 2, 0, 100),
      }));
      const updated = { ...prev, enclosures: newEnclosures };
      updated.parkRating = dpCalculateParkRating(updated);
      return updated;
    });

    return { success: true, message: 'Enclosure conditions deteriorated slightly.' };
  }, [state]);

  // Plain function calling multiple useCallback functions
  function dpTickAll(): DpActionResult[] {
    const hungerResult = dpTickHunger();
    const ageResult = dpTickAge();
    const condResult = dpTickEnclosureCondition();
    return [hungerResult, ageResult, condResult];
  }

  const dpGetUnlockedTitles = useCallback((): string[] => {
    const unlocked: string[] = [];
    for (const title of DP_TITLES) {
      if (state.level >= DP_TITLE_LEVEL_MAP[title]) {
        unlocked.push(title);
      }
    }
    return unlocked;
  }, [state]);

  const dpGetSpeciesInfo = useCallback((speciesId: string) => {
    return DP_SPECIES_DATA[speciesId] ?? null;
  }, [state]);

  const dpGetZoneInfo = useCallback((zoneId: string) => {
    return DP_ZONE_DATA[zoneId] ?? null;
  }, [state]);

  const dpGetFacilityInfo = useCallback((facilityId: string) => {
    return DP_FAC_DATA[facilityId] ?? null;
  }, [state]);

  const dpGetResearchInfo = useCallback((researchId: string) => {
    return DP_RES_DATA[researchId] ?? null;
  }, [state]);

  const dpGetQuestInfo = useCallback((questId: string) => {
    return DP_QUEST_DATA[questId] ?? null;
  }, [state]);

  const dpGetNpcInfo = useCallback((npcId: string) => {
    return DP_NPC_DATA[npcId] ?? null;
  }, [state]);

  const dpGetFoodInfo = useCallback((foodId: string) => {
    return DP_FOOD_DATA[foodId] ?? null;
  }, [state]);

  const dpGetAchievementInfo = useCallback((achievementId: string) => {
    return DP_ACH_DATA[achievementId] ?? null;
  }, [state]);

  const dpSpendCoins = useCallback((amount: number): DpActionResult => {
    if (state.resources.coins < amount) {
      return { success: false, message: `Not enough coins (have ${state.resources.coins}, need ${amount})` };
    }

    setState(prev => ({
      ...prev,
      resources: { ...prev.resources, coins: prev.resources.coins - amount },
    }));

    return { success: true, message: `Spent ${amount} coins` };
  }, [state]);

  const dpGrantCoins = useCallback((amount: number): DpActionResult => {
    setState(prev => ({
      ...prev,
      resources: { ...prev.resources, coins: prev.resources.coins + amount },
      totalRevenue: prev.totalRevenue + amount,
    }));

    return { success: true, message: `Granted ${amount} coins` };
  }, [state]);

  const dpGrantDNA = useCallback((amount: number): DpActionResult => {
    setState(prev => ({
      ...prev,
      resources: { ...prev.resources, dna: prev.resources.dna + amount },
    }));

    return { success: true, message: `Granted ${amount} DNA` };
  }, [state]);

  const dpGrantFood = useCallback((foodId: string, amount: number): DpActionResult => {
    setState(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        food: { ...prev.resources.food, [foodId]: (prev.resources.food[foodId] ?? 0) + amount },
      },
    }));

    return { success: true, message: `Granted ${amount} ${DP_FOOD_DATA[foodId]?.name ?? foodId}` };
  }, [state]);

  // Plain function that calls a useCallback function
  function dpRandomHatch(): DpActionResult {
    const rng = mulberry32(state.seed);
    const roll = Math.floor(rng() * DP_ALL_SPECIES_IDS.length);
    const speciesId = DP_ALL_SPECIES_IDS[roll] ?? DP_SPECIES_PARASAUROLOPHUS;
    return dpHatchEgg(speciesId);
  }

  const dpGetSpeciesByRarity = useCallback((rarity: number): string[] => {
    return DP_ALL_SPECIES_IDS.filter(sid => {
      const info = DP_SPECIES_DATA[sid];
      return info && info.rarity === rarity;
    });
  }, [state]);

  const dpGetCompatibleSpecies = useCallback((zoneId: string): string[] => {
    return DP_ALL_SPECIES_IDS.filter(sid => {
      const info = DP_SPECIES_DATA[sid];
      return info && info.compatibleZones.includes(zoneId);
    });
  }, [state]);

  const dpGetDinosaursByEnclosure = useCallback((enclosureId: string): DpDinosaur[] => {
    const enclosure = state.enclosures.find(e => e.id === enclosureId);
    if (!enclosure) return [];
    return enclosure.dinosaurIds
      .map(id => state.dinosaurs.find(d => d.id === id))
      .filter((d): d is DpDinosaur => d !== undefined);
  }, [state]);

  const dpGetDinosaursByRarity = useCallback((rarity: number): DpDinosaur[] => {
    return state.dinosaurs.filter(d => d.rarity === rarity);
  }, [state]);

  const dpGetDinosaursByDiet = useCallback((diet: string): DpDinosaur[] => {
    return state.dinosaurs.filter(d => d.diet === diet);
  }, [state]);

  const dpGetSpeciesOwnershipCount = useCallback((): Record<string, number> => {
    const counts: Record<string, number> = {};
    for (const dino of state.dinosaurs) {
      counts[dino.speciesId] = (counts[dino.speciesId] ?? 0) + 1;
    }
    return counts;
  }, [state]);

  const dpResetPark = (): DpActionResult => {
    setState(createInitialState(initialSeed));
    return { success: true, message: 'Park has been reset to initial state.' };
  };

  return {
    // State getters
    dpGetState,
    dpGetDinosaurs,
    dpGetDinosaur,
    dpGetEnclosures,
    dpGetResources,
    dpGetRating,
    dpGetLevel,
    dpGetTitle,
    dpGetVisitorCount,
    dpGetDailyRevenue,
    dpGetMaintenanceCost,
    dpGetFossilSites,
    dpGetBreedingSlots,
    dpGetAchievements,
    dpGetNpcList,
    dpGetQuests,
    dpGetResearch,
    dpGetFacilities,
    dpGetDaily,
    dpGetUnlockedTitles,
    // Data lookups
    dpGetSpeciesInfo,
    dpGetZoneInfo,
    dpGetFacilityInfo,
    dpGetResearchInfo,
    dpGetQuestInfo,
    dpGetNpcInfo,
    dpGetFoodInfo,
    dpGetAchievementInfo,
    // Dinosaur actions
    dpHatchEgg,
    dpFeedDino,
    dpFeedAll,
    dpAssignToEnclosure,
    dpRemoveFromEnclosure,
    dpSellDino,
    dpHealDino,
    dpLevelUpDino,
    dpRenameDino,
    dpGiveDinoXP,
    dpRandomHatch,
    // Dinosaur queries
    dpGetSpeciesByRarity,
    dpGetCompatibleSpecies,
    dpGetDinosaursByEnclosure,
    dpGetDinosaursByRarity,
    dpGetDinosaursByDiet,
    dpGetSpeciesOwnershipCount,
    // Facility actions
    dpBuildFacility,
    dpUpgradeFacility,
    // Enclosure actions
    dpAddEnclosure,
    dpUpgradeEnclosure,
    // Research actions
    dpStartResearch,
    dpProgressResearch,
    // Breeding actions
    dpBreedDinos,
    dpProgressBreeding,
    // Fossil actions
    dpExtractDNA,
    dpExcavateFossil,
    dpRefreshFossilSites,
    // Tourism & revenue
    dpTriggerRushHour,
    dpCollectRevenue,
    // Quest actions
    dpAcceptQuest,
    dpClaimQuestReward,
    // NPC actions
    dpTalkToNpc,
    // Resource actions
    dpBuyFood,
    dpSpendCoins,
    dpGrantCoins,
    dpGrantDNA,
    dpGrantFood,
    // Progression
    dpAddXP,
    // Simulation ticks
    dpTickHunger,
    dpTickAge,
    dpTickEnclosureCondition,
    dpTickAll,
    // Reset
    dpResetPark,
  };
}
