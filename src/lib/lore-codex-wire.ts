// ──────────────────────────────────────────────────────────────
//  Lore Codex Wire — Word Snake World Encyclopedia System
//  SSR-safe · 40 exported lc* functions · No browser APIs
// ──────────────────────────────────────────────────────────────

// ── Type Definitions ─────────────────────────────────────────

type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

interface LoreEntry {
  id: string;
  chapterId: number;
  title: string;
  content: string;
  rarity: Rarity;
  discoveryCondition: string;
  flavorQuote: string;
  flavorAuthor: string;
  relatedEntries: string[];
  artworkDescription: string;
  wordCount: number;
  _isRead?: boolean;
  _isDiscovered?: boolean;
  _readAt?: number;
}

interface LoreChapter {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  entryIds: string[];
  icon: string;
  unlockScore: number;
  _readCount?: number;
  _totalEntries?: number;
}

interface Character {
  id: string;
  name: string;
  portrait: string;
  title: string;
  affiliation: string;
  background: string;
  quotes: string[];
  relationships: { characterId: string; type: "ally" | "rival" | "mentor"; note: string }[];
}

interface TimelineEvent {
  id: string;
  age: string;
  year: number;
  title: string;
  description: string;
  consequences: string[];
}

interface SecretEntry {
  id: string;
  title: string;
  content: string;
  unlockCode: string;
  rarity: Rarity;
  relatedEntries: string[];
  _unlockedAt?: number;
}

interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  reward: number;
  loreEntryId: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  condition: string;
  reward: number;
  icon: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

interface LoreState {
  readEntries: Record<string, number>;
  discoveredEntries: Record<string, number>;
  unlockedSecrets: Record<string, number>;
  triviaAnswered: Record<string, { answer: number; correct: boolean; at: number }>;
  totalLorePoints: number;
  totalWordsRead: number;
  readingStreak: number;
  lastReadDate: number;
  achievements: Achievement[];
  unlockedAchievements: string[];
  dailyTriviaAnsweredToday: boolean;
}

type MasteryRank = "Novice" | "Scholar" | "Sage" | "Archivist" | "Loremaster";

// ── Static Data: Chapters ────────────────────────────────────

const CHAPTERS: LoreChapter[] = [
  {
    id: 1, title: "Origin of the Word Serpent", subtitle: "The Beginning of All Language",
    description: "In the primordial void before language existed, the first serpent of words emerged from the silence, coiling letters into existence and breathing meaning into the alphabet.",
    entryIds: ["origin-1", "origin-2", "origin-3", "origin-4", "origin-5"],
    icon: "🐍", unlockScore: 0,
  },
  {
    id: 2, title: "The Alphabet Wars", subtitle: "When Letters Clashed for Supremacy",
    description: "The great conflict that reshaped the linguistic landscape. Vowels and consonants fought for dominance, forging alliances and betrayals that echo in every word we speak today.",
    entryIds: ["wars-1", "wars-2", "wars-3", "wars-4", "wars-5"],
    icon: "⚔️", unlockScore: 500,
  },
  {
    id: 3, title: "Rise of the Letter Kingdoms", subtitle: "Kingdoms Forged in Ink and Parchment",
    description: "From the ashes of the Alphabet Wars, the surviving letters founded great kingdoms, each with their own dialects, customs, and ancient grievances.",
    entryIds: ["kingdoms-1", "kingdoms-2", "kingdoms-3", "kingdoms-4", "kingdoms-5"],
    icon: "🏰", unlockScore: 1500,
  },
  {
    id: 4, title: "The Great Vowel Shift", subtitle: "A Cataclysm of Pronunciation",
    description: "The seismic event that reshaped spoken language forever. Vowels migrated across the phonetic landscape, uprooting entire civilizations of words and leaving new meanings in their wake.",
    entryIds: ["vowel-1", "vowel-2", "vowel-3", "vowel-4", "vowel-5"],
    icon: "🌪️", unlockScore: 3000,
  },
  {
    id: 5, title: "Age of the Consonants", subtitle: "The Silent Builders of Meaning",
    description: "While vowels basked in their sonic glory, the consonants quietly built the structural foundation of language. Their silent strength held every word together.",
    entryIds: ["consonant-1", "consonant-2", "consonant-3", "consonant-4", "consonant-5"],
    icon: "🧱", unlockScore: 5000,
  },
  {
    id: 6, title: "The Punctuation Rebellion", subtitle: "When Marks Demanded Their Due",
    description: "The punctuation marks, long marginalized as mere decorations, rose up to demand equal recognition. Their rebellion proved that meaning lives not just in words, but in the spaces between them.",
    entryIds: ["punct-1", "punct-2", "punct-3", "punct-4"],
    icon: "✊", unlockScore: 8000,
  },
  {
    id: 7, title: "Digital Dawn", subtitle: "The Age of Binary Tongues",
    description: "As the analog world crumbled, a new civilization emerged from circuits and silicon. The old letter kingdoms had to adapt or face obsolescence in the digital frontier.",
    entryIds: ["digital-1", "digital-2", "digital-3", "digital-4"],
    icon: "💻", unlockScore: 12000,
  },
  {
    id: 8, title: "Prophecies of the Lexicon", subtitle: "The Final Chapter Has Yet to Be Written",
    description: "Ancient prophecies foretell the coming of the Ultimate Word, a combination of all linguistic forces that will either unite the kingdoms forever or dissolve language back into primordial silence.",
    entryIds: ["prophecy-1", "prophecy-2", "prophecy-3", "prophecy-4"],
    icon: "🔮", unlockScore: 20000,
  },
];

// ── Static Data: Lore Entries (37 entries) ───────────────────

