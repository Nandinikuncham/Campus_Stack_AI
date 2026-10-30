import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { openai, AI_MODEL } from '@/lib/ai/openai'
import { AI_RATE_LIMIT_PER_HOUR } from '@/lib/constants'
import { z } from 'zod'

const explainSchema = z.object({
  topic: z.string().min(2),
  context: z.string().optional(),
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
      feature: 'explain',
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
    if (!allowed) {
      return NextResponse.json({ error: 'AI hourly rate limit reached (20 requests/hour).' }, { status: 429 })
    }

    const json = await request.json()
    const parsed = explainSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid topic' }, { status: 400 })

    const { topic, context } = parsed.data

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        explanation: `### Explanation for "${topic}"\n\nThis concept is a core pillar in computer science curricula.\n\n- **Definition**: Fundamental mechanism governing algorithmic performance or systems behavior.\n- **Intuition**: Think of this as how components synchronize and minimize redundant computation.\n- **Common Exam Trap**: Forgetting edge conditions such as empty inputs or negative weights.`,
      })
    }

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an engaging, clear university computer science and engineering professor. Explain the given topic clearly in markdown with an intuitive analogy, core definition, practical code or conceptual example, and common pitfalls.',
        },
        {
          role: 'user',
          content: `Topic: ${topic}\n\nAdditional Context: ${context || 'None'}`,
        },
      ],
      temperature: 0.5,
    })

    const explanation = response.choices[0]?.message?.content || 'No explanation generated.'
    return NextResponse.json({ explanation })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
