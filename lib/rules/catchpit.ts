/**
 * Catchpit / Silt Trap Rule Engine
 *
 * Catchpits share the same physical chamber constraints as inspection chambers
 * (R1-R7) but add silt management features: baffle type and grate type.
 * Minimum sump depth varies by diameter.
 */

import type {
  WizardState,
  CatchpitData,
  Diameter,
  PipeSize,
  ClockPosition,
  ValidationResult,
  ComplianceResult,
} from '@/lib/types'

// Re-export chamber rules since catchpit uses the same physical constraints
export {
  getMaxInlets,
  getOutletMinSize,
  getBlockedPositions,
  getMaxDepth,
  getMaxInletPipeSize,
  getAvailableInletSizes,
} from '@/lib/rules/chamber'

import {
  getMaxInlets,
  getOutletMinSize,
  getMaxDepth,
} from '@/lib/rules/chamber'

// ── PIPE SIZE ORDER (ascending) ──────────────────────────────

const PIPE_SIZES: PipeSize[] = [
  '110mm EN1401',
  '160mm EN1401',
  '225mm Twinwall',
  '300mm Twinwall',
  '450mm Twinwall',
]

const pipeSizeRank = (size: PipeSize): number => PIPE_SIZES.indexOf(size)

// ── CATCHPIT-SPECIFIC: Minimum Sump Depth ────────────────────

const SUMP_DEPTH_MAP: Record<Diameter, number> = {
  450: 450,
  600: 500,
  750: 600,
  1050: 750,
}

export function getMinSumpDepth(diameter: Diameter): number {
  return SUMP_DEPTH_MAP[diameter]
}

// ── HELPER: Extract CatchpitData from WizardState ───────────

function extractCatchpitData(state: WizardState): CatchpitData | null {
  if (!state.productData || state.productData.kind !== 'catchpit') return null
  return state.productData.data
}

// ── VALIDATION ───────────────────────────────────────────────

export function validateConfig(state: WizardState): ValidationResult {
  const errors: string[] = []
  const data = extractCatchpitData(state)

  if (!state.product) errors.push('Product not selected')
  if (!data) {
    errors.push('Catchpit data not available')
    return { valid: false, errors }
  }

  if (!data.systemType) errors.push('System type not selected')
  if (!data.diameter)   errors.push('Diameter not selected')
  if (!data.inletCount) errors.push('Inlet count not selected')

  if (data.diameter && data.inletCount) {
    const maxIn = getMaxInlets(data.diameter)
    if (data.inletCount > maxIn) {
      errors.push(
        `Inlet count ${data.inletCount} exceeds max ${maxIn} for ${data.diameter}mm`
      )
    }
  }

  if (data.inletCount && data.positions.length !== data.inletCount) {
    errors.push(
      `${data.positions.length} positions placed, ${data.inletCount} required`
    )
  }

  if (!data.depth)             errors.push('Depth not selected')
  if (data.adoptable === null) errors.push('Adoption status not selected')

  if (data.depth && data.adoptable !== null) {
    const maxD = getMaxDepth(data.adoptable)
    if (data.depth > maxD) {
      errors.push(
        `Depth ${data.depth}mm exceeds max ${maxD}mm for ${data.adoptable ? 'adoptable' : 'non-adoptable'}`
      )
    }
  }

  if (!data.baffleType) errors.push('Baffle type not selected')
  if (!data.grateType)  errors.push('Grate type not selected')

  return { valid: errors.length === 0, errors }
}

// ── PRODUCT CODE ─────────────────────────────────────────────

export function generateProductCode(state: WizardState): string {
  const data = extractCatchpitData(state)
  if (!data || !data.diameter || !data.depth) return 'CP-???-???-???'

  const adoptStr = data.adoptable ? 'S104' : 'PRIV'
  return `CP-${data.diameter}-${data.depth}-${adoptStr}`
}

// ── COMPLIANCE CHECK ─────────────────────────────────────────

export function generateCompliance(state: WizardState): ComplianceResult[] {
  const data = extractCatchpitData(state)
  const { valid } = validateConfig(state)

  // Outlet rule: no flow increase on exit
  let outletRulePass = true
  if (data && data.outletLocked && data.diameter) {
    const outletRank = pipeSizeRank(data.outletLocked)
    Object.entries(data.pipeSizes).forEach(([key, size]) => {
      if (key.startsWith('inlet')) {
        if (pipeSizeRank(size) > outletRank) outletRulePass = false
      }
    })
  }

  // Depth rule for adoptable
  let depthPass = true
  if (data && data.depth && data.adoptable !== null) {
    depthPass = data.depth <= getMaxDepth(data.adoptable)
  }

  const overallPass = valid && outletRulePass && depthPass

  return [
    {
      standard: 'DCG Section C7.1.1',
      scope: 'Sediment Management - Catchpit',
      status: overallPass ? 'Pass' : 'Warning',
    },
    {
      standard: 'DCG C7.1.1 Sediment Management',
      scope: 'Silt retention and baffle configuration',
      status: data?.baffleType ? 'Pass' : 'Warning',
    },
    {
      standard: 'Sewers for Adoption 7th Ed. (SfA7)',
      scope: 'Adoptable Sewer Standards',
      status: (data?.adoptable && depthPass)
        ? 'Pass'
        : data?.adoptable === false
          ? 'Pass'
          : 'Warning',
    },
    {
      standard: 'BS EN 13598-1 and EN 13598-2',
      scope: 'Plastic Inspection Chambers',
      status: 'Pass',
    },
    {
      standard: 'Building Regulations Part H1',
      scope: 'Surface Water Drainage',
      status: data?.systemType === 'surface' ? 'Pass' : 'Warning',
    },
    {
      standard: 'Environment Agency PPG3',
      scope: 'Pollution Prevention',
      status: 'Pass',
    },
    {
      standard: 'Outlet rule - no flow increase on exit',
      scope: 'Rule Engine Validation',
      status: outletRulePass ? 'Pass' : 'Fail',
    },
  ]
}
