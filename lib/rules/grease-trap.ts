/**
 * Grease Trap Rule Engine
 *
 * Validates configuration for grease trap units. Each model has
 * fixed specifications (capacity, sludge volume, dimensions, pipe connections).
 * Compliance checked against BS EN 1825 and Building Regulations.
 */

import type {
  WizardState,
  GreaseTrapData,
  GreaseTrapModel,
  ValidationResult,
  ComplianceResult,
} from '@/lib/types'

// ── GREASE TRAP SPECIFICATIONS ───────────────────────────────

interface GreaseTrapSpec {
  coversPerDay: number
  sludgeCapacityLitres: number
  lengthMm: number
  widthMm: number
  heightMm: number
  pipeConnections: string
}

export const GREASE_TRAP_SPECS: Record<GreaseTrapModel, GreaseTrapSpec> = {
  micro: {
    coversPerDay: 150,
    sludgeCapacityLitres: 100,
    lengthMm: 830,
    widthMm: 640,
    heightMm: 630,
    pipeConnections: '60mm / 100mm',
  },
  mini: {
    coversPerDay: 300,
    sludgeCapacityLitres: 250,
    lengthMm: 1700,
    widthMm: 640,
    heightMm: 630,
    pipeConnections: '60mm / 100mm',
  },
  midi: {
    coversPerDay: 300,
    sludgeCapacityLitres: 180,
    lengthMm: 1100,
    widthMm: 720,
    heightMm: 860,
    pipeConnections: '60mm / 100mm',
  },
  jumbo: {
    coversPerDay: 600,
    sludgeCapacityLitres: 400,
    lengthMm: 2240,
    widthMm: 720,
    heightMm: 860,
    pipeConnections: '60mm / 100mm',
  },
}

// ── HELPER: Extract GreaseTrapData from WizardState ──────────

function extractGreaseTrapData(state: WizardState): GreaseTrapData | null {
  if (!state.productData || state.productData.kind !== 'grease-trap') return null
  return state.productData.data
}

// ── VALIDATION ───────────────────────────────────────────────

export function validateConfig(state: WizardState): ValidationResult {
  const errors: string[] = []
  const data = extractGreaseTrapData(state)

  if (!state.product) errors.push('Product not selected')
  if (!data) {
    errors.push('Grease trap data not available')
    return { valid: false, errors }
  }

  if (!data.model) errors.push('Grease trap model not selected')
  if (!data.connectionInlet)  errors.push('Inlet connection size not selected')
  if (!data.connectionOutlet) errors.push('Outlet connection size not selected')

  return { valid: errors.length === 0, errors }
}

// ── PRODUCT CODE ─────────────────────────────────────────────

export function generateProductCode(state: WizardState): string {
  const data = extractGreaseTrapData(state)
  if (!data || !data.model) return 'GT-???'

  return `GT-${data.model.toUpperCase()}`
}

// ── COMPLIANCE CHECK ─────────────────────────────────────────

export function generateCompliance(state: WizardState): ComplianceResult[] {
  const data = extractGreaseTrapData(state)
  const { valid } = validateConfig(state)

  const modelSelected = data?.model != null

  return [
    {
      standard: 'BS EN 1825-1:2004',
      scope: 'Grease Separators - Principles of Design',
      status: (valid && modelSelected) ? 'Pass' : 'Warning',
    },
    {
      standard: 'BS EN 1825-2:2002',
      scope: 'Grease Separators - Selection and Sizing',
      status: modelSelected ? 'Pass' : 'Warning',
    },
    {
      standard: 'Building Regulations - Approved Document H',
      scope: 'Drainage and Waste Disposal',
      status: valid ? 'Pass' : 'Warning',
    },
    {
      standard: 'Water Industry Act 1991',
      scope: 'Trade Effluent Consent',
      status: 'Pass',
    },
  ]
}
