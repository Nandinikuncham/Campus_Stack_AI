import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils'
import { Trophy, Medal, Award, GraduationCap } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Leaderboard' }
export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const supabase = await createClient()

  let profiles: Profile[] = []
  try {
    const { data: topProfiles } = await supabase
      .from('profiles')
      .select('*')
      .order('reputation', { ascending: false })
      .limit(50)
    profiles = topProfiles || []
  } catch {}

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-amber-400 shrink-0" />
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-400 shrink-0" />
    if (rank === 3) return <Award className="h-5 w-5 text-amber-700 shrink-0" />
    return <span className="font-mono text-sm font-semibold text-muted-foreground w-5 text-center">{rank}</span>
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          <span>Campus Leaderboard</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Top student contributors answering doubts, sharing verified solutions, and mentoring peers.
        </p>
      </div>

      <div className="space-y-2">
        {profiles.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No contributor activity recorded yet.
          </div>
        ) : (
          profiles.map((p, index) => {
            const rank = index + 1
            return (
              <Card
                key={p.id}
                className={`border-border hover:border-primary/40 transition-colors ${
                  rank <= 3 ? 'bg-primary/[0.02]' : 'bg-card'
                }`}
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-8">
                      {getRankBadge(rank)}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={p.avatar_url || ''} />
                      <AvatarFallback>{getInitials(p.full_name || p.username)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <Link
                        href={`/profile/${p.username}`}
                        className="font-semibold text-sm hover:text-primary transition-colors truncate block"
                      >
                        {p.full_name || p.username}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <span>@{p.username}</span>
                        {p.college && (
                          <>
                            <span>•</span>
                            <span className="truncate">{p.college}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-bold text-primary">
                      {p.reputation.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">rep</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] mt-0.5 capitalize">
                      {p.role}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
