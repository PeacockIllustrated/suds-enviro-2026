'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Copy, Check } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import type { EnquiryRow } from './EnquiryTable'

interface EnquiryDetail extends EnquiryRow {
  phone?: string | null
  notes?: string | null
  configuration?: {
    id?: string
    product?: string
    product_code?: string
    product_data?: Record<string, unknown>
    wizard_step?: number
    status?: string
    created_at?: string
  } | null
}

interface EnquiryDetailPanelProps {
  enquiry: EnquiryDetail
  onClose: () => void
  onStatusChange: (id: string, status: string) => void
  onNotesChange: (id: string, notes: string) => void
}

const STATUS_OPTIONS = ['new', 'reviewed', 'quoted', 'closed']

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function EnquiryDetailPanel({
  enquiry,
  onClose,
  onStatusChange,
  onNotesChange,
}: EnquiryDetailPanelProps) {
  const [adminNotes, setAdminNotes] = useState(enquiry.admin_notes || '')
  const [copied, setCopied] = useState(false)
  const [detail, setDetail] = useState<EnquiryDetail>(enquiry)
  const [loading, setLoading] = useState(false)
  const notesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch full detail (including configuration) when panel opens
  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetch(`/api/admin/enquiries/${enquiry.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch detail')
        return res.json()
      })
      .then((data: EnquiryDetail) => {
        if (!cancelled) {
          setDetail(data)
          setAdminNotes(data.admin_notes || '')
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [enquiry.id])

  const handleNotesBlur = () => {
    if (adminNotes !== (detail.admin_notes || '')) {
      onNotesChange(detail.id, adminNotes)
    }
  }

  const handleNotesDebouncedChange = (value: string) => {
    setAdminNotes(value)
    if (notesTimerRef.current) clearTimeout(notesTimerRef.current)
    notesTimerRef.current = setTimeout(() => {
      onNotesChange(detail.id, value)
    }, 1500)
  }

  const handleCopy = () => {
    const config = detail.configuration
    const lines = [
      `Enquiry: ${detail.name}`,
      `Email: ${detail.email}`,
      detail.company ? `Company: ${detail.company}` : null,
      detail.phone ? `Phone: ${detail.phone}` : null,
      config?.product_code ? `Product Code: ${config.product_code}` : null,
      config?.product ? `Product: ${config.product}` : null,
      detail.notes ? `Notes: ${detail.notes}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const config = detail.configuration

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl transition-transform">
        {/* Panel header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-light px-6 py-4">
          <div>
            <h2 className="text-[15px] font-extrabold text-ink">
              Enquiry Detail
            </h2>
            <p className="mt-0.5 text-[11px] text-muted">
              {formatDateTime(detail.created_at)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-muted transition-colors hover:bg-light"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Panel body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="mb-4 text-[12px] text-muted">Loading details...</div>
          )}

          {/* Contact info */}
          <section className="mb-6">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted">
              Contact Information
            </h3>
            <div className="space-y-2">
              <DetailRow label="Name" value={detail.name} />
              <DetailRow label="Email" value={detail.email} />
              <DetailRow label="Company" value={detail.company || '-'} />
              <DetailRow label="Phone" value={detail.phone || '-'} />
            </div>
          </section>

          {/* Customer notes */}
          {detail.notes && (
            <section className="mb-6">
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                Customer Notes
              </h3>
              <div className="rounded-lg border border-border bg-light/70 px-3.5 py-2.5 text-[13px] text-ink">
                {detail.notes}
              </div>
            </section>
          )}

          {/* Configuration summary */}
          {config && (
            <section className="mb-6">
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                Configuration
              </h3>
              <div className="space-y-2">
                {config.product && (
                  <DetailRow label="Product" value={config.product} />
                )}
                {config.product_code && (
                  <DetailRow label="Product Code" value={config.product_code} highlight />
                )}
                {config.status && (
                  <DetailRow label="Config Status" value={config.status} />
                )}
                {config.product_data && (
                  <ProductDataSummary data={config.product_data} />
                )}
              </div>
            </section>
          )}

          {/* Status */}
          <section className="mb-6">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted">
              Status
            </h3>
            <div className="flex items-center gap-3">
              <StatusBadge status={detail.status} />
              <select
                value={detail.status}
                onChange={(e) => {
                  onStatusChange(detail.id, e.target.value)
                  setDetail({ ...detail, status: e.target.value })
                }}
                className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-semibold text-ink outline-none transition-colors focus:border-blue"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Admin notes */}
          <section className="mb-6">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted">
              Admin Notes
            </h3>
            <textarea
              value={adminNotes}
              onChange={(e) => handleNotesDebouncedChange(e.target.value)}
              onBlur={handleNotesBlur}
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-white px-3.5 py-2.5 text-[13px] text-ink outline-none transition-colors focus:border-blue"
              placeholder="Internal notes about this enquiry..."
            />
          </section>

          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-light py-2.5 text-[12px] font-bold text-navy transition-colors hover:bg-border/50"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green" />
                Copied to Clipboard
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy Configuration
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}

// ── HELPERS ──────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-[12px] font-semibold text-muted">
        {label}
      </span>
      <span
        className={`text-right text-[13px] font-semibold ${
          highlight
            ? 'rounded bg-navy/8 px-2 py-0.5 font-mono text-navy'
            : 'text-ink'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

function ProductDataSummary({ data }: { data: Record<string, unknown> }) {
  // Extract key fields from product_data for display
  const kindData = data as { kind?: string; data?: Record<string, unknown> }
  const inner = kindData.data || data

  const displayFields: { label: string; value: string }[] = []

  const fieldMap: Record<string, string> = {
    systemType: 'System Type',
    diameter: 'Diameter',
    depth: 'Depth',
    inletCount: 'Inlets',
    adoptable: 'Adoptable',
    flowControl: 'Flow Control',
    variant: 'Variant',
    model: 'Model',
    application: 'Application',
    podType: 'Pod Type',
    treatmentLevel: 'Treatment',
  }

  for (const [key, label] of Object.entries(fieldMap)) {
    const val = inner[key]
    if (val !== null && val !== undefined && val !== '') {
      let display = String(val)
      if (typeof val === 'boolean') display = val ? 'Yes' : 'No'
      if (key === 'diameter' || key === 'depth') display = `${val}mm`
      displayFields.push({ label, value: display })
    }
  }

  if (displayFields.length === 0) return null

  return (
    <div className="mt-2 rounded-lg border border-border bg-light/70 p-3">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {displayFields.map((field) => (
          <div key={field.label} className="flex justify-between gap-2">
            <span className="text-[11px] text-muted">{field.label}</span>
            <span className="text-[11px] font-bold text-ink">{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
