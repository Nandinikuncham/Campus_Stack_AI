'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, MessageSquare, PlusCircle, Bot, Tag,
  Trophy, Bell, Shield, LogOut, BookOpen
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Profile } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/questions', label: 'Questions', icon: MessageSquare },
  { href: '/questions/ask', label: 'Ask Question', icon: PlusCircle },
  { href: '/ai-assistant', label: 'AI Assistant', icon: Bot },
  { href: '/tags', label: 'Tags', icon: Tag },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/notifications', label: 'Notifications', icon: Bell },
]

interface SidebarProps {
  profile: Profile | null
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Logged out')
    router.push('/landing')
    router.refresh()
  }

  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'

  return (
    <aside className="flex flex-col h-full border-r border-border bg-card">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="text-primary">CampusStack</span><span className="text-muted-foreground">AI</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}

        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Shield className="h-4 w-4 shrink-0" />
            Moderation
          </Link>
        )}
      </nav>

      {/* User */}
      {profile && (
        <div className="p-3 border-t border-border space-y-2">
          <Link href={`/profile/${profile.username}`} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors">
            <Avatar className="h-7 w-7">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="text-xs">{getInitials(profile.full_name || profile.username)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile.username}</p>
              <p className="text-xs text-muted-foreground">{profile.reputation} rep</p>
            </div>
          </Link>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Log out
          </Button>
        </div>
      )}
    </aside>
  )
}
