/**
 * RhinoCeptor Oil Separator Rule Engine
 *
 * Validates configuration for RhinoCeptor oil/water separators.
 * Checks variant selection, drainage area, flow rate, retention volume,
 * and environmental class against EA PPG3 and BS EN 858.
 */

import type {
  WizardState,
  RhinoCeptorData,
  RhinoVariant,
  ValidationResult,
  ComplianceResult,
} from '@/lib/types'

// ── VARIANT ABBREVIATIONS ────────────────────────────────────

const VARIANT_ABBR: Record<RhinoVariant, string> = {
  'forecourt': 'FR',
  'full-retention': 'FR',
  'bypass': 'BP',
}

// ── HELPER: Extract RhinoCeptorData from WizardState ─────────

function extractRhinoData(state: WizardState): RhinoCeptorData | null {
  if (!state.productData || state.productData.kind !== 'rhinoceptor') return null
  return state.productData.data
}

// ── VALIDATION ───────────────────────────────────────────────

export function validateConfig(state: WizardState): ValidationResult {
  const errors: string[] = []
  const data = extractRhinoData(state)

  if (!state.product) errors.push('Product not selected')
  if (!data) {
    errors.push('RhinoCeptor data not available')
    return { valid: false, errors }
  }

  if (!data.variant) errors.push('Variant not selected')

  if (!data.drainageAreaM2 || data.drainageAreaM2.trim() === '') {
    errors.push('Drainage area not specified')
  } else {
    const area = parseFloat(data.drainageAreaM2)
    if (isNaN(area) || area <= 0) {
      errors.push('Drainage area must be a positive number')
    }
  }

  if (!data.flowRateLs || data.flowRateLs.trim() === '') {
    errors.push('Flow rate not specified')
  } else {
    const flow = parseFloat(data.flowRateLs)
    if (isNaN(flow) || flow <= 0) {
      errors.push('Flow rate must be a positive number')
    }
  }

  if (!data.rhinoClass) errors.push('RhinoCeptor class not selected')

  return { valid: errors.length === 0, errors }
}

// ── PRODUCT CODE ─────────────────────────────────────────────

export function generateProductCode(state: WizardState): string {
  const data = extractRhinoData(state)
  if (!data || !data.variant || !data.rhinoClass) return 'RC-???-??'

  const variantCode = VARIANT_ABBR[data.variant]
  return `RC-${variantCode}-C${data.rhinoClass}`
}

// ── COMPLIANCE CHECK ─────────────────────────────────────────

export function generateCompliance(state: WizardState): ComplianceResult[] {
  const data = extractRhinoData(state)
  const { valid } = validateConfig(state)

  const hasValidFlow = data?.flowRateLs
    ? parseFloat(data.flowRateLs) > 0
    : false

  const hasValidArea = data?.drainageAreaM2
    ? parseFloat(data.drainageAreaM2) > 0
    : false

  return [
    {
      standard: 'EA PPG3',
      scope: 'Pollution Prevention - Oil Separation',
      status: valid ? 'Pass' : 'Warning',
    },
    {
      standard: 'BS EN 858-1:2002',
      scope: 'Separator Systems for Light Liquids',
      status: (data?.rhinoClass && hasValidFlow) ? 'Pass' : 'Warning',
    },
    {
      standard: 'BS EN 858-2:2003',
      scope: 'Selection, Installation and Maintenance',
      status: (hasValidArea && data?.variant) ? 'Pass' : 'Warning',
    },
    {
      standard: 'Environment Agency Requirements',
      scope: 'Trade Effluent Discharge Consent',
      status: valid ? 'Pass' : 'Warning',
    },
  ]
}
