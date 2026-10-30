import Link from 'next/link'
import { Question } from '@/lib/types'
import { TagBadge } from './TagBadge'
import { formatRelativeTime, truncateText, getInitials, formatNumber, stripMarkdown } from '@/lib/utils'
import { MessageSquare, Eye, ChevronUp, CheckCircle2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function QuestionCard({ question }: { question: Question }) {
  const isAnswered = (question.answer_count || 0) > 0
  const hasAccepted = !!question.accepted_answer_id

  return (
    <div className="border border-border rounded-lg p-4 bg-card hover:border-primary/40 transition-colors">
      <div className="flex gap-4">
        {/* Stats column */}
        <div className="hidden sm:flex flex-col items-end gap-2 min-w-[72px] text-sm text-muted-foreground">
          <div className={cn('flex items-center gap-1', question.vote_count > 0 && 'text-primary font-medium')}>
            <ChevronUp className="h-3.5 w-3.5" />
            <span>{formatNumber(question.vote_count)}</span>
          </div>
          <div className={cn(
            'flex items-center gap-1 px-2 py-0.5 rounded text-xs',
            hasAccepted ? 'bg-green-500/10 text-green-600 dark:text-green-400 font-medium' :
            isAnswered ? 'bg-muted' : ''
          )}>
            {hasAccepted && <CheckCircle2 className="h-3 w-3" />}
            <span>{question.answer_count} ans</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span>{formatNumber(question.view_count)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link href={`/questions/${question.id}`} className="block group">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
              {question.title}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {truncateText(stripMarkdown(question.body), 150)}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1 flex-1">
              {question.tags?.slice(0, 4).map(tag => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
            </div>

            {/* Mobile stats */}
            <div className="flex sm:hidden items-center gap-3 text-xs text-muted-foreground">
              <span>{formatNumber(question.vote_count)} votes</span>
              <span className={hasAccepted ? 'text-green-600' : ''}>{question.answer_count} ans</span>
            </div>

            {/* Author */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Avatar className="h-5 w-5">
                <AvatarImage src={question.author?.avatar_url || ''} />
                <AvatarFallback className="text-[10px]">{getInitials(question.author?.full_name || question.author?.username)}</AvatarFallback>
              </Avatar>
              <Link href={`/profile/${question.author?.username}`} className="hover:text-primary font-medium">
                {question.author?.username}
              </Link>
              {question.author?.college && <span>· {question.author.college}</span>}
              <span>· {formatRelativeTime(question.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
