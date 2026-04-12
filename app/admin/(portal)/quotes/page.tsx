'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, FileText, Send, Eye } from 'lucide-react'
import { QuoteBuilder } from '@/components/admin/QuoteBuilder'

interface QuoteRecord {
  id: string
  created_at: string
  quote_ref: string
  customer_name: string
  customer_email: string
  customer_company: string | null
  total: number
  status: string
  sent_at: string | null
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount)
}

function getStatusBadge(status: string): { label: string; classes: string } {
  switch (status) {
    case 'draft':
      return { label: 'Draft', classes: 'bg-gray-100 text-gray-600' }
    case 'sent':
      return { label: 'Sent', classes: 'bg-blue/10 text-blue' }
    case 'viewed':
      return { label: 'Viewed', classes: 'bg-yellow-50 text-yellow-700' }
    case 'accepted':
      return { label: 'Accepted', classes: 'bg-green/10 text-green-d' }
    case 'expired':
      return { label: 'Expired', classes: 'bg-gray-100 text-gray-500' }
    case 'declined':
      return { label: 'Declined', classes: 'bg-red-50 text-red-600' }
    default:
      return { label: status, classes: 'bg-gray-100 text-gray-600' }
  }
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null)

  const fetchQuotes = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/quotes?${params.toString()}`)
      if (res.ok) {
        const data = await res.json() as { quotes: QuoteRecord[] }
        setQuotes(data.quotes)
      }
    } catch (err) {
      console.error('Failed to fetch quotes:', err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  const handleQuoteSaved = () => {
    setShowBuilder(false)
    setEditingQuoteId(null)
    fetchQuotes()
  }

  if (showBuilder || editingQuoteId) {
    return (
      <QuoteBuilder
        quoteId={editingQuoteId}
        onClose={() => {
          setShowBuilder(false)
          setEditingQuoteId(null)
        }}
        onSaved={handleQuoteSaved}
      />
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-ink">Quotes</h2>
          <p className="text-xs text-muted">
            Create and manage customer quotations.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-navy/90"
        >
          <Plus className="h-4 w-4" />
          Create Quote
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quotes..."
            className="w-full rounded-lg border border-border bg-white py-2.5 pl-10 pr-4 text-[13px] text-ink outline-none transition-colors focus:border-blue"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-2.5 text-[13px] text-ink outline-none"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="viewed">Viewed</option>
          <option value="accepted">Accepted</option>
          <option value="expired">Expired</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-light">
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted">
                Ref
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted">
                Total
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted">
                Date
              </th>
              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">
                  Loading quotes...
                </td>
              </tr>
            ) : quotes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">
                  No quotes found. Click "Create Quote" to get started.
                </td>
              </tr>
            ) : (
              quotes.map((quote) => {
                const badge = getStatusBadge(quote.status)
                return (
                  <tr
                    key={quote.id}
                    className="border-b border-border/60 last:border-0 hover:bg-light/50 transition-colors cursor-pointer"
                    onClick={() => setEditingQuoteId(quote.id)}
                  >
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-bold text-navy">
                        {quote.quote_ref}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[13px] font-semibold text-ink">
                        {quote.customer_name}
                      </div>
                      {quote.customer_company && (
                        <div className="text-[11px] text-muted">
                          {quote.customer_company}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-bold text-ink">
                      {formatCurrency(Number(quote.total))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-muted">
                      {formatDate(quote.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setEditingQuoteId(quote.id)}
                          className="flex h-7 w-7 items-center justify-center rounded text-muted hover:bg-light hover:text-navy transition-colors"
                          title="Edit quote"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            window.open(
                              `/api/admin/quotes/${quote.id}`,
                              '_blank'
                            )
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded text-muted hover:bg-light hover:text-navy transition-colors"
                          title="View quote detail"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </button>
                        {quote.status === 'draft' && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (!confirm('Send this quote to the customer?')) return
                              try {
                                const res = await fetch(
                                  `/api/admin/quotes/${quote.id}/send`,
                                  { method: 'POST' }
                                )
                                if (res.ok) {
                                  fetchQuotes()
                                } else {
                                  const errData = await res.json().catch(() => ({}))
                                  alert((errData as { error?: string }).error || 'Failed to send')
                                }
                              } catch {
                                alert('Failed to send quote')
                              }
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded text-muted hover:bg-green/10 hover:text-green-d transition-colors"
                            title="Send to customer"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
