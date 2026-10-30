import Link from 'next/link'
import { Tag } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TagBadgeProps {
  tag: Tag | string
  size?: 'sm' | 'md'
  clickable?: boolean
}

export function TagBadge({ tag, size = 'sm', clickable = true }: TagBadgeProps) {
  const name = typeof tag === 'string' ? tag : tag.name
  const classes = cn(
    'inline-flex items-center rounded-md font-medium transition-colors',
    'bg-primary/10 text-primary hover:bg-primary/20',
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
  )

  if (!clickable) return <span className={classes}>{name}</span>

  return (
    <Link href={`/questions?tag=${encodeURIComponent(name)}`} className={classes}>
      {name}
    </Link>
  )
}
