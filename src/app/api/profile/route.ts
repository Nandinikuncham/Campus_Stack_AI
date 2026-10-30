import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_COLLEGE } from '@/lib/constants'
import { z } from 'zod'

const profileUpdateSchema = z.object({
  fullName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  college: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  graduationYear: z.number().int().min(2000).max(2040).nullable().optional(),
  skills: z.array(z.string()).max(15).optional(),
  profilePublic: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ profile })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const json = await request.json()
    const parsed = profileUpdateSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })

    const { fullName, bio, college, department, graduationYear, skills, profilePublic } = parsed.data

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }
    if (fullName !== undefined) updateData.full_name = fullName
    if (bio !== undefined) updateData.bio = bio
    if (college !== undefined) updateData.college = college.trim() || DEFAULT_COLLEGE
    if (department !== undefined) updateData.department = department
    if (graduationYear !== undefined) updateData.graduation_year = graduationYear
    if (skills !== undefined) updateData.skills = skills
    if (profilePublic !== undefined) updateData.profile_public = profilePublic

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ profile })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
