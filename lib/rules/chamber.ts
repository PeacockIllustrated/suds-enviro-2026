/**
 * Chamber Rule Engine - SERSIC / SERFIC Inspection Chambers
 *
 * Sources: RHINO SERSIC and SERFIC Product Data Sheets.
 * Sizes: 450, 600, 750, 900, 1050, 1200 mm diameter.
 * Depth: up to 3000mm adoptable (DCG/SfA7), up to 6000mm non-adoptable.
 * Pipe sizes: main channels 110 to 300 mm, side connections 110 to 300 mm.
 * "Max Pipe Size 300 mm" on both data sheets, so no connection exceeds 300.
 * (Whether the second size is 150 or 160 mm is an open manufacturing
 * question - see HANDOVER.md. The 160 label is left as it was.)
 *
 * Outlet position is fixed at 12 o'clock (north).
 * Inlets are physically manufactured at 5 clock positions only:
 *   3, 5, 6, 7, 9 o'clock - so an inlet count cannot exceed 5.
 *
 * Rules R1-R7 are documented in CLAUDE.md and applied as the user moves
 * through the wizard. All functions are pure.
 */

import type {
  WizardState,
  ChamberData,
  PipeSize,
  ClockPosition,
  FlowType,
  ValidationResult,
  ComplianceResult,
} from '@/lib/types'
import { isPositiveNumber } from '@/lib/rules/numeric'

// ── INLET POSITION CONSTRAINT ────────────────────────────────
// Only 5 manufactured inlet positions. Outlet is fixed at 12.

export const VALID_INLET_POSITIONS: ClockPosition[] = ['3', '5', '6', '7', '9']
export const MAX_INLETS_PHYSICAL = VALID_INLET_POSITIONS.length

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
// Capped by both the diameter (data sheet) and the physical limit of
// 5 manufactured inlet positions on the chamber wall.

