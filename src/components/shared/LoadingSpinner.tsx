import { cn } from '@/lib/utils'

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-5/6" />
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-muted rounded" />
        <div className="h-5 w-16 bg-muted rounded" />
      </div>
    </div>
  )
}
