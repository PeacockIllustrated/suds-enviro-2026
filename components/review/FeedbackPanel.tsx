'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Crosshair,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import { getPriorityStyle, CATEGORY_LABELS } from '@/lib/review-colors'

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
  onRefresh: () => Promise<void>
  /** Currently selected pin (highlighted in the panel and on the phone). */
  expandedId: string | null
  onSetExpandedId: (id: string | null) => void
  /** Returns true on success, false on failure. */
  onDelete: (id: string) => Promise<boolean>
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
  expandedId,
  onSetExpandedId,
  onDelete,
}: FeedbackPanelProps) {
  const [refreshing, setRefreshing] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const pageComments = pins.filter((p) => p.page_url === currentUrl)
  const totalCount = pins.length

  // When the parent changes the expandedId (e.g. from pin click), scroll the
  // expanded card into view.
  const expandedRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!expandedId) return
    const el = expandedRef.current
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [expandedId])

  // Quietly refresh on a 30s interval so multiple reviewers see each other's pins
  useEffect(() => {
    const interval = setInterval(() => {
      void onRefresh()
    }, 30_000)
    return () => clearInterval(interval)
  }, [onRefresh])

  const toggleExpand = (id: string) => {
    onSetExpandedId(expandedId === id ? null : id)
  }

  const handleRefresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setRefreshing(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const ok = await onDelete(id)
    setDeletingId(null)
    if (ok) {
      setConfirmDeleteId(null)
      if (expandedId === id) onSetExpandedId(null)
    }
  }

  // Detect section name from URL (may include #step-N suffix)
  const sectionName = (() => {
    const stepMatch = currentUrl.match(/#step-(\d+)/)
    const basePath = currentUrl.replace(/#.*$/, '')
    if (basePath.includes('/configurator')) {
      return stepMatch ? `Configurator - Step ${stepMatch[1]}` : 'Configurator'
    }
    if (basePath === '/' || basePath === '') return 'Home'
    const parts = basePath.split('/').filter(Boolean)
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
        <div
          className="truncate text-[12px] text-muted"
          title={currentUrl || '/'}
        >
          {currentUrl || '/'}
        </div>
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
              Cancel pin placement
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
        {!commentMode && pageComments.length > 0 && (
          <p className="mt-2 text-center text-[11px] text-muted">
            Click a pin on the phone to view its comment
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
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1 text-[11px] font-semibold text-blue transition-colors hover:text-navy disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing' : 'Refresh'}
            </button>
          </div>

          {pageComments.length === 0 ? (
            <div className="rounded-lg border border-border/50 bg-light/50 p-6 text-center">
              <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted/30" />
              <p className="text-[12px] text-muted">No comments on this page yet.</p>
              <p className="mt-1 text-[11px] text-muted/60">
                Drop a pin to leave feedback.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {pageComments.map((item, idx) => {
                const style = getPriorityStyle(item.priority)
                const isExpanded = expandedId === item.id
                const isMine = item.author === author
                const isConfirming = confirmDeleteId === item.id
                return (
                  <div
                    key={item.id}
                    ref={isExpanded ? expandedRef : null}
                    className={`rounded-lg border bg-white transition-colors
                      ${isExpanded
                        ? 'border-navy shadow-[0_2px_12px_rgba(0,77,112,0.18)]'
                        : 'border-border/50 hover:border-border'}
                    `}
                  >
                    {/* Summary row */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className="flex w-full items-start gap-3 px-3 py-3 text-left"
                    >
                      {/* Pin number badge with priority colour */}
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-extrabold text-white shadow-sm
                          ${style.pin}
                        `}
                      >
                        {idx + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[13px] font-medium text-ink">
                          {item.comment}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                          <span className="font-semibold">{item.author}</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {relativeTime(item.created_at)}
                          </span>
                          <span className="rounded-full bg-light px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wider">
                            {style.label}
                          </span>
                        </div>
                      </div>

                      {isExpanded ? (
                        <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-muted" />
                      ) : (
                        <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted" />
                      )}
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-border/50 px-3 py-3">
                        <p className="mb-3 whitespace-pre-wrap text-[13px] leading-relaxed text-ink">
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
                          <span className="rounded-full border border-border bg-light px-2 py-0.5 font-semibold text-muted capitalize">
                            {item.status}
                          </span>
                        </div>

                        {/* Structured data */}
                        {item.structured_data && item.structured_data.length > 0 && (
                          <div className="mt-3 overflow-x-auto">
                            <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted">
                              Specific Detail
                            </div>
                            <table className="w-full text-[11px]">
                              <thead>
                                <tr className="border-b border-border/50">
                                  <th className="py-1 pr-2 text-left font-bold text-muted">Field</th>
                                  <th className="py-1 pr-2 text-left font-bold text-muted">Current</th>
                                  <th className="py-1 text-left font-bold text-muted">Suggested</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.structured_data.map((row, i) => (
                                  <tr key={i} className="border-b border-border/30">
                                    <td className="py-1 pr-2 font-medium text-ink">{row.field}</td>
                                    <td className="py-1 pr-2 text-muted">{row.current}</td>
                                    <td className="py-1 font-semibold text-green-d">{row.suggested}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Delete control - only shown for the author's own comments */}
                        {isMine && (
                          <div className="mt-4 flex items-center justify-end gap-2 border-t border-border/30 pt-3">
                            {!isConfirming ? (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(item.id)}
                                className="flex items-center gap-1 rounded-lg border border-border bg-white px-2.5 py-1 text-[11px] font-semibold text-muted transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </button>
                            ) : (
                              <>
                                <span className="text-[11px] text-muted">Delete this comment?</span>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="rounded-lg border border-border bg-white px-2.5 py-1 text-[11px] font-semibold text-muted transition-colors hover:bg-light"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item.id)}
                                  disabled={deletingId === item.id}
                                  className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                                >
                                  {deletingId === item.id ? 'Deleting' : 'Delete'}
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
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
