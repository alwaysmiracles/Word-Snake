// Seasonal Word Packs system for Word Snake
// Time-limited packs that activate based on the current month
import type { WordPack } from '@/lib/word-packs'

export interface SeasonalPack extends WordPack {
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  monthStart: number  // 1-12, starting month (inclusive)
  monthEnd: number    // 1-12, ending month (inclusive)
  yearRestriction?: number  // if set, only available in that year
}

// ─── Seasonal Packs ──────────────────────────────────────────

export const SEASONAL_PACKS: SeasonalPack[] = [
  // Spring Bloom (March–May)
  {
    id: 'spring_bloom',
    name: 'Spring Bloom',
    emoji: '🌸',
    description: 'Fresh blooms and gentle breezes of spring',
    season: 'spring',
    monthStart: 3,
    monthEnd: 5,
    unlockType: 'free',
    color: '#f472b6',
    bgColor: 'from-pink-800/40 to-green-800/40',
    words: [
      { word: 'Blossom', category: 'spring_nature', points: 10, definition: 'A flower or cluster of flowers on a tree or plant' },
      { word: 'Petal', category: 'spring_nature', points: 10, definition: 'Each of the segments of the corolla of a flower' },
      { word: 'Sprout', category: 'spring_nature', points: 10, definition: 'A shoot of a plant, newly emerged from the soil' },
      { word: 'Rainbow', category: 'spring_nature', points: 12, definition: 'An arch of colors visible in the sky after rain' },
      { word: 'Meadow', category: 'spring_nature', points: 12, definition: 'A piece of grassland, especially near a river' },
      { word: 'Breeze', category: 'spring_nature', points: 10, definition: 'A gentle wind' },
      { word: 'Pollen', category: 'spring_nature', points: 14, definition: 'A fine powder produced by flowers for reproduction' },
      { word: 'Canary', category: 'spring_nature', points: 14, definition: 'A small yellow songbird' },
      { word: 'Tulip', category: 'spring_nature', points: 16, definition: 'A bulbous spring-flowering plant with brightly colored cup-shaped flowers' },
      { word: 'Daffodil', category: 'spring_nature', points: 16, definition: 'A yellow spring-blooming flower with a trumpet-shaped center' },
    ],
  },

  // Summer Solstice (June–August)
  {
    id: 'summer_solstice',
    name: 'Summer Solstice',
    emoji: '☀️',
    description: 'Sun-soaked days and warm tropical vibes',
    season: 'summer',
    monthStart: 6,
    monthEnd: 8,
    unlockType: 'free',
    color: '#facc15',
    bgColor: 'from-yellow-800/40 to-orange-800/40',
    words: [
      { word: 'Sunflower', category: 'summer_vibes', points: 12, definition: 'A tall plant with a large yellow flower head that turns toward the sun' },
      { word: 'Mermaid', category: 'summer_vibes', points: 16, definition: 'A legendary sea creature with the upper body of a woman and a fish tail' },
      { word: 'Firefly', category: 'summer_vibes', points: 14, definition: 'A winged beetle that produces light at night' },
      { word: 'Lagoon', category: 'summer_vibes', points: 14, definition: 'A shallow body of water separated from a larger body by a reef or barrier' },
      { word: 'Tropical', category: 'summer_vibes', points: 14, definition: 'Relating to the hot and humid regions near the equator' },
      { word: 'Sunset', category: 'summer_vibes', points: 10, definition: 'The daily disappearance of the sun below the western horizon' },
      { word: 'Carnival', category: 'summer_vibes', points: 16, definition: 'A festive season with parades, costumes, and public celebration' },
      { word: 'Hammock', category: 'summer_vibes', points: 16, definition: 'A sling of fabric hung between two points for resting' },
      { word: 'Mango', category: 'summer_vibes', points: 10, definition: 'A sweet tropical fruit with smooth yellow-orange skin' },
      { word: 'Horizon', category: 'summer_vibes', points: 12, definition: 'The line where the earth seems to meet the sky' },
    ],
  },

  // Autumn Harvest (September–November)
  {
    id: 'autumn_harvest',
    name: 'Autumn Harvest',
    emoji: '🍂',
    description: 'Golden leaves, warm spices, and bountiful harvests',
    season: 'autumn',
    monthStart: 9,
    monthEnd: 11,
    unlockType: 'free',
    color: '#fb923c',
    bgColor: 'from-orange-800/40 to-amber-900/40',
    words: [
      { word: 'Harvest', category: 'autumn_nature', points: 12, definition: 'The process of gathering in crops' },
      { word: 'Pumpkin', category: 'autumn_nature', points: 14, definition: 'A large round orange fruit used as food and for decoration' },
      { word: 'Cinnamon', category: 'autumn_nature', points: 16, definition: 'An aromatic spice obtained from the bark of a tropical tree' },
      { word: 'Maple', category: 'autumn_nature', points: 10, definition: 'A tree known for its lobed leaves and winged fruits' },
      { word: 'Chestnut', category: 'autumn_nature', points: 14, definition: 'An edible nut enclosed in a prickly case' },
      { word: 'Amber', category: 'autumn_nature', points: 12, definition: 'Hard translucent fossilized resin, typically yellow-orange' },
      { word: 'Foliage', category: 'autumn_nature', points: 16, definition: 'Leaves on a tree or plant, collectively' },
      { word: 'Misty', category: 'autumn_nature', points: 10, definition: 'Full of, surrounded by, or covered in mist' },
      { word: 'Orchard', category: 'autumn_nature', points: 14, definition: 'A piece of land planted with fruit trees' },
      { word: 'Squirrel', category: 'autumn_nature', points: 12, definition: 'A small rodent with a bushy tail that stores nuts for winter' },
    ],
  },

  // Winter Frost (December–February)
  {
    id: 'winter_frost',
    name: 'Winter Frost',
    emoji: '❄️',
    description: 'Snowy wonderlands and cozy fireside warmth',
    season: 'winter',
    monthStart: 12,
    monthEnd: 2,
    unlockType: 'free',
    color: '#7dd3fc',
    bgColor: 'from-sky-800/40 to-blue-900/40',
    words: [
      { word: 'Snowflake', category: 'winter_wonder', points: 12, definition: 'An ice crystal that falls as snow, each uniquely shaped' },
      { word: 'Blizzard', category: 'winter_wonder', points: 16, definition: 'A severe snowstorm with high winds and low visibility' },
      { word: 'Icicle', category: 'winter_wonder', points: 14, definition: 'A spike of ice formed by dripping water' },
      { word: 'Fireplace', category: 'winter_wonder', points: 14, definition: 'An opening in a chimney for a domestic fire' },
      { word: 'Cocoa', category: 'winter_wonder', points: 10, definition: 'A warm chocolate drink made from roasted cacao beans' },
      { word: 'Pinecone', category: 'winter_wonder', points: 14, definition: 'The woody cone of a pine tree that bears seeds' },
      { word: 'Cardinal', category: 'winter_wonder', points: 12, definition: 'A bright red North American songbird' },
      { word: 'Aurora', category: 'winter_wonder', points: 16, definition: 'A natural display of colorful lights in the polar sky' },
      { word: 'Solstice', category: 'winter_wonder', points: 16, definition: 'Either of the two times of year when the sun is farthest from the equator' },
      { word: 'Velvet', category: 'winter_wonder', points: 12, definition: 'A closely woven fabric with a thick short pile on one side' },
    ],
  },
]

