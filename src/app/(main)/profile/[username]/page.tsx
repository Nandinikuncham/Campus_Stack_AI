import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Profile, Question, Answer } from '@/lib/types'
import { QuestionCard } from '@/components/questions/QuestionCard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getInitials, formatDate } from '@/lib/utils'
import { GraduationCap, Award, Calendar, Edit, MessageSquare, CheckCircle, Shield } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params
  return { title: `@${username}'s Profile` }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch profile
  const { data: profileData, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .single()

  if (error || !profileData) {
    notFound()
  }

  const profile: Profile = profileData
  const isOwnProfile = user?.id === profile.id

  // Fetch questions by user
  const { data: questionsData } = await supabase
    .from('questions')
    .select(`
      *,
      author:profiles!questions_author_id_fkey(*),
      tags:question_tags(tag:tags(*))
    `)
    .eq('author_id', profile.id)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })

  const questions = (questionsData || []).map((q: any) => ({
    ...q,
    tags: q.tags?.map((t: any) => t.tag) || [],
  }))

  // Fetch answers by user with question title
  const { data: answersData } = await supabase
    .from('answers')
    .select(`
      *,
      question:questions(id, title)
    `)
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false })

  // Fetch badges
  const { data: badgesData } = await supabase
    .from('user_badges')
    .select('*, badge:badges(*)')
    .eq('user_id', profile.id)

  const badges = badgesData || []

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary/20">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="text-xl">
                  {getInitials(profile.full_name || profile.username)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
                  {profile.role !== 'student' && (
                    <Badge variant="secondary" className="capitalize text-xs">
                      <Shield className="h-3 w-3 mr-1 text-primary" /> {profile.role}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-mono">@{profile.username}</p>
                {profile.college && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>{profile.college} {profile.department && `• ${profile.department}`} {profile.graduation_year && `'${profile.graduation_year.toString().slice(-2)}`}</span>
                  </p>
                )}
              </div>
            </div>

            {isOwnProfile && (
              <Button asChild variant="outline" size="sm">
                <Link href="/profile/edit">
                  <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit Profile
                </Link>
              </Button>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-4 text-sm text-foreground/90 border-t border-border/50 pt-3">
              {profile.bio}
            </p>
          )}

          {/* Stats Bar */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/50 text-center">
            <div className="p-2 rounded-lg bg-muted/40">
              <p className="text-xl font-bold text-primary">{profile.reputation}</p>
              <p className="text-xs text-muted-foreground">Reputation</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/40">
              <p className="text-xl font-bold">{questions.length}</p>
              <p className="text-xs text-muted-foreground">Questions Asked</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/40">
              <p className="text-xl font-bold">{answersData?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Answers Provided</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/40">
              <p className="text-xl font-bold">{badges.length}</p>
              <p className="text-xs text-muted-foreground">Badges Earned</p>
            </div>
          </div>

          {/* Skills tags */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badges Section */}
      {badges.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" /> Badges ({badges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {badges.map((b: any) => (
                <div
                  key={b.id}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card"
                >
                  <Award className="h-4 w-4 text-amber-500" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{b.badge?.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{b.badge?.tier} tier</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Tabs */}
      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
          <TabsTrigger value="answers">Answers ({answersData?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-3 mt-4">
          {questions.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No questions asked yet.
            </div>
          ) : (
            questions.map((q) => <QuestionCard key={q.id} question={q} />)
          )}
        </TabsContent>

        <TabsContent value="answers" className="space-y-3 mt-4">
          {!answersData || answersData.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No answers posted yet.
            </div>
          ) : (
            answersData.map((a: any) => (
              <div
                key={a.id}
                className="border border-border rounded-lg p-4 bg-card hover:border-primary/40 transition-colors"
              >
                <Link
                  href={`/questions/${a.question_id}`}
                  className="text-base font-semibold hover:text-primary transition-colors mb-1 block"
                >
                  {a.question?.title || 'View Question'}
                </Link>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {a.body}
                </p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-primary">{a.vote_count} votes</span>
                  {a.is_accepted && (
                    <span className="text-green-600 flex items-center gap-1 font-medium">
                      <CheckCircle className="h-3 w-3" /> Accepted Answer
                    </span>
                  )}
                  <span>Answered {formatDate(a.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
