'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }

    // Always show first page
    pages.push(1)

    if (page > 3) {
      pages.push('ellipsis')
    }

    // Pages around current
    const rangeStart = Math.max(2, page - 1)
    const rangeEnd = Math.min(totalPages - 1, page + 1)

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i)
    }

    if (page < totalPages - 2) {
      pages.push('ellipsis')
    }

    // Always show last page
    pages.push(totalPages)

    return pages
  }

  if (totalPages <= 1) {
    return (
      <div className="text-[12px] font-semibold text-muted">
        Showing {start}-{end} of {total}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <span className="text-[12px] font-semibold text-muted">
        Showing {start}-{end} of {total}
      </span>

      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-8 items-center gap-1 rounded-lg border border-border bg-white px-3 text-[12px] font-semibold text-ink transition-colors hover:bg-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((p, idx) =>
          p === 'ellipsis' ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-1.5 text-[12px] text-muted"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-bold transition-colors ${
                p === page
                  ? 'bg-navy text-white'
                  : 'border border-border bg-white text-ink hover:bg-light'
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex h-8 items-center gap-1 rounded-lg border border-border bg-white px-3 text-[12px] font-semibold text-ink transition-colors hover:bg-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
