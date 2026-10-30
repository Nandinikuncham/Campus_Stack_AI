'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import toast from 'react-hot-toast'
import { Send, Eye, Edit3, Sparkles } from 'lucide-react'

interface AnswerEditorProps {
  questionId: string
  onAnswerSubmitted?: () => void
}

export function AnswerEditor({ questionId, onAnswerSubmitted }: AnswerEditorProps) {
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const router = useRouter()

  const handleSubmit = async () => {
    if (!body.trim()) {
      toast.error('Please enter your answer')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, body }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to submit answer')
        return
      }

      toast.success('Answer posted successfully!')
      setBody('')
      setTab('write')
      if (onAnswerSubmitted) {
        onAnswerSubmitted()
      } else {
        router.refresh()
      }
    } catch {
      toast.error('An error occurred while posting your answer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-8 border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Your Answer</span>
          <span className="text-xs font-normal text-muted-foreground">Markdown supported</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={tab} onValueChange={(val) => setTab(val as 'write' | 'preview')}>
          <div className="flex items-center justify-between mb-2">
            <TabsList className="h-8">
              <TabsTrigger value="write" className="text-xs h-7">
                <Edit3 className="h-3 w-3 mr-1" /> Write
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs h-7">
                <Eye className="h-3 w-3 mr-1" /> Preview
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="write" className="m-0">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Provide a comprehensive and constructive answer. Explain your reasoning and code snippets clearly..."
              rows={8}
              className="font-mono text-sm resize-y"
            />
          </TabsContent>

          <TabsContent value="preview" className="m-0">
            <div className="min-h-[200px] rounded-md border border-input p-4 bg-muted/20 prose-campus">
              {body.trim() ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
              ) : (
                <p className="text-muted-foreground text-sm italic">Nothing to preview yet.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Remember to be respectful and follow our student community guidelines.
          </p>
          <Button onClick={handleSubmit} disabled={loading || !body.trim()}>
            <Send className="h-4 w-4 mr-1.5" />
            {loading ? 'Posting...' : 'Post Your Answer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
