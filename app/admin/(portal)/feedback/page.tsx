'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
  Check,
} from 'lucide-react'
import { Pagination } from '@/components/admin/Pagination'

const PAGE_SIZE = 20

interface StructuredRow {
  field: string
  current: string
  suggested: string
}

interface FeedbackItem {
  id: string
  created_at: string
  updated_at: string
  author: string
  page_url: string
  page_title: string | null
  section: string | null
  pin_x: number | null
  pin_y: number | null
  comment: string
  priority: string
  category: string
  status: string
  dev_notes: string | null
  resolved_at: string | null
  structured_data: StructuredRow[] | null
}

const PRIORITY_DOT: Record<string, string> = {
  low: 'bg-blue',
  medium: 'bg-amber-400',
  high: 'bg-red-500',
  critical: 'bg-purple-500',
}

const PRIORITY_BADGE: Record<string, string> = {
  low: 'bg-blue/10 text-blue',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
  critical: 'bg-purple-100 text-purple-700',
}

const STATUS_BADGE: Record<string, string> = {
  new: 'bg-blue/15 text-blue border-blue/25',
  'in-progress': 'bg-amber-100 text-amber-700 border-amber-200',
  resolved: 'bg-green/15 text-green-d border-green/25',
  closed: 'bg-muted/15 text-muted border-muted/25',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

const CATEGORY_LABELS: Record<string, string> = {
  design: 'Design',
  content: 'Content',
  'product-data': 'Product Data',
  bug: 'Bug',
  feature: 'Feature Request',
  general: 'General',
}

const STATUS_OPTIONS = ['new', 'in-progress', 'resolved', 'closed']
const PRIORITY_OPTIONS = ['', 'low', 'medium', 'high', 'critical']
const CATEGORY_OPTIONS = [
  '',
  'design',
  'content',
  'product-data',
  'bug',
  'feature',
  'general',
]
const AUTHOR_OPTIONS = ['', 'Sean', 'Mark']

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function FeedbackDashboardPage() {
  const router = useRouter()

  const [items, setItems] = useState<FeedbackItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [authorFilter, setAuthorFilter] = useState('')
  const [pageSearch, setPageSearch] = useState('')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
  })

  const fetchStats = useCallback(async () => {
    try {
      const requests = [
        fetch('/api/review/feedback?limit=0'),
        fetch('/api/review/feedback?status=new&limit=0'),
        fetch('/api/review/feedback?status=in-progress&limit=0'),
        fetch('/api/review/feedback?status=resolved&limit=0'),
      ]
      const results = await Promise.all(requests)
      const data = await Promise.all(
        results.map((r) => (r.ok ? r.json() : { total: 0 }))
      )
      setStats({
        total: (data[0] as { total: number }).total,
        new: (data[1] as { total: number }).total,
        inProgress: (data[2] as { total: number }).total,
        resolved: (data[3] as { total: number }).total,
      })
    } catch {
      // Silent
    }
  }, [])

  const fetchFeedback = useCallback(async () => {
    setLoading(true)

    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (priorityFilter) params.set('priority', priorityFilter)
    if (categoryFilter) params.set('category', categoryFilter)
    if (authorFilter) params.set('author', authorFilter)
    params.set('limit', String(PAGE_SIZE))
    params.set('offset', String((page - 1) * PAGE_SIZE))

    try {
      const res = await fetch(`/api/review/feedback?${params.toString()}`)
      if (res.status === 401) {
        router.push('/admin')
        return
      }
      if (!res.ok) throw new Error('Failed to fetch feedback')

      const data: { feedback: FeedbackItem[]; total: number } = await res.json()

      // Client-side page_url filter (API doesn't support partial matching)
      let filtered = data.feedback
      if (pageSearch) {
        filtered = filtered.filter((f) =>
          f.page_url.toLowerCase().includes(pageSearch.toLowerCase())
        )
      }

      setItems(filtered)
      setTotal(data.total)
    } catch {
      // Silent
    } finally {
      setLoading(false)
    }
  }, [statusFilter, priorityFilter, categoryFilter, authorFilter, page, pageSearch, router])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchFeedback()
  }, [fetchFeedback])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/review/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: newStatus,
                  resolved_at:
                    newStatus === 'resolved'
                      ? new Date().toISOString()
                      : item.resolved_at,
                }
              : item
          )
        )
        fetchStats()
      }
    } catch {
      // Silent
    }
  }

  const handleDevNotesBlur = async (id: string, notes: string) => {
    try {
      await fetch(`/api/review/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dev_notes: notes }),
      })
    } catch {
      // Silent
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const statCards = [
    {
      label: 'Total',
      count: stats.total,
      icon: MessageSquare,
      colour: 'text-ink',
      bg: 'bg-light',
    },
    {
      label: 'New',
      count: stats.new,
      icon: AlertCircle,
      colour: 'text-blue',
      bg: 'bg-blue/10',
    },
    {
      label: 'In Progress',
      count: stats.inProgress,
      icon: Clock,
      colour: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Resolved',
      count: stats.resolved,
      icon: CheckCircle2,
      colour: 'text-green-d',
      bg: 'bg-green/10',
    },
  ]

  return (
    <div className="px-6 py-6 lg:px-10 lg:py-8">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-ink">Feedback</h1>
        <p className="mt-1 text-[13px] text-muted">
          Review comments from Sean and Mark
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="rounded-xl border border-border bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}
                >
                  <Icon className={`h-4 w-4 ${card.colour}`} />
                </div>
              </div>
              <div className="text-[24px] font-extrabold text-ink">
                {card.count}
              </div>
              <div className="text-[11px] font-semibold text-muted">
                {card.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* Status toggle pills */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setStatusFilter('')
              setPage(1)
            }}
            className={`rounded-full px-3 py-1 text-[12px] font-bold transition-colors ${
              statusFilter === ''
                ? 'bg-navy text-white'
                : 'border border-border bg-white text-muted hover:bg-light'
            }`}
          >
            All
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatusFilter(s)
                setPage(1)
              }}
              className={`rounded-full px-3 py-1 text-[12px] font-bold transition-colors ${
                statusFilter === s
                  ? 'bg-navy text-white'
                  : 'border border-border bg-white text-muted hover:bg-light'
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Priority dropdown */}
        <select
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value)
            setPage(1)
          }}
          className="appearance-none rounded-lg border border-border bg-white px-3 py-1.5 text-[12px] font-semibold text-ink outline-none focus:border-blue"
        >
          <option value="">All Priorities</option>
          {PRIORITY_OPTIONS.filter(Boolean).map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>

        {/* Category dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value)
            setPage(1)
          }}
          className="appearance-none rounded-lg border border-border bg-white px-3 py-1.5 text-[12px] font-semibold text-ink outline-none focus:border-blue"
        >
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.filter(Boolean).map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c] || c}
            </option>
          ))}
        </select>

        {/* Author dropdown */}
        <select
          value={authorFilter}
          onChange={(e) => {
            setAuthorFilter(e.target.value)
            setPage(1)
          }}
          className="appearance-none rounded-lg border border-border bg-white px-3 py-1.5 text-[12px] font-semibold text-ink outline-none focus:border-blue"
        >
          <option value="">All Authors</option>
          {AUTHOR_OPTIONS.filter(Boolean).map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        {/* Page search */}
        <input
          type="text"
          value={pageSearch}
          onChange={(e) => {
            setPageSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search by page URL..."
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-[12px] text-ink outline-none placeholder:text-muted/50 focus:border-blue"
        />
      </div>

      {/* Results summary */}
      <div className="mb-4">
        <span className="text-[12px] font-semibold text-muted">
          {total > 0
            ? `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(
                page * PAGE_SIZE,
                total
              )} of ${total} feedback items`
            : 'No feedback found'}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-border bg-white py-16">
          <div className="text-center">
            <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-navy border-t-transparent" />
            <p className="text-[12px] font-semibold text-muted">Loading...</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted/30" />
          <div className="text-[14px] font-semibold text-muted">
            No feedback found
          </div>
          <div className="mt-1 text-[12px] text-muted/70">
            Try adjusting your filters.
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-border bg-light">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    #
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Page
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Comment
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Priority
                  </th>
                  <th className="hidden px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted md:table-cell">
                    Category
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Author
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <FeedbackRow
                    key={item.id}
                    item={item}
                    index={(page - 1) * PAGE_SIZE + index + 1}
                    isExpanded={expandedId === item.id}
                    onToggle={() =>
                      setExpandedId((prev) =>
                        prev === item.id ? null : item.id
                      )
                    }
                    onStatusChange={handleStatusChange}
                    onDevNotesBlur={handleDevNotesBlur}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-5">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}

// ── Individual feedback row with expandable detail ──────────

interface FeedbackRowProps {
  item: FeedbackItem
  index: number
  isExpanded: boolean
  onToggle: () => void
  onStatusChange: (id: string, status: string) => void
  onDevNotesBlur: (id: string, notes: string) => void
}

function FeedbackRow({
  item,
  index,
  isExpanded,
  onToggle,
  onStatusChange,
  onDevNotesBlur,
}: FeedbackRowProps) {
  const [devNotes, setDevNotes] = useState(item.dev_notes || '')

  const truncatedComment =
    item.comment.length > 60
      ? item.comment.slice(0, 60) + '...'
      : item.comment

  return (
    <>
      <tr
        className={`cursor-pointer border-b border-border/50 transition-colors hover:bg-blue/5 ${
          index % 2 === 0 ? 'bg-light/50' : 'bg-white'
        }`}
        onClick={onToggle}
      >
        <td className="px-4 py-3 text-muted">{index}</td>
        <td className="max-w-[120px] truncate px-4 py-3 font-medium text-ink">
          {item.page_url}
        </td>
        <td className="max-w-[200px] px-4 py-3 text-ink">
          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                PRIORITY_DOT[item.priority] || PRIORITY_DOT.medium
              }`}
            />
            <span className="truncate">{truncatedComment}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
              PRIORITY_BADGE[item.priority] || PRIORITY_BADGE.medium
            }`}
          >
            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
          </span>
        </td>
        <td className="hidden px-4 py-3 text-muted md:table-cell">
          {CATEGORY_LABELS[item.category] || item.category}
        </td>
        <td className="px-4 py-3 font-semibold text-ink">{item.author}</td>
        <td className="px-4 py-3">
          <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
              STATUS_BADGE[item.status] || STATUS_BADGE.new
            }`}
          >
            {STATUS_LABELS[item.status] || item.status}
          </span>
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-muted">
          {formatDate(item.created_at)}
        </td>
      </tr>

      {/* Expanded detail row */}
      {isExpanded && (
        <tr className="border-b border-border bg-light/30">
          <td colSpan={8} className="px-6 py-5">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Left column: comment details */}
              <div>
                <div className="mb-4">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Full Comment
                  </div>
                  <p className="text-[13px] leading-relaxed text-ink">
                    {item.comment}
                  </p>
                </div>

                {/* Pin position */}
                {item.pin_x !== null && item.pin_y !== null && (
                  <div className="mb-4">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted">
                      Pin Position
                    </div>
                    <p className="text-[13px] text-ink">
                      X: {item.pin_x.toFixed(1)}%, Y: {item.pin_y.toFixed(1)}%
                    </p>
                  </div>
                )}

                {/* Section */}
                {item.section && (
                  <div className="mb-4">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted">
                      Section
                    </div>
                    <p className="text-[13px] text-ink">{item.section}</p>
                  </div>
                )}

                {/* Structured data */}
                {item.structured_data && item.structured_data.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted">
                      Specific Detail
                    </div>
                    <div className="overflow-hidden rounded-lg border border-border">
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className="bg-light">
                            <th className="px-3 py-2 text-left font-bold text-muted">
                              Field
                            </th>
                            <th className="px-3 py-2 text-left font-bold text-muted">
                              Current
                            </th>
                            <th className="px-3 py-2 text-left font-bold text-muted">
                              Suggested
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.structured_data.map((row, i) => (
                            <tr
                              key={i}
                              className="border-t border-border/50"
                            >
                              <td className="px-3 py-2 font-medium text-ink">
                                {row.field}
                              </td>
                              <td className="px-3 py-2 text-muted">
                                {row.current}
                              </td>
                              <td className="px-3 py-2 font-semibold text-green-d">
                                {row.suggested}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Right column: dev controls */}
              <div>
                {/* Dev notes */}
                <div className="mb-4">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Dev Notes
                  </div>
                  <textarea
                    value={devNotes}
                    onChange={(e) => setDevNotes(e.target.value)}
                    onBlur={() => onDevNotesBlur(item.id, devNotes)}
                    placeholder="Add developer notes..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none placeholder:text-muted/50 focus:border-blue"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <p className="mt-1 text-[10px] text-muted">
                    Saves automatically when you click away
                  </p>
                </div>

                {/* Status control */}
                <div className="mb-4">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Status
                  </div>
                  <select
                    value={item.status}
                    onChange={(e) => {
                      e.stopPropagation()
                      onStatusChange(item.id, e.target.value)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full appearance-none rounded-lg border border-border bg-white px-3 py-2 text-[13px] font-semibold text-ink outline-none focus:border-blue"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mark Resolved button */}
                {item.status !== 'resolved' && item.status !== 'closed' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onStatusChange(item.id, 'resolved')
                    }}
                    className="flex items-center gap-2 rounded-lg bg-green px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-green-d"
                  >
                    <Check className="h-4 w-4" />
                    Mark Resolved
                  </button>
                )}

                {/* Resolved timestamp */}
                {item.resolved_at && (
                  <p className="mt-3 text-[11px] text-muted">
                    Resolved: {formatDate(item.resolved_at)}
                  </p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
