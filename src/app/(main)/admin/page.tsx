import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Report } from '@/lib/types'
import { AdminDashboardClient } from './AdminDashboardClient'
import { Shield, AlertTriangle } from 'lucide-react'

export const metadata = { title: 'Moderation Console' }
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
    redirect('/dashboard')
  }

  // Fetch pending reports
  const { data: reportsData } = await supabase
    .from('reports')
    .select(`
      *,
      reporter:profiles!reports_reporter_id_fkey(id, username, full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch stats
  const [{ count: qCount }, { count: aCount }, { count: uCount }, { count: rCount }] = await Promise.all([
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.from('answers').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span>Moderation & Administration Console</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review community reports, handle spam or offensive queries, and maintain academic integrity.
        </p>
      </div>

      <AdminDashboardClient
        initialReports={reportsData || []}
        stats={{
          questions: qCount || 0,
          answers: aCount || 0,
          users: uCount || 0,
          pendingReports: rCount || 0,
        }}
      />
    </div>
  )
}
