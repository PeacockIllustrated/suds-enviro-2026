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
 * Both are stormwater (surface water) products per their data sheets.
 * Compliance follows each data sheet's own list:
 *   SERF  - EN 13598-2, DCG Type D and E, SfA7, Building Regs Part H1,
 *           DCG restricted access
 *   ROTEX - EN 13598-2 (factory-fitted HDPE housing), SuDS design
 */

import type {
  WizardState,
  FlowControlData,
  FlowControlApplication,
  FlowControlVariant,
  Diameter,
  SystemType,
  ValidationResult,
  ComplianceResult,
} from '@/lib/types'
import { isPositiveNumber } from '@/lib/rules/numeric'

// ── SYSTEM TYPE ──────────────────────────────────────────────
// SERF: "efficient management of stormwater". ROTEX: "managing
// stormwater flow". Neither data sheet offers a foul application.

export const FLOW_CONTROL_SYSTEM_TYPES: SystemType[] = ['surface']

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
  if (!data.systemType)  errors.push('System type not selected')
  if (data.systemType && !FLOW_CONTROL_SYSTEM_TYPES.includes(data.systemType)) {
    errors.push('SERF and ROTEX flow controls are for surface water systems only')
  }
  if (!data.application) errors.push('Application type not selected')

  if (!data.headDepthMm || data.headDepthMm.trim() === '') {
    errors.push('Design head not specified')
  } else if (!isPositiveNumber(data.headDepthMm)) {
    errors.push('Design head must be a positive number')
  }

  // ROTEX requires a discharge rate input; SERF derives it from head + orifice.
  // A SERF rate is optional, but if one is entered it must be a real number.
  if (data.variant === 'ROTEX') {
    if (!data.dischargeRateLs || data.dischargeRateLs.trim() === '') {
      errors.push('Discharge rate not specified')
    } else if (!isPositiveNumber(data.dischargeRateLs)) {
      errors.push('Discharge rate must be a positive number')
    }
  } else if (data.dischargeRateLs.trim() !== '' && !isPositiveNumber(data.dischargeRateLs)) {
    errors.push('Discharge rate must be a positive number')
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
// {SERF|ROTEX}{diameter}-{application}. Series and diameter are joined as
// in the model library codes (SEHDS1800, POC600, SERFP600150).

export function generateProductCode(state: WizardState): string {
  const data = extractFlowControlData(state)
  if (!data || !data.variant || !data.application || !data.chamberDiameter) {
    return `${data?.variant ?? 'FC'}???-???`
  }

  const appCode = APPLICATION_ABBR[data.application]
  return `${data.variant}${data.chamberDiameter}-${appCode}`
}

// ── COMPLIANCE CHECK ─────────────────────────────────────────

export function generateCompliance(state: WizardState): ComplianceResult[] {
  const data = extractFlowControlData(state)
  const { valid } = validateConfig(state)

  const hasValidHead = isPositiveNumber(data?.headDepthMm)
  const hasValidDischarge = isPositiveNumber(data?.dischargeRateLs)
  // SERF is sized from the design head alone; ROTEX needs both.
  const sizingInputsOk = data?.variant === 'ROTEX'
    ? hasValidHead && hasValidDischarge
    : hasValidHead

  const housing: ComplianceResult = {
    standard: 'BS EN 13598-2 (2009)',
    scope: data?.variant === 'ROTEX'
      ? 'Factory-fitted HDPE housing'
      : 'Plastic Inspection Chambers',
    status: 'Pass',
  }

  if (data?.variant === 'ROTEX') {
    return [
      housing,
      {
        standard: 'SuDS Design',
        scope: 'Controlled discharge for Sustainable Drainage Systems',
        status: valid && sizingInputsOk ? 'Pass' : 'Warning',
      },
      {
        standard: 'Flood Risk and Attenuation',
        scope: 'Consistent pre-set discharge rate',
        status: hasValidDischarge ? 'Pass' : 'Warning',
      },
    ]
  }

  return [
    housing,
    {
      standard: 'DCG Type D and E Chambers',
      scope: 'Design and Construction Guidance',
      status: valid ? 'Pass' : 'Warning',
    },
    {
      standard: 'Sewers for Adoption 7th Ed. (SfA7)',
      scope: 'Flow Restriction - Adoptable Systems',
      status: valid && sizingInputsOk ? 'Pass' : 'Warning',
    },
    {
      standard: 'Building Regulations Part H1',
      scope: 'Surface Water Drainage - Flow Control',
      status: sizingInputsOk ? 'Pass' : 'Warning',
    },
    {
      standard: 'DCG Restricted Access (350mm > 1m depth)',
      scope: 'Manhole Cover Compliance',
      status: 'Pass',
    },
  ]
}