// ─── Category display info for seasonal categories ────────────

export const SEASONAL_CATEGORY_INFO: Record<string, { label: string; color: string; emoji: string }> = {
  spring_nature: { label: 'Spring Nature', color: '#f472b6', emoji: '🌸' },
  summer_vibes:  { label: 'Summer Vibes',  color: '#facc15', emoji: '☀️' },
  autumn_nature: { label: 'Autumn Nature', color: '#fb923c', emoji: '🍂' },
  winter_wonder: { label: 'Winter Wonder', color: '#7dd3fc', emoji: '❄️' },
}

// ─── Helper functions ─────────────────────────────────────────

/** Check if the current month falls within a pack's date range */
export function isSeasonalPackActive(pack: SeasonalPack): boolean {
  const now = new Date()
  const currentMonth = now.getMonth() + 1 // 1–12
  const currentYear = now.getFullYear()

  // Check year restriction if present
  if (pack.yearRestriction !== undefined && currentYear !== pack.yearRestriction) {
    return false
  }

  // Handle ranges that wrap around the year (e.g., December–February)
  if (pack.monthStart <= pack.monthEnd) {
    return currentMonth >= pack.monthStart && currentMonth <= pack.monthEnd
  } else {
    // Wrapping range: e.g., 12–2 means Dec, Jan, Feb
    return currentMonth >= pack.monthStart || currentMonth <= pack.monthEnd
  }
}

/** Get all seasonal packs that are currently active */
export function getActiveSeasonalPacks(): SeasonalPack[] {
  return SEASONAL_PACKS.filter((pack) => isSeasonalPackActive(pack))
}

/** Look up a seasonal pack by its ID */
export function getSeasonalPackById(id: string): SeasonalPack | undefined {
  return SEASONAL_PACKS.find((pack) => pack.id === id)
}
