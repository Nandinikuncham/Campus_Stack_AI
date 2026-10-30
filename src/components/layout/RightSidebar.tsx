import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TagBadge } from '@/components/questions/TagBadge'
import { Tag } from '@/lib/types'
import { TrendingUp, Users, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

async function getTrendingTags() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('question_count', { ascending: false })
      .limit(8)
    return (data as Tag[]) || []
  } catch {
    return []
  }
}

async function getTopUsers() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, reputation, college')
      .order('reputation', { ascending: false })
      .limit(5)
    return data || []
  } catch {
    return []
  }
}

async function getStats() {
  try {
    const supabase = await createClient()
    const [{ count: qCount }, { count: aCount }, { count: uCount }] = await Promise.all([
      supabase.from('questions').select('*', { count: 'exact', head: true }).neq('status', 'deleted'),
      supabase.from('answers').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ])
    return { questions: qCount || 0, answers: aCount || 0, users: uCount || 0 }
  } catch {
    return { questions: 0, answers: 0, users: 0 }
  }
}

export async function RightSidebar() {
  const [tags, users, stats] = await Promise.all([getTrendingTags(), getTopUsers(), getStats()])

  return (
    <aside className="space-y-4">
      {/* Stats */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><HelpCircle className="h-4 w-4 text-primary" />Community Stats</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { label: 'Questions', value: stats.questions },
            { label: 'Answers', value: stats.answers },
            { label: 'Students', value: stats.users },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{value.toLocaleString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Trending Tags */}
      {tags.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Trending Tags</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => <TagBadge key={tag.id} tag={tag} />)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Users */}
      {users.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" />Top Contributors</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {users.map((user: any, i) => (
              <Link key={user.id} href={`/profile/${user.username}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar_url || ''} />
                  <AvatarFallback className="text-[10px]">{getInitials(user.full_name || user.username)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{user.username}</p>
                  <p className="text-[10px] text-muted-foreground">{user.reputation} rep</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </aside>
  )
}
