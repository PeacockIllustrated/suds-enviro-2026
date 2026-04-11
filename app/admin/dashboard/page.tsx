'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { StatsCards } from '@/components/admin/StatsCards'
import { EnquiryTable } from '@/components/admin/EnquiryTable'
import { EnquiryDetailPanel } from '@/components/admin/EnquiryDetailPanel'
import type { EnquiryRow } from '@/components/admin/EnquiryTable'

interface StatsData {
  total_configurations: number
  total_enquiries: number
  enquiries_by_status: { status: string; count: number }[]
  configs_by_product: { product: string; count: number }[]
}

export default function AdminDashboardPage() {
  const router = useRouter()

  const [stats, setStats] = useState<StatsData | null>(null)
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([])
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Auth check + load initial data
  const loadData = useCallback(async () => {
    try {
      const [statsRes, enquiriesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/enquiries'),
      ])

      // If either returns 401, redirect to login
      if (statsRes.status === 401 || enquiriesRes.status === 401) {
        router.push('/admin')
        return
      }

      if (!statsRes.ok || !enquiriesRes.ok) {
        throw new Error('Failed to load dashboard data')
      }

      const statsData: StatsData = await statsRes.json()
      const enquiriesData: { enquiries: EnquiryRow[]; total: number } = await enquiriesRes.json()

      setStats(statsData)
      setEnquiries(enquiriesData.enquiries)
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

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (response.status === 401) {
        router.push('/admin')
        return
      }

      if (!response.ok) {
        console.warn('Failed to update enquiry status')
        return
      }

      // Update local state
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status } : e))
      )

      // Refresh stats
      const statsRes = await fetch('/api/admin/stats')
      if (statsRes.ok) {
        const newStats: StatsData = await statsRes.json()
        setStats(newStats)
      }
    } catch {
      console.warn('Failed to update enquiry status')
    }
  }

  const handleNotesChange = async (id: string, notes: string) => {
    try {
      const response = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: notes }),
      })

      if (response.status === 401) {
        router.push('/admin')
        return
      }

      if (!response.ok) {
        console.warn('Failed to update admin notes')
        return
      }

      // Update local state
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, admin_notes: notes } : e))
      )
    } catch {
      console.warn('Failed to update admin notes')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col bg-light">
        <AdminHeader />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
            <p className="text-[13px] font-semibold text-muted">
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-dvh flex-col bg-light">
        <AdminHeader />
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
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-light">
      <AdminHeader />

      <main className="flex-1 px-6 py-6 lg:px-10 lg:py-8">
        {/* Stats */}
        {stats && (
          <section className="mb-8">
            <StatsCards stats={stats} />
          </section>
        )}

        {/* Enquiries table */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-extrabold text-ink">
              Enquiries
            </h2>
            <span className="text-[12px] font-semibold text-muted">
              {enquiries.length} result{enquiries.length !== 1 ? 's' : ''}
            </span>
          </div>

          <EnquiryTable
            enquiries={enquiries}
            onSelect={setSelectedEnquiry}
            onStatusChange={handleStatusChange}
          />
        </section>
      </main>

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
