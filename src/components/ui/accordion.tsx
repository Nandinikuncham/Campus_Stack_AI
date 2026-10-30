'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionContextValue {
  expanded: string[]
  toggle: (value: string) => void
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple'
  defaultValue?: string | string[]
}

export function Accordion({ type = 'single', defaultValue, className, children, ...props }: AccordionProps) {
  const [expanded, setExpanded] = React.useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : []
  )

  const toggle = (val: string) => {
    if (type === 'single') {
      setExpanded(prev => (prev.includes(val) ? [] : [val]))
    } else {
      setExpanded(prev => (prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]))
    }
  }

  return (
    <AccordionContext.Provider value={{ expanded, toggle }}>
      <div className={cn('divide-y divide-border', className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const ItemContext = React.createContext<{ value: string }>({ value: '' })

export function AccordionItem({ value, className, children, ...props }: AccordionItemProps) {
  return (
    <ItemContext.Provider value={{ value }}>
      <div className={cn('py-2', className)} {...props}>
        {children}
      </div>
    </ItemContext.Provider>
  )
}

export function AccordionTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const acc = React.useContext(AccordionContext)
  const item = React.useContext(ItemContext)
  const isOpen = acc?.expanded.includes(item.value)

  return (
    <button
      type="button"
      onClick={() => acc?.toggle(item.value)}
      className={cn(
        'flex flex-1 items-center justify-between py-2 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180 w-full text-left',
        className
      )}
      data-state={isOpen ? 'open' : 'closed'}
      {...props}
    >
      {children}
      <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')} />
    </button>
  )
}

export function AccordionContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const acc = React.useContext(AccordionContext)
  const item = React.useContext(ItemContext)
  const isOpen = acc?.expanded.includes(item.value)

  if (!isOpen) return null

  return (
    <div className={cn('pb-4 pt-0 text-sm animate-in fade-in-0', className)} {...props}>
      {children}
    </div>
  )
}
