'use client'

import {
  ArrowRight,
  MessageSquare,
  Plus,
  Settings,
  FileText,
} from 'lucide-react'

export interface ActivityEntry {
  id: string
  created_at: string
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, unknown> | null
}

interface ActivityFeedProps {
  activities: ActivityEntry[]
  limit?: number
}

function getActionIcon(action: string) {
  if (action.includes('status_changed')) return ArrowRight
  if (action.includes('note')) return MessageSquare
  if (action.includes('created')) return Plus
  if (action.includes('pdf')) return FileText
  return Settings
}

function getActionColor(action: string): string {
  if (action.includes('status_changed')) return 'text-blue bg-blue/10'
  if (action.includes('note')) return 'text-amber-600 bg-amber-100'
  if (action.includes('created')) return 'text-green-d bg-green/10'
  if (action.includes('pdf')) return 'text-navy bg-navy/10'
  return 'text-muted bg-muted/10'
}

function formatActionDescription(entry: ActivityEntry): string {
  const { action, details } = entry

  if (action.includes('status_changed')) {
    const newStatus = details?.new_status as string | undefined
    const oldStatus = details?.old_status as string | undefined
    if (oldStatus && newStatus) {
      return `Enquiry status changed from "${oldStatus}" to "${newStatus}"`
    }
    if (newStatus) {
      return `Enquiry status changed to "${newStatus}"`
    }
    return 'Enquiry status updated'
  }

  if (action.includes('note')) return 'Admin notes updated on enquiry'
  if (action.includes('created') && entry.entity_type === 'enquiry') return 'New enquiry submitted'
  if (action.includes('created') && entry.entity_type === 'configuration') return 'New configuration created'
  if (action.includes('pdf')) return 'PDF specification generated'

  return action.replace(/_/g, ' ')
}

function formatRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${diffDays}d ago`

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  })
}

export function ActivityFeed({ activities, limit = 10 }: ActivityFeedProps) {
  const displayed = activities.slice(0, limit)

  if (displayed.length === 0) {
    return (
      <div className="py-6 text-center text-[13px] text-muted">
        No recent activity
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {displayed.map((entry, index) => {
        const Icon = getActionIcon(entry.action)
        const colorClass = getActionColor(entry.action)
        const isLast = index === displayed.length - 1

        return (
          <div key={entry.id} className="flex gap-3">
            {/* Timeline line + icon */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${colorClass}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              {!isLast && (
                <div className="w-px flex-1 bg-border" />
              )}
            </div>

            {/* Content */}
            <div className={`pb-4 ${isLast ? '' : ''}`}>
              <div className="text-[13px] font-semibold text-ink">
                {formatActionDescription(entry)}
              </div>
              <div className="mt-0.5 text-[11px] text-muted">
                {formatRelativeTime(entry.created_at)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
