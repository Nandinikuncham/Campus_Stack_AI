'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface VoteButtonsProps {
  targetId: string
  targetType: 'question' | 'answer'
  initialCount: number
  initialVote: number | null
  authorId: string
  vertical?: boolean
}

export function VoteButtons({
  targetId, targetType, initialCount, initialVote, authorId, vertical = true
}: VoteButtonsProps) {
  const [count, setCount] = useState(initialCount)
  const [userVote, setUserVote] = useState<number | null>(initialVote)
  const [loading, setLoading] = useState(false)

  const handleVote = async (value: 1 | -1) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Please log in to vote'); return }
    if (user.id === authorId) { toast.error('You cannot vote on your own content'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, targetType, value }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to vote'); return }

      if (userVote === value) {
        setCount(c => c - value)
        setUserVote(null)
      } else if (userVote === null) {
        setCount(c => c + value)
        setUserVote(value)
      } else {
        setCount(c => c - userVote + value)
        setUserVote(value)
      }
    } catch {
      toast.error('Failed to vote')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex items-center gap-1', vertical ? 'flex-col' : 'flex-row')}>
      <Button
        variant="ghost"
        size="icon"
        disabled={loading}
        onClick={() => handleVote(1)}
        className={cn('h-8 w-8', userVote === 1 && 'text-primary bg-primary/10')}
        aria-label="Upvote"
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
      <span className={cn('font-semibold text-sm min-w-[2rem] text-center', count > 0 && 'text-primary', count < 0 && 'text-destructive')}>
        {formatNumber(count)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        disabled={loading}
        onClick={() => handleVote(-1)}
        className={cn('h-8 w-8', userVote === -1 && 'text-destructive bg-destructive/10')}
        aria-label="Downvote"
      >
        <ChevronDown className="h-5 w-5" />
      </Button>
    </div>
  )
}
