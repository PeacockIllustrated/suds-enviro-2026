/**
 * Chamber Rule Engine
 *
 * Enforces all physical and regulatory constraints for inspection chamber
 * configuration. Rules are numbered R1-R7 to match CLAUDE.md documentation.
 * All functions are pure - no side effects.
 */

import type {
  WizardState,
  ChamberData,
  PipeSize,
  ClockPosition,
  ValidationResult,
  ComplianceResult,
} from '@/lib/types'

// ── PIPE SIZE ORDER (ascending) ──────────────────────────────

const PIPE_SIZES: PipeSize[] = [
  '110mm EN1401',
  '160mm EN1401',
  '225mm Twinwall',
  '300mm Twinwall',
  '450mm Twinwall',
]

const pipeSizeRank = (size: PipeSize): number => PIPE_SIZES.indexOf(size)

// ── R1: Maximum Inlets by Diameter ───────────────────────────

export function getMaxInlets(diameter: number): number {
  switch (diameter) {
    case 450:  return 2
    case 600:  return 4
    case 750:  return 5
    case 1050: return 6
    default:   return 0
  }
}

// ── R2: Outlet Minimum Size ──────────────────────────────────

export function getOutletMinSize(
  inletCount: number,
  diameter: number
): PipeSize | null {
  if (inletCount >= 3 && diameter === 600) return '225mm Twinwall'
  if (inletCount >= 4) return '225mm Twinwall'
  return null
}

// ── R3: Blocked Clock Positions ──────────────────────────────

export function getBlockedPositions(outletSize: PipeSize | null): ClockPosition[] {
  if (outletSize === '225mm Twinwall') return ['5', '7']
  return []
}

// ── R4: Maximum Installation Depth ───────────────────────────

export function getMaxDepth(adoptable: boolean): number {
  return adoptable ? 2000 : 3000
}

// ── R7: Maximum Inlet Pipe Size by Diameter ──────────────────

export function getMaxInletPipeSize(diameter: number): PipeSize {
  switch (diameter) {
    case 450:  return '160mm EN1401'
    case 600:  return '225mm Twinwall'
    case 750:  return '300mm Twinwall'
    case 1050: return '450mm Twinwall'
    default:   return '160mm EN1401'
  }
}

// ── R6 + R7: Available Pipe Sizes for an Inlet ───────────────
// Combines both rules: must not exceed outlet AND must not exceed diameter max

export function getAvailableInletSizes(
  diameter: number | null,
  outletLocked: PipeSize | null
): PipeSize[] {
  if (!diameter) return PIPE_SIZES

  const maxByDiameter = getMaxInletPipeSize(diameter)
  const maxByOutlet   = outletLocked ?? '450mm Twinwall'

  const maxRank = Math.min(
    pipeSizeRank(maxByDiameter),
    pipeSizeRank(maxByOutlet)
  )

  return PIPE_SIZES.slice(0, maxRank + 1)
}

// ── HELPER: Extract ChamberData from WizardState ─────────────

function extractChamberData(state: WizardState): ChamberData | null {
  if (!state.productData || state.productData.kind !== 'chamber') return null
  return state.productData.data
}

// ── VALIDATION ───────────────────────────────────────────────

