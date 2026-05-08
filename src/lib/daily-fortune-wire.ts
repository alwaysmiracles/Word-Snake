// =============================================================================
// Daily Fortune System Wire — Word Snake Game (单词贪吃蛇)
// =============================================================================
// Fortune cookies, lucky numbers/words, horoscope, wisdom, tarot, runes,
// fortune score, streaks, achievements, and full UI helper data.
// Persistence via Zustand persist middleware under key "ws_daily_fortune".
// =============================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FortuneCategory = 'Motivation' | 'Wisdom' | 'Humor' | 'Mystery' | 'Prosperity'
export type FortuneRarity = 'Common' | 'Uncommon' | 'Rare' | 'Legendary'
export type FortuneMood = 'amazing' | 'great' | 'good' | 'neutral' | 'challenging' | 'difficult'

export interface FortuneCookie {
  id: string
  message: string
  category: FortuneCategory
  luckScore: number
  emoji: string
  rarity: FortuneRarity
  effect?: FortuneEffect
}

export interface FortuneEffect {
  type: 'score_multiplier' | 'extra_life' | 'coin_bonus' | 'speed_boost' | 'word_hint' | 'shield'
  value: number
  description: string
  durationMinutes: number
}

export interface HoroscopeReading {
  sign: string
  date: string
  overallLuck: number
  loveLuck: number
  gameLuck: number
  wordLuck: number
  advice: string
  luckyColor: string
  luckyTime: string
}

export interface WisdomEntry {
  id: string
  quote: string
  author: string
  category: string
  depth: number
}

export interface TarotCard {
  id: number
  name: string
  emoji: string
  uprightMeaning: string
  reversedMeaning: string
  element: string
  numerology: string
}

export interface TarotReading {
  date: string
  past: TarotCard
  present: TarotCard
  future: TarotCard
  pastReversed: boolean
  presentReversed: boolean
  futureReversed: boolean
  interpretation: string
}

export interface RuneInfo {
  id: number
  name: string
  emoji: string
  meaning: string
  element: string
  energyType: string
}

export interface RuneReading {
  date: string
  situation: RuneInfo
  action: RuneInfo
  outcome: RuneInfo
  interpretation: string
}

export interface ZodiacSign {
  name: string
  emoji: string
  element: 'Fire' | 'Earth' | 'Air' | 'Water'
  traits: string[]
  dates: string
}

export interface DailyFortuneActions {
  crackCookie: () => FortuneCookie
  generateLuckyNumbers: () => number[]
  generateLuckyWords: () => string[]
  selectZodiacSign: (sign: string) => boolean
  getTodayReading: () => HoroscopeReading | null
  drawDailyTarot: () => TarotReading
  castRunes: () => RuneReading
  shareWisdom: (id: string) => string | null
  resetFortuneData: () => void
}

export interface DailyFortuneState extends DailyFortuneActions {
  todayFortune: FortuneCookie | null
  fortuneHistory: FortuneCookie[]
  fortuneStreak: number
  luckyNumbers: number[]
  luckyWords: string[]
  zodiacSign: string | null
  horoscope: HoroscopeReading | null
  horoscopeHistory: HoroscopeReading[]
  dailyWisdom: WisdomEntry | null
  wisdomCollection: WisdomEntry[]
  dailyTarot: TarotReading | null
  tarotHistory: TarotReading[]
  dailyRunes: RuneReading | null
  runeCollection: string[]
  fortuneScore: number
  luckMultiplier: number
  fortuneMood: FortuneMood
  totalFortunes: number
  perfectDays: number
  streakRecord: number
  fortuneAchievements: string[]
  lastFortuneDate: string
  lastHoroscopeDate: string
}

// ---------------------------------------------------------------------------
// Constants — Fortune Cookies (54)
// ---------------------------------------------------------------------------

const FORTUNE_COOKIES: Omit<FortuneCookie, 'id'>[] = [
  // Motivation — 12
  { message: "Every expert was once a beginner. Keep eating words!", category: "Motivation", luckScore: 6, emoji: "🌟", rarity: "Common" },
  { message: "Your next game will be your best game.", category: "Motivation", luckScore: 7, emoji: "💪", rarity: "Common" },
  { message: "The snake that persists catches the longest words.", category: "Motivation", luckScore: 6, emoji: "🐍", rarity: "Common" },
  { message: "Believe in your vocabulary — it's bigger than you think!", category: "Motivation", luckScore: 5, emoji: "✨", rarity: "Common" },
  { message: "Today is the perfect day to break your high score.", category: "Motivation", luckScore: 8, emoji: "🏆", rarity: "Uncommon" },
  { message: "Persistence turns small words into big achievements.", category: "Motivation", luckScore: 6, emoji: "🔥", rarity: "Common" },
  { message: "Your luck is charging up — fortune favors the brave!", category: "Motivation", luckScore: 7, emoji: "⚡", rarity: "Common" },
  { message: "Great words await those who never give up.", category: "Motivation", luckScore: 5, emoji: "🌈", rarity: "Common" },
  { message: "A champion is made one word at a time.", category: "Motivation", luckScore: 6, emoji: "🥇", rarity: "Common" },
  { message: "The universe is aligning your letters for victory!", category: "Motivation", luckScore: 9, emoji: "💫", rarity: "Rare" },
  { message: "Your determination today will echo in your scores.", category: "Motivation", luckScore: 7, emoji: "🎯", rarity: "Common" },
  { message: "Stars have aligned — this is YOUR golden hour!", category: "Motivation", luckScore: 10, emoji: "⭐", rarity: "Legendary" },
  // Wisdom — 11
  { message: "The shortest word can sometimes carry the most points.", category: "Wisdom", luckScore: 5, emoji: "📚", rarity: "Common" },
  { message: "A wise snake knows when to speed up and when to slow down.", category: "Wisdom", luckScore: 7, emoji: "🦉", rarity: "Uncommon" },
  { message: "Words have power — choose them wisely on the grid.", category: "Wisdom", luckScore: 6, emoji: "🎭", rarity: "Common" },
  { message: "The best strategy is to enjoy the journey, not just the score.", category: "Wisdom", luckScore: 5, emoji: "🍃", rarity: "Common" },
  { message: "Patience in the early game brings rewards in the late game.", category: "Wisdom", luckScore: 7, emoji: "⏳", rarity: "Uncommon" },
  { message: "Even a 3-letter word can change the course of a game.", category: "Wisdom", luckScore: 5, emoji: "💡", rarity: "Common" },
  { message: "Collect knowledge like you collect words — one at a time.", category: "Wisdom", luckScore: 6, emoji: "📖", rarity: "Common" },
  { message: "The dictionary holds infinite possibilities. So do you.", category: "Wisdom", luckScore: 8, emoji: "🗝️", rarity: "Uncommon" },
  { message: "Every wrong turn teaches a new path forward.", category: "Wisdom", luckScore: 6, emoji: "🧭", rarity: "Common" },
  { message: "True mastery comes from playing, not planning.", category: "Wisdom", luckScore: 7, emoji: "🖌️", rarity: "Uncommon" },
  { message: "Ancient wisdom flows through your fingertips today.", category: "Wisdom", luckScore: 9, emoji: "🔮", rarity: "Rare" },
  // Humor — 12
  { message: "Why did the snake cross the grid? To eat the alphabet!", category: "Humor", luckScore: 4, emoji: "😂", rarity: "Common" },
  { message: "Your luck is like a cat — unpredictable but entertaining.", category: "Humor", luckScore: 5, emoji: "🐱", rarity: "Common" },
  { message: "Error 404: Bad luck not found. You're doing great!", category: "Humor", luckScore: 6, emoji: "🤖", rarity: "Common" },
  { message: "Today's forecast: 100% chance of word-eating sunshine.", category: "Humor", luckScore: 5, emoji: "☀️", rarity: "Common" },
  { message: "Your snake just winked at me. I think it likes you.", category: "Humor", luckScore: 4, emoji: "😉", rarity: "Common" },
  { message: "Fun fact: you're currently better than yesterday's you!", category: "Humor", luckScore: 6, emoji: "🎉", rarity: "Common" },
  { message: "The letters are scared. And they should be.", category: "Humor", luckScore: 7, emoji: "😈", rarity: "Uncommon" },
  { message: "Breaking news: Local snake consumes entire English dictionary!", category: "Humor", luckScore: 5, emoji: "📰", rarity: "Common" },
  { message: "Plot twist: you're the villain in the letters' story.", category: "Humor", luckScore: 4, emoji: "🎬", rarity: "Common" },
  { message: "This fortune was personally approved by a very wise hamster.", category: "Humor", luckScore: 5, emoji: "🐹", rarity: "Common" },
  { message: "Your combo counter called. It wants to go higher!", category: "Humor", luckScore: 6, emoji: "📞", rarity: "Common" },
  { message: "Cosmic joke unlocked: infinite laughs, finite grid!", category: "Humor", luckScore: 8, emoji: "🃏", rarity: "Uncommon" },
  // Mystery — 10
  { message: "Something unexpected awaits at the edge of the grid...", category: "Mystery", luckScore: 7, emoji: "🌑", rarity: "Uncommon" },
  { message: "The next word you eat holds a secret message.", category: "Mystery", luckScore: 6, emoji: "🔮", rarity: "Uncommon" },
  { message: "A mysterious force guides your snake today. Trust it.", category: "Mystery", luckScore: 7, emoji: "🌀", rarity: "Uncommon" },
  { message: "The shadows hide bonus letters. Look closely.", category: "Mystery", luckScore: 8, emoji: "👁️", rarity: "Rare" },
  { message: "Today's game will reveal something about your destiny.", category: "Mystery", luckScore: 6, emoji: "⏰", rarity: "Uncommon" },
  { message: "There are no coincidences — only hidden patterns.", category: "Mystery", luckScore: 7, emoji: "✴️", rarity: "Uncommon" },
  { message: "The void whispers ancient words of power...", category: "Mystery", luckScore: 8, emoji: "🌊", rarity: "Rare" },
  { message: "A riddle wrapped in a mystery inside a word grid.", category: "Mystery", luckScore: 7, emoji: "🧩", rarity: "Uncommon" },
  { message: "Hidden portals between words shimmer faintly today.", category: "Mystery", luckScore: 9, emoji: "🌌", rarity: "Rare" },
  { message: "The cosmos has opened a rift of infinite luck!", category: "Mystery", luckScore: 10, emoji: "🕳️", rarity: "Legendary" },
  // Prosperity — 9
  { message: "Coins rain from the sky — well, from the grid anyway!", category: "Prosperity", luckScore: 7, emoji: "💰", rarity: "Uncommon" },
  { message: "Your fortune multiplier just doubled. Coincidence? No.", category: "Prosperity", luckScore: 8, emoji: "💎", rarity: "Rare" },
  { message: "Today's word economy is bullish. Invest in vowels!", category: "Prosperity", luckScore: 6, emoji: "📈", rarity: "Uncommon" },
  { message: "The treasure chest of words is wide open today.", category: "Prosperity", luckScore: 7, emoji: "🎁", rarity: "Uncommon" },
  { message: "Rare words are appearing more frequently for you!", category: "Prosperity", luckScore: 8, emoji: "🌟", rarity: "Rare" },
  { message: "Your coin pouch grows heavier with each word eaten.", category: "Prosperity", luckScore: 7, emoji: "🪙", rarity: "Uncommon" },
  { message: "A golden opportunity slithers across the grid!", category: "Prosperity", luckScore: 9, emoji: "🏆", rarity: "Rare" },
  { message: "The jackpot of letters has your name on it!", category: "Prosperity", luckScore: 8, emoji: "🎰", rarity: "Rare" },
  { message: "Midas himself envies your fortune today!", category: "Prosperity", luckScore: 10, emoji: "👑", rarity: "Legendary" },
]

