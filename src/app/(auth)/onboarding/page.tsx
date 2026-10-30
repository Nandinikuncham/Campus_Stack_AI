'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { COLLEGES, DEPARTMENTS, POPULAR_TAGS, DEFAULT_COLLEGE } from '@/lib/constants'
import { GraduationCap, Sparkles, Check, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OnboardingPage() {
  const [college, setCollege] = useState(DEFAULT_COLLEGE)
  const [department, setDepartment] = useState('')
  const [gradYear, setGradYear] = useState('2026')
  const [bio, setBio] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Session expired. Please log in again.')
        router.push('/login')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          college: college || null,
          department: department || null,
          graduation_year: gradYear ? parseInt(gradYear) : null,
          bio: bio.trim() || null,
          skills: selectedSkills,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) {
        toast.error(error.message || 'Failed to update profile')
        return
      }

      toast.success('Profile completed! Welcome to CampusStackAI!')
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
      <Card className="w-full max-w-xl shadow-lg border-border">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-2">
            <GraduationCap className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Complete Your Student Profile</CardTitle>
          <CardDescription>
            Tell us where you study so we can connect you with relevant questions, projects, and peers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="college">College / University</Label>
                <Select value={college} onValueChange={setCollege}>
                  <SelectTrigger id="college">
                    <SelectValue placeholder="Select institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLEGES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department / Major</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select major" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradYear">Graduation Year</Label>
              <Input
                id="gradYear"
                type="number"
                min={2020}
                max={2035}
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                placeholder="2026"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Short Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="CS sophomore passionate about full-stack web dev, systems, and algorithms..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Primary Skills & Interests (select up to 6)</Label>
              <div className="flex flex-wrap gap-2 pt-1 max-h-40 overflow-y-auto p-1">
                {POPULAR_TAGS.map((skill) => {
                  const selected = selectedSkills.includes(skill)
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1 text-xs rounded-full border transition-all ${
                        selected
                          ? 'bg-primary text-primary-foreground border-primary font-medium'
                          : 'bg-background hover:bg-muted border-border text-foreground'
                      }`}
                    >
                      {skill} {selected && '✓'}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-1/3"
                onClick={() => router.push('/dashboard')}
                disabled={loading}
              >
                Skip for now
              </Button>
              <Button type="submit" className="w-2/3" disabled={loading}>
                {loading ? 'Saving...' : 'Finish Setup'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