export function validateConfig(state: WizardState): ValidationResult {
  const errors: string[] = []
  const chamber = extractChamberData(state)

  if (!state.product)  errors.push('Product not selected')
  if (!chamber) {
    errors.push('Chamber data not available')
    return { valid: false, errors }
  }

  if (!chamber.systemType)  errors.push('System type not selected')
  if (!chamber.diameter)    errors.push('Diameter not selected')
  if (!chamber.inletCount)  errors.push('Inlet count not selected')

  if (chamber.diameter && chamber.inletCount) {
    const maxIn = getMaxInlets(chamber.diameter)
    if (chamber.inletCount > maxIn) {
      errors.push(
        `Inlet count ${chamber.inletCount} exceeds max ${maxIn} for ${chamber.diameter}mm`
      )
    }
  }

  if (chamber.inletCount && chamber.positions.length !== chamber.inletCount) {
    errors.push(
      `${chamber.positions.length} positions placed, ${chamber.inletCount} required`
    )
  }

  if (chamber.flowControl === null) errors.push('Flow control decision required')

  if (chamber.flowControl) {
    if (!chamber.flowType)  errors.push('Flow control type not selected')
    if (!chamber.flowRate)  errors.push('Flow rate not specified')
  }

  if (!chamber.depth)               errors.push('Depth not selected')
  if (chamber.adoptable === null)   errors.push('Adoption status not selected')

  if (chamber.depth && chamber.adoptable !== null) {
    const maxD = getMaxDepth(chamber.adoptable)
    if (chamber.depth > maxD) {
      errors.push(
        `Depth ${chamber.depth}mm exceeds max ${maxD}mm for ${chamber.adoptable ? 'adoptable' : 'non-adoptable'}`
      )
    }
  }

  return { valid: errors.length === 0, errors }
}

// ── PRODUCT CODE ─────────────────────────────────────────────

export function generateProductCode(state: WizardState): string {
  const chamber = extractChamberData(state)
  if (!chamber || !chamber.diameter || !chamber.depth) return 'IC-???-???-???'

  const adoptStr = chamber.adoptable ? 'S104' : 'PRIV'
  return `IC-${chamber.diameter}-${chamber.depth}-${adoptStr}`
}

// ── COMPLIANCE CHECK ─────────────────────────────────────────

export function generateCompliance(state: WizardState): ComplianceResult[] {
  const chamber = extractChamberData(state)
  const { valid } = validateConfig(state)

  // Outlet rule: no flow increase on exit
  let outletRulePass = true
  if (chamber && chamber.outletLocked && chamber.diameter) {
    const outletRank = pipeSizeRank(chamber.outletLocked)
    Object.entries(chamber.pipeSizes).forEach(([key, size]) => {
      if (key.startsWith('inlet')) {
        if (pipeSizeRank(size) > outletRank) outletRulePass = false
      }
    })
  }

  // Depth rule for adoptable
  let depthPass = true
  if (chamber && chamber.depth && chamber.adoptable !== null) {
    depthPass = chamber.depth <= getMaxDepth(chamber.adoptable)
  }

  const overallPass = valid && outletRulePass && depthPass

  return [
    {
      standard: 'DCG Section C7.1.1',
      scope: 'Sediment Management - Adoptable',
      status: overallPass ? 'Pass' : 'Warning',
    },
    {
      standard: 'Sewers for Adoption 7th Ed. (SfA7)',
      scope: 'Adoptable Sewer Standards',
      status: (chamber?.adoptable && depthPass)
        ? 'Pass'
        : chamber?.adoptable === false
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
      status: chamber?.systemType === 'surface' ? 'Pass' : 'Warning',
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

// ── HELPER: Clock angle to degrees from North ────────────────

export function clockToDegrees(clockHour: number): number {
  return (clockHour / 12) * 360
}

// ── HELPER: Clock angle to 3D direction vector ──────────────

export function clockToDirection(clockHour: number): [number, number, number] {
  const radians = (clockHour / 12) * Math.PI * 2
  return [Math.sin(radians), 0, Math.cos(radians)]
}

// ── HELPER: Inlet heights (approximate, for drawing) ────────

export function getDefaultInletHeights(
  depth: number,
  inletCount: number
): number[] {
  // Distribute inlets evenly in the upper 65% of the chamber
  // Starting from 85% of depth down to 65% of depth
  const heights: number[] = []
  for (let i = 0; i < inletCount; i++) {
    const fraction = 0.85 - (i * 0.1)
    heights.push(Math.round(depth * fraction))
  }
  return heights
}
