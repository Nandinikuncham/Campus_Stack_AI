'use client'
import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { createClient } from '@/lib/supabase/client'
import { Notification } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchNotifications = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)
      setNotifications(data || [])
      setUnreadCount((data || []).filter((n: Notification) => !n.is_read).length)
    }
    fetchNotifications()
  }, [userId])

  const markAllRead = async () => {
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="divide-y divide-border max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No notifications yet</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`px-4 py-3 text-sm ${!n.is_read ? 'bg-primary/5' : ''}`}>
                <p className="font-medium">{n.title}</p>
                {n.body && <p className="text-muted-foreground text-xs mt-0.5">{n.body}</p>}
                <p className="text-muted-foreground text-xs mt-1">{formatRelativeTime(n.created_at)}</p>
              </div>
            ))
          )}
        </div>
        <div className="px-4 py-2 border-t border-border">
          <Link href="/notifications" className="text-xs text-primary hover:underline">View all notifications</Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