// ---------------------------------------------------------------------------
// Constants — Wisdom Quotes (42)
// ---------------------------------------------------------------------------

const WISDOM_QUOTES: Omit<WisdomEntry, 'id'>[] = [
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Creativity", depth: 3 },
  { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "Perseverance", depth: 3 },
  { quote: "Knowledge is power. Information is liberating.", author: "Kofi Annan", category: "Knowledge", depth: 2 },
  { quote: "Patience is not the ability to wait, but how you act while waiting.", author: "Joyce Meyer", category: "Patience", depth: 3 },
  { quote: "Courage is not the absence of fear, but the triumph over it.", author: "Nelson Mandela", category: "Courage", depth: 3 },
  { quote: "The journey of a thousand miles begins with one step.", author: "Lao Tzu", category: "Perseverance", depth: 2 },
  { quote: "Creativity is intelligence having fun.", author: "Albert Einstein", category: "Creativity", depth: 2 },
  { quote: "The more I read, the more I acquire, the more certain I am that I know nothing.", author: "Voltaire", category: "Knowledge", depth: 3 },
  { quote: "A patient man is always a master of himself.", author: "William Hazlitt", category: "Patience", depth: 2 },
  { quote: "Fortune favors the bold.", author: "Virgil", category: "Courage", depth: 1 },
  { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "Perseverance", depth: 2 },
  { quote: "Imagination is more important than knowledge.", author: "Albert Einstein", category: "Creativity", depth: 2 },
  { quote: "The only true wisdom is in knowing you know nothing.", author: "Socrates", category: "Knowledge", depth: 3 },
  { quote: "He that can have patience can have what he will.", author: "Benjamin Franklin", category: "Patience", depth: 1 },
  { quote: "Life shrinks or expands in proportion to one's courage.", author: "Anaïs Nin", category: "Courage", depth: 2 },
  { quote: "Perseverance is the hard work you do after you get tired of doing the hard work.", author: "Newt Gingrich", category: "Perseverance", depth: 2 },
  { quote: "The chief enemy of creativity is good sense.", author: "Pablo Picasso", category: "Creativity", depth: 3 },
  { quote: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin", category: "Knowledge", depth: 2 },
  { quote: "Genius is eternal patience.", author: "Michelangelo", category: "Patience", depth: 3 },
  { quote: "You gain strength, courage, and confidence by every experience.", author: "Eleanor Roosevelt", category: "Courage", depth: 2 },
  { quote: "Fall seven times, stand up eight.", author: "Japanese Proverb", category: "Perseverance", depth: 3 },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "Creativity", depth: 1 },
  { quote: "Reading is to the mind what exercise is to the body.", author: "Joseph Addison", category: "Knowledge", depth: 2 },
  { quote: "Rivers know this: there is no hurry. We shall get there some day.", author: "A.A. Milne", category: "Patience", depth: 3 },
  { quote: "Have the courage to follow your heart and intuition.", author: "Steve Jobs", category: "Courage", depth: 2 },
  { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "Perseverance", depth: 3 },
  { quote: "Every artist was first an amateur.", author: "Ralph Waldo Emerson", category: "Creativity", depth: 1 },
  { quote: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King", category: "Knowledge", depth: 2 },
  { quote: "One moment of patience may ward off great disaster.", author: "Chinese Proverb", category: "Patience", depth: 2 },
  { quote: "Without courage, wisdom bears no fruit.", author: "Baltasar Gracián", category: "Courage", depth: 3 },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela", category: "Perseverance", depth: 2 },
  { quote: "Curiosity about life in all of its aspects is still the secret of great creative people.", author: "Leo Burnett", category: "Creativity", depth: 3 },
  { quote: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle", category: "Knowledge", depth: 3 },
  { quote: "Patience is the calm acceptance that things can happen in a different order.", author: "Robert M. Pirsig", category: "Patience", depth: 3 },
  { quote: "Dare to live the life you have dreamed for yourself.", author: "Ralph Waldo Emerson", category: "Courage", depth: 2 },
  { quote: "Energy and persistence conquer all things.", author: "Benjamin Franklin", category: "Perseverance", depth: 2 },
  { quote: "Art is not what you see, but what you make others see.", author: "Edgar Degas", category: "Creativity", depth: 2 },
  { quote: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson", category: "Courage", depth: 3 },
  { quote: "A diamond is a chunk of coal that did well under pressure.", author: "Henry Kissinger", category: "Perseverance", depth: 2 },
  { quote: "True knowledge exists in knowing that you know nothing.", author: "Socrates", category: "Knowledge", depth: 3 },
  { quote: "Learn to be calm and you will always be happy.", author: "Paramahansa Yogananda", category: "Patience", depth: 2 },
  { quote: "Creativity takes courage.", author: "Henri Matisse", category: "Creativity", depth: 1 },
  { quote: "Do not go where the path may lead, go instead where there is no path.", author: "Ralph Waldo Emerson", category: "Courage", depth: 3 },
]

// ---------------------------------------------------------------------------
// Constants — Tarot Cards (22 Major Arcana)
// ---------------------------------------------------------------------------

const TAROT_CARDS: TarotCard[] = [
  { id: 0, name: "The Fool", emoji: "🃏", uprightMeaning: "New beginnings, adventure, spontaneity", reversedMeaning: "Recklessness, carelessness, risk-taking", element: "Air", numerology: "0" },
  { id: 1, name: "The Magician", emoji: "🎩", uprightMeaning: "Skill, concentration, resourcefulness", reversedMeaning: "Manipulation, poor planning, untapped talents", element: "Mercury", numerology: "1" },
  { id: 2, name: "High Priestess", emoji: "🌙", uprightMeaning: "Intuition, mystery, inner knowledge", reversedMeaning: "Secrets, withdrawal, silence", element: "Moon", numerology: "2" },
  { id: 3, name: "The Empress", emoji: "👑", uprightMeaning: "Abundance, nurturing, growth", reversedMeaning: "Creative block, dependence, emptiness", element: "Venus", numerology: "3" },
  { id: 4, name: "The Emperor", emoji: "🏰", uprightMeaning: "Authority, structure, stability", reversedMeaning: "Tyranny, rigidity, coldness", element: "Aries", numerology: "4" },
  { id: 5, name: "The Hierophant", emoji: "⛪", uprightMeaning: "Tradition, spiritual wisdom, conformity", reversedMeaning: "Rebellion, subversiveness, new approaches", element: "Taurus", numerology: "5" },
  { id: 6, name: "The Lovers", emoji: "💕", uprightMeaning: "Harmony, relationships, alignment of values", reversedMeaning: "Disharmony, imbalance, misalignment", element: "Gemini", numerology: "6" },
  { id: 7, name: "The Chariot", emoji: "🐎", uprightMeaning: "Determination, willpower, triumph", reversedMeaning: "Lack of direction, aggression, no control", element: "Cancer", numerology: "7" },
  { id: 8, name: "Strength", emoji: "🦁", uprightMeaning: "Inner strength, courage, patience", reversedMeaning: "Self-doubt, weakness, insecurity", element: "Leo", numerology: "8" },
  { id: 9, name: "The Hermit", emoji: "🏔️", uprightMeaning: "Soul-searching, introspection, solitude", reversedMeaning: "Isolation, loneliness, withdrawal", element: "Virgo", numerology: "9" },
  { id: 10, name: "Wheel of Fortune", emoji: "🎡", uprightMeaning: "Good luck, karma, life cycles", reversedMeaning: "Bad luck, resistance to change, breaking cycles", element: "Jupiter", numerology: "10" },
  { id: 11, name: "Justice", emoji: "⚖️", uprightMeaning: "Fairness, truth, law", reversedMeaning: "Unfairness, dishonesty, lack of accountability", element: "Libra", numerology: "11" },
  { id: 12, name: "The Hanged Man", emoji: "🙃", uprightMeaning: "Pause, surrender, new perspective", reversedMeaning: "Stalling, indecision, needless sacrifice", element: "Neptune", numerology: "12" },
  { id: 13, name: "Death", emoji: "🦋", uprightMeaning: "Endings, transformation, change", reversedMeaning: "Resistance to change, inability to move on", element: "Scorpio", numerology: "13" },
  { id: 14, name: "Temperance", emoji: "☯️", uprightMeaning: "Balance, moderation, harmony", reversedMeaning: "Imbalance, excess, self-healing needed", element: "Sagittarius", numerology: "14" },
  { id: 15, name: "The Devil", emoji: "🔗", uprightMeaning: "Shadow self, attachment, addiction", reversedMeaning: "Releasing bonds, breaking free, reclaiming power", element: "Capricorn", numerology: "15" },
  { id: 16, name: "The Tower", emoji: "⚡", uprightMeaning: "Sudden upheaval, revelation, awakening", reversedMeaning: "Avoidance of disaster, fear of change", element: "Mars", numerology: "16" },
  { id: 17, name: "The Star", emoji: "⭐", uprightMeaning: "Hope, faith, purpose, renewal", reversedMeaning: "Lack of faith, despair, discouragement", element: "Aquarius", numerology: "17" },
  { id: 18, name: "The Moon", emoji: "🌕", uprightMeaning: "Illusion, fear, anxiety, subconscious", reversedMeaning: "Release of fear, repressed emotion, clarity", element: "Pisces", numerology: "18" },
  { id: 19, name: "The Sun", emoji: "☀️", uprightMeaning: "Joy, success, vitality, positivity", reversedMeaning: "Inner child, feeling down, overly optimistic", element: "Sun", numerology: "19" },
  { id: 20, name: "Judgement", emoji: "📯", uprightMeaning: "Rebirth, inner calling, absolution", reversedMeaning: "Self-doubt, refusal to learn, stagnation", element: "Pluto", numerology: "20" },
  { id: 21, name: "The World", emoji: "🌍", uprightMeaning: "Completion, accomplishment, wholeness", reversedMeaning: "Seeking closure, shortcuts, incompletion", element: "Saturn", numerology: "21" },
]

// ---------------------------------------------------------------------------
// Constants — Runes (24 Elder Futhark)
// ---------------------------------------------------------------------------

const RUNES: RuneInfo[] = [
  { id: 0, name: "Fehu", emoji: "🐂", meaning: "Wealth, abundance, material success", element: "Fire", energyType: "Prosperity" },
  { id: 1, name: "Uruz", emoji: "🦬", meaning: "Strength, health, primal power", element: "Earth", energyType: "Strength" },
  { id: 2, name: "Thurisaz", emoji: "🪨", meaning: "Protection, defence, reactive force", element: "Fire", energyType: "Protection" },
  { id: 3, name: "Ansuz", emoji: "🗣️", meaning: "Wisdom, communication, divine inspiration", element: "Air", energyType: "Wisdom" },
  { id: 4, name: "Raidho", emoji: "🚗", meaning: "Movement, journey, rhythm of life", element: "Air", energyType: "Movement" },
  { id: 5, name: "Kenaz", emoji: "🔥", meaning: "Knowledge, creativity, illumination", element: "Fire", energyType: "Creativity" },
  { id: 6, name: "Gebo", emoji: "🎁", meaning: "Gift, partnership, generous exchange", element: "Air", energyType: "Harmony" },
  { id: 7, name: "Wunjo", emoji: "😊", meaning: "Joy, harmony, happiness, pleasure", element: "Earth", energyType: "Joy" },
  { id: 8, name: "Hagalaz", emoji: "🌨️", meaning: "Disruption, chaos, transformative forces", element: "Water", energyType: "Transformation" },
  { id: 9, name: "Nauthiz", emoji: "🔒", meaning: "Need, constraint, necessity", element: "Fire", energyType: "Discipline" },
  { id: 10, name: "Isa", emoji: "❄️", meaning: "Stillness, ice, pause, challenges", element: "Water", energyType: "Patience" },
  { id: 11, name: "Jera", emoji: "🌾", meaning: "Harvest, cycles, reward for effort", element: "Earth", energyType: "Reward" },
  { id: 12, name: "Eihwaz", emoji: "🌲", meaning: "Endurance, resilience, inner strength", element: "All", energyType: "Endurance" },
  { id: 13, name: "Perthro", emoji: "🎲", meaning: "Mystery, fate, the unknown", element: "Water", energyType: "Mystery" },
  { id: 14, name: "Algiz", emoji: "🛡️", meaning: "Protection, shielding, spiritual connection", element: "Air", energyType: "Protection" },
  { id: 15, name: "Sowilo", emoji: "☀️", meaning: "Success, vitality, the life force", element: "Fire", energyType: "Success" },
  { id: 16, name: "Tiwaz", emoji: "⚔️", meaning: "Victory, honour, justice, warrior spirit", element: "Air", energyType: "Victory" },
  { id: 17, name: "Berkano", emoji: "🌱", meaning: "Growth, birth, renewal, fertility", element: "Earth", energyType: "Growth" },
  { id: 18, name: "Ehwaz", emoji: "🐴", meaning: "Trust, partnership, movement forward", element: "Earth", energyType: "Partnership" },
  { id: 19, name: "Mannaz", emoji: "👤", meaning: "Humanity, self-awareness, community", element: "Air", energyType: "Self-awareness" },
  { id: 20, name: "Laguz", emoji: "🌊", meaning: "Flow, intuition, the unconscious mind", element: "Water", energyType: "Intuition" },
  { id: 21, name: "Ingwaz", emoji: "🥚", meaning: "Potential, new beginnings, fertility", element: "Earth", energyType: "Potential" },
  { id: 22, name: "Dagaz", emoji: "🌅", meaning: "Breakthrough, awakening, clarity", element: "Fire", energyType: "Breakthrough" },
  { id: 23, name: "Othala", emoji: "🏠", meaning: "Heritage, home, ancestral wisdom", element: "Earth", energyType: "Heritage" },
]

// ---------------------------------------------------------------------------
// Constants — Zodiac Signs (12)
// ---------------------------------------------------------------------------

const ZODIAC_SIGNS: ZodiacSign[] = [
  { name: "Aries", emoji: "♈", element: "Fire", traits: ["Brave", "Energetic", "Competitive"], dates: "Mar 21–Apr 19" },
  { name: "Taurus", emoji: "♉", element: "Earth", traits: ["Reliable", "Patient", "Devoted"], dates: "Apr 20–May 20" },
  { name: "Gemini", emoji: "♊", element: "Air", traits: ["Adaptable", "Curious", "Witty"], dates: "May 21–Jun 20" },
  { name: "Cancer", emoji: "♋", element: "Water", traits: ["Intuitive", "Nurturing", "Protective"], dates: "Jun 21–Jul 22" },
  { name: "Leo", emoji: "♌", element: "Fire", traits: ["Creative", "Generous", "Confident"], dates: "Jul 23–Aug 22" },
  { name: "Virgo", emoji: "♍", element: "Earth", traits: ["Analytical", "Hardworking", "Practical"], dates: "Aug 23–Sep 22" },
  { name: "Libra", emoji: "♎", element: "Air", traits: ["Diplomatic", "Fair", "Cooperative"], dates: "Sep 23–Oct 22" },
  { name: "Scorpio", emoji: "♏", element: "Water", traits: ["Passionate", "Resourceful", "Strategic"], dates: "Oct 23–Nov 21" },
  { name: "Sagittarius", emoji: "♐", element: "Fire", traits: ["Optimistic", "Adventurous", "Free-spirited"], dates: "Nov 22–Dec 21" },
  { name: "Capricorn", emoji: "♑", element: "Earth", traits: ["Disciplined", "Ambitious", "Wise"], dates: "Dec 22–Jan 19" },
  { name: "Aquarius", emoji: "♒", element: "Air", traits: ["Innovative", "Independent", "Humanitarian"], dates: "Jan 20–Feb 18" },
  { name: "Pisces", emoji: "♓", element: "Water", traits: ["Compassionate", "Artistic", "Intuitive"], dates: "Feb 19–Mar 20" },
]

// ---------------------------------------------------------------------------
// Constants — Lucky Words Pool, Achievements, Advice, etc.
// ---------------------------------------------------------------------------

const LUCKY_WORDS_POOL: string[] = [
  "BLISS", "VIVID", "GLOW", "BLOOM", "SPARK", "DREAM", "LUNAR", "EMBER",
  "FORGE", "CREST", "HAVEN", "RAPID", "QUEST", "CROWN", "LUCID", "PULSE",
  "ORBIT", "PRISM", "VAULT", "SHINE", "DRIFT", "JEWEL", "MAGIC", "TIGER",
  "OCEAN", "FROST", "FLAME", "NEXUS", "VIGOR", "SOLAR", "AGILE", "BRAVO",
  "STORM", "ZENITH", "PHOENIX", "CRYSTAL", "SHADOW", "DRAGON", "RIDDLE",
  "WONDER", "MIRAGE", "AURORA", "TEMPEST", "CHIMERA", "DESTINY", "ECLIPSE",
]

const STREAK_MILESTONES: Record<number, { reward: number; rewardType: string; label: string }> = {
  7:  { reward: 100, rewardType: "coins", label: "Week of Fortune" },
  14: { reward: 50,  rewardType: "gems",  label: "Fortnight of Luck" },
  30: { reward: 200, rewardType: "gems",  label: "Month of Destiny" },
  100: { reward: 500, rewardType: "gems",  label: "Century of Cosmic Power" },
}

const ACHIEVEMENT_DEFS: { id: string; name: string; description: string; icon: string; condition: string }[] = [
  { id: "first_cookie", name: "First Cookie", description: "Crack your first fortune cookie", icon: "🍪", condition: "totalFortunes >= 1" },
  { id: "daily_devotee", name: "Daily Devotee", description: "Check your fortune 7 days in a row", icon: "🙏", condition: "fortuneStreak >= 7" },
  { id: "fortune_master", name: "Fortune Master", description: "Collect 30 total fortunes", icon: "🧙", condition: "totalFortunes >= 30" },
  { id: "lucky_streak", name: "Lucky Streak", description: "Reach a 14-day fortune streak", icon: "🍀", condition: "fortuneStreak >= 14" },
  { id: "full_collection", name: "Full Collection", description: "Collect all 24 runes", icon: "🧿", condition: "runeCount >= 24" },
  { id: "tarot_reader", name: "Tarot Reader", description: "Draw 10 daily tarot readings", icon: "🔮", condition: "tarotCount >= 10" },
  { id: "rune_master", name: "Rune Master", description: "Cast runes 10 times", icon: "🪨", condition: "runeCastCount >= 10" },
  { id: "all_signs", name: "All Signs", description: "View horoscopes for all 12 zodiac signs", icon: "♈", condition: "signsViewed >= 12" },
  { id: "wisdom_keeper", name: "Wisdom Keeper", description: "Collect 20 wisdom entries", icon: "📖", condition: "wisdomCount >= 20" },
  { id: "cosmic_alignment", name: "Cosmic Alignment", description: "Achieve a fortune score of 95+", icon: "🌌", condition: "fortuneScore >= 95" },
]

const HOROSCOPE_ADVICE: string[] = [
  "Focus on longer words today for bigger scores.",
  "Take risks near the edges — luck is on your side.",
  "Patience pays off. Let the words come to you.",
  "Trust your instincts and go for combos!",
  "Today favors strategy over speed.",
  "A rare word is waiting to be discovered.",
  "Your vocabulary will surprise you today.",
  "Collaborative energy — try multiplayer mode!",
  "Double-check before you strike — precision matters.",
  "The stars say: go for the high score!",
  "Take a break between games for better results.",
  "Your creative side shines — try themed word packs.",
]

const LUCKY_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#DDA0DD', '#87CEEB', '#F0E68C', '#FFB347', '#77DD77']
const LUCKY_TIMES = ['Morning (6–9 AM)', 'Late Morning (9–12 PM)', 'Afternoon (12–3 PM)', 'Late Afternoon (3–6 PM)', 'Evening (6–9 PM)', 'Night (9 PM–12 AM)']

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function seededRandom(seed: string): () => number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  }
  let s = h >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a)
  const db = new Date(b)
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24))
}