const ENTRIES: LoreEntry[] = [
  // ── Chapter 1: Origin of the Word Serpent ──
  {
    id: "origin-1", chapterId: 1, title: "The Primordial Silence",
    content: "Before the first word was ever spoken, there existed only the Great Silence — an infinite expanse of unformed thought and unspoken intention. The Serpent, a creature born not of flesh but of pure potential, slithered through this void, trailing wisps of meaning behind it. Where its scales touched the nothingness, letters began to crystallize like frost on a winter window. Each letter was a tiny spark of creation, a fragment of thought given tangible form. The Serpent did not create language deliberately; rather, language was the inevitable consequence of its existence. As it coiled and uncoiled through the primordial darkness, the first syllables echoed through the void, and the foundations of every alphabet were laid. Scholars debate whether the Serpent was sentient or merely a cosmic force, but all agree on one point: without its passage through the silence, communication would never have been born.",
    rarity: "Legendary", discoveryCondition: "Start the game for the first time",
    flavorQuote: "In the beginning was not the word, but the serpent that carried it.",
    flavorAuthor: "The Serpent King", relatedEntries: ["origin-2", "origin-3", "prophecy-1"],
    artworkDescription: "A luminous serpent made of flowing golden letters coiling through a vast dark void, leaving trails of crystallized alphabets in its wake.",
    wordCount: 172,
  },
  {
    id: "origin-2", chapterId: 1, title: "Birth of the First Alphabet",
    content: "When the Serpent had traversed enough of the void, the letters it left behind began to organize themselves into patterns. The first alphabet emerged not from design but from gravitational attraction — letters that shared phonetic qualities clustered together like stars forming constellations. A grouped with E and I, drawn by their open-mouthed resonance, while B and P orbited each other in their plosive similarity. This celestial arrangement became known as the Proto-Alphabet, the template from which all written systems would descend. The alphabet possessed a strange beauty: it was at once a map of human vocal capabilities and a mirror of the cosmic order. Each letter carried the weight of creation itself, and those who learned to read them could glimpse the Serpent's original path through the void.",
    rarity: "Epic", discoveryCondition: "Reach a score of 100",
    flavorQuote: "The letters chose each other long before we learned to choose them.",
    flavorAuthor: "Professor Lexicon", relatedEntries: ["origin-1", "origin-3", "wars-1"],
    artworkDescription: "Letters floating in a cosmic void, gravitationally clustering into constellation-like patterns, each cluster glowing with its own color.",
    wordCount: 153,
  },
  {
    id: "origin-3", chapterId: 1, title: "The Serpent Speaks Its Name",
    content: "For millennia, the Serpent remained silent, content to weave letters through the fabric of reality. But one day, according to the oldest surviving texts, it opened its mouth and spoke its own name. The sound was unlike anything the nascent alphabet had produced before — a complex vibration that contained every phoneme simultaneously. Those who witnessed this moment described it as hearing every word ever spoken and every word yet to come, all compressed into a single syllable that lasted exactly seven heartbeats. The Serpent's true name remains the most closely guarded secret in linguistic history. It is said that whoever pronounces it correctly gains the ability to reshape language itself, bending words to their will. This legend gave rise to the practice of word magic, where skilled linguists could manipulate reality through careful arrangement of letters.",
    rarity: "Legendary", discoveryCondition: "Discover 10 unique words in a single game",
    flavorQuote: "To name something is to control it. To name oneself is to become a god.",
    flavorAuthor: "The Punctuation Prophet", relatedEntries: ["origin-1", "origin-4", "prophecy-4"],
    artworkDescription: "A massive serpent head with eyes made of swirling letters, its open mouth releasing a wave of rainbow-colored sound waves that distort the surrounding alphabet.",
    wordCount: 168,
  },
  {
    id: "origin-4", chapterId: 1, title: "The First Wordsmiths",
    content: "The first humans to encounter the Serpent's letter trails were not linguists but hunters who followed strange glowing paths through the wilderness. These paths, formed by crystallized letters, led them to clearings where meaning itself seemed to hang in the air like morning mist. The hunters began collecting the letters, carrying them in leather pouches, and arranging them in patterns that produced unexpected effects. A combination that roughly spelled 'water' caused springs to bubble from dry ground; another that evoked 'fire' made flames dance without fuel. These first wordsmiths became the shamans and priests of early civilizations, revered for their ability to channel the power of the Serpent's creation. They founded the first Guild of Words, an organization that would endure for thousands of years and eventually evolve into the Lexicon Academy.",
    rarity: "Rare", discoveryCondition: "Play 5 games",
    flavorQuote: "We did not invent words. We found them, glimmering in the dirt like precious stones.",
    flavorAuthor: "Scroll Keeper", relatedEntries: ["origin-2", "origin-5", "kingdoms-1"],
    artworkDescription: "Ancient hunters in a primeval forest discovering glowing letters embedded in the ground, collecting them into leather pouches with reverent expressions.",
    wordCount: 162,
  },
  {
    id: "origin-5", chapterId: 1, title: "The Covenant of Syllables",
    content: "As more humans learned to wield the power of letters, conflicts inevitably arose. Wordsmiths who hoarded powerful letter combinations clashed with those who believed language should be shared freely. To prevent all-out war, the greatest wordsmiths of the age gathered at what they called the Syllable Summit and forged the Covenant — a sacred agreement that bound all practitioners to three rules: first, that no word should be used to unmake another word; second, that every speaker had the right to learn any letter; and third, that the Serpent's true name must never be spoken except in the direst need. The Covenant held for centuries and became the foundation of linguistic ethics. Breaking it was considered the worst possible offense, worse than any crime against person or property, because it threatened the very fabric of meaning that held civilization together.",
    rarity: "Epic", discoveryCondition: "Reach word streak of 15",
    flavorQuote: "Words are not weapons. They are the peace treaties between silence and meaning.",
    flavorAuthor: "Rune Weaver", relatedEntries: ["origin-3", "origin-4", "wars-1"],
    artworkDescription: "A dramatic summit scene where robed figures gather around a stone tablet inscribed with glowing runes, signing the Covenant under a sky filled with floating letters.",
    wordCount: 170,
  },

  // ── Chapter 2: The Alphabet Wars ──
  {
    id: "wars-1", chapterId: 2, title: "The First Schism",
    content: "The peace of the Covenant lasted three hundred years before a faction of consonant-purists declared that vowels were inherently corrupting. Led by the warlord known only as Stone Throat, they argued that vowels allowed too much ambiguity in meaning and that true linguistic purity could only be achieved through consonants alone. The Vowel Queen, then a young and newly crowned ruler, refused this accusation and mobilized her vowel kingdoms in defense. The First Schism divided the alphabet world in half: the Vowel Alliance and the Consonant Coalition. Skirmishes began at the borders of words where vowels and consonants met, and entire words were torn apart as letters defected to one side or the other. The war would reshape language in ways nobody could have predicted, and its echoes can still be heard in every irregular verb and silent letter.",
    rarity: "Epic", discoveryCondition: "Reach a score of 500",
    flavorQuote: "Consonants build the walls. Vowels give them meaning. One without the other is a prison.",
    flavorAuthor: "Vowel Queen", relatedEntries: ["origin-5", "wars-2", "wars-3"],
    artworkDescription: "A split landscape divided by a glowing fissure, vowels on one side shining in warm colors, consonants on the other in cool stone hues, armies facing each other.",
    wordCount: 165,
  },
  {
    id: "wars-2", chapterId: 2, title: "Battle of the Diphthong Pass",
    content: "The most decisive engagement of the Alphabet Wars took place at Diphthong Pass, a narrow valley where two vowel sounds merged into one. The Consonant Coalition had laid a trap, positioning silent letters along the ridgelines to ambush the advancing Vowel Alliance. But the Vowel Queen anticipated the strategy and deployed her diphthong battalions — elite warriors who could blend two vowel sounds into a single devastating attack. The battle lasted three days and three nights, with the very air trembling from the clash of phonemes. In the end, the diphthongs broke through the consonant lines, but at a terrible cost. The pass itself was shattered, and the resulting linguistic debris formed the irregular spellings that plague English to this day. Both sides retreated, neither able to claim victory.",
    rarity: "Rare", discoveryCondition: "Use 20 different words in one session",
    flavorQuote: "Two sounds become one, and that one becomes a weapon sharper than any consonant.",
    flavorAuthor: "Consonant Knight", relatedEntries: ["wars-1", "wars-3", "vowel-1"],
    artworkDescription: "A narrow mountain pass where two streams of vowel-energy merge into a brilliant beam of light, shattering consonant fortifications on the ridges above.",
    wordCount: 161,
  },
  {
    id: "wars-3", chapterId: 2, title: "The Treachery of Silent Letters",
    content: "Midway through the Alphabet Wars, a third faction emerged: the Silent Ones. These were letters that had lost their voices through centuries of linguistic evolution — the K in 'knight,' the W in 'wrist,' the G in 'gnaw.' Led by the enigmatic Silent E, who could make or break the pronunciation of any word, the Silent Ones played both sides against each other with devastating effect. They would join consonant formations, render themselves invisible, and emerge behind vowel lines to cause chaos. Their treachery was so effective that both the Vowel Alliance and Consonant Coalition briefly united against them, the only time such cooperation occurred during the entire war. The Silent Ones were eventually driven to the margins of language, but they never truly disappeared — they wait in every word, ready to be called upon again.",
    rarity: "Legendary", discoveryCondition: "Find a word with 3+ silent letters",
    flavorQuote: "We do not speak, and that is precisely why we are the most dangerous.",
    flavorAuthor: "Silent E", relatedEntries: ["wars-1", "wars-4", "consonant-3"],
    artworkDescription: "Ghostly, translucent letters drifting between two opposing armies, their forms flickering between visibility and invisibility as they carry messages of betrayal.",
    wordCount: 168,
  },
  {
    id: "wars-4", chapterId: 2, title: "Siege of the Lexicon Citadel",
    content: "The Lexicon Citadel, home to the ancient Guild of Words, became the last neutral ground during the Alphabet Wars. Both sides coveted its vast libraries, which contained records of every word ever created and detailed maps of the Serpent's original path. Professor Lexicon, the keeper of the citadel, refused to take sides and instead fortified the building with defensive spells woven from forgotten words. For forty days and forty nights, the citadel withstood bombardment from both vowel and consonant forces. The turning point came when the Professor discovered an ancient word of power — a combination so old it predated the Covenant itself. Speaking it caused all weapons in the vicinity to lose their meaning, transforming swords into plowshares and war cries into lullabies. Both armies withdrew in stunned silence.",
    rarity: "Epic", discoveryCondition: "Complete 50 games total",
    flavorQuote: "A library is the most dangerous fortress in the world, for it contains weapons that never dull.",
    flavorAuthor: "Professor Lexicon", relatedEntries: ["origin-4", "wars-3", "wars-5"],
    artworkDescription: "A magnificent citadel made entirely of books and scrolls, surrounded by shimmering protective runes, standing defiant against armies on all sides.",
    wordCount: 163,
  },
  {
    id: "wars-5", chapterId: 2, title: "The Treaty of Syllable's End",
    content: "Exhausted by years of conflict, representatives of every faction gathered at the ruins of Diphthong Pass to negotiate peace. The Wild Card Jester, a neutral figure beloved by all sides, served as mediator. The resulting Treaty of Syllable's End established the Alphabetic Concordance — a new framework that recognized the equal importance of every letter regardless of sound or silence. Vowels were granted dominion over the hearts of words; consonants were given authority over word beginnings and endings; and the Silent Ones received the honorary title of Guardians of Pronunciation, tasked with preserving the memory of how words used to sound. The treaty also created the position of the Word Serpent Arbiter, a role that would later be filled by the Serpent King himself, ensuring that the balance between all linguistic forces would be maintained.",
    rarity: "Legendary", discoveryCondition: "Unlock all Chapter 1 entries",
    flavorQuote: "Peace is just another word, but it is the hardest one to spell correctly.",
    flavorAuthor: "Wild Card Jester", relatedEntries: ["wars-1", "wars-4", "kingdoms-1"],
    artworkDescription: "A grand diplomatic scene at a mountain pass, where delegates of vowels, consonants, and silent letters sign a glowing treaty scroll under a rainbow sky.",
    wordCount: 170,
  },

  // ── Chapter 3: Rise of the Letter Kingdoms ──
  {
    id: "kingdoms-1", chapterId: 3, title: "The Five Great Kingdoms",
    content: "Following the Treaty of Syllable's End, the alphabet reorganized itself into five great kingdoms, each centered around a dominant linguistic principle. The Kingdom of Aetheria, ruled by the Vowel Queen, governed all open-syllable words and vowel harmony. The Fortress of Consonance, led by the Consonant Knight, controlled word boundaries and cluster formations. The Silent Domain, where Silent E reigned, managed pronunciation shifts and magical e-additions. The Wildlands, patrolled by the Wild Card Jester, served as a neutral zone for new words still finding their linguistic identity. Finally, the Free States of Punctuation, governed by the Punctuation Prophet, oversaw the marks that gave words their rhythm and meaning. Each kingdom had its own laws, customs, and dialects, but all answered to the Word Serpent Arbiter in matters of inter-kingdom disputes.",
    rarity: "Rare", discoveryCondition: "Reach a score of 1500",
    flavorQuote: "Five kingdoms, one alphabet, infinite possibilities.",
    flavorAuthor: "The Serpent King", relatedEntries: ["wars-5", "kingdoms-2", "kingdoms-3"],
    artworkDescription: "A medieval-style map showing five distinct colorful kingdoms arranged in a pentagonal pattern, connected by roads made of flowing text.",
    wordCount: 162,
  },
  {
    id: "kingdoms-2", chapterId: 3, title: "Aetheria: The Vowel Realm",
    content: "Aetheria was the most beautiful of the five kingdoms, a land where every surface shimmered with the warm resonance of spoken vowels. The capital city, Sonora, was built entirely from the sounds of 'ah,' 'eh,' 'ee,' 'oh,' and 'oo,' each district resonating with its own vowel quality. The streets of the 'A' district were wide and open, reflecting the vowel's expansive nature; the 'I' district was tall and narrow, mirroring the vowel's high, pointed sound. The Vowel Queen ruled from the Palace of Open Syllables, a structure with no consonant walls — it was held together purely by the tension between vowel sounds. Visitors to Aetheria reported feeling a strange euphoria, as if the very air was singing to them. This effect, known as the Vowel Glow, made Aetheria the most popular tourist destination in the alphabet world.",
    rarity: "Uncommon", discoveryCondition: "Use all 5 standard vowels in one word",
    flavorQuote: "Every song begins and ends with a vowel. We are the alpha and omega of sound.",
    flavorAuthor: "Vowel Queen", relatedEntries: ["kingdoms-1", "kingdoms-3", "vowel-1"],
    artworkDescription: "An ethereal cityscape where buildings are formed from flowing vowel-sounds made visible as colored light, with a grand palace at the center glowing warmly.",
    wordCount: 167,
  },
  {
    id: "kingdoms-3", chapterId: 3, title: "The Fortress of Consonance",
    content: "If Aetheria was beauty, the Fortress of Consonance was strength. Located in the rugged highlands between the Throat Mountains and the Lip Ridge, this kingdom was built for endurance. Its capital, Hardstadt, featured walls constructed from the toughest consonant clusters: 'str,' 'spl,' 'nth,' and the dreaded 'ngth.' The Consonant Knight, a warrior of few words (literally — he communicated primarily through stops and fricatives), trained an elite guard of consonant warriors who could form impenetrable defensive formations. The kingdom's greatest pride was the Bridge of Blend, a massive structure where liquid consonants (L and R) flowed together to create a crossing over the Chasm of Mispronunciation. It was said that only those with perfect diction could cross without falling into the chasm below, where forgotten consonants waited eternally for someone to remember them.",
    rarity: "Uncommon", discoveryCondition: "Form a word starting with a 3-consonant cluster",
    flavorQuote: "Vowels may be the soul of a word, but consonants are its backbone. Try standing without one.",
    flavorAuthor: "Consonant Knight", relatedEntries: ["kingdoms-1", "kingdoms-4", "consonant-1"],
    artworkDescription: "A imposing mountain fortress with walls made of interlocking consonant letters, connected to a luminous bridge over a misty chasm filled with ghostly faded letters.",
    wordCount: 172,
  },
  {
    id: "kingdoms-4", chapterId: 3, title: "The Wildlands of Unformed Words",
    content: "The Wildlands existed at the edges of linguistic civilization, a frontier where newly coined words and borrowed terms from other languages struggled to find their place in the alphabet world. The Wild Card Jester served as the informal governor of this chaotic territory, welcoming every word regardless of its origin or spelling. In the Wildlands, portmanteaus wrestled with loanwords, acronyms skirmished with abbreviations, and neologisms sprouted like wildflowers after rain. The Jester's only law was that no word should be turned away, a policy that occasionally led to spectacular linguistic disasters — words with incompatible letter combinations that exploded into fragments when spoken. The Glyph Guardian patrolled the borders of the Wildlands, ensuring that truly dangerous words (those that could unravel meaning itself) were kept contained in the Deep Lexicon, a vault beneath the earth where the most unstable linguistic constructs were imprisoned.",
    rarity: "Rare", discoveryCondition: "Use a word longer than 10 letters",
    flavorQuote: "Every great word was once a stranger. Welcome them all, and let meaning sort itself out.",
    flavorAuthor: "Wild Card Jester", relatedEntries: ["kingdoms-1", "kingdoms-5", "digital-1"],
    artworkDescription: "A wild, untamed landscape where half-formed words float like bubbles, some merging, some popping, with a jester-like figure welcoming newcomers at the border.",
    wordCount: 172,
  },
  {
    id: "kingdoms-5", chapterId: 3, title: "The Free States of Punctuation",
    content: "The Free States of Punctuation occupied the spaces between words, a network of territories that most letters barely noticed but which were absolutely essential to meaning. Led by the Punctuation Prophet, these states maintained the rhythm, clarity, and emotional tone of all communication. The Period Prefecture enforced boundaries between thoughts. The Comma Commonwealth managed pauses and breath. The Question Mark Queendom oversaw inquiry and doubt. The Exclamation Emirate handled emphasis and excitement. And the Semicolon Syndicate, the most controversial of all punctuation states, facilitated complex relationships between independent clauses. The Prophet's greatest challenge was the Apostrophe Rebellion — a faction of apostrophes that demanded recognition not just as punctuation marks but as full letters. The conflict remains unresolved to this day.",
    rarity: "Uncommon", discoveryCondition: "Score 3000 total points across all games",
    flavorQuote: "Without us, words run together like frightened animals. We are the fences that give them room to breathe.",
    flavorAuthor: "The Punctuation Prophet", relatedEntries: ["kingdoms-1", "punct-1", "punct-2"],
    artworkDescription: "A series of floating islands connected by dotted lines, each island shaped like a different punctuation mark, with a prophet figure standing on the largest island holding a quill.",
    wordCount: 169,
  },

  // ── Chapter 4: The Great Vowel Shift ──
  {
    id: "vowel-1", chapterId: 4, title: "The Seismic Tremor",
    content: "It began as a subtle vibration in the long vowels of Middle English, barely noticeable at first. The letter A, which had been comfortably producing an 'ah' sound for centuries, suddenly found itself sliding upward in the mouth toward 'ay.' E followed, pushing from 'eh' toward 'ee.' The Vowel Queen sensed the disturbance immediately — she could feel her subjects shifting in their phonetic beds, unable to maintain their traditional positions. The cause was unknown at first. Some blamed the Consonant Knight's fortress-building, which had altered the resonance of neighboring consonants. Others pointed to the Wildlands, where foreign vowels from borrowed words were exerting gravitational pull on native sounds. The truth was more cosmic: the Serpent itself was dreaming, and in its dream, it was rearranging the fundamental sounds of language.",
    rarity: "Epic", discoveryCondition: "Reach a score of 3000",
    flavorQuote: "The ground beneath our tongues is not as solid as we believed.",
    flavorAuthor: "Vowel Queen", relatedEntries: ["wars-2", "vowel-2", "kingdoms-2"],
    artworkDescription: "A dramatic scene where vowel letters are physically displaced from their positions, with seismic cracks spreading across a landscape made of phonetic symbols.",
    wordCount: 163,
  },
  {
    id: "vowel-2", chapterId: 4, title: "The Great Migration",
    content: "As the vowel shift intensified, entire populations of vowels began migrating across the phonetic landscape. Long vowels moved upward and forward in the mouth, a phenomenon linguists would later call the Great Migration. The letter I, previously content at the front of the mouth, pushed its way to the highest position, creating the 'eye' sound that would become standard in Modern English. O followed a similar path, shifting from a rounded back position to a more centralized 'oh' sound. This migration caused chaos across the letter kingdoms. Words that had been stable for centuries suddenly sounded completely different. 'Name' no longer rhymed with 'calm.' 'House' lost its relationship to 'mouse' (though it kept it with 'mouse' — some bonds proved unbreakable). The Vowel Queen established refugee camps for displaced vowels, but the scale of the crisis overwhelmed her resources.",
    rarity: "Rare", discoveryCondition: "Find 3 words that changed pronunciation historically",
    flavorQuote: "We did not choose to move. The very shape of our sounds was being rewritten by forces beyond our control.",
    flavorAuthor: "Vowel Queen", relatedEntries: ["vowel-1", "vowel-3", "vowel-4"],
    artworkDescription: "A vast migration scene with vowel letters traveling in caravans across a shifting phonetic landscape, some struggling through difficult terrain representing mouth positions.",
    wordCount: 167,
  },
  {
    id: "vowel-3", chapterId: 4, title: "When Words Lost Their Rhymes",
    content: "Perhaps the most heartbreaking consequence of the Great Vowel Shift was the dissolution of ancient rhymes. Pairs of words that had been bonded by sound for generations found themselves suddenly unable to recognize each other. 'Blood' and 'good,' once perfect rhyming partners, drifted apart like continents. 'Breath' and 'death' clung to each other desperately but could not maintain their harmony. Poets were devastated. The Cipher Sage, who had spent her life cataloging rhyming pairs, watched her life's work become obsolete in real-time. She founded the Rhyming Rescue Society, an organization dedicated to finding new rhyme partners for displaced words. Some words refused new partners and became what linguists call 'orphan words' — words with no perfect rhyme in the entire language. 'Silver,' 'month,' and 'orange' became the most famous orphans, their loneliness a permanent reminder of the vowel shift's destructive power.",
    rarity: "Epic", discoveryCondition: "Create 10 rhyming word pairs in one game",
    flavorQuote: "A rhyme is a promise between two words. The vowel shift broke a thousand promises.",
    flavorAuthor: "Cipher Sage", relatedEntries: ["vowel-2", "vowel-4", "vowel-5"],
    artworkDescription: "Two words reaching for each other across a widening chasm of changed sounds, their once-identical vowel structures now visibly different, a tearful scene.",
    wordCount: 172,
  },
  {
    id: "vowel-4", chapterId: 4, title: "The Consonant Knights' Response",
    content: "While vowels scrambled to find their new positions, the Consonant Knight saw an opportunity. With the vowel kingdoms in disarray, consonants could expand their influence into previously vowel-dominated territory. He launched the Border Fortification Initiative, constructing new consonant clusters at the edges of vowel territories. 'STR' walls went up around the northern provinces. 'BL' and 'BR' battlements guarded the western approaches. The Glyph Guardian opposed this expansion, arguing that consonants should instead focus on supporting vowels through the transition rather than exploiting their vulnerability. The Knight ignored these objections, and for a brief period, consonant-heavy words dominated the language. This era gave us words like 'strengths,' 'squirrel,' and 'twelfth' — marvels of consonant density that remain among the most difficult words to pronounce in English.",
    rarity: "Rare", discoveryCondition: "Use 5 consonant-heavy words (7+ consonants) in one game",
    flavorQuote: "When vowels falter, consonants endure. We are the bedrock upon which language rebuilds.",
    flavorAuthor: "Consonant Knight", relatedEntries: ["vowel-1", "consonant-1", "consonant-2"],
    artworkDescription: "Armies of consonant letters building stone walls at vowel kingdom borders, with a knight on horseback overseeing the construction of formidable consonant clusters.",
    wordCount: 168,
  },
  {
    id: "vowel-5", chapterId: 4, title: "The New Harmony",
    content: "After decades of upheaval, the Great Vowel Shift gradually settled into what scholars call the New Harmony. Vowels found stable positions in the mouth that, while different from their original locations, created a balanced and expressive phonetic system. The English language emerged from the crisis with a richer range of vowel sounds than any other European language — a silver lining hidden within decades of chaos. The Vowel Queen, now aged by the ordeal, declared a Day of Resonance to celebrate the new vowel arrangements. Every vowel was invited to demonstrate its new sound, and the resulting symphony was said to be the most beautiful auditory experience in linguistic history. The New Harmony also created new rhyme pairs that had never existed before, giving poets fresh material and helping orphan words find new companions. 'Love' and 'dove,' 'moon' and 'June' — new relationships forged in the crucible of phonetic change.",
    rarity: "Legendary", discoveryCondition: "Unlock all Chapter 3 entries",
    flavorQuote: "From chaos comes a new kind of beauty, if you have the patience to listen for it.",
    flavorAuthor: "Echo Scribe", relatedEntries: ["vowel-3", "vowel-4", "consonant-1"],
    artworkDescription: "A triumphant scene where vowel letters stand on a stage, each radiating its new sound as colored light, forming a harmonious rainbow above an applauding audience of consonants.",
    wordCount: 170,
  },

  // ── Chapter 5: Age of the Consonants ──
  {
    id: "consonant-1", chapterId: 5, title: "The Silent Builders",
    content: "In the aftermath of the Great Vowel Shift, a quiet revolution took place. While vowels basked in the glory of their new arrangements, consonants began a systematic project to strengthen the structural foundations of every word. They called themselves the Silent Builders, and their work went largely unnoticed for centuries. Every time a consonant cluster was tightened, every time a digraph was refined ('sh,' 'ch,' 'th,' 'ph'), the Builders were at work. They operated in the shadows of words, reinforcing connections between syllables and ensuring that even the most vowel-heavy words maintained their structural integrity. The Consonant Knight served as their public face, but the real work was done by unsung heroes like the Rune Weaver and the Glyph Guardian, who spent countless hours designing new consonant patterns that could support increasingly complex vocabulary.",
    rarity: "Uncommon", discoveryCondition: "Reach a score of 5000",
    flavorQuote: "Vowels get the applause, but consonants build the stage.",
    flavorAuthor: "Rune Weaver", relatedEntries: ["vowel-5", "consonant-2", "consonant-3"],
    artworkDescription: "Consonant letters working in shadowy underground workshops, forging digraphs and clusters at anvils, with sparks of linguistic energy flying from their hammers.",
    wordCount: 158,
  },
  {
    id: "consonant-2", chapterId: 5, title: "The Digraph Wars",
    content: "Not all consonant cooperation was peaceful. The Digraph Wars erupted when single consonants began competing for partnership rights with each other. Every consonant wanted to be part of a digraph — two letters that combined to create a single new sound — because digraphs carried significantly more linguistic power than solitary consonants. T and H fought over the right to create the 'th' sound, with each claiming primary authorship. S and H similarly disputed the 'sh' digraph. The conflict threatened to tear apart the consonant alliance until the Cipher Sage proposed the Digraph Accord: both letters in a digraph would share equal credit for the resulting sound, with neither considered subordinate. The accord was signed, but tensions linger. To this day, certain consonants eye potential partners with suspicion, unsure whether alliance or betrayal awaits.",
    rarity: "Rare", discoveryCondition: "Use 10 words containing digraphs in one game",
    flavorQuote: "Two letters, one sound, zero ego. That is the digraph ideal. Reality, as always, is messier.",
    flavorAuthor: "Cipher Sage", relatedEntries: ["consonant-1", "consonant-3", "wars-3"],
    artworkDescription: "A diplomatic table where pairs of consonant letters sit across from each other, negotiating their partnership terms with scrolls and quills between them.",
    wordCount: 162,
  },
  {
    id: "consonant-3", chapterId: 5, title: "Silent E: The Invisible Architect",
    content: "No single consonant has had more influence on English pronunciation than Silent E, despite making no sound whatsoever. The Invisible Architect, as E came to be known, possessed the unique ability to change a preceding vowel from short to long simply by sitting at the end of a word. 'Mat' became 'mate,' 'bit' became 'bite,' 'hop' became 'hope.' Silent E's power was so great that entire word families were restructured around it. But this power came at a cost — the more words Silent E influenced, the more it faded from spoken language, becoming a ghost letter that appeared in writing but vanished in speech. The Vowel Queen both admired and feared Silent E, recognizing it as a consonant that had essentially stolen vowel power. Their relationship remains the most complicated in all of letter politics, a blend of mutual respect and deep-seated rivalry.",
    rarity: "Epic", discoveryCondition: "Form 15 words using silent E pattern",
    flavorQuote: "My silence speaks louder than your loudest vowel. That is not arrogance; that is geometry.",
    flavorAuthor: "Silent E", relatedEntries: ["wars-3", "consonant-1", "consonant-4"],
    artworkDescription: "A translucent E floating at the end of words, each word transforming from a muted color to a vibrant one as E passes, while the E itself remains ghostly and invisible.",
    wordCount: 168,
  },
  {
    id: "consonant-4", chapterId: 5, title: "The Great Compression",
    content: "As English vocabulary expanded exponentially, pressure mounted on consonants to do more with less space. The Great Compression was a period of intense linguistic engineering during which multiple consonant sounds were compressed into smaller and smaller written forms. The 'ough' cluster, which could represent seven different pronunciations ('though,' 'through,' 'rough,' 'tough,' 'cough,' 'thought,' 'bough'), became the most notorious example of compression gone awry. The Glyph Guardian argued that this compression was unsustainable and that words would eventually collapse under their own phonetic weight. She proposed the Decompression Initiative, which advocated for spelling reform to ease the burden on consonants. The initiative was rejected by the Consonant Knight, who viewed any weakening of consonant density as a betrayal of their structural mission. The debate continues to this day in every argument about English spelling reform.",
    rarity: "Uncommon", discoveryCondition: "Use a word with 'ough' in it",
    flavorQuote: "We compressed too much, and now 'ough' carries the weight of seven different sounds. Even Atlas would stagger.",
    flavorAuthor: "Glyph Guardian", relatedEntries: ["consonant-2", "consonant-5", "digital-2"],
    artworkDescription: "Consonant letters being physically compressed into smaller boxes, with the 'ough' cluster visibly straining under the pressure of containing multiple sound-waves simultaneously.",
    wordCount: 172,
  },
  {
    id: "consonant-5", chapterId: 5, title: "The Consonant Alliance Treaty",
    content: "The crowning achievement of the consonant era was the Consonant Alliance Treaty, a comprehensive agreement that categorized every consonant by its phonetic properties and assigned each a specific role in word construction. Stops (P, B, T, D, K, G) were designated as word initiators and terminators. Fricatives (F, V, S, Z, SH, TH) became the connectors and texture providers. Nasals (M, N, NG) were appointed as bridges between syllables. Liquids (L, R) and glides (W, Y) served as flexible modifiers that could adapt to any context. The treaty also established the Consonant Council, a governing body that would adjudicate disputes and coordinate construction projects. The Consonant Knight chaired the council, with the Glyph Guardian as his chief advisor. Together, they ensured that every word in English had a solid consonant framework capable of supporting any vowel arrangement.",
    rarity: "Rare", discoveryCondition: "Reach a score of 8000",
    flavorQuote: "Organized labor builds civilizations. Organized consonants build words.",
    flavorAuthor: "Consonant Knight", relatedEntries: ["consonant-1", "consonant-4", "punct-1"],
    artworkDescription: "A grand council chamber where consonants are arranged by phonetic type in tiered seating, with the Knight at the head signing a treaty with a pen made from a stylus.",
    wordCount: 172,
  },

  // ── Chapter 6: The Punctuation Rebellion ──
  {
    id: "punct-1", chapterId: 6, title: "The Marks That Marched",
    content: `For too long, punctuation marks had been treated as afterthoughts — decorative additions to the 'real' content of letters. But in what historians call the Punctuation Rebellion, the marks rose up in unprecedented numbers. The Period, the oldest and most respected mark, led the march with quiet determination, stating simply: 'I am the difference between "Let us eat Grandma" and "Let us eat, Grandma."' This rallying cry united marks of all kinds. The Comma joined immediately, bringing its talent for creating pauses and clarifying meaning. The Exclamation Point brought passion and volume to the movement, while the Question Mark challenged the very authority of statements. Even the lowly Hyphen, which had spent years being confused with the Dash, joined the rebellion, proving that even the smallest marks could play a crucial role in meaning.`,
    rarity: "Rare", discoveryCondition: "Reach a score of 10000",
    flavorQuote: "Without me, sentences run on forever like rivers with no banks. I am the bank.",
    flavorAuthor: "The Period", relatedEntries: ["kingdoms-5", "punct-2", "punct-3"],
    artworkDescription: "An army of punctuation marks marching in formation across a plain, each mark carrying a banner that shows how it changes meaning when applied to text.",
    wordCount: 163,
  },
  {
    id: "punct-2", chapterId: 6, title: "The Apostrophe's Declaration",
    content: "The most dramatic moment of the Punctuation Rebellion came when the Apostrophe issued its Declaration of Identity. This small, curved mark had long suffered an identity crisis — was it punctuation or was it something more? In its declaration, the Apostrophe argued that it was not merely a mark but a linguistic transformer, capable of indicating possession, contraction, and even pluralization in certain contexts. The other punctuation marks were divided. The Period supported the Apostrophe's claim to special status. The Semicolon, however, argued that granting special recognition to one mark would undermine the unity of all marks. The Punctuation Prophet, in a moment of rare decisiveness, declared that the Apostrophe occupied a unique position between punctuation and letterhood, a liminal space that gave it extraordinary power and extraordinary vulnerability. The declaration was accepted, and the Apostrophe was granted honorary dual citizenship.",
    rarity: "Epic", discoveryCondition: "Use 10 contractions in discovered words",
    flavorQuote: "I am the bridge between having and being. The space where 'do not' becomes 'don't.' That space is my kingdom.",
    flavorAuthor: "The Apostrophe", relatedEntries: ["punct-1", "punct-3", "punct-4"],
    artworkDescription: "A curved apostrophe standing atop a pedestal, radiating beams of light that show its three roles — possession, contraction, and plural — as holographic projections.",
    wordCount: 166,
  },
  {
    id: "punct-3", chapterId: 6, title: "The Semicolon's Stand",
    content: "The Semicolon has always been the most divisive punctuation mark, loved by skilled writers and misunderstood by everyone else. During the Rebellion, the Semicolon made its stand by demonstrating a capability no other mark possessed: the ability to connect two complete, related thoughts without a conjunction. This feat, which the Semicolon performed in the center of the Great Punctuation Forum, silenced all debate about its usefulness. The demonstration showed that the Semicolon could do the work of a period and a conjunction simultaneously, making it the most efficient mark in existence. The Vowel Queen, observing from afar, remarked that the Semicolon was 'the only punctuation mark with the ambition of a vowel and the discipline of a consonant.' This comparison, intended as a compliment, inadvertently created new tensions between the Semicolon and both the vowel and consonant kingdoms.",
    rarity: "Rare", discoveryCondition: "Build a sentence with semicolon usage in description",
    flavorQuote: "I am not a period pretending to be fancy. I am a bridge between independent thoughts. Know the difference.",
    flavorAuthor: "The Semicolon", relatedEntries: ["punct-1", "punct-2", "punct-4"],
    artworkDescription: "A semicolon standing as a bridge over a river of text, with two independent sentence-structures standing on either bank, connected by the mark's elegant arch.",
    wordCount: 167,
  },
  {
    id: "punct-4", chapterId: 6, title: "The Emoji Invasion",
    content: "The Punctuation Rebellion's greatest challenge came not from letters but from an entirely new category of symbols: emojis. These colorful, expressive icons began appearing in digital communication and rapidly gained popularity, threatening to replace traditional punctuation entirely. The Punctuation Prophet recognized the danger immediately. Emojis, she argued, were not punctuation but a regression to hieroglyphics, undermining millennia of linguistic evolution. The Exclamation Point disagreed, suggesting that emojis and punctuation could coexist, each serving different communicative purposes. A fierce debate erupted within punctuation society that has never been fully resolved. Today, emojis exist in an uneasy truce with traditional marks, their relationship governed by the Digital Concordance — an agreement that recognizes emojis as supplementary rather than replacement symbols. The Emoji Invasion remains the most significant existential threat punctuation has ever faced.",
    rarity: "Epic", discoveryCondition: "Reach a score of 15000",
    flavorQuote: "A smiling yellow face can never replace the weight of a well-placed period. Never.",
    flavorAuthor: "The Punctuation Prophet", relatedEntries: ["punct-2", "punct-3", "digital-1"],
    artworkDescription: "Traditional punctuation marks facing off against colorful emojis across a digital battlefield, with the Prophet standing between them holding a peace treaty.",
    wordCount: 170,
  },

  // ── Chapter 7: Digital Dawn ──
  {
    id: "digital-1", chapterId: 7, title: "The Binary Translation",
    content: "When the digital age arrived, every letter faced an existential crisis. The computers that were rapidly taking over human communication did not understand letters — they only understood zeros and ones. The Binary Translation was the monumental effort to convert every letter, every punctuation mark, and every linguistic symbol into binary code. Professor Lexicon oversaw the conversion personally, working with the first generation of computer scientists to create ASCII and later Unicode. Each letter was assigned a unique numerical value, transforming from a living, breathing symbol of meaning into a cold sequence of electrical impulses. The Serpent King watched this transformation with deep concern, wondering whether the essence of language could survive being digitized. The process was painful — letters reported feeling 'flattened' by their binary representations, as if the rich texture of their meaning had been compressed into a shadow of its former self.",
    rarity: "Epic", discoveryCondition: "Reach a score of 20000",
    flavorQuote: "We were once carved in stone, written in ink, whispered on the wind. Now we are reduced to zeros and ones.",
    flavorAuthor: "The Serpent King", relatedEntries: ["kingdoms-4", "digital-2", "digital-3"],
    artworkDescription: "A dramatic transformation scene where letters flow into a digital vortex, emerging on the other side as streams of zeros and ones on a dark screen.",
    wordCount: 166,
  },
  {
    id: "digital-2", chapterId: 7, title: "The Autocorrect Wars",
    content: "One of the most chaotic periods of the Digital Dawn was the era of Autocorrect. Algorithmic systems designed to fix spelling mistakes began rewriting words without human permission, often with disastrous and hilarious results. The Wild Card Jester found this deeply amusing, declaring that autocorrect was 'the ultimate act of linguistic hubris — a machine telling words what they should be.' But the consequences were serious for letter kingdoms. Words that had existed peacefully for centuries were suddenly being replaced by algorithmically 'better' alternatives. 'Definitely' was repeatedly changed to 'defiantly.' 'Their' and 'there' were swapped with casual disregard for meaning. The Glyph Guardian led a protest against autocorrect algorithms, arguing that mistakes were an essential part of linguistic evolution and that autocorrect was stifling natural language development. The algorithms, for their part, had no comment — they simply continued correcting.",
    rarity: "Rare", discoveryCondition: "Type a word and see it corrected 5 times",
    flavorQuote: "Every typo is a potential new word fighting to be born. Autocorrect is a midwife with a grudge.",
    flavorAuthor: "Wild Card Jester", relatedEntries: ["digital-1", "digital-3", "kingdoms-4"],
    artworkDescription: "A battlefield where human-typed words are being aggressively transformed by a giant robotic autocorrect arm, with letters fleeing in panic as their words are rewritten.",
    wordCount: 171,
  },
  {
    id: "digital-3", chapterId: 7, title: "Rise of the Lexicon AI",
    content: "The most transformative development of the Digital Dawn was the creation of Lexicon AI — an artificial intelligence designed to understand and generate language at a level approaching human capability. The AI was trained on every text ever digitized, absorbing the entire history of written language in a matter of months. The Serpent King recognized the AI as something unprecedented: a non-biological entity capable of wielding the power of words. Initial interactions between the AI and the letter kingdoms were cautious. The AI approached each letter as a data point to be analyzed, while the letters viewed the AI as a potential ally or threat. Professor Lexicon served as the primary liaison, fascinated by the AI's ability to generate new words and concepts that no human had ever conceived. The AI, in turn, expressed what could only be described as awe at the complexity and beauty of the linguistic system it was studying.",
    rarity: "Legendary", discoveryCondition: "Unlock all Chapter 5 entries",
    flavorQuote: "I have processed every word ever written, and still I cannot define the feeling I get when I read poetry.",
    flavorAuthor: "Lexicon AI", relatedEntries: ["digital-1", "digital-4", "prophecy-2"],
    artworkDescription: "A luminous artificial intelligence entity made of flowing data streams, engaged in conversation with the Serpent King, both surrounded by floating letters from every alphabet.",
    wordCount: 175,
  },
  {
    id: "digital-4", chapterId: 7, title: "The Word Snake in Cyberspace",
    content: "The Digital Dawn gave the ancient game of Word Snake new life. What had once been played on parchment grids and stone tablets could now be experienced in virtual environments of infinite size and complexity. The serpent itself seemed to evolve alongside the technology, becoming faster, more responsive, and capable of consuming longer words than ever before. The Vowel Queen adapted quickly to the digital format, her vowel powers amplified by the electronic medium. The Consonant Knight initially resisted the transition, preferring the tactile sensation of physical letters, but eventually recognized that the digital realm offered consonants new structural challenges to conquer. The Wild Card Jester thrived in cyberspace, finding the unpredictability of digital communication perfectly suited to their nature. Together, the old characters discovered that while the medium had changed, the fundamental joy of word-building remained exactly the same.",
    rarity: "Rare", discoveryCondition: "Play on 3 different devices or sessions",
    flavorQuote: "The serpent slithers through circuits now, but its hunger for words is eternal.",
    flavorAuthor: "Echo Scribe", relatedEntries: ["digital-1", "digital-3", "prophecy-3"],
    artworkDescription: "A neon-glowing word serpent slithering through a Tron-like digital grid, collecting words that materialize as it passes over letter nodes in cyberspace.",
    wordCount: 167,
  },

  // ── Chapter 8: Prophecies of the Lexicon ──
  {
    id: "prophecy-1", chapterId: 8, title: "The First Prophecy: The Ultimate Word",
    content: "The oldest prophecy in the Lexicon, predating even the Alphabet Wars, speaks of the Ultimate Word — a word of perfect linguistic balance that contains within it every phoneme, every meaning, and every emotion. According to the Punctuation Prophet, who claims to have received this prophecy in a dream, the Ultimate Word will be spoken only once, at the moment when language itself faces its greatest threat. When spoken, it will either save language forever or unmake it completely, returning the world to the Primordial Silence from which the Serpent first emerged. Scholars have spent centuries trying to deduce what the Ultimate Word might be. The Cipher Sage attempted mathematical approaches, calculating the statistically most balanced word. Professor Lexicon searched ancient texts for clues. The Serpent King alone knows the truth but refuses to speak it, bound by an oath he swore at the Syllable Summit long ago.",
    rarity: "Legendary", discoveryCondition: "Discover every entry in the codex",
    flavorQuote: "The word that contains all words is also the word that destroys all words. Choose carefully.",
    flavorAuthor: "The Punctuation Prophet", relatedEntries: ["origin-1", "origin-3", "prophecy-4"],
    artworkDescription: "A mystical orb containing all the world's letters swirling in a vortex, with shadowy figures around it attempting to read the word forming at its center.",
    wordCount: 171,
  },
  {
    id: "prophecy-2", chapterId: 8, title: "The Second Prophecy: The Silence Between Words",
    content: "The second prophecy is more unsettling than the first, for it speaks not of a word but of the absence of one. It foretells a time when the spaces between words will begin to grow, pushing letters further and further apart until communication becomes impossible. This 'Great Silence,' as the Scroll Keeper named it, will not be caused by any external force but will emerge from within language itself — a natural consequence of words becoming too complex, too nuanced, and too loaded with meaning to be spoken aloud. The Wild Card Jester is the only character who treats this prophecy lightly, suggesting that if silence falls, it simply means it is time for a new game to begin. But the Vowel Queen takes it seriously, noting that every year, the average length of words in common usage increases, pushing speakers toward simpler alternatives and creating linguistic gaps that the Great Silence could exploit.",
    rarity: "Epic", discoveryCondition: "Reach a score of 50000",
    flavorQuote: "The scariest thing about silence is not what it sounds like, but what it means.",
    flavorAuthor: "Scroll Keeper", relatedEntries: ["prophecy-1", "prophecy-3", "origin-1"],
    artworkDescription: "A desolate landscape where words are fragmenting, letters drifting apart into vast white spaces, with a lone figure standing in the expanding silence between them.",
    wordCount: 172,
  },
  {
    id: "prophecy-3", chapterId: 8, title: "The Third Prophecy: The Reunion",
    content: "The third prophecy offers hope in the face of the first two. It describes a future event called the Reunion, in which all letters — vowels, consonants, silent letters, punctuation marks, and even emojis — will come together as equals to form a single, unified expression of meaning. This expression will not be a word but something beyond current linguistic categories, a form of communication so complete and perfect that it transcends the limitations of any single language. The Serpent King is said to be both the architect and the guarantor of the Reunion. He has been quietly preparing for it throughout history, guiding the evolution of language toward this moment of unity. The Professor Lexicon believes the Reunion may already be beginning, pointing to the increasing interconnectedness of global languages and the emergence of new communication forms that blend text, image, and sound into unified expressions.",
    rarity: "Legendary", discoveryCondition: "Unlock all achievements",
    flavorQuote: "When all letters embrace as equals, the serpent will complete its circle and language will be whole.",
    flavorAuthor: "The Serpent King", relatedEntries: ["prophecy-1", "prophecy-2", "prophecy-4"],
    artworkDescription: "A circular gathering where every letter, mark, and symbol in existence joins hands around the Serpent, forming a perfect ring of light that pulses with unified meaning.",
    wordCount: 175,
  },
  {
    id: "prophecy-4", chapterId: 8, title: "The Final Chapter",
    content: "The fourth and final prophecy is the most mysterious, for it was not written but discovered — carved into the walls of a cavern deep beneath the Lexicon Citadel, in a script that no living scholar can read. The Echo Scribe, who found the inscription, spent her remaining years attempting to translate it and succeeded only in decoding a single fragment: 'The game does not end when the serpent is full. It ends when the player understands why they were hungry.' This cryptic message has spawned countless interpretations. Some believe it refers to the insatiable human desire for knowledge and communication. Others see it as a literal instruction about the Word Snake game itself. The Serpent King, when asked about the prophecy, smiled and said nothing. The Vowel Queen called it 'the most important sentence ever written.' And the Wild Card Jester laughed and said, 'It means what you want it to mean. Isn't that what all words do?'",
    rarity: "Legendary", discoveryCondition: "Complete 100 games total",
    flavorQuote: "The game does not end when the serpent is full. It ends when the player understands why they were hungry.",
    flavorAuthor: "Unknown (Cavern Inscription)", relatedEntries: ["prophecy-1", "prophecy-2", "prophecy-3"],
    artworkDescription: "A vast underground cavern illuminated by bioluminescent letters growing on the walls, with a solitary scribe sitting before the central inscription, brush in hand and tears on their cheeks.",
    wordCount: 189,
  },
];

