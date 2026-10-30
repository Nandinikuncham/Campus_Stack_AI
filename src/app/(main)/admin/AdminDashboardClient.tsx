'use client'

import { useState } from 'react'
import { Report } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'
import { Check, X, Trash2, ShieldAlert, Users, MessageSquare, Flag } from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminProps {
  initialReports: Report[]
  stats: {
    questions: number
    answers: number
    users: number
    pendingReports: number
  }
}

export function AdminDashboardClient({ initialReports, stats }: AdminProps) {
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleAction = async (reportId: string, action: 'dismiss' | 'resolve' | 'delete_content') => {
    setLoadingId(reportId)
    try {
      const res = await fetch('/api/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update report')
      }

      setReports(prev =>
        prev.map(r => (r.id === reportId ? { ...r, status: action === 'dismiss' ? 'dismissed' : 'resolved' } : r))
      )
      toast.success(`Report marked as ${action}`)
    } catch (err: any) {
      toast.error(err.message || 'Error updating report')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending Flags</p>
                <p className="text-2xl font-bold text-destructive">{stats.pendingReports}</p>
              </div>
              <Flag className="h-6 w-6 text-destructive/40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold">{stats.questions}</p>
              </div>
              <MessageSquare className="h-6 w-6 text-primary/40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Answers</p>
                <p className="text-2xl font-bold">{stats.answers}</p>
              </div>
              <MessageSquare className="h-6 w-6 text-green-500/40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{stats.users}</p>
              </div>
              <Users className="h-6 w-6 text-blue-500/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Queue */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <span>Community Flagged Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Queue is completely clear! No flagged items pending review.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {reports.map((report) => (
                <div key={report.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{report.reason}</span>
                      <Badge
                        variant={
                          report.status === 'pending'
                            ? 'destructive'
                            : report.status === 'resolved'
                            ? 'default'
                            : 'secondary'
                        }
                        className="text-[10px] capitalize"
                      >
                        {report.status}
                      </Badge>
                    </div>
                    {report.details && (
                      <p className="text-xs text-muted-foreground">{report.details}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      Reported by @{report.reporter?.username || 'User'} •{' '}
                      {formatRelativeTime(report.created_at)}
                    </p>
                  </div>

                  {report.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={loadingId === report.id}
                        onClick={() => handleAction(report.id, 'dismiss')}
                        className="text-xs h-8"
                      >
                        <X className="h-3.5 w-3.5 mr-1" /> Dismiss
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        disabled={loadingId === report.id}
                        onClick={() => handleAction(report.id, 'resolve')}
                        className="text-xs h-8"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Mark Resolved
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={loadingId === report.id}
                        onClick={() => handleAction(report.id, 'delete_content')}
                        className="text-xs h-8"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Item
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
