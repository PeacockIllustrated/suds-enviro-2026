/**
 * RHINO SEHDS Hydrodynamic Separator Rule Engine
 *
 * Source: SuDS RHINO SEHDS SERIES HYDRODYNAMIC SEPARATOR product data sheet.
 *
 * Single-piece GRP hydrodynamic separator for stormwater pollutant removal
 * (suspended solids, hydrocarbons, debris).
 *
 *   Diameters     : 750, 1200, 1800, 2500 mm
 *   Material      : One-piece GRP per BS EN 13121
 *   Inlet         : 360-degree positioning (any angle)
 *   Mitigation    : 5-4-5 (Suspended Solids / Hydrocarbons / Debris)
 *   Standards     : EN 858-1, BS EN 13121, SfA7, DCG
 *   Optional      : RHINO POD polishing filter (adds removal of 33 WFD priority substances)
 */

import type {
  WizardState,
  RhinoCeptorData,
  ValidationResult,
  ComplianceResult,
} from '@/lib/types'

// ── Mitigation Indices (fixed per data sheet) ────────────────

export const SEHDS_MITIGATION = {
  suspendedSolids: 5,
  hydrocarbons: 4,
  debris: 5,
} as const

// ── HELPER: Extract data from WizardState ────────────────────

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
    errors.push('Hydrodynamic separator data not available')
    return { valid: false, errors }
  }

  if (!data.variant) errors.push('Application context not selected')
  if (!data.sehdsDiameter) errors.push('Separator diameter not selected')

  if (data.inletAngleDeg === null) {
    errors.push('Inlet angle not specified')
  } else if (data.inletAngleDeg < 0 || data.inletAngleDeg >= 360) {
    errors.push('Inlet angle must be between 0 and 359 degrees')
  }

  if (!data.drainageAreaM2 || data.drainageAreaM2.trim() === '') {
    errors.push('Drainage area not specified')
  } else {
    const area = parseFloat(data.drainageAreaM2)
    if (isNaN(area) || area <= 0) {
      errors.push('Drainage area must be a positive number')
    }
  }

  if (!data.flowRateLs || data.flowRateLs.trim() === '') {
    errors.push('Treatment flow rate not specified')
  } else {
    const flow = parseFloat(data.flowRateLs)
    if (isNaN(flow) || flow <= 0) {
      errors.push('Treatment flow rate must be a positive number')
    }
  }

  if (data.rhinoPodAddOn === null) {
    errors.push('RHINO POD add-on decision required')
  }

  return { valid: errors.length === 0, errors }
}

// ── PRODUCT CODE ─────────────────────────────────────────────
// SEHDS-{diameter}-{angle}-{POD?}

export function generateProductCode(state: WizardState): string {
  const data = extractRhinoData(state)
  if (!data || !data.sehdsDiameter || data.inletAngleDeg === null) return 'SEHDS-???'

  const podSuffix = data.rhinoPodAddOn ? '-POD' : ''
  return `SEHDS-${data.sehdsDiameter}-A${Math.round(data.inletAngleDeg)}${podSuffix}`
}

// ── COMPLIANCE CHECK ─────────────────────────────────────────

export function generateCompliance(state: WizardState): ComplianceResult[] {
  const data = extractRhinoData(state)
  const { valid } = validateConfig(state)

  const hasValidFlow = data?.flowRateLs ? parseFloat(data.flowRateLs) > 0 : false
  const hasValidArea = data?.drainageAreaM2 ? parseFloat(data.drainageAreaM2) > 0 : false

  return [
    {
      standard: 'BS EN 858-1',
      scope: 'Separator Systems for Light Liquids',
      status: (valid && hasValidFlow) ? 'Pass' : 'Warning',
    },
    {
      standard: 'BS EN 13121',
      scope: 'GRP Tanks and Vessels',
      status: 'Pass',
    },
    {
      standard: 'Sewers for Adoption 7th Ed. (SfA7)',
      scope: 'Adoptable Surface Water Treatment',
      status: hasValidArea ? 'Pass' : 'Warning',
    },
    {
      standard: 'DCG (Design and Construction Guidance)',
      scope: 'Surface Water Pollutant Removal',
      status: valid ? 'Pass' : 'Warning',
    },
    {
      standard: 'CIRIA C753 SuDS Manual',
      scope: `Mitigation Indices ${SEHDS_MITIGATION.suspendedSolids}-${SEHDS_MITIGATION.hydrocarbons}-${SEHDS_MITIGATION.debris} (SS/HC/Debris)`,
      status: 'Pass',
    },
    {
      standard: data?.rhinoPodAddOn
        ? 'WFD Priority Substances (with RHINO POD)'
        : 'WFD Priority Substances',
      scope: data?.rhinoPodAddOn
        ? '33-substance polishing filter included'
        : 'Not included - add RHINO POD for full WFD compliance',
      status: data?.rhinoPodAddOn ? 'Pass' : 'Warning',
    },
  ]
}