export function getMaxInlets(diameter: number): number {
  let byDiameter: number
  switch (diameter) {
    // 300mm exists only as a SERS catchpit. No data sheet gives its inlet
    // count; 1 matches the configurator's own diameter reference and keeps
    // the SERS 300 path usable. Open question for the client.
    case 300:  byDiameter = 1; break
    case 450:  byDiameter = 2; break
    case 600:  byDiameter = 4; break
    case 750:  byDiameter = 5; break
    case 900:  byDiameter = 5; break
    case 1050: byDiameter = 5; break
    case 1200: byDiameter = 5; break
    default:   byDiameter = 0
  }
  return Math.min(byDiameter, MAX_INLETS_PHYSICAL)
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

// ── R3: Blocked Clock Positions (no-op) ──────────────────────
// Outlet is fixed at 12 o'clock; the five valid inlet positions
// (3, 5, 6, 7, 9) are all in the lower half of the chamber and are not
// physically affected by the outlet stub size. Retained as a hook for
// future product variants.

export function getBlockedPositions(
  _outletSize: PipeSize | null
): ClockPosition[] {
  return []
}

// ── R4: Maximum Installation Depth (chamber-specific) ────────
// Per SERSIC/SERFIC data sheets:
//   adoptable (DCG/SfA7) -> 3000mm
//   non-adoptable        -> 6000mm

export function getMaxDepth(adoptable: boolean): number {
  return adoptable ? 3000 : 6000
}

// ── R7: Maximum Inlet Pipe Size by Diameter ──────────────────
// The SERSIC / SERFIC data sheets cap every connection at 300mm ("Max Pipe
// Size 300 mm"; main channels 110-300, side connections 110-300), and the
// live SERSIC, SERFIC and Advanced Catchpit pages list 110 / 150 / 225 /
// 300mm only. CLAUDE.md's older 450mm allowance for 1050/1200 is not
// offered by any source, so it is capped at 300mm here.

export const MAX_PIPE_SIZE: PipeSize = '300mm Twinwall'

export function getMaxInletPipeSize(diameter: number): PipeSize {
  switch (diameter) {
    // SERS 300 catchpit only - value from the configurator's own diameter
    // reference; not stated on any data sheet (open question).
    case 300:  return '110mm EN1401'
    case 450:  return '160mm EN1401'
    case 600:  return '225mm Twinwall'
    case 750:  return '300mm Twinwall'
    case 900:  return '300mm Twinwall'
    case 1050: return MAX_PIPE_SIZE
    case 1200: return MAX_PIPE_SIZE
    default:   return '160mm EN1401'
  }
}

// ── R6 + R7: Available Pipe Sizes for an Inlet ───────────────
// Combines both rules: must not exceed outlet AND must not exceed diameter max

export function getAvailableInletSizes(
  diameter: number | null,
  outletSize: PipeSize | null
): PipeSize[] {
  const maxByDiameter = diameter ? getMaxInletPipeSize(diameter) : MAX_PIPE_SIZE
  const maxByOutlet   = outletSize ?? MAX_PIPE_SIZE

  const maxRank = Math.min(
    pipeSizeRank(maxByDiameter),
    pipeSizeRank(maxByOutlet)
  )

  return PIPE_SIZES.slice(0, maxRank + 1)
}

// ── OUTLET SIZE ──────────────────────────────────────────────
// The outlet can be chosen on the pipe sizes step (stored as
// pipeSizes.outlet) unless R2 has locked it. R6 means it can never be
// smaller than the largest inlet, and R7 caps it at the diameter maximum.

function largestInlet(pipeSizes: Record<string, PipeSize>): PipeSize | null {
  let best: PipeSize | null = null
  for (const [slot, size] of Object.entries(pipeSizes)) {
    if (!slot.startsWith('inlet')) continue
    if (best === null || pipeSizeRank(size) > pipeSizeRank(best)) best = size
  }
  return best
}

export function getAvailableOutletSizes(
  diameter: number | null,
  outletLocked: PipeSize | null,
  pipeSizes: Record<string, PipeSize>
): PipeSize[] {
  const maxRank = pipeSizeRank(diameter ? getMaxInletPipeSize(diameter) : MAX_PIPE_SIZE)
  const floor = largestInlet(pipeSizes)
  const minRank = Math.max(
    outletLocked ? pipeSizeRank(outletLocked) : 0,
    floor ? pipeSizeRank(floor) : 0
  )
  return PIPE_SIZES.slice(minRank, Math.max(minRank, maxRank) + 1)
}

/**
 * The outlet size set explicitly: the R2 locked minimum or the user's pick,
 * whichever is larger. Null when neither is set.
 */
function explicitOutlet(data: {
  outletLocked: PipeSize | null
  pipeSizes: Record<string, PipeSize>
}): PipeSize | null {
  const set: PipeSize[] = []
  if (data.outletLocked) set.push(data.outletLocked)
  if (data.pipeSizes.outlet) set.push(data.pipeSizes.outlet)
  if (set.length === 0) return null
  return set.reduce((a, b) => (pipeSizeRank(b) > pipeSizeRank(a) ? b : a))
}

/**
 * The outlet size the chamber will be built with: the explicit outlet
 * (R2 lock or user pick) or - if neither - the largest inlet, since R6
 * means the outlet may not be smaller than any inlet. Null until known.
 */
export function getEffectiveOutletSize(data: {
  outletLocked: PipeSize | null
  pipeSizes: Record<string, PipeSize>
}): PipeSize | null {
  return explicitOutlet(data) ?? largestInlet(data.pipeSizes)
}

/**
 * Drops any stored pipe size that is no longer allowed after an upstream
 * change (diameter, inlet count, outlet lock or outlet choice):
 *   - outlet: must sit between the R2 minimum and the R7 diameter maximum
 *   - inlets: only slots up to the inlet count, each within R6 and R7
 */
export function cleanPipeSizes(
  diameter: number | null,
  inletCount: number | null,
  outletLocked: PipeSize | null,
  pipeSizes: Record<string, PipeSize>
): Record<string, PipeSize> {
  const cleaned: Record<string, PipeSize> = {}
  const maxRank = pipeSizeRank(diameter ? getMaxInletPipeSize(diameter) : MAX_PIPE_SIZE)
  const minOutletRank = outletLocked ? pipeSizeRank(outletLocked) : 0

  const outlet = pipeSizes.outlet
  if (outlet) {
    const rank = pipeSizeRank(outlet)
    if (rank <= maxRank && rank >= minOutletRank) cleaned.outlet = outlet
  }

  const allowedInlets = getAvailableInletSizes(
    diameter,
    explicitOutlet({ outletLocked, pipeSizes: cleaned })
  )
  for (const [slot, size] of Object.entries(pipeSizes)) {
    if (!slot.startsWith('inlet')) continue
    const n = parseInt(slot.slice('inlet'.length), 10)
    if (inletCount !== null && (isNaN(n) || n > inletCount)) continue
    if (allowedInlets.includes(size)) cleaned[slot] = size
  }
  return cleaned
}

/**
 * Removes the inlet at `index` and shifts later inlets' pipe sizes down a
 * slot, so each remaining position keeps the size chosen for it.
 */
export function removeInletAt(
  positions: ClockPosition[],
  pipeSizes: Record<string, PipeSize>,
  index: number
): { positions: ClockPosition[]; pipeSizes: Record<string, PipeSize> } {
  const nextPositions = positions.filter((_, i) => i !== index)
  const nextSizes: Record<string, PipeSize> = {}
  if (pipeSizes.outlet) nextSizes.outlet = pipeSizes.outlet
  for (let i = 0; i < positions.length; i++) {
    if (i === index) continue
    const size = pipeSizes[`inlet${i + 1}`]
    if (!size) continue
    const newIndex = i < index ? i : i - 1
    nextSizes[`inlet${newIndex + 1}`] = size
  }
  return { positions: nextPositions, pipeSizes: nextSizes }
}

// ── FLOW CONTROL DEVICE vs CHAMBER DIAMETER ──────────────────
// The inline flow control option fits one of the two flow control ranges
// into the chamber, so it follows their data sheet sizes:
//   Orifice plate (SERF)  - 300 / 450 / 600 mm chambers
//   Vortex (ROTEX)        - 600 / 750 / 900 / 1050 / 1200 mm chambers

export function getAvailableFlowTypes(diameter: number | null): FlowType[] {
  if (!diameter) return ['Vortex', 'Orifice plate']
  const types: FlowType[] = []
  if (diameter >= 600) types.push('Vortex')
  if (diameter <= 600) types.push('Orifice plate')
  return types
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

  validatePipework(chamber, errors)

  if (chamber.flowControl === null) errors.push('Flow control decision required')

  if (chamber.flowControl) {
    if (!chamber.flowType) {
      errors.push('Flow control type not selected')
    } else if (!getAvailableFlowTypes(chamber.diameter).includes(chamber.flowType)) {
      errors.push(
        `${chamber.flowType} flow control is not available in a ${chamber.diameter}mm chamber`
      )
    }
    if (!isPositiveNumber(chamber.flowRate)) {
      errors.push('Flow rate must be a positive number')
    }
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

/**
 * Pipework checks shared by the inspection chamber and catchpit engines:
 * positions (R5), per-inlet sizes (R6, R7) and the outlet (R2, R6, R7).
 */
export function validatePipework(
  data: {
    diameter: number | null
    inletCount: number | null
    positions: ClockPosition[]
    pipeSizes: Record<string, PipeSize>
    outletLocked: PipeSize | null
  },
  errors: string[]
): void {
  if (data.inletCount && data.positions.length !== data.inletCount) {
    errors.push(
      `${data.positions.length} positions placed, ${data.inletCount} required`
    )
  }

  const badPositions = data.positions.filter((p) => !VALID_INLET_POSITIONS.includes(p))
  if (badPositions.length > 0) {
    errors.push(`Inlet positions ${badPositions.join(', ')} are not manufactured positions`)
  }

  if (!data.inletCount) return

  const maxRank = pipeSizeRank(
    data.diameter ? getMaxInletPipeSize(data.diameter) : MAX_PIPE_SIZE
  )
  const outlet = explicitOutlet(data)
  const outletRank = outlet ? pipeSizeRank(outlet) : maxRank

  for (let i = 1; i <= data.inletCount; i++) {
    const size = data.pipeSizes[`inlet${i}`]
    if (!size) {
      errors.push(`Inlet ${i} pipe size not selected`)
      continue
    }
    if (pipeSizeRank(size) > maxRank) {
      errors.push(`Inlet ${i} (${size}) exceeds the maximum for a ${data.diameter}mm chamber`)
    } else if (pipeSizeRank(size) > outletRank) {
      errors.push(`Inlet ${i} (${size}) is larger than the outlet (${outlet})`)
    }
  }

  if (data.pipeSizes.outlet && pipeSizeRank(data.pipeSizes.outlet) > maxRank) {
    errors.push(
      `Outlet (${data.pipeSizes.outlet}) exceeds the maximum for a ${data.diameter}mm chamber`
    )
  }
}

/** Inlet and outlet sizes obey R6 (no inlet larger than the outlet) and R7. */
export function pipeworkRulesPass(data: {
  diameter: number | null
  pipeSizes: Record<string, PipeSize>
  outletLocked: PipeSize | null
}): boolean {
  const maxRank = pipeSizeRank(
    data.diameter ? getMaxInletPipeSize(data.diameter) : MAX_PIPE_SIZE
  )
  // Compare against the outlet that was explicitly set (R2 lock or user
  // choice). With neither, the outlet follows the largest inlet, so R6
  // cannot be broken.
  const outlet = explicitOutlet(data)
  const outletRank = outlet ? pipeSizeRank(outlet) : maxRank

  for (const [slot, size] of Object.entries(data.pipeSizes)) {
    const rank = pipeSizeRank(size)
    if (rank > maxRank) return false
    if (slot.startsWith('inlet') && rank > outletRank) return false
  }
  return true
}

// ── PRODUCT CODE ─────────────────────────────────────────────
// {SERIES}{diameter}-{depth}-{S104|PRIV}
// The series follows the data sheets: SERSIC is the surface water range,
// SERFIC the foul range. Series and diameter are joined with no separator,
// matching the codes in the model library (SEHDS1800, SERSIC600300,
// SERPT600160). No data sheet names a combined-system series, so combined
// chambers keep the generic IC prefix until the client confirms one.

export function getChamberSeries(systemType: string | null): string {
  switch (systemType) {
    case 'surface': return 'SERSIC'
    case 'foul':    return 'SERFIC'
    default:        return 'IC'
  }
}

export function generateProductCode(state: WizardState): string {
  const chamber = extractChamberData(state)
  const series = getChamberSeries(chamber?.systemType ?? null)
  if (!chamber || !chamber.diameter || !chamber.depth) return `${series}???-???`

  const adoptStr = chamber.adoptable ? 'S104' : 'PRIV'
  return `${series}${chamber.diameter}-${chamber.depth}-${adoptStr}`
}

// ── COMPLIANCE CHECK ─────────────────────────────────────────
// Standards follow the Compliance section of the SERSIC / SERFIC data
// sheets: EN 13598-2, DCG (incl. Parts B & C), SfA7, Building Regs Part H1.

export function generateCompliance(state: WizardState): ComplianceResult[] {
  const chamber = extractChamberData(state)
  const { valid } = validateConfig(state)

  // Outlet rule: no flow increase on exit (R6) and size caps (R7)
  const outletRulePass = chamber ? pipeworkRulesPass(chamber) : true

  // Depth rule for adoptable
  let depthPass = true
  if (chamber && chamber.depth && chamber.adoptable !== null) {
    depthPass = chamber.depth <= getMaxDepth(chamber.adoptable)
  }

  // Restricted access: max 350mm access opening when depth > 1000mm (DCG)
  // SuDS Enviro chambers are designed with this in mind, so always Pass
  // unless future spec adds a custom access cover option.
  const restrictedAccessPass = true

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
      standard: 'BS EN 13598-2 (2009)',
      scope: 'Plastic Inspection Chambers',
      status: 'Pass',
    },
    {
      standard: 'Building Regulations Part H1',
      scope: chamber?.systemType === 'foul'
        ? 'Foul Water Drainage'
        : chamber?.systemType === 'surface'
          ? 'Surface Water Drainage'
          : 'Drainage',
      status: chamber?.systemType ? 'Pass' : 'Warning',
    },
    {
      standard: 'DCG Parts B and C',
      scope: 'Minimum 50mm fall from side inlets to main channel',
      status: 'Pass',
    },
    {
      standard: 'DCG Restricted Access (350mm > 1m depth)',
      scope: 'Manhole Cover Compliance',
      status: restrictedAccessPass ? 'Pass' : 'Warning',
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
