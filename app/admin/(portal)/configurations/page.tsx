'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutGrid, List, Search, ChevronDown } from 'lucide-react'
import { ConfigurationCard } from '@/components/admin/ConfigurationCard'
import { ConfigurationDetail } from '@/components/admin/ConfigurationDetail'
import { Pagination } from '@/components/admin/Pagination'
import { StatusBadge } from '@/components/admin/StatusBadge'

const PAGE_SIZE = 18

interface ConfigRow {
  id: string
  product: string
  product_code: string | null
  product_data: Record<string, unknown> | null
  status: string
  created_at: string
  wizard_step: number | null
}

const PRODUCT_OPTIONS = [
  { value: '', label: 'All Products' },
  { value: 'chamber', label: 'Inspection Chamber' },
  { value: 'catchpit', label: 'Catchpit / Silt Trap' },
  { value: 'rhinoceptor', label: 'RhinoCeptor' },
  { value: 'flow-control', label: 'Flow Control' },
  { value: 'pump-station', label: 'Pump Station' },
  { value: 'grease-trap', label: 'Grease Trap' },
  { value: 'grease-separator', label: 'Grease Separator' },
  { value: 'rhinopod', label: 'RhinoPod' },
  { value: 'rainwater', label: 'Rainwater' },
  { value: 'septic-tank', label: 'Septic Tank' },
  { value: 'drawpit', label: 'Drawpit' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'complete', label: 'Complete' },
]

const PRODUCT_LABELS: Record<string, string> = {
  chamber: 'Inspection Chamber',
  catchpit: 'Catchpit / Silt Trap',
  rhinoceptor: 'RhinoCeptor',
  'flow-control': 'Flow Control',
  'pump-station': 'Pump Station',
  'grease-trap': 'Grease Trap',
  'grease-separator': 'Grease Separator',
  rhinopod: 'RhinoPod',
  rainwater: 'Rainwater',
  'septic-tank': 'Septic Tank',
  drawpit: 'Drawpit',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function ConfigurationsPage() {
  const router = useRouter()

  const [configs, setConfigs] = useState<ConfigRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null)

  const [productFilter, setProductFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const fetchConfigs = useCallback(async () => {
    setLoading(true)

    const params = new URLSearchParams()
    if (productFilter) params.set('product', productFilter)
    if (statusFilter) params.set('status', statusFilter)
    if (search) params.set('search', search)
    params.set('limit', String(PAGE_SIZE))
    params.set('offset', String((page - 1) * PAGE_SIZE))

    try {
      const res = await fetch(`/api/admin/configurations?${params.toString()}`)
      if (res.status === 401) {
        router.push('/admin')
        return
      }
      if (!res.ok) throw new Error('Failed to fetch')

      const data: { configurations: ConfigRow[]; total: number } = await res.json()
      setConfigs(data.configurations)
      setTotal(data.total)
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [productFilter, statusFilter, search, page, router])

  useEffect(() => {
    fetchConfigs()
  }, [fetchConfigs])

  const handleFilterReset = () => {
    setProductFilter('')
    setStatusFilter('')
    setSearch('')
    setPage(1)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="px-6 py-6 lg:px-10 lg:py-8">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-ink">Configurations</h1>
        <p className="mt-1 text-[13px] text-muted">
          Browse and manage all saved configurations
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* Product dropdown */}
        <div className="relative">
          <select
            value={productFilter}
            onChange={(e) => {
              setProductFilter(e.target.value)
              setPage(1)
            }}
            className="appearance-none rounded-lg border border-border bg-white py-2 pl-3 pr-8 text-[12px] font-semibold text-ink outline-none transition-colors focus:border-blue"
          >
            {PRODUCT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted pointer-events-none" />
        </div>

        {/* Status dropdown */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="appearance-none rounded-lg border border-border bg-white py-2 pl-3 pr-8 text-[12px] font-semibold text-ink outline-none transition-colors focus:border-blue"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted pointer-events-none" />
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by product code..."
            className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-4 text-[13px] text-ink outline-none transition-colors focus:border-blue"
          />
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg border border-border bg-white">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex h-9 w-9 items-center justify-center rounded-l-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-navy text-white'
                : 'text-muted hover:bg-light'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex h-9 w-9 items-center justify-center rounded-r-lg border-l border-border transition-colors ${
              viewMode === 'list'
                ? 'bg-navy text-white'
                : 'text-muted hover:bg-light'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Results summary */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-muted">
          {total > 0
            ? `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} of ${total} configurations`
            : 'No configurations found'}
        </span>
        {(productFilter || statusFilter || search) && (
          <button
            type="button"
            onClick={handleFilterReset}
            className="text-[12px] font-semibold text-blue transition-colors hover:text-navy"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-border bg-white py-16">
          <div className="text-center">
            <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-navy border-t-transparent" />
            <p className="text-[12px] font-semibold text-muted">Loading...</p>
          </div>
        </div>
      ) : configs.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <div className="text-[14px] font-semibold text-muted">
            No configurations found
          </div>
          <div className="mt-1 text-[12px] text-muted/70">
            Try adjusting your filters or search terms.
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid view */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {configs.map((config) => (
            <ConfigurationCard
              key={config.id}
              config={config}
              onClick={() => setSelectedConfigId(config.id)}
            />
          ))}
        </div>
      ) : (
        /* List view */
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-border bg-light">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Date
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Product
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Code
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Status
                  </th>
                  <th className="hidden px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted md:table-cell">
                    Step
                  </th>
                </tr>
              </thead>
              <tbody>
                {configs.map((config, index) => (
                  <tr
                    key={config.id}
                    onClick={() => setSelectedConfigId(config.id)}
                    className={`cursor-pointer border-b border-border/50 transition-colors hover:bg-blue/5 ${
                      index % 2 === 1 ? 'bg-light/50' : 'bg-white'
                    }`}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-muted">
                      {formatDate(config.created_at)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink capitalize">
                      {PRODUCT_LABELS[config.product] || config.product}
                    </td>
                    <td className="px-4 py-3">
                      {config.product_code ? (
                        <span className="rounded bg-navy/8 px-2 py-0.5 font-mono text-[11px] font-bold text-navy">
                          {config.product_code}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={config.status} />
                    </td>
                    <td className="hidden px-4 py-3 text-muted md:table-cell">
                      {config.wizard_step ?? '-'}
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
            onPageChange={(p) => {
              setPage(p)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        </div>
      )}

      {/* Detail panel */}
      {selectedConfigId && (
        <ConfigurationDetail
          configId={selectedConfigId}
          onClose={() => setSelectedConfigId(null)}
        />
      )}
    </div>
  )
}
