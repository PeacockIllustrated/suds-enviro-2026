'use client'

import { useState } from 'react'
import {
  Crosshair,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from 'lucide-react'

interface FeedbackItem {
  id: string
  created_at: string
  author: string
  page_url: string
  section: string | null
  pin_x: number | null
  pin_y: number | null
  comment: string
  priority: string
  category: string
  status: string
  structured_data: Array<{
    field: string
    current: string
    suggested: string
  }> | null
}

interface FeedbackPanelProps {
  currentUrl: string
  author: string
  commentMode: boolean
  onToggleCommentMode: () => void
  pins: FeedbackItem[]
  onRefresh: () => void
}

const PRIORITY_DOTS: Record<string, string> = {
  low: 'bg-blue',
  medium: 'bg-amber-400',
  high: 'bg-red-500',
  critical: 'bg-purple-500',
}

const CATEGORY_LABELS: Record<string, string> = {
  design: 'Design',
  content: 'Content',
  'product-data': 'Product Data',
  bug: 'Bug',
  feature: 'Feature Request',
  general: 'General',
}

function relativeTime(dateString: string): string {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diffMs = now - then

  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  })
}

export function FeedbackPanel({
  currentUrl,
  author,
  commentMode,
  onToggleCommentMode,
  pins,
  onRefresh,
}: FeedbackPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const pageComments = pins.filter((p) => p.page_url === currentUrl)
  const totalCount = pins.length

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  // Detect section name from URL
  const sectionName = (() => {
    if (currentUrl.includes('/configurator')) return 'Configurator'
    if (currentUrl === '/' || currentUrl === '') return 'Home'
    const parts = currentUrl.split('/').filter(Boolean)
    if (parts.length > 0) {
      return parts[parts.length - 1]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
    }
    return 'Page'
  })()

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Current page header */}
      <div className="border-b border-border px-5 py-4">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted">
          Current Page
        </div>
        <div className="text-[14px] font-bold text-ink">{sectionName}</div>
        <div className="text-[12px] text-muted">{currentUrl || '/'}</div>
      </div>

      {/* Comment mode toggle */}
      <div className="border-b border-border px-5 py-4">
        <button
          type="button"
          onClick={onToggleCommentMode}
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 text-[14px] font-bold transition-colors ${
            commentMode
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green text-white hover:bg-green-d'
          }`}
        >
          {commentMode ? (
            <>
              <X className="h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Crosshair className="h-4 w-4" />
              Drop a Pin
            </>
          )}
        </button>
        {commentMode && (
          <p className="mt-2 text-center text-[11px] text-muted">
            Click anywhere on the phone screen to place a pin
          </p>
        )}
      </div>

      {/* Page comments */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted">
              Page Comments ({pageComments.length})
            </span>
            <button
              type="button"
              onClick={onRefresh}
              className="text-[11px] font-semibold text-blue transition-colors hover:text-navy"
            >
              Refresh
            </button>
          </div>

          {pageComments.length === 0 ? (
            <div className="rounded-lg border border-border/50 bg-light/50 p-6 text-center">
              <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted/30" />
              <p className="text-[12px] text-muted">
                No comments on this page yet.
              </p>
              <p className="mt-1 text-[11px] text-muted/60">
                Drop a pin to leave feedback.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {pageComments.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border/50 bg-white transition-colors hover:border-border"
                >
                  {/* Summary row */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    className="flex w-full items-start gap-3 px-3 py-3 text-left"
                  >
                    {/* Priority dot */}
                    <div
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        PRIORITY_DOTS[item.priority] || PRIORITY_DOTS.medium
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink">
                        {item.comment}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-muted">
                        <span className="font-semibold">{item.author}</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {relativeTime(item.created_at)}
                        </span>
                      </div>
                    </div>

                    {expandedId === item.id ? (
                      <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-muted" />
                    ) : (
                      <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted" />
                    )}
                  </button>

                  {/* Expanded detail */}
                  {expandedId === item.id && (
                    <div className="border-t border-border/50 px-3 py-3">
                      <p className="mb-3 text-[13px] leading-relaxed text-ink">
                        {item.comment}
                      </p>

                      <div className="flex flex-wrap gap-2 text-[11px]">
                        <span className="rounded-full border border-border bg-light px-2 py-0.5 font-semibold text-muted">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </span>
                        {item.section && (
                          <span className="rounded-full border border-border bg-light px-2 py-0.5 font-semibold text-muted">
                            {item.section}
                          </span>
                        )}
                        {item.pin_x !== null && item.pin_y !== null && (
                          <span className="rounded-full border border-border bg-light px-2 py-0.5 font-semibold text-muted">
                            Pin: {item.pin_x.toFixed(1)}%, {item.pin_y.toFixed(1)}%
                          </span>
                        )}
                      </div>

                      {/* Structured data */}
                      {item.structured_data &&
                        item.structured_data.length > 0 && (
                          <div className="mt-3">
                            <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted">
                              Specific Detail
                            </div>
                            <table className="w-full text-[11px]">
                              <thead>
                                <tr className="border-b border-border/50">
                                  <th className="py-1 pr-2 text-left font-bold text-muted">
                                    Field
                                  </th>
                                  <th className="py-1 pr-2 text-left font-bold text-muted">
                                    Current
                                  </th>
                                  <th className="py-1 text-left font-bold text-muted">
                                    Suggested
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.structured_data.map((row, i) => (
                                  <tr
                                    key={i}
                                    className="border-b border-border/30"
                                  >
                                    <td className="py-1 pr-2 font-medium text-ink">
                                      {row.field}
                                    </td>
                                    <td className="py-1 pr-2 text-muted">
                                      {row.current}
                                    </td>
                                    <td className="py-1 font-semibold text-green-d">
                                      {row.suggested}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer: total count */}
      <div className="border-t border-border px-5 py-3">
        <p className="text-[11px] text-muted">
          {totalCount} total comment{totalCount !== 1 ? 's' : ''} across all pages
        </p>
      </div>
    </div>
  )
}
