import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { openai, AI_MODEL } from '@/lib/ai/openai'
import { AI_RATE_LIMIT_PER_HOUR } from '@/lib/constants'
import { z } from 'zod'

const relatedSchema = z.object({
  title: z.string().min(5),
  tags: z.array(z.string()).optional(),
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
      feature: 'related-questions',
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
    const parsed = relatedSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const { title, tags } = parsed.data

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        related: [
          'How does time complexity differ in worst vs average case for this problem?',
          'What are the memory layout implications of using this approach?',
          'How is this concept applied in high-throughput production systems?',
        ],
      })
    }

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an academic curriculum designer. Suggest 3 to 5 related follow-up technical questions or advanced variations that a student should study next. Return JSON: { "related": ["string", "string", "string"] }',
        },
        {
          role: 'user',
          content: `Question Title: ${title}\nTags: ${tags?.join(', ') || 'General'}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    })

    const raw = response.choices[0]?.message?.content || '{}'
    const result = JSON.parse(raw)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({
      related: [
        'How to optimize this algorithm for constrained environments?',
        'What are standard industry alternatives to this pattern?',
      ],
    })
  }
}