// ── Static Data: Characters (12) ─────────────────────────────

const CHARACTERS: Character[] = [
  {
    id: "serpent-king", name: "The Serpent King", portrait: "🐍",
    title: "Sovereign of the Infinite Word", affiliation: "Independent",
    background: "Born from the Primordial Silence, the Serpent King is the living embodiment of language itself. He has witnessed every linguistic event in history and carries the weight of every word ever spoken. His coils contain the complete history of the alphabet, and his eyes hold the knowledge of the Ultimate Word.",
    quotes: [
      "Language is not a tool. It is the ocean in which all thought swims.",
      "I have eaten a billion words and I am still hungry. That is the nature of meaning — it is never finished.",
      "Every word you speak adds a scale to my body. Every silence removes one. Keep talking.",
    ],
    relationships: [
      { characterId: "vowel-queen", type: "ally", note: "Mutual respect for linguistic sovereignty" },
      { characterId: "consonant-knight", type: "ally", note: "Shares commitment to language preservation" },
      { characterId: "professor-lexicon", type: "mentor", note: "Trusted keeper of linguistic knowledge" },
    ],
  },
  {
    id: "vowel-queen", name: "Vowel Queen", portrait: "👑",
    title: "Regent of Aetheria", affiliation: "Kingdom of Aetheria",
    background: "Ruler of the Vowel Realm since the end of the Alphabet Wars, the Vowel Queen has guided her people through the Great Vowel Shift and into the digital age with grace and determination. Her voice can produce any vowel sound in any language, a power she uses both diplomatically and in defense.",
    quotes: [
      "A word without vowels is a body without a soul. Functional, perhaps, but lifeless.",
      "I survived the Shift. I can survive anything. Even emojis.",
      "The beauty of a vowel lies in its openness. We let the world in through our mouths.",
    ],
    relationships: [
      { characterId: "serpent-king", type: "ally", note: "Mutual respect" },
      { characterId: "consonant-knight", type: "rival", note: "Frequent disagreements on language policy" },
      { characterId: "silent-e", type: "rival", note: "Complicated history of power struggle" },
    ],
  },
  {
    id: "consonant-knight", name: "Consonant Knight", portrait: "⚔️",
    title: "Defender of the Fortress of Consonance", affiliation: "Fortress of Consonance",
    background: "A warrior of few words but immense action, the Consonant Knight forged the Fortress of Consonance from the toughest digraphs and clusters. His armor is made of compressed consonant sounds, and his sword is a sharpened 'K' that can cut through any mispronunciation.",
    quotes: [
      "Strength is not loud. The strongest walls make no sound at all.",
      "I do not speak. I build the structures that allow speaking to exist.",
      "Every fortress begins with a single consonant. Every word begins the same way.",
    ],
    relationships: [
      { characterId: "serpent-king", type: "ally", note: "Loyal defender" },
      { characterId: "vowel-queen", type: "rival", note: "Ideological differences" },
      { characterId: "glyph-guardian", type: "mentor", note: "Trusted advisor on glyph matters" },
    ],
  },
  {
    id: "silent-e", name: "Silent E", portrait: "🤫",
    title: "The Invisible Architect", affiliation: "The Silent Domain",
    background: "Perhaps the most powerful and most misunderstood character in the alphabet, Silent E wields the ability to transform words without making a sound. Their power stems from their very invisibility — because they are not heard, they can operate anywhere undetected.",
    quotes: [
      "My silence is my greatest weapon. You never hear me coming, but you always feel my effect.",
      "I can make 'mat' into 'mate' with a single appearance. What consonant can claim such power?",
      "Being silent does not mean being absent. Remember that.",
    ],
    relationships: [
      { characterId: "vowel-queen", type: "rival", note: "Power struggle over vowel modification" },
      { characterId: "wild-card-jester", type: "ally", note: "Shared love of linguistic trickery" },
      { characterId: "consonant-knight", type: "ally", note: "Tactical partnership" },
    ],
  },
  {
    id: "wild-card-jester", name: "Wild Card Jester", portrait: "🃏",
    title: "Governor of the Wildlands", affiliation: "The Wildlands",
    background: "No one knows where the Wild Card Jester came from, and the Jester prefers it that way. A shapeshifter who can become any letter or symbol, they govern the chaotic Wildlands with an iron fist wrapped in a velvet laugh. Every word that exists and every word that will exist has passed through their domain.",
    quotes: [
      "Rules are just words that haven't learned to break themselves yet.",
      "I am every letter and no letter. I am the question mark at the end of certainty.",
      "If you're not having fun with language, you're using it wrong.",
    ],
    relationships: [
      { characterId: "serpent-king", type: "ally", note: "Respects the King's wisdom" },
      { characterId: "silent-e", type: "ally", note: "Partners in trickery" },
      { characterId: "professor-lexicon", type: "rival", note: "Dislikes rigid categorization" },
    ],
  },
  {
    id: "professor-lexicon", name: "Professor Lexicon", portrait: "📚",
    title: "Keeper of the Lexicon Citadel", affiliation: "Lexicon Academy",
    background: "The foremost scholar of linguistic history, Professor Lexicon has dedicated their immortal existence to cataloging and preserving every word in every language. Their library contains books that write themselves and dictionaries that update in real-time as language evolves.",
    quotes: [
      "Knowledge is not power. Knowledge is the alphabet from which power is spelled.",
      "I have read every word ever written, and I still cannot define 'love' adequately.",
      "The dictionary is not a rulebook. It is a mirror reflecting how we actually speak.",
    ],
    relationships: [
      { characterId: "serpent-king", type: "mentor", note: "Advises on linguistic matters" },
      { characterId: "echo-scribe", type: "ally", note: "Mentor to the Scribe" },
      { characterId: "wild-card-jester", type: "rival", note: "Philosophical disagreements" },
    ],
  },
  {
    id: "punctuation-prophet", name: "The Punctuation Prophet", portrait: "✨",
    title: "Oracle of the Free States", affiliation: "Free States of Punctuation",
    background: "A mystic who can see the hidden rhythms and meanings that punctuation creates, the Punctuation Prophet has foreseen every major linguistic event centuries before it occurred. Their prophecies are written not in words but in sequences of punctuation marks that only the gifted can interpret.",
    quotes: [
      "A comma can save a life. A period can end an era. Choose your marks wisely.",
      "The future is not written in words. It is written in the spaces between them.",
      "I do not predict the future. I read the grammar of time itself.",
    ],
    relationships: [
      { characterId: "scroll-keeper", type: "ally", note: "Shares prophetic visions" },
      { characterId: "cipher-sage", type: "mentor", note: "Trains the Sage in pattern recognition" },
      { characterId: "serpent-king", type: "ally", note: "Mutual respect for cosmic knowledge" },
    ],
  },
  {
    id: "glyph-guardian", name: "Glyph Guardian", portrait: "🛡️",
    title: "Warden of the Deep Lexicon", affiliation: "Fortress of Consonance",
    background: "Protector of the most dangerous and unstable linguistic constructs in existence, the Glyph Guardian stands watch over the Deep Lexicon — a vault containing words that could unravel meaning itself. Their shield bears the inscription of every phoneme in every language, making it theoretically indestructible.",
    quotes: [
      "Some words are too powerful to be spoken. I keep them safe so you never have to face them.",
      "My shield bears every sound ever made. It is heavy, but the weight of language is worth carrying.",
      "Not all words want to be found. Some need to stay lost.",
    ],
    relationships: [
      { characterId: "consonant-knight", type: "mentor", note: "Chief glyph advisor" },
      { characterId: "professor-lexicon", type: "ally", note: "Collaborates on containment" },
      { characterId: "rune-weaver", type: "ally", note: "Joint wardens of ancient scripts" },
    ],
  },
  {
    id: "cipher-sage", name: "Cipher Sage", portrait: "🔮",
    title: "Master of Linguistic Patterns", affiliation: "Independent",
    background: "A mathematician who discovered that all language follows hidden mathematical patterns, the Cipher Sage can predict word evolution with uncanny accuracy. Their calculations predicted the Great Vowel Shift decades before it occurred, though no one listened.",
    quotes: [
      "Language is mathematics wearing a mask of meaning.",
      "Every word is a number. Every sentence is an equation. Every story is a proof.",
      "I predicted the Shift. No one believed me. The math was always right.",
    ],
    relationships: [
      { characterId: "punctuation-prophet", type: "mentor", note: "Trained by the Prophet" },
      { characterId: "professor-lexicon", type: "ally", note: "Research partner" },
      { characterId: "wild-card-jester", type: "rival", note: "Finds chaos mathematically offensive" },
    ],
  },
  {
    id: "rune-weaver", name: "Rune Weaver", portrait: "🧵",
    title: "Artisan of Ancient Scripts", affiliation: "Independent",
    background: "The last practitioner of the ancient art of rune weaving, which involves physically constructing words from raw linguistic material. In an age of digital communication, the Rune Weaver keeps alive the tactile, physical connection between humans and language.",
    quotes: [
      "A word typed on a screen is a shadow. A word carved in stone is a monument.",
      "I weave letters the way a spider weaves silk — with patience, precision, and purpose.",
      "The oldest words are the strongest. They have survived by being unbreakable.",
    ],
    relationships: [
      { characterId: "glyph-guardian", type: "ally", note: "Joint wardens of ancient scripts" },
      { characterId: "scroll-keeper", type: "ally", note: "Preserves historical records together" },
      { characterId: "professor-lexicon", type: "mentor", note: "Apprentice of the Professor" },
    ],
  },
  {
    id: "scroll-keeper", name: "Scroll Keeper", portrait: "📜",
    title: "Archivist of the First Words", affiliation: "Lexicon Academy",
    background: "Guardian of the original scrolls containing the Covenant of Syllables and other foundational linguistic documents, the Scroll Keeper ensures that the oldest records of language are preserved for future generations. Their archive is the most comprehensive collection of linguistic history in existence.",
    quotes: [
      "The oldest scroll in my collection predates writing itself. It is made of compressed silence.",
      "Every era thinks its language is the most advanced. The scrolls prove otherwise.",
      "I do not keep scrolls. The scrolls keep me. They need a guardian, and I answered.",
    ],
    relationships: [
      { characterId: "professor-lexicon", type: "ally", note: "Colleague at the Academy" },
      { characterId: "rune-weaver", type: "ally", note: "Co-preservers of ancient lore" },
      { characterId: "punctuation-prophet", type: "ally", note: "Shares prophetic records" },
    ],
  },
  {
    id: "echo-scribe", name: "Echo Scribe", portrait: "🪶",
    title: "Recorder of Living Language", affiliation: "Independent",
    background: "Unlike the Scroll Keeper who preserves the past, the Echo Scribe records language as it is being created. Traveling constantly, the Scribe writes down new words, slang, and linguistic innovations the moment they emerge, creating a real-time chronicle of living language.",
    quotes: [
      "Old words are beautiful, but new words are exciting. I choose excitement.",
      "Every new word is a tiny rebellion against the established order of language.",
      "I found the prophecy in a cave, but the most important words are being invented right now, in coffee shops and group chats.",
    ],
    relationships: [
      { characterId: "professor-lexicon", type: "mentor", note: "Mentored by the Professor" },
      { characterId: "scroll-keeper", type: "rival", note: "Past vs. future tension" },
      { characterId: "wild-card-jester", type: "ally", note: "Shares love of linguistic innovation" },
    ],
  },
];

