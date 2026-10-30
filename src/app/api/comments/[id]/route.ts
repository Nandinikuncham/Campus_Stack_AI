import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: existing } = await supabase.from('comments').select('author_id').eq('id', id).single()
    if (!existing) return NextResponse.json({ error: 'Comment not found' }, { status: 404 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isAuthorized = existing.author_id === user.id || profile?.role === 'admin' || profile?.role === 'moderator'
    if (!isAuthorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await supabase.from('comments').delete().eq('id', id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
