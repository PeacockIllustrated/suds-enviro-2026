/**
 * Pump Station Rule Engine
 *
 * Validates configuration for packaged pump stations including
 * system type, pump duty, head calculations, control systems,
 * wet well sizing, and installation depth.
 */

import type {
  WizardState,
  PumpStationData,
  ValidationResult,
  ComplianceResult,
} from '@/lib/types'

// ── HELPER: Extract PumpStationData from WizardState ─────────

function extractPumpData(state: WizardState): PumpStationData | null {
  if (!state.productData || state.productData.kind !== 'pump-station') return null
  return state.productData.data
}

// ── VALIDATION ───────────────────────────────────────────────

export function validateConfig(state: WizardState): ValidationResult {
  const errors: string[] = []
  const data = extractPumpData(state)

  if (!state.product) errors.push('Product not selected')
  if (!data) {
    errors.push('Pump station data not available')
    return { valid: false, errors }
  }

  if (!data.systemType) errors.push('System type not selected')

  if (!data.flowRateLs || data.flowRateLs.trim() === '') {
    errors.push('Flow rate not specified')
  } else {
    const flow = parseFloat(data.flowRateLs)
    if (isNaN(flow) || flow <= 0) {
      errors.push('Flow rate must be a positive number')
    }
  }

  if (!data.totalHeadM || data.totalHeadM.trim() === '') {
    errors.push('Total head not specified')
  } else {
    const head = parseFloat(data.totalHeadM)
    if (isNaN(head) || head <= 0) {
      errors.push('Total head must be a positive number')
    }
  }

  if (!data.pumpCount)      errors.push('Pump count not selected')
  if (!data.controllerType) errors.push('Controller type not selected')
  if (!data.wetWellDiameter) errors.push('Wet well diameter not selected')
  if (!data.depth)          errors.push('Depth not selected')

  return { valid: errors.length === 0, errors }
}

// ── PRODUCT CODE ─────────────────────────────────────────────

export function generateProductCode(state: WizardState): string {
  const data = extractPumpData(state)
  if (!data || !data.pumpCount || !data.wetWellDiameter || !data.depth) {
    return 'PS-???-???-???'
  }

  return `PS-${data.pumpCount}P-${data.wetWellDiameter}-${data.depth}`
}

// ── COMPLIANCE CHECK ─────────────────────────────────────────

export function generateCompliance(state: WizardState): ComplianceResult[] {
  const data = extractPumpData(state)
  const { valid } = validateConfig(state)

  const hasValidFlow = data?.flowRateLs
    ? parseFloat(data.flowRateLs) > 0
    : false

  const hasValidHead = data?.totalHeadM
    ? parseFloat(data.totalHeadM) > 0
    : false

  return [
    {
      standard: 'BS EN 12050',
      scope: 'Wastewater Lifting Plants - Construction and Testing',
      status: (valid && hasValidFlow && hasValidHead) ? 'Pass' : 'Warning',
    },
    {
      standard: 'BS EN 752',
      scope: 'Drain and Sewer Systems Outside Buildings',
      status: valid ? 'Pass' : 'Warning',
    },
    {
      standard: 'Sewers for Adoption 7th Ed. (SfA7)',
      scope: 'Adoptable Pumping Station Standards',
      status: (data?.systemType && data?.pumpCount === 2) ? 'Pass' : 'Warning',
    },
    {
      standard: 'Building Regulations Part H1',
      scope: 'Foul and Surface Water Pumping',
      status: data?.systemType ? 'Pass' : 'Warning',
    },
  ]
}
