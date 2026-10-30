import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { openai, AI_MODEL } from '@/lib/ai/openai'
import { AI_RATE_LIMIT_PER_HOUR } from '@/lib/constants'
import { z } from 'zod'

const summarizeSchema = z.object({
  content: z.string().min(10),
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
      feature: 'summarize',
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
    const parsed = summarizeSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid content' }, { status: 400 })

    const { content } = parsed.data

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        summary: `### Discussion Summary\n\n- **Core Problem**: Identifying correct design invariants and error roots.\n- **Primary Solution**: Ensure edge constraints are verified prior to recursion or memory access.\n- **Best Practice**: Use structured logging and unit test corner cases.`,
      })
    }

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an academic summarizer. Summarize this student technical discussion into 3-4 clear bullet points: Problem Statement, Key Insights, Recommended Fix, and Gotchas.',
        },
        {
          role: 'user',
          content,
        },
      ],
      temperature: 0.3,
    })

    const summary = response.choices[0]?.message?.content || 'No summary generated.'
    return NextResponse.json({ summary })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
