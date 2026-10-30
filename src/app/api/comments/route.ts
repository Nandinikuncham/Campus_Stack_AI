import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const commentSchema = z.object({
  body: z.string().min(5).max(600),
  questionId: z.string().uuid().optional(),
  answerId: z.string().uuid().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const json = await request.json()
    const parsed = commentSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })

    const { body, questionId, answerId } = parsed.data
    if (!questionId && !answerId) {
      return NextResponse.json({ error: 'Must specify questionId or answerId' }, { status: 400 })
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        body,
        question_id: questionId || null,
        answer_id: answerId || null,
        author_id: user.id,
      })
      .select('*, author:profiles!comments_author_id_fkey(*)')
      .single()

    if (error || !comment) {
      return NextResponse.json({ error: error?.message || 'Failed to post comment' }, { status: 400 })
    }

    // Notify author of answer or question
    const admin = await createAdminClient()
    let targetUserId: string | null = null
    let link = ''

    if (answerId) {
      const { data: a } = await admin.from('answers').select('author_id, question_id').eq('id', answerId).single()
      if (a) {
        targetUserId = a.author_id
        link = `/questions/${a.question_id}`
      }
    } else if (questionId) {
      const { data: q } = await admin.from('questions').select('author_id').eq('id', questionId).single()
      if (q) {
        targetUserId = q.author_id
        link = `/questions/${questionId}`
      }
    }

    if (targetUserId && targetUserId !== user.id) {
      await admin.from('notifications').insert({
        user_id: targetUserId,
        type: 'comment_reply',
        title: `New comment from @${comment.author?.username || 'a peer'}`,
        body: `"${body.slice(0, 60)}..."`,
        link,
      })
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
