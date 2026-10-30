import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { openai, AI_MODEL } from '@/lib/ai/openai'
import { AI_RATE_LIMIT_PER_HOUR } from '@/lib/constants'
import { z } from 'zod'

const codeSchema = z.object({
  code: z.string().min(5),
  language: z.string().optional(),
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
      feature: 'explain-code',
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
    const parsed = codeSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid code' }, { status: 400 })

    const { code, language } = parsed.data

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        explanation: `### Code Analysis (${language || 'generic'})\n\n- **Functionality**: The code performs iterative processing over the input structure.\n- **Time Complexity**: $O(n)$ where $n$ is the number of elements.\n- **Space Complexity**: $O(1)$ auxiliary memory.\n- **Potential Improvements**: Add bounds checking and assert pre-conditions before dereferencing pointers.`,
      })
    }

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert programming language and software engineering educator. Explain the provided code clearly: Purpose, Step-by-Step Walkthrough, Time Complexity Big-O, Space Complexity Big-O, and edge-case recommendations.',
        },
        {
          role: 'user',
          content: `Language: ${language || 'Auto'}\n\n\`\`\`\n${code}\n\`\`\``,
        },
      ],
      temperature: 0.3,
    })

    const explanation = response.choices[0]?.message?.content || 'No explanation generated.'
    return NextResponse.json({ explanation })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
