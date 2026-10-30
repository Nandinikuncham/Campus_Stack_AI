import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateSchema = z.object({
  body: z.string().min(10),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: existing } = await supabase
      .from('answers')
      .select('author_id')
      .eq('id', id)
      .single()

    if (!existing) return NextResponse.json({ error: 'Answer not found' }, { status: 404 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isAuthorized = existing.author_id === user.id || profile?.role === 'admin' || profile?.role === 'moderator'
    if (!isAuthorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const json = await request.json()
    const parsed = updateSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })

    const { data: updated, error } = await supabase
      .from('answers')
      .update({
        body: parsed.data.body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ answer: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: existing } = await supabase
      .from('answers')
      .select('author_id')
      .eq('id', id)
      .single()

    if (!existing) return NextResponse.json({ error: 'Answer not found' }, { status: 404 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isAuthorized = existing.author_id === user.id || profile?.role === 'admin' || profile?.role === 'moderator'
    if (!isAuthorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await supabase.from('answers').delete().eq('id', id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
