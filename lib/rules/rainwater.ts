/**
 * Rainwater Harvesting Rule Engine
 *
 * Validates configuration for rainwater harvesting systems.
 * Checks system type, tank capacity, roof area, and annual rainfall.
 * Compliance checked against BS 8515:2009 and BS EN 16941-1.
 */

import type {
  WizardState,
  RainwaterData,
  RainwaterSystemType,
  ValidationResult,
  ComplianceResult,
} from '@/lib/types'
import { isPositiveNumber } from '@/lib/rules/numeric'

// ── SYSTEM TYPE ABBREVIATIONS ────────────────────────────────

const SYSTEM_TYPE_ABBR: Record<RainwaterSystemType, string> = {
  'direct': 'DIR',
  'indirect': 'IND',
  'gravity': 'GRV',
}

// ── HELPER: Extract RainwaterData from WizardState ───────────

function extractRainwaterData(state: WizardState): RainwaterData | null {
  if (!state.productData || state.productData.kind !== 'rainwater') return null
  return state.productData.data
}

// ── VALIDATION ───────────────────────────────────────────────

export function validateConfig(state: WizardState): ValidationResult {
  const errors: string[] = []
  const data = extractRainwaterData(state)

  if (!state.product) errors.push('Product not selected')
  if (!data) {
    errors.push('Rainwater harvesting data not available')
    return { valid: false, errors }
  }

  if (!data.systemType) errors.push('System type not selected')
  if (!data.capacityLitres) errors.push('Tank capacity not selected')

  if (!data.roofAreaM2 || data.roofAreaM2.trim() === '') {
    errors.push('Roof area not specified')
  } else if (!isPositiveNumber(data.roofAreaM2)) {
    errors.push('Roof area must be a positive number')
  }

  // Annual rainfall is optional, but anything entered must be usable
  if (data.annualRainfallMm.trim() !== '' && !isPositiveNumber(data.annualRainfallMm)) {
    errors.push('Annual rainfall must be a positive number')
  }

  return { valid: errors.length === 0, errors }
}

// ── PRODUCT CODE ─────────────────────────────────────────────

export function generateProductCode(state: WizardState): string {
  const data = extractRainwaterData(state)
  if (!data || !data.capacityLitres || !data.systemType) return 'RWH-???-???'

  const sysCode = SYSTEM_TYPE_ABBR[data.systemType]
  return `RWH-${data.capacityLitres}L-${sysCode}`
}

// ── COMPLIANCE CHECK ─────────────────────────────────────────

export function generateCompliance(state: WizardState): ComplianceResult[] {
  const data = extractRainwaterData(state)
  const { valid } = validateConfig(state)

  const hasValidArea = isPositiveNumber(data?.roofAreaM2)

  return [
    {
      standard: 'BS 8515:2009+A1:2013',
      scope: 'Rainwater Harvesting Systems - Code of Practice',
      status: valid ? 'Pass' : 'Warning',
    },
    {
      standard: 'BS EN 16941-1:2018',
      scope: 'On-site Non-potable Water Systems - Rainwater',
      status: (data?.capacityLitres && hasValidArea) ? 'Pass' : 'Warning',
    },
    {
      standard: 'Water Supply (Water Fittings) Regulations 1999',
      scope: 'Backflow Prevention - Non-potable Systems',
      status: data?.systemType ? 'Pass' : 'Warning',
    },
    {
      standard: 'Building Regulations Part G',
      scope: 'Sanitation, Hot Water Safety and Water Efficiency',
      status: valid ? 'Pass' : 'Warning',
    },
    {
      standard: 'Building Regulations Part H',
      scope: 'Drainage and Waste Disposal',
      status: valid ? 'Pass' : 'Warning',
    },
    {
      standard: 'WRAS',
      scope: 'Wetted components approved for contact with potable water',
      status: 'Pass',
    },
  ]
}
