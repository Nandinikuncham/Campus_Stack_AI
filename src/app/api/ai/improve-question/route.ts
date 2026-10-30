import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { openai, AI_MODEL } from '@/lib/ai/openai'
import { AI_RATE_LIMIT_PER_HOUR } from '@/lib/constants'
import { z } from 'zod'

const improveSchema = z.object({
  title: z.string().min(5),
  body: z.string().min(10),
})

async function checkRateLimit(userId: string) {
  const admin = await createAdminClient()
  const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString()
  const { count } = await admin
    .from('ai_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneHourAgo)

  if ((count || 0) >= AI_RATE_LIMIT_PER_HOUR) {
    return false
  }

  try {
    await admin.from('ai_usage_logs').insert({
      user_id: userId,
      feature: 'improve-question',
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
      return NextResponse.json({ error: 'AI hourly rate limit reached (20 requests/hour). Please try again shortly.' }, { status: 429 })
    }

    const json = await request.json()
    const parsed = improveSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const { title, body } = parsed.data

    if (!process.env.OPENAI_API_KEY) {
      // Graceful fallback
      return NextResponse.json({
        improvedTitle: `${title.endsWith('?') ? title : title + '?'}`.trim(),
        improvedBody: `${body}\n\n### Expected vs Actual\n- **Expected**: \n- **Actual**: \n\n### Steps to Reproduce\n1. `,
        suggestions: [
          'Add your specific compiler version and operating system.',
          'Format any code blocks with backticks and language identifiers.',
          'Provide the exact error message or stack trace.',
        ],
      })
    }

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert computer science tutor helping college students write high quality technical questions.
Given a draft question title and body, produce an improved title, an improved body with clear markdown formatting (retaining their core question), and 3 bullet points of constructive advice.
Return ONLY valid JSON in this format:
{
  "improvedTitle": "string",
  "improvedBody": "string",
  "suggestions": ["string", "string", "string"]
}`,
        },
        {
          role: 'user',
          content: `Title: ${title}\n\nBody: ${body}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const raw = response.choices[0]?.message?.content || '{}'
    const result = JSON.parse(raw)

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({
      improvedTitle: 'How can I fix this issue?',
      improvedBody: 'Could you please provide the full stack trace and sample input?',
      suggestions: ['Include minimal reproducible code', 'State what was tried'],
    })
  }
}
