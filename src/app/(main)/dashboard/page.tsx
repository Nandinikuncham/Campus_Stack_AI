import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QuestionCard } from '@/components/questions/QuestionCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { PlusCircle, MessageSquare } from 'lucide-react'
import { Question, Profile } from '@/lib/types'

export const metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'

async function getQuestions(supabase: any, filter: string, userId: string) {
  try {
    let query = supabase
      .from('questions')
      .select(`*, author:profiles!questions_author_id_fkey(id, username, full_name, avatar_url, college, reputation), tags:question_tags(tag:tags(*))`)
      .neq('status', 'deleted')
      .limit(10)

    if (filter === 'newest') query = query.order('created_at', { ascending: false })
    else if (filter === 'unanswered') query = query.eq('answer_count', 0).order('created_at', { ascending: false })
    else if (filter === 'active') query = query.order('updated_at', { ascending: false })

    const { data } = await query
    return (data || []).map((q: any) => ({ ...q, tags: q.tags?.map((t: any) => t.tag) || [] }))
  } catch {
    return []
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const [newest, unanswered, active] = await Promise.all([
    getQuestions(supabase, 'newest', user.id),
    getQuestions(supabase, 'unanswered', user.id),
    getQuestions(supabase, 'active', user.id),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {profile?.full_name || profile?.username || 'Student'}! 👋</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening in your community today.</p>
        </div>
        <Button asChild>
          <Link href="/questions/ask"><PlusCircle className="h-4 w-4 mr-2" />Ask Question</Link>
        </Button>
      </div>

      {/* Profile completion nudge */}
      {!profile?.college && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Complete your profile</p>
            <p className="text-xs text-muted-foreground mt-0.5">Add your college and skills to connect with peers.</p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/profile/edit">Edit Profile</Link>
          </Button>
        </div>
      )}

      {/* Questions tabs */}
      <Tabs defaultValue="newest">
        <TabsList>
          <TabsTrigger value="newest">Newest</TabsTrigger>
          <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
        </TabsList>

        {[
          { value: 'newest', questions: newest },
          { value: 'unanswered', questions: unanswered },
          { value: 'active', questions: active },
        ].map(({ value, questions }) => (
          <TabsContent key={value} value={value} className="space-y-3 mt-4">
            {questions.length === 0 ? (
              <EmptyState icon={MessageSquare} title="No questions yet" description="Be the first to ask a question!" action={<Button asChild><Link href="/questions/ask">Ask a Question</Link></Button>} />
            ) : (
              questions.map((q: Question) => <QuestionCard key={q.id} question={q} />)
            )}
            <div className="pt-2">
              <Button variant="outline" asChild className="w-full"><Link href="/questions">View all questions →</Link></Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
