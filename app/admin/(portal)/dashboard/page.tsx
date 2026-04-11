'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ExternalLink,
  Download,
  Inbox,
  ArrowRight,
  Plus,
} from 'lucide-react'
import { StatsCards } from '@/components/admin/StatsCards'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ActivityFeed } from '@/components/admin/ActivityFeed'
import type { ActivityEntry } from '@/components/admin/ActivityFeed'

interface StatsData {
  total_configurations: number
  total_enquiries: number
  enquiries_by_status: { status: string; count: number }[]
  configs_by_product: { product: string; count: number }[]
}

interface RecentEnquiry {
  id: string
  created_at: string
  name: string
  product_code: string | null
  status: string
}

interface RecentConfig {
  id: string
  created_at: string
  product: string | null
  product_code: string | null
  status: string
}

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

const PRODUCT_COLORS: Record<string, string> = {
  chamber: 'bg-navy',
  catchpit: 'bg-blue',
  rhinoceptor: 'bg-green',
  'flow-control': 'bg-amber-500',
  'pump-station': 'bg-purple-500',
  'grease-trap': 'bg-rose-500',
  'grease-separator': 'bg-orange-500',
  rhinopod: 'bg-teal-500',
  rainwater: 'bg-sky-500',
  'septic-tank': 'bg-slate-500',
  drawpit: 'bg-indigo-500',
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

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  })
}

export default function DashboardPage() {
  const router = useRouter()

  const [stats, setStats] = useState<StatsData | null>(null)
  const [recentEnquiries, setRecentEnquiries] = useState<RecentEnquiry[]>([])
  const [recentConfigs, setRecentConfigs] = useState<RecentConfig[]>([])
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [statsRes, enquiriesRes, configsRes, activityRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/enquiries?limit=5'),
        fetch('/api/admin/configurations?limit=5'),
        fetch('/api/admin/activity?limit=8').catch(() => null),
      ])

      if (statsRes.status === 401) {
        router.push('/admin')
        return
      }

      if (!statsRes.ok || !enquiriesRes.ok || !configsRes.ok) {
        throw new Error('Failed to load dashboard data')
      }

      const statsData: StatsData = await statsRes.json()
      const enquiriesData: { enquiries: RecentEnquiry[] } = await enquiriesRes.json()
      const configsData: { configurations: RecentConfig[] } = await configsRes.json()

      let activityData: ActivityEntry[] = []
      if (activityRes && activityRes.ok) {
        const parsed: { activities: ActivityEntry[] } = await activityRes.json()
        activityData = parsed.activities || []
      }

      setStats(statsData)
      setRecentEnquiries(enquiriesData.enquiries)
      setRecentConfigs(configsData.configurations)
      setActivities(activityData)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
          <p className="text-[13px] font-semibold text-muted">
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-[14px] font-bold text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              setError(null)
              loadData()
            }}
            className="mt-4 rounded-lg bg-navy px-6 py-2 text-[13px] font-bold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Find max count for product bar chart scaling
  const maxProductCount = stats?.configs_by_product.reduce(
    (max, item) => Math.max(max, item.count),
    0
  ) ?? 1

  return (
    <div className="px-6 py-6 lg:px-10 lg:py-8">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-ink">Dashboard</h1>
        <p className="mt-1 text-[13px] text-muted">
          Overview of your configurator activity
        </p>
      </div>

      {/* Stats cards */}
      {stats && (
        <section className="mb-8">
          <StatsCards stats={stats} />
        </section>
      )}

      {/* Product breakdown */}
      {stats && stats.configs_by_product.length > 0 && (
        <section className="mb-8">
          <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-[13px] font-extrabold uppercase tracking-wider text-ink">
              Configurations by Product
            </h2>
            <div className="space-y-3">
              {stats.configs_by_product.map((item) => {
                const widthPct = maxProductCount > 0
                  ? Math.max((item.count / maxProductCount) * 100, 4)
                  : 4
                const bgClass = PRODUCT_COLORS[item.product] || 'bg-muted'
                return (
                  <div key={item.product} className="flex items-center gap-3">
                    <span className="w-36 shrink-0 text-[12px] font-semibold text-ink capitalize">
                      {PRODUCT_LABELS[item.product] || item.product}
                    </span>
                    <div className="flex-1">
                      <div
                        className={`h-5 rounded ${bgClass} transition-all duration-300`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-[13px] font-bold text-ink">
                      {item.count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Two-column grid: recent enquiries + recent configs */}
      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Enquiries */}
        <div className="rounded-xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-[14px] font-extrabold text-ink">
              Recent Enquiries
            </h2>
            <Link
              href="/admin/enquiries"
              className="flex items-center gap-1 text-[12px] font-semibold text-blue transition-colors hover:text-navy"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {recentEnquiries.length === 0 ? (
              <div className="px-5 py-8 text-center text-[13px] text-muted">
                No enquiries yet
              </div>
            ) : (
              recentEnquiries.map((enquiry) => (
                <div
                  key={enquiry.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-ink">
                      {enquiry.name}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted">
                      {enquiry.product_code || 'No code'} - {formatRelativeTime(enquiry.created_at)}
                    </div>
                  </div>
                  <StatusBadge status={enquiry.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Configurations */}
        <div className="rounded-xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-[14px] font-extrabold text-ink">
              Recent Configurations
            </h2>
            <Link
              href="/admin/configurations"
              className="flex items-center gap-1 text-[12px] font-semibold text-blue transition-colors hover:text-navy"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {recentConfigs.length === 0 ? (
              <div className="px-5 py-8 text-center text-[13px] text-muted">
                No configurations yet
              </div>
            ) : (
              recentConfigs.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-ink capitalize">
                      {PRODUCT_LABELS[config.product || ''] || config.product || 'Unknown'}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted">
                      {config.product_code || 'No code'} - {formatRelativeTime(config.created_at)}
                    </div>
                  </div>
                  <StatusBadge status={config.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Activity feed */}
      {activities.length > 0 && (
        <section className="mb-8">
          <div className="rounded-xl border border-border bg-white shadow-sm">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-extrabold text-ink">
                Recent Activity
              </h2>
            </div>
            <div className="px-5 py-4">
              <ActivityFeed activities={activities} limit={8} />
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-[13px] font-extrabold uppercase tracking-wider text-ink">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/configurator"
              className="flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-[#003a55]"
            >
              <Plus className="h-4 w-4" />
              New Configuration
            </Link>
            <Link
              href="/api/admin/enquiries/export"
              className="flex items-center gap-2 rounded-lg border border-border bg-white px-5 py-2.5 text-[13px] font-bold text-ink shadow-sm transition-colors hover:bg-light"
            >
              <Download className="h-4 w-4" />
              Export Enquiries
            </Link>
            <Link
              href="/admin/enquiries"
              className="flex items-center gap-2 rounded-lg border border-border bg-white px-5 py-2.5 text-[13px] font-bold text-ink shadow-sm transition-colors hover:bg-light"
            >
              <Inbox className="h-4 w-4" />
              View All Enquiries
            </Link>
            <Link
              href="/admin/configurations"
              className="flex items-center gap-2 rounded-lg border border-border bg-white px-5 py-2.5 text-[13px] font-bold text-ink shadow-sm transition-colors hover:bg-light"
            >
              <ExternalLink className="h-4 w-4" />
              View All Configurations
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
