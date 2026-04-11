'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, ExternalLink, Inbox } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

interface ConfigurationDetailProps {
  configId: string
  onClose: () => void
}

interface ConfigData {
  id: string
  product: string
  product_code: string | null
  product_data: Record<string, unknown> | null
  status: string
  created_at: string
  wizard_step: number | null
  session_id: string | null
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

function flattenProductData(data: Record<string, unknown>): { label: string; value: string }[] {
  const inner = (data as { data?: Record<string, unknown> }).data || data
  const fields: { label: string; value: string }[] = []

  const labelMap: Record<string, string> = {
    systemType: 'System Type',
    diameter: 'Diameter',
    inletCount: 'Inlet Count',
    positions: 'Clock Positions',
    pipeSizes: 'Pipe Sizes',
    outletLocked: 'Outlet Size',
    flowControl: 'Flow Control',
    flowType: 'Flow Type',
    flowRate: 'Flow Rate',
    depth: 'Depth',
    adoptable: 'Adoptable',
    variant: 'Variant',
    model: 'Model',
    application: 'Application',
    drainageAreaM2: 'Drainage Area (m2)',
    flowRateLs: 'Flow Rate (L/s)',
    retentionVolumeLitres: 'Retention Volume (L)',
    rhinoClass: 'Class',
    headDepthMm: 'Head Depth (mm)',
    dischargeRateLs: 'Discharge Rate (L/s)',
    chamberDiameter: 'Chamber Diameter',
    pumpCount: 'Pump Count',
    pipeSizeOutlet: 'Outlet Pipe Size',
    controllerType: 'Controller Type',
    wetWellDiameter: 'Wet Well Diameter',
    connectionInlet: 'Inlet Connection',
    connectionOutlet: 'Outlet Connection',
    peakCoversPerDay: 'Peak Covers/Day',
    podType: 'Pod Type',
    retrofitExisting: 'Retrofit Existing',
    roofAreaM2: 'Roof Area (m2)',
    capacityLitres: 'Capacity (L)',
    annualRainfallMm: 'Annual Rainfall (mm)',
    treatmentLevel: 'Treatment Level',
    populationEquivalent: 'Population Equivalent',
    dailyFlowLitres: 'Daily Flow (L)',
    dischargePoint: 'Discharge Point',
    lengthMm: 'Length (mm)',
    widthMm: 'Width (mm)',
    depthMm: 'Depth (mm)',
    ringCount: 'Ring Count',
    loadRating: 'Load Rating',
    coverType: 'Cover Type',
    baffleType: 'Baffle Type',
    grateType: 'Grate Type',
    totalHeadM: 'Total Head (m)',
  }

  for (const [key, val] of Object.entries(inner)) {
    if (val === null || val === undefined || val === '') continue
    if (key === 'kind') continue

    const label = labelMap[key] || key

    if (typeof val === 'boolean') {
      fields.push({ label, value: val ? 'Yes' : 'No' })
    } else if (Array.isArray(val)) {
      fields.push({ label, value: val.join(', ') || 'None' })
    } else if (typeof val === 'object') {
      const entries = Object.entries(val as Record<string, unknown>)
      const summary = entries
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')
      if (summary) fields.push({ label, value: summary })
    } else {
      let display = String(val)
      if (key === 'diameter' || key === 'depth' || key === 'chamberDiameter' || key === 'wetWellDiameter') {
        display = `${val}mm`
      }
      fields.push({ label, value: display })
    }
  }

  return fields
}

export function ConfigurationDetail({ configId, onClose }: ConfigurationDetailProps) {
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetch(`/api/admin/configurations/${configId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then((data: ConfigData) => {
        if (!cancelled) {
          setConfig(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [configId])

  const productFields = config?.product_data
    ? flattenProductData(config.product_data)
    : []

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-light px-6 py-4">
          <div>
            <h2 className="text-[15px] font-extrabold text-ink">
              Configuration Detail
            </h2>
            {config && (
              <p className="mt-0.5 text-[11px] text-muted">
                {formatDateTime(config.created_at)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-muted transition-colors hover:bg-light"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-navy border-t-transparent" />
            </div>
          )}

          {!loading && !config && (
            <div className="py-12 text-center text-[13px] text-muted">
              Configuration not found
            </div>
          )}

          {config && (
            <>
              {/* Product info header */}
              <section className="mb-6">
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                  Product
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[12px] font-semibold text-muted">Type</span>
                    <span className="text-[13px] font-semibold text-ink capitalize">
                      {PRODUCT_LABELS[config.product] || config.product}
                    </span>
                  </div>
                  {config.product_code && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-[12px] font-semibold text-muted">Code</span>
                      <span className="rounded bg-navy/8 px-2 py-0.5 font-mono text-[11px] font-bold text-navy">
                        {config.product_code}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[12px] font-semibold text-muted">Status</span>
                    <StatusBadge status={config.status} />
                  </div>
                  {config.wizard_step !== null && config.wizard_step !== undefined && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-[12px] font-semibold text-muted">Wizard Step</span>
                      <span className="text-[13px] font-semibold text-ink">
                        {config.wizard_step}
                      </span>
                    </div>
                  )}
                </div>
              </section>

              {/* Product data fields */}
              {productFields.length > 0 && (
                <section className="mb-6">
                  <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Configuration Data
                  </h3>
                  <div className="rounded-lg border border-border bg-light/70 p-3">
                    <div className="space-y-2">
                      {productFields.map((field) => (
                        <div
                          key={field.label}
                          className="flex items-start justify-between gap-4"
                        >
                          <span className="text-[11px] font-semibold text-muted">
                            {field.label}
                          </span>
                          <span className="text-right text-[11px] font-bold text-ink">
                            {field.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Action links */}
              <section className="space-y-3">
                <Link
                  href={`/configurator/${config.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white py-2.5 text-[12px] font-bold text-navy transition-colors hover:bg-light"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open in Configurator
                </Link>
                <Link
                  href={`/admin/enquiries?search=${config.product_code || config.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white py-2.5 text-[12px] font-bold text-navy transition-colors hover:bg-light"
                >
                  <Inbox className="h-3.5 w-3.5" />
                  View Linked Enquiries
                </Link>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  )
}
