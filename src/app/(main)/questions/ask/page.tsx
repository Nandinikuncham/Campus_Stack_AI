'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TagBadge } from '@/components/questions/TagBadge'
import { POPULAR_TAGS } from '@/lib/constants'
import { Sparkles, HelpCircle, ArrowRight, X, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AskQuestionPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<{ title: string; body: string; suggestions?: string[] } | null>(null)
  const router = useRouter()

  const handleAddTag = (tagToAdd: string) => {
    const cleaned = tagToAdd.trim().replace(/[^a-zA-Z0-9.+-_]/g, '')
    if (!cleaned) return
    if (tags.length >= 5) {
      toast.error('Maximum 5 tags allowed')
      return
    }
    if (!tags.includes(cleaned)) {
      setTags([...tags, cleaned])
    }
    setTagInput('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleImproveWithAI = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Please enter a title and question body first')
      return
    }

    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/improve-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to improve question')

      setAiSuggestion({
        title: data.improvedTitle || title,
        body: data.improvedBody || body,
        suggestions: data.suggestions || [],
      })
      toast.success('AI suggestions generated!')
    } catch (err: any) {
      toast.error(err.message || 'AI improvement failed')
    } finally {
      setAiLoading(false)
    }
  }

  const applyAISuggestions = () => {
    if (!aiSuggestion) return
    setTitle(aiSuggestion.title)
    setBody(aiSuggestion.body)
    setAiSuggestion(null)
    toast.success('Applied AI improvements!')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || title.length < 10) {
      toast.error('Title must be at least 10 characters')
      return
    }
    if (!body.trim() || body.length < 30) {
      toast.error('Please describe your problem in more detail (at least 30 characters)')
      return
    }
    if (tags.length === 0) {
      toast.error('Please add at least one tag')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          tags,
          isAiImproved: false,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to post question')
        return
      }

      toast.success('Question published!')
      router.push(`/questions/${data.question.id}`)
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Ask a Public Question</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Be specific and imagine you are asking a question to another fellow student or professor.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Question Title</CardTitle>
            <CardDescription className="text-xs">
              Be specific and imagine you are summarizing the exact hurdle in one sentence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to resolve segmentation fault in recursive merge sort in C++?"
              maxLength={150}
              className="text-sm"
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{title.length >= 10 ? '✓ Minimum length met' : 'At least 10 characters'}</span>
              <span>{title.length}/150</span>
            </div>
          </CardContent>
        </Card>

        {/* Body Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Details & Code Context</CardTitle>
                <CardDescription className="text-xs">
                  Explain what you expected, what actually happened, and include code snippets with Markdown.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleImproveWithAI}
                disabled={aiLoading || !title || !body}
                className="text-xs text-primary border-primary/30 hover:bg-primary/5"
              >
                {aiLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                )}
                {aiLoading ? 'Improving...' : 'Improve with AI'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe what you tried, the exact error messages or unexpected test cases, and paste any relevant code..."
              rows={12}
              className="font-mono text-sm leading-relaxed"
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{body.length >= 30 ? '✓ Detailed enough' : 'At least 30 characters'}</span>
              <span>{body.length} characters</span>
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestion Box */}
        {aiSuggestion && (
          <Card className="border-primary/40 bg-primary/5 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" /> AI Recommendations
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setAiSuggestion(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {aiSuggestion.suggestions && (
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  {aiSuggestion.suggestions.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              )}
              <div className="pt-2 flex justify-end">
                <Button type="button" size="sm" onClick={applyAISuggestions}>
                  Apply Suggested Edits
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tags Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tags</CardTitle>
            <CardDescription className="text-xs">
              Add up to 5 tags to describe what technologies or subjects your question is about.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-md border border-input bg-background">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    handleAddTag(tagInput)
                  }
                }}
                placeholder={tags.length === 0 ? 'Type tag and press Enter...' : ''}
                className="flex-1 bg-transparent border-0 outline-none text-xs min-w-[120px]"
                disabled={tags.length >= 5 || loading}
              />
            </div>

            {/* Quick popular tags */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-muted-foreground">Popular tags:</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TAGS.slice(0, 10).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleAddTag(t)}
                    disabled={tags.includes(t) || tags.length >= 5}
                    className="text-[11px] px-2 py-0.5 rounded border border-border bg-muted/40 hover:bg-muted text-muted-foreground disabled:opacity-40"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit button */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Publishing...' : 'Post Your Question'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  )
}
