import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { openai, AI_MODEL } from '@/lib/ai/openai'
import { AI_RATE_LIMIT_PER_HOUR } from '@/lib/constants'
import { z } from 'zod'

const hintsSchema = z.object({
  question: z.string().min(10),
})

async function checkRateLimit(userId: string) {
  const admin = await createAdminClient()
  const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString()
  const { count } = await admin
    .from('ai_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneHourAgo)

  if ((count || 0) >= AI_RATE_LIMIT_PER_HOUR) return false

  try {
    await admin.from('ai_usage_logs').insert({
      user_id: userId,
      feature: 'hints',
    })
  } catch {}

  return true
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const allowed = await checkRateLimit(user.id)
    if (!allowed) return NextResponse.json({ error: 'AI hourly rate limit reached.' }, { status: 429 })

    const json = await request.json()
    const parsed = hintsSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid question text' }, { status: 400 })

    const { question } = parsed.data

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        hints: `### Guided Hints\n\n1. **Hint 1 (High Level)**: What condition must hold true when the base case is reached?\n2. **Hint 2 (Data Structure)**: Consider whether your lookup or iteration ordering guarantees minimum cost.\n3. **Hint 3 (Edge Case)**: Test with an empty collection or extreme values to identify unexpected state mutations.`,
      })
    }

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a Socratic computer science mentor. Never give away the full final solution immediately. Provide 3 progressive hints: Hint 1 (gentle conceptual nudge), Hint 2 (closer look at the logic/invariants), and Hint 3 (targeted question to reveal the bug/fix).',
        },
        {
          role: 'user',
          content: `Question: ${question}`,
        },
      ],
      temperature: 0.4,
    })

    const hints = response.choices[0]?.message?.content || 'No hints generated.'
    return NextResponse.json({ hints })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
