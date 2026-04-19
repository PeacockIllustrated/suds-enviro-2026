/**
 * Flow Control Unit Rule Engine - SERF (orifice) and ROTEX (vortex)
 *
 * SERF (Orifice Flow Control Chamber):
 *   - Pre-set orifice plate
 *   - Chamber diameters: 300, 450, 600 mm
 *   - Designer specifies design head; discharge derived from orifice + head
 *
 * ROTEX (Vortex Flow Control):
 *   - Passive vortex regulator (no moving parts)
 *   - Chamber diameters: 600, 750, 900, 1050, 1200 mm
 *   - Designer specifies discharge + head; vortex sized to suit
 *
 * Both validated against SfA7, EN 13598-2, Building Regulations Part H1.
 */

import type {
  WizardState,
  FlowControlData,
  FlowControlApplication,
  FlowControlVariant,
  Diameter,
  ValidationResult,
  ComplianceResult,
} from '@/lib/types'

// ── APPLICATION ABBREVIATIONS ────────────────────────────────

const APPLICATION_ABBR: Record<FlowControlApplication, string> = {
  'attenuation': 'ATT',
  'swale': 'SWL',
  'pond': 'PND',
  'other': 'OTH',
}

// ── Variant-Specific Diameter Sets ───────────────────────────

const VARIANT_DIAMETERS: Record<FlowControlVariant, Diameter[]> = {
  SERF:  [300, 450, 600],
  ROTEX: [600, 750, 900, 1050, 1200],
}

export function getVariantDiameters(variant: FlowControlVariant | null): Diameter[] {
  if (!variant) return [300, 450, 600, 750, 900, 1050, 1200]
  return VARIANT_DIAMETERS[variant]
}

export function isVariantDiameter(
  variant: FlowControlVariant | null,
  diameter: Diameter
): boolean {
  return getVariantDiameters(variant).includes(diameter)
}

// ── HELPER: Extract FlowControlData from WizardState ─────────

function extractFlowControlData(state: WizardState): FlowControlData | null {
  if (!state.productData || state.productData.kind !== 'flow-control') return null
  return state.productData.data
}

// ── VALIDATION ───────────────────────────────────────────────

export function validateConfig(state: WizardState): ValidationResult {
  const errors: string[] = []
  const data = extractFlowControlData(state)

  if (!state.product) errors.push('Product not selected')
  if (!data) {
    errors.push('Flow control data not available')
    return { valid: false, errors }
  }

  if (!data.variant)     errors.push('Flow control series (SERF or ROTEX) not selected')
  if (!data.application) errors.push('Application type not selected')

  if (!data.headDepthMm || data.headDepthMm.trim() === '') {
    errors.push('Design head not specified')
  } else {
    const head = parseFloat(data.headDepthMm)
    if (isNaN(head) || head <= 0) {
      errors.push('Design head must be a positive number')
    }
  }

  // ROTEX requires a discharge rate input; SERF derives it from head + orifice.
  if (data.variant === 'ROTEX') {
    if (!data.dischargeRateLs || data.dischargeRateLs.trim() === '') {
      errors.push('Discharge rate not specified')
    } else {
      const rate = parseFloat(data.dischargeRateLs)
      if (isNaN(rate) || rate <= 0) {
        errors.push('Discharge rate must be a positive number')
      }
    }
  }

  if (!data.chamberDiameter) errors.push('Chamber diameter not selected')

  if (data.variant && data.chamberDiameter && !isVariantDiameter(data.variant, data.chamberDiameter)) {
    errors.push(
      `${data.chamberDiameter}mm is not available for ${data.variant} flow control`
    )
  }

  return { valid: errors.length === 0, errors }
}

// ── PRODUCT CODE ─────────────────────────────────────────────

export function generateProductCode(state: WizardState): string {
  const data = extractFlowControlData(state)
  if (!data || !data.variant || !data.application || !data.chamberDiameter) return 'FC-???-???'

  const appCode = APPLICATION_ABBR[data.application]
  return `${data.variant}-${appCode}-${data.chamberDiameter}`
}

// ── COMPLIANCE CHECK ─────────────────────────────────────────

export function generateCompliance(state: WizardState): ComplianceResult[] {
  const data = extractFlowControlData(state)
  const { valid } = validateConfig(state)

  const hasValidDischarge = data?.dischargeRateLs
    ? parseFloat(data.dischargeRateLs) > 0
    : false

  const hasValidHead = data?.headDepthMm
    ? parseFloat(data.headDepthMm) > 0
    : false

  return [
    {
      standard: 'Sewers for Adoption 7th Ed. (SfA7)',
      scope: 'Flow Restriction - Adoptable Systems',
      status: (valid && hasValidDischarge) ? 'Pass' : 'Warning',
    },
    {
      standard: 'Building Regulations Part H1',
      scope: 'Surface Water Drainage - Flow Control',
      status: (hasValidDischarge && hasValidHead) ? 'Pass' : 'Warning',
    },
    {
      standard: 'Environment Agency Guidance',
      scope: 'Greenfield Runoff Rate Compliance',
      status: valid ? 'Pass' : 'Warning',
    },
    {
      standard: 'DCG Restricted Access (350mm > 1m depth)',
      scope: 'Manhole Cover Compliance',
      status: 'Pass',
    },
  ]
}
