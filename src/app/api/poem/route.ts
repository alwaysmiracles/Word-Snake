import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { words } = await request.json()

    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of words' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'You are a creative poet. Write beautiful, meaningful poems that incorporate all the given words naturally. The poem should be elegant and evocative. Write in English. After the poem, list the words you used on a separate line prefixed with "USED:". Example format:\n\n[Rose poem text]\n\nUSED: rose, garden, love',
        },
        {
          role: 'user',
          content: `Write a poem using these words: ${words.join(', ')}`,
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
    })
  } catch (error) {
    console.error('Poem generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate poem. Please try again.' },
      { status: 500 }
    )
  }
}
