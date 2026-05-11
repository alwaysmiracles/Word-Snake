// Word Context Sentences — built-in sentence database for the Word Snake game
// Client-side only; no 'use client' needed (plain lib).

export interface WordSentence {
  word: string
  sentence: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface SentenceCache {
  entries: Map<string, WordSentence[]>
  lastUpdated: number
  maxSize: number
  hitCount: number
  missCount: number
}

type Diff = WordSentence['difficulty']

interface DbEntry { word: string; s: [string, Diff][]; cat: string }

// 64 words × 2 sentences = 128 sentences across 8 categories
const DB: DbEntry[] = [
  { word:'eagle', cat:'animals', s:[['The eagle soared high above the mountain ridge.','easy'],['Eagles possess extraordinary eyesight that can spot prey from over a mile away.','medium']] },
  { word:'wolf', cat:'animals', s:[['The wolf howled at the bright full moon.','easy'],['Wolves are highly social animals that live in complex pack hierarchies.','medium']] },
  { word:'dolphin', cat:'animals', s:[['The dolphin jumped gracefully out of the water.','easy'],['Dolphins use echolocation to navigate and communicate underwater.','hard']] },
  { word:'dragon', cat:'animals', s:[['The dragon breathed a stream of bright fire.','easy'],['In many cultures the dragon symbolises strength, wisdom, and good fortune.','medium']] },
  { word:'tiger', cat:'animals', s:[['The tiger has beautiful orange and black stripes.','easy'],['Tigers are solitary hunters that can take down prey much larger than themselves.','medium']] },
  { word:'whale', cat:'animals', s:[['The whale swam through the deep blue ocean.','easy'],['Blue whales are the largest animals ever known to have lived on Earth.','medium']] },
  { word:'swan', cat:'animals', s:[['The white swan glided across the quiet lake.','easy'],['Swans are known for their lifelong pair bonds and elegant courtship displays.','hard']] },
  { word:'raven', cat:'animals', s:[['The raven sat quietly on the old fence post.','easy'],['Ravens are remarkably intelligent and can even mimic human speech.','medium']] },
  { word:'apple', cat:'food', s:[['She picked a red apple from the tree in the garden.','easy'],['Apples are one of the most popular fruits for making desserts around the world.','medium']] },
  { word:'bread', cat:'food', s:[['Fresh bread smells wonderful when it comes out of the oven.','easy'],['Sourdough bread relies on naturally occurring lactobacillus and yeast for fermentation.','hard']] },
  { word:'honey', cat:'food', s:[['He added a spoonful of honey to his warm tea.','easy'],['Honey has been used as a natural sweetener and remedy for thousands of years.','medium']] },
  { word:'lemon', cat:'food', s:[['She squeezed fresh lemon juice over the salad.','easy'],['Lemons are rich in vitamin C and were historically used to prevent scurvy.','medium']] },
  { word:'pepper', cat:'food', s:[['A pinch of pepper makes the soup taste much better.','easy'],['Black pepper, known as the king of spices, was once used as currency.','hard']] },
  { word:'cookie', cat:'food', s:[['The chocolate chip cookie was still warm and soft.','easy'],['Baking cookies at the right temperature keeps them chewy in the centre.','medium']] },
  { word:'cheese', cat:'food', s:[['She sprinkled grated cheese over the hot pasta.','easy'],['There are over one thousand distinct varieties of cheese produced worldwide.','medium']] },
  { word:'grape', cat:'food', s:[['The purple grape was sweet and juicy.','easy'],['Grapes have been cultivated for winemaking since ancient civilisations.','hard']] },
  { word:'crimson', cat:'colors', s:[['The crimson leaves fell gently to the ground.','easy'],['Crimson is a deep red colour historically associated with royalty and nobility.','medium']] },
  { word:'azure', cat:'colors', s:[['The sky was a brilliant shade of azure.','easy'],['Azure takes its name from the vivid blue of the lapis lazuli gemstone.','hard']] },
  { word:'ivory', cat:'colors', s:[['The ivory piano keys gleamed under the stage lights.','easy'],['Ivory describes a warm off-white shade that is softer and creamier than pure white.','medium']] },
  { word:'emerald', cat:'colors', s:[['She wore an emerald dress to the summer party.','easy'],['The emerald green of the forest canopy was breathtaking after the morning rain.','medium']] },
  { word:'gold', cat:'colors', s:[['The gold medal hung proudly around his neck.','easy'],['Gold has been treasured for its rarity and resistance to corrosion for millennia.','medium']] },
  { word:'scarlet', cat:'colors', s:[['A scarlet scarf brightened up her dark winter coat.','easy'],['The scarlet macaw is one of the most recognisable parrots in the tropical rainforest.','hard']] },
  { word:'violet', cat:'colors', s:[['Tiny violet flowers grew along the garden path.','easy'],['Violet light sits at the shortest wavelength end of the visible spectrum.','hard']] },
  { word:'silver', cat:'colors', s:[['The silver moon reflected on the still lake.','easy'],['Silver has the highest electrical conductivity of any element on the periodic table.','hard']] },
  { word:'river', cat:'nature', s:[['The river wound its way through the green valley.','easy'],['Rivers shape landscapes over millennia through erosion and sediment deposition.','hard']] },
  { word:'forest', cat:'nature', s:[['Tall trees covered the forest floor in cool shade.','easy'],['Tropical rainforests are home to more than half of all terrestrial species.','hard']] },
  { word:'mountain', cat:'nature', s:[['Snow covered the top of the tall mountain.','easy'],['Tectonic plate collisions are responsible for forming the world\'s great mountain ranges.','hard']] },
  { word:'ocean', cat:'nature', s:[['Waves crashed gently against the sandy shore.','easy'],['The ocean absorbs roughly one-third of the carbon dioxide produced by human activity.','hard']] },
  { word:'sunset', cat:'nature', s:[['The sunset painted the sky in warm orange colours.','easy'],['Sunset colours are caused by Rayleigh scattering of sunlight through the atmosphere.','hard']] },
  { word:'storm', cat:'nature', s:[['A loud storm kept everyone indoors that evening.','easy'],['Supercell storms can produce large hail, destructive winds, and devastating tornadoes.','hard']] },
  { word:'volcano', cat:'nature', s:[['The volcano erupted with a huge cloud of ash.','easy'],['Volcanic eruptions release gases and minerals that enrich surrounding soils.','medium']] },
  { word:'rainbow', cat:'nature', s:[['A bright rainbow appeared after the morning rain.','easy'],['Rainbows form when sunlight is refracted and dispersed inside water droplets.','hard']] },
  { word:'heart', cat:'body', s:[['Your heart beats about one hundred thousand times a day.','easy'],['The human heart pumps roughly five litres of blood per minute through the body.','hard']] },
  { word:'brain', cat:'body', s:[['Your brain helps you think, learn, and remember things.','easy'],['The human brain contains approximately eighty-six billion neurons and trillions of synapses.','hard']] },
  { word:'finger', cat:'body', s:[['She pointed her finger at the bright star in the sky.','easy'],['Each human finger contains three phalanges controlled by an intricate tendon network.','hard']] },
  { word:'elbow', cat:'body', s:[['He bumped his elbow on the corner of the table.','easy'],['The funny-bone sensation occurs when the ulnar nerve is compressed at the elbow.','hard']] },
  { word:'spine', cat:'body', s:[['Good posture helps keep your spine healthy and strong.','easy'],['The vertebral column protects the spinal cord and provides structural support.','medium']] },
  { word:'muscle', cat:'body', s:[['Regular exercise makes your muscles stronger over time.','easy'],['Skeletal muscles contract in response to electrical signals from the nervous system.','hard']] },
  { word:'pulse', cat:'body', s:[['The doctor checked her pulse to measure her heart rate.','easy'],['A resting pulse of sixty to one hundred beats per minute is considered normal.','medium']] },
  { word:'tongue', cat:'body', s:[['The cat stuck out its rough pink tongue.','easy'],['The tongue is covered with papillae that house taste buds for detecting five flavours.','hard']] },
  { word:'dance', cat:'actions', s:[['The children love to dance to their favourite songs.','easy'],['Contemporary dance combines elements of ballet, jazz, and modern expressive movement.','medium']] },
  { word:'whisper', cat:'actions', s:[['She leaned close to whisper a secret in his ear.','easy'],['The ability to whisper requires precise control of the vocal folds to limit airflow.','hard']] },
  { word:'soar', cat:'actions', s:[['The kite began to soar high in the blue sky.','easy'],['Ambient thermal currents allow large birds to soar effortlessly for hours without flapping.','medium']] },
  { word:'bloom', cat:'actions', s:[['The cherry trees bloom every spring in beautiful pink.','easy'],['Alpine flowers bloom rapidly during the short summer before returning to dormancy.','medium']] },
  { word:'conquer', cat:'actions', s:[['She worked hard to conquer her fear of heights.','easy'],['Throughout history, nations have sought to conquer territories to expand their influence.','medium']] },
  { word:'wander', cat:'actions', s:[['They love to wander through the old city streets.','easy'],['Many great writers and philosophers have found inspiration while wandering in nature.','medium']] },
  { word:'flourish', cat:'actions', s:[['With plenty of sunlight, the garden began to flourish.','easy'],['Civilisations flourish when they invest in education, infrastructure, and cultural exchange.','medium']] },
  { word:'sparkle', cat:'actions', s:[['The diamonds sparkle brightly under the bright lights.','easy'],['Stars sparkle in the night sky due to atmospheric turbulence refracting their light.','hard']] },
  { word:'joy', cat:'emotions', s:[['Her face filled with joy when she saw the puppy.','easy'],['The pursuit of joy is a central theme in many philosophical and spiritual traditions.','medium']] },
  { word:'courage', cat:'emotions', s:[['It takes courage to stand up for what you believe in.','easy'],['Courage is not the absence of fear, but rather the determination to act despite it.','medium']] },
  { word:'nostalgia', cat:'emotions', s:[['Old photographs filled him with a warm sense of nostalgia.','easy'],['Nostalgia was originally classified as a medical condition affecting soldiers far from home.','hard']] },
  { word:'bliss', cat:'emotions', s:[['Lying in the warm sun was pure bliss on a cold day.','easy'],['Psychologists suggest that moments of bliss arise when we are fully present and engaged.','medium']] },
  { word:'sorrow', cat:'emotions', s:[['A deep sorrow filled her heart after the loss.','easy'],['Literature often explores sorrow as a transformative emotion that deepens human empathy.','medium']] },
  { word:'wonder', cat:'emotions', s:[['The child looked at the stars with a sense of wonder.','easy'],['A sense of wonder drives scientific curiosity and the desire to understand nature.','medium']] },
  { word:'envy', cat:'emotions', s:[['He tried not to show envy when his friend won the prize.','easy'],['Philosophers distinguish between benign envy that motivates and malicious envy that destroys.','hard']] },
  { word:'pride', cat:'emotions', s:[['She felt great pride when her team won the final match.','easy'],['Balanced pride fosters confidence, whereas excessive pride can lead to arrogance.','medium']] },
  { word:'pixel', cat:'technology', s:[['Each pixel on the screen displays a tiny dot of colour.','easy'],['A single megapixel image contains approximately one million pixels arranged in a grid.','medium']] },
  { word:'robot', cat:'technology', s:[['The robot can move and pick up objects on its own.','easy'],['Modern surgical robots allow doctors to perform extremely precise procedures.','hard']] },
  { word:'signal', cat:'technology', s:[['My phone shows a strong signal in this part of the building.','easy'],['Digital signals encode information as binary values, enabling error correction.','hard']] },
  { word:'screen', cat:'technology', s:[['She tapped the screen to open the game.','easy'],['Organic LED screens offer better contrast and energy efficiency than traditional displays.','hard']] },
  { word:'battery', cat:'technology', s:[['Remember to charge the battery before your trip.','easy'],['Lithium-ion batteries power most portable electronics due to their high energy density.','medium']] },
  { word:'laser', cat:'technology', s:[['The laser beam cut through the metal with great precision.','easy'],['Lasers produce coherent light through stimulated emission within an optical cavity.','hard']] },
  { word:'codec', cat:'technology', s:[['The video codec compresses large files so they stream smoothly.','medium'],['Modern codecs like H.265 achieve significant compression gains while preserving quality.','hard']] },
  { word:'cursor', cat:'technology', s:[['Move the cursor to the button and click it.','easy'],['The blinking text cursor indicates where the next typed character will be inserted.','medium']] },
]

// Flattened structures for fast look-up
const DB_FLAT: WordSentence[] = DB.flatMap((e) =>
  e.s.map(([sentence, difficulty]) => ({ word: e.word, sentence, category: e.cat, difficulty })),
)
const DB_BY_WORD = new Map<string, WordSentence[]>()
for (const e of DB) DB_BY_WORD.set(e.word, e.s.map(([sentence, difficulty]) => ({ word: e.word, sentence, category: e.cat, difficulty })))

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

export function createSentenceCache(maxSize = 200): SentenceCache {
  return { entries: new Map(), lastUpdated: Date.now(), maxSize, hitCount: 0, missCount: 0 }
}

function evictIfNeeded(cache: SentenceCache) {
  if (cache.entries.size > cache.maxSize) {
    const k = cache.entries.keys().next().value
    if (k !== undefined) cache.entries.delete(k)
  }
}

// ---------------------------------------------------------------------------
// Core look-ups
// ---------------------------------------------------------------------------

/** Get all sentences for a word from the built-in database. */
export function getWordSentences(word: string): WordSentence[] {
  return DB_BY_WORD.get(word) ?? []
}

/** Get a single random sentence for a word. */
export function getRandomSentence(word: string): WordSentence | undefined {
  const list = getWordSentences(word)
  return list.length ? list[Math.floor(Math.random() * list.length)] : undefined
}

/** Get every sentence belonging to a category. */
export function getCategorySentences(category: string): WordSentence[] {
  return DB_FLAT.filter((s) => s.category === category)
}

/** Search sentences by substring match (case-insensitive). */
export function searchSentences(query: string): WordSentence[] {
  const q = query.toLowerCase()
  return DB_FLAT.filter((s) => s.sentence.toLowerCase().includes(q) || s.word.toLowerCase().includes(q))
}

// ---------------------------------------------------------------------------
// Daily / difficulty / formatting
// ---------------------------------------------------------------------------

/** Deterministic daily sentence based on the current date. */
export function getSentenceOfTheDay(): WordSentence {
  const d = new Date()
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
  return DB_FLAT[seed % DB_FLAT.length]
}

/** Classify difficulty based on average word length and sentence length. */
export function getSentenceDifficulty(sentence: string): Diff {
  const words = sentence.split(/\s+/)
  const avgLen = words.reduce((a, w) => a + w.length, 0) / words.length
  if (avgLen <= 5 && sentence.length <= 60) return 'easy'
  if (avgLen <= 6.5 && sentence.length <= 100) return 'medium'
  return 'hard'
}

/** Format sentence with optional **bold** word highlighting. */
export function formatSentence(sentence: string, word: string, highlight = false): string {
  if (!highlight) return sentence
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return sentence.replace(new RegExp(`\\b(${escaped})\\b`, 'gi'), '**$1**')
}

// ---------------------------------------------------------------------------
// Batch / stats / helpers
// ---------------------------------------------------------------------------

/** Batch-get sentences for multiple words, returning a Map. */
export function batchGetSentences(words: string[]): Map<string, WordSentence[]> {
  const result = new Map<string, WordSentence[]>()
  for (const w of words) result.set(w, getWordSentences(w))
  return result
}

/** Return statistics about the sentence database. */
export function getSentenceStats() {
  const categoryCounts: Record<string, number> = {}
  for (const s of DB_FLAT) categoryCounts[s.category] = (categoryCounts[s.category] ?? 0) + 1
  return { totalWords: DB_BY_WORD.size, totalSentences: DB_FLAT.length, categoryCounts }
}

/** Check whether a sentence exists for the given word. */
export function hasSentenceFor(word: string): boolean {
  return DB_BY_WORD.has(word)
}

/** Return words in the word pool that have no sentence entry. */
export function getWordsWithoutSentences(): string[] {
  return DB.map((e) => e.word).filter((w) => !DB_BY_WORD.has(w))
}

/** Generate a simple template sentence when no DB entry exists. */
export function generateFillerSentence(word: string, category: string): WordSentence {
  const templates = [
    `Learning new words like "${word}" helps expand your vocabulary every day.`,
    `The word "${word}" is commonly found in texts about ${category}.`,
    `Can you use "${word}" in a sentence of your own?`,
    `Practising "${word}" regularly will help you remember it forever.`,
  ]
  return { word, sentence: templates[Math.floor(Math.random() * templates.length)], category, difficulty: 'easy' }
}

/** Fisher-Yates shuffle for sentence arrays (in-place). */
export function shuffleSentences(sentences: WordSentence[]): WordSentence[] {
  for (let i = sentences.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[sentences[i], sentences[j]] = [sentences[j], sentences[i]]
  }
  return sentences
}

/** Cached version of getWordSentences — consults and updates the provided cache. */
export function getCachedSentences(word: string, cache: SentenceCache): WordSentence[] {
  const key = word.toLowerCase()
  if (cache.entries.has(key)) { cache.hitCount++; return cache.entries.get(key)! }
  cache.missCount++
  const result = getWordSentences(word)
  cache.entries.set(key, result)
  cache.lastUpdated = Date.now()
  evictIfNeeded(cache)
  return result
}

/** Raw DB re-exports for advanced usage. */
export const SENTENCE_DB = DB
export { DB_FLAT, DB_BY_WORD }