function rollRarity(rng: () => number): FortuneRarity {
  const roll = rng()
  if (roll < 0.03) return 'Legendary'
  if (roll < 0.15) return 'Rare'
  if (roll < 0.40) return 'Uncommon'
  return 'Common'
}

function assignFortuneEffect(cookie: FortuneCookie): FortuneEffect | undefined {
  if (cookie.rarity !== 'Legendary') return undefined
  const legendaryEffects: FortuneEffect[] = [
    { type: 'score_multiplier', value: 2, description: 'Double score for 1 hour!', durationMinutes: 60 },
    { type: 'extra_life', value: 1, description: 'Extra life in next game!', durationMinutes: 120 },
    { type: 'coin_bonus', value: 500, description: '+500 bonus coins!', durationMinutes: 90 },
    { type: 'speed_boost', value: 1.5, description: 'Speed boost without increased difficulty!', durationMinutes: 30 },
    { type: 'word_hint', value: 3, description: '3 free word hints!', durationMinutes: 60 },
    { type: 'shield', value: 2, description: '2 collision shields!', durationMinutes: 45 },
  ]
  return legendaryEffects[Math.floor(Math.random() * legendaryEffects.length)]
}

function computeFortuneScore(
  fortune: FortuneCookie | null,
  horoscope: HoroscopeReading | null,
  tarot: TarotReading | null,
  runes: RuneReading | null,
  wisdom: WisdomEntry | null,
): number {
  let score = 50
  if (fortune) score += fortune.luckScore * 2
  if (fortune?.rarity === 'Legendary') score += 15
  if (fortune?.rarity === 'Rare') score += 8
  if (horoscope) {
    score += (horoscope.overallLuck + horoscope.gameLuck + horoscope.wordLuck) * 1.5
  }
  if (tarot) {
    const goodCards = [0, 1, 6, 7, 8, 10, 17, 19, 21]
    const cardIds = [tarot.past.id, tarot.present.id, tarot.future.id]
    for (const id of cardIds) {
      if (goodCards.includes(id)) score += 3
    }
  }
  if (runes) {
    const positiveRunes = [0, 7, 11, 15, 16, 22]
    const runeIds = [runes.situation.id, runes.action.id, runes.outcome.id]
    for (const id of runeIds) {
      if (positiveRunes.includes(id)) score += 2
    }
  }
  if (wisdom) score += wisdom.depth * 2
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeLuckMultiplier(score: number): number {
  if (score >= 90) return 1.5
  if (score >= 75) return 1.2
  if (score >= 60) return 1.1
  return 1.0
}

function computeMood(score: number): FortuneMood {
  if (score >= 90) return 'amazing'
  if (score >= 75) return 'great'
  if (score >= 60) return 'good'
  if (score >= 40) return 'neutral'
  if (score >= 20) return 'challenging'
  return 'difficult'
}

function checkAchievements(state: DailyFortuneState): string[] {
  const earned: string[] = []
  const checks: Record<string, boolean> = {
    first_cookie: state.totalFortunes >= 1,
    daily_devotee: state.fortuneStreak >= 7,
    fortune_master: state.totalFortunes >= 30,
    lucky_streak: state.fortuneStreak >= 14,
    full_collection: state.runeCollection.length >= 24,
    tarot_reader: state.tarotHistory.length >= 10,
    rune_master: state.tarotHistory.length >= 10,
    all_signs: false,
    wisdom_keeper: state.wisdomCollection.length >= 20,
    cosmic_alignment: state.fortuneScore >= 95,
  }
  for (const def of ACHIEVEMENT_DEFS) {
    if (checks[def.id] && !state.fortuneAchievements.includes(def.id)) {
      earned.push(def.id)
    }
  }
  return earned
}

// ---------------------------------------------------------------------------
// Zustand Store
// ---------------------------------------------------------------------------

type DailyFortuneStore = DailyFortuneState

export const useDailyFortuneStore = create<DailyFortuneStore>()(
  persist(
    (set, get) => ({
      todayFortune: null,
      fortuneHistory: [],
      fortuneStreak: 0,
      luckyNumbers: [],
      luckyWords: [],
      zodiacSign: null,
      horoscope: null,
      horoscopeHistory: [],
      dailyWisdom: null,
      wisdomCollection: [],
      dailyTarot: null,
      tarotHistory: [],
      dailyRunes: null,
      runeCollection: [],
      fortuneScore: 0,
      luckMultiplier: 1.0,
      fortuneMood: 'neutral' as FortuneMood,
      totalFortunes: 0,
      perfectDays: 0,
      streakRecord: 0,
      fortuneAchievements: [],
      lastFortuneDate: '',
      lastHoroscopeDate: '',

      crackCookie: () => {
        const state = get()
        const today = todayISO()
        const rng = seededRandom('fortune-' + today)

        if (state.lastFortuneDate === today && state.todayFortune) return state.todayFortune

        const rarity = rollRarity(rng)
        const pool = FORTUNE_COOKIES.filter(f => f.rarity === rarity)
        const base = pickRandom(pool.length > 0 ? pool : FORTUNE_COOKIES, rng)
        const cookie: FortuneCookie = { ...base, id: generateId() }
        cookie.effect = assignFortuneEffect(cookie)

        const newHistory = [cookie, ...state.fortuneHistory].slice(0, 100)
        let streak = state.fortuneStreak
        if (state.lastFortuneDate) {
          const diff = daysBetween(state.lastFortuneDate, today)
          if (diff === 1) streak += 1
          else if (diff > 1) streak = 1
        } else {
          streak = 1
        }
        const totalFortunes = state.totalFortunes + 1

        const score = computeFortuneScore(cookie, state.horoscope, state.dailyTarot, state.dailyRunes, state.dailyWisdom)
        const multiplier = computeLuckMultiplier(score)
        const mood = computeMood(score)
        const newAchievements = checkAchievements({
          ...state, todayFortune: cookie, totalFortunes, fortuneStreak: streak, fortuneScore: score,
        })

        set({
          todayFortune: cookie,
          fortuneHistory: newHistory,
          fortuneStreak: streak,
          streakRecord: Math.max(state.streakRecord, streak),
          totalFortunes,
          lastFortuneDate: today,
          fortuneScore: score,
          luckMultiplier: multiplier,
          fortuneMood: mood,
          fortuneAchievements: [...state.fortuneAchievements, ...newAchievements],
          perfectDays: score >= 90 ? state.perfectDays + 1 : state.perfectDays,
        })
        return cookie
      },

      generateLuckyNumbers: () => {
        const today = todayISO()
        const rng = seededRandom('lucky-nums-' + today)
        const nums: number[] = []
        while (nums.length < 5) {
          const n = Math.floor(rng() * 99) + 1
          if (!nums.includes(n)) nums.push(n)
        }
        set({ luckyNumbers: nums })
        return nums
      },

      generateLuckyWords: () => {
        const today = todayISO()
        const rng = seededRandom('lucky-words-' + today)
        const words = shuffleArray(LUCKY_WORDS_POOL, rng).slice(0, 5)
        set({ luckyWords: words })
        return words
      },

      selectZodiacSign: (sign: string) => {
        if (!ZODIAC_SIGNS.some(s => s.name === sign)) return false
        set({ zodiacSign: sign })
        return true
      },

      getTodayReading: () => {
        const state = get()
        if (!state.zodiacSign) return null
        const today = todayISO()
        const rng = seededRandom('horoscope-' + today + '-' + state.zodiacSign)

        const reading: HoroscopeReading = {
          sign: state.zodiacSign,
          date: today,
          overallLuck: Math.floor(rng() * 3) + 3,
          loveLuck: Math.floor(rng() * 5) + 1,
          gameLuck: Math.floor(rng() * 5) + 1,
          wordLuck: Math.floor(rng() * 5) + 1,
          advice: pickRandom(HOROSCOPE_ADVICE, rng),
          luckyColor: LUCKY_COLORS[Math.floor(rng() * LUCKY_COLORS.length)],
          luckyTime: LUCKY_TIMES[Math.floor(rng() * LUCKY_TIMES.length)],
        }

        const newHistory = [reading, ...state.horoscopeHistory].slice(0, 100)
        const score = computeFortuneScore(state.todayFortune, reading, state.dailyTarot, state.dailyRunes, state.dailyWisdom)
        const newAchievements = checkAchievements({ ...state, horoscope: reading, fortuneScore: score })

        set({
          horoscope: reading,
          horoscopeHistory: newHistory,
          lastHoroscopeDate: today,
          fortuneScore: score,
          luckMultiplier: computeLuckMultiplier(score),
          fortuneMood: computeMood(score),
          fortuneAchievements: [...state.fortuneAchievements, ...newAchievements],
        })
        return reading
      },

      drawDailyTarot: () => {
        const state = get()
        const today = todayISO()
        if (state.dailyTarot && state.dailyTarot.date === today) return state.dailyTarot

        const rng = seededRandom('tarot-' + today)
        const indices = shuffleArray(TAROT_CARDS.map((_, i) => i), rng)
        const pastCard = TAROT_CARDS[indices[0]]
        const presentCard = TAROT_CARDS[indices[1]]
        const futureCard = TAROT_CARDS[indices[2]]

        const pastReversed = rng() < 0.3
        const presentReversed = rng() < 0.3
        const futureReversed = rng() < 0.3

        const reading: TarotReading = {
          date: today,
          past: pastCard, present: presentCard, future: futureCard,
          pastReversed, presentReversed, futureReversed,
          interpretation: `Past: ${pastReversed ? pastCard.reversedMeaning : pastCard.uprightMeaning}. Present: ${presentReversed ? presentCard.reversedMeaning : presentCard.uprightMeaning}. Future: ${futureReversed ? futureCard.reversedMeaning : futureCard.uprightMeaning}. Trust the cards and play with confidence!`,
        }

        const newHistory = [reading, ...state.tarotHistory].slice(0, 100)
        const score = computeFortuneScore(state.todayFortune, state.horoscope, reading, state.dailyRunes, state.dailyWisdom)
        const newAchievements = checkAchievements({ ...state, dailyTarot: reading, tarotHistory: newHistory, fortuneScore: score })

        set({
          dailyTarot: reading,
          tarotHistory: newHistory,
          fortuneScore: score,
          luckMultiplier: computeLuckMultiplier(score),
          fortuneMood: computeMood(score),
          fortuneAchievements: [...state.fortuneAchievements, ...newAchievements],
        })
        return reading
      },

      castRunes: () => {
        const state = get()
        const today = todayISO()
        if (state.dailyRunes && state.dailyRunes.date === today) return state.dailyRunes

        const rng = seededRandom('runes-' + today)
        const indices = shuffleArray(RUNES.map((_, i) => i), rng)
        const situationRune = RUNES[indices[0]]
        const actionRune = RUNES[indices[1]]
        const outcomeRune = RUNES[indices[2]]

        const newCollection = [...new Set([...state.runeCollection, situationRune.name, actionRune.name, outcomeRune.name])]

        const reading: RuneReading = {
          date: today,
          situation: situationRune,
          action: actionRune,
          outcome: outcomeRune,
          interpretation: `Your situation involves ${situationRune.name} (${situationRune.meaning}). The runes suggest the action of ${actionRune.name} (${actionRune.meaning}). The likely outcome is ${outcomeRune.name} (${outcomeRune.meaning}).`,
        }

        const score = computeFortuneScore(state.todayFortune, state.horoscope, state.dailyTarot, reading, state.dailyWisdom)
        const newAchievements = checkAchievements({ ...state, dailyRunes: reading, runeCollection: newCollection, fortuneScore: score })

        set({
          dailyRunes: reading,
          runeCollection: newCollection,
          fortuneScore: score,
          luckMultiplier: computeLuckMultiplier(score),
          fortuneMood: computeMood(score),
          fortuneAchievements: [...state.fortuneAchievements, ...newAchievements],
        })
        return reading
      },

      shareWisdom: (id: string) => {
        const state = get()
        const wisdom = state.wisdomCollection.find(w => w.id === id) || state.dailyWisdom
        if (!wisdom) return null
        const code = btoa(JSON.stringify({ q: wisdom.quote.slice(0, 30), a: wisdom.author.slice(0, 15), c: wisdom.category }))
        return `FORTUNE-${code.slice(0, 16).toUpperCase()}`
      },

      resetFortuneData: () => {
        set({
          todayFortune: null, fortuneHistory: [], fortuneStreak: 0,
          luckyNumbers: [], luckyWords: [], zodiacSign: null,
          horoscope: null, horoscopeHistory: [], dailyWisdom: null,
          wisdomCollection: [], dailyTarot: null, tarotHistory: [],
          dailyRunes: null, runeCollection: [], fortuneScore: 0,
          luckMultiplier: 1.0, fortuneMood: 'neutral', totalFortunes: 0,
          perfectDays: 0, streakRecord: 0, fortuneAchievements: [],
          lastFortuneDate: '', lastHoroscopeDate: '',
        })
      },
    }),
    { name: 'ws_daily_fortune' },
  ),
)

// ---------------------------------------------------------------------------
// 1. initDailyFortune
// ---------------------------------------------------------------------------

export function initDailyFortune(): DailyFortuneState {
  const state = useDailyFortuneStore.getState()
  const today = todayISO()

  if (state.lastFortuneDate !== today) {
    useDailyFortuneStore.getState().generateLuckyNumbers()
    useDailyFortuneStore.getState().generateLuckyWords()
  }

  if (!state.dailyWisdom) {
    const rng = seededRandom('wisdom-' + today)
    const quote = pickRandom(WISDOM_QUOTES, rng)
    const wisdom: WisdomEntry = { ...quote, id: generateId() }
    const collection = [...state.wisdomCollection, wisdom]
    const uniqueCollection = collection.filter((w, i, arr) => arr.findIndex(t => t.quote === w.quote) === i)
    useDailyFortuneStore.setState({
      dailyWisdom: wisdom,
      wisdomCollection: uniqueCollection,
    })
  }

  if (!state.luckyNumbers.length) {
    useDailyFortuneStore.getState().generateLuckyNumbers()
  }
  if (!state.luckyWords.length) {
    useDailyFortuneStore.getState().generateLuckyWords()
  }

  return useDailyFortuneStore.getState()
}

// ---------------------------------------------------------------------------
// 2. crackCookie
// ---------------------------------------------------------------------------

export function crackCookie(): FortuneCookie {
  return useDailyFortuneStore.getState().crackCookie()
}

// ---------------------------------------------------------------------------
// 3. getFortuneEffect
// ---------------------------------------------------------------------------

export function getFortuneEffect(fortune: FortuneCookie): FortuneEffect | undefined {
  return fortune.effect
}

// ---------------------------------------------------------------------------
// 4. generateLuckyNumbers
// ---------------------------------------------------------------------------

export function generateLuckyNumbers(): number[] {
  return useDailyFortuneStore.getState().generateLuckyNumbers()
}

// ---------------------------------------------------------------------------
// 5. generateLuckyWords
// ---------------------------------------------------------------------------

export function generateLuckyWords(): string[] {
  return useDailyFortuneStore.getState().generateLuckyWords()
}

// ---------------------------------------------------------------------------
// 6. getLuckyBonus
// ---------------------------------------------------------------------------

export function getLuckyBonus(score: number): {
  coinMultiplier: number
  scoreMultiplier: number
  itemDropBonus: number
  consolationPrize: boolean
} {
  const s = useDailyFortuneStore.getState()
  const base = s.luckMultiplier
  const fs = s.fortuneScore

  if (fs >= 90) return { coinMultiplier: 2.0, scoreMultiplier: 1.5, itemDropBonus: 0.2, consolationPrize: false }
  if (fs >= 75) return { coinMultiplier: 1.5, scoreMultiplier: 1.2, itemDropBonus: 0.1, consolationPrize: false }
  if (fs >= 60) return { coinMultiplier: 1.2, scoreMultiplier: 1.1, itemDropBonus: 0, consolationPrize: false }
  if (fs >= 40) return { coinMultiplier: 1.0, scoreMultiplier: 1.0, itemDropBonus: 0, consolationPrize: false }

  const luckyMatch = s.luckyNumbers.some(n => String(score).endsWith(String(n)))
  return { coinMultiplier: base, scoreMultiplier: base, itemDropBonus: 0, consolationPrize: luckyMatch || fs < 20 }
}

// ---------------------------------------------------------------------------
// 7. selectZodiacSign
// ---------------------------------------------------------------------------

export function selectZodiacSign(sign: string): boolean {
  return useDailyFortuneStore.getState().selectZodiacSign(sign)
}

// ---------------------------------------------------------------------------
// 8. getTodayReading
// ---------------------------------------------------------------------------

export function getTodayReading(): HoroscopeReading | null {
  return useDailyFortuneStore.getState().getTodayReading()
}

// ---------------------------------------------------------------------------
// 9. getHoroscopeCompatibility
// ---------------------------------------------------------------------------

export function getHoroscopeCompatibility(sign1: string, sign2: string): {
  compatibility: number
  description: string
  strengths: string[]
  challenges: string[]
} {
  const s1 = ZODIAC_SIGNS.find(z => z.name === sign1)
  const s2 = ZODIAC_SIGNS.find(z => z.name === sign2)
  if (!s1 || !s2) return { compatibility: 0, description: 'Unknown signs', strengths: [], challenges: [] }

  const elementMap: Record<string, string> = { Fire: '🔥', Earth: '🌍', Air: '💨', Water: '💧' }
  const compatMap: Record<string, Record<string, number>> = {
    Fire: { Fire: 70, Earth: 40, Air: 90, Water: 50 },
    Earth: { Fire: 40, Earth: 80, Air: 50, Water: 90 },
    Air: { Fire: 90, Earth: 50, Air: 80, Water: 40 },
    Water: { Fire: 50, Earth: 90, Air: 40, Water: 70 },
  }

  const base = compatMap[s1.element][s2.element] ?? 50
  const variation = Math.floor(Math.random() * 16) - 8
  const compatibility = Math.min(100, Math.max(0, base + variation))

  const strengths: string[] = []
  const challenges: string[] = []
  if (s1.element === s2.element) {
    strengths.push('Deep mutual understanding', 'Shared values and pace')
  }
  if (s1.element === 'Fire' && s2.element === 'Air') {
    strengths.push('Exciting dynamic energy', 'Great creative synergy')
  }
  if (s1.element === 'Earth' && s2.element === 'Water') {
    strengths.push('Emotional security', 'Stable and nurturing bond')
  }
  if (compatibility < 60) {
    challenges.push('Different communication styles', 'Needs patience and effort')
  }
  if (strengths.length === 0) strengths.push('Complementary differences', 'Opportunity for growth')
  if (challenges.length === 0) challenges.push('May need to balance energies', 'Minor friction possible')

  const description = compatibility >= 80
    ? `${s1.emoji}${s2.emoji} Excellent match! ${s1.name} and ${s2.name} share great synergy.`
    : compatibility >= 60
      ? `${s1.emoji}${s2.emoji} Good potential between ${s1.name} and ${s2.name}.`
      : `${s1.emoji}${s2.emoji} ${s1.name} and ${s2.name} need patience but can grow together.`

  return { compatibility, description, strengths, challenges }
}

// ---------------------------------------------------------------------------
// 10. getWisdomInsight
// ---------------------------------------------------------------------------

export function getWisdomInsight(wisdom: WisdomEntry): {
  tip: string
  gameAdvice: string
  bonusCategory: string
} {
  const insightMap: Record<string, { tip: string; gameAdvice: string }> = {
    Perseverance: {
      tip: 'Keep pushing through tough games — your persistence builds skill.',
      gameAdvice: 'Try survival mode to practice endurance. Long sessions build vocabulary memory.',
    },
    Knowledge: {
      tip: 'Knowledge compounds — every word you learn makes the next one easier.',
      gameAdvice: 'Explore different word packs to expand your vocabulary. Knowledge is your best powerup.',
    },
    Creativity: {
      tip: 'Think outside the grid — creative word combinations score bigger.',
      gameAdvice: 'Try finding uncommon words and patterns. Creative play unlocks hidden bonuses.',
    },
    Patience: {
      tip: 'The best scores come from patient, strategic play.',
      gameAdvice: 'Slow down in the early game to set up better positions. Patience creates opportunities.',
    },
    Courage: {
      tip: 'Take calculated risks — fortune rewards the bold.',
      gameAdvice: 'Go for longer words and harder targets. Courage often leads to breakthrough scores.',
    },
  }
  const insight = insightMap[wisdom.category] || insightMap['Knowledge']
  return { ...insight, bonusCategory: wisdom.category }
}

// ---------------------------------------------------------------------------
// 11. shareWisdom
// ---------------------------------------------------------------------------

export function shareWisdom(id: string): string | null {
  return useDailyFortuneStore.getState().shareWisdom(id)
}

// ---------------------------------------------------------------------------
// 12. drawDailyTarot
// ---------------------------------------------------------------------------

export function drawDailyTarot(): TarotReading {
  return useDailyFortuneStore.getState().drawDailyTarot()
}

// ---------------------------------------------------------------------------
// 13. castRunes
// ---------------------------------------------------------------------------

export function castRunes(): RuneReading {
  return useDailyFortuneStore.getState().castRunes()
}

// ---------------------------------------------------------------------------
// 14. checkFortuneStreak
// ---------------------------------------------------------------------------

export function checkFortuneStreak(): {
  streak: number
  record: number
  isActive: boolean
  nextMilestone: { day: number; label: string; reward: number; rewardType: string } | null
} {
  const s = useDailyFortuneStore.getState()
  const isActive = s.lastFortuneDate === todayISO()
  const milestoneDays = Object.keys(STREAK_MILESTONES).map(Number).sort((a, b) => a - b)
  const nextMilestoneDay = milestoneDays.find(d => d > s.fortuneStreak)

  return {
    streak: s.fortuneStreak,
    record: s.streakRecord,
    isActive,
    nextMilestone: nextMilestoneDay
      ? { day: nextMilestoneDay, ...STREAK_MILESTONES[nextMilestoneDay] }
      : null,
  }
}

// ---------------------------------------------------------------------------
// 15. getAllZodiacSigns
// ---------------------------------------------------------------------------

export function getAllZodiacSigns(): ZodiacSign[] {
  return [...ZODIAC_SIGNS]
}

// ---------------------------------------------------------------------------
// 16. getAllTarotCards
// ---------------------------------------------------------------------------

export function getAllTarotCards(): TarotCard[] {
  return [...TAROT_CARDS]
}

// ---------------------------------------------------------------------------
// 17. getAllRunes
// ---------------------------------------------------------------------------

export function getAllRunes(): RuneInfo[] {
  return [...RUNES]
}

// ---------------------------------------------------------------------------
// 18. getFortuneHistory
// ---------------------------------------------------------------------------

export function getFortuneHistory(limit?: number): FortuneCookie[] {
  const s = useDailyFortuneStore.getState()
  return limit ? s.fortuneHistory.slice(0, limit) : s.fortuneHistory
}

// ---------------------------------------------------------------------------
// UI Helper Functions
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 19. getFortuneOverview
// ---------------------------------------------------------------------------

export function getFortuneOverview(): {
  fortuneScore: number
  mood: FortuneMood
  streak: number
  streakRecord: number
  totalFortunes: number
  perfectDays: number
  luckyNumbers: number[]
  luckyWords: string[]
  hasHoroscope: boolean
  hasTarot: boolean
  hasRunes: boolean
  achievementsCount: number
  totalAchievements: number
} {
  const s = useDailyFortuneStore.getState()
  return {
    fortuneScore: s.fortuneScore,
    mood: s.fortuneMood,
    streak: s.fortuneStreak,
    streakRecord: s.streakRecord,
    totalFortunes: s.totalFortunes,
    perfectDays: s.perfectDays,
    luckyNumbers: s.luckyNumbers,
    luckyWords: s.luckyWords,
    hasHoroscope: s.horoscope !== null,
    hasTarot: s.dailyTarot !== null,
    hasRunes: s.dailyRunes !== null,
    achievementsCount: s.fortuneAchievements.length,
    totalAchievements: ACHIEVEMENT_DEFS.length,
  }
}

// ---------------------------------------------------------------------------
// 20. getFortuneCookieCard
// ---------------------------------------------------------------------------

export function getFortuneCookieCard(): {
  cookie: FortuneCookie | null
  cracked: boolean
  animationType: string
  glowColor: string
  rarityBadge: { label: string; color: string } | null
  effectBanner: FortuneEffect | null
} {
  const s = useDailyFortuneStore.getState()
  const cookie = s.todayFortune || s.fortuneHistory[0] || null
  const cracked = s.lastFortuneDate === todayISO()

  const rarityColors: Record<FortuneRarity, string> = {
    Common: '#9CA3AF', Uncommon: '#34D399', Rare: '#60A5FA', Legendary: '#FBBF24',
  }
  const rarityBadge = cookie
    ? { label: cookie.rarity, color: rarityColors[cookie.rarity] }
    : null

  return {
    cookie,
    cracked,
    animationType: cookie?.rarity === 'Legendary' ? 'golden-burst' : cookie?.rarity === 'Rare' ? 'sparkle' : 'crumble',
    glowColor: rarityBadge?.color ?? '#6B7280',
    rarityBadge,
    effectBanner: cookie?.effect ?? null,
  }
}

// ---------------------------------------------------------------------------
// 21. getLuckyDisplay
// ---------------------------------------------------------------------------

export function getLuckyDisplay(): {
  numbers: { value: number; highlighted: boolean; emoji: string }[]
  words: { word: string; bonus: string; emoji: string }[]
  dateSeed: string
} {
  const s = useDailyFortuneStore.getState()
  const emojis = ['🍀', '⭐', '💎', '🌟', '✨']
  const wordEmojis = ['📝', '✏️', '📖', '🔠', '🔤']

  return {
    numbers: s.luckyNumbers.map((n, i) => ({
      value: n,
      highlighted: n <= 20,
      emoji: emojis[i % emojis.length],
    })),
    words: s.luckyWords.map((w, i) => ({
      word: w,
      bonus: '+50% score when eaten',
      emoji: wordEmojis[i % wordEmojis.length],
    })),
    dateSeed: todayISO(),
  }
}

// ---------------------------------------------------------------------------
// 22. getHoroscopeCard
// ---------------------------------------------------------------------------

export function getHoroscopeCard(): {
  reading: HoroscopeReading | null
  signData: ZodiacSign | null
  stars: { category: string; value: number; stars: string }[]
  luckyInfo: { color: string; time: string }
  advice: string
} {
  const s = useDailyFortuneStore.getState()
  const reading = s.horoscope
  const signData = ZODIAC_SIGNS.find(z => z.name === s.zodiacSign) ?? null

  if (!reading) {
    return { reading: null, signData, stars: [], luckyInfo: { color: '', time: '' }, advice: '' }
  }

  const categories = [
    { category: 'Overall', value: reading.overallLuck },
    { category: 'Love', value: reading.loveLuck },
    { category: 'Game', value: reading.gameLuck },
    { category: 'Words', value: reading.wordLuck },
  ]

  return {
    reading,
    signData,
    stars: categories.map(c => ({
      category: c.category,
      value: c.value,
      stars: '⭐'.repeat(c.value) + '☆'.repeat(5 - c.value),
    })),
    luckyInfo: { color: reading.luckyColor, time: reading.luckyTime },
    advice: reading.advice,
  }
}

// ---------------------------------------------------------------------------
// 23. getWisdomCard
// ---------------------------------------------------------------------------

export function getWisdomCard(): {
  wisdom: WisdomEntry | null
  insight: ReturnType<typeof getWisdomInsight> | null
  depthStars: string
  categoryIcon: string
  style: { bgColor: string; borderColor: string; textColor: string }
} {
  const s = useDailyFortuneStore.getState()
  const wisdom = s.dailyWisdom

  if (!wisdom) {
    return { wisdom: null, insight: null, depthStars: '', categoryIcon: '', style: { bgColor: '#1F2937', borderColor: '#374151', textColor: '#E5E7EB' } }
  }

  const categoryIcons: Record<string, string> = {
    Perseverance: '🔥', Knowledge: '📚', Creativity: '🎨', Patience: '⏳', Courage: '🦁',
  }
  const categoryStyles: Record<string, { bgColor: string; borderColor: string; textColor: string }> = {
    Perseverance: { bgColor: '#1C1917', borderColor: '#DC2626', textColor: '#FCA5A5' },
    Knowledge: { bgColor: '#1E1B4B', borderColor: '#6366F1', textColor: '#A5B4FC' },
    Creativity: { bgColor: '#1A1A2E', borderColor: '#A855F7', textColor: '#D8B4FE' },
    Patience: { bgColor: '#1C1917', borderColor: '#14B8A6', textColor: '#5EEAD4' },
    Courage: { bgColor: '#1C1917', borderColor: '#F59E0B', textColor: '#FCD34D' },
  }

  return {
    wisdom,
    insight: getWisdomInsight(wisdom),
    depthStars: '⭐'.repeat(wisdom.depth) + '☆'.repeat(3 - wisdom.depth),
    categoryIcon: categoryIcons[wisdom.category] || '💡',
    style: categoryStyles[wisdom.category] || { bgColor: '#1F2937', borderColor: '#6B7280', textColor: '#E5E7EB' },
  }
}

// ---------------------------------------------------------------------------
// 24. getTarotSpread
// ---------------------------------------------------------------------------

export function getTarotSpread(): {
  reading: TarotReading | null
  cards: { position: string; card: TarotCard; reversed: boolean; meaning: string }[]
  interpretation: string
  overallTheme: string
} {
  const s = useDailyFortuneStore.getState()
  const reading = s.dailyTarot

  if (!reading) {
    return { reading: null, cards: [], interpretation: '', overallTheme: '' }
  }

  const cards = [
    { position: 'Past', card: reading.past, reversed: reading.pastReversed, meaning: reading.pastReversed ? reading.past.reversedMeaning : reading.past.uprightMeaning },
    { position: 'Present', card: reading.present, reversed: reading.presentReversed, meaning: reading.presentReversed ? reading.present.reversedMeaning : reading.present.uprightMeaning },
    { position: 'Future', card: reading.future, reversed: reading.futureReversed, meaning: reading.futureReversed ? reading.future.reversedMeaning : reading.future.uprightMeaning },
  ]

  const positiveCount = cards.filter(c => !c.reversed).length
  const overallTheme = positiveCount >= 3 ? 'Favorable alignment — positive energy flows strongly! 🌟'
    : positiveCount >= 2 ? 'Mixed energies — balance challenges with opportunities ⚖️'
      : 'Challenging spread — but challenges bring the greatest growth 🌱'

  return { reading, cards, interpretation: reading.interpretation, overallTheme }
}

// ---------------------------------------------------------------------------
// 25. getRuneCasting
// ---------------------------------------------------------------------------

export function getRuneCasting(): {
  reading: RuneReading | null
  runes: { position: string; rune: RuneInfo }[]
  interpretation: string
  energySummary: string
} {
  const s = useDailyFortuneStore.getState()
  const reading = s.dailyRunes

  if (!reading) {
    return { reading: null, runes: [], interpretation: '', energySummary: '' }
  }

  const runes = [
    { position: 'Situation', rune: reading.situation },
    { position: 'Action', rune: reading.action },
    { position: 'Outcome', rune: reading.outcome },
  ]

  const energies = runes.map(r => r.rune.energyType)
  const energySummary = `Energy flow: ${energies.join(' → ')} | Elements: ${runes.map(r => r.rune.element).join(', ')}`

  return { reading, runes, interpretation: reading.interpretation, energySummary }
}

// ---------------------------------------------------------------------------
// 26. getFortuneScoreCard
// ---------------------------------------------------------------------------

export function getFortuneScoreCard(): {
  score: number
  mood: FortuneMood
  multiplier: number
  meterPercent: number
  meterColor: string
  moodEmoji: string
  description: string
  rewardTier: { coins: number; scoreBonus: string; itemDropBonus: string }
} {
  const s = useDailyFortuneStore.getState()
  const { fortuneScore: score, fortuneMood: mood, luckMultiplier: multiplier } = s

  const moodEmojis: Record<FortuneMood, string> = {
    amazing: '🌟', great: '😊', good: '🙂', neutral: '😐', challenging: '😅', difficult: '😢',
  }
  const moodColors: Record<FortuneMood, string> = {
    amazing: '#FBBF24', great: '#34D399', good: '#60A5FA', neutral: '#9CA3AF', challenging: '#FB923C', difficult: '#F87171',
  }
  const descriptions: Record<FortuneMood, string> = {
    amazing: 'Incredible fortune! Maximum rewards today!',
    great: 'Wonderful luck! Enhanced rewards across the board.',
    good: 'Solid fortune. Better than average rewards await.',
    neutral: 'Average fortune day. Standard rewards apply.',
    challenging: 'Fortune is testing you. Consolation prizes available.',
    difficult: 'A tough fortune day. Stay strong — tomorrow brings new luck!',
  }
  const tiers: Record<FortuneMood, { coins: number; scoreBonus: string; itemDropBonus: string }> = {
    amazing: { coins: 200, scoreBonus: '×1.5', itemDropBonus: '+20%' },
    great: { coins: 100, scoreBonus: '×1.2', itemDropBonus: '+10%' },
    good: { coins: 50, scoreBonus: '×1.1', itemDropBonus: '—' },
    neutral: { coins: 0, scoreBonus: '×1.0', itemDropBonus: '—' },
    challenging: { coins: 25, scoreBonus: '×1.0', itemDropBonus: '—' },
    difficult: { coins: 10, scoreBonus: '×1.0', itemDropBonus: '—' },
  }

  return {
    score,
    mood,
    multiplier,
    meterPercent: score,
    meterColor: moodColors[mood],
    moodEmoji: moodEmojis[mood],
    description: descriptions[mood],
    rewardTier: tiers[mood],
  }
}

// ---------------------------------------------------------------------------
// 27. getStreakCard
// ---------------------------------------------------------------------------

export function getStreakCard(): {
  streak: number
  record: number
  isActive: boolean
  milestones: { day: number; label: string; reward: number; rewardType: string; progress: number; claimed: boolean }[]
  daysUntilNext: number | null
  fireEmoji: string
} {
  const s = useDailyFortuneStore.getState()
  const streak = s.fortuneStreak
  const record = s.streakRecord
  const isActive = s.lastFortuneDate === todayISO()

  const milestoneDays = Object.keys(STREAK_MILESTONES).map(Number).sort((a, b) => a - b)
  const milestones = milestoneDays.map(day => ({
    day,
    label: STREAK_MILESTONES[day].label,
    reward: STREAK_MILESTONES[day].reward,
    rewardType: STREAK_MILESTONES[day].rewardType,
    progress: Math.min(100, Math.round((streak / day) * 100)),
    claimed: streak >= day,
  }))

  const nextMilestone = milestoneDays.find(d => d > streak)
  const daysUntilNext = nextMilestone ? nextMilestone - streak : null

  let fireEmoji = '💤'
  if (streak >= 30) fireEmoji = '🔥🔥🔥'
  else if (streak >= 14) fireEmoji = '🔥🔥'
  else if (streak >= 7) fireEmoji = '🔥'
  else if (streak >= 3) fireEmoji = '✨'
  else if (streak >= 1 && isActive) fireEmoji = '⭐'

  return { streak, record, isActive, milestones, daysUntilNext, fireEmoji }
}

// ---------------------------------------------------------------------------
// 28. getAchievementGrid
// ---------------------------------------------------------------------------

export function getAchievementGrid(): {
  achievements: {
    id: string
    name: string
    description: string
    icon: string
    earned: boolean
  }[]
  total: number
  earned: number
  completionPercent: number
} {
  const s = useDailyFortuneStore.getState()
  const achievements = ACHIEVEMENT_DEFS.map(def => ({
    id: def.id,
    name: def.name,
    description: def.description,
    icon: def.icon,
    earned: s.fortuneAchievements.includes(def.id),
  }))

  const earnedCount = achievements.filter(a => a.earned).length
  return {
    achievements,
    total: ACHIEVEMENT_DEFS.length,
    earned: earnedCount,
    completionPercent: Math.round((earnedCount / ACHIEVEMENT_DEFS.length) * 100),
  }
}

// ---------------------------------------------------------------------------
// 29. getHistoryTimeline
// ---------------------------------------------------------------------------

export function getHistoryTimeline(): {
  entries: {
    date: string
    fortune: FortuneCookie | null
    horoscope: HoroscopeReading | null
    tarot: TarotReading | null
    runes: RuneReading | null
    summary: string
  }[]
  totalDays: number
} {
  const s = useDailyFortuneStore.getState()
  const fortuneDates = new Set<string>()

  const entries: { date: string; fortune: FortuneCookie | null; horoscope: HoroscopeReading | null; tarot: TarotReading | null; runes: RuneReading | null; summary: string }[] = []

  for (const f of s.fortuneHistory) {
    if (!fortuneDates.has(f.id)) {
      fortuneDates.add(f.id)
      entries.push({ date: f.id.split('-')[0] || todayISO(), fortune: f, horoscope: null, tarot: null, runes: null, summary: `${f.emoji} ${f.message.slice(0, 40)}...` })
    }
  }

  return {
    entries: entries.slice(0, 30),
    totalDays: s.totalFortunes,
  }
}

// ---------------------------------------------------------------------------
// 30. getCollectionProgress
// ---------------------------------------------------------------------------

export function getCollectionProgress(): {
  runes: { collected: number; total: number; percent: number; missing: string[] }
  wisdom: { collected: number; total: number; percent: number }
  tarot: { readings: number; totalCards: number; uniqueCards: number; percent: number }
  fortuneRarities: { common: number; uncommon: number; rare: number; legendary: number }
} {
  const s = useDailyFortuneStore.getState()

  const allRuneNames = RUNES.map(r => r.name)
  const missingRunes = allRuneNames.filter(n => !s.runeCollection.includes(n))

  const allTarotIdsList: number[] = []
  for (const t of s.tarotHistory) {
    allTarotIdsList.push(t.past.id, t.present.id, t.future.id)
  }
  const allTarotIds = new Set(allTarotIdsList)

  const rarities = { common: 0, uncommon: 0, rare: 0, legendary: 0 }
  for (const f of s.fortuneHistory) {
    rarities[f.rarity]++
  }

  return {
    runes: { collected: s.runeCollection.length, total: 24, percent: Math.round((s.runeCollection.length / 24) * 100), missing: missingRunes },
    wisdom: { collected: s.wisdomCollection.length, total: WISDOM_QUOTES.length, percent: Math.round((s.wisdomCollection.length / WISDOM_QUOTES.length) * 100) },
    tarot: { readings: s.tarotHistory.length, totalCards: 22, uniqueCards: allTarotIds.size, percent: Math.round((allTarotIds.size / 22) * 100) },
    fortuneRarities: rarities,
  }
}

// ---------------------------------------------------------------------------
// 31. getMoodIndicator
// ---------------------------------------------------------------------------

export function getMoodIndicator(): {
  mood: FortuneMood
  emoji: string
  color: string
  bgColor: string
  label: string
  motivationalQuote: string
} {
  const s = useDailyFortuneStore.getState()
  const mood = s.fortuneMood

  const config: Record<FortuneMood, { emoji: string; color: string; bgColor: string; label: string; motivationalQuote: string }> = {
    amazing: { emoji: '🌟', color: '#FBBF24', bgColor: '#451A03', label: 'Amazing Fortune!', motivationalQuote: 'The cosmos smiles upon you today!' },
    great: { emoji: '😊', color: '#34D399', bgColor: '#022C22', label: 'Great Fortune', motivationalQuote: 'Wonderful energy surrounds your gameplay!' },
    good: { emoji: '🙂', color: '#60A5FA', bgColor: '#172554', label: 'Good Fortune', motivationalQuote: 'Solid luck today. Make the most of it!' },
    neutral: { emoji: '😐', color: '#9CA3AF', bgColor: '#1F2937', label: 'Neutral Fortune', motivationalQuote: 'An ordinary day — but extraordinary things happen unexpectedly!' },
    challenging: { emoji: '😅', color: '#FB923C', bgColor: '#431407', label: 'Challenging Fortune', motivationalQuote: 'Challenges are just opportunities in disguise!' },
    difficult: { emoji: '😢', color: '#F87171', bgColor: '#450A0A', label: 'Difficult Fortune', motivationalQuote: 'Even the darkest night will end, and the sun will rise.' },
  }

  const c = config[mood]
  return { mood, ...c }
}

// ---------------------------------------------------------------------------
// 32. getShareCode
// ---------------------------------------------------------------------------

export function getShareCode(): {
  code: string
  summary: string
  emoji: string
  expiresAt: string
} {
  const s = useDailyFortuneStore.getState()
  const today = todayISO()

  const fortuneEmoji = s.todayFortune?.emoji || '🍪'
  const scoreEmoji = s.fortuneScore >= 75 ? '🌟' : s.fortuneScore >= 50 ? '⭐' : '🌙'
  const streakEmoji = s.fortuneStreak >= 7 ? '🔥' : '✨'

  const parts = [
    s.todayFortune?.rarity || 'Common',
    `Score:${s.fortuneScore}`,
    `Streak:${s.fortuneStreak}`,
    s.zodiacSign || 'No Sign',
  ]
  const raw = parts.join('|')
  const code = btoa(raw).replace(/[^A-Z0-9]/gi, '').slice(0, 12).toUpperCase()

  const summary = `${fortuneEmoji}${scoreEmoji} Fortune Score: ${s.fortuneScore}/100 | ${streakEmoji} Streak: ${s.fortuneStreak} days | ${s.todayFortune?.rarity || 'Unknown'} fortune`

  return {
    code: `WS-${code}`,
    summary,
    emoji: `${fortuneEmoji}${scoreEmoji}${streakEmoji}`,
    expiresAt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  }
}

// ---------------------------------------------------------------------------
// 33. resetFortuneData
// ---------------------------------------------------------------------------

export function resetFortuneData(): void {
  useDailyFortuneStore.getState().resetFortuneData()
}
