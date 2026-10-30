'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CodeBlockProps {
  language?: string
  value: string
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-4 rounded-lg border border-border bg-muted/70 text-foreground overflow-hidden">
      <div className="flex items-center justify-between px-4 py-1.5 bg-muted/90 border-b border-border text-xs text-muted-foreground font-mono">
        <span>{language || 'code'}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1 text-green-500" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" /> Copy
            </>
          )}
        </Button>
      </div>
      <pre className="p-4 text-sm font-mono overflow-x-auto leading-relaxed">
        <code>{value}</code>
      </pre>
    </div>
  )
}
