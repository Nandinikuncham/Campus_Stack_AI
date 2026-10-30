'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Bot, Sparkles, BookOpen, Lightbulb, Code2, ListFilter, AlertCircle, RefreshCw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import toast from 'react-hot-toast'

interface AIAssistantPanelProps {
  questionTitle?: string
  questionBody?: string
  contextType?: 'question' | 'standalone'
}

export function AIAssistantPanel({ questionTitle = '', questionBody = '', contextType = 'standalone' }: AIAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<'explain' | 'summarize' | 'hints' | 'code'>('explain')
  const [topic, setTopic] = useState(questionTitle)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleExplain = async () => {
    if (!topic.trim()) {
      toast.error('Please provide a topic or question to explain')
      return
    }
    setLoading(true)
    setOutput('')
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, context: questionBody }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate explanation')
      setOutput(data.explanation)
    } catch (err: any) {
      toast.error(err.message || 'Error communicating with AI')
    } finally {
      setLoading(false)
    }
  }

  const handleSummarize = async () => {
    setLoading(true)
    setOutput('')
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: `${questionTitle}\n\n${questionBody}` }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to summarize')
      setOutput(data.summary)
    } catch (err: any) {
      toast.error(err.message || 'Error communicating with AI')
    } finally {
      setLoading(false)
    }
  }

  const handleHints = async () => {
    setLoading(true)
    setOutput('')
    try {
      const res = await fetch('/api/ai/hints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: `${questionTitle}\n\n${questionBody}` }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate hints')
      setOutput(data.hints)
    } catch (err: any) {
      toast.error(err.message || 'Error communicating with AI')
    } finally {
      setLoading(false)
    }
  }

  const handleExplainCode = async () => {
    if (!code.trim()) {
      toast.error('Please paste code to explain')
      return
    }
    setLoading(true)
    setOutput('')
    try {
      const res = await fetch('/api/ai/explain-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to explain code')
      setOutput(data.explanation)
    } catch (err: any) {
      toast.error(err.message || 'Error communicating with AI')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-primary/20 shadow-sm overflow-hidden bg-gradient-to-b from-card to-card/90">
      <CardHeader className="bg-primary/5 border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">CampusAI Study Partner</CardTitle>
              <CardDescription className="text-xs">
                Concept explanations, code breakdowns, and guided hints
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background/80 px-2.5 py-1 rounded-full border border-border">
            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
            <span>GPT-4o Mini</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val as any); setOutput('') }}>
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
            <TabsTrigger value="explain" className="text-xs">
              <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Explain
            </TabsTrigger>
            <TabsTrigger value="hints" className="text-xs">
              <Lightbulb className="h-3.5 w-3.5 mr-1.5" /> Get Hints
            </TabsTrigger>
            <TabsTrigger value="code" className="text-xs">
              <Code2 className="h-3.5 w-3.5 mr-1.5" /> Explain Code
            </TabsTrigger>
            <TabsTrigger value="summarize" className="text-xs">
              <ListFilter className="h-3.5 w-3.5 mr-1.5" /> Summarize
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="explain" className="space-y-3 m-0">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Topic or Concept</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Dijkstra's Algorithm, React useEffect, Virtual Memory..."
                  className="text-sm"
                />
              </div>
              <Button onClick={handleExplain} disabled={loading || !topic.trim()} className="w-full">
                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {loading ? 'Thinking...' : 'Explain for Students'}
              </Button>
            </TabsContent>

            <TabsContent value="hints" className="space-y-3 m-0">
              <p className="text-xs text-muted-foreground">
                Get Socratic hints and step-by-step guidance without spoiling the direct solution.
              </p>
              <Button onClick={handleHints} disabled={loading} className="w-full">
                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Lightbulb className="h-4 w-4 mr-2" />}
                {loading ? 'Analyzing...' : 'Generate Guiding Hints'}
              </Button>
            </TabsContent>

            <TabsContent value="code" className="space-y-3 m-0">
              <div className="flex gap-2">
                <Input
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="Language (e.g. python, c++, js)"
                  className="text-sm w-36"
                />
              </div>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste code snippet here..."
                rows={6}
                className="font-mono text-xs"
              />
              <Button onClick={handleExplainCode} disabled={loading || !code.trim()} className="w-full">
                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Code2 className="h-4 w-4 mr-2" />}
                {loading ? 'Analyzing Code...' : 'Explain Code Line by Line'}
              </Button>
            </TabsContent>

            <TabsContent value="summarize" className="space-y-3 m-0">
              <p className="text-xs text-muted-foreground">
                Synthesize the core takeaways, solution approaches, and gotchas from this question discussion.
              </p>
              <Button onClick={handleSummarize} disabled={loading} className="w-full">
                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <ListFilter className="h-4 w-4 mr-2" />}
                {loading ? 'Summarizing...' : 'Summarize Key Takeaways'}
              </Button>
            </TabsContent>
          </div>
        </Tabs>

        {output && (
          <div className="mt-4 rounded-lg border border-primary/20 bg-muted/30 p-4 space-y-3 animate-in fade-in-50">
            <div className="flex items-center justify-between text-xs font-semibold text-primary">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> AI Response
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px] px-2 text-muted-foreground"
                onClick={() => navigator.clipboard.writeText(output).then(() => toast.success('Copied!'))}
              >
                Copy
              </Button>
            </div>
            <div className="prose-campus text-sm leading-relaxed max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 text-[11px] text-muted-foreground border-t border-border/40">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-500/80" />
          <span>AI can make mistakes. Verify important information with course materials or instructors.</span>
        </div>
      </CardContent>
    </Card>
  )
}
