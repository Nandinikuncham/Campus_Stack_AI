import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const reportCreateSchema = z.object({
  reason: z.string().min(3).max(100),
  details: z.string().max(500).optional(),
  questionId: z.string().uuid().optional(),
  answerId: z.string().uuid().optional(),
  commentId: z.string().uuid().optional(),
})

const reportActionSchema = z.object({
  reportId: z.string().uuid(),
  action: z.enum(['dismiss', 'resolve', 'delete_content']),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const json = await request.json()
    const parsed = reportCreateSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid report data' }, { status: 400 })

    const { reason, details, questionId, answerId, commentId } = parsed.data
    if (!questionId && !answerId && !commentId) {
      return NextResponse.json({ error: 'No target specified' }, { status: 400 })
    }

    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        reason,
        details: details || null,
        question_id: questionId || null,
        answer_id: answerId || null,
        comment_id: commentId || null,
      })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, report }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const json = await request.json()
    const parsed = reportActionSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid action parameters' }, { status: 400 })

    const { reportId, action } = parsed.data
    const admin = await createAdminClient()

    const { data: report } = await admin.from('reports').select('*').eq('id', reportId).single()
    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

    if (action === 'delete_content') {
      if (report.question_id) {
        await admin.from('questions').update({ status: 'deleted' }).eq('id', report.question_id)
      } else if (report.answer_id) {
        await admin.from('answers').delete().eq('id', report.answer_id)
      } else if (report.comment_id) {
        await admin.from('comments').delete().eq('id', report.comment_id)
      }
      await admin.from('reports').update({ status: 'resolved' }).eq('id', reportId)
    } else if (action === 'dismiss') {
      await admin.from('reports').update({ status: 'dismissed' }).eq('id', reportId)
    } else if (action === 'resolve') {
      await admin.from('reports').update({ status: 'resolved' }).eq('id', reportId)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
