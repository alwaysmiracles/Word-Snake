import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export type PoemStyle = 'free_verse' | 'haiku' | 'limerick' | 'sonnet'

const STYLE_PROMPTS: Record<PoemStyle, string> = {
  free_verse:
    'Write a free verse poem. It should be lyrical, evocative, and naturally incorporate all the given words. There are no constraints on rhyme or meter — focus on imagery and emotion.',
  haiku:
    'Write a haiku (5-7-5 syllable pattern) for each given word. Each haiku should capture the essence of its word. Keep them concise and nature-focused. Create one haiku per word if possible.',
  limerick:
    'Write a limerick (AABBA rhyme scheme with humorous tone) that incorporates the given words. Make it witty, playful, and light-hearted while including as many words as possible.',
  sonnet:
    'Write a Shakespearean sonnet (14 lines, ABABCDCDEFEFGG rhyme scheme, iambic pentameter) that incorporates the given words. Make it elegant and romantic.',
}

export async function POST(request: NextRequest) {
  try {
    const { words, style } = await request.json()

    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of words' },
        { status: 400 }
      )
    }

    const poemStyle: PoemStyle = style && STYLE_PROMPTS[style] ? style : 'free_verse'
    const stylePrompt = STYLE_PROMPTS[poemStyle]

    const zai = await ZAI.create()

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: `You are a creative poet. ${stylePrompt} Write in English. After the poem, list ALL the given words you used on a separate line prefixed with "USED:". Example format:\n\n[Poem text]\n\nUSED: word1, word2, word3`,
        },
        {
          role: 'user',
          content: `Write a ${poemStyle.replace('_', ' ')} poem using these words: ${words.join(', ')}`,
        },
      ],
      thinking: { type: 'disabled' },
    })

    const response = completion.choices[0]?.message?.content || ''

    // Parse which words were actually used in the poem
    let usedWords: string[] = []
    const usedMatch = response.match(/USED:\s*(.+)/i)
    if (usedMatch) {
      usedWords = usedMatch[1]
        .split(',')
        .map((w: string) => w.trim().toLowerCase())
        .filter((w: string) => words.map((word: string) => word.toLowerCase()).includes(w))
    }

    // If no USED: marker found, try to detect which words appear in the poem
    if (usedWords.length === 0) {
      const poemText = response.toLowerCase()
      usedWords = words.filter((word: string) =>
        poemText.includes(word.toLowerCase())
      )
    }

    // Remove the USED: line from the poem text for display
    const poem = response.replace(/USED:.*$/i, '').trim()

    return NextResponse.json({
      poem,
      usedWords,
      style: poemStyle,
    })
  } catch (error) {
    console.error('Poem generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate poem. Please try again.' },
      { status: 500 }
    )
  }
}
