'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Comment } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ReportDialog } from '@/components/moderation/ReportDialog'
import { MessageSquare, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

interface CommentSectionProps {
  questionId?: string
  answerId?: string
  initialComments?: Comment[]
  currentUserId?: string
}

export function CommentSection({
  questionId,
  answerId,
  initialComments = [],
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [showInput, setShowInput] = useState(false)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please log in to leave a comment')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: body.trim(),
          questionId,
          answerId,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to post comment')
        return
      }

      setComments(prev => [...prev, data.comment])
      setBody('')
      setShowInput(false)
      toast.success('Comment added')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 pt-3 border-t border-border/60 text-xs">
      <div className="space-y-2">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="group flex items-start justify-between gap-2 py-1 border-b border-border/30 last:border-b-0"
          >
            <div className="text-muted-foreground flex-1">
              <span className="text-foreground">{comment.body}</span>
              {' – '}
              <Link
                href={`/profile/${comment.author?.username}`}
                className="text-primary hover:underline font-medium"
              >
                {comment.author?.username || 'User'}
              </Link>
              <span className="ml-1 text-[11px] opacity-75">
                {formatRelativeTime(comment.created_at)}
              </span>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ReportDialog commentId={comment.id} />
            </div>
          </div>
        ))}
      </div>

      {showInput ? (
        <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
          <Input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a comment... (use comments for clarification or minor feedback)"
            className="h-8 text-xs bg-muted/50"
            disabled={loading}
          />
          <Button type="submit" size="sm" className="h-8 px-3 text-xs" disabled={loading || !body.trim()}>
            <Send className="h-3 w-3 mr-1" /> Post
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => {
              setShowInput(false)
              setBody('')
            }}
          >
            Cancel
          </Button>
        </form>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground hover:text-foreground mt-1 px-1.5"
          onClick={() => setShowInput(true)}
        >
          <MessageSquare className="h-3 w-3 mr-1" /> Add a comment
        </Button>
      )}
    </div>
  )
}
