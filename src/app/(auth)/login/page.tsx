'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, LogIn, ArrowRight, ShieldCheck } from 'lucide-react'
import { ALLOWED_EMAIL_DOMAIN, isAllowedCollegeEmail } from '@/lib/constants'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('error') === 'unauthorized_domain') {
        toast.error('Access restricted: Only official @gvpcew.ac.in accounts are permitted.', {
          duration: 6000,
        })
      }
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter both email and password')
      return
    }

    const trimmedEmail = email.trim().toLowerCase()
    if (!isAllowedCollegeEmail(trimmedEmail)) {
      toast.error(`Please use your ${ALLOWED_EMAIL_DOMAIN} college account.`, {
        duration: 5000,
      })
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      })

      if (error) {
        toast.error(error.message || 'Invalid login credentials')
        return
      }

      toast.success('Welcome back!')
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-2">
            <BookOpen className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Sign in to CampusStackAI</CardTitle>
          <CardDescription>
            Learn Together. Solve Together. The knowledge hub for college minds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="email">College Email</Label>
                <span className="text-[11px] font-medium text-primary flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> @gvpcew.ac.in
                </span>
              </div>
              <Input
                id="email"
                type="email"
                placeholder="rollno@gvpcew.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              <LogIn className="h-4 w-4 mr-2" />
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 text-center border-t border-border pt-4 text-sm text-muted-foreground">
          <div>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary font-medium hover:underline inline-flex items-center">
              Create account <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
