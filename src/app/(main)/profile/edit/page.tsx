'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { COLLEGES, DEPARTMENTS, POPULAR_TAGS, DEFAULT_COLLEGE } from '@/lib/constants'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Save, ArrowLeft, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EditProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [college, setCollege] = useState('')
  const [department, setDepartment] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data as Profile)
        setFullName(data.full_name || '')
        setBio(data.bio || '')
        setCollege(data.college || DEFAULT_COLLEGE)
        setDepartment(data.department || '')
        setGradYear(data.graduation_year ? data.graduation_year.toString() : '')
        setSkills(data.skills || [])
      }
      setLoading(false)
    }
    loadProfile()
  }, [router])

  const toggleSkill = (skill: string) => {
    setSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          bio,
          college,
          department,
          graduationYear: gradYear ? parseInt(gradYear) : null,
          skills,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to update profile')
        return
      }

      toast.success('Profile updated successfully!')
      router.push(`/profile/${profile.username}`)
      router.refresh()
    } catch {
      toast.error('An error occurred while saving')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Public Information</CardTitle>
          <CardDescription className="text-xs">
            This information will be displayed on your public profile and alongside your contributions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={profile?.username || ''} disabled className="bg-muted text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground">Usernames cannot be changed.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Kumar"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="college">College / University</Label>
                <Select value={college} onValueChange={setCollege}>
                  <SelectTrigger id="college">
                    <SelectValue placeholder="Select college" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLEGES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
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
              <Label htmlFor="bio">About You</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community about your technical interests, projects, or background..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Skills & Technologies</Label>
              <div className="flex flex-wrap gap-1.5 p-2 border border-input rounded-md max-h-36 overflow-y-auto">
                {POPULAR_TAGS.map((s) => {
                  const active = skills.includes(s)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSkill(s)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        active
                          ? 'bg-primary text-primary-foreground border-primary font-medium'
                          : 'bg-background hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      {s} {active && '✓'}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
