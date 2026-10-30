'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Flag } from 'lucide-react'
import toast from 'react-hot-toast'

interface ReportDialogProps {
  questionId?: string
  answerId?: string
  commentId?: string
}

const REASONS = [
  'Spam or self-promotion',
  'Offensive or abusive content',
  'Off-topic or irrelevant',
  'Duplicate question',
  'Low quality / unclear',
  'Copyright violation',
  'Other',
]

export function ReportDialog({ questionId, answerId, commentId }: ReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!reason) { toast.error('Please select a reason'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, answerId, commentId, reason, details }),
      })
      if (res.ok) {
        toast.success('Report submitted. Our moderators will review it.')
        setOpen(false)
        setReason('')
        setDetails('')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit report')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground h-7 px-2">
          <Flag className="h-3.5 w-3.5 mr-1" /> Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Report Content</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Reason</label>
            <Select onValueChange={setReason}>
              <SelectTrigger><SelectValue placeholder="Select a reason..." /></SelectTrigger>
              <SelectContent>
                {REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Additional details (optional)</label>
            <Textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Provide more context..."
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading || !reason}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
