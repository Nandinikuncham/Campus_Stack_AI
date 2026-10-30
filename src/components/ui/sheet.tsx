'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SheetContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

export interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Sheet({ open: controlledOpen, onOpenChange, children }: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>
}

export interface SheetTriggerProps {
  asChild?: boolean
  children: React.ReactNode
  className?: string
}

export function SheetTrigger({ asChild, children, className }: SheetTriggerProps) {
  const ctx = React.useContext(SheetContext)
  if (!ctx) throw new Error('SheetTrigger must be used within Sheet')

  const handleClick = () => ctx.setOpen(true)

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e)
        handleClick()
      },
      className: cn(child.props.className, className),
    })
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  )
}

export interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function SheetContent({ side = 'right', className, children, ...props }: SheetContentProps) {
  const ctx = React.useContext(SheetContext)
  if (!ctx || !ctx.open) return null

  const sideClasses = {
    top: 'inset-x-0 top-0 border-b animate-in slide-in-from-top',
    bottom: 'inset-x-0 bottom-0 border-t animate-in slide-in-from-bottom',
    left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm animate-in slide-in-from-left',
    right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm animate-in slide-in-from-right',
  }[side]

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in-0"
        onClick={() => ctx.setOpen(false)}
      />
      {/* Panel */}
      <div
        className={cn(
          'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out',
          sideClasses,
          className
        )}
        {...props}
      >
        {children}
        <button
          type="button"
          onClick={() => ctx.setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
  )
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold text-foreground', className)} {...props} />
}
