import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { QuestionCard } from '@/components/questions/QuestionCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle, MessageSquare } from 'lucide-react'
import { Question } from '@/lib/types'

export const metadata = { title: 'Questions' }
export const dynamic = 'force-dynamic'

interface QuestionsPageProps {
  searchParams: Promise<{ tag?: string; sort?: string; status?: string; page?: string }>
}

export default async function QuestionsPage({ searchParams }: QuestionsPageProps) {
  const params = await searchParams
  const tag = params.tag
  const sort = params.sort || 'newest'
  const status = params.status || 'all'
  const page = parseInt(params.page || '1')
  const pageSize = 15
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const supabase = await createClient()

  let query = supabase
    .from('questions')
    .select(`*, author:profiles!questions_author_id_fkey(id, username, full_name, avatar_url, college, reputation), tags:question_tags(tag:tags(*))`, { count: 'exact' })
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

  let questions: Question[] = []
  let count = 0

  try {
    const { data, count: totalCount } = await query
    questions = (data || []).map((q: any) => ({ ...q, tags: q.tags?.map((t: any) => t.tag) || [] }))
    count = totalCount || 0
  } catch {}

  const totalPages = Math.ceil((count || 0) / pageSize)

  const sorts = ['newest', 'votes', 'active', 'unanswered']
  const statuses = ['all', 'unanswered']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{tag ? `Questions tagged [${tag}]` : 'All Questions'}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{count || 0} questions</p>
        </div>
        <Button asChild>
          <Link href="/questions/ask"><PlusCircle className="h-4 w-4 mr-2" />Ask Question</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {sorts.map(s => (
          <Button key={s} variant={sort === s ? 'default' : 'outline'} size="sm" asChild>
            <Link href={`/questions?sort=${s}${tag ? `&tag=${tag}` : ''}${status !== 'all' ? `&status=${status}` : ''}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Link>
          </Button>
        ))}
        <div className="border-l border-border mx-1" />
        {statuses.map(s => (
          <Button key={s} variant={status === s ? 'secondary' : 'outline'} size="sm" asChild>
            <Link href={`/questions?sort=${sort}&status=${s}${tag ? `&tag=${tag}` : ''}`}>
              {s === 'all' ? 'All' : 'Unanswered'}
            </Link>
          </Button>
        ))}
      </div>

      {/* Question list */}
      <div className="space-y-3">
        {questions.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No questions found" description={tag ? `No questions tagged with "${tag}" yet.` : 'Be the first to ask a question!'} action={<Button asChild><Link href="/questions/ask">Ask a Question</Link></Button>} />
        ) : (
          questions.map(q => <QuestionCard key={q.id} question={q} />)
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {page > 1 && (
            <Button variant="outline" asChild><Link href={`/questions?sort=${sort}&status=${status}&page=${page - 1}${tag ? `&tag=${tag}` : ''}`}>Previous</Link></Button>
          )}
          <span className="flex items-center px-4 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Button variant="outline" asChild><Link href={`/questions?sort=${sort}&status=${status}&page=${page + 1}${tag ? `&tag=${tag}` : ''}`}>Next</Link></Button>
          )}
        </div>
      )}
    </div>
  )
}
