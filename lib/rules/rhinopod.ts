/**
 * RhinoPod Rule Engine
 *
 * Validates configuration for RhinoPod filtration units.
 * Two variants exist:
 *   - Standalone: independent unit, may be a retrofit to an existing chamber
 *   - Plus: integrated with a new SuDS Enviro chamber (requires diameter)
 *
 * Compliance checked against the EU Water Framework Directive.
 */

import type {
  WizardState,
  RhinoPodData,
  ValidationResult,
  ComplianceResult,
} from '@/lib/types'

// ── HELPER: Extract RhinoPodData from WizardState ────────────

function extractRhinoPodData(state: WizardState): RhinoPodData | null {
  if (!state.productData || state.productData.kind !== 'rhinopod') return null
  return state.productData.data
}

// ── VALIDATION ───────────────────────────────────────────────

export function validateConfig(state: WizardState): ValidationResult {
  const errors: string[] = []
  const data = extractRhinoPodData(state)

  if (!state.product) errors.push('Product not selected')
  if (!data) {
    errors.push('RhinoPod data not available')
    return { valid: false, errors }
  }

  if (!data.podType) {
    errors.push('Pod type not selected')
    return { valid: false, errors }
  }

  if (data.podType === 'plus') {
    if (!data.chamberDiameter) {
      errors.push('Chamber diameter not selected for RhinoPod Plus')
    }
  }

  if (data.podType === 'standalone') {
    if (data.retrofitExisting === null) {
      errors.push('Retrofit status not specified for standalone RhinoPod')
    }
  }

  return { valid: errors.length === 0, errors }
}

// ── PRODUCT CODE ─────────────────────────────────────────────

export function generateProductCode(state: WizardState): string {
  const data = extractRhinoPodData(state)
  if (!data || !data.podType) return 'RP-???'

  if (data.podType === 'plus') {
    if (!data.chamberDiameter) return 'RP-PLUS-???'
    return `RP-PLUS-${data.chamberDiameter}`
  }

  return `RP-${data.podType.toUpperCase()}`
}

// ── COMPLIANCE CHECK ─────────────────────────────────────────

export function generateCompliance(state: WizardState): ComplianceResult[] {
  const data = extractRhinoPodData(state)
  const { valid } = validateConfig(state)

  return [
    {
      standard: 'EU Water Framework Directive (2000/60/EC)',
      scope: 'Water Quality - Pollutant Filtration',
      status: valid ? 'Pass' : 'Warning',
    },
    {
      standard: 'Environment Agency PPG3',
      scope: 'Pollution Prevention - Surface Water Runoff',
      status: data?.podType ? 'Pass' : 'Warning',
    },
    {
      standard: 'SuDS Design Guidance',
      scope: 'Treatment Train - Source Control',
      status: valid ? 'Pass' : 'Warning',
    },
  ]
}
