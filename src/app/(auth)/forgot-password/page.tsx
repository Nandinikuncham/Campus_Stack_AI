'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, KeyRound, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react'
import { ALLOWED_EMAIL_DOMAIN, isAllowedCollegeEmail } from '@/lib/constants'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    const trimmedEmail = email.trim().toLowerCase()
    if (!isAllowedCollegeEmail(trimmedEmail)) {
      toast.error(`Password recovery is only valid for ${ALLOWED_EMAIL_DOMAIN} accounts.`, {
        duration: 5000,
      })
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast.error(error.message || 'Failed to send reset link')
        return
      }

      setSubmitted(true)
      toast.success('Reset link sent to your inbox')
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
          <CardTitle className="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
          <CardDescription>
            Enter your email and we will send you a password recovery link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <h3 className="font-semibold text-lg">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We sent a password reset link to <strong className="text-foreground">{email}</strong>.
                Follow the instructions to regain access.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
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
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                <KeyRound className="h-4 w-4 mr-2" />
                {loading ? 'Sending link...' : 'Send Recovery Link'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border pt-4 text-sm text-muted-foreground">
          <Link href="/login" className="inline-flex items-center text-primary font-medium hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
