/**
 * Pump Station Rule Engine - RHINOLIFT Packaged Pumping Stations
 *
 * Source: TOM RHINOLIFT PUMPING STATIONS data sheet.
 *
 * Material      : MDPE or GRP (not HDPE)
 * Diameters     : 600, 750, 900, 1050, 1200 mm
 * Depth         : up to 2000mm adoptable / 3000mm non-adoptable
 * Pump types    : Vortex (50mm solids) or Macerator (fine grind)
 * Pump count    : 1 (single) or 2 (duty/standby)
 * Solids        : up to 50mm (vortex)
 * Compliance    : EN 12050-1, Part H, Water Industry Act 1991, Electrical Safety Regs
 */

import type {
  WizardState,
  PumpStationData,
  Diameter,
  PipeSize,
  ValidationResult,
  ComplianceResult,
} from '@/lib/types'
import { isPositiveNumber } from '@/lib/rules/numeric'

// ── Allowed Wet-Well Diameters per data sheet ────────────────

const ALLOWED_DIAMETERS: Diameter[] = [600, 750, 900, 1050, 1200]

export function getAllowedDiameters(): Diameter[] {
  return ALLOWED_DIAMETERS
}

export function isAllowedDiameter(diameter: Diameter): boolean {
  return ALLOWED_DIAMETERS.includes(diameter)
}

// ── Outlet pipe sizes ────────────────────────────────────────
// The live RHINOLIFT page lists pipe sizes 110 / 150 / 225 / 300mm, so
// the 450mm option is not offered. (150 vs 160 is an open question in
// HANDOVER.md; the existing 160 label is kept.)

export const PUMP_OUTLET_SIZES: PipeSize[] = [
  '110mm EN1401',
  '160mm EN1401',
  '225mm Twinwall',
  '300mm Twinwall',
]

// ── Max Depth (per data sheet) ───────────────────────────────

export function getMaxDepth(adoptable: boolean): number {
  return adoptable ? 2000 : 3000
}

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
  } else if (!isPositiveNumber(data.flowRateLs)) {
    errors.push('Flow rate must be a positive number')
  }

  if (!data.totalHeadM || data.totalHeadM.trim() === '') {
    errors.push('Total head not specified')
  } else if (!isPositiveNumber(data.totalHeadM)) {
    errors.push('Total head must be a positive number')
  }

  if (!data.pumpCount)       errors.push('Pump count not selected')
  if (!data.pumpType)        errors.push('Pump type (vortex or macerator) not selected')
  if (!data.controllerType)  errors.push('Controller type not selected')
  if (!data.wetWellDiameter) errors.push('Wet well diameter not selected')
  if (!data.depth)           errors.push('Depth not selected')
  if (data.adoptable === null || data.adoptable === undefined) {
    errors.push('Adoption status not selected')
  } else if (data.depth && data.depth > getMaxDepth(data.adoptable)) {
    errors.push(
      `Depth ${data.depth}mm exceeds max ${getMaxDepth(data.adoptable)}mm for ${data.adoptable ? 'adoptable' : 'non-adoptable'}`
    )
  }
  if (!data.pipeSizeOutlet) {
    errors.push('Outlet pipe size not selected')
  } else if (!PUMP_OUTLET_SIZES.includes(data.pipeSizeOutlet)) {
    errors.push(`${data.pipeSizeOutlet} outlet is not offered on RHINOLIFT`)
  }

  if (data.wetWellDiameter && !isAllowedDiameter(data.wetWellDiameter)) {
    errors.push(
      `${data.wetWellDiameter}mm wet well is not available for RHINOLIFT (600, 750, 900, 1050, 1200 only)`
    )
  }

  return { valid: errors.length === 0, errors }
}

// ── PRODUCT CODE ─────────────────────────────────────────────

export function generateProductCode(state: WizardState): string {
  const data = extractPumpData(state)
  if (!data || !data.pumpCount || !data.wetWellDiameter || !data.depth) {
    return 'RHINOLIFT-???'
  }

  const pump = data.pumpType === 'macerator' ? '-M' : data.pumpType === 'vortex' ? '-V' : ''
  const adoptStr = data.adoptable ? '-S104' : data.adoptable === false ? '-PRIV' : ''
  return `RHINOLIFT-${data.pumpCount}P${pump}-${data.wetWellDiameter}-${data.depth}${adoptStr}`
}

// ── COMPLIANCE CHECK ─────────────────────────────────────────

export function generateCompliance(state: WizardState): ComplianceResult[] {
  const data = extractPumpData(state)
  const { valid } = validateConfig(state)

  const hasValidFlow = isPositiveNumber(data?.flowRateLs)
  const hasValidHead = isPositiveNumber(data?.totalHeadM)

  return [
    {
      standard: 'BS EN 12050-1',
      scope: 'Lifting Plants for Wastewater Containing Faecal Matter',
      status: (valid && hasValidFlow && hasValidHead) ? 'Pass' : 'Warning',
    },
    {
      standard: 'Building Regulations Part H',
      scope: 'Drainage and Waste Disposal',
      status: data?.systemType ? 'Pass' : 'Warning',
    },
    {
      standard: 'Water Industry Act 1991',
      scope: 'Pumping Station Discharge to Public Sewer',
      status: valid ? 'Pass' : 'Warning',
    },
    {
      standard: 'Electrical Equipment (Safety) Regulations',
      scope: 'Pump Control Panel Compliance',
      status: data?.controllerType ? 'Pass' : 'Warning',
    },
  ]
}
