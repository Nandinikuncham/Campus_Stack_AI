'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface PopoverContextValue {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

export interface PopoverProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Popover({ open: controlledOpen, onOpenChange, children }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback(
    (value: React.SetStateAction<boolean>) => {
      const next = typeof value === 'function' ? value(open) : value
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, open, onOpenChange]
  )

  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, setOpen])

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block">
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

export interface PopoverTriggerProps {
  asChild?: boolean
  children: React.ReactNode
  className?: string
}

export function PopoverTrigger({ asChild, children, className }: PopoverTriggerProps) {
  const ctx = React.useContext(PopoverContext)
  if (!ctx) throw new Error('PopoverTrigger must be used within Popover')

  const handleClick = (e: React.MouseEvent) => {
    ctx.setOpen((prev) => !prev)
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e)
        handleClick(e)
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

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end'
}

export function PopoverContent({ align = 'center', className, children, ...props }: PopoverContentProps) {
  const ctx = React.useContext(PopoverContext)
  if (!ctx || !ctx.open) return null

  const alignClass =
    align === 'end'
      ? 'right-0'
      : align === 'start'
      ? 'left-0'
      : 'left-1/2 -translate-x-1/2'

  return (
    <div
      className={cn(
        'absolute z-50 mt-2 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95',
        alignClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
