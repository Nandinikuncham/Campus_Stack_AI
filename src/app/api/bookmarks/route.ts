import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const bookmarkSchema = z.object({
  questionId: z.string().uuid(),
})

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        *,
        question:questions(
          *,
          author:profiles!questions_author_id_fkey(*),
          tags:question_tags(tag:tags(*))
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const bookmarks = (data || []).map((b: any) => ({
      ...b,
      question: b.question ? {
        ...b.question,
        tags: b.question.tags?.map((t: any) => t.tag) || [],
      } : null,
    }))

    return NextResponse.json({ bookmarks })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const json = await request.json()
    const parsed = bookmarkSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid questionId' }, { status: 400 })

    const { questionId } = parsed.data

    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('question_id', questionId)
      .single()

    if (existing) {
      await supabase.from('bookmarks').delete().eq('id', existing.id)
      return NextResponse.json({ bookmarked: false })
    } else {
      await supabase.from('bookmarks').insert({
        user_id: user.id,
        question_id: questionId,
      })
      return NextResponse.json({ bookmarked: true })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
