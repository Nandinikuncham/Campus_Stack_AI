'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react'
import { ALLOWED_EMAIL_DOMAIN, isAllowedCollegeEmail, DEFAULT_COLLEGE } from '@/lib/constants'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !email || !password) {
      toast.error('Please fill in all required fields')
      return
    }

    const trimmedEmail = email.trim().toLowerCase()
    if (!isAllowedCollegeEmail(trimmedEmail)) {
      toast.error(`Only official college emails (${ALLOWED_EMAIL_DOMAIN}) are permitted to register.`, {
        duration: 5000,
      })
      return
    }

    if (username.length < 3) {
      toast.error('Username must be at least 3 characters')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            username: username.toLowerCase().trim(),
            full_name: fullName.trim() || username.trim(),
            college: DEFAULT_COLLEGE,
          },
        },
      })

      if (error) {
        toast.error(error.message || 'Failed to sign up')
        return
      }

      toast.success('Account created! Let us complete your profile.')
      router.push('/onboarding')
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
          <CardTitle className="text-2xl font-bold tracking-tight">Join CampusStackAI</CardTitle>
          <CardDescription>
            Connect with college peers, ask doubts, and build your technical reputation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                type="text"
                placeholder="tech_geek"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Alex Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="email">College Email *</Label>
                <span className="text-[11px] font-medium text-primary flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> @gvpcew.ac.in required
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
              <p className="text-[11px] text-muted-foreground">
                Only students and faculty with an active <strong>@gvpcew.ac.in</strong> address can join.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              <UserPlus className="h-4 w-4 mr-2" />
              {loading ? 'Creating account...' : 'Create Student Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 text-center border-t border-border pt-4 text-sm text-muted-foreground">
          <div>
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline inline-flex items-center">
              Sign In <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
