import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Sparkles, Users, Award, ShieldCheck, ArrowRight, Code2, MessageSquare, Terminal } from 'lucide-react'

export const metadata = {
  title: 'CampusStackAI — Knowledge Sharing for College Students',
  description: 'AI-powered community Q&A platform tailored for university courses, coding projects, and peer learning.',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="border-b border-border/80 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              CampusStack<span className="text-primary">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">
                Get Started <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-28 px-4 text-center max-w-4xl mx-auto space-y-6">
          <Badge variant="secondary" className="px-3 py-1 text-xs sm:text-sm font-medium gap-1.5 border border-primary/20">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Powered by Student Community & AI Insights
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Learn Together. <br className="hidden sm:inline" />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">
              Solve Together.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The Stack Overflow reimagined for university students. Ask complex engineering doubts, share course solutions, get instant AI explanations, and build your campus reputation.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base shadow-md" asChild>
              <Link href="/signup">
                Join Campus Community <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base" asChild>
              <Link href="/questions">Explore Discussions</Link>
            </Button>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 bg-muted/40 border-y border-border/60">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Built Specifically for Students</h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Everything you need to master your syllabus, crack programming assignments, and prepare for tech placements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border/80 shadow-sm hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">AI-Assisted Guidance</CardTitle>
                  <CardDescription>
                    Get instant concept breakdowns, hints without direct spoilers, and question enhancement suggestions.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/80 shadow-sm hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <Users className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Peer Collaboration</CardTitle>
                  <CardDescription>
                    Connect with seniors, classmates, and verified faculty across leading Indian & global universities.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/80 shadow-sm hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <Award className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Reputation & Badges</CardTitle>
                  <CardDescription>
                    Earn reputation points and unlock bronze, silver, and gold badges to showcase your technical skills on your CV.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Terminal / Code Preview Section */}
        <section className="py-20 px-4 max-w-5xl mx-auto">
          <div className="rounded-xl border border-border bg-card p-6 md:p-8 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 font-mono text-xs text-muted-foreground">campus-query.ts</span>
              </div>
              <Badge variant="outline" className="text-xs">Live Platform</Badge>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">
                Q: Why does my Dijkstra algorithm give incorrect shortest paths with negative edges?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                I am implementing Dijkstra in C++ for my Data Structures lab. It works fine for all non-negative graphs, but produces wrong distances when there are negative weights. What is the fundamental invariant being violated?
              </p>
              <div className="rounded-lg bg-muted p-4 font-mono text-xs overflow-x-auto text-primary">
                {`// Dijkstra's greedy property assumes that once a vertex is finalized,\n// its recorded distance is globally optimal. Negative edges violate this monotonicity.`}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 text-center text-xs text-muted-foreground">
        <p>&copy; 2026 CampusStackAI. Empowering collegiate learning and open academic discourse.</p>
      </footer>
    </div>
  )
}
