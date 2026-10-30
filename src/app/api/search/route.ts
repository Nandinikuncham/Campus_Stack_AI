import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''

    if (!q) {
      return NextResponse.json({ questions: [], tags: [], users: [] })
    }

    const supabase = await createClient()

    const [{ data: qData }, { data: tData }, { data: uData }] = await Promise.all([
      supabase
        .from('questions')
        .select(`
          id, title, body, vote_count, answer_count, created_at,
          author:profiles!questions_author_id_fkey(username, full_name, avatar_url),
          tags:question_tags(tag:tags(name))
        `)
        .or(`title.ilike.%${q}%,body.ilike.%${q}%`)
        .neq('status', 'deleted')
        .limit(10),
      supabase
        .from('tags')
        .select('id, name, question_count')
        .ilike('name', `%${q}%`)
        .limit(8),
      supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, college, reputation')
        .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
        .limit(8),
    ])

    const questions = (qData || []).map((item: any) => ({
      ...item,
      tags: item.tags?.map((t: any) => t.tag?.name).filter(Boolean) || [],
    }))

    return NextResponse.json({
      questions,
      tags: tData || [],
      users: uData || [],
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
