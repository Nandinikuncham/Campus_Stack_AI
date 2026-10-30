'use client'

import { useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Answer } from '@/lib/types'
import { VoteButtons } from './VoteButtons'
import { CommentSection } from './CommentSection'
import { ReportDialog } from '@/components/moderation/ReportDialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, CheckCircle2, Bot, Sparkles } from 'lucide-react'
import { formatRelativeTime, getInitials, cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface AnswerCardProps {
  answer: Answer
  questionAuthorId: string
  currentUserId?: string
  isAcceptedAnswer?: boolean
}

export function AnswerCard({
  answer,
  questionAuthorId,
  currentUserId,
  isAcceptedAnswer: initialIsAccepted,
}: AnswerCardProps) {
  const [isAccepted, setIsAccepted] = useState(initialIsAccepted || answer.is_accepted)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isQuestionAuthor = currentUserId === questionAuthorId

  const handleAcceptAnswer = async () => {
    if (!isQuestionAuthor) return
    setLoading(true)

    try {
      const res = await fetch(`/api/answers/${answer.id}/accept`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to update accepted status')
        return
      }

      setIsAccepted(!isAccepted)
      toast.success(isAccepted ? 'Answer unaccepted' : 'Answer marked as accepted!')
      router.refresh()
    } catch {
      toast.error('Failed to accept answer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-5 transition-colors bg-card',
        isAccepted ? 'border-green-500/50 bg-green-500/[0.02]' : 'border-border'
      )}
    >
      <div className="flex gap-4">
        {/* Left column: votes + accept indicator */}
        <div className="flex flex-col items-center gap-3">
          <VoteButtons
            targetId={answer.id}
            targetType="answer"
            initialCount={answer.vote_count}
            initialVote={answer.user_vote ?? null}
            authorId={answer.author_id}
          />

          {/* Accept answer button / icon */}
          {isQuestionAuthor ? (
            <Button
              variant="ghost"
              size="icon"
              disabled={loading}
              onClick={handleAcceptAnswer}
              className={cn(
                'h-9 w-9 rounded-full transition-all',
                isAccepted
                  ? 'text-green-600 bg-green-500/10 hover:bg-green-500/20'
                  : 'text-muted-foreground hover:text-green-600 hover:bg-green-500/10'
              )}
              title={isAccepted ? 'Click to unaccept' : 'Click to accept this answer'}
            >
              <Check className="h-5 w-5 stroke-[2.5]" />
            </Button>
          ) : isAccepted ? (
            <div className="text-green-600 p-1.5 rounded-full bg-green-500/10" title="Accepted by question author">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          ) : null}
        </div>

        {/* Right column: content */}
        <div className="flex-1 min-w-0">
          {answer.is_ai_generated && (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Bot className="h-3.5 w-3.5" />
              <span>AI Assisted Answer</span>
            </div>
          )}

          <div className="prose-campus text-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer.body}</ReactMarkdown>
          </div>

          {/* Answer footer */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ReportDialog answerId={answer.id} />
            </div>

            <div className="flex items-center gap-2 bg-muted/40 px-3 py-2 rounded-lg">
              <Avatar className="h-6 w-6">
                <AvatarImage src={answer.author?.avatar_url || ''} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(answer.author?.full_name || answer.author?.username)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/profile/${answer.author?.username}`}
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {answer.author?.username || 'Anonymous'}
                  </Link>
                  <span className="font-semibold text-primary">({answer.author?.reputation ?? 0})</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  answered {formatRelativeTime(answer.created_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          <CommentSection
            answerId={answer.id}
            initialComments={answer.comments || []}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  )
}
