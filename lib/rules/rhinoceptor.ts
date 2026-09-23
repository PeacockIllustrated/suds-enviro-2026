/**
 * SudSceptor Hydrodynamic Separator Rule Engine (SEHDS codes)
 *
 * Source: SudSceptor data sheet (public/brochures/rhino-sehds.html), rebuilt
 * from the official SEHDS1200 / 1800 / 2500 / 3000 sheets and drawings.
 *
 * Single-piece hydrodynamic separator for sediment-bound pollutants in
 * surface water runoff.
 *
 *   Range         : SEHDS750 to SEHDS3000 (configurator offers 750, 1200,
 *                   1800, 2500 mm)
 *   Material      : GRP from SEHDS1200 (BS 4994:1987); HDPE twinwall for SEHDS750
 *   Inlet         : wide variety of connection options (configurator takes
 *                   an angle from north)
 *   Mitigation    : TSS 0.5, metals 0.40, hydrocarbons 0.40
 *   Standards     : NJDEP protocol 2015 and 2020, DIBt, British Water CoP,
 *                   CIRIA C753 Simple Index Approach, BS 4994:1987 (GRP)
 *   Optional      : RhinoPod polishing filter for dissolved pollutants
 */

import type {
  WizardState,
  RhinoCeptorData,
  ValidationResult,
  ComplianceResult,
} from '@/lib/types'
import { isPositiveNumber } from '@/lib/rules/numeric'

// ── Mitigation Indices (fixed per data sheet) ────────────────
// SudSceptor column of the data sheet's mitigation index table
// (CIRIA C753 Simple Index Approach, via the British Water How to Guide).

export const SEHDS_MITIGATION = {
  tss: '0.5',
  metals: '0.40',
  hydrocarbons: '0.40',
} as const

export const SEHDS_MITIGATION_LABEL =
  `TSS ${SEHDS_MITIGATION.tss} | Metals ${SEHDS_MITIGATION.metals} | Hydrocarbons ${SEHDS_MITIGATION.hydrocarbons}`

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
  } else if (!isPositiveNumber(data.drainageAreaM2)) {
    errors.push('Drainage area must be a positive number')
  }

  if (!data.flowRateLs || data.flowRateLs.trim() === '') {
    errors.push('Treatment flow rate not specified')
  } else if (!isPositiveNumber(data.flowRateLs)) {
    errors.push('Treatment flow rate must be a positive number')
  }

  if (data.rhinoPodAddOn === null) {
    errors.push('RhinoPod add-on decision required')
  }

  return { valid: errors.length === 0, errors }
}

// ── PRODUCT CODE ─────────────────────────────────────────────
// SEHDS{diameter}-A{angle}[-POD]. The base is the sales code used in the
// model library (SEHDS1800); the inlet angle and POD suffixes are
// configurator additions.

export function generateProductCode(state: WizardState): string {
  const data = extractRhinoData(state)
  if (!data || !data.sehdsDiameter || data.inletAngleDeg === null) return 'SEHDS???'

  const podSuffix = data.rhinoPodAddOn ? '-POD' : ''
  return `SEHDS${data.sehdsDiameter}-A${Math.round(data.inletAngleDeg)}${podSuffix}`
}

// ── COMPLIANCE CHECK ─────────────────────────────────────────

export function generateCompliance(state: WizardState): ComplianceResult[] {
  const data = extractRhinoData(state)
  const { valid } = validateConfig(state)

  const hasValidFlow = isPositiveNumber(data?.flowRateLs)
  const hasValidArea = isPositiveNumber(data?.drainageAreaM2)

  // SEHDS750 is HDPE twinwall; BS 4994 covers the GRP models only.
  const isHdpe = data?.sehdsDiameter === 750

  return [
    {
      standard: 'NJDEP protocol 2015 and 2020',
      scope: 'Hydrodynamic Separator Performance (TSS)',
      status: (valid && hasValidFlow) ? 'Pass' : 'Warning',
    },
    {
      standard: 'British Water Code of Practice',
      scope: 'Hydrodynamic Separator Design and Testing',
      status: hasValidArea ? 'Pass' : 'Warning',
    },
    {
      standard: 'DIBt',
      scope: 'Design Compliance (per SudSceptor data sheet)',
      status: valid ? 'Pass' : 'Warning',
    },
    {
      standard: 'CIRIA C753 Simple Index Approach',
      scope: `Mitigation Indices ${SEHDS_MITIGATION_LABEL}`,
      status: 'Pass',
    },
    {
      standard: isHdpe ? 'HDPE twinwall body' : 'BS 4994:1987',
      scope: isHdpe
        ? 'SEHDS750 made from BBA-certificated HDPE twinwall pipe'
        : 'GRP Vessels and Tanks in Reinforced Plastics',
      status: data?.sehdsDiameter ? 'Pass' : 'Warning',
    },
    {
      standard: 'RhinoPod polishing filter',
      scope: data?.rhinoPodAddOn
        ? 'Included - dissolved zinc, copper, phosphate and PAHs'
        : 'Not included - add RhinoPod for dissolved pollutants',
      status: data?.rhinoPodAddOn ? 'Pass' : 'Warning',
    },
  ]
}
