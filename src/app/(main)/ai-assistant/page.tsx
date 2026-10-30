import { AIAssistantPanel } from '@/components/ai/AIAssistantPanel'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Bot, Sparkles, BookOpen, BrainCircuit, Terminal, HelpCircle } from 'lucide-react'

export const metadata = {
  title: 'AI Study Assistant',
  description: 'Instant explanations, algorithmic analysis, and coding hints tailored for college students.',
}

export default function AIAssistantPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2.5">
          <Bot className="h-7 w-7 text-primary" />
          <span>AI Campus Assistant</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your personal 24/7 computer science and engineering teaching assistant. Get concept explanations, debug guidance, and Socratic hints.
        </p>
      </div>

      <AIAssistantPanel contextType="standalone" />

      {/* Helpful suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <Card className="border-border">
          <CardHeader className="p-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-primary" /> DSA & Theory
            </CardTitle>
            <CardDescription className="text-xs">
              &quot;Explain the intuition behind Kosaraju&apos;s algorithm for strongly connected components&quot;
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border">
          <CardHeader className="p-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" /> Systems & OS
            </CardTitle>
            <CardDescription className="text-xs">
              &quot;Why does page thrashing occur and how does the working set model prevent it?&quot;
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border">
          <CardHeader className="p-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" /> Web & DB
            </CardTitle>
            <CardDescription className="text-xs">
              &quot;What is the practical difference between optimistic and pessimistic locking in SQL?&quot;
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
