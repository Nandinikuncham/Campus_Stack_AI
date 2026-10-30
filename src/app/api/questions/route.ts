import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const questionSchema = z.object({
  title: z.string().min(10).max(150),
  body: z.string().min(30),
  tags: z.array(z.string()).min(1).max(5),
  isAiImproved: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '15')
    const sort = searchParams.get('sort') || 'newest'
    const tag = searchParams.get('tag')
    const status = searchParams.get('status') || 'all'

    const from = (page - 1) * limit
    const to = from + limit - 1

    const supabase = await createClient()

    let query = supabase
      .from('questions')
      .select(`
        *,
        author:profiles!questions_author_id_fkey(id, username, full_name, avatar_url, college, reputation),
        tags:question_tags(tag:tags(*))
      `, { count: 'exact' })
      .neq('status', 'deleted')
      .range(from, to)

    if (status === 'unanswered') query = query.eq('answer_count', 0)
    if (sort === 'newest') query = query.order('created_at', { ascending: false })
    else if (sort === 'votes') query = query.order('vote_count', { ascending: false })
    else if (sort === 'active') query = query.order('updated_at', { ascending: false })

    if (tag) {
      const { data: tagData } = await supabase.from('tags').select('id').eq('name', tag).single()
      if (tagData) {
        const { data: qIds } = await supabase.from('question_tags').select('question_id').eq('tag_id', tagData.id)
        if (qIds?.length) query = query.in('id', qIds.map((q: any) => q.question_id))
      }
    }

    const { data, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const questions = (data || []).map((q: any) => ({
      ...q,
      tags: q.tags?.map((t: any) => t.tag) || [],
    }))

    return NextResponse.json({
      questions,
      total: count || 0,
      page,
      hasMore: (count || 0) > to + 1,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = questionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    }

    const { title, body: content, tags, isAiImproved } = parsed.data

    // 1. Insert question
    const { data: question, error: qError } = await supabase
      .from('questions')
      .insert({
        title,
        body: content,
        author_id: user.id,
        is_ai_improved: !!isAiImproved,
      })
      .select('*')
      .single()

    if (qError || !question) {
      return NextResponse.json({ error: qError?.message || 'Failed to create question' }, { status: 400 })
    }

    // 2. Associate tags (using admin client to ensure tags can be created/incremented)
    const admin = await createAdminClient()
    for (const tagName of tags) {
      const normalized = tagName.trim()
      // find or create tag
      let { data: tagRecord } = await admin
        .from('tags')
        .select('*')
        .ilike('name', normalized)
        .single()

      if (!tagRecord) {
        const { data: newTag } = await admin
          .from('tags')
          .insert({ name: normalized, created_by: user.id })
          .select('*')
          .single()
        tagRecord = newTag
      }

      if (tagRecord) {
        await admin.from('question_tags').insert({
          question_id: question.id,
          tag_id: tagRecord.id,
        })
      }
    }

    return NextResponse.json({ question }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
