'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 'data-tooltip-open': open } as any)
        }
        return child
      })}
    </div>
  )
}

export function TooltipTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  return <>{children}</>
}

export function TooltipContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { 'data-tooltip-open'?: boolean }) {
  const isOpen = (props as any)['data-tooltip-open']
  if (!isOpen) return null

  return (
    <div
      role="tooltip"
      className={cn(
        'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 shadow-md whitespace-nowrap',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
