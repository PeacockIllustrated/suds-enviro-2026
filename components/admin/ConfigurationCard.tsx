'use client'

import { Settings, Droplets, Waves, Gauge, Cylinder } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

interface ConfigCardProps {
  config: {
    id: string
    product: string
    product_code: string | null
    product_data: Record<string, unknown> | null
    status: string
    created_at: string
    wizard_step: number | null
  }
  onClick: () => void
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

function getProductIcon(product: string) {
  switch (product) {
    case 'chamber':
    case 'catchpit':
      return Cylinder
    case 'rhinoceptor':
      return Waves
    case 'flow-control':
      return Gauge
    case 'pump-station':
      return Droplets
    default:
      return Settings
  }
}

function extractKeySpecs(config: ConfigCardProps['config']): string {
  const data = config.product_data
  if (!data) return ''

  // Try to access nested data
  const inner = (data as { data?: Record<string, unknown> }).data || data

  const parts: string[] = []

  if (inner.diameter) parts.push(`${inner.diameter}mm dia`)
  if (inner.depth) parts.push(`${inner.depth}mm depth`)
  if (inner.inletCount) parts.push(`${inner.inletCount} inlet${Number(inner.inletCount) !== 1 ? 's' : ''}`)
  if (inner.systemType) parts.push(String(inner.systemType))
  if (inner.variant) parts.push(String(inner.variant))
  if (inner.model) parts.push(String(inner.model))
  if (inner.application) parts.push(String(inner.application))
  if (inner.podType) parts.push(String(inner.podType))

  return parts.join(', ')
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function ConfigurationCard({ config, onClick }: ConfigCardProps) {
  const Icon = getProductIcon(config.product)
  const label = PRODUCT_LABELS[config.product] || config.product
  const specs = extractKeySpecs(config)

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-border bg-white p-5 text-left shadow-sm transition-all hover:border-blue/40 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy/8 text-navy">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-ink capitalize">
                {label}
              </div>
              {config.product_code && (
                <span className="mt-1 inline-block rounded bg-navy/8 px-2 py-0.5 font-mono text-[11px] font-bold text-navy">
                  {config.product_code}
                </span>
              )}
            </div>
            <StatusBadge status={config.status} />
          </div>

          {specs && (
            <div className="mt-2 text-[12px] text-muted">
              {specs}
            </div>
          )}

          <div className="mt-2 text-[11px] text-muted/70">
            {formatDate(config.created_at)}
            {config.wizard_step !== null && config.wizard_step !== undefined && (
              <span> - Step {config.wizard_step}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
