/**
 * Grease Separator Rule Engine
 *
 * Validates configuration for full grease separator systems used
 * in commercial kitchens and food processing. Checks application type,
 * peak covers per day, and flow rate against BS EN 1825, BS EN 12056-1,
 * and the Water Industry Act.
 */

import type {
  WizardState,
  GreaseSeparatorData,
  GreaseSepApplication,
  ValidationResult,
  ComplianceResult,
} from '@/lib/types'

// ── APPLICATION ABBREVIATIONS ────────────────────────────────

const APPLICATION_ABBR: Record<GreaseSepApplication, string> = {
  'restaurant': 'REST',
  'hotel': 'HTL',
  'catering': 'CAT',
  'food-processing': 'FP',
}

// ── HELPER: Extract GreaseSeparatorData from WizardState ─────

function extractGreaseSepData(state: WizardState): GreaseSeparatorData | null {
  if (!state.productData || state.productData.kind !== 'grease-separator') return null
  return state.productData.data
}

// ── VALIDATION ───────────────────────────────────────────────

export function validateConfig(state: WizardState): ValidationResult {
  const errors: string[] = []
  const data = extractGreaseSepData(state)

  if (!state.product) errors.push('Product not selected')
  if (!data) {
    errors.push('Grease separator data not available')
    return { valid: false, errors }
  }

  if (!data.application) errors.push('Application type not selected')

  if (!data.peakCoversPerDay || data.peakCoversPerDay.trim() === '') {
    errors.push('Peak covers per day not specified')
  } else {
    const covers = parseFloat(data.peakCoversPerDay)
    if (isNaN(covers) || covers <= 0) {
      errors.push('Peak covers per day must be a positive number')
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

  return { valid: errors.length === 0, errors }
}

// ── PRODUCT CODE ─────────────────────────────────────────────

export function generateProductCode(state: WizardState): string {
  const data = extractGreaseSepData(state)
  if (!data || !data.application) return 'GS-???'

  const appCode = APPLICATION_ABBR[data.application]
  return `GS-${appCode}`
}

// ── COMPLIANCE CHECK ─────────────────────────────────────────

export function generateCompliance(state: WizardState): ComplianceResult[] {
  const data = extractGreaseSepData(state)
  const { valid } = validateConfig(state)

  const hasValidFlow = data?.flowRateLs
    ? parseFloat(data.flowRateLs) > 0
    : false

  const hasValidCovers = data?.peakCoversPerDay
    ? parseFloat(data.peakCoversPerDay) > 0
    : false

  return [
    {
      standard: 'BS EN 1825-1:2004',
      scope: 'Grease Separators - Principles of Design',
      status: (valid && hasValidCovers) ? 'Pass' : 'Warning',
    },
    {
      standard: 'BS EN 12056-1',
      scope: 'Gravity Drainage Systems Inside Buildings',
      status: hasValidFlow ? 'Pass' : 'Warning',
    },
    {
      standard: 'Water Industry Act 1991',
      scope: 'Trade Effluent Consent - Fats, Oils and Grease',
      status: valid ? 'Pass' : 'Warning',
    },
    {
      standard: 'Building Regulations - Approved Document H',
      scope: 'Drainage and Waste Disposal',
      status: data?.application ? 'Pass' : 'Warning',
    },
  ]
}
