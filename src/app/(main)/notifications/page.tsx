'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Notification } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Bell, Check, MessageSquare, Award, CheckCircle2, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNotifications() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setNotifications(data || [])
      setLoading(false)
    }
    loadNotifications()
  }, [])

  const markAllRead = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    toast.success('All marked as read')
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_answer':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'answer_accepted':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'comment_reply':
        return <MessageCircle className="h-4 w-4 text-purple-500" />
      case 'badge_awarded':
        return <Award className="h-4 w-4 text-amber-500" />
      default:
        return <Bell className="h-4 w-4 text-primary" />
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            <span>Notifications</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Updates on your questions, answers, badges, and campus discussions.
          </p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="h-4 w-4 mr-1.5" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="When other students answer your questions or accept your answers, you'll see alerts here."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`border-border transition-colors ${
                !n.is_read ? 'bg-primary/5 border-primary/20' : 'bg-card'
              }`}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-full bg-muted shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {n.link ? (
                        <Link href={n.link} className="hover:text-primary transition-colors">
                          {n.title}
                        </Link>
                      ) : (
                        n.title
                      )}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatRelativeTime(n.created_at)}
                    </span>
                  </div>
                  {n.body && <p className="text-xs text-muted-foreground mt-1">{n.body}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
