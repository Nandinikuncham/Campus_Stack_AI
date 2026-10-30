import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const answerSchema = z.object({
  questionId: z.string().uuid(),
  body: z.string().min(10),
  isAiGenerated: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const parsed = answerSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    }

    const { questionId, body, isAiGenerated } = parsed.data

    // 1. Verify question exists
    const { data: question } = await supabase
      .from('questions')
      .select('id, title, author_id')
      .eq('id', questionId)
      .neq('status', 'deleted')
      .single()

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    // 2. Insert answer
    const { data: answer, error } = await supabase
      .from('answers')
      .insert({
        question_id: questionId,
        author_id: user.id,
        body,
        is_ai_generated: !!isAiGenerated,
      })
      .select('*, author:profiles!answers_author_id_fkey(*)')
      .single()

    if (error || !answer) {
      return NextResponse.json({ error: error?.message || 'Failed to submit answer' }, { status: 400 })
    }

    // 3. Notify question author using admin client if answer author != question author
    if (question.author_id !== user.id) {
      const admin = await createAdminClient()
      const { data: senderProfile } = await admin
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

      await admin.from('notifications').insert({
        user_id: question.author_id,
        type: 'new_answer',
        title: `New answer from @${senderProfile?.username || 'a peer'}`,
        body: `"${question.title.slice(0, 50)}..."`,
        link: `/questions/${questionId}`,
      })
    }

    return NextResponse.json({ answer }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
