import { createClient } from '@/lib/supabase/server'
import { TagBadge } from '@/components/questions/TagBadge'
import { Tag } from '@/lib/types'
import { Tag as TagIcon, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'

export const metadata = { title: 'Tags' }
export const dynamic = 'force-dynamic'

interface TagsPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function TagsPage({ searchParams }: TagsPageProps) {
  const params = await searchParams
  const q = params.q?.trim().toLowerCase() || ''

  const supabase = await createClient()

  let query = supabase.from('tags').select('*').order('question_count', { ascending: false })
  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  let tags: Tag[] = []
  try {
    const { data } = await query
    tags = data || []
  } catch {}

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TagIcon className="h-6 w-6 text-primary" />
          <span>Browse Tags</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          A tag is a keyword or label that categorizes your question with other, similar questions.
        </p>
      </div>

      {/* Grid of tags */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No tags found matching &quot;{q}&quot;.
          </div>
        ) : (
          tags.map((tag) => (
            <Card key={tag.id} className="border-border hover:border-primary/40 transition-colors">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <TagBadge tag={tag} size="md" />
                  <span className="text-xs text-muted-foreground font-mono">
                    {tag.question_count} {tag.question_count === 1 ? 'question' : 'questions'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {tag.description || `All discussions and student solutions tagged with #${tag.name.toLowerCase()}.`}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