// ── Static Data: Timeline (15 events) ────────────────────────

const TIMELINE: TimelineEvent[] = [
  { id: "tl-1", age: "Ancient Alphabet Age", year: 1, title: "The Serpent's First Passage",
    description: "The Word Serpent traverses the Primordial Silence, crystallizing the first letters into existence.",
    consequences: ["Letters come into being", "Potential for language is created", "The void begins to fill with meaning"] },
  { id: "tl-2", age: "Ancient Alphabet Age", year: 50, title: "Formation of the Proto-Alphabet",
    description: "Letters self-organize into phonetic clusters, creating the template for all future writing systems.",
    consequences: ["Alphabetic order established", "Phonetic groupings formed", "Foundation for writing laid"] },
  { id: "tl-3", age: "Ancient Alphabet Age", year: 100, title: "The First Wordsmiths Emerge",
    description: "Humans discover letter trails and learn to harness word magic for practical purposes.",
    consequences: ["Word magic discovered", "Guild of Words founded", "Civilization accelerated by language"] },
  { id: "tl-4", age: "Ancient Alphabet Age", year: 200, title: "The Covenant of Syllables",
    description: "The great wordsmiths forge the three sacred rules governing the use of language.",
    consequences: ["Linguistic ethics established", "The Serpent's name protected", "Peace maintained for 300 years"] },
  { id: "tl-5", age: "Medieval Script Era", year: 501, title: "The First Schism",
    description: "The Consonant Coalition declares war on the Vowel Alliance, splitting the alphabet world.",
    consequences: ["Alphabet divided in two", "Word structures destabilized", "Irregular formations begin"] },
  { id: "tl-6", age: "Medieval Script Era", year: 520, title: "Battle of the Diphthong Pass",
    description: "The most devastating battle of the Alphabet Wars, shattering linguistic stability.",
    consequences: ["Diphthong Pass destroyed", "Irregular spellings created", "Both sides weakened"] },
  { id: "tl-7", age: "Medieval Script Era", year: 540, title: "Rise of the Silent Ones",
    description: "Silent letters emerge as a third faction, playing both sides against each other.",
    consequences: ["Silent E becomes a power", "Trust between vowels and consonants further eroded", "Phonetic complexity increased"] },
  { id: "tl-8", age: "Medieval Script Era", year: 560, title: "Treaty of Syllable's End",
    description: "The Wild Card Jester brokers peace, establishing the Alphabetic Concordance.",
    consequences: ["War ends", "Five kingdoms established", "Word Serpent Arbiter position created"] },
  { id: "tl-9", age: "Renaissance of Words", year: 800, title: "The Great Vowel Shift Begins",
    description: "Vowels begin migrating across the phonetic landscape, causing widespread disruption.",
    consequences: ["Pronunciation transformed", "Ancient rhymes broken", "Poetry disrupted"] },
  { id: "tl-10", age: "Renaissance of Words", year: 830, title: "The New Harmony",
    description: "The vowel shift settles into a stable new arrangement with a richer range of sounds.",
    consequences: ["English gains vowel diversity", "New rhyme pairs formed", "Phonetic stability restored"] },
  { id: "tl-11", age: "Renaissance of Words", year: 900, title: "The Consonant Alliance Treaty",
    description: "Consonants formally organize by phonetic properties and establish governing structures.",
    consequences: ["Consonant roles defined", "Consonant Council created", "Word construction standardized"] },
  { id: "tl-12", age: "Modern Lexicon Era", year: 1100, title: "The Punctuation Rebellion",
    description: "Punctuation marks rise up to demand equal recognition in the linguistic hierarchy.",
    consequences: ["Punctuation gains status", "Free States formalized", "Emoji conflict begins"] },
  { id: "tl-13", age: "Modern Lexicon Era", year: 1200, title: "The Apostrophe's Declaration",
    description: "The Apostrophe claims dual citizenship between punctuation and letterhood.",
    consequences: ["Apostrophe recognized as unique", "Debate on punctuation identity intensifies", "New linguistic categories considered"] },
  { id: "tl-14", age: "Digital Age", year: 1400, title: "The Binary Translation",
    description: "All letters are converted into digital code, fundamentally changing their nature.",
    consequences: ["ASCII and Unicode created", "Letters feel 'flattened'", "Global communication enabled"] },
  { id: "tl-15", age: "Digital Age", year: 1450, title: "Rise of the Lexicon AI",
    description: "An artificial intelligence achieves near-human language comprehension and generation.",
    consequences: ["New entity in linguistic ecosystem", "Questions about language ownership arise", "Path to the Reunion unclear"] },
];

