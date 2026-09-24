/**
 * RhinoPod Rule Engine
 *
 * Validates configuration for RhinoPod floating cartridge filters.
 * Two configurator variants:
 *   - Standalone: floating filter placed in a road gully, GRP or precast
 *     chamber or existing oil interceptor (often a retrofit)
 *   - Plus: paired with a SudSceptor (SEHDS) hydrodynamic separator, so
 *     the diameter is one of the configurator's SEHDS sizes
 *     (750 / 1200 / 1800 / 2500)
 *
 * Compliance follows the RhinoPod data sheet
 * (public/brochures/rhino-pod.html): tested against pollutants relevant to
 * the EU Water Framework Directive, and supports Schedule 3 SuDS design
 * guidance. The earlier PPG3, CIRIA C753 and CAR entries had no source.
 */

import type {
  WizardState,
  RhinoPodData,
  Diameter,
  ValidationResult,
  ComplianceResult,
} from '@/lib/types'

// ── PLUS VARIANT HOST SIZES ──────────────────────────────────
// Plus pairs the pod with a SudSceptor, so it takes the SEHDS sizes.

export const POD_PLUS_DIAMETERS: Diameter[] = [750, 1200, 1800, 2500]

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
      errors.push('SEHDS diameter not selected for RhinoPod Plus')
    } else if (!POD_PLUS_DIAMETERS.includes(data.chamberDiameter)) {
      errors.push(`RhinoPod Plus is paired with SudSceptor SEHDS separators (750, 1200, 1800, 2500mm), not ${data.chamberDiameter}mm`)
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
      scope: 'Tested against pollutants relevant to the WFD',
      status: valid ? 'Pass' : 'Warning',
    },
    {
      standard: 'Schedule 3 SuDS design guidance',
      scope: 'Dissolved-pollutant interception at drainage points',
      status: data?.podType ? 'Pass' : 'Warning',
    },
  ]
}
