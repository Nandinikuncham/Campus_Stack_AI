import { createClient } from '@/lib/supabase/server'
import { QuestionCard } from '@/components/questions/QuestionCard'
import { TagBadge } from '@/components/questions/TagBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { Search as SearchIcon, MessageSquare, Tag as TagIcon, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import Link from 'next/link'

export const metadata = { title: 'Search' }
export const dynamic = 'force-dynamic'

interface SearchPageProps {
  searchParams: Promise<{ q?: string; tab?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const q = params.q?.trim() || ''
  const tab = params.tab || 'questions'

  const supabase = await createClient()

  let questions: any[] = []
  let tags: any[] = []
  let users: any[] = []

  if (q) {
    try {
      // 1. Search questions
      const { data: qData } = await supabase
        .from('questions')
        .select(`
          *,
          author:profiles!questions_author_id_fkey(*),
          tags:question_tags(tag:tags(*))
        `)
        .or(`title.ilike.%${q}%,body.ilike.%${q}%`)
        .neq('status', 'deleted')
        .limit(20)

      questions = (qData || []).map((item: any) => ({
        ...item,
        tags: item.tags?.map((t: any) => t.tag) || [],
      }))

      // 2. Search tags
      const { data: tData } = await supabase
        .from('tags')
        .select('*')
        .ilike('name', `%${q}%`)
        .limit(10)
      tags = tData || []

      // 3. Search users
      const { data: uData } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${q}%,full_name.ilike.%${q}%,college.ilike.%${q}%`)
        .limit(10)
      users = uData || []
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SearchIcon className="h-6 w-6 text-primary" />
          <span>Search Results</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {q ? (
            <>
              Showing results for <span className="font-semibold text-foreground">&quot;{q}&quot;</span>
            </>
          ) : (
            'Type a keyword into the search bar above to find questions, tags, or peers.'
          )}
        </p>
      </div>

      {q ? (
        <div className="space-y-6">
          {/* Questions Section */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> Questions ({questions.length})
              </span>
            </h2>
            {questions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No matching questions found for &quot;{q}&quot;.
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))}
              </div>
            )}
          </div>

          {/* Tags Section */}
          {tags.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-primary" /> Matching Tags ({tags.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} size="md" />
                ))}
              </div>
            </div>
          )}

          {/* Users Section */}
          {users.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Matching Students ({users.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {users.map((u) => (
                  <Link
                    key={u.id}
                    href={`/profile/${u.username}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={u.avatar_url || ''} />
                      <AvatarFallback>{getInitials(u.full_name || u.username)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-foreground">{u.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.college || 'Student'}</p>
                      <p className="text-xs text-primary font-medium mt-0.5">{u.reputation} rep</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={SearchIcon}
          title="Search the campus knowledge base"
          description="Find syllabus questions, algorithmic debugging notes, or connect with peers."
        />
      )}
    </div>
  )
}