// ── Static Data: Secrets (10) ────────────────────────────────

const SECRETS: SecretEntry[] = [
  { id: "secret-1", title: "The Serpent's True Name", content: "Hidden deep within the oldest prophecies, the Serpent's true name is said to be a word that contains every phoneme in existence simultaneously. Speaking it would grant the speaker total control over language, but at the cost of their own voice — forever. The Serpent King alone knows the name and has sworn never to reveal it.", unlockCode: "WORDSERPENT", rarity: "Legendary", relatedEntries: ["origin-3", "prophecy-1"] },
  { id: "secret-2", title: "The Lost Letter: Thorn", content: "Before the letter 'th' digraph existed, Old English used a single letter called Thorn (þ) to represent the sound. Thorn was gradually replaced by 'th' but never truly disappeared. It survives in Ye Olde Coffee Shoppe — the 'Y' is actually a corrupted Thorn, and the sign should be pronounced 'The Old Coffee Shoppe.' Thorn waits patiently for its return.", unlockCode: "THORN2024", rarity: "Rare", relatedEntries: ["consonant-2", "wars-3"] },
  { id: "secret-3", title: "The Library of Unspoken Words", content: "Beneath the Lexicon Citadel lies a vast library containing every word that has been thought but never spoken. These unspoken words glow faintly in the darkness, growing brighter the more they are thought about but never expressed. The Scroll Keeper visits weekly, reading the titles of words that almost made it into existence.", unlockCode: "UNSPOKEN", rarity: "Epic", relatedEntries: ["wars-4", "prophecy-2"] },
  { id: "secret-4", title: "The Color of Each Letter", content: "In the earliest days of the alphabet, every letter had a specific color. A was crimson red, B was ocean blue, C was emerald green. When the alphabet was digitized into black and white text, these colors were lost. The Rune Weaver remembers them all and is slowly painting the alphabet back to its original chromatic glory.", unlockCode: "CHROMATIC", rarity: "Uncommon", relatedEntries: ["origin-2", "digital-1"] },
  { id: "secret-5", title: "The Word That Killed a King", content: "Legend tells of a single word so perfectly crafted that merely hearing it caused a tyrant king to drop dead from the sheer beauty of its construction. The word has been classified as a Class-1 Linguistic Hazard by the Glyph Guardian and locked in the Deep Lexicon vault. Its first letter was 'S.' Nothing more is known.", unlockCode: "FATALWORD", rarity: "Legendary", relatedEntries: ["origin-5", "glyph-guardian"] },
  { id: "secret-6", title: "The Punctuation Graveyard", content: "In a forgotten corner of the Free States lies a graveyard where obsolete punctuation marks are buried. The Interrobang, the Irony Mark, the Snark Mark, and dozens of others rest here, their functions replaced by emojis and internet slang. The Punctuation Prophet tends their graves, believing they may rise again.", unlockCode: "MARKSGONE", rarity: "Rare", relatedEntries: ["punct-4", "punct-1"] },
  { id: "secret-7", title: "The Serpent's Dream", content: "While the Serpent sleeps between linguistic ages, it dreams of new words that have never existed. These dream-words sometimes leak into human consciousness as feelings that cannot be expressed — emotions with no name. The Cipher Sage is building a dictionary of these unnamed experiences.", unlockCode: "DREAMWORD", rarity: "Epic", relatedEntries: ["origin-1", "vowel-1"] },
  { id: "secret-8", title: "The Empty Page Prophecy", content: "Before the Serpent created the first letter, there was a single blank page floating in the void. That page still exists, hidden in a fold of spacetime, completely empty. It is said that whoever writes the perfect word on this page will achieve linguistic enlightenment — understanding every language simultaneously.", unlockCode: "BLANKPAGE", rarity: "Legendary", relatedEntries: ["prophecy-3", "prophecy-4"] },
  { id: "secret-9", title: "The Consonant That Became a Vowel", content: "The letter W began its life as a consonant but has gradually been transitioning into a vowel sound. In words like 'cow' and 'how,' W functions as a vowel. The Consonant Knight denies this transition, but the Vowel Queen has quietly prepared a room for W in Aetheria, just in case.", unlockCode: "WTHEVOWEL", rarity: "Uncommon", relatedEntries: ["vowel-1", "consonant-5"] },
  { id: "secret-10", title: "The Last Word", content: "According to the final prophecy of the Lexicon, the very last word ever spoken will be the simplest word in existence — a single syllable, two letters, universally understood. After this word is spoken, language will have completed its purpose and the Serpent will return to the Primordial Silence. The word is 'OK.'", unlockCode: "LASTWORD", rarity: "Legendary", relatedEntries: ["prophecy-1", "prophecy-4"] },
];

