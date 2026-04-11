'use client'

import { Search, ChevronDown } from 'lucide-react'

export interface FilterState {
  status: string
  search: string
  product: string
  sort: string
  order: string
}

interface FilterBarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  showProductFilter?: boolean
  showSort?: boolean
}

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'closed', label: 'Closed' },
]

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

const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Newest' },
  { value: 'created_at:asc', label: 'Oldest' },
  { value: 'name:asc', label: 'Name A-Z' },
  { value: 'name:desc', label: 'Name Z-A' },
]

export function FilterBar({
  filters,
  onFilterChange,
  showProductFilter = true,
  showSort = true,
}: FilterBarProps) {
  const setFilter = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const handleSortChange = (combined: string) => {
    const [sort, order] = combined.split(':')
    onFilterChange({ ...filters, sort, order })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status toggle pills */}
      <div className="flex flex-wrap gap-1">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter('status', opt.value)}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-colors ${
              filters.status === opt.value
                ? 'bg-navy text-white'
                : 'bg-white text-muted border border-border hover:bg-light'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Search input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/50" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          placeholder="Search by name, email, or code..."
          className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-4 text-[13px] text-ink outline-none transition-colors focus:border-blue"
        />
      </div>

      {/* Product dropdown */}
      {showProductFilter && (
        <div className="relative">
          <select
            value={filters.product}
            onChange={(e) => setFilter('product', e.target.value)}
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
      )}

      {/* Sort dropdown */}
      {showSort && (
        <div className="relative">
          <select
            value={`${filters.sort}:${filters.order}`}
            onChange={(e) => handleSortChange(e.target.value)}
            className="appearance-none rounded-lg border border-border bg-white py-2 pl-3 pr-8 text-[12px] font-semibold text-ink outline-none transition-colors focus:border-blue"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
      )}
    </div>
  )
}
