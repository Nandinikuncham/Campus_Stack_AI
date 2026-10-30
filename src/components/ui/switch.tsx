'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function Switch({ checked, defaultChecked, onCheckedChange, className, disabled, ...props }: SwitchProps) {
  const [internal, setInternal] = React.useState(defaultChecked ?? false)
  const isChecked = checked !== undefined ? checked : internal

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    const next = e.target.checked
    if (checked === undefined) setInternal(next)
    onCheckedChange?.(next)
  }

  return (
    <label
      className={cn(
        'inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isChecked ? 'bg-primary' : 'bg-input',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        {...props}
      />
      <span
        className={cn(
          'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform',
          isChecked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </label>
  )
}