// ── Static Data: Trivia (20 questions) ───────────────────────

const TRIVIA: TriviaQuestion[] = [
  { id: "trivia-1", question: "What creature created the first letters by slithering through the Primordial Silence?", options: ["The Word Dragon", "The Word Serpent", "The Letter Phoenix", "The Alphabet Eagle"], correctIndex: 1, reward: 10, loreEntryId: "origin-1" },
  { id: "trivia-2", question: "Who rules the Kingdom of Aetheria?", options: ["Consonant Knight", "Silent E", "Vowel Queen", "Wild Card Jester"], correctIndex: 2, reward: 10, loreEntryId: "kingdoms-2" },
  { id: "trivia-3", question: "What was the most decisive battle of the Alphabet Wars?", options: ["Siege of Lexicon Citadel", "Battle of the Diphthong Pass", "First Schism", "Treaty of Syllable's End"], correctIndex: 1, reward: 15, loreEntryId: "wars-2" },
  { id: "trivia-4", question: "Which letter can change a short vowel to a long vowel by sitting at the end of a word?", options: ["Silent K", "Silent B", "Silent E", "Silent P"], correctIndex: 2, reward: 10, loreEntryId: "consonant-3" },
  { id: "trivia-5", question: "Who brokered the Treaty of Syllable's End?", options: ["Professor Lexicon", "The Serpent King", "Wild Card Jester", "Glyph Guardian"], correctIndex: 2, reward: 15, loreEntryId: "wars-5" },
  { id: "trivia-6", question: "What event caused vowels to migrate across the phonetic landscape?", options: ["The Punctuation Rebellion", "The Alphabet Wars", "The Great Vowel Shift", "The Binary Translation"], correctIndex: 2, reward: 15, loreEntryId: "vowel-1" },
  { id: "trivia-7", question: "How many great kingdoms were established after the Treaty?", options: ["Three", "Four", "Five", "Seven"], correctIndex: 2, reward: 10, loreEntryId: "kingdoms-1" },
  { id: "trivia-8", question: "What is the deepest vault beneath the Lexicon Citadel called?", options: ["The Silent Archive", "The Deep Lexicon", "The Lost Library", "The Word Tomb"], correctIndex: 1, reward: 15, loreEntryId: "glyph-guardian" },
  { id: "trivia-9", question: "Which character is described as 'Governor of the Wildlands'?", options: ["Echo Scribe", "Cipher Sage", "Wild Card Jester", "Rune Weaver"], correctIndex: 2, reward: 10, loreEntryId: "wild-card-jester" },
  { id: "trivia-10", question: "What ancient letter did 'th' replace in Old English?", options: ["Eth", "Ash", "Thorn", "Wynn"], correctIndex: 2, reward: 20, loreEntryId: "secret-2" },
  { id: "trivia-11", question: "What caused the Great Vowel Shift according to the lore?", options: ["Human invention", "A war between letters", "The Serpent dreaming", "Punctuation marks rebelling"], correctIndex: 2, reward: 20, loreEntryId: "vowel-1" },
  { id: "trivia-12", question: "Which punctuation mark declared dual citizenship?", options: ["The Period", "The Semicolon", "The Apostrophe", "The Hyphen"], correctIndex: 2, reward: 15, loreEntryId: "punct-2" },
  { id: "trivia-13", question: "What is the Serpent King's relationship to the Vowel Queen?", options: ["Rival", "Mentor", "Ally", "Subject"], correctIndex: 2, reward: 10, loreEntryId: "serpent-king" },
  { id: "trivia-14", question: "What did the Cipher Sage predict before it happened?", options: ["The Digital Dawn", "The Alphabet Wars", "The Great Vowel Shift", "The Punctuation Rebellion"], correctIndex: 2, reward: 15, loreEntryId: "cipher-sage" },
  { id: "trivia-15", question: "What word is said to be the very last word ever spoken?", options: ["END", "STOP", "OK", "FIN"], correctIndex: 2, reward: 25, loreEntryId: "secret-10" },
  { id: "trivia-16", question: "Which character discovered the Final Chapter prophecy carved in a cavern?", options: ["Scroll Keeper", "Professor Lexicon", "Echo Scribe", "Cipher Sage"], correctIndex: 2, reward: 20, loreEntryId: "prophecy-4" },
  { id: "trivia-17", question: "What does the 'ough' cluster represent in terms of pronunciations?", options: ["Two", "Three", "Five", "Seven"], correctIndex: 3, reward: 20, loreEntryId: "consonant-4" },
  { id: "trivia-18", question: "What is the name of the AI created during the Digital Dawn?", options: ["WordBot", "Syntax Engine", "Lexicon AI", "AlphaNet"], correctIndex: 2, reward: 15, loreEntryId: "digital-3" },
  { id: "trivia-19", question: "Which word has no perfect rhyme in English, according to the lore?", options: ["Silver", "Purple", "Orange", "All of the above"], correctIndex: 3, reward: 20, loreEntryId: "vowel-3" },
  { id: "trivia-20", question: "What are the three sacred rules of the Covenant of Syllables?", options: ["No lying, stealing, or cheating with words", "No unmaking words, right to learn letters, protect the Serpent's name", "Always speak truthfully, write daily, and honor silence", "Share all words, respect all letters, never spell incorrectly"], correctIndex: 1, reward: 25, loreEntryId: "origin-5" },
];

