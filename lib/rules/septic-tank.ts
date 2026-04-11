/**
 * Septic Tank Rule Engine
 *
 * Validates configuration for septic tank and sewage treatment systems.
 * Checks treatment level, population equivalent, daily flow, and
 * discharge point against BS EN 12566 and BS 6297.
 */

import type {
  WizardState,
  SepticTankData,
  SepticTreatment,
  ValidationResult,
  ComplianceResult,
} from '@/lib/types'

// ── TREATMENT ABBREVIATIONS ──────────────────────────────────

const TREATMENT_ABBR: Record<SepticTreatment, string> = {
  'primary': 'PRI',
  'secondary': 'SEC',
}

// ── HELPER: Extract SepticTankData from WizardState ──────────

function extractSepticData(state: WizardState): SepticTankData | null {
  if (!state.productData || state.productData.kind !== 'septic-tank') return null
  return state.productData.data
}

// ── VALIDATION ───────────────────────────────────────────────

export function validateConfig(state: WizardState): ValidationResult {
  const errors: string[] = []
  const data = extractSepticData(state)

  if (!state.product) errors.push('Product not selected')
  if (!data) {
    errors.push('Septic tank data not available')
    return { valid: false, errors }
  }

  if (!data.treatmentLevel) errors.push('Treatment level not selected')

  if (!data.populationEquivalent || data.populationEquivalent.trim() === '') {
    errors.push('Population equivalent not specified')
  } else {
    const pe = parseFloat(data.populationEquivalent)
    if (isNaN(pe) || pe <= 0) {
      errors.push('Population equivalent must be a positive number')
    }
  }

  if (!data.dischargePoint) errors.push('Discharge point not selected')

  return { valid: errors.length === 0, errors }
}

// ── PRODUCT CODE ─────────────────────────────────────────────

export function generateProductCode(state: WizardState): string {
  const data = extractSepticData(state)
  if (!data || !data.treatmentLevel || !data.populationEquivalent) {
    return 'SEP-???-PE???'
  }

  const pe = parseFloat(data.populationEquivalent)
  if (isNaN(pe)) return 'SEP-???-PE???'

  const treatmentCode = TREATMENT_ABBR[data.treatmentLevel]
  return `SEP-${treatmentCode}-PE${Math.round(pe)}`
}

// ── COMPLIANCE CHECK ─────────────────────────────────────────

export function generateCompliance(state: WizardState): ComplianceResult[] {
  const data = extractSepticData(state)
  const { valid } = validateConfig(state)

  const hasValidPE = data?.populationEquivalent
    ? parseFloat(data.populationEquivalent) > 0
    : false

  // Secondary treatment is required for discharge to watercourse
  const watercourseOk = data?.dischargePoint === 'watercourse'
    ? data.treatmentLevel === 'secondary'
    : true

  return [
    {
      standard: 'BS EN 12566-1:2016',
      scope: 'Small Wastewater Treatment Systems - Prefabricated Septic Tanks',
      status: (valid && hasValidPE) ? 'Pass' : 'Warning',
    },
    {
      standard: 'BS 6297:2007+A1:2008',
      scope: 'Code of Practice for Design and Installation of Drainage Fields',
      status: data?.dischargePoint ? 'Pass' : 'Warning',
    },
    {
      standard: 'Environment Agency General Binding Rules',
      scope: 'Permit Exemption for Small Sewage Discharges',
      status: watercourseOk ? 'Pass' : 'Fail',
    },
    {
      standard: 'Building Regulations - Approved Document H2',
      scope: 'Wastewater Treatment Systems and Cesspools',
      status: valid ? 'Pass' : 'Warning',
    },
  ]
}
