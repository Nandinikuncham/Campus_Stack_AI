import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Question, Answer, Tag } from '@/lib/types'
import { VoteButtons } from '@/components/questions/VoteButtons'
import { TagBadge } from '@/components/questions/TagBadge'
import { AnswerCard } from '@/components/questions/AnswerCard'
import { AnswerEditor } from '@/components/questions/AnswerEditor'
import { CommentSection } from '@/components/questions/CommentSection'
import { AIAssistantPanel } from '@/components/ai/AIAssistantPanel'
import { ReportDialog } from '@/components/moderation/ReportDialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { BookmarkButton } from './BookmarkButton'
import { formatRelativeTime, formatDate, getInitials } from '@/lib/utils'
import { Eye, Clock, MessageSquare, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: q } = await supabase.from('questions').select('title').eq('id', id).single()
  return {
    title: q ? `${q.title}` : 'Question Details',
  }
}

export default async function QuestionDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch question
  const { data: questionData, error } = await supabase
    .from('questions')
    .select(`
      *,
      author:profiles!questions_author_id_fkey(*),
      tags:question_tags(tag:tags(*))
    `)
    .eq('id', id)
    .single()

  if (error || !questionData || questionData.status === 'deleted') {
    notFound()
  }

  // Increment view count asynchronously
  try {
    await supabase.rpc('increment_view_count', { q_id: id })
  } catch {
    await supabase
      .from('questions')
      .update({ view_count: (questionData.view_count || 0) + 1 })
      .eq('id', id)
  }

  // 2. Fetch answers with author and comments
  const { data: answersData } = await supabase
    .from('answers')
    .select(`
      *,
      author:profiles!answers_author_id_fkey(*),
      comments(*, author:profiles!comments_author_id_fkey(*))
    `)
    .eq('question_id', id)
    .order('is_accepted', { ascending: false })
    .order('vote_count', { ascending: false })

  // 3. Fetch question comments
  const { data: questionComments } = await supabase
    .from('comments')
    .select('*, author:profiles!comments_author_id_fkey(*)')
    .eq('question_id', id)
    .is('answer_id', null)
    .order('created_at', { ascending: true })

  // 4. Check user vote on question
  let userVote: number | null = null
  let isBookmarked = false

  if (user) {
    const { data: vote } = await supabase
      .from('votes')
      .select('value')
      .eq('user_id', user.id)
      .eq('question_id', id)
      .single()
    if (vote) userVote = vote.value

    const { data: bookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('question_id', id)
      .single()
    if (bookmark) isBookmarked = true
  }

  const tags: Tag[] = questionData.tags?.map((t: any) => t.tag) || []
  const answers: Answer[] = answersData || []

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-snug">
          {questionData.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Asked {formatRelativeTime(questionData.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span>{questionData.view_count} views</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{answers.length} answers</span>
          </div>
          {questionData.is_ai_improved && (
            <span className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">
              <Sparkles className="h-3 w-3" /> AI Improved
            </span>
          )}
        </div>
      </div>

      {/* Main Question Section */}
      <div className="flex gap-4 sm:gap-6">
        {/* Left Voting Column */}
        <div className="flex flex-col items-center gap-2">
          <VoteButtons
            targetId={questionData.id}
            targetType="question"
            initialCount={questionData.vote_count}
            initialVote={userVote}
            authorId={questionData.author_id}
          />
          <BookmarkButton questionId={questionData.id} initialBookmarked={isBookmarked} />
        </div>

        {/* Question Body */}
        <div className="flex-1 min-w-0">
          <div className="prose-campus text-foreground max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{questionData.body}</ReactMarkdown>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-6">
            {tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} size="md" />
            ))}
          </div>

          {/* Question Footer: Author and Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/60 text-xs">
            <div className="flex items-center gap-2">
              <ReportDialog questionId={questionData.id} />
            </div>

            <div className="flex items-center gap-2.5 bg-muted/30 px-3.5 py-2.5 rounded-lg border border-border/50">
              <Avatar className="h-7 w-7">
                <AvatarImage src={questionData.author?.avatar_url || ''} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(questionData.author?.full_name || questionData.author?.username)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/profile/${questionData.author?.username}`}
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {questionData.author?.username}
                  </Link>
                  <span className="font-semibold text-primary">
                    ({questionData.author?.reputation ?? 0})
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {questionData.author?.college || 'Student'}
                </div>
              </div>
            </div>
          </div>

          {/* Question Comments */}
          <CommentSection
            questionId={questionData.id}
            initialComments={questionComments || []}
            currentUserId={user?.id}
          />
        </div>
      </div>

      {/* Answers Section */}
      <div className="pt-8 border-t border-border space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>{answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}</span>
        </h2>

        <div className="space-y-4">
          {answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              questionAuthorId={questionData.author_id}
              currentUserId={user?.id}
              isAcceptedAnswer={answer.id === questionData.accepted_answer_id}
            />
          ))}
        </div>
      </div>

      {/* Answer Editor */}
      <AnswerEditor questionId={questionData.id} />

      {/* AI Assistant for this question */}
      <div className="pt-8">
        <AIAssistantPanel
          questionTitle={questionData.title}
          questionBody={questionData.body}
          contextType="question"
        />
      </div>
    </div>
  )
}