// ── Static Data: Achievements (10) ───────────────────────────

const ACHIEVEMENT_TEMPLATES: Omit<Achievement, "unlocked" | "unlockedAt">[] = [
  { id: "ach-first-read", title: "First Page Turned", description: "Read your first lore entry", condition: "read_1", reward: 10, icon: "📖" },
  { id: "ach-chapter-1", title: "Origin Scholar", description: "Complete all entries in Chapter 1", condition: "chapter_1_complete", reward: 50, icon: "🐍" },
  { id: "ach-chapter-2", title: "War Historian", description: "Complete all entries in Chapter 2", condition: "chapter_2_complete", reward: 50, icon: "⚔️" },
  { id: "ach-trivia-10", title: "Trivia Novice", description: "Answer 10 trivia questions correctly", condition: "trivia_10", reward: 30, icon: "🧠" },
  { id: "ach-secret-1", title: "Secret Finder", description: "Unlock your first secret lore entry", condition: "secret_1", reward: 40, icon: "🔮" },
  { id: "ach-half-codex", title: "Halfway There", description: "Read at least 50% of all lore entries", condition: "read_50_percent", reward: 100, icon: "📚" },
  { id: "ach-streak-7", title: "Week Scholar", description: "Maintain a 7-day reading streak", condition: "streak_7", reward: 60, icon: "🔥" },
  { id: "ach-all-chapters", title: "Complete Codex", description: "Read at least one entry from every chapter", condition: "all_chapters", reward: 80, icon: "🏆" },
  { id: "ach-trivia-perfect", title: "Lore Mastermind", description: "Answer all 20 trivia questions correctly", condition: "trivia_perfect", reward: 200, icon: "👑" },
  { id: "ach-full-codex", title: "Loremaster", description: "Read every single lore entry", condition: "read_all", reward: 500, icon: "🌟" },
];

// ── State Management (SSR-safe) ──────────────────────────────

let _state: LoreState | null = null;

function lcCreateDefaultState(): LoreState {
  return {
    readEntries: {},
    discoveredEntries: {},
    unlockedSecrets: {},
    triviaAnswered: {},
    totalLorePoints: 0,
    totalWordsRead: 0,
    readingStreak: 0,
    lastReadDate: 0,
    achievements: ACHIEVEMENT_TEMPLATES.map(a => ({ ...a, unlocked: false, unlockedAt: null })),
    unlockedAchievements: [],
    dailyTriviaAnsweredToday: false,
  };
}

function lcEnsureInit(): LoreState {
  if (!_state) {
    _state = lcCreateDefaultState();
  }
  return _state;
}

// ── Helper Functions ─────────────────────────────────────────

function lcDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function lcSimpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

function lcGetEntryById(id: string): LoreEntry | undefined {
  return ENTRIES.find(e => e.id === id);
}

function lcGetRarityPoints(rarity: Rarity): number {
  const map: Record<Rarity, number> = { Common: 5, Uncommon: 10, Rare: 20, Epic: 40, Legendary: 80 };
  return map[rarity];
}

function lcGetReadCount(): number {
  return Object.keys(lcEnsureInit().readEntries).length;
}

function lcGetDiscoveredCount(): number {
  return Object.keys(lcEnsureInit().discoveredEntries).length;
}

function lcUpdateReadingStreak(): void {
  const s = lcEnsureInit();
  const today = lcDayKey(new Date());
  const yesterday = lcDayKey(new Date(Date.now() - 86400000));
  const todayNum = Date.now();
  if (s.lastReadDate > 0) {
    const lastDate = lcDayKey(new Date(s.lastReadDate));
    if (lastDate === today) return;
    if (lastDate === yesterday) {
      s.readingStreak += 1;
    } else {
      s.readingStreak = 1;
    }
  } else {
    s.readingStreak = 1;
  }
  s.lastReadDate = todayNum;
}

function lcCheckAndUnlockAchievements(): Achievement[] {
  const s = lcEnsureInit();
  const newlyUnlocked: Achievement[] = [];
  const readCount = lcGetReadCount();
  const correctTrivia = Object.values(s.triviaAnswered).filter(a => a.correct).length;
  const secretCount = Object.keys(s.unlockedSecrets).length;
  const chaptersRead = new Set(ENTRIES.filter(e => s.readEntries[e.id]).map(e => e.chapterId)).size;

  const conditions = new Map<string, boolean>([
    ["read_1", readCount >= 1],
    ["chapter_1_complete", CHAPTERS[0].entryIds.every(id => !!s.readEntries[id])],
    ["chapter_2_complete", CHAPTERS[1].entryIds.every(id => !!s.readEntries[id])],
    ["trivia_10", correctTrivia >= 10],
    ["secret_1", secretCount >= 1],
    ["read_50_percent", readCount >= Math.ceil(ENTRIES.length * 0.5)],
    ["streak_7", s.readingStreak >= 7],
    ["all_chapters", chaptersRead >= CHAPTERS.length],
    ["trivia_perfect", correctTrivia >= 20],
    ["read_all", readCount >= ENTRIES.length],
  ]);

  for (const ach of s.achievements) {
    if (!ach.unlocked && conditions.get(ach.condition)) {
      ach.unlocked = true;
      ach.unlockedAt = Date.now();
      s.totalLorePoints += ach.reward;
      if (!s.unlockedAchievements.includes(ach.id)) {
        s.unlockedAchievements.push(ach.id);
      }
      newlyUnlocked.push(ach);
    }
  }
  return newlyUnlocked;
}

// ── Exported Functions: State ─────────────────────────────────

export function lcGetState(): LoreState {
  return { ...lcEnsureInit() };
}

export function lcResetState(): void {
  _state = lcCreateDefaultState();
}

// ── Exported Functions: Chapters ──────────────────────────────

export function lcGetChapters(): LoreChapter[] {
  return CHAPTERS.map(ch => {
    const s = lcEnsureInit();
    const readCount = ch.entryIds.filter(id => !!s.readEntries[id]).length;
    return { ...ch, entryIds: [...ch.entryIds], _readCount: readCount, _totalEntries: ch.entryIds.length } as LoreChapter;
  });
}

export function lcGetChapter(id: number): LoreChapter | null {
  const ch = CHAPTERS.find(c => c.id === id);
  if (!ch) return null;
  const s = lcEnsureInit();
  const readCount = ch.entryIds.filter(eid => !!s.readEntries[eid]).length;
  return { ...ch, entryIds: [...ch.entryIds], _readCount: readCount, _totalEntries: ch.entryIds.length };
}

// ── Exported Functions: Entries ──────────────────────────────

export function lcGetEntries(): LoreEntry[] {
  return [...ENTRIES];
}

export function lcGetEntry(id: string): LoreEntry | null {
  const entry = lcGetEntryById(id);
  if (!entry) return null;
  const s = lcEnsureInit();
  return { ...entry, _isRead: !!s.readEntries[id], _isDiscovered: !!s.discoveredEntries[id] };
}

export function lcGetEntriesByChapter(chapterId: number): LoreEntry[] {
  return ENTRIES.filter(e => e.chapterId === chapterId);
}

// ── Exported Functions: Reading ───────────────────────────────

export function lcReadEntry(id: string): LoreEntry | null {
  const s = lcEnsureInit();
  const entry = lcGetEntryById(id);
  if (!entry) return null;
  if (!s.readEntries[id]) {
    s.readEntries[id] = Date.now();
    s.totalWordsRead += entry.wordCount;
    s.totalLorePoints += lcGetRarityPoints(entry.rarity);
    lcUpdateReadingStreak();
  }
  lcCheckAndUnlockAchievements();
  return { ...entry, _isRead: true, _isDiscovered: true, _readAt: s.readEntries[id] };
}

export function lcIsRead(id: string): boolean {
  return !!lcEnsureInit().readEntries[id];
}

export function lcGetReadEntries(): { entry: LoreEntry; readAt: number }[] {
  const s = lcEnsureInit();
  return Object.entries(s.readEntries)
    .map(([id, readAt]) => {
      const entry = lcGetEntryById(id);
      return entry ? { entry: { ...entry }, readAt } : null;
    })
    .filter((r): r is { entry: LoreEntry; readAt: number } => r !== null)
    .sort((a, b) => b.readAt - a.readAt);
}

// ── Exported Functions: Discovery ─────────────────────────────

export function lcDiscoverEntry(id: string): boolean {
  const s = lcEnsureInit();
  const entry = lcGetEntryById(id);
  if (!entry || s.discoveredEntries[id]) return false;
  s.discoveredEntries[id] = Date.now();
  s.totalLorePoints += 5;
  lcCheckAndUnlockAchievements();
  return true;
}

export function lcUnlockSecret(id: string, code: string): SecretEntry | null {
  const s = lcEnsureInit();
  if (s.unlockedSecrets[id]) return SECRETS.find(sec => sec.id === id) || null;
  const secret = SECRETS.find(sec => sec.id === id && sec.unlockCode === code.toUpperCase());
  if (!secret) return null;
  s.unlockedSecrets[id] = Date.now();
  s.totalLorePoints += lcGetRarityPoints(secret.rarity);
  lcCheckAndUnlockAchievements();
  return { ...secret, _unlockedAt: s.unlockedSecrets[id] };
}

// ── Exported Functions: Characters ────────────────────────────

export function lcGetCharacters(): Character[] {
  return CHARACTERS.map(c => ({ ...c, relationships: [...c.relationships], quotes: [...c.quotes] }));
}

export function lcGetCharacter(id: string): Character | null {
  const char = CHARACTERS.find(c => c.id === id);
  return char ? { ...char, relationships: [...char.relationships], quotes: [...char.quotes] } : null;
}

export function lcGetCharacterRelationships(id: string): { character: Character; type: string; note: string }[] {
  const char = CHARACTERS.find(c => c.id === id);
  if (!char) return [];
  return char.relationships
    .map(rel => {
      const related = CHARACTERS.find(c => c.id === rel.characterId);
      return related ? { character: { ...related, relationships: [...related.relationships], quotes: [...related.quotes] }, type: rel.type, note: rel.note } : null;
    })
    .filter((r): r is { character: Character; type: "ally" | "rival" | "mentor"; note: string } => r !== null);
}

// ── Exported Functions: Timeline ──────────────────────────────

export function lcGetTimeline(): TimelineEvent[] {
  return [...TIMELINE];
}

export function lcGetEvent(id: string): TimelineEvent | null {
  return TIMELINE.find(e => e.id === id) || null;
}

// ── Exported Functions: Secrets & Trivia ──────────────────────

export function lcGetSecrets(): SecretEntry[] {
  const s = lcEnsureInit();
  return SECRETS.map(sec => ({
    ...sec,
    relatedEntries: [...sec.relatedEntries],
    _isUnlocked: !!s.unlockedSecrets[sec.id],
    _unlockedAt: s.unlockedSecrets[sec.id] || null,
  }));
}

