'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface StatusData {
  product: string | null
  product_code: string | null
  quote_ref: string | null
  status: string
  created_at: string
  updated_at: string
  quote_status: string | null
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    quoted: 'Quote Issued',
    archived: 'Archived',
    new: 'Received',
    reviewed: 'Under Review',
    closed: 'Closed',
    sent: 'Quote Sent',
    viewed: 'Quote Viewed',
    accepted: 'Quote Accepted',
    expired: 'Quote Expired',
    declined: 'Quote Declined',
  }
  return labels[status] || status
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-600'
    case 'submitted':
    case 'new':
      return 'bg-blue/10 text-blue'
    case 'reviewed':
    case 'viewed':
      return 'bg-yellow-50 text-yellow-700'
    case 'quoted':
    case 'sent':
      return 'bg-green/10 text-green-d'
    case 'accepted':
      return 'bg-green/20 text-green-d'
    case 'closed':
    case 'archived':
    case 'expired':
    case 'declined':
      return 'bg-gray-100 text-gray-500'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

function getProductLabel(product: string | null): string {
  const labels: Record<string, string> = {
    chamber: 'Inspection Chamber',
    catchpit: 'Catchpit / Silt Trap',
    rhinoceptor: 'RhinoCeptor',
    'flow-control': 'Flow Control',
    'pump-station': 'Pump Station',
    'grease-trap': 'Grease Trap',
    'grease-separator': 'Grease Separator',
    rhinopod: 'RhinoPod',
    rainwater: 'Rainwater Harvesting',
    'septic-tank': 'Septic Tank',
    drawpit: 'Drawpit',
  }
  return product ? labels[product] || product : 'Unknown'
}

export default function StatusPage() {
  const [refInput, setRefInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<StatusData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = refInput.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`/api/status/${encodeURIComponent(trimmed)}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(
          (body as { error?: string }).error || 'Configuration not found'
        )
      }
      const data: StatusData = await res.json()
      setResult(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-light">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-14 max-w-xl items-center gap-3 px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logos/suds/icon-main.png"
              alt="SuDS Enviro"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="text-sm font-bold text-navy">SuDS Enviro</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>

        <h1 className="text-xl font-extrabold text-ink mb-1">
          Check Your Configuration Status
        </h1>
        <p className="text-sm text-muted mb-6">
          Enter the reference number you received when you submitted your
          enquiry to view the current status.
        </p>

        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={refInput}
                onChange={(e) => setRefInput(e.target.value)}
                placeholder="e.g. SE-Q-2026-A1B2"
                className="w-full rounded-lg border border-border bg-white py-3 pl-10 pr-4 text-sm text-ink outline-none transition-colors focus:border-blue"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !refInput.trim()}
              className="rounded-lg bg-navy px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-navy/90 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Status'}
            </button>
          </div>
        </form>

        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-xl border border-border bg-white p-5 shadow-[0_2px_12px_rgba(0,77,112,0.10)]">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted">
                  Reference
                </div>
                <div className="text-lg font-extrabold text-navy">
                  {result.quote_ref}
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold ${getStatusColor(result.status)}`}
              >
                {getStatusLabel(result.status)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <span className="text-xs font-semibold text-muted">
                  Product
                </span>
                <span className="text-sm font-bold text-ink">
                  {getProductLabel(result.product)}
                </span>
              </div>

              {result.product_code && (
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <span className="text-xs font-semibold text-muted">
                    Product Code
                  </span>
                  <span className="text-sm font-bold text-navy">
                    {result.product_code}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <span className="text-xs font-semibold text-muted">
                  Created
                </span>
                <span className="text-sm text-ink">
                  {formatDate(result.created_at)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <span className="text-xs font-semibold text-muted">
                  Last Updated
                </span>
                <span className="text-sm text-ink">
                  {formatDate(result.updated_at)}
                </span>
              </div>

              {result.quote_status && (
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-muted">
                    Quote Status
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold ${getStatusColor(result.quote_status)}`}
                  >
                    {getStatusLabel(result.quote_status)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 rounded-lg bg-light p-3 text-center text-[11px] text-muted">
              If you have questions about your configuration, contact us at{' '}
              <a
                href="mailto:hello@sudsenviro.com"
                className="font-semibold text-blue hover:underline"
              >
                hello@sudsenviro.com
              </a>{' '}
              or call{' '}
              <a
                href="tel:01224057700"
                className="font-semibold text-blue hover:underline"
              >
                01224 057 700
              </a>
              .
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
