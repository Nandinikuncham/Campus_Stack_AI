'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

export function BookmarkButton({ questionId, initialBookmarked }: { questionId: string; initialBookmarked: boolean }) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please log in to bookmark')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to update bookmark')
        return
      }

      setBookmarked(data.bookmarked)
      toast.success(data.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks')
    } catch {
      toast.error('Failed to toggle bookmark')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={loading}
      onClick={handleToggle}
      className={cn('h-8 w-8', bookmarked && 'text-primary bg-primary/10')}
      title={bookmarked ? 'Remove bookmark' : 'Bookmark question'}
    >
      <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current')} />
    </Button>
  )
}
