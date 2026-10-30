import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { Profile } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  let profile: Profile | null = null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      profile = data as Profile | null
    }
  } catch {}

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar profile={profile} />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="hidden lg:flex w-56 xl:w-64 shrink-0">
          <div className="fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-56 xl:w-64 overflow-y-auto">
            <Sidebar profile={profile} />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>

        {/* Right Sidebar */}
        <div className="hidden xl:block w-64 shrink-0">
          <div className="fixed top-14 right-0 h-[calc(100vh-3.5rem)] w-64 overflow-y-auto p-4">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
