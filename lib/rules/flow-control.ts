/**
 * Flow Control Unit Rule Engine
 *
 * Validates configuration for flow control devices used to regulate
 * discharge rates from attenuation systems, swales, and ponds.
 * Checks against SfA7 and Building Regulations Part H1.
 */

import type {
  WizardState,
  FlowControlData,
  FlowControlApplication,
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

  if (!data.application) errors.push('Application type not selected')

  if (!data.headDepthMm || data.headDepthMm.trim() === '') {
    errors.push('Head depth not specified')
  } else {
    const head = parseFloat(data.headDepthMm)
    if (isNaN(head) || head <= 0) {
      errors.push('Head depth must be a positive number')
    }
  }

  if (!data.dischargeRateLs || data.dischargeRateLs.trim() === '') {
    errors.push('Discharge rate not specified')
  } else {
    const rate = parseFloat(data.dischargeRateLs)
    if (isNaN(rate) || rate <= 0) {
      errors.push('Discharge rate must be a positive number')
    }
  }

  if (!data.chamberDiameter) errors.push('Chamber diameter not selected')

  return { valid: errors.length === 0, errors }
}

// ── PRODUCT CODE ─────────────────────────────────────────────

export function generateProductCode(state: WizardState): string {
  const data = extractFlowControlData(state)
  if (!data || !data.application || !data.chamberDiameter) return 'FC-???-???'

  const appCode = APPLICATION_ABBR[data.application]
  return `FC-${appCode}-${data.chamberDiameter}`
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
  ]
}
