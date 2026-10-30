'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Menu } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'
import { Profile } from '@/lib/types'

export function TopBar({ profile }: { profile: Profile | null }) {
  const [search, setSearch] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/95 backdrop-blur flex items-center px-4 gap-3">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar profile={profile} />
        </SheetContent>
      </Sheet>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="pl-9 h-9 bg-muted border-transparent focus:border-primary"
            autoComplete="off"
            suppressHydrationWarning
          />
        </div>
      </form>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        {profile && <NotificationBell userId={profile.id} />}
      </div>
    </header>
  )
}