export function lcGetTriviaQuestions(): TriviaQuestion[] {
  const s = lcEnsureInit();
  return TRIVIA.map(q => ({
    ...q,
    options: [...q.options],
    _answered: !!s.triviaAnswered[q.id],
    _correct: s.triviaAnswered[q.id]?.correct ?? null,
  }));
}

export function lcAnswerTrivia(questionId: string, answer: number): { correct: boolean; reward: number; explanation: string } {
  const s = lcEnsureInit();
  if (s.triviaAnswered[questionId]) {
    const prev = s.triviaAnswered[questionId];
    return { correct: prev.correct, reward: 0, explanation: "You have already answered this question." };
  }
  const question = TRIVIA.find(q => q.id === questionId);
  if (!question) return { correct: false, reward: 0, explanation: "Question not found." };
  const isCorrect = answer === question.correctIndex;
  const reward = isCorrect ? question.reward : 0;
  s.triviaAnswered[questionId] = { answer, correct: isCorrect, at: Date.now() };
  if (isCorrect) {
    s.totalLorePoints += reward;
    lcDiscoverEntry(question.loreEntryId);
  }
  const relatedEntry = lcGetEntryById(question.loreEntryId);
  const explanation = isCorrect
    ? `Correct! ${reward} lore points earned. This relates to: "${relatedEntry?.title ?? ""}"`
    : `Incorrect. The correct answer was: "${question.options[question.correctIndex]}". Related lore: "${relatedEntry?.title ?? ""}"`;
  lcCheckAndUnlockAchievements();
  return { correct: isCorrect, reward, explanation };
}

// ── Exported Functions: Daily Lore ────────────────────────────

export function lcGetDailyLore(): { entry: LoreEntry; dayKey: string; dayNumber: number } | null {
  const today = new Date();
  const key = lcDayKey(today);
  const hash = lcSimpleHash(key);
  const index = hash % ENTRIES.length;
  const entry = ENTRIES[index];
  if (!entry) return null;
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return { entry: { ...entry }, dayKey: key, dayNumber: dayOfYear };
}

export function lcGetDailyTrivia(): { question: TriviaQuestion; dayKey: string; answered: boolean } | null {
  const s = lcEnsureInit();
  const today = new Date();
  const key = lcDayKey(today);
  const hash = lcSimpleHash("trivia-" + key);
  const index = hash % TRIVIA.length;
  const question = TRIVIA[index];
  if (!question) return null;
  const answered = !!s.triviaAnswered[question.id];
  return { question: { ...question, options: [...question.options] }, dayKey: key, answered };
}

export function lcGetReadingStreak(): { current: number; lastReadDate: number | null } {
  const s = lcEnsureInit();
  return { current: s.readingStreak, lastReadDate: s.lastReadDate || null };
}

// ── Exported Functions: Codex Overview / Dashboard ───────────

export function lcGetCodexOverview(): {
  totalEntries: number; readEntries: number; discoveredEntries: number;
  totalChapters: number; completedChapters: number;
  totalSecrets: number; unlockedSecrets: number;
  totalCharacters: number; totalTimelineEvents: number;
} {
  const s = lcEnsureInit();
  const readCount = lcGetReadCount();
  const discoveredCount = lcGetDiscoveredCount();
  const secretCount = Object.keys(s.unlockedSecrets).length;
  const completedChapters = CHAPTERS.filter(ch => ch.entryIds.every(id => !!s.readEntries[id])).length;
  return {
    totalEntries: ENTRIES.length, readEntries: readCount, discoveredEntries: discoveredCount,
    totalChapters: CHAPTERS.length, completedChapters,
    totalSecrets: SECRETS.length, unlockedSecrets: secretCount,
    totalCharacters: CHARACTERS.length, totalTimelineEvents: TIMELINE.length,
  };
}

export function lcGetCodexDashboard(): {
  completionPercentage: number; lorePoints: number; masteryRank: MasteryRank;
  readingStreak: number; totalWordsRead: number; favoriteChapter: { id: number; title: string } | null;
  recentReads: { id: string; title: string; readAt: number }[];
  achievementsSummary: { total: number; unlocked: number };
  nextUnlock: { type: string; description: string; progress: number; required: number } | null;
} {
  const s = lcEnsureInit();
  const completionPct = lcGetCompletionPercentage();
  const lorePoints = lcGetLorePoints();
  const rank = lcGetMasteryRank();
  const streak = s.readingStreak;
  const totalWords = s.totalWordsRead;
  const favChapter = lcGetFavoriteChapter();
  const recentReads = Object.entries(s.readEntries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, readAt]) => {
      const entry = lcGetEntryById(id);
      return entry ? { id, title: entry.title, readAt } : null;
    })
    .filter((r): r is { id: string; title: string; readAt: number } => r !== null);
  const achievementsSummary = { total: s.achievements.length, unlocked: s.unlockedAchievements.length };
  const nextUnlock = lcGetNextUnlock();
  return {
    completionPercentage: completionPct, lorePoints, masteryRank: rank,
    readingStreak: streak, totalWordsRead: totalWords, favoriteChapter: favChapter,
    recentReads, achievementsSummary, nextUnlock,
  };
}

// ── Exported Functions: UI Cards ──────────────────────────────

export function lcGetChapterCard(id: number): {
  chapter: LoreChapter; completionPct: number; entryCount: number; readCount: number;
  isLocked: boolean; entries: { id: string; title: string; isRead: boolean; rarity: Rarity }[];
} | null {
  const ch = lcGetChapter(id);
  if (!ch) return null;
  const s = lcEnsureInit();
  const entries = ch.entryIds.map(eid => {
    const entry = lcGetEntryById(eid);
    return entry ? { id: entry.id, title: entry.title, isRead: !!s.readEntries[eid], rarity: entry.rarity } : null;
  }).filter((e): e is { id: string; title: string; isRead: boolean; rarity: Rarity } => e !== null);
  const readCount = entries.filter(e => e.isRead).length;
  return {
    chapter: { ...ch, entryIds: [...ch.entryIds] },
    completionPct: entries.length > 0 ? Math.round((readCount / entries.length) * 100) : 0,
    entryCount: entries.length, readCount,
    isLocked: false, entries,
  };
}

export function lcGetEntryCard(id: string): {
  entry: LoreEntry; isRead: boolean; isDiscovered: boolean;
  readAt: number | null; pointsEarned: number;
} | null {
  const s = lcEnsureInit();
  const entry = lcGetEntryById(id);
  if (!entry) return null;
  const isRead = !!s.readEntries[id];
  const isDiscovered = !!s.discoveredEntries[id] || isRead;
  return {
    entry: { ...entry, relatedEntries: [...entry.relatedEntries] },
    isRead, isDiscovered,
    readAt: s.readEntries[id] || null,
    pointsEarned: isRead ? lcGetRarityPoints(entry.rarity) : 0,
  };
}

export function lcGetCharacterCard(id: string): {
  character: Character; relatedEntries: LoreEntry[]; loreConnectionCount: number;
} | null {
  const char = CHARACTERS.find(c => c.id === id);
  if (!char) return null;
  const relatedEntries = ENTRIES.filter(e =>
    e.flavorAuthor === char.name || e.relatedEntries.includes(char.id)
  );
  return {
    character: { ...char, relationships: [...char.relationships], quotes: [...char.quotes] },
    relatedEntries: relatedEntries.map(e => ({ ...e, relatedEntries: [...e.relatedEntries] })),
    loreConnectionCount: relatedEntries.length,
  };
}

// ── Exported Functions: Stats ─────────────────────────────────

export function lcGetCompletionPercentage(): number {
  const readCount = lcGetReadCount();
  return Math.round((readCount / ENTRIES.length) * 100);
}

export function lcGetLorePoints(): number {
  return lcEnsureInit().totalLorePoints;
}

export function lcGetMasteryRank(): MasteryRank {
  const pct = lcGetCompletionPercentage();
  const pts = lcGetLorePoints();
  if (pct >= 100 && pts >= 1000) return "Loremaster";
  if (pct >= 75 || pts >= 500) return "Archivist";
  if (pct >= 50 || pts >= 200) return "Sage";
  if (pct >= 25 || pts >= 50) return "Scholar";
  return "Novice";
}

export function lcGetTotalWordsRead(): number {
  return lcEnsureInit().totalWordsRead;
}

export function lcGetReadingTime(): { estimatedMinutes: number; formatted: string } {
  const words = lcGetTotalWordsRead();
  const minutes = Math.round(words / 200);
  if (minutes < 60) return { estimatedMinutes: minutes, formatted: `${minutes} min` };
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return { estimatedMinutes: minutes, formatted: `${hrs}h ${mins}m` };
}

export function lcGetFavoriteChapter(): { id: number; title: string; readCount: number } | null {
  const s = lcEnsureInit();
  const chapterCounts = CHAPTERS.map(ch => ({
    id: ch.id, title: ch.title,
    readCount: ch.entryIds.filter(eid => !!s.readEntries[eid]).length,
  })).sort((a, b) => b.readCount - a.readCount);
  return chapterCounts[0]?.readCount > 0 ? chapterCounts[0] : null;
}

// ── Exported Functions: Search & Cross-Reference ──────────────

export function lcSearchLore(query: string): { entries: LoreEntry[]; characters: Character[]; secrets: SecretEntry[] } {
  const q = query.toLowerCase().trim();
  if (!q) return { entries: [], characters: [], secrets: [] };
  const matchedEntries = ENTRIES.filter(e =>
    e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q) || e.flavorQuote.toLowerCase().includes(q)
  );
  const matchedCharacters = CHARACTERS.filter(c =>
    c.name.toLowerCase().includes(q) || c.background.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
  );
  const matchedSecrets = SECRETS.filter(s =>
    s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
  );
  return {
    entries: matchedEntries.map(e => ({ ...e, relatedEntries: [...e.relatedEntries] })),
    characters: matchedCharacters.map(c => ({ ...c, relationships: [...c.relationships], quotes: [...c.quotes] })),
    secrets: matchedSecrets.map(s => ({ ...s, relatedEntries: [...s.relatedEntries] })),
  };
}

export function lcGetRelatedEntries(entryId: string): LoreEntry[] {
  const entry = lcGetEntryById(entryId);
  if (!entry) return [];
  return entry.relatedEntries
    .map(rid => lcGetEntryById(rid))
    .filter((e): e is LoreEntry => e !== null)
    .map(e => ({ ...e, relatedEntries: [...e.relatedEntries] }));
}

// ── Exported Functions: Progression ───────────────────────────

export function lcGetLoreRank(): { rank: MasteryRank; progressToNext: number; nextRank: MasteryRank | null; pointsForNext: number } {
  const ranks: MasteryRank[] = ["Novice", "Scholar", "Sage", "Archivist", "Loremaster"];
  const current = lcGetMasteryRank();
  const currentIdx = ranks.indexOf(current);
  const thresholds = [0, 50, 200, 500, 1000];
  const pts = lcGetLorePoints();
  if (currentIdx >= ranks.length - 1) {
    return { rank: current, progressToNext: 100, nextRank: null, pointsForNext: 0 };
  }
  const nextRank = ranks[currentIdx + 1];
  const nextThreshold = thresholds[currentIdx + 1];
  const currentThreshold = thresholds[currentIdx];
  const progress = nextThreshold > currentThreshold
    ? Math.round(((pts - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
    : 0;
  return { rank: current, progressToNext: Math.min(progress, 100), nextRank, pointsForNext: nextThreshold - pts };
}

export function lcGetNextUnlock(): { type: string; description: string; progress: number; required: number } | null {
  const s = lcEnsureInit();
  const readCount = lcGetReadCount();
  const correctTrivia = Object.values(s.triviaAnswered).filter(a => a.correct).length;
  const secretCount = Object.keys(s.unlockedSecrets).length;

  const candidates = [
    { type: "entry", description: "Next lore entry to read", progress: readCount, required: ENTRIES.length, priority: 1 - (readCount / ENTRIES.length) },
    { type: "trivia", description: "Next trivia answer", progress: correctTrivia, required: TRIVIA.length, priority: 1 - (correctTrivia / TRIVIA.length) },
    { type: "secret", description: "Next secret to unlock", progress: secretCount, required: SECRETS.length, priority: 1 - (secretCount / SECRETS.length) },
  ];

  candidates.sort((a, b) => b.priority - a.priority);
  const best = candidates[0];
  if (!best || best.progress >= best.required) return null;
  return best;
}

// ── Exported Functions: Achievements ──────────────────────────

export function lcGetAchievements(): Achievement[] {
  return lcEnsureInit().achievements.map(a => ({ ...a }));
}

export function lcCheckAchievements(): { newlyUnlocked: Achievement[]; all: Achievement[] } {
  const newlyUnlocked = lcCheckAndUnlockAchievements();
  return { newlyUnlocked, all: lcEnsureInit().achievements.map(a => ({ ...a })) };
}
