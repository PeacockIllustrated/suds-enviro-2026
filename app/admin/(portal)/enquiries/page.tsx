'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle } from 'lucide-react'
import { FilterBar } from '@/components/admin/FilterBar'
import type { FilterState } from '@/components/admin/FilterBar'
import { Pagination } from '@/components/admin/Pagination'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { EnquiryDetailPanel } from '@/components/admin/EnquiryDetailPanel'
import type { EnquiryRow } from '@/components/admin/EnquiryTable'

const PAGE_SIZE = 20

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function EnquiriesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRow | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)

  const [filters, setFilters] = useState<FilterState>({
    status: searchParams.get('status') || '',
    search: searchParams.get('search') || '',
    product: searchParams.get('product') || '',
    sort: 'created_at',
    order: 'desc',
  })

  const fetchEnquiries = useCallback(async () => {
    setLoading(true)

    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.search) params.set('search', filters.search)
    if (filters.product) params.set('product', filters.product)
    if (filters.sort) params.set('sort', filters.sort)
    if (filters.order) params.set('order', filters.order)
    params.set('limit', String(PAGE_SIZE))
    params.set('offset', String((page - 1) * PAGE_SIZE))

    try {
      const res = await fetch(`/api/admin/enquiries?${params.toString()}`)
      if (res.status === 401) {
        router.push('/admin')
        return
      }
      if (!res.ok) throw new Error('Failed to fetch enquiries')

      const data: { enquiries: EnquiryRow[]; total: number } = await res.json()
      setEnquiries(data.enquiries)
      setTotal(data.total)
    } catch {
      // Silently handle - data stays empty
    } finally {
      setLoading(false)
    }
  }, [filters, page, router])

  useEffect(() => {
    fetchEnquiries()
  }, [fetchEnquiries])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1)
    setSelectedIds(new Set())
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    setSelectedIds(new Set())
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === enquiries.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(enquiries.map((e) => e.id)))
    }
  }

  const handleBulkAction = async (status: string) => {
    if (selectedIds.size === 0) return
    setBulkLoading(true)

    try {
      const res = await fetch('/api/admin/enquiries/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds), status }),
      })

      if (res.status === 401) {
        router.push('/admin')
        return
      }

      if (res.ok) {
        setSelectedIds(new Set())
        await fetchEnquiries()
      }
    } catch {
      // Silently handle
    } finally {
      setBulkLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.status === 401) {
        router.push('/admin')
        return
      }

      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status } : e))
        )
      }
    } catch {
      // Silently handle
    }
  }

  const handleNotesChange = async (id: string, notes: string) => {
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: notes }),
      })

      if (res.status === 401) {
        router.push('/admin')
        return
      }

      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, admin_notes: notes } : e))
        )
      }
    } catch {
      // Silently handle
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="px-6 py-6 lg:px-10 lg:py-8">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-ink">Enquiries</h1>
        <p className="mt-1 text-[13px] text-muted">
          Manage and track customer enquiries
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-5">
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          showProductFilter
          showSort
        />
      </div>

      {/* Results summary */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-muted">
          {total > 0
            ? `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} of ${total} enquiries`
            : 'No enquiries found'}
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
      ) : enquiries.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <div className="text-[14px] font-semibold text-muted">
            No enquiries found
          </div>
          <div className="mt-1 text-[12px] text-muted/70">
            Try adjusting your filters or search terms.
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-border bg-light">
                  <th className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === enquiries.length && enquiries.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-border text-navy accent-navy"
                    />
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Date
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Name
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Email
                  </th>
                  <th className="hidden px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted md:table-cell">
                    Company
                  </th>
                  <th className="hidden px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted lg:table-cell">
                    Product
                  </th>
                  <th className="hidden px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted lg:table-cell">
                    Code
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enquiry, index) => (
                  <tr
                    key={enquiry.id}
                    className={`cursor-pointer border-b border-border/50 transition-colors hover:bg-blue/5 ${
                      index % 2 === 1 ? 'bg-light/50' : 'bg-white'
                    } ${selectedIds.has(enquiry.id) ? 'bg-blue/5' : ''}`}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(enquiry.id)}
                        onChange={() => toggleSelect(enquiry.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-border text-navy accent-navy"
                      />
                    </td>
                    <td
                      className="whitespace-nowrap px-4 py-3 text-muted"
                      onClick={() => setSelectedEnquiry(enquiry)}
                    >
                      {formatDate(enquiry.created_at)}
                    </td>
                    <td
                      className="px-4 py-3 font-semibold text-ink"
                      onClick={() => setSelectedEnquiry(enquiry)}
                    >
                      {enquiry.name}
                    </td>
                    <td
                      className="px-4 py-3 text-muted"
                      onClick={() => setSelectedEnquiry(enquiry)}
                    >
                      {enquiry.email}
                    </td>
                    <td
                      className="hidden px-4 py-3 text-muted md:table-cell"
                      onClick={() => setSelectedEnquiry(enquiry)}
                    >
                      {enquiry.company || '-'}
                    </td>
                    <td
                      className="hidden px-4 py-3 text-muted capitalize lg:table-cell"
                      onClick={() => setSelectedEnquiry(enquiry)}
                    >
                      {enquiry.product_type || '-'}
                    </td>
                    <td
                      className="hidden px-4 py-3 lg:table-cell"
                      onClick={() => setSelectedEnquiry(enquiry)}
                    >
                      {enquiry.product_code ? (
                        <span className="rounded bg-navy/8 px-2 py-0.5 font-mono text-[11px] font-bold text-navy">
                          {enquiry.product_code}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={() => setSelectedEnquiry(enquiry)}
                    >
                      <StatusBadge status={enquiry.status} />
                    </td>
                  </tr>
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
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/15 bg-navy px-6 py-3 shadow-xl lg:left-64">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[13px] font-bold text-white">
              {selectedIds.size} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={bulkLoading}
                onClick={() => handleBulkAction('reviewed')}
                className="flex items-center gap-1.5 rounded-lg bg-white/15 px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-white/25 disabled:opacity-50"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Mark as Reviewed
              </button>
              <button
                type="button"
                disabled={bulkLoading}
                onClick={() => handleBulkAction('quoted')}
                className="flex items-center gap-1.5 rounded-lg bg-green/20 px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-green/30 disabled:opacity-50"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Mark as Quoted
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-[12px] font-bold text-white/70 transition-colors hover:bg-white/15"
              >
                <XCircle className="h-3.5 w-3.5" />
                Deselect All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail panel */}
      {selectedEnquiry && (
        <EnquiryDetailPanel
          enquiry={selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
          onStatusChange={handleStatusChange}
          onNotesChange={handleNotesChange}
        />
      )}
    </div>
  )
}
